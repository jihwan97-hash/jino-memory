# TOOLS.md - Local Notes

## Google Calendar

### 사용법

**캘린더 확인:**
```bash
node /Users/astin/.jinobot/clawd/skills/google-calendar/scripts/calendar.js list --days 1
```

**일정 생성:**
```bash
node /Users/astin/.jinobot/clawd/skills/google-calendar/scripts/calendar.js create --title "제목" --start "YYYY-MM-DDTHH:MM" --end "YYYY-MM-DDTHH:MM"
```

### 타임존
- API: UTC 입력/출력
- Display: Asia/Seoul (KST = UTC+9)

## Browser (항상 사용 가능 — 설정 필요 없음)

- Screenshot: `node skills/cloudflare-browser/scripts/screenshot.js <URL> <output>`
- Read page: `node skills/cloudflare-browser/scripts/read-page.js <URL>`

## Web Research

```bash
node /Users/astin/.jinobot/clawd/skills/web-researcher/scripts/research.js "query" --fetch
```

## Google Calendar
- 일정 확인: `read` tool로 `/Users/astin/.jinobot/clawd/warm-memory/calendar.md` 읽기
- 일정 생성: `exec` tool로 `node /Users/astin/.jinobot/clawd/skills/google-calendar/scripts/calendar.js create --title "제목" --start "YYYY-MM-DDTHH:MM" --end "YYYY-MM-DDTHH:MM" --attendees "email"`
- freebusy: `exec` tool로 `node /Users/astin/.jinobot/clawd/skills/google-calendar/scripts/calendar.js freebusy --start "..." --end "..." --emails "email"`
- 검색: `exec` tool로 `node /Users/astin/.jinobot/clawd/skills/google-calendar/scripts/calendar.js search --query "검색어"`
- 수정: `exec` tool로 `node /Users/astin/.jinobot/clawd/skills/google-calendar/scripts/calendar.js update --id EVENT_ID`
- 삭제: `exec` tool로 `node /Users/astin/.jinobot/clawd/skills/google-calendar/scripts/calendar.js delete --id EVENT_ID`

## Gmail (3 accounts)
- **최신 동기화**: `exec` tool로 `node /Users/astin/.jinobot/clawd/skills/gmail/scripts/sync-inbox.js` 실행
### 회사 (astin@hashed.com) - 읽기 전용
- 확인: `read` tool로 `/Users/astin/.jinobot/clawd/warm-memory/inbox.md`
- 상세: `exec` tool로 `node /Users/astin/.jinobot/clawd/skills/gmail/scripts/gmail.js read --id MSG_ID --account work`
- 검색: `exec` tool로 `node /Users/astin/.jinobot/clawd/skills/gmail/scripts/gmail.js search --query "검색어" --account work`
### 개인 (gkswlghks118@gmail.com) - 읽기 전용
- 확인: `read` tool로 `/Users/astin/.jinobot/clawd/warm-memory/inbox-personal.md`
- 상세: `exec` tool로 `node /Users/astin/.jinobot/clawd/skills/gmail/scripts/gmail.js read --id MSG_ID --account personal`
### jihwan (jihwan260213@gmail.com) - 전체 제어
- 확인: `read` tool로 `/Users/astin/.jinobot/clawd/warm-memory/inbox-jihwan.md`
- 보내기: `exec` tool로 `node /Users/astin/.jinobot/clawd/skills/gmail/scripts/gmail.js send --to "수신자" --subject "제목" --body "내용" --account jihwan`
- 답장: `exec` tool로 `node /Users/astin/.jinobot/clawd/skills/gmail/scripts/gmail.js reply --id MSG_ID --body "내용" --account jihwan`

## Browser (Playwright Chromium)
- 웹페이지 읽기: `exec` tool로 `node /Users/astin/.jinobot/clawd/skills/cloudflare-browser/scripts/read-page.js "URL" --max-chars 5000`
- 스크린샷: `exec` tool로 `node /Users/astin/.jinobot/clawd/skills/cloudflare-browser/scripts/screenshot.js "URL" /tmp/screenshot.png`
- JS 렌더링 SPA 사이트도 읽기 가능. 브라우저 필요 시 자동 실행, 작업 후 자동 종료.

## Notion API
- API 키: `/Users/astin/.jinobot/.notion.env` 에서 읽기
- 페이지 검색: `curl -s -X POST https://api.notion.com/v1/search -H "Authorization: Bearer $NOTION_API_KEY" -H "Notion-Version: 2022-06-28" -d '{"query":"검색어"}'`

