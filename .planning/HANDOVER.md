# Smart-ICM 새 채팅방 인계 문서 (Phase 8-D — DB 설계 재검토 + UI v7 코드 반영 완료)
> 최종 수정: 2026-06-10 | company_id 멀티테넌시 + eval_terms.term_name + eval_mode 개방형 regex + UI v7 탭명 반영
> 이 문서를 새 채팅방에서 Claude에게 보여주며 시작하세요.

---

## 📨 새 채팅방 시작 메시지 (복사·붙여넣기)

```
안녕하세요. 금강공업 Smart-ICM 내부회계관리시스템 프로젝트를 이어서 진행합니다.

프로젝트 경로: E:\AX_TEAM\P1_K-ICFR_SYSTEM_202605\

다음 순서대로 읽고 시작해주세요:
1. CLAUDE.md (프로젝트 컨텍스트)
2. .planning/HANDOVER.md (이 문서, 인계 마스터)
3. .planning/RISK_DECISION_LOG.md (DB/설계 리스크 결정 이력)
4. docs/UI_패턴.md (표준 컴포넌트 패턴)
5. docs/DB_스키마.md (15개 테이블 설계)

현재 상태: Phase 8-D 완료 — company_id 멀티테넌시, eval_terms.term_name, eval_mode 개방형 regex, UI v7 탭명 반영 (2026-06-10).
다음 작업: R3 Status 설계 방안 결정 (5가지 방안 제시됨) + R4~R9 HIGH 항목 검토 + Supabase 계정 수령 후 연동 — 장한나 PL 지시에 따름.

먼저 위 문서들을 읽고, 현재 상태를 파악해주세요.
```

---

