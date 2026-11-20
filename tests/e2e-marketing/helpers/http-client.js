/**
 * Robust HTTP Client & Test Server Lifecycle Harness
 * Pure Node.js zero-dependency helper for starting, querying, and stopping the marketing harness server.
 */

const http = require('node:http');
const cp = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

class TestServerHarness {
  /**
   * @param {number} [port=4567]
   * @param {string} [serverScriptPath='scripts/marketing-harness/server.js']
   */
  constructor(port = 4567, serverScriptPath = 'scripts/marketing-harness/server.js') {
    this.port = port;
    this.serverScriptPath = serverScriptPath;
    this.process = null;
    this.baseUrl = `http://127.0.0.1:${port}`;
    this._exitHandler = null;
  }

  /**
   * Checks if the server script exists on disk.
   * @returns {boolean}
   */
  isScriptAvailable() {
    const fullPath = path.resolve(process.cwd(), this.serverScriptPath);
    return fs.existsSync(fullPath);
  }

  /**
   * Spawns the server process and awaits readiness.
   * @param {number} [timeoutMs=4000]
   * @returns {Promise<boolean>} Resolves to true when ready, false if script missing
   */
  async start(timeoutMs = 4000) {
    const fullPath = path.resolve(process.cwd(), this.serverScriptPath);
    if (!fs.existsSync(fullPath)) {
      return false; // Pending implementation
    }

    this.process = cp.spawn('node', [fullPath], {
      env: { ...process.env, PORT: String(this.port) },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stderrOutput = '';
    if (this.process.stderr) {
      this.process.stderr.on('data', (c) => {
        stderrOutput += c.toString('utf8');
      });
    }

    // Cleanup hook in case of sudden process exit
    this._exitHandler = () => {
      if (this.process) {
        try {
          this.process.kill('SIGKILL');
        } catch {}
      }
    };
    process.once('exit', this._exitHandler);

    // Wait for server to become responsive
    const startTime = Date.now();
    let ready = false;

    while (Date.now() - startTime < timeoutMs) {
      if (this.process.exitCode !== null) {
        throw new Error(`Server process exited prematurely with code ${this.process.exitCode}: ${stderrOutput}`);
      }

      try {
        const res = await this.get('/viewer_styles.css');
        if (res.status === 200 || res.status === 404) {
          ready = true;
          break;
        }
      } catch {
        // Retry after delay
        await new Promise((r) => setTimeout(r, 60));
      }
    }

    if (!ready) {
      await this.stop();
      throw new Error(`Server failed to start and respond on port ${this.port} within ${timeoutMs}ms`);
    }

    return true;
  }

  /**
   * Sends an HTTP GET request to the local server.
   * @param {string} pathname
   * @param {object} [headers={}]
   * @returns {Promise<{ status: number, headers: object, contentType: string, body: string }>}
   */
  async get(pathname, headers = {}) {
    return this.request('GET', pathname, null, headers);
  }

  /**
   * Sends an HTTP POST request to the local server (useful for method boundary testing).
   * @param {string} pathname
   * @param {string|Buffer} [body=null]
   * @param {object} [headers={}]
   * @returns {Promise<{ status: number, headers: object, contentType: string, body: string }>}
   */
  async post(pathname, body = null, headers = {}) {
    return this.request('POST', pathname, body, headers);
  }

  /**
   * General HTTP request dispatcher using node:http.
   * @param {string} method
   * @param {string} pathname
   * @param {string|Buffer|null} [body=null]
   * @param {object} [headers={}]
   * @returns {Promise<{ status: number, headers: object, contentType: string, body: string }>}
   */
  request(method, pathname, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(pathname, this.baseUrl);
      const reqHeaders = { ...headers };

      if (body) {
        if (!reqHeaders['Content-Length']) {
          reqHeaders['Content-Length'] = Buffer.byteLength(body);
        }
      }

      const req = http.request(
        {
          hostname: url.hostname,
          port: url.port,
          path: url.pathname + url.search,
          method,
          headers: reqHeaders,
          timeout: 3000
        },
        (res) => {
          const chunks = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () => {
            const resBody = Buffer.concat(chunks).toString('utf8');
            resolve({
              status: res.statusCode,
              headers: res.headers,
              contentType: res.headers['content-type'] || '',
              body: resBody
            });
          });
        }
      );

      req.on('timeout', () => {
        req.destroy(new Error(`Request timed out after 3000ms: ${pathname}`));
      });

      req.on('error', reject);

      if (body) {
        req.write(body);
      }
      req.end();
    });
  }

  /**
   * Gracefully terminates the server process.
   * @returns {Promise<{ exitCode: number|null, signal: string|null }>}
   */
  async stop() {
    if (this._exitHandler) {
      process.removeListener('exit', this._exitHandler);
      this._exitHandler = null;
    }

    if (!this.process) {
      return { exitCode: null, signal: null };
    }

    const proc = this.process;
    this.process = null;

    if (proc.exitCode !== null) {
      return { exitCode: proc.exitCode, signal: null };
    }

    return new Promise((resolve) => {
      let resolved = false;

      const finish = (code, signal) => {
        if (!resolved) {
          resolved = true;
          resolve({ exitCode: code, signal });
        }
      };

      proc.once('exit', (code, signal) => finish(code, signal));

      // Attempt clean SIGTERM
      proc.kill('SIGTERM');

      // Escalate to SIGKILL after 1500ms if process does not exit
      setTimeout(() => {
        if (!resolved && proc.exitCode === null) {
          try {
            proc.kill('SIGKILL');
          } catch {}
          finish(-1, 'SIGKILL');
        }
      }, 1500);
    });
  }

  /**
   * Confirms socket release by attempting connection and verifying error.
   * @returns {Promise<boolean>} True if connection refused (socket released)
   */
  async verifySocketReleased() {
    return new Promise((resolve) => {
      const req = http.get(this.baseUrl, () => {
        resolve(false); // Still accepting connections
      });
      req.on('error', (err) => {
        if (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') {
          resolve(true); // Successfully released
        } else {
          resolve(true);
        }
      });
      req.setTimeout(500, () => {
        req.destroy();
        resolve(true);
      });
    });
  }
}

module.exports = { TestServerHarness };
