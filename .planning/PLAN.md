# 실행 계획 — Phase 8-C-2: 결재함(inbox) 표준화

> 작성일: 2026-06-09 | 근거: `.planning/REQUIREMENTS.md` Phase 8-C-2
> 범위: `app/approval/inbox/page.jsx` 단일 파일 전면 개편
> 전제: Supabase 미연동 → 더미 데이터 기준 UI 구현
> 참조 기준: `app/approval/sent/page.jsx` (동일 패턴)

---

## 전략

`inbox/page.jsx`를 `sent/page.jsx` 수준으로 끌어올린다.
두 파일이 공유하는 패턴(CTRL_POOL·useEvalTerm·EvidenceViewer·ApprovalDrawer)은 완전 일치해야 한다.
단일 파일 재작성이지만, 논리 레이어별 5단계로 분해하여 누락을 방지한다.

---

## 작업 분해 (T1 ~ T5)

### T1. 더미 데이터 레이어 구성
- **작업**:
  - `CTRL_POOL` 12건 (sent/page.jsx와 동일 배열 복사)
  - `BIZ` / `STATUSES` / `RESULTS` 배열 정의
  - `STATUS_BADGE` / `LINE_COLOR` / `RESULT_COLOR` 상수
  - `Array.from({ length: 40 }, ...)` 더미 행 생성
    - `apprStatus`: 대기 약 50% / 승인 30% / 반려 20%
    - `evidenceFiles`: `[{ name, size }]` 1~4건
    - `sample`: transactionId · popDesc · transactionDate · addInfo1 · addInfo2 · seq · method · totalPop
    - `ctrlDesc`, `evidenceReq`, `testProc`
    - `line`: 결재선 1~2단계 (상태별 분기)
    - `note`, `from`, `received`, `approvedAt`, `aiWarn`
- **산출물**: 파일 상단 데이터/상수 영역 완성
- **검증**: 40건 배열, evidenceFiles 필드 누락 없음

### T2. 상태 관리 + 이벤트 핸들러
- **작업**:
  - `useEvalTerm` import + `isClosed` 추출 (TERM 하드코딩 제거)
  - `filters` / `applied` / `pageSize` / `page` state
  - `preview` / `pvIdx` + `openPreview` / `closePreview` (EvidenceViewer용)
  - `selected` / `drawer` / `opinion` (기존 유지·확장)
  - `filtered` useMemo: 필터 조건 + 자연정렬 (업무구분 → 통제번호 localeCompare numeric)
  - `pageRows` 계산 (페이지 슬라이스)
  - `doSearch` / `reset` / `toggleAll` 핸들러
  - `approveOne` / `rejectOne`: isClosed 시 early return + 행 상태 업데이트
- **산출물**: 컴포넌트 함수 내 상태·계산 영역 완성
- **검증**: isClosed 게이트 핸들러에 반영 확인

### T3. 목록 영역 JSX
- **작업**:
  - 마감 안내 배너 (`isClosed && <Lock ...>`) — sent/page.jsx 동일 패턴
  - **필터 바**: 업무구분 / 통제번호(텍스트+Enter) / 결재상태 / 평가결과 + 조회/초기화
  - **요약 바**: 전체 N건 · 정상 N / 예외 N / 해당없음 N
  - **액션 바**:
    - 좌측: `[반려]` `[일괄 승인 (N건)]` + 선택 건수 표시
    - 우측: 건수범위 표시 → 표시개수 셀렉터(50/100/150/200) → `[엑셀저장]`
  - **테이블** 컬럼: 체크박스 / 업무구분 / 결재상태 / 통제번호+활동명 / 관련부서 / 평가자부서 / 평가결과 / 상신자 / 상신일시 / AI경고 / 결재일시
  - **페이지네이션**: 하단 중앙
- **산출물**: 목록 영역 JSX 완성
- **검증**: 40건 표시, 필터·정렬·페이지네이션 동작

