#!/usr/bin/env bash
# package-extension.sh — Creates a clean, store-ready ZIP for Chrome Web Store submission

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# Extract extension name and version from manifest.json
VERSION=$(grep -o '"version": *"[^"]*"' manifest.json | head -1 | cut -d'"' -f4)
EXTENSION_NAME="DocCleaner"
OUTPUT_ZIP="${EXTENSION_NAME}-v${VERSION}.zip"

echo "=========================================="
echo "📦 Packing Chrome Extension: ${EXTENSION_NAME} v${VERSION}"
echo "=========================================="

# Remove old build if exists
rm -f "$OUTPUT_ZIP"

# Create clean ZIP excluding development, git, docs, and OS metadata files
zip -r -q "$OUTPUT_ZIP" . \
  -x ".git/*" \
  -x ".gitignore" \
  -x ".DS_Store" \
  -x "*/.DS_Store" \
  -x "*.sh" \
  -x "*.zip" \
  -x "CHROMEWEBSTORE.md" \
  -x "README.md" \
  -x "PRIVACY_POLICY.md" \
  -x "store-assets/*" \
  -x "scratch/*"

# Verification
if [ -f "$OUTPUT_ZIP" ]; then
  FILE_SIZE=$(du -h "$OUTPUT_ZIP" | cut -f1)
  echo "✅ Package created successfully: ${OUTPUT_ZIP} (${FILE_SIZE})"
  echo ""
  echo "📋 Files included in package:"
  unzip -l "$OUTPUT_ZIP"
  echo ""
  echo "🚀 Ready for Chrome Web Store upload!"
else
  echo "❌ Error: Failed to create package."
  exit 1
fi
