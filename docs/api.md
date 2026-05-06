# API 엔드포인트 — 팀 일감 관리 앱 (MVP)

| METHOD | PATH | 설명 | 인증 |
|--------|------|------|------|
| GET | /api/auth/me | 현재 로그인 사용자 정보 반환 | 필요 |
| POST | /api/auth/logout | 세션 종료 및 쿠키 삭제 | 필요 |
| GET | /api/tasks | 전체 일감 목록 조회 (assignee_id 쿼리 파라미터로 필터 가능) | 필요 |
| POST | /api/tasks | 새 일감 생성 (created_by = 로그인 사용자) | 필요 |
| PATCH | /api/tasks/[id] | 특정 일감의 title · assignee_id · status 수정 | 필요 |
| DELETE | /api/tasks/[id] | 특정 일감 삭제 | 필요 |
