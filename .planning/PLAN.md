# Phase 6 실행 계획 — AppLayout v6 교체 + 페이지 내 3단 탭 구축

> 작성일: 2026-05-22 | 근거: `.planning/REQUIREMENTS.md` Phase 6
> IA 기준: `.planning/IA_DESIGN.md` v6 (확정)
> 결정 사항: D1 구버전 삭제 / D2 설계평가관리 회색+준비중 / D3 헤더 드롭다운 / D4 증빙제출 우선

---

## 전체 구조 한눈에

```
T1  AppLayout.jsx v6 교체          ← 사이드바 1+2단, 차수 토글, 준비중 배지
T2  공통 컴포넌트 2종 신규          ← SubPageTabs.jsx + EvalTermToggle.jsx
T3  운영관리 그룹                   ← operations/period + operations/rcm (6 탭)
T4  설계평가관리 그룹               ← design/* 4 서브페이지 placeholder (9 탭)
T5  운영평가관리 그룹 ⭐⭐          ← op-eval/* 4 서브페이지 (18 탭, 증빙제출 완성도)
T6  결재·결과·시스템 그룹           ← approval/*(3) + results/status(6탭) + settings/*(5)
T7  홈 화면 5종                    ← 헤더 드롭다운 P1~P5 + 페르소나별 카드
T8  구버전 삭제 + 빌드 검증         ← 기존 20개 파일 제거, npm run build 성공
```

---

## T1 — AppLayout.jsx v6 교체

**산출물**: `components/AppLayout.jsx` (전면 교체), `components/AppLayout.v4.bak.jsx` (백업)

### 사이드바 구조
```
[접힘 시]  w-16 — 아이콘만 (그룹 단위)
[펼침 시]  w-64 — 1단 그룹 레이블 + 2단 서브페이지 accordion

1단 그룹 6개:
  🏠 홈                                   (항상 상단 고정, 단일 링크)
  1️⃣ 운영관리                             → accordion → 평가관리 / RCM관리
  2️⃣ 설계평가관리  [회색 + 준비중 배지]    → 클릭 비활성
  3️⃣ 운영평가관리                          → accordion → 샘플링작업 / 증빙제출 / 운영평가 / 진행관리
  4️⃣ 결재관리                              → accordion → 내 할일 / 상신함 / 결재함
  5️⃣ 결과조회                              → accordion → 평가 현황
  6️⃣ 시스템관리                            → accordion → 사용자 / 권한 / 로그 / 증빙 로그 / 환경설정
```

### 헤더 구조
```
좌: [로고] | [구분선] | [페이지 제목]
우: [차수 토글 — 운영평가관리·결과조회 진입 시만 노출] | [ERP 상태] | [알림] | [페르소나 드롭다운(개발용)] | [사용자]
```

### 구현 세부
- `pathname`으로 현재 그룹 자동 감지 → 해당 accordion 자동 펼침
- 그룹 아이콘 클릭 → accordion 토글 (다른 그룹 닫힘)
- 사이드바 상태 `localStorage` 영속 (기존 유지)
- 설계평가관리: `cursor-not-allowed`, `opacity-50`, `"준비중"` cyan 배지

**검증 기준**:
- [ ] 6개 그룹 accordion 동작
- [ ] pathname 자동 활성화
- [ ] 설계평가관리 클릭 차단
- [ ] 접힘/펼침 애니메이션 정상

---

## T2 — 공통 컴포넌트 2종 신규

### SubPageTabs.jsx
**산출물**: `components/SubPageTabs.jsx`

```jsx
// props 인터페이스
{
  tabs: [{ id: string, label: string, badge?: string }],
  activeTab: string,
  onChange: (id: string) => void
}
```

- 탭 활성: `border-b-2 border-blue-600 text-blue-700 font-semibold`
- 탭 비활성: `text-gray-500 hover:text-gray-700`
- URL search param 연동: `?tab=xxx` (useSearchParams + router.push)
- 배지 지원: RCM 지정 ⭐ 등

### EvalTermToggle.jsx
**산출물**: `components/EvalTermToggle.jsx`

```jsx
// props 인터페이스
{ value: '중간1' | '중간2' | '기말', onChange: (v) => void }
```