## 🏢 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **회사** | 금강공업㈜ (건축·산업설비 제조) |
| **시스템명** | Smart-ICM (내부회계관리시스템) |
| **목적** | 기존 MicolCM 시스템 대체 + 비개발자 친화 K-ICFR 평가 운영플랫폼 |
| **주담당 PL** | 장한나 (바이브코더) |
| **프로젝트 경로** | `E:\AX_TEAM\P1_K-ICFR_SYSTEM_202605\` |
| **기술 스택** | Next.js 15 + React 19 + Tailwind CSS v4 + lucide-react |
| **Notion MCP** | ✅ 연결됨 (`.mcp.json` 정상화 완료) |

---

## 📍 현재 상태 — Phase 8-D 완료

### ✅ 완료 페이즈
- Phase 0~6: 2026-05-15 ~ 2026-05-22 완료 (UI 구축 + IA v6 확정)
- **Phase 7-A (Supabase DB 스키마 설계): 2026-06-01 완료**
- **Phase 7-B (IA v7 메뉴 구조 확정): 2026-06-01 완료**
- **Phase 8-A (데이터 운영방식 문서 정의): 2026-06-02 완료**
- **Phase 8-B (상신함·결재함 Drawer UX 설계 확정): 2026-06-05 완료**
- **Phase 8-C-1 (상신함 고도화 + EvidenceViewer 표준화 + 상신 게이트): 2026-06-08 완료** ⭐
- **Phase 8-C-2 (결재함 표준화 + EvidenceViewer B안): 2026-06-09 완료** ⭐
- **SAC 견본 PDF 실제 렌더러: 2026-06-09 완료** ⭐
- **Phase 8-D (DB 설계 재검토 + UI v7 코드 반영): 2026-06-10 완료** ⭐⭐

### Phase 8-D 핵심 산출물 (2026-06-10)
| 파일 | 변경 내용 |
|------|-----------|
| `supabase/migrations/001_initial_schema.sql` | `companies` 테이블 신설 + 전 16개 테이블 `company_id` 추가 + 복합 UNIQUE·FK 전체 적용 |
| `supabase/migrations/002_rls_policies.sql` | `current_company_id()` 헬퍼 신설 + 전 정책 company_id 격리 조건 추가 |
| `docs/DB_스키마.md` | 16개 테이블로 갱신, companies DDL 추가, 설계원칙 #10 멀티테넌시 추가 |
| `.planning/RISK_DECISION_LOG.md` | R1(term_name), R2(company_id), R6(eval_mode 개방형) 결정 업데이트 |
| `app/operations/period/page.jsx` | 탭명 `조직/권한 관리` → `부서·사원 관리` |
| `app/settings/users/page.jsx` | 2탭 통합 페이지 재작성 (사용자 관리 + 권한 설정) |
| `components/AppLayout.jsx` | 사이드바 `사용자`+`권한` → `사용자·권한` 1개 통합 |

### Phase 8-C-2 핵심 산출물 (2026-06-09, 참고용)
| 파일 | 변경 내용 |
|------|-----------|
| `components/PdfViewer.jsx` | react-pdf v7 API 재작성 — ResizeObserver 동적 폭 + orientation padding + PdfThumbnail |
| `components/FileViewer.jsx` | **신규** — PDF·이미지·Excel·Word 통합 뷰어 (확장자 자동 감지, thumbnail prop 분기) |
| `components/FileUploader.jsx` | **신규** — 드래그앤드롭 + 타입/크기 검증 + 진행률 + Supabase onUpload 인터페이스 |
| `app/approval/inbox/page.jsx` | FileViewer dynamic import(ssr:false) 통합 |
| `app/op-eval/evidence/page.jsx` | 수동 드래그앤드롭 JSX → FileUploader 컴포넌트 교체 |
| `next.config.mjs` | `transpilePackages: ["docx-preview"]` + `canvas alias = false` |
| `public/pdf.worker.min.js` | pdfjs-dist v3 CJS worker 1,062KB 복사 |

**⚠️ Supabase 연동 대기**: FileUploader `onUpload` prop 미연결 상태. Supabase 계정 수령 후 활성화.

### 🔜 다음 페이즈 후보
- **R3 Status 방안 결정** (즉시 가능): 5가지 방안 제시됨 — A·B·C·D·E 중 선택 필요
- **R4~R9 HIGH 항목 검토** (즉시 가능): RISK_DECISION_LOG.md 참조
- **Phase 8-C-3**: FileUploader Supabase 실연동 (홍세민 PM 계정 수령 후)
- **Phase 7-C**: Supabase 마이그레이션 실행 (계정 수령 후)
- **Phase 9**: SAC API 연동
- **Phase 10**: Supabase CRUD 연동 + 검증 + 배포

---

## 🎯 IA v7 메뉴 구조 (확정, 2026-06-01)

### 핵심 변경 3가지 (v6 → v7)

| # | 변경 전 | 변경 후 | 이유 |
|---|--------|--------|------|
| V7-1 | 운영관리 > `조직/권한 관리` | `부서·사원 관리` | ERP 수신 단일 창구, MicolCM 패턴 |
| V7-2 | 시스템관리 `사용자`+`권한` (2개) | `사용자·권한` 탭통합 (1개) | 비개발자 효율성 |
| V7-3 | ERP 수신 2곳 | 운영관리 단일화 | 데이터 원본 명확화 |

### 확정 메뉴 트리 v7

```
🏠 홈

1️⃣ 운영관리 [P5]
   ├─ 📄 평가관리
   │   ├─[탭] 평가기간 관리
   │   ├─[탭] 부서·사원 관리   ★v7 ERP 수신 원본 창구
   │   └─[탭] 결재선 관리
   └─ 📄 RCM관리
       ├─[탭] RCM 지정 ⭐
       ├─[탭] RCM 관리
       └─[탭] RCM-부서 Map

2️⃣ 설계평가관리 📌 [준비중]

3️⃣ 운영평가관리 [헤더 차수 토글: 중간1·중간2·기말]
   ├─ 📄 샘플링작업 [P5 단독] (6탭)
   ├─ 📄 증빙제출 ⭐⭐ (4탭: 수집·AI검증·수행·승인)
   ├─ 📄 운영평가 (4탭: 수행·예외보고수행·예외보고관리·미비점검토)
   └─ 📄 진행관리 (3탭)

4️⃣ 결재관리 (내 할일·상신함·결재함)

5️⃣ 결과조회 > 평가 현황 (6탭)

6️⃣ 시스템관리 [P5]
   ├─ 📄 사용자·권한   ★v7 통합
   │   ├─[탭] 사용자 관리
   │   └─[탭] 권한 설정
   ├─ 로그
   ├─ 증빙 로그
   └─ 환경설정
