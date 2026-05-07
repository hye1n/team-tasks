---
name: scaffold-crud
description: 사용자가 새 리소스의 CRUD 생성을 요청할 때 Supabase 마이그레이션·타입 동기화·API 라우트·UI 페이지를 한 번에 스캐폴딩한다.
allowed-tools:
  - Read
  - Write
  - Edit
  - mcp__supabase__apply_migration
  - mcp__supabase__generate_typescript_types
---

# scaffold-crud

단일 테이블 CRUD를 한 번에 스캐폴딩하는 Skill입니다.
Next.js Route Handler + Supabase 패턴을 따릅니다.

## 사용 시점

아래 표현 중 하나를 감지하면 자동으로 호출합니다.

- "CRUD 만들어 주십시오"
- "〈리소스〉 테이블 추가해 주십시오"
- "〈리소스〉 API와 페이지 만들어 주십시오"
- "단일 테이블 추가해 주십시오"

리소스 이름(`$ARGUMENTS`)이 없으면 작업 전에 사용자에게 먼저 확인합니다.

## 진행 순서

1. **스키마 확인** — `docs/db.md`와 `src/lib/database.types.ts`를 읽어 기존 테이블 구조 파악
2. **마이그레이션 적용** — `mcp__supabase__apply_migration`으로 `CREATE TABLE` DDL 실행
3. **타입 동기화** — `mcp__supabase__generate_typescript_types`로 `src/lib/database.types.ts` 갱신
4. **API 라우트 생성**
   - `src/app/api/<resource>/route.ts` — GET(목록), POST(생성)
   - `src/app/api/<resource>/[id]/route.ts` — GET(단건), PATCH(수정), DELETE(삭제)
5. **UI 페이지 생성** — `src/app/<resource>/page.tsx` (목록 + 폼 + 삭제)
6. **미들웨어 패스 추가** — `src/middleware.ts`의 `matcher`에 `/api/<resource>/:path*`와 `/<resource>` 추가

## 컨벤션

### 파일 경로

| 역할 | 경로 |
|------|------|
| 컬렉션 API | `src/app/api/<resource>/route.ts` |
| 단건 API | `src/app/api/<resource>/[id]/route.ts` |
| UI 페이지 | `src/app/<resource>/page.tsx` |
| DB 타입 | `src/lib/database.types.ts` |
| Supabase 서버 클라이언트 | `src/lib/supabase/server.ts` |

### 인증 — 모든 핸들러 첫 줄

```ts
const { data: { user } } = await supabase.auth.getUser();
if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
```

### API 응답 포맷

- 성공: `NextResponse.json(data)` — 컬렉션 200, 생성 201, 삭제 204(`null` body)
- 실패: `NextResponse.json({ error: message }, { status: N })`
- 404 판별: `error.code === "PGRST116"`

### created_by 주입

POST 핸들러에서 `created_by: user.id`를 서버에서 직접 주입합니다.
클라이언트 전달값을 절대 신뢰하지 않습니다.

### UI

- Tailwind CSS v4 유틸리티 클래스 사용
- 필요 시 `src/components/ui/`의 shadcn/ui 컴포넌트 import
- `dangerouslySetInnerHTML` 사용 금지

## 주의사항

- **RLS 금지**: MVP 제약으로 RLS·인덱스·트리거·ENUM 추가 금지(`docs/db.md`). 기존 `tasks`·`comments` 테이블과 동일 방식으로 처리합니다.
- **plural vs singular**: 테이블명과 라우트 경로는 복수형(`comments`, `tasks`), TypeScript 타입은 단수형(`Comment`, `Task`).
- **status 컬럼**: 필요하면 `'todo'` · `'done'` 두 값만 허용하는 text check 제약으로 정의합니다(ENUM 아님).
- **미들웨어 누락 주의**: matcher에 새 경로를 추가하지 않으면 인증이 적용되지 않습니다 — 6단계를 반드시 실행하세요.
- **레퍼런스 파일**: `src/app/api/tasks/route.ts`와 `src/app/api/comments/route.ts`를 패턴 기준으로 삼습니다.
