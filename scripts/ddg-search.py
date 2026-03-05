#!/usr/bin/env python3
"""
DuckDuckGo HTML search scraper — no API key, completely free.
Usage: python3 ddg-search.py "search query" [--limit N]
Output: JSON array of {title, url, snippet}
"""
import sys
import json
import argparse
import urllib.request
import urllib.parse
import re
import html

def search_ddg(query, limit=5):
    encoded = urllib.parse.quote_plus(query)
    url = f"https://html.duckduckgo.com/html/?q={encoded}"

    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
    })

    with urllib.request.urlopen(req, timeout=10) as resp:
        body = resp.read().decode("utf-8", errors="replace")

    results = []

    # Parse result blocks
    blocks = re.findall(r'<div class="result[^"]*".*?</div>\s*</div>\s*</div>', body, re.DOTALL)

    for block in blocks:
        if len(results) >= limit:
            break

        # Title + URL
        title_match = re.search(r'class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)</a>', block, re.DOTALL)
        if not title_match:
            continue

        raw_url = html.unescape(title_match.group(1))
        title = re.sub(r'<[^>]+>', '', title_match.group(2)).strip()
        title = html.unescape(title)

        # DDG redirect → extract actual URL
        if "duckduckgo.com/l/" in raw_url:
            qs = urllib.parse.urlparse(raw_url).query
            params = urllib.parse.parse_qs(qs)
            raw_url = params.get("uddg", [raw_url])[0]
        raw_url = urllib.parse.unquote(raw_url)

        # Snippet
        snippet_match = re.search(r'class="result__snippet"[^>]*>(.*?)</a>', block, re.DOTALL)
        snippet = ""
        if snippet_match:
            snippet = re.sub(r'<[^>]+>', '', snippet_match.group(1)).strip()
            snippet = html.unescape(snippet)

        if title and raw_url:
            results.append({"title": title, "url": raw_url, "snippet": snippet})

    return results


def main():
    parser = argparse.ArgumentParser(description="DuckDuckGo search scraper")
    parser.add_argument("query", help="Search query")
    parser.add_argument("--limit", type=int, default=5, help="Max results (default: 5)")
    args = parser.parse_args()

    try:
        results = search_ddg(args.query, args.limit)
        print(json.dumps(results, ensure_ascii=False, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
