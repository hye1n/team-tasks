import { test, expect, type Page } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

// ── 헬퍼 ─────────────────────────────────────────────────────────────────────

function adminSb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

async function login(page: Page) {
  await page.goto('/login')
  await page.getByTestId('email-input').fill(process.env.TEST_USER_EMAIL!)
  await page.getByTestId('password-input').fill(process.env.TEST_USER_PASSWORD!)
  await page.getByTestId('email-login-submit').click()
  await page.waitForURL('/')
}

async function addTask(page: Page, title: string) {
  await page.getByRole('textbox', { name: '새 일감 제목' }).fill(title)
  await page.getByRole('button', { name: '추가' }).click()
  await expect(page.getByText(title)).toBeVisible()
}

// ── 픽스처 ────────────────────────────────────────────────────────────────────

const PREFIX = 'e2e-'

test.beforeEach(async ({ page }) => {
  await login(page)
})

test.afterEach(async () => {
  await adminSb().from('tasks').delete().like('title', `${PREFIX}%`)
})

// ── 테스트 ────────────────────────────────────────────────────────────────────

test('로그인 → 메인 화면 진입', async ({ page }) => {
  await expect(page.getByRole('heading', { name: '팀 일감' })).toBeVisible()
  await expect(page.getByText(process.env.TEST_USER_EMAIL!)).toBeVisible()
})

test('일감 추가', async ({ page }) => {
  const title = `${PREFIX}${Date.now()}-추가`
  await addTask(page, title)

  await expect(page.getByRole('listitem').filter({ hasText: title })).toBeVisible()
})

test('일감 완료 토글 (todo → done → todo)', async ({ page }) => {
  const title = `${PREFIX}${Date.now()}-토글`
  await addTask(page, title)

  const item = page.getByRole('listitem').filter({ hasText: title })

  // todo → done
  await item.getByRole('button', { name: '완료로 표시' }).click()
  await expect(item.getByRole('button', { name: '완료 취소' })).toBeVisible()

  // done → todo
  await item.getByRole('button', { name: '완료 취소' }).click()
  await expect(item.getByRole('button', { name: '완료로 표시' })).toBeVisible()
})

test('일감 삭제 → 빈 목록 표시', async ({ page }) => {
  const title = `${PREFIX}${Date.now()}-삭제`
  await addTask(page, title)

  const item = page.getByRole('listitem').filter({ hasText: title })
  await item.getByRole('button', { name: '×' }).click()

  await expect(page.getByText(title)).not.toBeVisible()
  await expect(page.getByText('일감이 없습니다.')).toBeVisible()
})
