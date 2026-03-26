# HEARTBEAT.md — 지노 상시 체크리스트

_이 파일은 heartbeat 크론마다 읽힌다. 지금 당장 챙겨야 할 것만 적어둔다._

## 주의사항
- 비긴급 알림은 이른 아침(06:00 이전)에 억제
- 긴급 사항만 즉시 알림

## 현재 진행 중인 이슈
<!-- 형이 직접 업데이트 -->

## 블로그 버튼 콜백 처리
- `blog_approve_<slug>` 콜백 수신 시 → `/Users/astin/Projects/astinclaw-web/blog/_drafts/` 에서 해당 slug 파일 찾아서 HTML 변환 후 배포
- `blog_reject_<slug>` 콜백 수신 시 → "취소됐어!" 메시지 전송, draft 파일 삭제

## 시스템 상태 체크
- [ ] 크론 잡 정상 여부
- [ ] warm-memory 파일 접근 가능 여부
- [ ] jino-memory git 동기화 상태
