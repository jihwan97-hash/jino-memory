#!/usr/bin/env python3
"""
Scrapling-based web scraper for Jino.
Usage:
  python3 scrape.py <URL> [--css "selector"] [--text] [--json]

Examples:
  python3 scrape.py https://example.com --text          # full page text
  python3 scrape.py https://example.com --css "h1"      # CSS selector
  python3 scrape.py https://example.com --css "a" --json # links as JSON
"""
import sys
import json
import argparse
import warnings
warnings.filterwarnings("ignore")

def main():
    parser = argparse.ArgumentParser(description="Scrapling web scraper")
    parser.add_argument("url", help="URL to scrape")
    parser.add_argument("--css", help="CSS selector to extract", default=None)
    parser.add_argument("--text", action="store_true", help="Extract full page text")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    parser.add_argument("--max-chars", type=int, default=5000, help="Max chars to output")
    args = parser.parse_args()

    from scrapling.fetchers import Fetcher
    page = Fetcher.get(args.url, stealthy_headers=True, timeout=15)

    if args.css:
        elements = page.css(args.css)
        if args.json:
            results = []
            for el in elements:
                results.append({
                    "text": el.text,
                    "html": str(el)[:500],
                    "href": el.attrib.get("href", ""),
                })
            print(json.dumps(results, ensure_ascii=False, indent=2))
        else:
            for el in elements:
                print(el.text)
    elif args.text:
        text = page.get_all_text(ignore_tags=('script', 'style'))
        print(text[:args.max_chars])
    else:
        # Default: full markdown-like text
        text = page.get_all_text(ignore_tags=('script', 'style'))
        print(text[:args.max_chars])

if __name__ == "__main__":
    main()
