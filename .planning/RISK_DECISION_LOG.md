# Smart-ICM 리스크 분류 + 설계 결정 이력
> 작성일: 2026-06-05 | Phase 8-설계논의2
> 목적: 데이터 꼬임을 방지하기 위해 지금 결정해야 할 항목과 나중에 변경 가능한 항목을 명확히 분리

---

## 분류 기준

| 등급 | 의미 | 기준 |
|------|------|------|
| 🔴 HIGH | **지금 반드시 결정** | 변경 시 기존 데이터 전체 마이그레이션 필요. 운영 중 변경 불가 수준 |
| 🟡 MEDIUM | **지금 결정 권장** | 나중에 변경 가능하나 공수 크고 기존 이력과 불일치 발생 가능 |
| 🟢 LOW | **언제든 변경 가능** | UI·라벨·기능 레벨. DB 스키마 영향 없음 |

---

## 🔴 HIGH — 지금 반드시 결정 (DB 구조 핵심)

### R1. 차수(eval_term) 식별 방식
- **내용**: 모든 평가 데이터(samples, evidence_submissions, op_evaluations 등)가 `eval_term_id`로 FK 연결됨
- **현재 설계**: UUID PK (`id`) + 별도 컬럼(`term_id`, `term_year`, `eval_mode`, `term_cnt`)으로 분리
- **상태**: ✅ 확정 (2026-06-01)
- **추가 확정 (2026-06-10)**: `term_name TEXT` 컬럼 추가 — 화면 표시명. 생성 시 자동생성값 저장(A안 고정 패턴), P5가 수정 가능. `term_id`(ERP키)·`id`(FK기준)는 불변.
  - 자동생성 규칙: `INTERIM{N}` → `{year}년 {N}차 평가` / `FINAL` → `{year}년 기말 평가` (N은 1 이상 제한 없음)
  - 구현 시점: DB 컬럼은 현재 반영 완료 / 자동생성 함수(`lib/termNameGenerator.ts`)는 Phase 10 CRUD 연동 시 작성
  - 향후 B안(회사별 템플릿) 도입 검토 예정 — 기존 레코드는 이미 저장된 값 유지(영향 없음)
- **변경 시 영향**: FK 참조 전체 재구성 (samples·populations·rcm_term_assignments 등 7개 테이블) — `term_name`은 FK 연결 없으므로 해당 없음

### R2. 통제코드(ctrl_code) 형식 + 멀티테넌시
- **내용**: 통제코드는 `company_id`와 복합 UNIQUE. 금강: `FR-C-1-3-1`, 자회사: `FR-30-C01` 등 형식 무관.
- **현재 설계**: `UNIQUE(company_id, ctrl_code)` — TEXT 자유 형식, 회사별 코드 충돌 없음
- **멀티테넌시 구조 (2026-06-10 확정)**:
  - `companies` 테이블 신설 (루트) → 모든 테이블에 `company_id UUID NOT NULL` 추가
  - 자연키 FK → 복합 FK: `FOREIGN KEY (company_id, ctrl_code) REFERENCES rcm_controls(company_id, ctrl_code)`
  - RLS 헬퍼 `current_company_id()` 추가 → 모든 정책에서 회사 격리 자동 적용
  - 자회사 배포 시: `seeds/rcm_controls.sql`만 해당 코드 형식으로 교체 (구조 변경 없음)
- **상태**: ✅ 확정 (2026-06-10) — `001_initial_schema.sql` + `002_rls_policies.sql` + `docs/DB_스키마.md` 반영 완료
- **변경 시 영향**: companies 루트가 잠겨 있으므로 자회사 코드 형식은 언제든 자유. 멀티테넌시 구조 자체 변경은 전체 FK 재구성 필요

### R3. Status 8단계 enum 값
- **내용**: `SAMPLE_SELECTED → AUTO_COLLECTED → MANUAL_UPLOADED → AI_VALIDATED → EVIDENCE_CONFIRMED → AI_DRAFTED → EVALUATED → AUDIT_PACKAGED`
- **현재 설계**: PostgreSQL ENUM 또는 VARCHAR CHECK 제약
- **상태**: ✅ 확정 (IA_DESIGN.md v6, 2026-05-21)
- **변경 시 영향**: 평가 진행 중인 건이 있으면 중간 변경 불가. 새 상태 추가는 마이그레이션 필요 (단, 삭제/순서 변경은 기존 데이터 오류)

