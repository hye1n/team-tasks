import { createClient } from '@supabase/supabase-js'

// Mirrors @supabase/ssr chunker.js createChunks + Next.js cookie encoding.
// When @supabase/ssr sets a session cookie it:
//   1. splits JSON.stringify(session) into ≤3180-encoded-char chunks
//   2. each decoded chunk value is set via Next.js cookies().set()
//      which URL-encodes it in the Cookie/Set-Cookie header.
const MAX_CHUNK_SIZE = 3180

function buildCookieHeader(key: string, value: string): string {
  const encodedValue = encodeURIComponent(value)

  if (encodedValue.length <= MAX_CHUNK_SIZE) {
    return `${key}=${encodeURIComponent(value)}`
  }

  const chunks: string[] = []
  let remaining = encodedValue

  while (remaining.length > 0) {
    let head = remaining.slice(0, MAX_CHUNK_SIZE)
    const lastEscape = head.lastIndexOf('%')
    if (lastEscape > MAX_CHUNK_SIZE - 3) {
      head = head.slice(0, lastEscape)
    }
    let decoded = ''
    while (head.length > 0) {
      try {
        decoded = decodeURIComponent(head)
        break
      } catch {
        if (head.at(-3) === '%' && head.length > 3) {
          head = head.slice(0, head.length - 3)
        } else {
          throw new Error('Cannot decode cookie chunk')
        }
      }
    }
    chunks.push(decoded)
    remaining = remaining.slice(head.length)
  }

  return chunks
    .map((chunk, i) => `${key}.${i}=${encodeURIComponent(chunk)}`)
    .join('; ')
}

export async function waitForDevServer(): Promise<void> {
  try {
    await fetch('http://localhost:3000', {
      signal: AbortSignal.timeout(5000),
    })
  } catch {
    throw new Error(
      '개발 서버에 연결할 수 없습니다. 별도 터미널에서 npm run dev 먼저 띄우세요.',
    )
  }
}

export async function signInTestUser(): Promise<{
  cookieHeader: string
  userId: string
}> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await supabase.auth.signInWithPassword({
    email: process.env.TEST_USER_EMAIL!,
    password: process.env.TEST_USER_PASSWORD!,
  })

  if (error || !data.session) {
    throw new Error(`Supabase 인증 실패: ${error?.message ?? 'no session'}`)
  }

  const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
  const cookieName = `sb-${projectRef}-auth-token`
  const cookieHeader = buildCookieHeader(cookieName, JSON.stringify(data.session))

  return { cookieHeader, userId: data.user.id }
}

export function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}