- 세그먼트 버튼 3개: `중간 1차` / `중간 2차` / `기말`
- Primary: `bg-blue-600 text-white` / 비활성: `bg-gray-100 text-gray-600`
- AppLayout 헤더에 삽입 (운영평가관리·결과조회 그룹 진입 시만 조건부 렌더)

**검증 기준**:
- [ ] SubPageTabs: URL 파라미터 연동 동작
- [ ] EvalTermToggle: 3 상태 토글 정상
- [ ] 스타일가이드 토큰(blue-600, gray-50 등) 준수

---

## T3 — 운영관리 그룹 (operations/)

**산출물**: 2개 파일

### app/operations/period/page.jsx (평가관리)
탭 3개:
| 탭 | 설명 |
|---|------|
| 평가기간 관리 | 통제기간 등록·차수별 마감. 테이블 + 등록 버튼 UI |
| 조직/권한 관리 | ERP API 수신 안내 배너 + 부서·사원 목록 테이블 |
| 결재선 관리 | 엑셀 업로드 UI + 결재선 목록 테이블 |

### app/operations/rcm/page.jsx (RCM관리)
탭 3개:
| 탭 | 설명 |
|---|------|
| RCM 지정 ⭐⭐ | 현재 RCM 버전·락 상태 표시. "RCM 지정 실행" 버튼 |
| RCM 관리 | PLC / ITGC / ELC 상단 필터 탭 + 엑셀 업/다운로드 버튼 |
| RCM-부서 Map | 통제-부서 매핑 테이블 + 엑셀 업로드 |

**검증 기준**:
- [ ] SubPageTabs 탭 전환 정상
- [ ] URL ?tab= 파라미터 연동
- [ ] 각 탭 placeholder 콘텐츠 존재

---

## T4 — 설계평가관리 그룹 (design/) — Placeholder

**산출물**: 4개 파일 (모두 "구현 예정" placeholder 수준)

> 사이드바에서 준비중 배지로 접근 불가이나, 직접 URL 진입 시 placeholder 표시

| 파일 | 탭 | 비고 |
|---|---|---|
| `design/prep/page.jsx` | 검토요청관리 / 통제수행자 지정 / 설계평가자 지정 | 3탭 |
| `design/self/page.jsx` | 자체평가 수행 / 자체평가 승인 | 2탭 |
| `design/eval/page.jsx` | 설계평가 수행 / RCM 확정 | 2탭 |
| `design/progress/page.jsx` | 자체평가 현황 / 설계평가 현황 | 2탭 |

각 페이지: SubPageTabs + "설계평가관리 구현 예정" 안내 카드

**검증 기준**:
- [ ] 4개 파일 빌드 성공
- [ ] SubPageTabs 정상 렌더

---

## T5 — 운영평가관리 그룹 (op-eval/) ⭐⭐

**산출물**: 4개 파일

### app/op-eval/sampling/page.jsx (샘플링작업) — P5 전용
탭 6개 (placeholder):
`모집단 관리 / 샘플링 작업 / 샘플링 현황 / 증빙요청관리 / 증빙제출자 지정 / 운영평가자 지정`

- 상단 "P5 전용 기능" 정보 배너
- EvalTermToggle 표시

### ⭐⭐ app/op-eval/evidence/page.jsx (증빙제출) — 완성도 구현

**탭 4개 전체 완성도 있게 구현**:

**[탭1] 증빙수집**
```
- EvalTermToggle (상단)
- 통제 목록 테이블: CTRL_NO / 통제명 / 모집단수 / 자동수집 / 수동업로드 / 상태
- 상태 배지: AUTO_COLLECTED(초록) / MANUAL_UPLOADED(파랑) / 대기(회색)
- "ERP 동기화" 버튼 (더미)
```

**[탭2] 증빙AI 검증**
```
- AI 검증 현황 요약 카드 3개: 검증완료 / 경고 / 오류
- 통제별 AI 검증 결과 목록 (더미 데이터)
  - 첨부 누락 / 날짜 불일치 / 금액 불일치 / 승인라인 누락 경고 표시
- 상세 패널 (우측): 선택한 통제의 AI 검증 상세
```