### R4. rcm_default_owners / rcm_term_assignments 분리 구조
- **내용**: 기존 `rcm_dept_map` 단일 테이블 → 2개 테이블 분리
  - `rcm_default_owners`: 기본 담당자 (차수 없음, UNIQUE ctrl+dept)
  - `rcm_term_assignments`: 차수별 담당자 (eval_term_id 포함, is_override 플래그)
- **상태**: ✅ 확정 (Phase 8-설계논의, 2026-06-04)
- **변경 시 영향**: 차수 시작 자동 승계 로직, 샘플링작업·설계평가 탭 연결 구조 전면 재설계

### R5. 페르소나 역할 enum (P1~P5)
- **내용**: Supabase RLS 정책의 role 컬럼 기준. `p1_operator / p2_manager / p3_evaluator / p4_auditor / p5_admin`
- **현재 설계**: users 테이블 `persona_type` VARCHAR + RLS CHECK
- **상태**: ✅ 확정 (IA_DESIGN.md v5, 2026-05-20)
- **변경 시 영향**: 전체 RLS 정책 002_rls_policies.sql 재작성 필요

### R6. eval_terms의 eval_mode (평가 모드)
- **내용**: 기말 평가 시 샘플링 SKIP 분기가 이 값으로 처리됨
- **현재 설계**: `CHECK (eval_mode ~ '^(INTERIM[1-9][0-9]*|FINAL)$')` — INTERIM{N} 개방형 + FINAL
  - INTERIM1·INTERIM2 기본, INTERIM3·INTERIM4 이상도 동일 흐름으로 수용
  - 분기 로직: `eval_mode === 'FINAL'` → 샘플링 SKIP, 그 외(INTERIM{N}) → 샘플링 수행
- **상태**: ✅ 확정 (2026-06-10 업데이트 — 개방형 패턴으로 변경)
- **변경 시 영향**: FINAL 분기 로직은 그대로. INTERIM{N} 추가는 CHECK 자동 수용, 코드 변경 없음

### R7. populations 테이블의 source_type (ERP vs 수동 구분)
- **내용**: 모집단 행이 ERP 자동 수신인지 수동 엑셀 업로드인지 구분하는 컬럼
- **현재 설계**: `source_type VARCHAR CHECK IN ('erp', 'manual')`
- **상태**: ✅ 확정 (DB_스키마.md, 2026-06-01)
- **변경 시 영향**: 나중에 추가하면 기존 수동 데이터에 소급 분류 불가 (NULL 처리 문제)

### R8. 평가기간별 데이터 격리 + 거래시점 스냅샷 보존 (2026-06-08 신규) ⭐
- **배경**: 시스템 운영 후 **과거 평가기간을 조회**할 때, 현재 시점의 RCM·담당자·조직이 바뀌어 과거 화면 데이터가 어긋나거나 충돌하는 문제 방지
- **확정 원칙** (장한나 PL, 2026-06-08):
  1. **평가기간 격리**: 모든 결재·평가 트랜잭션 테이블은 `eval_term_id` FK로 격리. 상신함·결재함 등 모든 조회는 **항상 `WHERE eval_term_id = 선택기간`** 으로 스코프 → 과거/현재 데이터 비충돌
  2. **거래시점 스냅샷 보존**: 담당자(상신자·결재자)·조직(부서)은 **FK만 두지 말고, 거래 시점의 이름·직위·부서명을 트랜잭션 행에 스냅샷 컬럼으로 저장**. 퇴사·부서이동·조직개편이 있어도 과거 화면은 그 시점 값으로 정확히 재현
  3. **RCM 시점 보존**: 과거 평가기간 조회 시 통제활동명·통제수는 `rcm_snapshots`의 해당 기간 락 버전 기준으로 표시 (R 영역 기존 설계 활용)
  4. **부서 마스터 삭제 금지**: `departments`는 물리 삭제 ❌ → `is_active=false`만. 과거 참조 보존
- **화면 동작 규칙**:
  - 상신함·결재함 등에 **통제기간(평가기간) 셀렉터** 노출 (필터바 최상단)
  - **"마감된 통제기간은 조회만 가능합니다"** — 마감(`is_active=false`) 기간 선택 시 일괄취소·재상신·승인/반려 등 모든 변경 액션 비활성 (조회 전용)
