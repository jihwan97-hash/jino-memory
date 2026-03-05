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
