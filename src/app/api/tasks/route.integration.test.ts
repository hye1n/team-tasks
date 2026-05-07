// @vitest-environment node
import { describe, beforeAll, afterEach, afterAll, it, expect } from 'vitest'
import {
  waitForDevServer,
  signInTestUser,
  getAdminSupabase,
} from '@/test/integration-helpers'

const BASE = 'http://localhost:3000'

describe('POST /api/tasks', () => {
  let cookieHeader: string
  let userId: string
  let adminSb: ReturnType<typeof getAdminSupabase>
  let createdId: string | null = null

  beforeAll(async () => {
    await waitForDevServer()
    ;({ cookieHeader, userId } = await signInTestUser())
    adminSb = getAdminSupabase()
  })

  afterEach(async () => {
    if (createdId) {
      await adminSb.from('tasks').delete().eq('id', createdId)
      createdId = null
    }
  })

  afterAll(async () => {
    // 'integration-' 접두사 잔재 일괄 정리 (afterEach 누락분 대비)
    await adminSb
      .from('tasks')
      .delete()
      .like('title', 'integration-%')
      .eq('created_by', userId)
  })

  it('미인증 POST → 307 redirect to /login (미들웨어 동작)', async () => {
    // middleware.ts 가 미인증 요청을 /login 으로 307 redirect.
    // API 클라이언트가 401 JSON 을 기대하는 경우 middleware.ts 수정 필요 (route.ts 주석 참고).
    const res = await fetch(`${BASE}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'no-auth' }),
      redirect: 'manual',
    })
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/login')
  })

  it('400 — Cookie 있음, title 없음 → 400 + error 메시지', async () => {
    const res = await fetch(`${BASE}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
      body: JSON.stringify({ title: '' }),
    })
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('title is required')
  })

  it('201 — Cookie 포함 POST: status·title·created_by 일치', async () => {
    const title = `integration-${Date.now()}`

    const res = await fetch(`${BASE}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
      body: JSON.stringify({ title }),
    })

    expect(res.status).toBe(201)
    const task = await res.json()
    expect(task.title).toBe(title)
    expect(task.created_by).toBe(userId)
    expect(typeof task.id).toBe('string')

    createdId = task.id
  })
})
