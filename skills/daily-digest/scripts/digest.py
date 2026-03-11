#!/usr/bin/env python3
"""
Daily Information Digest v2
- Podcasts / Substack / Blogs: RSS 수집
- Twitter/X: nitter RSS로 @pmarca, @a16z 등 주요 계정
- Auto-discovery: 고신호 계정들이 자주 링크하는 새 소스 자동 추가
"""

import feedparser
import json
import os
import sys
import re
import signal
from datetime import datetime, timedelta, timezone
from collections import Counter
from urllib.parse import urlparse

# ── 경로 설정 ──────────────────────────────────────────────────────────
BASE_DIR    = os.path.expanduser("~/.jinobot/clawd")
OUTPUT_DIR  = os.path.join(BASE_DIR, "jino-memory/research/podcasts")
STATE_FILE  = os.path.join(BASE_DIR, "warm-memory/digest-state.json")
SOURCES_FILE= os.path.join(BASE_DIR, "skills/daily-digest/sources.json")
TODAY       = datetime.now().strftime("%Y-%m-%d")

# ── 소스 로드 ──────────────────────────────────────────────────────────
def load_sources():
    with open(SOURCES_FILE) as f:
        return json.load(f)

def save_sources(sources):
    with open(SOURCES_FILE, "w") as f:
        json.dump(sources, f, ensure_ascii=False, indent=2)

# ── 상태 관리 ──────────────────────────────────────────────────────────
def load_state():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE) as f:
            return json.load(f)
    return {"seen": {}, "link_counts": {}, "last_discovery": ""}

def save_state(state):
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)

# ── RSS 피드 ──────────────────────────────────────────────────────────
def fetch_feed(url, timeout=10):
    try:
        def handler(sig, frame): raise TimeoutError()
        signal.signal(signal.SIGALRM, handler)
        signal.alarm(timeout)
        feed = feedparser.parse(url)
        signal.alarm(0)
        return feed if feed.entries else None
    except Exception:
        signal.alarm(0)
        return None

def cutoff():
    return datetime.now(timezone.utc) - timedelta(days=2)

def is_new(eid, key, state):
    return eid not in state.get("seen", {}).get(key, [])

def mark_seen(eid, key, state):
    state.setdefault("seen", {}).setdefault(key, [])
    state["seen"][key].append(eid)
    state["seen"][key] = state["seen"][key][-50:]

def collect_feeds(src_list, category, state):
    results = []
    for src in src_list:
        if not src.get("enabled", True):
            continue
        feed = fetch_feed(src["url"])
        if not feed:
            log(f"  ⚠️  {src['name']}: 피드 없음")
            continue
        new_count = 0
        for entry in feed.entries[:5]:
            eid = entry.get("id") or entry.get("link") or entry.get("title", "")
            key = f"{category}:{src['name']}"
            if not is_new(eid, key, state):
                continue
            pub = entry.get("published_parsed")
            if pub:
                from calendar import timegm
                pub_dt = datetime.fromtimestamp(timegm(pub), tz=timezone.utc)
                if pub_dt < cutoff():
                    continue
            mark_seen(eid, key, state)
            results.append({
                "source": src["name"],
                "category": category,
                "title": entry.get("title", "")[:150],
                "summary": strip_html(entry.get("summary", entry.get("description", "")))[:400],
                "link": entry.get("link", ""),
                "date": entry.get("published", ""),
            })
            new_count += 1
            if new_count >= 2:
                break
        if new_count:
            log(f"  ✅ {src['name']}: {new_count}개")
    return results

# ── 트위터 (nitter RSS) ────────────────────────────────────────────────
def fetch_tweets(handle, count=3, state=None):
    results = []
    try:
        rss_url = f"https://nitter.net/{handle}/rss"
        feed = fetch_feed(rss_url, timeout=8)
        if not feed:
            return results
        for entry in feed.entries[:count + 2]:
            eid = entry.get("link", "")
            key = f"twitter:{handle}"
            if state and not is_new(eid, key, state):
                continue
            if state:
                mark_seen(eid, key, state)
            text = strip_html(entry.get("title", ""))[:250]
            results.append({
                "handle": handle,
                "text": text,
                "link": eid,
                "date": entry.get("published", ""),
                "raw": entry.get("summary", ""),
            })
            if len(results) >= count:
                break
    except Exception:
        pass
    return results

