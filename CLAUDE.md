# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # dev server on :3000 (Turbopack)
npm run build    # production build
npm run lint     # ESLint via next lint
```

No test suite is configured yet.

## Architecture

**Runtime stack:** Next.js 16 App Router · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui v4

Data lives entirely in `localStorage` (no backend in this MVP). The planned backend is Supabase + Google OAuth deployed on Vercel — see `docs/`.

### Data flow

```
src/lib/store.ts   ← loadTasks() / saveTasks()  ←→  localStorage
       ↑
src/components/TaskBoard.tsx   (single stateful root — owns tasks[], filters, dialogs)
       ↑
TaskCard.tsx  /  TaskForm.tsx   (presentational, receive callbacks)
```

`TaskBoard` is the only stateful component. It calls `persist()` (sets state + saves) on every mutation. All child components are controlled via props.

### Key types (`src/types/task.ts`)

```ts
Status   = "todo" | "in-progress" | "done"
Priority = "low" | "medium" | "high"
Task     = { id, title, description, status, priority, assignee, dueDate, createdAt }
```

### UI components

`src/components/ui/` contains shadcn/ui v4 components. These use **`@base-ui/react`** as the headless primitive (not `@radix-ui`). The API differs from older shadcn examples found online.

### Tailwind CSS v4 gotchas

- CSS entry point: `src/app/globals.css` — uses `@import "tailwindcss"` (v4 syntax, no `tailwind.config.js`).
- `postcss.config.mjs` with `@tailwindcss/postcss` is **required** — without it utility classes are not generated.
- `tw-animate-css` and `shadcn/tailwind.css` are imported via relative paths (`../../node_modules/…`) because Turbopack does not resolve the `style` export condition in package.json.

## 기술 스택과 아키텍처 결정 규칙

### 스택 한 줄 요약
Browser → Google OAuth → Next.js(Vercel) → API Routes → Supabase(Postgres + Auth). 상세는 `docs/architecture.md` 참조.

### MVP 범위 제약 (변경 시 재합의 필요)
- 테이블은 `tasks` 단일 테이블만. ENUM·인덱스·트리거·RLS 추가 금지.
- 기능은 5개 이하(F-01~F-05). 메시지 큐·캐시·WebSocket·마이크로서비스 금지.
- API base path는 `/api`, 버전 prefix 없음. 엔드포인트는 6개. 상세는 `docs/api.md` 참조.
- 모든 API는 인증 필수. `created_by`는 로그인 사용자 id로 서버에서 주입.

### DB 규칙
- `status` 값은 `'todo'` · `'done'` 두 가지만 (text check, ENUM 아님).
- `assignee_id` · `created_by` 는 `auth.users(id)` 참조 uuid. 담당자는 1인만.
- 상세는 `docs/db.md` 참조.

### 현재 MVP 상태 (백엔드 미연동)
- 데이터는 `localStorage`에만 저장. `dangerouslySetInnerHTML` 사용 금지.
- 필터 반응 ≤ 100 ms, Lighthouse ≥ 80 유지. 상세는 `docs/requirements.md` 참조.

---

## 도메인 용어

| 용어 | 정의 |
|------|------|
| **일감** | 팀이 처리해야 할 작업 단위. DB의 `tasks` 테이블 1행. |
| **담당자** | 일감을 실제로 수행하는 팀원. `assignee_id`(DB) 또는 `assignee`(현재 로컬). 1인만 지정 가능. |
| **상태** | 일감의 진행 단계. `todo`(할 일) → `in-progress`(진행 중) → `done`(완료). 누구나 변경 가능(MVP). |
| **우선순위** | `high`·`medium`·`low` 세 단계. 필터 및 카드 뱃지에 사용. |
| **마감일 초과** | `dueDate`가 오늘보다 이전이고 상태가 `done`이 아닌 일감. 빨간색으로 표시. |

---

## Docs

`docs/` 폴더에 페르소나·요건·DB·API·아키텍처 전체 명세가 있습니다.
