# WebForAll

> **A Better Web for Everyone.**  
> A transparent, privacy-first web accessibility evaluation platform powered by `axe-core`.

---

## 1. Project Overview & Identity

**WebForAll** is an open web platform built to help developers, designers, and site owners identify potential accessibility barriers on public web pages, understand who those barriers affect, and take practical steps toward remediation.

### The Problem We Solve
Millions of users who rely on screen readers, keyboard-only navigation, high contrast, or other assistive technologies face barriers on everyday websites. Website creators often want to fix these issues but lack straightforward, understandable, and honest tools.

### Core Value Proposition
- **Genuine Accessibility Testing:** Runs real, deterministic `axe-core` rule evaluation. No hardcoded or simulated scan reports.
- **Educational & Actionable:** Every finding explains *What is wrong*, *Why it matters*, *Who is affected*, *Where it was found* (with exact selectors and HTML evidence), and *How to fix it* (with before-and-after code examples).
- **Honest Reporting:** No fake single 0–100 scores. Transparent disclosures regarding the boundaries between automated detection (~30–50% of WCAG criteria) and manual evaluation.
- **Privacy by Design:** Zero database (no accounts, no passwords, no stored scan history). Everything runs in ephemeral memory and client state.

---

## 2. Key Features

1. **Live Website Scanner (`/`)**
   - Evaluates publicly accessible HTTP/HTTPS web pages.
   - Immediate feedback with real-time ARIA live region status announcements.
   - Comprehensive error handling for unreachable targets, firewalls, and timeouts.

2. **Interactive Demonstration Mode (`/demo`)**
   - Evaluates a controlled inaccessible sample fixture (`Apex Community Outfitters` store page) with intentional flaws:
     - Missing image `alt` attribute
     - Icon-only button lacking accessible name
     - Form input without label
     - Skipped heading levels (`<h1>` directly to `<h4>`)
     - Content outside landmark regions
   - Evaluated by the **exact same testing engine** as live scans.
   - Includes an inline code viewer and a live preview endpoint (`/api/demo/preview`).

3. **In-Depth Accessibility Report View**
   - Overview metrics: Total violations, total affected elements, breakdown by impact (Critical, Serious, Moderate, Minor), incomplete checks, and passed rules.
   - Search bar to filter findings by rule ID, title, or DOM selector.
   - Impact filter chips (Critical, Serious, Moderate, Minor).
   - Accordion cards with keyboard support (`Enter` / `Space`, ARIA expanded state).
   - One-click **"Copy Selector"** with clipboard feedback.
   - Dedicated **"Needs Human Review"** tab explaining why certain criteria require manual context (e.g. visual contrast, meaningful descriptions).
   - Dedicated **"Passed Checks"** tab highlighting verified rules.
   - Export tools:
     - **Download JSON Report:** Sanitized, structured report file.
     - **Print / Save as PDF:** Custom `@media print` layout stripping UI chrome.

4. **Educational Accessibility Guide (`/guide`)**
   - The 4 POUR principles (Perceivable, Operable, Understandable, Robust).
   - Automated vs. manual testing comparison.
   - Top 5 common barriers with practical developer remedies.
   - Authoritative links to W3C WAI, WCAG 2.1 specifications, and Deque University.

5. **About & Security Policy (`/about`)**
   - Architecture walkthrough.
   - Zero-retention privacy policy.
   - SSRF defense specification.

6. **Accessibility of WebForAll Itself**
   - Semantic HTML5 structure (`header`, `main`, `footer`, `section`, `article`, `nav`).
   - High-contrast visual focus rings (`:focus-visible`).
   - Screen-reader skip-to-content link.
   - ARIA live region for scan announcements.
   - Respects `prefers-reduced-motion`.

---

## 3. Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       WebForAll UI                          │
│        (Next.js App Router + TypeScript + Tailwind CSS)     │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
        POST /api/scan                  GET /api/demo
               │                               │
┌──────────────▼────────────────┐      ┌───────▼──────────────┐
│       SSRF Defense &          │      │ Controlled Fixture   │
│       Safe HTTP Fetcher       │      │     (DEMO_HTML)      │
│  - DNS resolution check       │      └───────┬──────────────┘
│  - Private IP blocking        │              │
│  - Cloud metadata block       │              │
│  - Redirect verification      │              │
│  - 12s timeout / 5MB cap      │              │
└──────────────┬────────────────┘              │
               │                               │
               └───────────────┬───────────────┘
                               │
               ┌───────────────▼───────────────┐
               │    axe-core Headless Engine   │
               │         (JSDOM DOM)           │
               │  - Runs WCAG 2.1 A/AA rules   │
               │  - Extracts violations        │
               │  - Incomplete & passed checks │
               └───────────────┬───────────────┘
                               │
               ┌───────────────▼───────────────┐
               │     Remediation Knowledge     │
               │     Base & Report Normalizer  │
               └───────────────┬───────────────┘
                               │
                        JSON Response
