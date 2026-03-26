Notion skill (official-sdk example)

Usage:
- Set NOTION_TOKEN env var to an integration token (secret)
- node skills/notion/notion-example.js --action query --database DATABASE_ID
- node skills/notion/notion-example.js --action create --parent DATABASE_ID --title "New Page" --content "Body text"

This is a minimal example using @notionhq/client.
