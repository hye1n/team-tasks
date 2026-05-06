-- 외래 키 컬럼 추가
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS assignee_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_by  uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- 인증 없이 생성된 row 제거 후 created_by NOT NULL 강화
DELETE FROM public.tasks WHERE created_by IS NULL;
ALTER TABLE public.tasks ALTER COLUMN created_by SET NOT NULL;

-- 임시 전체 허용 정책 제거
DROP POLICY IF EXISTS temp_all_access ON public.tasks;

-- RLS 활성화 (이미 켜져 있으면 무시됨)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 정식 RLS 정책 4종

-- 본인이 만들었거나 본인에게 배정된 일감만 조회
CREATE POLICY tasks_select ON public.tasks
  FOR SELECT
  USING (
    created_by = auth.uid() OR assignee_id = auth.uid()
  );

-- created_by가 본인일 때만 삽입
CREATE POLICY tasks_insert ON public.tasks
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- 생성자 또는 담당자만 수정
CREATE POLICY tasks_update ON public.tasks
  FOR UPDATE
  USING (
    created_by = auth.uid() OR assignee_id = auth.uid()
  );

-- 생성자만 삭제
CREATE POLICY tasks_delete ON public.tasks
  FOR DELETE
  USING (created_by = auth.uid());