```

### Technology Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5 (Strict Mode)
- **Styling:** Tailwind CSS 3
- **Icons:** `lucide-react`
- **Accessibility Testing Engine:** `axe-core` 4.14
- **DOM Parsing & Environment:** `jsdom` 30
- **Test Runner:** Node.js native test runner via `tsx`

### Scanning Architecture Decisions
Rather than embedding fragile, memory-heavy headless browser binaries (e.g. 300MB Chromium bundles) that exceed serverless deployment limits and trigger timeouts on free hosting plans, WebForAll utilizes a high-performance **headless JSDOM virtual DOM** coupled directly with `axe-core`.

- **Speed:** Full page scan executes in under 1.5 seconds.
- **Reliability:** 100% serverless compatible (Vercel, AWS Lambda, Docker) without native library incompatibilities or missing C++ shared libraries.
- **Scope Transparency:** Evaluates HTML structure, headings, forms, landmark regions, image alternatives, language tags, and ARIA relationships. Honest notice explains that full layout-dependent CSS color contrast requires human verification.

---

## 4. Security & Privacy Engineering

### SSRF Protection (`lib/security/url-validator.ts` & `safe-fetch.ts`)
1. **Scheme Validation:** Permits only `http:` and `https:`. Rejects `file:`, `ftp:`, `javascript:`, and data URLs.
2. **Credential Sanitization:** Rejects URLs with embedded user credentials (`user:pass@host`).
3. **Port Enforcement:** Only standard web ports (80, 443, 8080, 8443) are allowed.
4. **DNS Resolution & Private IP Blacklisting:** Resolves target domain before connection and checks every resolved IP against:
   - IPv4 Loopback (`127.0.0.0/8`)
   - IPv4 Private Networks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`)
   - Link-local & Cloud Metadata (`169.254.0.0/16`, specifically `169.254.169.254`)
   - Carrier-grade NAT (`100.64.0.0/10`)
   - Multicast & Reserved (`224.0.0.0/4`, `240.0.0.0/4`)
   - IPv6 Loopback (`::1`), Unspecified (`::`), Link-local (`fe80::/10`), Unique Local (`fc00::/7`), IPv4-mapped IPv6 (`::ffff:x.x.x.x`)
5. **Per-Hop Redirect Defense:** Follows redirects manually (up to 5 max). Every redirect target is validated through the full DNS and IP security filter before following.
6. **Timeouts & Memory Limits:** Strict 12-second abort timeout and 5 MB content-length streaming cap.
7. **HTML Evidence Sanitization:** Code snippets extracted from third-party websites are treated as untrusted data and strictly escaped inside code blocks to prevent XSS.

---

## 5. Getting Started & Development

### Prerequisites
- Node.js 20+ (Node 24 recommended)
- npm 10+

### Installation
```bash
git clone https://github.com/nabeel05-ship-it/webforall.git
cd webforall
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Tests
The project includes automated unit and integration tests covering SSRF security, URL validation, the axe-runner, fixture evaluation, and remediation mapping:
```bash
npm test
```

### Production Build
```bash
npm run build
npm start
```

---

## 6. Environment Variables & Configuration

**No environment variables or paid API keys are required.**

WebForAll runs entirely out of the box with zero external databases, zero paid AI services, and zero third-party telemetry.

---

## 7. Known Boundaries & Limitations

1. **Automated vs. Manual Testing:**
   Automated scans identify approximately 30% to 50% of potential WCAG issues. No automated tool can guarantee full compliance. Screen reader usability testing and manual keyboard walkthroughs are always required.
2. **Single-Page Scope:**
   Scanning a target URL evaluates the single HTML page returned at that address. It does not crawl an entire multi-page domain.
3. **Client-Side Heavy SPA Hydration:**
   The serverless engine evaluates the static/SSR HTML returned by the target server. Sites relying entirely on client-side client hydration with no initial SSR HTML will produce findings corresponding to their initial shell.

---

## 8. License & Ethical Notice

Built for digital accessibility, public benefit, and inclusive technology education.
Released under the ISC License.