- **현재 설계 반영 대상** (Supabase 연동 시):
  - `approvals`·`evidence_submissions`·`op_evaluations`에 스냅샷 컬럼 추가: `submitter_name`, `submitter_dept`, `approver_name`, `approver_pos`, `approver_dept` 등
  - `eval_terms.is_active` (마감 플래그) → 앱 레벨 읽기전용 게이트
- **상태**: ✅ 확정 — DB_스키마.md 반영 완료 (2026-06-08). 실제 컬럼 적용은 Phase 8-C
- **변경 시 영향**: 🔴 스냅샷 컬럼을 나중에 추가하면 **이미 쌓인 과거 데이터는 시점 값 복원 불가** (현재 FK 이름으로만 표시되어 왜곡) → 반드시 데이터 적재 전에 컬럼 확정 필요

### R9. 전역 통제기간 컨텍스트(A안)의 데이터 정합성 (2026-06-08 신규) ⭐
- **배경**: 통제기간을 **헤더 전역 셀렉터(A안)**로 두고 모든 페이지가 구독하도록 구현. 전역 클라이언트 상태이므로 Supabase 연동(Phase 8-C) 시 지켜야 충돌이 없는 규칙을 명문화
- **구현 현황** (2026-06-08): `components/evalTerms.js`(`useEvalTerm` 훅, localStorage + 커스텀이벤트), 헤더 셀렉터, 상신함 전역 구독. 차수 토글(중간1/2/기말) 제거 → 통제기간 단일 모델
- **데이터 충돌 리스크 & 필수 대응** (Phase 8-C 체크리스트):

  | # | 리스크 | 등급 | 필수 대응 |
  |---|--------|:----:|----------|
  | A1 | 클라이언트 셀렉터 ↔ 서버 쿼리 스코프 불일치 (전 기간 데이터 혼입) | 🔴 | **모든 read/write 쿼리에 `WHERE eval_term_id=선택값` 강제** + RLS 이중 방어 |
  | A2 | 쓰기 도중 기간 전환(race) → 다른 기간에 결재가 잘못 기록 | 🔴 | 제출 payload에 **작업 시작 시점 `eval_term_id` 박제**(헤더 현재값 아님) |
  | A3 | 마감 기간 쓰기를 클라이언트만 차단 | 🟡 | 서버에서 `is_active=false` 시 **쓰기 거부**(이중 검증) |
  | A4 | URL에 기간 없음 → 링크 공유 시 사람마다 다른 데이터 표시 | 🟡 | (선택) `?term=` 쿼리파라미터 동기화로 공유·북마크 일관성 |
  | A5 | 다중 탭 storage 동기화 → 탭별 독립 조회 불가 | 🟢 | 일관성이 기본 장점. 탭 독립 필요 시 sessionStorage 옵션 |
  | A6 | 차수(중간1/2/기말) 개념 흡수 → 같은 평가 내 차수 전환 필요 시 재설계 | 🟢 | "통제기간=연도+차수 단일" 모델 유지. 필요 시 하위 토글 추가 |

- **핵심 원칙**: 데이터 무결성 책임은 **클라이언트 셀렉터가 아니라 서버 쿼리 스코프**에 있음. A1·A2만 지키면 A안은 안전
- **상태**: ✅ A안 채택·구현 확정 (2026-06-08). A1~A6 대응은 Phase 8-C(Supabase 연동) 시 적용
- **변경 시 영향**: A1·A2 미준수 시 **실제 데이터 충돌**(기간 혼입·오기록) 발생 가능 → 서버 연동 코드 작성 시 최우선 반영

---

## 🟡 MEDIUM — 지금 결정 권장 (나중에 가능하나 공수 큼)

### Y1. 결재선 단계 구조
- **내용**: approvals 테이블의 단계 수, 병렬/순차 결재 지원 여부
- **현재 설계**: 단계별 행 분리 (`step_order`, `approver_id`, `status`)
- **상태**: 🔜 미확정 — 결재선_구조_상세 시트 검토 필요
- **리스크**: 결재 데이터 쌓인 후 구조 변경 시 이력 불일치

### Y2. 예외 등급 4분류 enum 값
- **내용**: `improvement_rec / minor_deficiency / significant_deficiency / critical_weakness`
- **현재 설계**: deficiencies 테이블 `severity` ENUM
- **상태**: ✅ 값 확정 (IA_DESIGN.md v6) — 단, DB enum 선언은 마이그레이션 미실행
- **리스크**: 이미 판정된 건에 소급 변경 불가

