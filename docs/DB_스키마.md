# Smart-ICM Supabase DB 스키마 설계
> Phase 7 | 2026-05-29 최초 작성 | 2026-06-04 rcm_dept_map → 2테이블 분리 반영
> IA v7 메뉴 + ERP ICM_SAMPLE_POPULATION_DT 기반 | **현재 테이블 수: 15개**

---

## 설계 원칙

1. **연결키 = TRANSACTION_ID** — ERP 원천과의 핵심 연결고리 (변경 불가)
2. **ENTITY_CODE 선반영** — 단일 엔터티 우선, 멀티엔터티 대비 컬럼 포함
3. **평가 모드 3종** — `INTERIM1`(중간1) / `INTERIM2`(중간2) / `FINAL`(기말)
4. **통제 유형 3종** — `PLC`(XX-C-...) / `ITGC`(IT-C-...) / `ELC`
5. **ERP 원본 수정 금지** — Supabase는 Smart-ICM 전용, ERP는 API 조회만
6. **RLS 활성화** — 테이블별 Row Level Security 정책 적용

---

## 테이블 목록 (의존성 순)

| # | 테이블명 | 설명 | IA 메뉴 연결 | 변경 |
|---|---------|------|-------------|:----:|
| 1 | `eval_terms` | 평가기간 마스터 | 1️⃣ 평가기간 관리 | |
| 2 | `departments` | 부서 마스터 | 1️⃣ **부서·사원 관리** (ERP 수신 원본) | |
| 3 | `users` | 사용자 (P1~P5 페르소나) | 6️⃣ **사용자·권한 > 사용자 관리** | |
| 4 | `rcm_controls` | RCM 402건 통제 마스터 | 1️⃣ RCM 관리 | |
| 5 | ~~`rcm_dept_map`~~ → **`rcm_default_owners`** | 기본 담당자 (차수 없음) | 2️⃣ 설계평가 > 통제수행자 지정 | 🆕 분리 |
| 6 | **`rcm_term_assignments`** | 차수별 담당자 (is_override 패턴) | 3️⃣ 샘플링작업 > 증빙제출자 지정 | 🆕 분리 |
| 7 | `rcm_snapshots` | RCM 버전 락 (평가 직전 고정) | 1️⃣ RCM 지정 ⭐ | |
| 8 | `populations` | 모집단 (ERP 자동 + 엑셀 업로드) | 3️⃣ 모집단 관리 | |
| 9 | `samples` | 샘플링 결과 | 3️⃣ 샘플링 작업 | |
| 10 | `evidence_files` | 증빙 첨부 파일 | 3️⃣ 증빙수집 | |
| 11 | `evidence_submissions` | 증빙제출 수행·승인 | 3️⃣ 증빙제출 수행/승인 | |
| 12 | `op_evaluations` | 운영평가 수행 결과 | 3️⃣ 운영평가 수행 | |
| 13 | `deficiencies` | 예외·미비점 4분류 | 3️⃣ 예외보고·미비점 검토 | |
| 14 | `approvals` | 결재 워크플로우 | 4️⃣ 결재관리 | |
| 15 | `audit_logs` | 전체 변경 이력 | 6️⃣ 로그 | |

> ⚠️ **2026-06-04 변경**: `rcm_dept_map` 1개 → `rcm_default_owners` + `rcm_term_assignments` 2개로 분리.
> 기존 `supabase/migrations/001_initial_schema.sql`의 `rcm_dept_map` DDL은 004번 마이그레이션으로 교체 예정.

---

## 1. `eval_terms` — 평가기간

```sql
CREATE TABLE eval_terms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term_id       TEXT NOT NULL UNIQUE,         -- ERP TERMID 대응 (예: '2025')
  term_year     INT  NOT NULL,                -- 평가연도
  term_cnt      INT  NOT NULL DEFAULT 0,      -- 회차: ERP TERMCNT 대응
  eval_mode     TEXT NOT NULL CHECK (eval_mode IN ('INTERIM1','INTERIM2','FINAL')),
  entity_code   TEXT NOT NULL DEFAULT '10000',-- ERP ENTITY_CODE
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  is_active     BOOL NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_eval_terms_active ON eval_terms(is_active, term_year);
```