**[탭3] 증빙제출 수행 ⭐** (P1 핵심 화면)
```
레이아웃: 좌측 목록(40%) + 우측 상세(60%) 2단 분할

[좌측] 내 담당 통제 목록
  - 통제코드 / 통제명 / 마감일 / 상태 배지
  - 상태: 작성 / 상신 / 결재중 / 완료 / 반려(빨강)
  - 반려 건: 상단 빨강 배너 강조

[우측] 선택한 통제 상세
  - 통제 정보 헤더 (CTRL_NO, 통제명, 모집단 수)
  - TRANSACTION_ID 목록 (샘플 목록)
  - 증빙 파일 업로드 영역 (drag-and-drop UI)
  - AI 검증 결과 인라인 표시 (경고 있을 시 주황 배너)
  - 증빙 제출 의견 textarea
  - [저장] [상신] 버튼
  - 기말평가 모드: "12/31 기준 최신 증빙 우선" 안내
```

**[탭4] 증빙제출 승인** (P2 화면)
```
- 부서원별 제출 현황 테이블
- 일괄 승인 체크박스 + [일괄 승인] [반려] 버튼
- AI 검증 결과 미리보기 컬럼
- 결재선 자동 적용 안내
```

### app/op-eval/eval/page.jsx (운영평가) — 세부 골격
탭 4개:
| 탭 | 주요 UI |
|---|------|
| 운영평가 수행 | 좌측 목록 + 우측 🟢🟡⚪ 판정 패널 + AI Draft 박스 |
| 예외보고 수행 | 예외 등급 4분류 선택 + 상세 의견 textarea |
| 예외보고 관리 | 예외 현황 집계 테이블 + 등급별 필터 |
| 미비점 검토 | 미비점 이력 테이블 (🔵🟡🟠🔴 등급별) |

### app/op-eval/progress/page.jsx (진행관리)
탭 3개 (집계 테이블 placeholder):
`증빙제출 현황 / 운영평가 현황 / 예외보고 현황`

**검증 기준**:
- [ ] 증빙제출 수행 탭: 2단 레이아웃 렌더
- [ ] Status 배지 5종 모두 스타일 정상
- [ ] 파일 업로드 영역 UI 존재
- [ ] AI 검증 패널 인라인 표시
- [ ] EvalTermToggle 연동

---

## T6 — 결재·결과·시스템 그룹

**산출물**: 9개 파일

### 결재관리 (approval/)
| 파일 | 설명 |
|---|------|
| `todo/page.jsx` | 내 할일 목록 (결재 대기·반려·재제출 통합). 상태 배지 |
| `sent/page.jsx` | 상신함 — 내가 상신한 결재 목록 + 취소 버튼 |
| `inbox/page.jsx` | 결재함 — 결재 대기 목록 + 일괄 승인/반려 |

### 결과조회 (results/)
`results/status/page.jsx` — 탭 6개:
| 탭 | 설명 |
|---|------|
| 평가현황 | 통제별 🟢🟡⚪ 분포 차트(더미) + 테이블 |
| 진행현황 | 통제별 Status 진행 테이블 |
| 통제이력 | 통제별 평가결과·변경이력 (P4 핵심) |
| 평가통계 | 프로세스·부서별 통계 (더미 차트) |
| 평가증빙제출(ZIP) | ZIP 다운로드 버튼 + 파일 트리 목록 |
| 결과보고 | 보고서 목록 + PDF 다운로드 버튼 |

### 시스템관리 (settings/)
| 파일 | 설명 |
|---|------|
| `users/page.jsx` | 사용자 목록 테이블 + 계정 등록/수정 |
| `permissions/page.jsx` | 역할×메뉴 권한 매트릭스 테이블 |
| `log/page.jsx` | 시스템 접근·변경 로그 테이블 |
| `evidence-log/page.jsx` | P4 파일 다운로드 추적 로그 |
| `env/page.jsx` | 코드·이미지·알림 파라미터 설정 폼 |

**검증 기준**:
- [ ] 9개 파일 빌드 성공
- [ ] results/status SubPageTabs 6탭 전환 정상

---

## T7 — 홈 화면 5종 (app/page.jsx)

**산출물**: `app/page.jsx` 전면 교체

