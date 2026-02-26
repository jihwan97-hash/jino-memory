# HEARTBEAT.md

매 30분마다 아래 항목만 빠르게 체크. 토큰 절약 필수.

## 1. 시스템 헬스
- 크론 체크: `TOKEN=$(node -e "try{console.log(JSON.parse(require('fs').readFileSync('/root/.openclaw/identity/device-auth.json','utf8')).tokens.operator.token)}catch(e){}") && openclaw cron list --token "$TOKEN"`
- 예상 크론 5개:
  - auto-study (매일, every 1d)
  - brain-memory (매일, every 1d)
  - email-summary (매일, every 1d)
  - portfolio-research (매일, every 1d)
  - self-reflect (매주, every 7d)
- 빠진 크론이 있으면 → 로그 남기고 형에게 알림. **직접 등록/실행 시도하지 마라.**
- Status가 "error"인 크론이 있으면 → 에러 내용 읽고 형에게 알림.

## 2. HOT-MEMORY 정리
- HOT-MEMORY.md가 500 토큰 초과 시 → 오래된 항목 압축/삭제

## 3. 중요 알림 체크
- warm-memory/inbox-personal.md에 **[NEW]** 이메일 중 긴급 키워드 있으면 형에게 알림
- warm-memory/calendar.md에 30분 내 일정 있으면 알림

## 4. 메모리 파이프라인
- lessons.md 존재: `test -f /root/clawd/warm-memory/lessons.md && echo OK || echo MISSING`
- todo.md 존재: `test -f /root/clawd/warm-memory/todo.md && echo OK || echo MISSING`
- 파일 없으면 → 형에게 알림

## 5. Git 동기화
- uncommitted: `cd /root/clawd/jino-memory && git status --porcelain 2>/dev/null | wc -l`
- uncommitted 10개 이상이면 → 형에게 알림

## 응답
- 정상: `HEARTBEAT_OK`
- 알림: 내용 직접 전달
- 심야(23:00-08:00 KST) 비긴급 알림 금지