def collect_twitter(sources, state):
    results = []
    tier1 = [a for a in sources["twitter_accounts"] if a.get("enabled") and a.get("tier", 2) == 1]
    tier2 = [a for a in sources["twitter_accounts"] if a.get("enabled") and a.get("tier", 2) == 2]

    for acct in tier1:
        tweets = fetch_tweets(acct["handle"], count=3, state=state)
        for t in tweets:
            results.append({**t, "name": acct["name"], "tier": 1})
        if tweets:
            log(f"  ✅ @{acct['handle']}: {len(tweets)}개")

    for acct in tier2:
        tweets = fetch_tweets(acct["handle"], count=2, state=state)
        for t in tweets:
            results.append({**t, "name": acct["name"], "tier": 2})

    return results

# ── 자동 발견 ──────────────────────────────────────────────────────────
DISCOVERY_DOMAINS = {
    "substack.com": "substack",
    "spotify.com/show": "podcast",
    "podcasts.apple.com": "podcast",
    "overcast.fm": "podcast",
    "paulgraham.com": "blog",
    "stratechery.com": "substack",
}

def extract_links(text):
    urls = re.findall(r'https?://[^\s"\'<>]+', text)
    return urls

def discover_new_sources(tweets, sources, state):
    """티어1 트윗에서 자주 언급되는 새 소스 자동 발견"""
    link_counter = state.setdefault("link_counts", {})
    existing_urls = set()
    for cat in ["podcasts", "substacks", "blogs"]:
        for s in sources.get(cat, []):
            existing_urls.add(urlparse(s["url"]).netloc)

    newly_added = []
    for tweet in tweets:
        if tweet.get("tier", 2) != 1:
            continue
        links = extract_links(tweet.get("raw", "") + " " + tweet.get("text", ""))
        for link in links:
            parsed = urlparse(link)
            domain = parsed.netloc.replace("www.", "")
            # 이미 있는 소스면 스킵
            if any(domain in eu for eu in existing_urls):
                continue
            # 발견 횟수 카운트
            link_counter[domain] = link_counter.get(domain, 0) + 1
            # 3번 이상 언급되면 자동 추가 후보
            if link_counter[domain] >= 3:
                already_discovered = any(
                    d.get("url", "").find(domain) >= 0
                    for d in sources.get("auto_discovered", [])
                )
                if not already_discovered:
                    entry = {
                        "name": domain,
                        "url": link,
                        "domain": domain,
                        "mentions": link_counter[domain],
                        "discovered_at": TODAY,
                        "enabled": False  # 형이 수동 확인 후 enable
                    }
                    sources.setdefault("auto_discovered", []).append(entry)
                    newly_added.append(domain)
                    log(f"  🔍 신규 소스 발견: {domain} ({link_counter[domain]}회 언급)")

    return newly_added

# ── 보고서 생성 ────────────────────────────────────────────────────────
def strip_html(text):
    return re.sub(r'<[^>]+>', '', text or '').strip()

def log(msg):
    print(msg, file=sys.stderr)

