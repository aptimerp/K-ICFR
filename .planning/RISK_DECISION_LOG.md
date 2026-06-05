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
- **결정 필요 사항**: INT 자동증가 PK vs 연도+회차 복합키 (예: `2026-mid1`)
- **현재 설계**: INT PK (`id`) + 별도 컬럼(`year`, `term_type`, `term_seq`)으로 분리
- **상태**: ✅ 현재 설계 유지 확정 (2026-06-01)
- **변경 시 영향**: FK 참조 전체 재구성 (samples·populations·rcm_term_assignments 등 7개 테이블)

### R2. 통제코드(ctrl_no) 형식
- **내용**: `FR-C-1-3-1` 형식의 RCM 통제코드. rcm_controls ↔ rcm_dept_map ↔ rcm_default_owners ↔ samples 등 모든 조인 기준
- **현재 설계**: VARCHAR(50), 실제 RCM 402건 코드 그대로 사용
- **상태**: ✅ 확정 (Phase 7-A, 2026-06-01)
- **변경 시 영향**: 전체 FK 체인 파괴. seeds/rcm_controls.sql 재작성 필요

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

### R6. eval_terms의 term_type (평가 모드 3종)
- **내용**: `mid1 / mid2 / final`. 기말 평가 시 샘플링 SKIP 분기가 이 값으로 처리됨
- **현재 설계**: ENUM('mid1', 'mid2', 'final')
- **상태**: ✅ 확정 (IA_DESIGN.md v5, 2026-05-20)
- **변경 시 영향**: 기말 평가 흐름 분기 로직 전면 재작성

### R7. populations 테이블의 source_type (ERP vs 수동 구분)
- **내용**: 모집단 행이 ERP 자동 수신인지 수동 엑셀 업로드인지 구분하는 컬럼
- **현재 설계**: `source_type VARCHAR CHECK IN ('erp', 'manual')`
- **상태**: ✅ 확정 (DB_스키마.md, 2026-06-01)
- **변경 시 영향**: 나중에 추가하면 기존 수동 데이터에 소급 분류 불가 (NULL 처리 문제)

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
- **현재 설계**: 미확정 (방향만 동의)
- **상태**: 🔜 장한나 PL 다음 세션 피드백 후 확정
- **리스크**: approvals 테이블 구조와 연계되므로, 표시할 컬럼이 확정되어야 DB 설계 완성 가능

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

---

## 🔜 다음 결정 필요 항목 (우선순위순)

1. **M1/M2 디테일** — 홈화면 내 할일 카드 구성항목 + 결재관리 상신함·결재함 컬럼 (Y5)
2. **M3/M4 평가설정·연동설정** — 미리보기 추가 후 검토·확정
3. **M5 차수 복사** — 확정 여부
4. **Y4 통합 엑셀 시트 단위** — 통제 1개당 1시트 vs 프로세스 단위
5. **Y1 결재선 단계 구조** — v2.1 엑셀 결재선_구조_상세 시트 검토 후 확정