## Gemini AI
- 텍스트 생성: `exec` tool로 `node /Users/astin/.jinobot/clawd/skills/gemini/scripts/gemini.js generate --prompt "프롬프트"`
- 파일 요약: `exec` tool로 `node /Users/astin/.jinobot/clawd/skills/gemini/scripts/gemini.js summarize --file /path/to/file.md`

## Google Calendar
- 일정 확인: `read` tool로 `/Users/astin/.jinobot/clawd/warm-memory/calendar.md` 읽기
- 일정 생성: `exec` tool로 `node /Users/astin/.jinobot/clawd/skills/google-calendar/scripts/calendar.js create --title "제목" --start "YYYY-MM-DDTHH:MM" --end "YYYY-MM-DDTHH:MM" --attendees "email"`
- freebusy: `exec` tool로 `node /Users/astin/.jinobot/clawd/skills/google-calendar/scripts/calendar.js freebusy --start "..." --end "..." --emails "email"`
- 검색: `exec` tool로 `node /Users/astin/.jinobot/clawd/skills/google-calendar/scripts/calendar.js search --query "검색어"`
- 수정: `exec` tool로 `node /Users/astin/.jinobot/clawd/skills/google-calendar/scripts/calendar.js update --id EVENT_ID`
- 삭제: `exec` tool로 `node /Users/astin/.jinobot/clawd/skills/google-calendar/scripts/calendar.js delete --id EVENT_ID`

## Gmail (3 accounts)
- **최신 동기화**: `exec` tool로 `node /Users/astin/.jinobot/clawd/skills/gmail/scripts/sync-inbox.js` 실행
### 회사 (astin@hashed.com) - 읽기 전용
- 확인: `read` tool로 `/Users/astin/.jinobot/clawd/warm-memory/inbox.md`
- 상세: `exec` tool로 `node /Users/astin/.jinobot/clawd/skills/gmail/scripts/gmail.js read --id MSG_ID --account work`
- 검색: `exec` tool로 `node /Users/astin/.jinobot/clawd/skills/gmail/scripts/gmail.js search --query "검색어" --account work`
### 개인 (gkswlghks118@gmail.com) - 읽기 전용
- 확인: `read` tool로 `/Users/astin/.jinobot/clawd/warm-memory/inbox-personal.md`
- 상세: `exec` tool로 `node /Users/astin/.jinobot/clawd/skills/gmail/scripts/gmail.js read --id MSG_ID --account personal`
### jihwan (jihwan260213@gmail.com) - 전체 제어
- 확인: `read` tool로 `/Users/astin/.jinobot/clawd/warm-memory/inbox-jihwan.md`
- 보내기: `exec` tool로 `node /Users/astin/.jinobot/clawd/skills/gmail/scripts/gmail.js send --to "수신자" --subject "제목" --body "내용" --account jihwan`
- 답장: `exec` tool로 `node /Users/astin/.jinobot/clawd/skills/gmail/scripts/gmail.js reply --id MSG_ID --body "내용" --account jihwan`

## Browser (Playwright Chromium)
- 웹페이지 읽기: `exec` tool로 `node /Users/astin/.jinobot/clawd/skills/cloudflare-browser/scripts/read-page.js "URL" --max-chars 5000`
- 스크린샷: `exec` tool로 `node /Users/astin/.jinobot/clawd/skills/cloudflare-browser/scripts/screenshot.js "URL" /tmp/screenshot.png`
- JS 렌더링 SPA 사이트도 읽기 가능. 브라우저 필요 시 자동 실행, 작업 후 자동 종료.

## Notion API
- API 키: `/Users/astin/.jinobot/.notion.env` 에서 읽기
- 페이지 검색: `curl -s -X POST https://api.notion.com/v1/search -H "Authorization: Bearer $NOTION_API_KEY" -H "Notion-Version: 2022-06-28" -d '{"query":"검색어"}'`

## Gemini AI
- 텍스트 생성: `exec` tool로 `node /Users/astin/.jinobot/clawd/skills/gemini/scripts/gemini.js generate --prompt "프롬프트"`
- 파일 요약: `exec` tool로 `node /Users/astin/.jinobot/clawd/skills/gemini/scripts/gemini.js summarize --file /path/to/file.md`
