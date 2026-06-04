# Smart-ICM 새 채팅방 인계 문서 (Phase 7-B → Phase 8)
> 작성일: 2026-06-02 | Phase 8-A (데이터 운영방식 문서 정의) 완료 → Phase 8-B (UI v7 반영) + Phase 8-C (CRUD) 인계용
> 이 문서를 새 채팅방에서 Claude에게 보여주며 시작하세요.

---

## 📨 새 채팅방 시작 메시지 (복사·붙여넣기)

```
안녕하세요. 금강공업 Smart-ICM 내부회계관리시스템 프로젝트를 이어서 진행합니다.

프로젝트 경로: E:\AX_TEAM\P1_K-ICFR_SYSTEM_202605\

다음 순서대로 읽고 시작해주세요:
1. CLAUDE.md (프로젝트 컨텍스트)
2. .planning/HANDOVER.md (이 문서, 인계 마스터)
3. .planning/IA_DESIGN.md (v7 확정 IA)
4. docs/DB_스키마.md (14개 테이블 설계)

현재 상태: Phase 7-A (DB 스키마 설계) + Phase 7-B (IA v7 메뉴 확정) 완료.
다음 작업: Phase 8 — 운영관리·운영평가관리 탭별 데이터 운영방식 정의 + CRUD 연동.

먼저 위 문서들을 읽고, Phase 8 작업 계획을 보여주세요.
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

## 📍 현재 상태 — Phase 7-B 완료

### ✅ 완료 페이즈
- Phase 0~6: 2026-05-15 ~ 2026-05-22 완료 (UI 구축 + IA v6 확정)
- **Phase 7-A (Supabase DB 스키마 설계): 2026-06-01 완료** ⭐
- **Phase 7-B (IA v7 메뉴 구조 확정): 2026-06-01 완료** ⭐
- **Phase 8-A (데이터 운영방식 문서 정의): 2026-06-02 완료** ⭐

### 🔜 다음 페이즈
- **Phase 7-C**: Supabase 마이그레이션 실행 (홍세민 PM 계정 수령 후)
- **Phase 8-B**: UI v7 코드 반영 (탭명 2곳) ← **즉시 시작 가능**
- **Phase 8-C**: Supabase CRUD 연동 (v2 엑셀 작성 완료 + 계정 수령 후)
- Phase 9: SAC API 연동
- Phase 10: 검증 + 배포

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

## 🗄️ Phase 7-A 산출물 (DB 스키마)

### 14개 테이블 요약

| 테이블 | 설명 | IA 메뉴 |
|--------|------|---------|
| `eval_terms` | 평가기간 | 평가기간 관리 |
| `departments` | 부서 마스터 | 부서·사원 관리 |
| `users` | 사용자 | 사용자·권한 |
| `rcm_controls` | RCM 402건 | RCM 관리 |
| `rcm_dept_map` | RCM-부서 매핑 | RCM-부서 Map |
| `rcm_snapshots` | RCM 버전 락 | RCM 지정 |
| `populations` | 모집단 | 모집단 관리 |
| `samples` | 샘플링 결과 | 샘플링 작업 |
| `evidence_files` | 증빙 파일 | 증빙수집 |
| `evidence_submissions` | 증빙제출 워크플로우 | 증빙제출 수행/승인 |
| `op_evaluations` | 운영평가 수행 | 운영평가 수행 |
| `deficiencies` | 예외·미비점 4분류 | 예외보고·미비점 |
| `approvals` | 결재 워크플로우 | 결재관리 |
| `audit_logs` | 변경이력 | 시스템 로그 |

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

⚠️ **UI 코드에 v7 미반영 항목**:
- `/operations/period` 탭명 `조직/권한` → `부서·사원` 변경 필요
- `/settings/users` + `/settings/permissions` → `사용자·권한` 탭 통합 필요

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

### 📋 다음 세션 작업 순서

**Step 1 — v2 엑셀 작성 완료 후 업로드** (장한나 PL)
- T열(미정/확인필요) + 신규 테이블 정의 시트 F열 작성
- 작성 완료 후 새 채팅에서 파일 업로드

**Step 2 — DB 스키마 보완** (Claude)
- v2 엑셀 분석 → 신규 테이블 5개 DDL 추가
- `docs/DB_스키마.md` + `supabase/migrations/` 업데이트

**Step 3 — UI v7 코드 반영** (Claude, 즉시 가능)
- `components/AppLayout.jsx` 탭명 `조직/권한 관리` → `부서·사원 관리`
- `/settings/users` + `/settings/permissions` → `사용자·권한` 탭 통합

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
├── HANDOVER.md          ← 이 문서
├── IA_DESIGN.md         ← v7 확정
├── STATE.md             ← Phase 7-B 완료
├── ROADMAP.md           ← Phase 8 대기
├── REQUIREMENTS.md      ← v7 섹션 포함
└── VERIFICATION.md      ← 전체 PASS

docs/
└── DB_스키마.md          ← 14개 테이블 설계 마스터

supabase/
├── migrations/001~003.sql
└── seeds/rcm_controls.sql

lib/supabase.ts
.env.local.example

app/ (Next.js, 24페이지)
components/
├── AppLayout.jsx         ← v6 사이드바 (v7 명칭 미반영)
├── SubPageTabs.jsx
└── EvalTermToggle.jsx

01_PJT산출물/
├── Smart-ICM_메뉴구조_v6.xlsx
├── Smart-ICM_Evidence_Master_Improved.xlsx
└── rcm_full_extracted.json   ← RCM 402건 시딩 소스
```

---

## ⚠️ 미해결 이슈 (Phase 8 이관)

| # | 이슈 | 조치 |
|---|------|------|
| 1 | Supabase 계정 미수령 | 홍세민 PM 수령 → .env.local 설정 후 마이그레이션 |
| 2 | 탭별 데이터 운영방식 미정의 | Phase 8 첫 번째 작업 |
| 3 | UI v7 코드 미반영 (`부서·사원`, `사용자·권한` 탭) | Phase 8 빠른 수정 |
| 4 | SAC API 미연결 | 이영호 차장 수령 (Phase 9) |
| 5 | 인증 없음 (로그인 UI만) | SAC 합의 후 일괄 적용 |
| 6 | 설계평가관리 미구현 | 증빙제출 완료 후 별도 페이즈 |

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
