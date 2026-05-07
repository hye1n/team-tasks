type TaskBody = { title: string; assignee_id?: string }
type AuthUser = { id: string }

type TaskRecord = { title: string; created_by: string; assignee_id: string }

export type BuildTaskRecordResult =
  | { ok: true; record: TaskRecord }
  | { ok: false; error: string }

export function buildTaskRecord(body: TaskBody, user: AuthUser): BuildTaskRecordResult {
  const { title, assignee_id } = body
  if (!title?.trim()) {
    return { ok: false, error: 'title is required' }
  }
  return {
    ok: true,
    record: {
      title: title.trim(),
      created_by: user.id,
      assignee_id: assignee_id ?? user.id,
    },
  }
}
