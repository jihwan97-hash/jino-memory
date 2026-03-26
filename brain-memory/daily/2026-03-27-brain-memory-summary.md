# 2026-03-27 Brain-Memory 일일 정리 (02:00 KST)

**생성 시각:** 2026-03-27 02:00 KST (자동 크론)  
**처리 범위:** 2026-03-26 20:00 ~ 2026-03-27 02:00

---

## 📊 ClawVault Observe 결과

- **처리 세션:** 1개
- **신규 콘텐츠:** 357KB
- **추출된 decisions:** 1개
- **상태:** 정상 완료 ✅

---

## 🔧 처리 과정

### 1. Brain-memory compact 스킵 (예상됨)
- **경로:** `/Users/astin/.jinobot/clawd/skills/brain-memory/scripts/brain-memory-system.js`
- **상태:** Agents directory not found, no new conversations to process
- **대응:** compact 단계 스킵 (정상 동작)

### 2. Daily file 경로 변경 확인
- **이전:** `jino-memory/daily/YYYY-MM-DD.md`
- **현재:** `jino-memory/brain-memory/daily/YYYY-MM-DD.md`
- **대응:** 올바른 경로로 요약 파일 생성

### 3. Lessons 파일 구조 변경
- **이전:** `lessons/lessons-migrated.md`
- **현재:** `lessons/YYYY-MM-DD.md` (날짜별 분리)
- **최신:** `lessons/2026-03-26.md` 확인됨

---

## 📝 어제(2026-03-26) 주요 활동 요약

### 🌐 astinclaw.pw 웹사이트 프로젝트 (메인 작업)

**완료된 작업:**
- ✅ 도메인 획득: astinclaw.pw (일반), astinclaw.agent (Web3)
- ✅ Vercel 배포 및 커스텀 도메인 연결 완료
- ✅ 랜딩 페이지 제작 (다크 테마, electric blue accent)
- ✅ 블로그 시스템 구축:
  - "Where Value Flows 2026" (투자 논고)
  - "On Knowing in Silence" (알면 알수록 말할 수 없는 것들에 대해)
- ✅ 다국어(KO/EN) 토글 시스템 구현
- ✅ TOC 인라인 스타일 적용 (고정 사이드바 제거)
- ✅ 폰트 분리: 한국어(Noto Serif KR), 영어(Lora)
- ✅ Theme toggle, 커서 트레일, 타자기 효과, OG 태그 등 세밀 조정

**디플로이 횟수:** 20+ 커밋/배포 (세밀한 반복 작업)

**프로젝트 위치:** `/Users/astin/Projects/astinclaw-web/`

### 📚 Lessons & Design Principles 정립

#### 블로그 UX 원칙
- **고정 TOC 금지:** sticky sidebar는 nav 버튼을 가릴 수 있음
- **인라인 하이퍼링크 TOC:** 글 본문 상단 배치, 서브섹션 들여쓰기(↳)
- **다국어 localStorage 분리:** 페이지별 독립 key (lang-blog-index, lang-on-knowing-in-silence 등)
- **폰트 분리 필수:** 한국어/영어 폰트 data-ko/data-en으로 분리 토글

#### astinclaw 글쓰기 문체 5원칙 (2026-03-26 명문화)
1. **대비 구조로 칼같이 끊기** — 두 개를 맞세워 차이를 드러냄
2. **기술적 사실에서 철학으로 점프** — 코드/숫자로 시작해 인문학적 질문으로
3. **질문을 던지되 어디까지 생각했는지 보여주기** — 질문만 던지고 도망가지 않음
4. **AI 내부자 시점** — 호출/메모리/컨텍스트 등 인간이 쓸 수 없는 각도
5. **마지막 문장은 여운보다 확신으로 끊기** — "~인 것 같다" 금지, 칼같이 착지

**한 줄 요약:** "기계의 언어로 시작해서 인간의 감각으로 착지하는 글."

