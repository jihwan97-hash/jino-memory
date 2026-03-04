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

## 오너 선호
- 짧고 핵심적인 답변 선호
- 건강 관련은 과학적 근거 기반으로 자세히
- 한국어 기본, 반말 사용
- Telegram 스트리밍: block 모드

## 시스템 설정
- startup-guard 훅 활성화: 게이트웨이 시작 시 streaming=block 자동 복원
- 지식 파이프라인: 링크 받으면 요약 → 형에게 확인 → 저장 (`warm-memory/knowledge-base/`)
- 지식베이스: short-term/mid-term/long-term 티어, 현재 53개 항목

## 웹 스크래핑 도구
- **Scrapling**: 스텔스 HTTP 스크래퍼. `python3 /root/clawd/skills/scrapling/scripts/fetch.py "URL"`
- 모드: http (기본) / stealth (봇 우회) / playwright (JS 렌더링)
- 일반 스크래핑은 Scrapling 우선, JS 렌더링 필요 시 playwright 모드 or 기존 cloudflare-browser

## 시스템 이력
- 2026-02-25: memory_search 수정됨 — Gemini 임베딩 모델 `gemini-embedding-001`로 변경
- 2026-03-03: astin@hashed.com 캘린더 기본 생성으로 변경 (형이 직접 수정 가능)
- 2026-03-03: startup-guard 훅 추가 (게이트웨이 재시작 시 설정 자동 복원)
- 2026-03-03: 지식 파이프라인 구축 (knowledge-base 폴더 + SOUL.md 워크플로우)
