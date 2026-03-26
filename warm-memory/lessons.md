
---

## 2026-03-26 — Twitter/X 트윗 읽기 방법

**상황:** `x.com`, `fxtwitter.com` 모두 브라우저 렌더링 필요 또는 리다이렉트로 `web_fetch` 불가

**해결책:**
- `api.fxtwitter.com/{user}/status/{id}` → JSON API로 트윗 텍스트 + 미디어 URL 바로 반환
- 이미지는 `pbs.twimg.com` URL을 `image` 도구로 분석

**교훈:**
- 트위터 링크 받으면 바로 `web_fetch https://api.fxtwitter.com/...` 로 시작할 것
- `fxtwitter.com` (프론트) vs `api.fxtwitter.com` (API) 구분 필수

---

## 2026-03-26 — 완료 알림 전달 실패

**상황:** Claude Code 백그라운드 작업 완료 후 `openclaw system event --text "Done: ..." --mode now` 명령으로 알림 트리거를 걸었지만, 형한테 실제로 알림이 도달하지 않았다.

**원인 추정:**
- 완료 알림 명령이 Claude Code 내부에서 실행됐는지 미확인
- `openclaw system event` 가 실제로 Telegram 알림으로 이어지는지 검증 안 됨
- heartbeat 시스템 이벤트로 들어온 것인지 사용자 메시지로 온 것인지 구분 필요

**교훈:**
- 백그라운드 작업 완료 후 알림이 왔다고 확신하지 말 것
- 완료 이벤트가 heartbeat 채널로 들어왔을 때 → 사용자에게 직접 `message` 도구로 재알림 고려
- "알림 드렸어요"라고 말하기 전에 실제 전달 여부 확인 필요