```

**구조 통계 v7**: 서브페이지 12 / 단일 메뉴 6 / 탭 41

---

## 👥 페르소나 5명

| 페르소나 | 역할 | 규모 |
|---------|------|------|
| 🟦 P1 통제수행자 | 현업부서원 — 자체평가·증빙제출 | 70~80명 |
| 🟧 P2 통제책임자 | 현업부서장 — 부서원 일괄 승인 | 15~20명 |
| 🟪 P3 내부회계평가자 | TF — P1 역할 + 운영평가 수행 | 5~10명 |
| 🟨 P4 감사·감사위·관리자 | 조회·다운로드 전용 | 5~10명 |
| 🟥 P5 내부회계팀 | Super Admin | 2~3명 |

---

## 🗄️ Phase 7-A / 8-D 산출물 (DB 스키마)

### 16개 테이블 요약 (2026-06-10 company_id 멀티테넌시 반영)

| # | 테이블 | 설명 | IA 메뉴 |
|---|--------|------|---------|
| 0 | `companies` | 회사 마스터 (멀티테넌시 루트) ★신규 | — |
| 1 | `eval_terms` | 평가기간 (`term_name` 추가, `eval_mode` 개방형) | 평가기간 관리 |
| 2 | `departments` | 부서 마스터 | 부서·사원 관리 |
| 3 | `users` | 사용자 | 사용자·권한 |
| 4 | `rcm_controls` | RCM 402건 | RCM 관리 |
| 5 | `rcm_dept_map` | RCM-부서 매핑 (deprecated 예정) | RCM-부서 Map |
| 6 | `rcm_snapshots` | RCM 버전 락 | RCM 지정 |
| 7 | `populations` | 모집단 | 모집단 관리 |
| 8 | `samples` | 샘플링 결과 | 샘플링 작업 |
| 9 | `evidence_files` | 증빙 파일 | 증빙수집 |
| 10 | `evidence_submissions` | 증빙제출 워크플로우 | 증빙제출 수행/승인 |
| 11 | `op_evaluations` | 운영평가 수행 | 운영평가 수행 |
| 12 | `deficiencies` | 예외·미비점 4분류 | 예외보고·미비점 |
| 13 | `approvals` | 결재 워크플로우 | 결재관리 |
| 14 | `audit_logs` | 변경이력 | 시스템 로그 |
| (+) | `rcm_default_owners` | 기본 담당자 (rcm_dept_map 분리, Phase 8-A 설계) | 통제수행자 지정 |
| (+) | `rcm_term_assignments` | 차수별 담당자 override (rcm_dept_map 분리, Phase 8-A 설계) | 증빙제출자 지정 |

> ★ `(+)` 테이블은 DB_스키마.md 설계 완료, migration 파일 미작성 (Phase 7-C에서 실행 예정)

### 데이터 흐름 (확정)
```
ERP → 운영관리 > 부서·사원 관리 (원본 수신)
              ↓ Supabase departments / users
시스템관리 > 사용자·권한 (계정 설정·역할 배정)
```

### 마이그레이션 파일 위치
```
supabase/
├── migrations/
│   ├── 001_initial_schema.sql   ← 전체 DDL
│   ├── 002_rls_policies.sql     ← RLS (P1~P5)
│   └── 003_audit_triggers.sql   ← 변경이력 트리거
└── seeds/
    └── rcm_controls.sql         ← RCM 402건
lib/supabase.ts                  ← 클라이언트 + TS 타입
.env.local.example               ← 환경변수 템플릿
```

---

## 🏗️ Phase 6 UI 구현 현황 (미변경)

```
npm run build: 24페이지 정적 생성 ✅

