import dns from 'node:dns/promises';
import net from 'node:net';

export interface ValidationResult {
  isValid: boolean;
  normalizedUrl?: string;
  error?: string;
  code?: 'INVALID_FORMAT' | 'UNSUPPORTED_SCHEME' | 'PRIVATE_IP' | 'BLOCKED_HOST' | 'DNS_RESOLUTION_FAILED' | 'CREDENTIALS_DISALLOWED' | 'INVALID_PORT';
  resolvedIps?: string[];
}

/**
 * Checks if an IPv4 address is in private, loopback, link-local, or reserved ranges.
 */
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true; // malformed, treat as unsafe
  }

  const [a, b, c] = parts;

  // 0.0.0.0/8 (Current network)
  if (a === 0) return true;

  // 10.0.0.0/8 (Private)
  if (a === 10) return true;

  // 100.64.0.0/10 (Carrier-grade NAT)
  if (a === 100 && b >= 64 && b <= 127) return true;

  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;

  // 169.254.0.0/16 (Link-local & Cloud Metadata 169.254.169.254)
  if (a === 169 && b === 254) return true;

  // 172.16.0.0/12 (Private)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.0.0.0/24 (IETF Protocol Assignments)
  if (a === 192 && b === 0 && c === 0) return true;

  // 192.0.2.0/24 (TEST-NET-1)
  if (a === 192 && b === 0 && c === 2) return true;

  // 192.88.99.0/24 (6to4 Relay Anycast)
  if (a === 192 && b === 88 && c === 99) return true;

  // 192.168.0.0/16 (Private)
  if (a === 192 && b === 168) return true;

  // 198.18.0.0/15 (Benchmark)
  if (a === 198 && (b === 18 || b === 19)) return true;

  // 198.51.100.0/24 (TEST-NET-2)
  if (a === 198 && b === 51 && c === 100) return true;

  // 203.0.113.0/24 (TEST-NET-3)
  if (a === 203 && b === 0 && c === 113) return true;

  // 224.0.0.0/4 (Multicast)
  if (a >= 224 && a <= 239) return true;

  // 240.0.0.0/4 (Reserved)
  if (a >= 240) return true;

  return false;
}

/**
 * Parses an IPv6 string into an array of 8 16-bit words (0x0000 - 0xffff).
 * Returns null if the string is not a valid IPv6 format.
 */
function parseIPv6Words(ip: string): number[] | null {
  let clean = ip.replace(/^\[|\]$/g, '').toLowerCase();

  // Strip zone index (e.g. fe80::1%eth0)
  const zoneIndex = clean.indexOf('%');
  if (zoneIndex !== -1) {
    clean = clean.substring(0, zoneIndex);
  }

  // Handle embedded dotted-quad IPv4 (e.g. ::ffff:192.168.1.1 or ::127.0.0.1)
  const lastColon = clean.lastIndexOf(':');
  if (lastColon !== -1 && clean.slice(lastColon + 1).includes('.')) {
    const v4Part = clean.slice(lastColon + 1);
    const v4Parts = v4Part.split('.').map((p) => parseInt(p, 10));
    if (v4Parts.length === 4 && !v4Parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
      const hex1 = ((v4Parts[0] << 8) | v4Parts[1]).toString(16);
      const hex2 = ((v4Parts[2] << 8) | v4Parts[3]).toString(16);
      clean = clean.slice(0, lastColon) + ':' + hex1 + ':' + hex2;
    } else {
      return null;
    }
  }

  const parts = clean.split('::');
  if (parts.length > 2) return null;

  let words: string[] = [];
  if (parts.length === 2) {
    const left = parts[0] ? parts[0].split(':').filter(Boolean) : [];
    const right = parts[1] ? parts[1].split(':').filter(Boolean) : [];
    const missing = 8 - (left.length + right.length);
    if (missing < 0) return null;
    words = [...left, ...Array(missing).fill('0'), ...right];
  } else {
    words = clean.split(':').filter(Boolean);
  }

  if (words.length !== 8) return null;
  const numWords = words.map((w) => parseInt(w, 16));
  if (numWords.some((w) => isNaN(w) || w < 0 || w > 0xffff)) return null;
  return numWords;
}

