import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTargetUrl, isPrivateIP } from '../lib/security/url-validator.ts';

test('isPrivateIP correctly identifies private IPv4 addresses', () => {
  // Loopback
  assert.equal(isPrivateIP('127.0.0.1'), true);
  assert.equal(isPrivateIP('127.255.255.255'), true);

  // RFC 1918 Private
  assert.equal(isPrivateIP('10.0.0.1'), true);
  assert.equal(isPrivateIP('10.255.0.1'), true);
  assert.equal(isPrivateIP('172.16.0.1'), true);
  assert.equal(isPrivateIP('172.31.255.255'), true);
  assert.equal(isPrivateIP('192.168.1.1'), true);
  assert.equal(isPrivateIP('192.168.0.254'), true);

  // Link-local & Cloud Metadata
  assert.equal(isPrivateIP('169.254.169.254'), true);
  assert.equal(isPrivateIP('169.254.0.1'), true);

  // Public IP
  assert.equal(isPrivateIP('93.184.216.34'), false); // example.com
  assert.equal(isPrivateIP('8.8.8.8'), false); // Google DNS
  assert.equal(isPrivateIP('1.1.1.1'), false); // Cloudflare DNS
});

test('isPrivateIP correctly identifies private IPv6 addresses', () => {
  assert.equal(isPrivateIP('::1'), true); // Loopback
  assert.equal(isPrivateIP('::'), true); // Unspecified
  assert.equal(isPrivateIP('fc00::1'), true); // Unique local
  assert.equal(isPrivateIP('fd12:3456::1'), true); // Unique local
  assert.equal(isPrivateIP('fe80::1'), true); // Link local
  assert.equal(isPrivateIP('::ffff:127.0.0.1'), true); // IPv4 mapped loopback
  assert.equal(isPrivateIP('::ffff:10.0.0.1'), true); // IPv4 mapped private
  assert.equal(isPrivateIP('::127.0.0.1'), true); // IPv4 compatible loopback
  assert.equal(isPrivateIP('::7f00:1'), true); // IPv4 compatible loopback hex
  assert.equal(isPrivateIP('2002:7f00:1::'), true); // 6to4 embedded loopback
  assert.equal(isPrivateIP('2002:a9fe:a9fe::'), true); // 6to4 embedded cloud metadata

  // Public IPv6
  assert.equal(isPrivateIP('2606:4700:4700::1111'), false); // Cloudflare DNS IPv6
  assert.equal(isPrivateIP('2001:4860:4860::8888'), false); // Google DNS IPv6
});

test('validateTargetUrl accepts valid public URLs without DNS check', async () => {
  const res1 = await validateTargetUrl('https://example.com', false);
  assert.equal(res1.isValid, true);
  assert.equal(res1.normalizedUrl, 'https://example.com/');

  const res2 = await validateTargetUrl('http://subdomain.example.org:8080/test?query=1', false);
  assert.equal(res2.isValid, true);
  assert.equal(res2.normalizedUrl, 'http://subdomain.example.org:8080/test?query=1');

  // Prepends protocol if omitted
  const res3 = await validateTargetUrl('example.com/accessibility', false);
  assert.equal(res3.isValid, true);
  assert.equal(res3.normalizedUrl, 'https://example.com/accessibility');
});

test('validateTargetUrl rejects dangerous or invalid URLs', async () => {
  // Empty or invalid format
  const res1 = await validateTargetUrl('', false);
  assert.equal(res1.isValid, false);
  assert.equal(res1.code, 'INVALID_FORMAT');

  // Unsupported schemes
  const res2 = await validateTargetUrl('file:///etc/passwd', false);
  assert.equal(res2.isValid, false);
  assert.equal(res2.code, 'UNSUPPORTED_SCHEME');

  const res3 = await validateTargetUrl('ftp://ftp.example.com', false);
  assert.equal(res3.isValid, false);
  assert.equal(res3.code, 'UNSUPPORTED_SCHEME');

  const res4 = await validateTargetUrl('javascript:alert(1)', false);
  assert.equal(res4.isValid, false);
  assert.equal(res4.code, 'UNSUPPORTED_SCHEME');

  // Embedded credentials
  const res5 = await validateTargetUrl('https://user:password@example.com', false);
  assert.equal(res5.isValid, false);
  assert.equal(res5.code, 'CREDENTIALS_DISALLOWED');

  // Blocked ports
  const res6 = await validateTargetUrl('https://example.com:22', false);
  assert.equal(res6.isValid, false);
  assert.equal(res6.code, 'INVALID_PORT');

  const res7 = await validateTargetUrl('https://example.com:3306', false);
  assert.equal(res7.isValid, false);
  assert.equal(res7.code, 'INVALID_PORT');

  // Blocked hostnames & suffixes
  const res8 = await validateTargetUrl('http://localhost:8080', false);
  assert.equal(res8.isValid, false);
  assert.equal(res8.code, 'BLOCKED_HOST');

  const res9 = await validateTargetUrl('http://service.local', false);
  assert.equal(res9.isValid, false);
  assert.equal(res9.code, 'BLOCKED_HOST');

  const res10 = await validateTargetUrl('http://admin.internal', false);
  assert.equal(res10.isValid, false);
  assert.equal(res10.code, 'BLOCKED_HOST');

  // Direct private IP literals
  const res11 = await validateTargetUrl('http://127.0.0.1:80', false);
  assert.equal(res11.isValid, false);
  assert.equal(res11.code, 'PRIVATE_IP');

  const res12 = await validateTargetUrl('http://169.254.169.254', false);
  assert.equal(res12.isValid, false);
  assert.equal(res12.code, 'PRIVATE_IP');

  // IPv6 bracketed private literals
  const res13 = await validateTargetUrl('http://[::1]', false);
  assert.equal(res13.isValid, false);
  assert.equal(res13.code, 'PRIVATE_IP');

  const res14 = await validateTargetUrl('http://[::ffff:127.0.0.1]', false);
  assert.equal(res14.isValid, false);
  assert.equal(res14.code, 'PRIVATE_IP');

  const res15 = await validateTargetUrl('http://[::ffff:7f00:1]', false);
  assert.equal(res15.isValid, false);
  assert.equal(res15.code, 'PRIVATE_IP');

  const res16 = await validateTargetUrl('http://[::ffff:a9fe:a9fe]', false);
  assert.equal(res16.isValid, false);
  assert.equal(res16.code, 'PRIVATE_IP');

  const res17 = await validateTargetUrl('http://[fc00::1]', false);
  assert.equal(res17.isValid, false);
  assert.equal(res17.code, 'PRIVATE_IP');

  // IPv4-compatible IPv6 and 6to4 literals
  const res18 = await validateTargetUrl('http://[::127.0.0.1]', false);
  assert.equal(res18.isValid, false);
  assert.equal(res18.code, 'PRIVATE_IP');

  const res19 = await validateTargetUrl('http://[::7f00:1]', false);
  assert.equal(res19.isValid, false);
  assert.equal(res19.code, 'PRIVATE_IP');

  const res20 = await validateTargetUrl('http://[2002:7f00:1::]', false);
  assert.equal(res20.isValid, false);
  assert.equal(res20.code, 'PRIVATE_IP');

  // Trailing dot FQDN bypass prevention
  const res21 = await validateTargetUrl('http://localhost.:8080', false);
  assert.equal(res21.isValid, false);
  assert.equal(res21.code, 'BLOCKED_HOST');

  // Container hostnames
  const res22 = await validateTargetUrl('http://host.docker.internal', false);
  assert.equal(res22.isValid, false);
  assert.equal(res22.code, 'BLOCKED_HOST');
});