/                    ← P1~P5 페르소나별 홈
/login
/operations/period   ← 3탭 (평가기간/부서사원★v7명칭미반영/결재선)
/operations/rcm      ← 3탭 (RCM지정/RCM관리/RCM부서Map)
/design/*            ← 4페이지 (준비중)
/op-eval/sampling    ← 6탭 (P5 단독)
/op-eval/evidence    ← ⭐⭐ 4탭 완전 구현
/op-eval/eval        ← 4탭
/op-eval/progress    ← 3탭
/approval/*          ← 3페이지
/results/status      ← 6탭
/settings/*          ← 5페이지 (v7 탭 통합 미반영)
```

✅ **UI v7 코드 반영 완료 (2026-06-10)**:
- `/operations/period` 탭명 `조직/권한` → `부서·사원` 변경 완료
- `/settings/users` → `사용자·권한` 탭 통합 완료 (사용자 관리 + 권한 설정 2탭)

---

## 🚀 Phase 8 현황 및 다음 가이드

### ✅ Phase 8-A 완료 산출물 (2026-06-02)
- `docs/데이터_운영방식.md` — 전체 42탭 운영방식 초안 (37탭 → 42탭으로 확장)
- `02_PJT계획/Smart-ICM_데이터운영방식_정의서_v1.xlsx` — 장한나 PL 기재본
- `02_PJT계획/Smart-ICM_데이터운영방식_정의서_v2.xlsx` — v1 분석 반영 세분화

### v2 엑셀 구성 (5시트)
| 시트 | 내용 | 핵심 액션 |
|------|------|----------|
| 탭별_운영방식 | 42탭 × 22컬럼 | **T열(미정/확인필요) 채우기** |
| 신규_테이블_정의 | 5개 신규 테이블 후보 | **F열 정의 필요 사항 채우기** ← DB설계 핵심 |
| 결재선_구조_상세 | 결재 단계 구조 | 검토 후 수정 |
| Status_전체_맵 | 전체 상태전이 | 검토 후 수정 |
| 작성 안내 | 작성 방법 가이드 | 참고용 |

### 🔑 DB 스키마 변경 예정 (2026-06-04 확정)

기존 `rcm_dept_map` → **두 테이블로 분리**:

| 테이블 | 역할 | 관리 위치 | 변경 권한 |
|--------|------|---------|---------|
| `rcm_default_owners` | 기본 담당자 (차수 없음) | 설계평가 > 통제수행자 지정 | P5 전용 |
| `rcm_term_assignments` | 차수별 담당자 | 샘플링작업 > 증빙제출자 지정 | P5 전용 |

- 차수 시작 시 `rcm_default_owners` → `rcm_term_assignments` 자동 승계
- 차수 변경: `is_override=true` 격리, 기본값 `original_p1_id` 유지
- RCM-부서 Map: **소프트게이트** (모집단 수신 하드차단 제거)

### 🎨 v8 메뉴 설계 미리보기 (2026-06-04 추가)
- **파일**: `public/preview-v8-design.html`
- **접속**: 개발서버 실행 후 `http://localhost:3000/preview-v8-design.html`
- **탭 구성**: ① 메뉴트리 비교 ② 사이드패널 UX 데모 ③ ERP 모니터링 ④ ERP/Excel 이중화 흐름
- ⚠️ M3(평가설정)·M4(연동설정) 미리보기 미구현 — 다음 세션에서 추가 예정

### v8 주요 변경 포인트 — 확정 상태 (2026-06-05 기준)

| # | 변경 | 내용 | 상태 |
|---|------|------|:----:|
| M1 | 홈 | 내 할일 완전 통합 — 홈이 실질 결재 처리 창구 | 🔜 방향 동의, 구성항목·디테일 수정 필요 |
| M2 | 결재관리 | 내 할일 탭 제거 → 상신함+결재함 2개만 | 🔜 방향 동의, 상신함·결재함 구성항목 수정 필요 |
| M3 | 시스템관리 | 평가설정 서브페이지 신설 (통제별평가기준·파일명규칙) | ⏳ 미확정 (미리보기 미구현, 미검토) |
| M4 | 시스템관리 | 연동설정 서브페이지 신설 (ERP API·AI검증 설정) | ⏳ 미확정 (미리보기 미구현, 미검토) |
| M5 | 평가기간 관리 | 차수 복사 기능 추가 | ⏳ 미확정 |
| M6 | RCM-부서 Map | 소프트게이트 확정 + 계획 뷰 역할 | ✅ 확정 (2026-06-04) |

> **M1/M2 후속 액션**: 홈화면 내 할일 카드 구성항목 + 결재관리 상신함·결재함 컬럼/흐름 디테일을 장한나 PL이 다음 세션에서 구체적으로 피드백 후 확정

### 🆕 신규 기능 요건 — 통합 엑셀 다운로드 (2026-06-05 추가)
> 제출된 증빙 + 평가의견을 1개의 엑셀 파일로 다운로드하는 기능

- **적용 위치**: 결과조회 > 평가 현황 > 평가증빙제출(ZIP) 탭 — "엑셀 다운로드" 버튼 추가
- **파일 구조**: Sheet1(모집단·샘플링 현황) + Sheet N(통제별 평가시트 — 증빙목록·AI검증결과·P3평가의견)
- **구현 방식**: Next.js API Route + ExcelJS
- **미확정 사항** (다음 세션에서 결정):
  - 시트 단위: 통제 1개당 1시트 vs 프로세스(FR/FA 등) 단위 통합
  - 기존 ZIP(감사패키지)과의 관계 — 병존 or 통합
- **DB 리스크 없음** — 기존 테이블 데이터 조회 후 출력, 스키마 변경 불필요

### 결재 처리 UX 확정 (2026-06-04)
- **방식**: 팝업 → **사이드 패널(Drawer)** 전환
- **흐름**: 홈 내할일 클릭 → 해당 탭 이동 → 리스트 → 통제 클릭 → 우측 패널 슬라이드
- **장점**: 리스트 유지, P2 연속 처리 클릭 1번, 파일·AI결과 충분한 공간

### ERP API 모니터링 구조 확정 (2026-06-04)
- **하이브리드**: 각 탭 분산형(평소) + 시스템관리 집중형(오류 대응)
- 각 탭 오류 메시지 → 링크 클릭 → 시스템관리 > ERP API 탭으로 이동

### 📋 다음 세션 작업 순서 (2026-06-10 업데이트)

**Step 0 — R3 Status 설계 방안 결정** (즉시 가능, 우선 순위 1)
- 5가지 방안 검토: A(분산개선)·B(하이브리드이벤트로그)·C(pipeline_stage)·D(상태머신설정화)·E(이벤트소싱)
- RISK_DECISION_LOG.md R3 항목 참조 + 장한나 PL 선택
- B안(하이브리드) 권장 — K-ICFR 규정감사 대응·확장성 최적

**Step 1 — R4~R9 HIGH 항목 나머지 검토** (즉시 가능)
- R4: 결재선 단계 구조 결정
- R5: 모집단-샘플 관계 결정
- R7: 트리거 vs 앱 레이어 변경이력 결정
- R8: 스냅샷 범위 결정 (부분 결정됨, 최종 확인)
- R9: 감사자 격리 방식 결정

**Step 2 — v8 메뉴 트리 확정** (장한나 PL 검토 후)
- M1/M2 홈화면·결재관리 구성항목 디테일 피드백 → 확정
- M3/M4 평가설정·연동설정 미리보기 추가 → 검토 후 확정
- M5 차수 복사 기능 확정
- 전체 확정 후 IA_DESIGN.md v8 반영

**Step 3 — DB 스키마 보완** (Claude)
- `rcm_default_owners` + `rcm_term_assignments` migration 파일 작성 (Phase 7-C)
- 기존 `rcm_dept_map` 마이그레이션 계획 수립
- R3 결정 반영 → Status 관련 테이블 업데이트

**Step 4 — Supabase CRUD 연동** (계정 수령 후)
- `.env.local` 설정 → 마이그레이션 001→002→003 실행
- 구현 우선순위: 평가기간 → RCM 관리(402건) → 부서·사원 → 증빙제출

### 🔑 대기 중인 외부 의존성
- **Supabase 계정**: 홍세민 PM 공용 계정 URL·KEY 수령
- **SAC API**: 이영호 차장 URL·KEY 수령 (Phase 9)

---

## 📁 핵심 파일 경로

```
.planning/
├── HANDOVER.md              ← 이 문서 (최종 수정 2026-06-09)
├── PLAN.md                  ← Phase 8-C-2 체크리스트 전체 완료
├── IA_DESIGN.md             ← v7 확정 (v8 미반영)
├── RISK_DECISION_LOG.md     ← DB/설계 리스크 분류 + 결정 이력
├── REQUIREMENTS.md          ← Phase 8-C-2 섹션 포함
└── VERIFICATION.md          ← 전체 PASS

docs/
├── UI_패턴.md               ← ★ 표준 컴포넌트 패턴 (신규 화면 전 반드시 확인)
└── DB_스키마.md             ← 15개 테이블 설계 마스터 (rcm owner 2분리 반영)

supabase/
├── migrations/001~003.sql
└── seeds/rcm_controls.sql

lib/supabase.ts
.env.local.example

app/
├── approval/
│   ├── inbox/page.jsx   ← ★ Phase 8-C-2 완료 (결재함 표준화)
│   └── sent/page.jsx    ← ★ Phase 8-C-1 완료 (상신함 표준화)
└── ... (24페이지)

components/
├── EvidenceViewer.jsx   ← ★ 표준 증빙 미리보기 모달 (크게보기/나란히비교 + 줌 + 전체화면)
├── ApprovalDrawer.jsx   ← ★ 표준 결재 사이드 패널 (clamp 폭)
├── evalTerms.js         ← ★ 전역 통제기간 셀렉터 (useEvalTerm)
├── FileViewer.jsx       ← ★ 신규 (Phase 8-C-2) — PDF·이미지·Excel·Word 통합 뷰어
├── FileUploader.jsx     ← ★ 신규 (Phase 8-C-2) — 드래그앤드롭 + Supabase onUpload 인터페이스
├── PdfViewer.jsx        ← react-pdf v7 재작성 (PdfPageViewer + PdfThumbnail)
├── AppLayout.jsx        ← 사이드바 (v7 명칭 미반영 — UI 탭명 수정 미완료)
└── SubPageTabs.jsx

01_PJT산출물/
├── Smart-ICM_메뉴구조_v6.xlsx
└── rcm_full_extracted.json   ← RCM 402건 시딩 소스
```

---

## ⚠️ 미해결 이슈 (2026-06-09 업데이트)

| # | 이슈 | 조치 | 우선순위 |
|---|------|------|:--------:|
| 1 | Supabase 계정 미수령 | 홍세민 PM 수령 → .env.local 설정 후 마이그레이션 | 🔴 외부 의존 |
| 2 | **v8 메뉴 트리 미확정** (M1·M2 디테일, M3·M4·M5) | 장한나 PL 검토 → 확정 | 🔴 설계 블로커 |
| 3 | **v2.1 엑셀 미작성** | Claude가 생성 가능 — 요청 시 즉시 | 🟠 DB 설계 선행 |
| 4 | ~~UI v7 코드 미반영~~ | ✅ 완료 (2026-06-10) | ✅ |
| 5 | **EvidenceViewer B안 실제 연동 미완료** | Supabase 계정 수령 후 `renderPage`+`renderThumbnail` 구현 | 🟡 Supabase 선행 |
| 6 | **통합 엑셀 다운로드 — 시트 단위·ZIP 관계 미확정** | 별도 세션 논의 | 🟡 |
| 7 | SAC API 미연결 | 이영호 차장 수령 (Phase 9) | 🔵 후속 Phase |
| 8 | 인증 없음 (로그인 UI만) | SAC 합의 후 일괄 적용 | 🔵 후속 Phase |
| 9 | 설계평가관리 미구현 | 별도 페이즈 | 🔵 후속 Phase |

---

## 🧩 핵심 운영 룰 (불변)

| # | 항목 | 내용 |
|---|------|------|
| 1 | **연결키** | TRANSACTION_ID (ERP ↔ Smart-ICM) |
| 2 | **모집단** | ERP 95% 자동 + 5% 엑셀 업로드 |
| 3 | **평가 모드** | 중간1·중간2·기말 (기말=샘플링 SKIP) |
| 4 | **통제 유형** | PLC / ITGC / ELC |
| 5 | **PLC 흐름** | P1→P2승인→AI검증→P3평가→P5확정 |
| 6 | **ITGC 흐름** | SAC자가평가→P5확인 (P2·P3 없음) |
| 7 | **예외 등급** | 🔵개선권고·🟡단순·🟠유의·🔴중요취약점 |
| 8 | **AI 역할** | 보조만 — 최종 판단은 사람 |

---

## 📞 팀 연락처

| 역할 | 이름 | 담당 |
|------|------|------|
| **PL (본인)** | 장한나 | Smart-ICM 전체 |
| PM | 홍세민 | 이노베이터 총괄, **Supabase 공용 계정** |
| SAC 총괄 | 이용철 부장 | ERP Track 2 |
| **SAC API** | **이영호 차장** | 서버·API (Phase 9 연동) |

---

## 🔗 외부 페이지

- [노션 프로젝트 페이지](https://www.notion.so/seohoo/35609b4dcd5781569b1ceae52d2ba49e)
- [장한나 개인 대시보드](https://www.notion.so/seohoo/PL-35609b4dcd5781f0bacdfd497a902014)
- [ERP Track 2 공용](https://www.notion.so/seohoo/AI-27a09b4dcd5780cb8b75c96e2a290f08)