/**
 * Checks if an IPv6 address is in private, loopback, link-local, or reserved ranges.
 */
function isPrivateIPv6(ip: string): boolean {
  const words = parseIPv6Words(ip);
  if (!words) {
    return true; // Malformed or unparseable, treat as unsafe
  }

  // Unspecified (::/128)
  if (words.every((w) => w === 0)) return true;

  // Loopback (::1/128)
  if (words.slice(0, 7).every((w) => w === 0) && words[7] === 1) return true;

  // IPv4-mapped IPv6 (::ffff:0:0/96)
  if (words.slice(0, 5).every((w) => w === 0) && words[5] === 0xffff) {
    const a = (words[6] >> 8) & 0xff;
    const b = words[6] & 0xff;
    const c = (words[7] >> 8) & 0xff;
    const d = words[7] & 0xff;
    return isPrivateIPv4(`${a}.${b}.${c}.${d}`);
  }

  // IPv4-compatible IPv6 (::0:0/96, e.g. ::127.0.0.1 or ::7f00:1)
  if (words.slice(0, 6).every((w) => w === 0)) {
    const a = (words[6] >> 8) & 0xff;
    const b = words[6] & 0xff;
    const c = (words[7] >> 8) & 0xff;
    const d = words[7] & 0xff;
    return isPrivateIPv4(`${a}.${b}.${c}.${d}`);
  }

  // 6to4 addresses (2002::/16) embed IPv4 in words 1 and 2
  if (words[0] === 0x2002) {
    const a = (words[1] >> 8) & 0xff;
    const b = words[1] & 0xff;
    const c = (words[2] >> 8) & 0xff;
    const d = words[2] & 0xff;
    return isPrivateIPv4(`${a}.${b}.${c}.${d}`);
  }

  // Unique local addresses (fc00::/7 -> fc00 to fdff)
  if ((words[0] & 0xfe00) === 0xfc00) return true;

  // Link-local unicast (fe80::/10 -> fe80 to febf)
  if ((words[0] & 0xffc0) === 0xfe80) return true;

  // Multicast (ff00::/8)
  if ((words[0] & 0xff00) === 0xff00) return true;

  // Documentation (2001:db8::/32)
  if (words[0] === 0x2001 && words[1] === 0x0db8) return true;

  // Discard prefix (100::/64)
  if (words[0] === 0x0100 && words[1] === 0 && words[2] === 0 && words[3] === 0) return true;

  // Teredo tunneling (2001:0000::/32)
  if (words[0] === 0x2001 && words[1] === 0) {
    const clientWord6 = words[6] ^ 0xffff;
    const clientWord7 = words[7] ^ 0xffff;
    const a = (clientWord6 >> 8) & 0xff;
    const b = clientWord6 & 0xff;
    const c = (clientWord7 >> 8) & 0xff;
    const d = clientWord7 & 0xff;
    return isPrivateIPv4(`${a}.${b}.${c}.${d}`);
  }

  return false;
}

/**
 * Checks whether an IP address (v4 or v6) is private or reserved.
 */
export function isPrivateIP(ip: string): boolean {
  const clean = ip.replace(/^\[|\]$/g, '').toLowerCase();
  const ipType = net.isIP(clean);
  if (ipType === 4) {
    return isPrivateIPv4(clean);
  }
  if (ipType === 6) {
    return isPrivateIPv6(clean);
  }
  return false;
}

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'local',
  'broadcasthost',
  'ip6-localhost',
  'ip6-loopback',
  'metadata.google.internal',
  'instance-data',
  'host.docker.internal',
  'gateway.docker.internal',
]);

const BLOCKED_DOMAINS_SUFFIXES = [
  '.local',
  '.localhost',
  '.internal',
  '.lan',
  '.home.arpa',
  '.corp',
  '.test',
  '.example',
  '.invalid',
  '.cluster.local',
  '.svc',
  '.onion',
];

const ALLOWED_PORTS = new Set(['', '80', '443', '8080', '8443']);

