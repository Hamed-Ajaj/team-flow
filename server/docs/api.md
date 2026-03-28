# TeamFlow Backend API

Base path: `/api`

## Auth
- `/auth/*` handled by Better Auth

## Health
- `GET /health` → `{ status: "ok" }`

## Me
- `GET /me` → current session

## Workspaces
- `GET /workspaces`
- `POST /workspaces` `{ name, slug? }`
- `PATCH /workspaces/:id` `{ name?, slug? }`
- `DELETE /workspaces/:id`
- `GET /workspaces/:id/members`
- `POST /workspaces/:id/members` `{ userId, role? }`
- `PATCH /workspaces/:id/members/:memberId` `{ role }`
- `DELETE /workspaces/:id/members/:memberId`

## Projects
- `GET /projects?workspaceId=...`
- `POST /projects` `{ workspaceId, name, description? }`
- `PATCH /projects/:id` `{ name?, description? }`
- `DELETE /projects/:id`

## Boards
- `GET /boards?projectId=...`
- `POST /boards` `{ projectId, name }`
- `PATCH /boards/:id` `{ name? }`
- `DELETE /boards/:id`

## Columns
- `GET /columns?boardId=...`
- `POST /columns` `{ boardId, name, position? }`
- `PATCH /columns/:id` `{ name?, position? }`
- `DELETE /columns/:id`

## Tasks
- `GET /tasks?boardId=...`
- `POST /tasks` `{ columnId, title, description?, priority?, dueDate?, position? }`
- `PATCH /tasks/:id` `{ title?, description?, priority?, dueDate?, columnId?, position?, archived? }`
- `DELETE /tasks/:id`

## Assignees
- `GET /tasks/:taskId/assignees`
- `POST /tasks/:taskId/assignees` `{ userId }`
- `DELETE /tasks/:taskId/assignees/:userId`

## Comments
- `GET /comments?taskId=...`
- `POST /comments` `{ taskId, body }`
- `DELETE /comments/:id`

## Attachments
- `POST /attachments/presign` `{ taskId, originalName, contentType, sizeBytes }`
- `GET /attachments/:id/download`

## Notifications
- `GET /notifications`
- `POST /notifications/:id/read`

## Search
- `GET /search?boardId=...&q=...`

## Activity
- `GET /activity?workspaceId=...&projectId?=...&entityType?=...&actorUserId?=...&limit?=...&offset?=...`

## Realtime Events (Socket.IO)
Room: `board:{boardId}`
- `board:created|updated|deleted`
- `column:created|updated|deleted`
- `task:created|updated|deleted`
- `task:assignee_added|task:assignee_removed`
- `comment:created`
- `attachment:created`
