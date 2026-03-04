#!/usr/bin/env python3
"""
Scrapling fetcher — stealth HTTP + adaptive scraping
Usage: python3 fetch.py <URL> [--max-chars 5000] [--mode http|stealth|playwright]
"""
import sys
import argparse
import json

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("url", help="URL to fetch")
    parser.add_argument("--max-chars", type=int, default=5000)
    parser.add_argument("--mode", choices=["http", "stealth", "playwright"], default="http")
    parser.add_argument("--json", action="store_true", help="Output JSON")
    args = parser.parse_args()

    try:
        if args.mode == "playwright":
            from scrapling import PlayWrightFetcher
            page = PlayWrightFetcher().get(args.url, timeout=20, network_idle=True)
        elif args.mode == "stealth":
            from scrapling import StealthyFetcher
            page = StealthyFetcher().get(args.url, timeout=15)
        else:
            from scrapling import Fetcher
            page = Fetcher().get(args.url, timeout=10)

        text = page.get_all_text()
        if len(text) > args.max_chars:
            text = text[:args.max_chars] + f"\n\n[truncated — {len(text)} total chars]"

        if args.json:
            print(json.dumps({
                "url": args.url,
                "status": page.status,
                "charCount": len(text),
                "content": text
            }, ensure_ascii=False))
        else:
            print(text)

    except Exception as e:
        if args.json:
            print(json.dumps({"error": str(e), "url": args.url}))
        else:
            print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