---

## 2. `departments` — 부서 마스터

```sql
CREATE TABLE departments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dept_code     TEXT NOT NULL UNIQUE,         -- ERP DEPT_CODE 대응
  dept_name     TEXT NOT NULL,
  parent_code   TEXT,
  entity_code   TEXT NOT NULL DEFAULT '10000',
  is_active     BOOL NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

---

## 3. `users` — 사용자

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emp_no        TEXT NOT NULL UNIQUE,         -- 사번 (ERP 연동 키)
  emp_name      TEXT NOT NULL,
  email         TEXT UNIQUE,
  dept_code     TEXT REFERENCES departments(dept_code),
  persona       TEXT NOT NULL CHECK (persona IN ('P1','P2','P3','P4','P5')),
  -- P1=통제수행자 P2=통제책임자 P3=내부회계평가자 P4=감사 P5=내부회계팀
  is_active     BOOL NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
-- SAC 인증 연동 후 auth.users.id 매핑 예정 (Phase 8)
```

---

## 4. `rcm_controls` — RCM 통제 마스터

```sql
CREATE TABLE rcm_controls (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ctrl_code        TEXT NOT NULL UNIQUE,      -- 예: 'FR-C-1-1-1', 'IT-C-2-1-1'
  ctrl_title       TEXT NOT NULL,             -- 통제명
  ctrl_category    TEXT,                      -- 대분류
  ctrl_subcategory TEXT,                      -- 중분류
  ctrl_type        TEXT CHECK (ctrl_type IN ('Preventive','Detective')),
  ctrl_method      TEXT CHECK (ctrl_method IN ('Manual','Automated','IT-Dependent Manual')),
  frequency        TEXT CHECK (frequency IN ('Daily','Weekly','Monthly','Quarterly','Annually','Per Occurrence')),
  it_dep           TEXT CHECK (it_dep IN ('Y','N')),
  system_name      TEXT,
  evidence         TEXT,                      -- 증빙 유형
  ctrl_kind        TEXT NOT NULL CHECK (ctrl_kind IN ('PLC','ITGC','ELC')),
  entity_code      TEXT NOT NULL DEFAULT '10000',
  is_key           BOOL NOT NULL DEFAULT true,-- 핵심통제(Key) 여부
  is_active        BOOL NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_rcm_ctrl_kind ON rcm_controls(ctrl_kind);
```

> `rcm_full_extracted.json` 402건 시딩 대상

---

## 5. `rcm_default_owners` — RCM 기본 담당자 🆕 (2026-06-04, rcm_dept_map 분리)

> **역할**: 통제-부서별 기본 P1(통제수행자)·P2(통제책임자) 지정. 차수 없음 (영구 기준값).
> **관리 위치**: 설계평가 > 사전준비 > 통제수행자 지정 탭 (P5 전용)
> **규칙**: 차수 시작 시 이 테이블 기준으로 `rcm_term_assignments` 자동 생성

```sql
CREATE TABLE rcm_default_owners (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ctrl_code     TEXT NOT NULL REFERENCES rcm_controls(ctrl_code),
  dept_code     TEXT NOT NULL REFERENCES departments(dept_code),
  default_p1_id UUID REFERENCES users(id),   -- 기본 통제수행자 (P1)
  default_p2_id UUID REFERENCES users(id),   -- 기본 통제책임자 (P2)
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(ctrl_code, dept_code)               -- 통제·부서 조합은 고유
);
CREATE INDEX idx_default_owners_ctrl ON rcm_default_owners(ctrl_code);
CREATE INDEX idx_default_owners_dept ON rcm_default_owners(dept_code);
```

---

## 6. `rcm_term_assignments` — 차수별 담당자 🆕 (2026-06-04, rcm_dept_map 분리)

