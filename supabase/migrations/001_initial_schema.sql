-- Smart-ICM Phase 7 초기 스키마
-- 2026-05-29 | IA v6 + ERP ICM_SAMPLE_POPULATION_DT 기반

-- ───────────────────────────────────────────
-- 1. eval_terms (평가기간)
-- ───────────────────────────────────────────
CREATE TABLE eval_terms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term_id       TEXT NOT NULL UNIQUE,
  term_year     INT  NOT NULL,
  term_cnt      INT  NOT NULL DEFAULT 0,
  eval_mode     TEXT NOT NULL CHECK (eval_mode IN ('INTERIM1','INTERIM2','FINAL')),
  entity_code   TEXT NOT NULL DEFAULT '10000',
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  is_active     BOOL NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_eval_terms_active ON eval_terms(is_active, term_year);

-- ───────────────────────────────────────────
-- 2. departments (부서 마스터)
-- ───────────────────────────────────────────
CREATE TABLE departments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dept_code     TEXT NOT NULL UNIQUE,
  dept_name     TEXT NOT NULL,
  parent_code   TEXT,
  entity_code   TEXT NOT NULL DEFAULT '10000',
  is_active     BOOL NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────
-- 3. users (사용자)
-- ───────────────────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emp_no        TEXT NOT NULL UNIQUE,
  emp_name      TEXT NOT NULL,
  email         TEXT UNIQUE,
  dept_code     TEXT REFERENCES departments(dept_code),
  persona       TEXT NOT NULL CHECK (persona IN ('P1','P2','P3','P4','P5')),
  is_active     BOOL NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────
