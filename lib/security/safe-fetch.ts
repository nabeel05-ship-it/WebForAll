import { validateTargetUrl } from './url-validator';

export interface FetchResult {
  html: string;
  finalUrl: string;
  statusCode: number;
  fetchTimeMs: number;
}

export interface FetchError {
  error: string;
  code:
    | 'TIMEOUT'
    | 'MAX_REDIRECTS_EXCEEDED'
    | 'SSRF_BLOCKED'
    | 'INVALID_CONTENT_TYPE'
    | 'PAYLOAD_TOO_LARGE'
    | 'HTTP_ERROR'
    | 'NETWORK_ERROR';
  statusCode?: number;
  attemptedUrl?: string;
}

const MAX_REDIRECTS = 5;
const TIMEOUT_MS = 10000; // 10 seconds total timeout (safely within 15s maxDuration)
const MAX_BYTE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Safely fetches HTML from a public URL with SSRF protection,
 * redirect validation, byte limits, and timeout controls.
 */
export async function safeFetchHtml(rawTargetUrl: string): Promise<{ data?: FetchResult; error?: FetchError }> {
  const startTime = Date.now();
  let currentUrl = rawTargetUrl;
  let redirectsCount = 0;

  while (redirectsCount <= MAX_REDIRECTS) {
    // Validate target before EVERY request hop
    const validation = await validateTargetUrl(currentUrl, true);
    if (!validation.isValid || !validation.normalizedUrl) {
      return {
        error: {
          error: validation.error || 'Destination URL failed security validation.',
          code: 'SSRF_BLOCKED',
          attemptedUrl: currentUrl,
        },
      };
    }

    currentUrl = validation.normalizedUrl;

    const controller = new AbortController();
    // Keep timeout armed for both headers AND body reading
    const timeoutHandle = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(currentUrl, {
        method: 'GET',
        redirect: 'manual', // Enforce manual redirect handling to inspect destination IP/DNS
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; WebForAll-Bot/1.0; +https://webforall.dev; accessibility scanner)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      });

      // Handle Redirects
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        // Cancel response body immediately to prevent socket / memory leaks
        try {
          await response.body?.cancel();
        } catch {
          // Ignore cancellation error
        }

        redirectsCount++;
        if (redirectsCount > MAX_REDIRECTS) {
          return {
            error: {
              error: `Maximum redirect limit (${MAX_REDIRECTS}) exceeded. The target website may have a redirect loop.`,
              code: 'MAX_REDIRECTS_EXCEEDED',
              attemptedUrl: currentUrl,
            },
          };
        }

        const location = response.headers.get('location');
        if (!location) {
          return {
            error: {
              error: 'Server returned a redirect status without a Location header.',
              code: 'HTTP_ERROR',
              statusCode: response.status,
              attemptedUrl: currentUrl,
            },
          };
        }

        // Resolve redirect URL (supports relative redirects)
        try {
          const nextUrl = new URL(location, currentUrl).toString();
          currentUrl = nextUrl;
          continue; // Loop to next hop with SSRF validation
        } catch {
          return {
            error: {
              error: `Invalid redirect location header: ${location}`,
              code: 'HTTP_ERROR',
              attemptedUrl: currentUrl,
            },
          };
        }
      }

      // Check HTTP error status
      if (!response.ok) {
        try {
          await response.body?.cancel();
        } catch {
          // Ignore
        }

        let reason = `Target server responded with HTTP status ${response.status} (${response.statusText || 'Error'}).`;
        if (response.status === 403 || response.status === 401) {
          reason = `Target server returned HTTP ${response.status}. The website may be protected by a firewall or require authentication.`;
        } else if (response.status === 404) {
          reason = `Target page not found (HTTP 404). Please verify that the specified path exists.`;
        } else if (response.status >= 500) {
          reason = `The target web server is experiencing internal server errors (HTTP ${response.status}).`;
        }

        return {
          error: {
            error: reason,
            code: 'HTTP_ERROR',
            statusCode: response.status,
            attemptedUrl: currentUrl,
          },
        };
      }

      // Verify Content-Type
      const contentType = response.headers.get('content-type') || '';
      const isHtml =
        contentType.includes('text/html') ||
        contentType.includes('application/xhtml+xml') ||
        contentType.includes('text/xml');

      if (!isHtml) {
        try {
          await response.body?.cancel();
        } catch {
          // Ignore
        }

        return {
          error: {
            error: `The destination returned Content-Type "${contentType}". WebForAll only scans HTML web pages.`,
            code: 'INVALID_CONTENT_TYPE',
            attemptedUrl: currentUrl,
          },
        };
      }

      // Pre-check Content-Length header to reject oversized payloads early
      const contentLengthHeader = response.headers.get('content-length');
      if (contentLengthHeader) {
        const contentLength = parseInt(contentLengthHeader, 10);
        if (!isNaN(contentLength) && contentLength > MAX_BYTE_SIZE) {
          try {
            await response.body?.cancel();
          } catch {
            // Ignore
          }
          return {
            error: {
              error: `Web page content exceeds maximum allowed size of 5 MB (${(contentLength / 1024 / 1024).toFixed(1)} MB reported).`,
              code: 'PAYLOAD_TOO_LARGE',
              attemptedUrl: currentUrl,
            },
          };
        }
      }

      // Read response body with byte cap under active timeout
      const reader = response.body?.getReader();
      if (!reader) {
        const buffer = await response.arrayBuffer();
        if (buffer.byteLength > MAX_BYTE_SIZE) {
          return {
            error: {
              error: `Web page content exceeds the maximum allowed size of 5 MB (${(buffer.byteLength / 1024 / 1024).toFixed(1)} MB).`,
              code: 'PAYLOAD_TOO_LARGE',
              attemptedUrl: currentUrl,
            },
          };
        }
        const text = Buffer.from(buffer).toString('utf-8');
        return {
          data: {
            html: text,
            finalUrl: currentUrl,
            statusCode: response.status,
            fetchTimeMs: Date.now() - startTime,
          },
        };
      }

      const chunks: Uint8Array[] = [];
      let totalBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          totalBytes += value.length;
          if (totalBytes > MAX_BYTE_SIZE) {
            try {
              await reader.cancel();
            } catch {
              // Ignore
            }
            return {
              error: {
                error: `Web page content exceeds the maximum allowed size of 5 MB (${(totalBytes / 1024 / 1024).toFixed(1)} MB downloaded).`,
                code: 'PAYLOAD_TOO_LARGE',
                attemptedUrl: currentUrl,
              },
            };
          }
          chunks.push(value);
        }
      }

      const fullBuffer = Buffer.concat(chunks);
      const htmlText = fullBuffer.toString('utf-8');

      return {
        data: {
          html: htmlText,
          finalUrl: currentUrl,
          statusCode: response.status,
          fetchTimeMs: Date.now() - startTime,
        },
      };
    } catch (err: unknown) {
      const errorObj = err as Error;

      if (errorObj.name === 'AbortError') {
        return {
          error: {
            error: `Connection to ${currentUrl} timed out after ${TIMEOUT_MS / 1000} seconds. The target server did not respond in time.`,
            code: 'TIMEOUT',
            attemptedUrl: currentUrl,
          },
        };
      }

      return {
        error: {
          error: `Network connection failed: ${errorObj.message || 'Unable to establish connection with destination.'}`,
          code: 'NETWORK_ERROR',
          attemptedUrl: currentUrl,
        },
      };
    } finally {
      clearTimeout(timeoutHandle);
    }
  }

  return {
    error: {
      error: 'Redirect limit exceeded.',
      code: 'MAX_REDIRECTS_EXCEEDED',
      attemptedUrl: currentUrl,
    },
  };
}