> **역할**: 차수별 실제 P1·P2 지정. `rcm_default_owners`에서 자동 승계 후 차수별 override 가능.
> **관리 위치**: 샘플링작업 > 증빙제출자 지정 탭 (P5 전용)
> **핵심 패턴**:
> - 차수 시작 시 `is_override = false`로 자동 생성 (default_owner 복사)
> - P5가 차수별 변경 시 `is_override = true` 격리, `original_p1_id`로 원본 유지
> - 변경 취소 시 `is_override = false`로 즉시 원복

```sql
CREATE TABLE rcm_term_assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eval_term_id    UUID NOT NULL REFERENCES eval_terms(id),
  ctrl_code       TEXT NOT NULL REFERENCES rcm_controls(ctrl_code),
  dept_code       TEXT NOT NULL REFERENCES departments(dept_code),
  p1_id           UUID REFERENCES users(id),   -- 현재 차수의 통제수행자
  p2_id           UUID REFERENCES users(id),   -- 현재 차수의 통제책임자
  original_p1_id  UUID REFERENCES users(id),   -- 기본값 원본 (읽기 전용 표시용)
  original_p2_id  UUID REFERENCES users(id),   -- 기본값 원본 (읽기 전용 표시용)
  is_override     BOOL NOT NULL DEFAULT false, -- true: P5가 차수별 변경한 건
  override_reason TEXT,                        -- 변경 사유 (is_override=true 시)
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(eval_term_id, ctrl_code, dept_code)
);
CREATE INDEX idx_term_assign_term ON rcm_term_assignments(eval_term_id);
CREATE INDEX idx_term_assign_ctrl ON rcm_term_assignments(ctrl_code, dept_code);
```

> **마이그레이션 계획**: `004_rcm_owner_split.sql`로 신규 작성
> - Step 1: 두 테이블 CREATE
> - Step 2: 기존 `rcm_dept_map` 데이터 → `rcm_default_owners` 이관
> - Step 3: 기존 `rcm_dept_map` RENAME → `rcm_dept_map_deprecated` (즉시 DROP 하지 않음)
> - Step 4: 코드에서 `rcm_dept_map` 참조 교체 후 최종 DROP

---

## 6. `rcm_snapshots` — RCM 버전 락

```sql
CREATE TABLE rcm_snapshots (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eval_term_id  UUID NOT NULL REFERENCES eval_terms(id) UNIQUE,
  snapshot_data JSONB NOT NULL,              -- RCM 전체 JSON 스냅샷
  locked_by     UUID REFERENCES users(id),
  locked_at     TIMESTAMPTZ DEFAULT now(),
  note          TEXT
);
```

> 운영평가 직전 P5가 RCM 버전 확정. 락 이후 `rcm_controls` 수정 영향 없음.

---

## 7. `populations` — 모집단

```sql
CREATE TABLE populations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eval_term_id        UUID NOT NULL REFERENCES eval_terms(id),
  ctrl_code           TEXT NOT NULL REFERENCES rcm_controls(ctrl_code),
  dept_code           TEXT NOT NULL REFERENCES departments(dept_code),
  -- ERP ICM_SAMPLE_POPULATION_DT 컬럼 대응
  population_code     TEXT NOT NULL,          -- 모집단코드
  transaction_id      TEXT NOT NULL,          -- TRANSACTION_ID ★ 연결키
  transaction_date    DATE,                   -- TRANSACTION_DATE
  transaction_desc    TEXT,                   -- TRANSACTION_DESCRIPTION (모집단내용)
  add_info_1          TEXT,                   -- ADD_INFO_1
  add_info_2          TEXT,                   -- ADD_INFO_2
  source              TEXT NOT NULL CHECK (source IN ('ERP_AUTO','EXCEL_UPLOAD')),
  upload_batch_id     TEXT,                   -- 엑셀 업로드 배치 ID
  entity_code         TEXT NOT NULL DEFAULT '10000',
  created_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE(eval_term_id, ctrl_code, transaction_id)
);
CREATE INDEX idx_pop_term_ctrl ON populations(eval_term_id, ctrl_code);
CREATE INDEX idx_pop_transaction_id ON populations(transaction_id);
```

