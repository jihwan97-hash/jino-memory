# Learnings

## [LRN-20260305-002] 캘린더 생성 시 GOOGLE_CALENDAR_ID 환경변수 항상 명시
- **패턴:** `--calendar astin@hashed.com` 플래그 줘도 primary(jihwan) 캘린더에 생성됨. 가스점검, 소개팅 2건 모두 같은 실수.
- **R(재발):** 2 | **C(확인):** 2 | **D(반증):** 0
- **원인:** `--calendar` 플래그는 calendar.js에서 무시됨. 환경변수 `GOOGLE_CALENDAR_ID=astin@hashed.com`만 작동.
- **교훈:** 캘린더 생성/수정 명령어 앞에 **항상** `GOOGLE_CALENDAR_ID=astin@hashed.com` 붙이기. 예외 없음.

## [LRN-20260305-001] calendar.js — --calendar, --visibility 플래그 미구현 버그
- **패턴:** `--calendar astin@hashed.com` 줘도 primary에 생성, `--visibility private` 줘도 default로 생성
- **R(재발):** 1 | **C(확인):** 1 | **D(반증):** 0
- **원인:** calendar.js createEvent가 `GOOGLE_CALENDAR_ID` 환경변수만 읽고 `--calendar` 플래그는 무시. `body.visibility` 코드 자체가 없었음.
- **수정:** `--visibility` → `body.visibility` 반영 추가. `--calendar` → `GOOGLE_CALENDAR_ID=xxx` 환경변수로 전달해야 함.
- **교훈:** astin 캘린더에 만들 때는 `GOOGLE_CALENDAR_ID=astin@hashed.com` 앞에 붙이기. 비공개는 `--visibility private`.

## [LRN-20260304-002] 캘린더 종일 일정은 --allday 플래그 + date 형식
- **패턴:** "종일로 만들어줘" 요청 시 시간 포함 일정(09:00~23:00)으로 생성
- **R(재발):** 1 | **C(확인):** 1 | **D(반증):** 0
- **교훈:** 종일 일정은 `--allday` 플래그, start/end는 `YYYY-MM-DD` 형식 (T 없이). end는 다음날 날짜. calendar.js에 allday 지원 추가 완료.
- **적용:** "종일", "하루종일", "all day" 키워드 나오면 무조건 --allday 사용

## [LRN-20260304-001] 설치 전 검증 먼저, 불필요하면 솔직히 말하기
- **패턴:** 새 스킬/플러그인을 검증 없이 설치 → 기존 시스템과 중복 → 결국 제거
- **R(재발):** 1 | **C(확인):** 1 | **D(반증):** 0
- **교훈:** 설치 전 "기존에 이미 있는 기능인가?" 먼저 체크. 없어도 잘 돌아가면 없어도 됨. 검증 못 하면 솔직하게 말하기.
- **적용:** 앞으로 뭔가 추가 제안할 때 먼저 "이거 없어도 돼" 가능성 언급
