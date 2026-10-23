#!/usr/bin/env node
/**
 * bump-version.js — Automatically increments and synchronizes extension version
 * across manifest.json, popup.html, README.md, and CHROMEWEBSTORE.md.
 * 
 * Usage:
 *   node bump-version.js           # Auto-bump (e.g. 1.3 -> 1.4, 1.3.1 -> 1.3.2)
 *   node bump-version.js patch     # Patch bump (e.g. 1.3 -> 1.3.1, 1.3.1 -> 1.3.2)
 *   node bump-version.js minor     # Minor bump (e.g. 1.3 -> 1.4, 1.3.1 -> 1.4)
 *   node bump-version.js major     # Major bump (e.g. 1.3 -> 2.0)
 *   node bump-version.js 1.5       # Explicit version
 *   node bump-version.js --no-bump # Keep current version (no changes)
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT_DIR, 'manifest.json');
const POPUP_PATH = path.join(ROOT_DIR, 'popup.html');
const README_PATH = path.join(ROOT_DIR, 'README.md');
const STORE_PATH = path.join(ROOT_DIR, 'docs', 'CHROMEWEBSTORE.md');

function calculateNextVersion(currentVersion, bumpType = 'auto') {
    if (!bumpType || bumpType === 'auto') {
        const parts = currentVersion.split('.').map(Number);
        if (parts.length === 2) {
            return `${parts[0]}.${parts[1] + 1}`;
        } else {
            parts[parts.length - 1]++;
            return parts.join('.');
        }
    }

    if (bumpType === '--no-bump' || bumpType === 'keep' || bumpType === '--current') {
        return currentVersion;
    }

    if (/^\d+(\.\d+)+$/.test(bumpType)) {
        return bumpType;
    }

    const parts = currentVersion.split('.').map(Number);
    if (bumpType === 'major') {
        return `${parts[0] + 1}.0`;
    }
    if (bumpType === 'minor') {
        return `${parts[0]}.${parts[1] + 1}`;
    }
    if (bumpType === 'patch') {
        if (parts.length === 2) {
            return `${parts[0]}.${parts[1]}.1`;
        }
        parts[parts.length - 1]++;
        return parts.join('.');
    }

    throw new Error(`Unknown bump type: ${bumpType}`);
}

function main() {
    const arg = process.argv[2] || 'auto';

    if (!fs.existsSync(MANIFEST_PATH)) {
        console.error('❌ Error: manifest.json not found in', ROOT_DIR);
        process.exit(1);
    }

    const manifestRaw = fs.readFileSync(MANIFEST_PATH, 'utf8');
    const manifest = JSON.parse(manifestRaw);
    const currentVersion = manifest.version;

    // Validate Chrome Web Store limits
    if (manifest.description && manifest.description.length > 132) {
        console.error(`❌ Error: manifest.json "description" is ${manifest.description.length} chars (maximum allowed is 132 chars)!`);
        process.exit(1);
    }
    if (manifest.name && manifest.name.length > 75) {
        console.error(`❌ Error: manifest.json "name" is ${manifest.name.length} chars (maximum allowed is 75 chars)!`);
        process.exit(1);
    }

    const nextVersion = calculateNextVersion(currentVersion, arg);

    if (nextVersion === currentVersion) {
        console.log(`ℹ️ Keeping current version: v${currentVersion}`);
        // Output version to stdout for shell script capturing if needed
        return nextVersion;
    }

    console.log(`🆙 Bumping version: v${currentVersion} ➔ v${nextVersion} (mode: ${arg})`);

    // 1. Update manifest.json
    manifest.version = nextVersion;
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    console.log(`  ✓ Updated manifest.json -> "version": "${nextVersion}"`);

    // 2. Update popup.html
    if (fs.existsSync(POPUP_PATH)) {
        let popupContent = fs.readFileSync(POPUP_PATH, 'utf8');
        const popupRe = /<span class="badge-ver">v[0-9.]+<\/span>/;
        if (popupRe.test(popupContent)) {
            popupContent = popupContent.replace(popupRe, `<span class="badge-ver">v${nextVersion}</span>`);
            fs.writeFileSync(POPUP_PATH, popupContent, 'utf8');
            console.log(`  ✓ Updated popup.html -> v${nextVersion}`);
        }
    }

    // 3. Update README.md
    if (fs.existsSync(README_PATH)) {
        let readmeContent = fs.readFileSync(README_PATH, 'utf8');
        readmeContent = readmeContent.replace(
            /> \*\*Version:\*\* `v[0-9.]+`/,
            `> **Version:** \`v${nextVersion}\``
        );
        readmeContent = readmeContent.replace(
            /DocCleaner-v[0-9.]+\.zip/g,
            `DocCleaner-v${nextVersion}.zip`
        );
        fs.writeFileSync(README_PATH, readmeContent, 'utf8');
        console.log(`  ✓ Updated README.md -> v${nextVersion}`);
    }

    // 4. Update CHROMEWEBSTORE.md
    if (fs.existsSync(STORE_PATH)) {
        let storeContent = fs.readFileSync(STORE_PATH, 'utf8');
        storeContent = storeContent.replace(
            /> Version: [0-9.]+/,
            `> Version: ${nextVersion}`
        );
        storeContent = storeContent.replace(
            /Version [0-9.]+ — Better Studocu/,
            `Version ${nextVersion} — Better Studocu`
        );
        fs.writeFileSync(STORE_PATH, storeContent, 'utf8');
        console.log(`  ✓ Updated CHROMEWEBSTORE.md -> Version ${nextVersion}`);
    }

    return nextVersion;
}

if (require.main === module) {
    main();
}

module.exports = { calculateNextVersion, main };
