/**
 * DocCleaner Local Mock Showcase Harness Server
 * Zero external npm dependencies. Built using native Node.js http and fs modules.
 * Serves scripts/marketing-harness/ and workspace root assets on http://127.0.0.1:4567
 */

'use strict';

const http = require('node:http');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');

const DEFAULT_PORT = 4567;
const DEFAULT_HOST = '127.0.0.1';

// Base directories
const HARNESS_DIR = path.resolve(__dirname, './');
const WORKSPACE_DIR = path.resolve(__dirname, '../../');

// Complete MIME type mapping (18 types)
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain; charset=utf-8'
};

/**
 * Resolves a safe file path with fallback from HARNESS_DIR to WORKSPACE_DIR.
 * Prevents directory traversal outside WORKSPACE_DIR.
 */
async function resolveSafePath(requestPath) {
    let cleanPath;
    try {
        cleanPath = decodeURIComponent(requestPath.split('?')[0].split('#')[0]);
    } catch (e) {
        return null;
    }
    if (cleanPath === '/' || cleanPath === '') {
        cleanPath = '/gallery.html';
    }

    // Normalized relative path without leading slashes
    const relPath = path.normalize(cleanPath).replace(/^(\.\.[\/\\])+/, '').replace(/^[\/\\]+/, '');

    // 1. Check in scripts/marketing-harness/
    const harnessCandidate = path.resolve(HARNESS_DIR, relPath);
    if (harnessCandidate.startsWith(HARNESS_DIR) || harnessCandidate.startsWith(WORKSPACE_DIR)) {
        try {
            const stat = await fsp.stat(harnessCandidate);
            if (stat.isFile()) return harnessCandidate;
        } catch (e) {}
    }

    // 2. Check in workspace root (DocCleaner/)
    const workspaceCandidate = path.resolve(WORKSPACE_DIR, relPath);
    if (workspaceCandidate.startsWith(WORKSPACE_DIR)) {
        try {
            const stat = await fsp.stat(workspaceCandidate);
            if (stat.isFile()) return workspaceCandidate;
        } catch (e) {}
    }

    return null;
}

/**
 * Creates the HTTP server instance
 */
function createServer() {
    const server = http.createServer(async (req, res) => {
        // Only allow GET and HEAD requests
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('405 Method Not Allowed');
            return;
        }

        try {
            const parsedUrl = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
            const filePath = await resolveSafePath(parsedUrl.pathname);

            if (!filePath) {
                res.writeHead(404, {
                    'Content-Type': 'text/html; charset=utf-8',
                    'Cache-Control': 'no-cache'
                });
                res.end(`<!DOCTYPE html><html><head><title>404 Not Found</title></head><body style="font-family:sans-serif;padding:40px;"><h2>404 Not Found</h2><p>Resource not found: <code>${parsedUrl.pathname}</code></p></body></html>`);
                return;
            }

            const ext = path.extname(filePath).toLowerCase();
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';

            const stat = await fsp.stat(filePath);
            const totalSize = stat.size;

            // Handle HTTP Range Requests (Essential for HTML5 Video Seeking)
            const range = req.headers.range;
            if (range && (ext === '.mp4' || ext === '.webm')) {
                const match = range.match(/bytes=(\d*)-(\d*)/);
                if (!match || (match[1] === '' && match[2] === '')) {
                    res.writeHead(416, {
                        'Content-Range': `bytes */${totalSize}`,
                        'Content-Type': contentType
                    });
                    res.end();
                    return;
                }

                let start, end;
                if (match[1] === '' && match[2] !== '') {
                    const suffix = parseInt(match[2], 10);
                    if (isNaN(suffix) || suffix <= 0) {
                        res.writeHead(416, {
                            'Content-Range': `bytes */${totalSize}`,
                            'Content-Type': contentType
                        });
                        res.end();
                        return;
                    }
                    start = Math.max(0, totalSize - suffix);
                    end = totalSize - 1;
                } else {
                    start = match[1] !== '' ? parseInt(match[1], 10) : 0;
                    end = match[2] !== '' ? parseInt(match[2], 10) : totalSize - 1;
                }

                if (isNaN(start) || isNaN(end) || start >= totalSize || end >= totalSize || start > end || start < 0) {
                    res.writeHead(416, {
                        'Content-Range': `bytes */${totalSize}`,
                        'Content-Type': contentType
                    });
                    res.end();
                    return;
                }

                const chunksize = (end - start) + 1;
                res.writeHead(206, {
                    'Content-Range': `bytes ${start}-${end}/${totalSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    'Content-Type': contentType,
                    'Access-Control-Allow-Origin': '*'
                });

                if (req.method === 'HEAD') {
                    res.end();
                    return;
                }

                const stream = fs.createReadStream(filePath, { start, end });
                stream.on('error', (streamErr) => {
                    console.error('[Stream Error]', streamErr);
                    if (!res.headersSent) {
                        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                        res.end('500 Internal Server Error');
                    } else {
                        res.destroy();
                    }
                });
                stream.pipe(res);
                return;
            }

            // Standard 200 OK Response
            res.writeHead(200, {
                'Content-Type': contentType,
                'Content-Length': totalSize,
                'Accept-Ranges': 'bytes',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Access-Control-Allow-Origin': '*'
            });

            if (req.method === 'HEAD') {
                res.end();
                return;
            }

            const stream = fs.createReadStream(filePath);
            stream.on('error', (streamErr) => {
                console.error('[Stream Error]', streamErr);
                if (!res.headersSent) {
                    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                    res.end('500 Internal Server Error');
                } else {
                    res.destroy();
                }
            });
            stream.pipe(res);
        } catch (err) {
            console.error('[Server Error]', err);
            if (!res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('500 Internal Server Error');
            } else {
                res.destroy();
            }
        }
    });

    return server;
}

/**
 * Starts listening on specified or environment port
 */
function startServer(port = (process.env.PORT || DEFAULT_PORT), host = (process.env.HOST || DEFAULT_HOST)) {
    return new Promise((resolve, reject) => {
        const server = createServer();
        server.listen(port, host, () => {
            const addr = `http://${host}:${port}`;
            console.log(`[DocCleaner] Marketing Harness Server running at ${addr}`);
            resolve({ server, port, host, url: addr });
        });
        server.on('error', reject);
    });
}

// Direct execution entrypoint
if (require.main === module) {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : DEFAULT_PORT;
    const host = process.env.HOST || DEFAULT_HOST;

    startServer(port, host).catch((err) => {
        console.error('[DocCleaner] Failed to start server:', err);
        process.exit(1);
    });

    const shutdown = () => {
        console.log('\n[DocCleaner] Shutting down Marketing Harness Server...');
        process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}

module.exports = {
    createServer,
    startServer,
    MIME_TYPES,
    resolveSafePath,
    DEFAULT_PORT,
    DEFAULT_HOST
};