/**
 * Validates and normalizes a candidate target URL.
 * Checks URL syntax, scheme, port, embedded credentials, and resolves DNS to protect against SSRF.
 */
export async function validateTargetUrl(rawUrl: string, resolveDns = true): Promise<ValidationResult> {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      isValid: false,
      error: 'Please enter a valid website URL.',
      code: 'INVALID_FORMAT',
    };
  }

  const trimmed = rawUrl.trim();

  // Basic sanity check before URL parsing
  if (trimmed.length > 2048) {
    return {
      isValid: false,
      error: 'URL exceeds maximum permitted length of 2048 characters.',
      code: 'INVALID_FORMAT',
    };
  }

  let parsed: URL;
  try {
    // Check if user provided an explicit protocol scheme
    const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed);
    const urlToParse = hasScheme ? trimmed : `https://${trimmed}`;
    parsed = new URL(urlToParse);
  } catch {
    return {
      isValid: false,
      error: 'Invalid URL format. Please include a valid domain such as https://example.com',
      code: 'INVALID_FORMAT',
    };
  }

  // Scheme must be http or https
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      isValid: false,
      error: `Unsupported protocol "${parsed.protocol}". Only standard HTTP and HTTPS websites can be evaluated.`,
      code: 'UNSUPPORTED_SCHEME',
    };
  }

  // Credentials are not permitted
  if (parsed.username || parsed.password) {
    return {
      isValid: false,
      error: 'URLs containing embedded user credentials (username/password) are not permitted.',
      code: 'CREDENTIALS_DISALLOWED',
    };
  }

  // Port restrictions
  if (!ALLOWED_PORTS.has(parsed.port)) {
    return {
      isValid: false,
      error: `Port "${parsed.port}" is not permitted. Only standard web ports (80, 443, 8080, 8443) are supported.`,
      code: 'INVALID_PORT',
    };
  }

  const rawHostname = parsed.hostname.toLowerCase();
  // Strip enclosing brackets for IPv6 and trailing dots for FQDNs
  const hostname = rawHostname.replace(/^\[|\]$/g, '').replace(/\.+$/, '');

  if (!hostname || hostname.length === 0) {
    return {
      isValid: false,
      error: 'URL does not contain a valid hostname.',
      code: 'INVALID_FORMAT',
    };
  }

  // Blocked hostnames and suffixes
  if (BLOCKED_HOSTNAMES.has(hostname) || BLOCKED_DOMAINS_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) {
    return {
      isValid: false,
      error: 'Access to local, internal, or loopback hostnames is restricted for security.',
      code: 'BLOCKED_HOST',
    };
  }

  // If hostname is directly an IP literal (e.g. 127.0.0.1 or 169.254.169.254 or [::1])
  if (isPrivateIP(hostname)) {
    return {
      isValid: false,
      error: 'Scanning private network addresses, loopback endpoints, or cloud metadata services is restricted.',
      code: 'PRIVATE_IP',
    };
  }

  // If DNS resolution is requested (server-side check)
  if (resolveDns) {
    try {
      const records = await dns.lookup(hostname, { all: true });
      if (!records || records.length === 0) {
        return {
          isValid: false,
          error: `Could not resolve domain "${hostname}". Please check that the website exists and is publicly accessible.`,
          code: 'DNS_RESOLUTION_FAILED',
        };
      }

      const resolvedIps = records.map((r) => r.address);
      for (const record of records) {
        if (isPrivateIP(record.address)) {
          return {
            isValid: false,
            error: 'This domain resolves to a private or internal network address, which is prohibited for security reasons.',
            code: 'PRIVATE_IP',
            resolvedIps,
          };
        }
      }

      return {
        isValid: true,
        normalizedUrl: parsed.toString(),
        resolvedIps,
      };
    } catch {
      return {
        isValid: false,
        error: `DNS resolution failed for "${hostname}". Website could not be reached.`,
        code: 'DNS_RESOLUTION_FAILED',
      };
    }
  }

  return {
    isValid: true,
    normalizedUrl: parsed.toString(),
  };
}
