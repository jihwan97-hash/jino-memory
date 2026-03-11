#!/bin/bash
# Daily Digest Runner — 팟캐스트 + a16z Twitter + Substack 자동 수집
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT=$(python3 "$SCRIPT_DIR/digest.py" 2>/dev/null)

# 저장된 파일 경로 파싱
DIGEST_PATH=$(echo "$OUTPUT" | grep "DIGEST_READY" | cut -d: -f2)
TOTAL=$(echo "$OUTPUT" | grep "DIGEST_READY" | cut -d: -f3)

if [ -z "$DIGEST_PATH" ] || [ -z "$TOTAL" ]; then
    echo "오늘은 새 아이템 없음"
    exit 0
fi

# 다이제스트 내용 읽기
CONTENT=$(cat "$DIGEST_PATH")

# OpenClaw로 텔레그램 알림 전송
TOKEN=$(node -e "try{console.log(JSON.parse(require('fs').readFileSync('/Users/astin/.openclaw/identity/device-auth.json','utf8')).tokens.operator.token)}catch(e){}" 2>/dev/null)

# 요약 메시지 (전체 내용 대신 요약만)
SUMMARY=$(head -50 "$DIGEST_PATH")

openclaw message send \
  --token "$TOKEN" \
  --channel telegram \
  --to 1647309602 \
  --message "📡 **Daily Digest** — 오늘 새 아이템 **${TOTAL}개**
$(echo "$SUMMARY" | head -40)" 2>/dev/null || true

echo "✅ Digest 완료: $TOTAL개 아이템 → $DIGEST_PATH"
