-- Smart-ICM RLS 정책
-- 2026-05-29 | 페르소나(P1~P5) 기반 접근 제어
-- Supabase 계정 수령 후 실제 auth.uid() 연동 적용 필요

-- RLS 활성화
ALTER TABLE eval_terms          ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE rcm_controls        ENABLE ROW LEVEL SECURITY;
ALTER TABLE rcm_dept_map        ENABLE ROW LEVEL SECURITY;
ALTER TABLE rcm_snapshots       ENABLE ROW LEVEL SECURITY;
ALTER TABLE populations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE samples             ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_files      ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE op_evaluations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE deficiencies        ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals           ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs          ENABLE ROW LEVEL SECURITY;

-- ───────────────────────────────────────────
-- 헬퍼 함수: 현재 사용자 페르소나 조회
-- ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION current_persona()
RETURNS TEXT AS $$
  SELECT persona FROM users WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- ───────────────────────────────────────────
-- P5(내부회계팀) — Super Admin: 전체 읽기/쓰기
-- ───────────────────────────────────────────
CREATE POLICY "P5 전체 접근" ON rcm_controls
  FOR ALL USING (current_persona() = 'P5');

CREATE POLICY "P5 전체 접근" ON populations
  FOR ALL USING (current_persona() = 'P5');

CREATE POLICY "P5 전체 접근" ON samples
  FOR ALL USING (current_persona() = 'P5');

CREATE POLICY "P5 전체 접근" ON op_evaluations
  FOR ALL USING (current_persona() = 'P5');

CREATE POLICY "P5 전체 접근" ON deficiencies
  FOR ALL USING (current_persona() = 'P5');

-- ───────────────────────────────────────────
-- P1(통제수행자) — 본인 담당 통제만
-- ───────────────────────────────────────────
CREATE POLICY "P1 본인 증빙제출 읽기" ON evidence_submissions
  FOR SELECT USING (
    current_persona() = 'P1' AND
    submitted_by = auth.uid()
  );

CREATE POLICY "P1 본인 증빙제출 등록" ON evidence_submissions
  FOR INSERT WITH CHECK (
    current_persona() = 'P1' AND
    submitted_by = auth.uid()
  );

CREATE POLICY "P1 증빙파일 업로드" ON evidence_files
  FOR INSERT WITH CHECK (
    current_persona() = 'P1' AND
    uploaded_by = auth.uid()
  );

-- ───────────────────────────────────────────
-- P2(통제책임자) — 부서 내 승인 권한
-- ───────────────────────────────────────────
CREATE POLICY "P2 증빙제출 승인" ON evidence_submissions
  FOR UPDATE USING (
    current_persona() = 'P2' AND
    approved_by = auth.uid()
  );

-- ───────────────────────────────────────────
-- P3(내부회계평가자) — 운영평가 수행
-- ───────────────────────────────────────────
CREATE POLICY "P3 운영평가 수행" ON op_evaluations
  FOR ALL USING (
    current_persona() IN ('P3','P5')
  );

-- ───────────────────────────────────────────
-- P4(감사) — 조회 전용
-- ───────────────────────────────────────────
CREATE POLICY "P4 전체 조회" ON rcm_controls
  FOR SELECT USING (current_persona() = 'P4');

CREATE POLICY "P4 전체 조회" ON op_evaluations
  FOR SELECT USING (current_persona() = 'P4');

CREATE POLICY "P4 전체 조회" ON deficiencies
  FOR SELECT USING (current_persona() = 'P4');

-- ───────────────────────────────────────────
-- 공통 마스터 읽기 (모든 페르소나)
-- ───────────────────────────────────────────
CREATE POLICY "전체 읽기" ON eval_terms
  FOR SELECT USING (true);

CREATE POLICY "전체 읽기" ON departments
  FOR SELECT USING (true);

CREATE POLICY "전체 읽기" ON rcm_controls
  FOR SELECT USING (current_persona() IS NOT NULL);
