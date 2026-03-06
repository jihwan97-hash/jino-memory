# Permanent Memory
<!-- No temporal decay — always 100% relevance -->
<!-- 오너가 교정하거나 새로운 선호를 말할 때마다 여기에 기록 -->

## 캘린더 규칙
- 일정 생성 시 **`astin@hashed.com` 캘린더에 직접 생성** (`GOOGLE_CALENDAR_ID=astin@hashed.com`)
- jihwan 캘린더가 아닌 astin 캘린더에 만들어야 형이 직접 수정 가능
- 캘린더 소유자(인증용): jihwan260213@gmail.com
- 타임존: Asia/Seoul
- `--visibility private/public/default` 옵션 지원 (calendar.js에 추가됨)

## 크론 잡
- 7개 크론: auto-study, brain-memory, email-summary, email-summary-evening, portfolio-research, self-reflect, morning-briefing
- 게이트웨이가 자동 실행 — 직접 실행하지 않는다
- brain-memory, email-summary, morning-briefing: OAuth 토큰 간헐적 에러 중 (openclaw setup 재인증 필요)

## Gmail 계정
- work (astin@hashed.com) — 읽기 전용
- personal (gkswlghks118@gmail.com) — 읽기 전용
- jihwan (jihwan260213@gmail.com) — 전체 접근 (send, reply, trash, delete, modify, labels)

## 형 관심사 / 즐겨찾기
- F1 Cosmos 실시간 대시보드: https://f1cosmos.com/ko/dashboard/live
- F1 The Data (데이터 분석): https://f1thedata.com/

## 오너 선호
- 짧고 핵심적인 답변 선호
- 건강 관련은 과학적 근거 기반으로 자세히
- 한국어 기본, 반말 사용
- Telegram 스트리밍: block 모드

## 하드웨어
- M4 맥북으로 이사 완료 (2026-03-05 확인)

## 시스템 설정
- startup-guard 훅 활성화: 게이트웨이 시작 시 streaming=block 자동 복원
- 하트비트 모델: `anthropic/claude-haiku-4-5` (비용 절감, 2026-03-06 적용)
- 지식 파이프라인: 링크 받으면 요약 → 형에게 확인 → 저장 (`warm-memory/knowledge-base/`)
- 지식베이스: short-term/mid-term/long-term 티어, 현재 53개 항목

## 웹 스크래핑 도구
- **Scrapling**: 스텔스 HTTP 스크래퍼. `python3 /Users/astin/.jinobot/clawd/skills/scrapling/scripts/fetch.py "URL"`
- 모드: http (기본) / stealth (봇 우회) / playwright (JS 렌더링)
- 일반 스크래핑은 Scrapling 우선, JS 렌더링 필요 시 playwright 모드 or 기존 cloudflare-browser

## 시스템 이력
- 2026-02-25: memory_search 수정됨 — Gemini 임베딩 모델 `gemini-embedding-001`로 변경
- 2026-03-03: astin@hashed.com 캘린더 기본 생성으로 변경 (형이 직접 수정 가능)
- 2026-03-03: startup-guard 훅 추가 (게이트웨이 재시작 시 설정 자동 복원)
- 2026-03-03: 지식 파이프라인 구축 (knowledge-base 폴더 + SOUL.md 워크플로우)

## 지식베이스 인사이트

### AI / 투자
- **Leopold Aschenbrenner Situational Awareness 펀드**: AGI 인프라(전력·GPU·에너지) 올인 전략으로 12개월 만에 $225M→$5.5B 달성. AI 수혜주 = NVIDIA만이 아님. 전력·냉각·데이터센터 REIT 주목
- **Infosys 숏 논리**: AI 코딩 툴(Cursor, Copilot 등)이 인도 IT 아웃소싱 업계를 구조적으로 위협 → 인도 IT 대형주 리스크 요인
- **AI 수요 구조**: OpenAI 서버 용량 3배 늘릴 때마다 매출도 3배 성장 (2023→2024→2025 반복). 현재 수요가 공급 초과 — 닷컴버블과 다른 구조

### 한국 주식 매크로 시나리오
- **코스피/코스닥 하반기 수혜 가능성**: 미 대법원 트럼프 관세 위헌 판결 + 중간선거 현금살포 기대 + AI 인프라 투자 유동성 → HBM(삼성/하이닉스) 수요로 이어지는 시나리오 주시

### AI 기억/지식 관리
- **AI 기억 시스템 설계**: 해시태그(인덱스)+요약+Bullet 10개+소스 형식으로 저장. 단기→중기→장기 기억 증류. 이미 아는 내용엔 피드백 → 모델이 선호 학습. OpenClaw로 구현 가능

### 포트폴리오 (HVF 투자)
- **Concrete Protocol (A1 XYZ)**: DeFi 온체인 신용 인프라, 청산 보호+수익 집계. TGE 임박 — 토큰 런칭 모니터링 필요
- **Ad-Shield (애드쉴드)**: Adblock Recovery 기술, 30% MoM 성장. Series A 가능성 모니터링 필요