---

## 8. `samples` — 샘플링 결과

```sql
CREATE TABLE samples (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eval_term_id    UUID NOT NULL REFERENCES eval_terms(id),
  population_id   UUID NOT NULL REFERENCES populations(id),
  ctrl_code       TEXT NOT NULL REFERENCES rcm_controls(ctrl_code),
  sample_seq      INT  NOT NULL,              -- ERP SAMPLE_ID 대응 (순번)
  sampling_method TEXT CHECK (sampling_method IN ('RANDOM','JUDGMENTAL','HAPHAZARD')),
  sampled_by      UUID REFERENCES users(id),
  sampled_at      TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'PENDING'
                  CHECK (status IN ('PENDING','EVIDENCE_REQUESTED','EVIDENCE_SUBMITTED','EVALUATED')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(eval_term_id, ctrl_code, sample_seq)
);
CREATE INDEX idx_samples_term_ctrl ON samples(eval_term_id, ctrl_code);
```

---

## 9. `evidence_files` — 증빙 파일

```sql
CREATE TABLE evidence_files (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_id       UUID NOT NULL REFERENCES samples(id),
  file_name       TEXT NOT NULL,
  file_path       TEXT NOT NULL,              -- Supabase Storage 경로
  file_size       BIGINT,
  mime_type       TEXT,
  ai_verified     BOOL,                       -- AI 검증 통과 여부
  ai_score        NUMERIC(5,2),               -- AI 신뢰도 점수 0~100
  ai_note         TEXT,                       -- AI 검증 메모
  uploaded_by     UUID REFERENCES users(id),
  uploaded_at     TIMESTAMPTZ DEFAULT now(),
  is_deleted      BOOL NOT NULL DEFAULT false
);
CREATE INDEX idx_evidence_sample ON evidence_files(sample_id);
```

> Storage 버킷: `evidence-files` (비공개, Signed URL 발급)

---

## 10. `evidence_submissions` — 증빙제출 워크플로우

