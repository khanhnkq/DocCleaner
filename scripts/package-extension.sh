#!/usr/bin/env bash
# package-extension.sh — Auto-bumps version and creates a clean store-ready ZIP
#
# Usage:
#   ./package-extension.sh             # Auto-increment version (e.g. 1.3 -> 1.4) & package
#   ./package-extension.sh patch       # Increment patch (e.g. 1.3 -> 1.3.1) & package
#   ./package-extension.sh minor       # Increment minor (e.g. 1.3 -> 1.4) & package
#   ./package-extension.sh major       # Increment major (e.g. 1.3 -> 2.0) & package
#   ./package-extension.sh 1.5         # Set explicit version & package
#   ./package-extension.sh --no-bump   # Package without changing current version

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "=========================================="
echo "🚀 DocCleaner Build & Package Pipeline"
echo "=========================================="

# 1. Run version bump script (unless --no-bump or keep is requested)
if [ -f "scripts/bump-version.js" ]; then
  node scripts/bump-version.js "${1:-auto}"
fi

# 2. Extract updated version from manifest.json
VERSION=$(grep -o '"version": *"[^"]*"' manifest.json | head -1 | cut -d'"' -f4)
EXTENSION_NAME="DocCleaner"
OUTPUT_ZIP="${EXTENSION_NAME}-v${VERSION}.zip"

echo ""
echo "📦 Packing Chrome Extension: ${EXTENSION_NAME} v${VERSION}"
echo "------------------------------------------"

# Remove existing build zip with this name if exists
rm -f "$OUTPUT_ZIP"

# 3. Create clean ZIP excluding dev tools, git, docs, scripts, and website assets
zip -r -q "$OUTPUT_ZIP" . \
  -x ".git/*" \
  -x ".gitignore" \
  -x ".DS_Store" \
  -x "*/.DS_Store" \
  -x "*.sh" \
  -x "*.zip" \
  -x "*.md" \
  -x "docs/*" \
  -x "scripts/*" \
  -x "index.html" \
  -x "index.css" \
  -x "index.js" \
  -x "sitemap.xml" \
  -x "robots.txt" \
  -x "uninstall.html" \
  -x "vi/*" \
  -x "store-assets/*" \
  -x "analytics/*" \
  -x "scratch/*" \
  -x ".gemini/*"

# 4. Verification
if [ -f "$OUTPUT_ZIP" ]; then
  FILE_SIZE=$(du -h "$OUTPUT_ZIP" | cut -f1)
  echo "✅ Package created successfully: ${OUTPUT_ZIP} (${FILE_SIZE})"
  echo ""
  echo "📋 Files included in package:"
  unzip -l "$OUTPUT_ZIP"
  echo ""
  echo "🎉 Success! ${OUTPUT_ZIP} is ready to upload to Chrome Web Store Developer Dashboard!"
else
  echo "❌ Error: Failed to create package."
  exit 1
fi
