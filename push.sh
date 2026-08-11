#!/bin/bash
# CBPI Directory - Git Push (Mac/Linux)
set -e
cd "$(dirname "$0")"

if ! command -v git >/dev/null 2>&1; then
  echo "[ERROR] Git ইনস্টল করা নেই।"
  exit 1
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "[INFO] Git repo পাইনি। প্রথমে init-repo.sh চালান।"
  exit 1
fi

echo "[1/3] যোগ করা হচ্ছে..."
git add .

echo "[2/3] কমিট করা হচ্ছে..."
if git diff --cached --quiet; then
  echo "কোনো পরিবর্তন নেই।"
  exit 0
fi
git commit -m "update contacts - $(date '+%Y-%m-%d %H:%M')"

echo "[3/3] পুশ করা হচ্ছে..."
git push

echo "✅ সফলভাবে পুশ হয়েছে!"
