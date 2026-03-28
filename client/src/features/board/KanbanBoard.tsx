import { useEffect, useMemo, useState, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useColumns, useSearchTasks, useTasks, useUpdateColumn } from "@/state/queries/hooks";
import { api } from "@/lib/api/endpoints";
import type { Column, Task } from "@/types/api";
import { DND_ITEM, type DragColumnItem, type DragTaskItem } from "@/lib/dnd/types";
import { useUIStore } from "@/state/stores/ui";
import { useBoardRealtime } from "@/hooks/useBoardRealtime";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/state/queries/keys";
import { TaskDrawer } from "@/features/task/TaskDrawer";

export function KanbanBoard({ boardId }: { boardId: number }) {
  useBoardRealtime(boardId);
  const { data: columnsData } = useColumns(boardId);
  const { data: tasksData } = useTasks(boardId);
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const queryClient = useQueryClient();
  const updateColumn = useUpdateColumn(boardId);
  const filters = useUIStore((state) => state.filters);
  const setFilters = useUIStore((state) => state.setFilters);
  const openTaskDrawer = useUIStore((state) => state.openTaskDrawer);
  const closeTaskDrawer = useUIStore((state) => state.closeTaskDrawer);
  const taskDrawer = useUIStore((state) => state.taskDrawer);
  const prevColumnsSignature = useRef<string>("");
  const prevTasksSignature = useRef<string>("");
  const [newColumnOpen, setNewColumnOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskColumnId, setNewTaskColumnId] = useState<number | null>(null);

  const searchQuery = useSearchTasks({
    q: filters.q || undefined,
    boardId,
    assigneeId: filters.assigneeId,
    priority: filters.priority,
  });

  const displayTasks = useMemo(() => {
    if (filters.q || filters.assigneeId || filters.priority) {
      return searchQuery.data ?? [];
    }
    return tasks;
  }, [filters, searchQuery.data, tasks]);

  useEffect(() => {
    if (columnsData) {
      const signature = columnsData
        .map((col) => `${col.id}:${col.position}:${col.name}`)
        .join("|");
      if (signature !== prevColumnsSignature.current) {
        prevColumnsSignature.current = signature;
        setColumns([...columnsData].sort((a, b) => a.position - b.position));
      }
    }
  }, [columnsData]);

  useEffect(() => {
    if (tasksData) {
      const signature = tasksData
        .map((task) => `${task.id}:${task.position}:${task.columnId}:${task.title}`)
        .join("|");
      if (signature !== prevTasksSignature.current) {
        prevTasksSignature.current = signature;
        setTasks([...tasksData].sort((a, b) => a.position - b.position));
      }
    }
  }, [tasksData]);

  const tasksByColumn = useMemo(() => {
    return columns.reduce<Record<number, Task[]>>((acc, column) => {
      acc[column.id] = displayTasks
        .filter((task) => task.columnId === column.id)
        .sort((a, b) => a.position - b.position);
      return acc;
    }, {});
  }, [columns, displayTasks]);

  const tasksByColumnAll = useMemo(() => {
    return columns.reduce<Record<number, Task[]>>((acc, column) => {
      acc[column.id] = tasks
        .filter((task) => task.columnId === column.id)
        .sort((a, b) => a.position - b.position);
      return acc;
    }, {});
  }, [columns, tasks]);

  const dndEnabled = !(filters.q || filters.assigneeId || filters.priority);

  const persistColumnOrder = async (nextColumns: Column[]) => {
    await Promise.all(
      nextColumns.map((column, index) =>
        updateColumn.mutateAsync({ id: column.id, payload: { position: index } }),
      ),
    );
  };

  const persistTaskOrder = async (columnId: number, nextTasks: Task[]) => {
    await Promise.all(
      nextTasks.map((task, index) =>
        api.updateTask(task.id, { columnId, position: index }),
      ),
    );
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks(boardId) });
  };

  const moveColumn = async (dragIndex: number, hoverIndex: number, commit = true) => {
    const next = [...columns];
    const [removed] = next.splice(dragIndex, 1);
    next.splice(hoverIndex, 0, removed);
    setColumns(next);
    if (commit) {
      await persistColumnOrder(next);
    }
  };

  const reorderTasks = (
    current: Task[],
    taskId: number,
    fromColumnId: number,
    toColumnId: number,
    toIndex: number,
  ) => {
    const next = current.map((task) => ({ ...task }));
    const sourceTasks = [...(tasksByColumnAll[fromColumnId] ?? [])];
    const destinationTasks = fromColumnId === toColumnId
      ? sourceTasks
      : [...(tasksByColumnAll[toColumnId] ?? [])];
    const movingIndex = sourceTasks.findIndex((task) => task.id === taskId);
    if (movingIndex === -1) return { next, source: sourceTasks, destination: destinationTasks };
    const [moving] = sourceTasks.splice(movingIndex, 1);
    moving.columnId = toColumnId;
    destinationTasks.splice(Math.min(toIndex, destinationTasks.length), 0, moving);

    const updatedTasks = new Map<number, Task>();
    sourceTasks.forEach((task, index) => updatedTasks.set(task.id, { ...task, position: index }));
    destinationTasks.forEach((task, index) => updatedTasks.set(task.id, { ...task, position: index }));

    const updatedNext = next.map((task) => updatedTasks.get(task.id) ?? task);
    return { next: updatedNext, source: sourceTasks, destination: destinationTasks };
  };

  const moveTask = (
    taskId: number,
    fromColumnId: number,
    toColumnId: number,
    toIndex: number,
    commit = true,
  ) => {
    const { next, source, destination } = reorderTasks(tasks, taskId, fromColumnId, toColumnId, toIndex);
    setTasks(next);

    if (!commit) return;

    if (fromColumnId === toColumnId) {
      void persistTaskOrder(toColumnId, destination);
    } else {
      void persistTaskOrder(fromColumnId, source);
      void persistTaskOrder(toColumnId, destination);
    }
  };

  const submitNewColumn = async () => {
    if (!newColumnName.trim()) return;
    await api.createColumn({
      boardId,
      name: newColumnName.trim(),
      position: columns.length,
    });
    setNewColumnName("");
    setNewColumnOpen(false);
    queryClient.invalidateQueries({ queryKey: queryKeys.columns(boardId) });
  };

  const openNewTask = (columnId: number) => {
    setNewTaskColumnId(columnId);
    setNewTaskName("");
    setNewTaskOpen(true);
  };

  const submitNewTask = async () => {
    if (!newTaskName.trim() || !newTaskColumnId) return;
    await api.createTask({
      columnId: newTaskColumnId,
      title: newTaskName.trim(),
      position: tasksByColumnAll[newTaskColumnId]?.length ?? 0,
    });
    setNewTaskName("");
    setNewTaskColumnId(null);
    setNewTaskOpen(false);
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks(boardId) });
  };

  const activeTask = tasks.find((task) => task.id === taskDrawer.taskId) ?? null;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface-2)] p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">Board</div>
            <div className="text-2xl font-semibold">Board #{boardId}</div>
          </div>
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
            <Input
              placeholder="Search tasks"
              value={filters.q}
              onChange={(event) => setFilters({ q: event.target.value })}
            />
            <Input
              placeholder="Assignee ID"
              value={filters.assigneeId || ""}
              onChange={(event) => setFilters({ assigneeId: event.target.value || undefined })}
            />
            <Input
              placeholder="Priority"
              value={filters.priority || ""}
              onChange={(event) => setFilters({ priority: event.target.value || undefined })}
            />
            <Button variant="secondary" onClick={() => setNewColumnOpen(true)}>
              Add Column
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
          {columns.map((column, columnIndex) => (
            <ColumnCard
              key={column.id}
              column={column}
              index={columnIndex}
              tasks={tasksByColumn[column.id] ?? []}
              moveColumn={moveColumn}
              moveTask={moveTask}
              onCreateTask={openNewTask}
              onOpenTask={openTaskDrawer}
              dndEnabled={dndEnabled}
            />
          ))}
        </div>
      </div>
      <TaskDrawer
        task={activeTask}
        boardId={boardId}
        open={taskDrawer.isOpen}
        onClose={closeTaskDrawer}
      />
      <Dialog open={newColumnOpen} onOpenChange={setNewColumnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Column</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Column name"
              value={newColumnName}
              onChange={(event) => setNewColumnName(event.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setNewColumnOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitNewColumn} disabled={!newColumnName.trim()}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Task title"
              value={newTaskName}
              onChange={(event) => setNewTaskName(event.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setNewTaskOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitNewTask} disabled={!newTaskName.trim()}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DndProvider>
  );
}

type ColumnCardProps = {
  column: Column;
  index: number;
  tasks: Task[];
  moveColumn: (dragIndex: number, hoverIndex: number, commit?: boolean) => void;
  moveTask: (
    taskId: number,
    fromColumnId: number,
    toColumnId: number,
    toIndex: number,
    commit?: boolean,
  ) => void;
  onCreateTask: (columnId: number) => void;
  onOpenTask: (taskId: number) => void;
  dndEnabled: boolean;
};

function ColumnCard({ column, index, tasks, moveColumn, moveTask, onCreateTask, onOpenTask, dndEnabled }: ColumnCardProps) {
  const [{ isDragging }, dragRef] = useDrag({
    type: DND_ITEM.COLUMN,
    item: { type: DND_ITEM.COLUMN, columnId: column.id, index } satisfies DragColumnItem,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    canDrag: () => dndEnabled,
  });

  const [, dropRef] = useDrop<DragColumnItem>({
    accept: DND_ITEM.COLUMN,
    hover: (item) => {
      if (!dndEnabled) return;
      if (item.index === index) return;
      moveColumn(item.index, index, false);
      item.index = index;
    },
    drop: (item) => {
      if (!dndEnabled) return;
      if (item.index !== index) {
        void moveColumn(item.index, index, true);
      }
    },
  });

  const [, columnDropRef] = useDrop<DragTaskItem>({
    accept: DND_ITEM.TASK,
    drop: (item) => {
      if (!dndEnabled) return;
      if (item.columnId === column.id && tasks.length > 0) return;
      moveTask(item.taskId, item.columnId, column.id, tasks.length, true);
      item.columnId = column.id;
      item.index = tasks.length;
    },
  });

  return (
    <div
      ref={(node) => dragRef(dropRef(columnDropRef(node)))}
      className={`rounded-xl border border-[color:var(--line)] bg-[color:var(--surface-3)] p-4 ${
        isDragging ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">Column</div>
          <div className="text-lg font-semibold">{column.name}</div>
        </div>
        <Badge variant="muted">{tasks.length}</Badge>
      </div>

      <div className="mt-4 space-y-3">
        {tasks.map((task, taskIndex) => (
          <TaskCard
            key={task.id}
            task={task}
            index={taskIndex}
            moveTask={moveTask}
            onOpenTask={onOpenTask}
            dndEnabled={dndEnabled}
          />
        ))}
        <Button variant="secondary" size="sm" onClick={() => onCreateTask(column.id)}>
          Add task
        </Button>
      </div>
    </div>
  );
}

type TaskCardProps = {
  task: Task;
  index: number;
  moveTask: (
    taskId: number,
    fromColumnId: number,
    toColumnId: number,
    toIndex: number,
    commit?: boolean,
  ) => void;
  onOpenTask: (taskId: number) => void;
  dndEnabled: boolean;
};

function TaskCard({ task, index, moveTask, onOpenTask, dndEnabled }: TaskCardProps) {
  const [{ isDragging }, dragRef] = useDrag({
    type: DND_ITEM.TASK,
    item: { type: DND_ITEM.TASK, taskId: task.id, columnId: task.columnId, index } satisfies DragTaskItem,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    canDrag: () => dndEnabled,
  });

  const [, dropRef] = useDrop<DragTaskItem>({
    accept: DND_ITEM.TASK,
    hover: (item) => {
      if (!dndEnabled) return;
      if (item.taskId === task.id) return;
      if (item.columnId !== task.columnId) return;
      moveTask(item.taskId, item.columnId, task.columnId, index, false);
      item.index = index;
    },
    drop: (item) => {
      if (!dndEnabled) return;
      if (item.columnId !== task.columnId) return;
      moveTask(item.taskId, item.columnId, task.columnId, index, true);
    },
  });

  return (
    <div
      ref={(node) => dragRef(dropRef(node))}
      onClick={() => onOpenTask(task.id)}
      className={`cursor-pointer rounded-lg border border-[color:var(--line)] bg-[color:var(--surface-2)] p-3 transition hover:border-[color:var(--accent)] ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="text-sm font-semibold">{task.title}</div>
      <div className="mt-2 flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
        <span>{task.priority}</span>
        <span>{task.assignees?.length ?? 0} assignees</span>
        <span>{task.comments?.length ?? 0} comments</span>
      </div>
    </div>
  );
}
