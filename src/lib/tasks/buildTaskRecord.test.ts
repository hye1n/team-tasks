import { describe, it, expect } from 'vitest'
import { buildTaskRecord } from './buildTaskRecord'

const user = { id: 'uid-1' }

describe('buildTaskRecord', () => {
  // 분기 1: title 검증 실패
  it('title이 undefined이면 ok:false를 반환한다', () => {
    const result = buildTaskRecord({ title: undefined as unknown as string }, user)
    expect(result).toEqual({ ok: false, error: 'title is required' })
  })

  it('title이 빈 문자열이면 ok:false를 반환한다', () => {
    const result = buildTaskRecord({ title: '' }, user)
    expect(result).toEqual({ ok: false, error: 'title is required' })
  })

  it('title이 공백만이면 ok:false를 반환한다', () => {
    const result = buildTaskRecord({ title: '   ' }, user)
    expect(result).toEqual({ ok: false, error: 'title is required' })
  })

  // 분기 2: assignee_id 없음 → user.id 로 fallback
  it('assignee_id가 없으면 created_by·assignee_id 모두 user.id가 된다', () => {
    const result = buildTaskRecord({ title: 'task-a' }, user)
    expect(result).toEqual({
      ok: true,
      record: { title: 'task-a', created_by: 'uid-1', assignee_id: 'uid-1' },
    })
  })

  // 분기 3: title 앞뒤 공백 trim
  it('title 앞뒤 공백은 trim된다', () => {
    const result = buildTaskRecord({ title: '  task-b  ' }, user)
    expect(result).toEqual({
      ok: true,
      record: { title: 'task-b', created_by: 'uid-1', assignee_id: 'uid-1' },
    })
  })

  // 분기 4: assignee_id 지정
  it('assignee_id를 지정하면 그 값이 그대로 들어간다', () => {
    const result = buildTaskRecord({ title: 'task-c', assignee_id: 'uid-2' }, user)
    expect(result).toEqual({
      ok: true,
      record: { title: 'task-c', created_by: 'uid-1', assignee_id: 'uid-2' },
    })
  })

  // ?? vs || 구분: assignee_id가 빈 문자열이면 ?? 는 그대로 전달 (|| 와 다름)
  it('assignee_id가 빈 문자열이면 그대로 전달된다', () => {
    const result = buildTaskRecord({ title: 'task-d', assignee_id: '' }, user)
    expect(result).toEqual({
      ok: true,
      record: { title: 'task-d', created_by: 'uid-1', assignee_id: '' },
    })
  })
})