### T4. ApprovalDrawer 패널 + EvidenceViewer
- **작업**:
  - **Footer** (상태별 분기):
    - 대기 + !isClosed: `[반려 (disabled=opinion없음)]` / `[승인]`
    - isClosed: `[🔒 마감된 통제기간 — 조회만 가능]`
    - 처리됨: 승인/반려 완료 메시지
  - **패널 본문 섹션 순서** (UI_패턴.md §2 기준):
    1. 기본정보 그리드 (업무구분·평가결과·관련부서·평가자부서·상신자·상신일시)
    2. AI경고 배너 (`aiWarn > 0` 조건부)
    3. `통제활동 내용` (ctrlDesc)
    4. `평가 증빙 요구사항` (evidenceReq)
    5. `테스트 절차` (testProc)
    6. `샘플링 정보` (기본 2줄 + 호버 상세 4줄)
    7. `상신의견` (note)
    8. `첨부 증빙` — 파일 목록(개별 미리보기+다운로드) + 헤더에 일괄저장/전체미리보기
    9. `결재현황` (line 테이블 + 의견)
    10. `결재의견` textarea (반려 필수 경고 문구 포함)
  - `EvidenceViewer` (패널 외부 렌더, `open={!!preview}`)
  - 반려 의견 필수 검증 문구: "반려하려면 의견을 반드시 입력해야 합니다"
- **산출물**: 드로어 + 뷰어 JSX 완성
- **검증**: 증빙 미리보기 모달 동작, opinion 없으면 반려 버튼 비활성

### T5. 빌드 검증
- **작업**: `npm run build` 실행, 경고/오류 해소
- **산출물**: 빌드 성공 로그
- **검증**: 경고 0건, /approval/inbox 라우트 정상 생성

---

## 리스크

| # | 리스크 | 등급 | 대응 |
|---|--------|:----:|------|
| 1 | EvidenceViewer 백드롭 가드 → 기존 컴포넌트 그대로 사용 | 🟢 | 컴포넌트 변경 금지 |
| 2 | sent와 inbox의 CTRL_POOL 중복 | 🟢 | 현재는 파일 내 상수 유지. 공통화는 다음 페이즈 |
| 3 | 더미에서 isClosed 항상 false → 마감 게이트 시각 확인 어려움 | 🟡 | 헤더 셀렉터에서 마감 기간 선택 시 확인 가능 |

---

## 의존성

- ✅ `components/EvidenceViewer.jsx` — Phase 8-C-1 완성 (변경 금지)
- ✅ `components/ApprovalDrawer.jsx` — Phase 8-C-1 완성 (변경 금지)
- ✅ `components/evalTerms.js` — Phase 8-C-1 완성 (변경 금지)
- ✅ `app/approval/sent/page.jsx` — 패턴 참조 기준
- ❌ Supabase 연동 없음 → 더미 데이터로 진행

---

## 체크리스트

- [x] T1: CTRL_POOL 12건 + 40건 더미 + evidenceFiles 1~4건
- [x] T2: useEvalTerm 연동 + 필터·페이지·preview 상태 + 자연정렬
- [x] T3: 필터바/요약/액션바/테이블/페이지네이션 JSX
- [x] T4: 패널 섹션 10종 + EvidenceViewer + 반려 의견 필수 검증
- [x] T5: npm run build 성공, 경고 0건

## 검증 결과 (2026-06-09)

| 항목 | 결과 |
|------|------|
| 40건 더미 목록 표시 | ✅ |
| 필터·요약·페이지네이션 | ✅ |
| 통제번호 클릭 → ApprovalDrawer 오픈 | ✅ |
| 패널 10섹션 (AI경고 포함) | ✅ |
| 결재현황 테이블 (1~2단계) | ✅ |
| 반려 의견 필수 검증 문구 | ✅ |
| EvidenceViewer 모달 (A4 플레이스홀더) | ✅ |
| renderThumbnail B안 — 미지정 시 기존 동작 유지 | ✅ |