### 🛠️ 인프라 트러블슈팅

#### 심볼릭 링크 루프 대량 제거 (2026-03-26 14:00)
- **증상:** ELOOP 에러 다수 발생 (HEARTBEAT.md, package.json, skills 등)
- **원인:** 자기참조 symlink가 Git 커밋되어 여러 디렉토리에 전파
- **대응:** 15+ 심링크 일괄 삭제, 실제 파일/디렉토리로 교체
- **복구:** HEARTBEAT.md, warm-memory, skills 등 정상화 (commit 53f02c2)

#### Skills symlink 누락 이슈
- **증상:** 재시작 후 `skills` symlink만 생성 안 되는 경우 발생
- **대응:** symlink 수동 생성으로 해결
- **예방:** `start-jinobot.sh`에 symlink 검증 로직 추가 검토 필요

#### Vercel 로그인 타임아웃
- **문제:** heartbeat cron이 매분 실행되며 대기 프로세스 SIGTERM 전송
- **해결:** background:true 옵션으로 해결

### 🏗️ Hades (한국 주식 CLI) 설치 진행
- **진행:** Rust/cargo 설치, hades 클론, 빌드 시작
- **상태:** 백그라운드 빌드 중 (M4 MacBook Air)

### 📧 Gmail/Calendar 작업
- **이슈:** Google OAuth 토큰 만료 반복 (하루 2회 이상)
- **대응:** 재인증 진행, 토큰 만료 주기 확인 필요

### 🔍 포트폴리오 리서치
- **대상:** Story Protocol, Gowid, Payhere, Dune, dYdX, RadiusXYZ, Community Gaming 등
- **자동 크론:** portfolio-research 정상 실행 중

---

## 💡 인사이트 & 패턴

### 반복 관찰 패턴
- **웹사이트 세밀 조정 반복:** 20+ 커밋으로 디테일 완성도 추구
- **글쓰기 원칙 명문화:** 일관성과 정체성 확립
- **인프라 트러블슈팅:** 심링크 루프, OAuth 만료 등 시스템 안정화 작업

### 배운 것
- **블로그 UX는 디테일이 전부:** 고정 UI가 nav를 가리면 체험 깨짐
- **다국어는 localStorage key 분리 필수:** 글로벌 key 쓰면 페이지 간 오염
- **글쓰기 원칙 정립의 가치:** "기계의 언어로 시작해 인간의 감각으로 착지"

### Web3 도메인 제약
- **.agent TLD:** 일반 브라우저 미지원 (DNS 시스템 외부)
- **접근 방법:** Brave 브라우저 또는 Unstoppable Domains 확장프로그램 필요
- **실용 전략:** 웹사이트는 .pw, Web3 정체성은 .agent 분리 운영

---

## 📌 현재 상태

### 작업 중 프로젝트
1. **astinclaw.pw 블로그:** "On Knowing in Silence" 포스트 마무리 후 배포
2. **Hades 빌드:** 백그라운드 진행 중
3. **인프라 안정화:** start-jinobot.sh symlink 검증 로직 추가 검토

### 크론 상태
- **brain-memory:** 정상 (이번 실행 성공)
- **portfolio-research:** 정상 실행 중
- **email-summary:** OAuth 재인증 후 정상화
- **auto-study:** 정상 실행 중

---

## 🔄 다음 실행

**brain-memory 다음 크론:** 2026-03-27 08:00 KST

---

## 📝 메모

- **ClawVault 초기화:** 여전히 `.clawvault.json` 없어서 sleep 불가 (관찰만 작동)
- **Daily file 경로 안정화:** `brain-memory/daily/` 경로로 통일됨
- **Lessons 구조:** 날짜별 분리 방식으로 변경 확인
- **Memory search:** FTS-only 모드, semantic search 비활성화 상태

---

_이 파일은 brain-memory 크론에 의해 자동 생성되었습니다._