```sql
CREATE TABLE evidence_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_id       UUID NOT NULL REFERENCES samples(id) UNIQUE,
  eval_term_id    UUID NOT NULL REFERENCES eval_terms(id),
  submitted_by    UUID REFERENCES users(id),  -- P1 통제수행자
  submitted_at    TIMESTAMPTZ,
  submission_note TEXT,
  approved_by     UUID REFERENCES users(id),  -- P2 통제책임자
  approved_at     TIMESTAMPTZ,
  approval_note   TEXT,
  status          TEXT NOT NULL DEFAULT 'DRAFT'
                  CHECK (status IN ('DRAFT','SUBMITTED','APPROVED','REJECTED','REVISION_REQUESTED')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

---

## 11. `op_evaluations` — 운영평가 수행

```sql
CREATE TABLE op_evaluations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_id       UUID NOT NULL REFERENCES samples(id) UNIQUE,
  eval_term_id    UUID NOT NULL REFERENCES eval_terms(id),
  ctrl_code       TEXT NOT NULL REFERENCES rcm_controls(ctrl_code),
  result          TEXT CHECK (result IN ('PASS','EXCEPTION','NOT_APPLICABLE')),
  -- 🟢 PASS=정상 / 🟡 EXCEPTION=예외 / ⚪ NOT_APPLICABLE=해당없음
  eval_note       TEXT,
  ai_draft        TEXT,                       -- AI 평가 초안 (사람이 최종 판단)
  evaluated_by    UUID REFERENCES users(id),  -- P3 내부회계평가자
  evaluated_at    TIMESTAMPTZ,
  finalized_by    UUID REFERENCES users(id),  -- P5 내부회계팀
  finalized_at    TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'PENDING'
                  CHECK (status IN ('PENDING','IN_PROGRESS','COMPLETED','FINALIZED')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

---

## 12. `deficiencies` — 예외·미비점 4분류

```sql
CREATE TABLE deficiencies (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  op_eval_id       UUID NOT NULL REFERENCES op_evaluations(id),
  eval_term_id     UUID NOT NULL REFERENCES eval_terms(id),
  ctrl_code        TEXT NOT NULL REFERENCES rcm_controls(ctrl_code),
  severity         TEXT NOT NULL CHECK (severity IN (
    'IMPROVEMENT_SUGGESTION',  -- 🔵 개선권고
    'SIMPLE_DEFICIENCY',       -- 🟡 단순한 미비점
    'SIGNIFICANT_DEFICIENCY',  -- 🟠 유의한 미비점
    'MATERIAL_WEAKNESS'        -- 🔴 중요한 취약점
  )),
  deficiency_desc  TEXT NOT NULL,
  root_cause       TEXT,
  remediation      TEXT,                      -- 개선방안
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
```

---

## 13. `approvals` — 결재 워크플로우

```sql
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
```

---

## 14. `audit_logs` — 변경 이력

```sql
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
```

---

## ERP 컬럼 매핑 요약

| ERP (`ICM_SAMPLE_POPULATION_DT`) | Supabase 컬럼 | 테이블 |
|----------------------------------|--------------|--------|
| `TERMID` | `term_id` | `eval_terms` |
| `TERMCNT` | `term_cnt` | `eval_terms` |
| `ENTITY_CODE` | `entity_code` | 전 테이블 공통 |
| `CTRL_NO` | `ctrl_code` | `rcm_controls` |
| `DEPT_CODE` | `dept_code` | `departments` |
| `TRANSACTION_ID` ⭐ | `transaction_id` | `populations` |
| `TRANSACTION_DATE` | `transaction_date` | `populations` |
| `TRANSACTION_DESCRIPTION` | `transaction_desc` | `populations` |
| `ADD_INFO_1/2` | `add_info_1/2` | `populations` |
| `SAMPLE_ID` | `sample_seq` | `samples` |
| `N` (모집단 개수) | `COUNT(*)` 집계 | — |

---

## Supabase Storage 버킷

| 버킷명 | 용도 | 공개 여부 |
|--------|------|----------|
| `evidence-files` | 증빙 첨부 파일 | 비공개 (Signed URL) |
| `rcm-templates` | RCM 엑셀 템플릿 | 비공개 |
| `report-exports` | 평가 결과 보고서 ZIP / 통합 엑셀 다운로드 | 비공개 |

> **`report-exports` 용도 확장** (2026-06-05): 기존 ZIP(감사패키지) 외 **통합 엑셀 다운로드** 파일도 이 버킷에 저장.
> 통합 엑셀 = Sheet1(모집단·샘플링 현황) + SheetN(통제별 증빙목록·AI검증결과·P3평가의견) — ExcelJS로 서버사이드 생성.

---

## 마이그레이션 파일 계획 (2026-06-05 업데이트)

```
supabase/
├── migrations/
│   ├── 001_initial_schema.sql      ← 전체 DDL (14개 테이블, Phase 7 기준)
│   ├── 002_rls_policies.sql        ← RLS 정책 (페르소나별 P1~P5)
│   ├── 003_audit_triggers.sql      ← 변경이력 트리거
│   └── 004_rcm_owner_split.sql     ← 🆕 rcm_dept_map → default_owners + term_assignments 분리
│                                       (rcm_dept_map은 deprecated 처리, 즉시 DROP 안 함)
└── seeds/
    └── rcm_controls.sql            ← RCM 402건 시딩
```

> **실행 순서**: 001 → 002 → 003 → 004 (Supabase 계정 수령 후 SQL Editor에서 순차 실행)
> **현재 상태**: 001~003 SQL 파일 작성 완료, 004 미작성 (DB 스키마 확정 후 작성 예정)