### Y3. rcm_snapshots 락 시점 정책
- **내용**: "RCM 지정" 버튼 클릭 시점 vs 차수 시작(start_date) 자동 락 — 둘 중 택1
- **현재 설계**: P5가 RCM 지정 탭에서 명시적으로 실행 (수동 락)
- **상태**: ✅ 수동 락 확정 (IA_DESIGN.md v6)
- **리스크**: 나중에 자동 락으로 변경 시 기존 snapshot 버전 기준이 달라짐

### Y4. 통합 엑셀 다운로드 시트 단위
- **내용**: 감사패키지 엑셀 버전의 시트를 통제 1개당 1시트 vs 프로세스 단위로 할지
- **현재 설계**: 미결정
- **상태**: 🔜 미확정 (2026-06-05 신규 기능 요건으로 등록)
- **리스크**: 시트 단위 결정에 따라 ExcelJS 생성 로직 구조가 달라짐 (나중에 변경 가능하나 재작성)

### Y5. 홈화면 내 할일 + 결재관리 구성항목 (M1/M2 디테일)
- **내용**: 홈 내 할일 카드 표시 컬럼, 결재관리 상신함·결재함의 항목 구성
- **현재 설계**: ✅ 확정 (2026-06-08) — Phase 8-B 요구사항 참조
  - M1: 홈=요약(유형별 건수)만, 클릭 시 해당 탭 이동 (직접처리 아님)
  - M2: 내 할일 탭 완전 제거 → 상신함+결재함 2개
  - 상신함: +증빙제출의견·현재결재자·일괄취소·재상신 / 결재함: +증빙원본조회·미리보기·단건의견·반려의견필수·승인일시
- **상태**: ✅ 확정 — 코드 반영은 /실행 대기
- **리스크 해소**: `approvals.action_note`·`action_at` 기존 컬럼으로 충족 → DB 스키마 변경 없음 (🟢 LOW 확정)

---

## 🟢 LOW — 언제든 변경 가능 (UI·기능 레벨)

| # | 항목 | 비고 |
|---|------|------|
| G1 | 메뉴 이름, 탭 라벨, 아이콘 | components/AppLayout.jsx 수정만 |
| G2 | 홈화면 카드 레이아웃·순서 | UI 컴포넌트 수정 |
| G3 | 사이드 패널 vs 팝업 UX | UX 레이어, DB 영향 없음 |
| G4 | 시스템관리 평가설정·연동설정 서브페이지 신설 (M3/M4) | 신규 페이지 추가. 기존 데이터 영향 없음 |
| G5 | 차수 복사 기능 (M5) | eval_terms INSERT 로직. 기존 데이터 변경 없음 |
| G6 | 파일명 규칙 패턴 | 시스템 파라미터(환경설정)로 관리 |
| G7 | 알림·이메일 발송 설정 | 외부 서비스 연동 설정 |
| G8 | 컬러, 배지, 시각화 방식 | CSS/Tailwind 수정 |
| G9 | 증빙 로그 화면 구성 | audit_logs 테이블 조회 UI |
| G10 | 결과보고 PDF 템플릿 레이아웃 | 출력 포맷, DB 영향 없음 |
| G11 | 감사패키지 ZIP 내부 폴더 구조 | 파일 생성 로직 변경 |
| G12 | 미리보기(preview-v8-design.html) 탭 추가 | public/ 파일, 프로덕션 영향 없음 |

---

## 📝 결정 이력 (날짜순)

