-- Smart-ICM RLS 정책
-- 2026-05-29 최초 | 2026-06-10 company_id 격리 추가
-- Supabase 계정 수령 후 실제 auth.uid() 연동 적용 필요

-- RLS 활성화
ALTER TABLE companies            ENABLE ROW LEVEL SECURITY;
ALTER TABLE eval_terms           ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE rcm_controls         ENABLE ROW LEVEL SECURITY;
ALTER TABLE rcm_dept_map         ENABLE ROW LEVEL SECURITY;
ALTER TABLE rcm_snapshots        ENABLE ROW LEVEL SECURITY;
ALTER TABLE populations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE samples              ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_files       ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE op_evaluations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE deficiencies         ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals            ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs           ENABLE ROW LEVEL SECURITY;

-- ───────────────────────────────────────────
-- 헬퍼 함수
-- ───────────────────────────────────────────

-- 현재 사용자 페르소나 조회
CREATE OR REPLACE FUNCTION current_persona()
RETURNS TEXT AS $$
  SELECT persona FROM users WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- 현재 사용자 company_id 조회 (멀티테넌시 격리 핵심)
CREATE OR REPLACE FUNCTION current_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM users WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- ───────────────────────────────────────────
-- companies — 본인 회사만 조회
-- ───────────────────────────────────────────
CREATE POLICY "본인 회사 조회" ON companies
  FOR SELECT USING (id = current_company_id());

-- ───────────────────────────────────────────
-- 공통 마스터 읽기 (모든 페르소나, 본인 회사만)
-- ───────────────────────────────────────────
CREATE POLICY "전체 읽기" ON eval_terms
  FOR SELECT USING (company_id = current_company_id());

CREATE POLICY "전체 읽기" ON departments
  FOR SELECT USING (company_id = current_company_id());

CREATE POLICY "전체 읽기" ON rcm_controls
  FOR SELECT USING (
    company_id = current_company_id() AND
    current_persona() IS NOT NULL
  );

-- ───────────────────────────────────────────
-- P5(내부회계팀) — Super Admin: 본인 회사 전체 읽기/쓰기
-- ───────────────────────────────────────────
CREATE POLICY "P5 전체 접근" ON eval_terms
  FOR ALL USING (
    company_id = current_company_id() AND
    current_persona() = 'P5'
  );

CREATE POLICY "P5 전체 접근" ON departments
  FOR ALL USING (
    company_id = current_company_id() AND
    current_persona() = 'P5'
  );

CREATE POLICY "P5 전체 접근" ON rcm_controls
  FOR ALL USING (
    company_id = current_company_id() AND
    current_persona() = 'P5'
  );

CREATE POLICY "P5 전체 접근" ON populations
  FOR ALL USING (
    company_id = current_company_id() AND
    current_persona() = 'P5'
  );

CREATE POLICY "P5 전체 접근" ON samples
  FOR ALL USING (
    company_id = current_company_id() AND
    current_persona() = 'P5'
  );

CREATE POLICY "P5 전체 접근" ON op_evaluations
  FOR ALL USING (
    company_id = current_company_id() AND
    current_persona() = 'P5'
  );

CREATE POLICY "P5 전체 접근" ON deficiencies
  FOR ALL USING (
    company_id = current_company_id() AND
    current_persona() = 'P5'
  );

CREATE POLICY "P5 전체 접근" ON audit_logs
  FOR ALL USING (
    company_id = current_company_id() AND
    current_persona() = 'P5'
  );

-- ───────────────────────────────────────────
-- P1(통제수행자) — 본인 담당 통제만, 본인 회사만
-- ───────────────────────────────────────────
CREATE POLICY "P1 본인 증빙제출 읽기" ON evidence_submissions
  FOR SELECT USING (
    company_id = current_company_id() AND
    current_persona() = 'P1' AND
    submitted_by = auth.uid()
  );

CREATE POLICY "P1 본인 증빙제출 등록" ON evidence_submissions
  FOR INSERT WITH CHECK (
    company_id = current_company_id() AND
    current_persona() = 'P1' AND
    submitted_by = auth.uid()
  );

CREATE POLICY "P1 증빙파일 업로드" ON evidence_files
  FOR INSERT WITH CHECK (
    company_id = current_company_id() AND
    current_persona() = 'P1' AND
    uploaded_by = auth.uid()
  );

-- ───────────────────────────────────────────
-- P2(통제책임자) — 부서 내 승인 권한, 본인 회사만
-- ───────────────────────────────────────────
CREATE POLICY "P2 증빙제출 승인" ON evidence_submissions
  FOR UPDATE USING (
    company_id = current_company_id() AND
    current_persona() = 'P2' AND
    approved_by = auth.uid()
  );

-- ───────────────────────────────────────────
-- P3(내부회계평가자) — 운영평가 수행, 본인 회사만
-- ───────────────────────────────────────────
CREATE POLICY "P3 운영평가 수행" ON op_evaluations
  FOR ALL USING (
    company_id = current_company_id() AND
    current_persona() IN ('P3','P5')
  );

-- ───────────────────────────────────────────
-- P4(감사) — 조회 전용, 본인 회사만
-- ───────────────────────────────────────────
CREATE POLICY "P4 전체 조회" ON rcm_controls
  FOR SELECT USING (
    company_id = current_company_id() AND
    current_persona() = 'P4'
  );

CREATE POLICY "P4 전체 조회" ON op_evaluations
  FOR SELECT USING (
    company_id = current_company_id() AND
    current_persona() = 'P4'
  );

CREATE POLICY "P4 전체 조회" ON deficiencies
  FOR SELECT USING (
    company_id = current_company_id() AND
    current_persona() = 'P4'
  );