-- 4. rcm_controls (RCM 통제 마스터)
-- ───────────────────────────────────────────
CREATE TABLE rcm_controls (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ctrl_code        TEXT NOT NULL UNIQUE,
  ctrl_title       TEXT NOT NULL,
  ctrl_category    TEXT,
  ctrl_subcategory TEXT,
  ctrl_type        TEXT CHECK (ctrl_type IN ('Preventive','Detective')),
  ctrl_method      TEXT CHECK (ctrl_method IN ('Manual','Automated','IT-Dependent Manual')),
  frequency        TEXT CHECK (frequency IN ('Daily','Weekly','Monthly','Quarterly','Annually','Per Occurrence')),
  it_dep           TEXT CHECK (it_dep IN ('Y','N')),
  system_name      TEXT,
  evidence         TEXT,
  ctrl_kind        TEXT NOT NULL CHECK (ctrl_kind IN ('PLC','ITGC','ELC')),
  entity_code      TEXT NOT NULL DEFAULT '10000',
  is_key           BOOL NOT NULL DEFAULT true,
  is_active        BOOL NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_rcm_ctrl_kind ON rcm_controls(ctrl_kind);

-- ───────────────────────────────────────────
-- 5. rcm_dept_map (RCM-부서 매핑)
-- ───────────────────────────────────────────
CREATE TABLE rcm_dept_map (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ctrl_code     TEXT NOT NULL REFERENCES rcm_controls(ctrl_code),
  dept_code     TEXT NOT NULL REFERENCES departments(dept_code),
  assignee_id   UUID REFERENCES users(id),
  approver_id   UUID REFERENCES users(id),
  eval_term_id  UUID REFERENCES eval_terms(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(ctrl_code, dept_code, eval_term_id)
);

-- ───────────────────────────────────────────
-- 6. rcm_snapshots (RCM 버전 락)
-- ───────────────────────────────────────────
CREATE TABLE rcm_snapshots (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eval_term_id  UUID NOT NULL REFERENCES eval_terms(id) UNIQUE,
  snapshot_data JSONB NOT NULL,
  locked_by     UUID REFERENCES users(id),
  locked_at     TIMESTAMPTZ DEFAULT now(),
  note          TEXT
);

-- ───────────────────────────────────────────
-- 7. populations (모집단)
-- ───────────────────────────────────────────
CREATE TABLE populations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eval_term_id        UUID NOT NULL REFERENCES eval_terms(id),
  ctrl_code           TEXT NOT NULL REFERENCES rcm_controls(ctrl_code),
  dept_code           TEXT NOT NULL REFERENCES departments(dept_code),
  population_code     TEXT NOT NULL,
  transaction_id      TEXT NOT NULL,
  transaction_date    DATE,
  transaction_desc    TEXT,
  add_info_1          TEXT,
  add_info_2          TEXT,
  source              TEXT NOT NULL CHECK (source IN ('ERP_AUTO','EXCEL_UPLOAD')),
  upload_batch_id     TEXT,
  entity_code         TEXT NOT NULL DEFAULT '10000',
  created_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE(eval_term_id, ctrl_code, transaction_id)
);
CREATE INDEX idx_pop_term_ctrl ON populations(eval_term_id, ctrl_code);
CREATE INDEX idx_pop_transaction_id ON populations(transaction_id);

-- ───────────────────────────────────────────
-- 8. samples (샘플링 결과)
-- ───────────────────────────────────────────
CREATE TABLE samples (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eval_term_id    UUID NOT NULL REFERENCES eval_terms(id),
  population_id   UUID NOT NULL REFERENCES populations(id),
  ctrl_code       TEXT NOT NULL REFERENCES rcm_controls(ctrl_code),
  sample_seq      INT  NOT NULL,
  sampling_method TEXT CHECK (sampling_method IN ('RANDOM','JUDGMENTAL','HAPHAZARD')),
  sampled_by      UUID REFERENCES users(id),
  sampled_at      TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'PENDING'
                  CHECK (status IN ('PENDING','EVIDENCE_REQUESTED','EVIDENCE_SUBMITTED','EVALUATED')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(eval_term_id, ctrl_code, sample_seq)
);
CREATE INDEX idx_samples_term_ctrl ON samples(eval_term_id, ctrl_code);

-- ───────────────────────────────────────────
-- 9. evidence_files (증빙 파일)
-- ───────────────────────────────────────────
CREATE TABLE evidence_files (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_id       UUID NOT NULL REFERENCES samples(id),
  file_name       TEXT NOT NULL,
  file_path       TEXT NOT NULL,
  file_size       BIGINT,
  mime_type       TEXT,
  ai_verified     BOOL,
  ai_score        NUMERIC(5,2),
  ai_note         TEXT,
  uploaded_by     UUID REFERENCES users(id),
  uploaded_at     TIMESTAMPTZ DEFAULT now(),
  is_deleted      BOOL NOT NULL DEFAULT false
);
CREATE INDEX idx_evidence_sample ON evidence_files(sample_id);

-- ───────────────────────────────────────────
-- 10. evidence_submissions (증빙제출 워크플로우)
-- ───────────────────────────────────────────
CREATE TABLE evidence_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_id       UUID NOT NULL REFERENCES samples(id) UNIQUE,
  eval_term_id    UUID NOT NULL REFERENCES eval_terms(id),
  submitted_by    UUID REFERENCES users(id),
  submitted_at    TIMESTAMPTZ,
  submission_note TEXT,
  approved_by     UUID REFERENCES users(id),
  approved_at     TIMESTAMPTZ,
  approval_note   TEXT,
  status          TEXT NOT NULL DEFAULT 'DRAFT'
                  CHECK (status IN ('DRAFT','SUBMITTED','APPROVED','REJECTED','REVISION_REQUESTED')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────
-- 11. op_evaluations (운영평가 수행)
-- ───────────────────────────────────────────
CREATE TABLE op_evaluations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_id       UUID NOT NULL REFERENCES samples(id) UNIQUE,
  eval_term_id    UUID NOT NULL REFERENCES eval_terms(id),
  ctrl_code       TEXT NOT NULL REFERENCES rcm_controls(ctrl_code),
  result          TEXT CHECK (result IN ('PASS','EXCEPTION','NOT_APPLICABLE')),
  eval_note       TEXT,
  ai_draft        TEXT,
  evaluated_by    UUID REFERENCES users(id),
  evaluated_at    TIMESTAMPTZ,
  finalized_by    UUID REFERENCES users(id),
  finalized_at    TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'PENDING'
                  CHECK (status IN ('PENDING','IN_PROGRESS','COMPLETED','FINALIZED')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────
-- 12. deficiencies (예외·미비점 4분류)
-- ───────────────────────────────────────────
CREATE TABLE deficiencies (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  op_eval_id       UUID NOT NULL REFERENCES op_evaluations(id),
  eval_term_id     UUID NOT NULL REFERENCES eval_terms(id),
  ctrl_code        TEXT NOT NULL REFERENCES rcm_controls(ctrl_code),
  severity         TEXT NOT NULL CHECK (severity IN (
    'IMPROVEMENT_SUGGESTION',
    'SIMPLE_DEFICIENCY',
    'SIGNIFICANT_DEFICIENCY',
    'MATERIAL_WEAKNESS'
  )),
  deficiency_desc  TEXT NOT NULL,
  root_cause       TEXT,
  remediation      TEXT,
  due_date         DATE,
  status           TEXT NOT NULL DEFAULT 'OPEN'
                   CHECK (status IN ('OPEN','IN_PROGRESS','CLOSED','WAIVED')),
  reported_by      UUID REFERENCES users(id),
  reviewed_by      UUID REFERENCES users(id),
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_deficiency_severity ON deficiencies(severity, status);
CREATE INDEX idx_deficiency_term ON deficiencies(eval_term_id);

-- ───────────────────────────────────────────
-- 13. approvals (결재 워크플로우)
-- ───────────────────────────────────────────
CREATE TABLE approvals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_type        TEXT NOT NULL CHECK (ref_type IN (
    'EVIDENCE_SUBMISSION',
    'OP_EVALUATION',
    'RCM_SNAPSHOT'
  )),
  ref_id          UUID NOT NULL,
  step_order      INT  NOT NULL DEFAULT 1,
  approver_id     UUID NOT NULL REFERENCES users(id),
  status          TEXT NOT NULL DEFAULT 'PENDING'
                  CHECK (status IN ('PENDING','APPROVED','REJECTED','DELEGATED')),
  action_at       TIMESTAMPTZ,
  action_note     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_approvals_approver ON approvals(approver_id, status);
CREATE INDEX idx_approvals_ref ON approvals(ref_type, ref_id);

-- ───────────────────────────────────────────
-- 14. audit_logs (변경 이력)
-- ───────────────────────────────────────────
CREATE TABLE audit_logs (
  id            BIGSERIAL PRIMARY KEY,
  table_name    TEXT NOT NULL,
  record_id     UUID NOT NULL,
  action        TEXT NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  old_data      JSONB,
  new_data      JSONB,
  changed_by    UUID REFERENCES users(id),
  changed_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_audit_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_changed_at ON audit_logs(changed_at DESC);
