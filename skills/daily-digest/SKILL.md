---
name: daily-digest
description: Daily podcast + Twitter digest collector. Fetches latest episodes from tracked RSS feeds (Lex Fridman, a16z, Tim Ferriss) and recent tweets from @pmarca @a16z @sama @karpathy @naval @paulg.
---

```bash
python3 /Users/astin/.jinobot/clawd/skills/daily-digest/scripts/digest.py
```

Output: `jino-memory/research/podcasts/YYYY-MM-DD-digest.md`
State: `warm-memory/digest-state.json`

## Env
- `BRAVE_API_KEY` — optional, enables Twitter/web search collection
- `CLAWVAULT_PATH` — defaults to `~/.jinobot/clawd/jino-memory`

## Cron
Runs daily at 08:00 KST via `daily-digest` cron job.
After running: agent reads output file and sends Korean summary to Telegram.