### 헤더 드롭다운 (개발용 페르소나 토글)
```
현재 사용자명 옆 → [P1 통제수행자 ▼] 드롭다운
선택: P1 / P2 / P3 / P4 / P5
→ useState로 관리, 선택에 따라 홈 콘텐츠 분기
```

### 페르소나별 홈 레이아웃

**P1 통제수행자 홈**
- 헤더 인사 + 반려 빨강 배너
- 큰 카드: 운영평가 증빙 제출 N건 / 자체평가 작성 N건
- 작은 카드 2개: 내 할일 / 내 진행 상태

**P2 통제책임자 홈**
- 큰 카드: 부서 증빙제출 승인 대기 N건 (AI 검증 미리보기 포함)
- 큰 카드: 부서 자체평가 승인 대기 N건
- 중간 카드: 우리 부서 진행률 / 예외·미비점

**P3 내부회계평가자 홈** (2분할 대시보드 ⭐)
```
╔══════════════════╦══════════════════╗
║ 담당자 수행(P1)   ║ 평가자 수행(P3)   ║
║ 내 증빙 제출 N건  ║ TF 운영평가 N건   ║
╚══════════════════╩══════════════════╝
```

**P4 감사인·감사위원회 홈**
- "감사인 모드" 워터마크 배너
- KPI 3종 카드: 전사 완료율 / 미비점 건수 / 평가 결과 분포
- 허용된 영역 진입 카드 3개: RCM 조회 / 평가현황 / ZIP 다운로드

**P5 내부회계팀 홈**
- 차수 토글 + KPI 6종
- PLC/ITGC 통제 유형별 진행률
- 빠른 액션 9개 버튼

**검증 기준**:
- [ ] P1~P5 전환 드롭다운 동작
- [ ] 5종 레이아웃 각각 렌더 정상
- [ ] P3 2분할 레이아웃 정상

---

## T8 — 구버전 삭제 + 빌드 검증

**산출물**: 빌드 성공 + 구버전 파일 없음

### 삭제 대상 (구버전 라우팅 20개)
```
app/scoping/        app/elc/            app/attachments/
app/population/     app/evidence/       app/period/
app/rcm/            app/design/         (구버전 단일 파일)
app/operations/     (구버전 단일 파일 — op-eval/로 이전)
app/approval/sent   app/approval/inbox  (구버전 → v6 재생성)
app/reports/
```

> ⚠️ T3~T7 완료 후 삭제 실행 (의존성 역순)

### 빌드 검증
```bash
npm run build
# 성공 기준: exit 0, 경고 최소화
```

**검증 기준**:
- [ ] `npm run build` exit 0
- [ ] 구버전 경로 파일 없음
- [ ] 전체 페이지 수: 30+ (v6 구조)

---

## 리스크 & 완충

| # | 리스크 | 대응 |
|---|------|------|
| R1 | AppLayout accordion 상태 관리 복잡 | pathname 파싱으로 그룹 자동 감지 (useEffect) |
| R2 | Tailwind v4 class purge 오류 | 동적 클래스 주의, 필요 시 safelist |
| R3 | 기존 파일 삭제 시 import 오류 | T8을 마지막에 실행, build로 검증 후 삭제 |
| R4 | 증빙제출 수행 2단 레이아웃 모바일 깨짐 | Phase 6 비범위 — 데스크톱 우선 |

---

## 의존성 순서 (실행 순)

```
T1 (AppLayout) → T2 (공통 컴포넌트) → T3~T6 (페이지들) → T7 (홈) → T8 (삭제+빌드)
                      ↑
              T3~T6 모두 T2에 의존
```

---

## 산출물 요약

| 단계 | 신규/교체 파일 수 | 핵심 |
|-----|:---:|------|
| T1 | 1 (교체) | AppLayout.jsx v6 |
| T2 | 2 (신규) | SubPageTabs.jsx, EvalTermToggle.jsx |
| T3 | 2 (신규) | operations/* |
| T4 | 4 (신규) | design/* placeholder |
| T5 | 4 (신규) | op-eval/* (증빙제출 완성도) |
| T6 | 9 (신규) | approval/*, results/*, settings/* |
| T7 | 1 (교체) | app/page.jsx |
| T8 | -20 (삭제) | 구버전 라우팅 제거 |
| **합계** | **+23 / -20** | **순증 +3, v6 완전 전환** |
