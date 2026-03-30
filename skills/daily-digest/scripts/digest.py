#!/usr/bin/env python3
"""
Daily Digest Script
Fetches podcast episodes, newsletter articles, and notable tweets
from tracked accounts. Outputs a structured markdown digest file.

Usage:
    python3 digest.py
    python3 digest.py --date 2026-03-30
    python3 digest.py --dry-run

Output:
    /Users/astin/.jinobot/clawd/jino-memory/research/podcasts/YYYY-MM-DD-digest.md
"""

import os
import sys
import json
import datetime
import subprocess
import argparse
import urllib.request
import urllib.parse

# ─── Config ──────────────────────────────────────────────────────────────────

JINO_MEMORY = os.environ.get(
    "CLAWVAULT_PATH",
    os.path.expanduser("~/.jinobot/clawd/jino-memory")
)
OUTPUT_DIR = os.path.join(JINO_MEMORY, "research", "podcasts")
STATE_FILE = os.path.expanduser("~/.jinobot/clawd/warm-memory/digest-state.json")

TRACKED_ACCOUNTS = [
    "@pmarca", "@a16z", "@sama", "@karpathy", "@naval", "@paulg"
]

PODCAST_FEEDS = [
    {
        "name": "Lex Fridman Podcast",
        "rss": "https://lexfridman.com/feed/podcast/",
        "handle": "lexfridman",
    },
    {
        "name": "a16z Podcast",
        "rss": "https://a16z.com/podcasts/a16z-podcast/feed/",
        "handle": "a16z",
    },
    {
        "name": "The Tim Ferriss Show",
        "rss": "https://feeds.megaphone.fm/FST3744684401",
        "handle": "timferriss",
    },
]

BRAVE_API_KEY = os.environ.get("BRAVE_API_KEY", "")

# ─── Helpers ─────────────────────────────────────────────────────────────────

def load_state():
    try:
        if os.path.exists(STATE_FILE):
            with open(STATE_FILE) as f:
                return json.load(f)
    except Exception:
        pass
    return {"last_run": None, "seen_episodes": [], "seen_tweets": []}


def save_state(state):
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)


def fetch_url(url, timeout=10):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 digest-bot/1.0"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        return None


def parse_rss_episodes(xml_text, limit=3):
    """Very simple RSS parser — no external deps."""
    import re
    episodes = []
    items = re.findall(r"<item>(.*?)</item>", xml_text, re.DOTALL)
    for item in items[:limit]:
        title = re.search(r"<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)</title>", item, re.DOTALL)
        pub_date = re.search(r"<pubDate>(.*?)</pubDate>", item)
        link = re.search(r"<link>(.*?)</link>|<enclosure[^>]+url=\"([^\"]+)\"", item)
        description = re.search(r"<description><!\[CDATA\[(.*?)\]\]>|<description>(.*?)</description>", item, re.DOTALL)

        t = (title.group(1) or title.group(2) or "").strip() if title else "Unknown"
        d = pub_date.group(1).strip() if pub_date else ""
        l = (link.group(1) or link.group(2) or "").strip() if link else ""
        desc = (description.group(1) or description.group(2) or "").strip() if description else ""
        # Truncate description
        desc = re.sub(r"<[^>]+>", "", desc)[:200].strip()

        episodes.append({"title": t, "date": d, "link": l, "description": desc})
    return episodes


def brave_search(query, count=5):
    """Search via Brave API if key available, else return empty."""
    if not BRAVE_API_KEY:
        return []
    url = f"https://api.search.brave.com/res/v1/web/search?q={urllib.parse.quote(query)}&count={count}&freshness=pw"
    try:
        req = urllib.request.Request(
            url,
            headers={
                "Accept": "application/json",
                "Accept-Encoding": "gzip",
                "X-Subscription-Token": BRAVE_API_KEY,
            }
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            results = data.get("web", {}).get("results", [])
            return [{"title": r.get("title",""), "url": r.get("url",""), "description": r.get("description","")} for r in results]
    except Exception:
        return []


def fetch_twitter_mentions(handle):
    """Search web for recent tweets from a handle."""
    query = f"site:twitter.com OR site:x.com from:{handle} since:2026-03-23"
    results = brave_search(query, count=3)
    if not results:
        # Fallback: general search
        results = brave_search(f"{handle} tweet 2026", count=3)
    return results


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", default=datetime.date.today().isoformat())
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    today = args.date
    state = load_state()
    seen_eps = set(state.get("seen_episodes", []))

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    output_path = os.path.join(OUTPUT_DIR, f"{today}-digest.md")

    lines = []
    lines.append(f"# Daily Digest — {today}")
    lines.append(f"\n_Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M KST')}_\n")

    # ── Podcasts ──────────────────────────────────────────────────────────────
    lines.append("## 🎙️ Podcasts\n")
    new_eps = []

    for feed in PODCAST_FEEDS:
        xml = fetch_url(feed["rss"])
        if not xml:
            lines.append(f"- **{feed['name']}**: (fetch failed)\n")
            continue
        episodes = parse_rss_episodes(xml, limit=2)
        if not episodes:
            continue
        ep = episodes[0]
        ep_id = f"{feed['handle']}:{ep['title']}"
        if ep_id not in seen_eps:
            lines.append(f"### {feed['name']}")
            lines.append(f"- **{ep['title']}**")
            if ep['date']:
                lines.append(f"  - 발행: {ep['date']}")
            if ep['description']:
                lines.append(f"  - {ep['description'][:150]}…")
            if ep['link']:
                lines.append(f"  - 🔗 {ep['link']}")
            lines.append("")
            new_eps.append(ep_id)

    if not new_eps:
        lines.append("_새 에피소드 없음_\n")

    # ── Twitter / X ───────────────────────────────────────────────────────────
    lines.append("## 🐦 주요 인물 동향\n")

    if BRAVE_API_KEY:
        for handle in TRACKED_ACCOUNTS:
            results = fetch_twitter_mentions(handle.lstrip("@"))
            if results:
                lines.append(f"**{handle}**")
                for r in results[:2]:
                    desc = r.get("description", "")[:120]
                    lines.append(f"- {desc}")
                    if r.get("url"):
                        lines.append(f"  🔗 {r['url']}")
                lines.append("")
    else:
        lines.append("_Brave API 키 없음 — 트위터 수집 스킵_\n")
        lines.append("_에이전트가 직접 웹 검색으로 보완합니다_\n")

    # ── Auto-discovered sources ───────────────────────────────────────────────
    auto_study = os.path.expanduser("~/.jinobot/clawd/warm-memory/auto-study-latest.md")
    if os.path.exists(auto_study):
        lines.append("## 📚 Auto-Study Highlights\n")
        with open(auto_study) as f:
            content = f.read()[:800]
        lines.append(content)
        lines.append("")

    # ── Footer ────────────────────────────────────────────────────────────────
    lines.append("---")
    lines.append(f"_State: {len(new_eps)} new podcast episodes captured_")

    digest_text = "\n".join(lines)

    if args.dry_run:
        print(digest_text)
        return

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(digest_text)

    # Update state
    state["last_run"] = today
    state["seen_episodes"] = list(seen_eps | set(new_eps))
    save_state(state)

    print(f"[digest] Written to {output_path}")
    print(f"[digest] New episodes: {len(new_eps)}")
    print(f"[digest] Brave API: {'enabled' if BRAVE_API_KEY else 'disabled (set BRAVE_API_KEY)'}")


if __name__ == "__main__":
    main()
