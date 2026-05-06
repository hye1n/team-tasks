# DB 설계 — 팀 일감 관리 앱 (MVP)

```sql
create table tasks (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  assignee_id  uuid references auth.users(id),
  created_by   uuid references auth.users(id),
  status       text not null default 'todo' check (status in ('todo', 'done')),
  created_at   timestamptz not null default now()
);
```
