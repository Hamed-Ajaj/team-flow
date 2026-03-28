export const DND_ITEM = {
  COLUMN: "COLUMN",
  TASK: "TASK",
} as const;

export type DragTaskItem = {
  type: typeof DND_ITEM.TASK;
  taskId: number;
  columnId: number;
  index: number;
};

export type DragColumnItem = {
  type: typeof DND_ITEM.COLUMN;
  columnId: number;
  index: number;
};