def build_report(podcasts, blogs, substacks, tweets, new_sources):
    lines = [f"# 📡 Daily Digest — {TODAY}\n"]
    total = len(podcasts) + len(substacks) + len(blogs) + len(tweets)
    lines.append(f"> 오늘의 신규 아이템: **{total}개**\n")

    def section(emoji, title, items):
        if not items:
            return
        lines.append(f"\n## {emoji} {title}\n")
        by_src = {}
        for item in items:
            src = item.get("source", item.get("name", "?"))
            by_src.setdefault(src, []).append(item)
        for src, entries in by_src.items():
            lines.append(f"### {src}")
            for e in entries:
                lines.append(f"- **{e['title']}**")
                if e.get("summary"):
                    lines.append(f"  {e['summary'][:300]}")
                if e.get("link"):
                    lines.append(f"  🔗 {e['link']}")
            lines.append("")

    section("🎙", "팟캐스트 새 에피소드", podcasts)
    section("📰", "블로그 & 아티클", blogs)
    section("📬", "뉴스레터 (Substack)", substacks)

    if tweets:
        lines.append("\n## 🐦 트위터 하이라이트\n")
        tier1 = [t for t in tweets if t.get("tier") == 1]
        for t in tier1[:12]:
            lines.append(f"**@{t['handle']}** ({t['name']})")
            lines.append(f"> {t['text']}")
            if t.get("link"):
                lines.append(f"🔗 {t['link']}")
            lines.append("")

    if new_sources:
        lines.append(f"\n## 🔍 자동 발견된 신규 소스 후보\n")
        lines.append("> sources.json의 auto_discovered에서 확인 가능. `\"enabled\": true`로 바꾸면 내일부터 수집.\n")
        for s in new_sources:
            lines.append(f"- `{s}`")

    lines.append(f"\n---\n*{datetime.now().strftime('%Y-%m-%d %H:%M')} KST | daily-digest v2*")
    return "\n".join(lines)

# ── 텔레그램 요약 출력 ─────────────────────────────────────────────────
def print_telegram_summary(podcasts, substacks, blogs, tweets, new_sources):
    """크론 에이전트가 읽어서 텔레그램으로 보낼 요약"""
    total = len(podcasts) + len(substacks) + len(blogs) + len(tweets)
    parts = []

    if podcasts:
        parts.append(f"🎙 팟캐스트 {len(podcasts)}개:")
        for p in podcasts[:3]:
            parts.append(f"  • [{p['source']}] {p['title'][:60]}")

    if substacks:
        parts.append(f"\n📬 뉴스레터 {len(substacks)}개:")
        for s in substacks[:4]:
            parts.append(f"  • [{s['source']}] {s['title'][:60]}")

    if tweets:
        tier1 = [t for t in tweets if t.get("tier") == 1]
        if tier1:
            parts.append(f"\n🐦 주요 트윗 {len(tier1)}개:")
            for t in tier1[:4]:
                parts.append(f"  • @{t['handle']}: {t['text'][:80]}")

    if new_sources:
        parts.append(f"\n🔍 신규 소스 발견: {', '.join(new_sources)}")

    print(f"\n=== TELEGRAM_SUMMARY ({total}개 신규) ===")
    print("\n".join(parts))
    print("=== END ===")

# ── 메인 ──────────────────────────────────────────────────────────────
def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    state = load_state()
    sources = load_sources()

    log("🎙 팟캐스트 수집...")
    podcasts = collect_feeds(sources["podcasts"], "podcast", state)

    log("📬 서브스택 수집...")
    substacks = collect_feeds(sources["substacks"], "substack", state)

    log("📰 블로그 수집...")
    blogs = collect_feeds(sources["blogs"], "blog", state)

    log("🐦 트위터 수집...")
    tweets = collect_twitter(sources, state)

    log("🔍 자동 발견 처리...")
    new_sources = discover_new_sources(tweets, sources, state)
    if new_sources:
        save_sources(sources)

    save_state(state)

    total = len(podcasts) + len(substacks) + len(blogs) + len(tweets)
    if total == 0:
        log("✅ 오늘은 새 아이템 없음")
        print("NO_NEW_ITEMS")
        return

    report = build_report(podcasts, blogs, substacks, tweets, new_sources)
    out_path = os.path.join(OUTPUT_DIR, f"{TODAY}-digest.md")
    with open(out_path, "w") as f:
        f.write(report)

    log(f"\n✅ 저장 완료: {out_path} ({total}개)")
    print_telegram_summary(podcasts, substacks, blogs, tweets, new_sources)
    print(f"\nDIGEST_PATH:{out_path}")

if __name__ == "__main__":
    main()