| 날짜 | 결정 항목 | 결정 내용 | 관련 문서 |
|------|----------|----------|----------|
| 2026-05-20 | 페르소나 5종 확정 (R5) | P1~P5 역할 enum 확정 | IA_DESIGN.md v5 §8 P-A |
| 2026-05-20 | term_type 3종 확정 (R6) | mid1/mid2/final | IA_DESIGN.md v5 §8 V5-5 |
| 2026-05-20 | Status 8단계 확정 (R3) | SAMPLE_SELECTED → … → AUDIT_PACKAGED | IA_DESIGN.md v5 §3 |
| 2026-05-21 | 통제코드 형식 확정 (R2) | FR-C-1-3-1 형식, 402건 | IA_DESIGN.md v6 §8 V6-1 |
| 2026-06-01 | eval_terms 설계 확정 (R1) | INT PK + year/term_type/term_seq | DB_스키마.md |
| 2026-06-01 | source_type 컬럼 확정 (R7) | erp / manual | DB_스키마.md |
| 2026-06-01 | rcm_snapshots 수동 락 확정 (Y3) | P5 명시적 RCM 지정 실행 | IA_DESIGN.md v6 §4 |
| 2026-06-01 | 예외 등급 4분류 값 확정 (Y2) | improvement_rec/minor/significant/critical | IA_DESIGN.md v6 §4 |
| 2026-06-04 | rcm_default_owners / rcm_term_assignments 분리 (R4) | 2테이블 분리, is_override 패턴 | HANDOVER.md DB 스키마 변경 섹션 |
| 2026-06-04 | M6 소프트게이트 확정 | RCM-부서 Map 미완료 시 경고만, 하드차단 제거 | HANDOVER.md M6 |
| 2026-06-04 | 결재 처리 UX 확정 | 팝업 → 사이드 패널(Drawer) | HANDOVER.md 결재 처리 UX |
| 2026-06-04 | ERP API 모니터링 구조 확정 | 하이브리드 (탭 분산형 + 시스템관리 집중형) | HANDOVER.md ERP API |
| 2026-06-05 | 통합 엑셀 다운로드 기능 요건 등록 | 결과조회 > 평가증빙제출 탭 내 버튼 추가 방향 | HANDOVER.md 신규 기능 요건 |
| 2026-06-05 | M1/M2 방향 동의, 디테일 미확정 | 홈·결재관리 방향은 OK, 구성항목 다음 세션 | HANDOVER.md v8 변경 포인트 |
| 2026-06-08 | **M1/M2 디테일 확정 (Y5 해소)** | 홈=요약+딥링크 / 내할일탭 제거 / 상신함·결재함 항목 확정 / DB변경 없음 | REQUIREMENTS.md Phase 8-B |
| 2026-06-08 | **R8 평가기간 격리 + 시점 스냅샷 (HIGH 신규)** | eval_term_id 격리 / 담당자·부서 시점 스냅샷 보존 / 마감기간 조회전용 / RCM snapshot 기준 | RISK_DECISION_LOG.md R8, DB_스키마.md |
| 2026-06-08 | **통제기간 A안 채택 (헤더 전역 셀렉터)** | 차수 토글 제거 → 통제기간 단일 전역 셀렉터. 모든 페이지 useEvalTerm 구독. 마감 규칙 전역 일괄 제어 | components/evalTerms.js, AppLayout.jsx |
| 2026-06-08 | **R9 전역 통제기간 정합성 (HIGH 신규)** | A1 쿼리 스코프 강제 / A2 쓰기 payload 기간 박제 / A3 서버 쓰기거부 / A4 URL동기화(선택) | RISK_DECISION_LOG.md R9 |
| 2026-06-08 | **상신 게이트 = 저장/상신 분리 + 2단계(필수/권장)** | 상신대기(DRAFT) 단일상태 / 필수=차단·권장=사유우회 / 일괄상신은 깨끗한 건만 / 기존 status enum으로 충족(마이그레이션 불요) | docs/UI_패턴.md §5 |
| 2026-06-10 | **R2 멀티테넌시 확정 (company_id 추가)** | companies 테이블 신설 / 전 테이블 company_id 추가 / ctrl_code·dept_code 자연키 → 복합 UNIQUE+FK / RLS current_company_id() 헬퍼 추가 | RISK_DECISION_LOG.md R2, 001_initial_schema.sql, 002_rls_policies.sql, DB_스키마.md |

---

## 🔜 다음 결정 필요 항목 (우선순위순)

1. **M1/M2 디테일** — 홈화면 내 할일 카드 구성항목 + 결재관리 상신함·결재함 컬럼 (Y5)
2. **M3/M4 평가설정·연동설정** — 미리보기 추가 후 검토·확정
3. **M5 차수 복사** — 확정 여부
4. **Y4 통합 엑셀 시트 단위** — 통제 1개당 1시트 vs 프로세스 단위
5. **Y1 결재선 단계 구조** — v2.1 엑셀 결재선_구조_상세 시트 검토 후 확정
