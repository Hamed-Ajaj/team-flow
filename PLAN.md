# TeamFlow v1 Plan

## Recommended Folder Structure

### Repo Layout (Mono-Repo)

```
teamflow/
  client/
  server/
  infra/
  docs/
```

### Frontend (`client/`)

```
client/
  public/
  src/
    app/
      routes/
      providers/
      layout/
    components/
    features/
      auth/
      workspace/
      project/
      board/
      task/
      notifications/
    hooks/
    lib/
      api/
      sockets/
      dnd/
      validators/
    state/
      stores/
      queries/
    styles/
    types/
    main.tsx
  tests/
```

### Backend (`server/`)

```
server/
  src/
    app.ts
    server.ts
    config/
    routes/
    controllers/
    services/
    repositories/
    validators/
    realtime/
    db/
      index.ts
      schema.ts
      migrations/
    middleware/
    utils/
  tests/
```

## Summary

Build a full-stack TeamFlow v1 with REST API + Socket.IO realtime, Postgres + Drizzle ORM, Better Auth for authentication, React (Vite) frontend with Zustand + TanStack Query, Tailwind for styling, S3-compatible attachments storage, and in-app notifications. RBAC is workspace-scoped with owner/admin/member roles and project permissions inherited from workspace membership.

## Key Changes

### Backend API + Realtime

- Add REST endpoints for workspaces, members, projects, boards, columns, tasks, comments, attachments, notifications, and search/filter.
- Add Socket.IO server with rooms per project/board for broadcasting task/column/comment updates and presence.
- Add service layer and Zod validation to keep controllers thin and centralize RBAC.
- Reference Better Auth user IDs from all app tables (`auth_user_id` string).

### Database (Postgres + Drizzle)

Add normalized tables:

- `workspaces`, `workspace_members`
- `projects`, `boards`, `columns`
- `tasks`, `task_assignees`
- `comments`, `activity_logs`
- `attachments`, `notifications`

Indexes:

- Task search `title` + `description` with `ILIKE` filtering
- Foreign keys for common filters (board, column, assignee)

### Frontend (React + Tailwind + DnD)

- Create Vite React client in `client/`.
- Routes for auth, workspace/project selection, and board view.
- Use React DnD for column/task drag-and-drop.
- TanStack Query for server state, Zustand for UI state.
- In-app notifications panel with realtime updates.

### Attachments (S3-Compatible)

- Server creates pre-signed upload URLs and stores metadata.
- Client uploads directly to object storage, then confirms upload.
- Use Minio in dev, S3-compatible in production.

### Search + Filtering

- Basic ILIKE search on `title` and `description` scoped to board/project.
- Filters: assignee, due date, priority, status/column.

### DevOps

- Docker Compose for dev: Postgres, Minio, server, client.
- Environment config for `DB_*`, `BETTER_AUTH_*`, `S3_*`, `CLIENT_URL`, `SERVER_URL`.

## Public API / Interface Changes

New REST endpoints under `/api`:

- `/workspaces`, `/workspaces/:id/members`
- `/projects`, `/projects/:id/boards`
- `/boards/:id/columns`, `/boards/:id/tasks`
- `/tasks/:id/comments`, `/tasks/:id/attachments`
- `/notifications`, `/search`

Socket.IO events:

- `board:updated`, `column:created|updated|deleted`
- `task:created|updated|moved|deleted`
- `comment:created`
- `presence:join|leave`

## Test Plan

- Backend unit tests for services (RBAC, ordering logic, search filters).
- API integration tests with Supertest + test DB.
- Socket.IO event contract tests for task move and comment creation.
- Frontend component tests for board/columns/task card.
- DnD integration test: task move updates UI + emits event.
- Frontend unit tests with Vitest + React Testing Library (+ jest-dom, user-event), and MSW for API mocking.

## Assumptions

- Better Auth manages its own user/session/account tables.
- Frontend is added as `client/` adjacent to this `server/` repo.
- Notifications are in-app only (no email) for v1.
- Attachments use S3-compatible storage (Minio for dev).
- REST API (not GraphQL) is the primary interface.
