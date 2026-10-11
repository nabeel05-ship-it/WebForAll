<div align="center">

<img src="public/brand/webforall-icon.png" alt="WebForAll Logo" width="84" height="84" />

# WebForAll

**Making the web more accessible, one scan at a time.**

[![Next.js](https://img.shields.io/badge/Next.js-16.4.0-black?logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-blue?logo=typescript)](https://www.typescriptlang.org/)
[![axe-core](https://img.shields.io/badge/axe--core-4.14.0-blue)](https://github.com/dequelabs/axe-core)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.19-38b2ac?logo=tailwindcss)](https://tailwindcss.com/)

[Live Demo](https://webforall-seven.vercel.app/) &bull; [GitHub Repository](https://github.com/nabeel05-ship-it/webforall) &bull; [Issue Tracker](https://github.com/nabeel05-ship-it/webforall/issues)

</div>

---

## Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Local Installation and Development](#local-installation-and-development)
- [API Documentation](#api-documentation)
- [Accessibility Scope and Limitations](#accessibility-scope-and-limitations)
- [Security and Privacy Engineering](#security-and-privacy-engineering)
- [Testing and Quality Assurance](#testing-and-quality-assurance)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Overview

**WebForAll** is an open-source web application designed to evaluate public web pages for digital accessibility barriers, explain who is impacted by those barriers, and provide actionable developer guidance to resolve them.

### The Problem

Over one billion people worldwide live with disabilities, including visual, auditory, motor, and cognitive impairments. When websites omit alternative text, misconfigure heading structures, neglect form labels, or build inaccessible interactive components, individuals relying on screen readers, screen magnifiers, speech navigation, or keyboard-only input face critical obstacles.

While many engineering teams and site owners recognize the importance of web accessibility, they are often hindered by:
- Opaque "compliance score" overlays that make false legal guarantees without repairing underlying source code.
- Expensive enterprise audit platforms with steep learning curves.
- Dense technical reports that list rule violation codes without explaining real-world user impact or providing copy-ready code fixes.

### What WebForAll Delivers

WebForAll bridges the gap between raw accessibility specifications and practical software engineering:

- **Deterministic Evaluation:** Runs genuine Deque `axe-core` rule audits in an isolated virtual DOM. No synthetic, simulated, or randomized scores.
- **Actionable Remediation Guidance:** Every identified issue includes an explanation of *What is wrong*, *Why it matters*, *Who is affected*, the exact CSS selectors and HTML snippets involved, and before-and-after code solutions.
- **Privacy-First Architecture:** Operates entirely in ephemeral memory. No user accounts, no databases, and no persistent storage of scanned content or audit reports.
- **Educational Empowerment:** Includes an interactive demonstration storefront with intentional accessibility flaws and an educational field guide with real-time accessibility simulation tools.

### Core Scan Workflow

```
┌─────────────────┐       ┌─────────────────┐       ┌──────────────────┐
│  1. Submit URL  │ ────> │ 2. Validate URL │ ────> │  3. Secure Fetch │
│  (Target Page)  │       │ (SSRF & Scheme) │       │ (DNS, IP Filter) │
└─────────────────┘       └─────────────────┘       └─────────┬────────┘
                                                              │
┌─────────────────┐       ┌─────────────────┐                 │
│ 6. Export PDF / │ <──── │ 5. Remediation  │ <───────────────┘
│   JSON Report   │       │    Catalog Map  │       │ 4. axe-core Scan │
└─────────────────┘       └─────────────────┘       │    (JSDOM DOM)   │
                                                    └──────────────────┘
```

1. **URL Submission:** A user submits a publicly accessible HTTP or HTTPS URL.
2. **URL Validation:** The server normalizes the address, checks protocols, disallows embedded credentials, and verifies port allowlists.
3. **Secure Fetching:** The server pre-resolves DNS records, verifies resolved IP addresses against private and cloud-metadata blacklists, and retrieves the page HTML under strict streaming size and timeout caps.
4. **Automated Evaluation:** The retrieved HTML is loaded into a sandboxed headless virtual DOM (`jsdom`), where `axe-core` tests WCAG 2.0 and WCAG 2.1 Level A/AA rules along with established best practices.
5. **Remediation Mapping:** Violations, incomplete checks requiring human review, and passed rules are normalized and paired with educational guidance from the built-in remediation catalog.
6. **Inspection & Export:** The user inspects findings in an interactive dashboard, copies selectors, or exports the audit report as a structured PDF or JSON document.

---

## How It Works

### Architecture Overview

WebForAll is built as a unified Next.js App Router application written in TypeScript. 

```
┌────────────────────────────────────────────────────────────────────────┐
│                        WebForAll User Interface                        │
│               Next.js App Router (React 19, Tailwind CSS)              │
│   ├── Home Page (/) ────────────── URL scanner form & report viewer    │
│   ├── Demo Page (/demo) ────────── Controlled storefront fixture       │
│   ├── Guide Page (/guide) ──────── Accessibility educational reference │
│   └── About Page (/about) ──────── Mission, privacy & security specs   │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
           POST /api/scan                     GET /api/demo
                   │                                 │
┌──────────────────▼─────────────────┐       ┌───────▼───────────────────┐
│     SSRF Defense & Safe Fetch      │       │    Controlled Storefront  │
│  - Protocol & port validation      │       │           Fixture         │
│  - DNS pre-resolution checks       │       │    (6 intentional flaws)  │
│  - RFC 1918 & metadata IP filters  │       └───────┬───────────────────┘
│  - Per-hop redirect inspection     │               │
│  - 10s timeout / 5 MB size limit   │               │
└──────────────────┬─────────────────┘               │
                   │                                 │
                   └────────────────┬────────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │    Headless Testing Engine    │
                    │      (Node.js + jsdom)        │
                    │   - Isolated DOM tree         │
                    │   - axe-core 4.14 evaluation  │
                    │   - WCAG 2.1 Level A/AA tags  │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │   Remediation Normalizer &    │
                    │      Knowledge Catalog        │
                    │   - Impact classification     │
                    │   - Selective HTML snippet    │
                    │   - Code remediation guides   │
                    └───────────────┬───────────────┘
                                    │
                               JSON Output
                                    │
                    ┌───────────────▼───────────────┐
                    │      Client Presentation      │
                    │   - Interactive filtering     │
                    │   - Selector clipboard copy   │
                    │   - Multi-page PDF generation │
                    │     (client-side jsPDF)       │
                    └───────────────────────────────┘
```

### Why Headless JSDOM over Browser Binaries?

Many web scanners bundle full Chromium installations (e.g., Puppeteer or Playwright). While browser automation allows executing dynamic single-page application scripts, bundled browser binaries introduce significant drawbacks:
- 300+ MB binary footprints that exceed serverless deployment limits.
- Cold-start delays of 8–15 seconds per invocation.
- Frequent crashes caused by missing operating system shared libraries in cloud environments.

WebForAll executes `axe-core` directly inside a lightweight Node.js `jsdom` virtual DOM. This yields:
- Sub-second scan execution times.
- Zero external browser daemon dependencies.
- 100% serverless compatibility on platforms like Vercel and AWS Lambda.

---

## Key Features

### 1. Live Website Scanner (`/`)
- Scans any publicly accessible HTTP or HTTPS URL.
- ARIA live announcements keep screen readers informed throughout scan progress.
- Comprehensive user feedback for invalid URLs, unreachable hosts, timeouts, and blocked targets.

### 2. In-Depth Report Dashboard
- **Executive Metric Summary:** Displays total violations, affected DOM nodes, breakdown by severity (Critical, Serious, Moderate, Minor), incomplete checks, and passed checks.
- **Search & Filtering:** Search findings dynamically by rule ID, title, description, or CSS selector. Filter cards by severity level.
- **Interactive Accordions:** Expand individual findings to inspect element targets, failure summaries, and remediation advice. Supports keyboard navigation (`Enter` / `Space`).
- **Selector Utility:** One-click button to copy unique CSS selectors directly to the clipboard.
- **Remediation Knowledge Catalog:** Displays structured remediation guides explaining user impact and providing before/after code blocks.
- **"Needs Human Review" Tab:** Highlights incomplete checks that require human context (such as color contrast on complex backgrounds or audio transcript quality).
- **"Passed Checks" Tab:** Lists verified rules that showed no detected violations.
- **Multi-Format Export:**
  - **PDF Export:** Generates a clean, multi-page document using `jsPDF` without third-party server rendering.
  - **JSON Export:** Downloads the complete structured audit report payload.
  - **Print Layout:** Includes dedicated print styles (`@media print`) that remove navigation chrome and expand finding cards for printing.

### 3. Interactive Demonstration Mode (`/demo`)
- Scans a controlled storefront fixture (`Apex Community Outfitters`) containing 6 intentional accessibility barriers:
  1. Missing image alternative text (`image-alt`)
  2. Icon-only button lacking discernible text (`button-name`)
  3. Form input without an accessible label (`label`)
  4. Heading order skipping levels from `<h1>` to `<h4>` (`heading-order`)
  5. Content placed outside landmark regions (`region`)
  6. Unlabeled cart icon link (`link-name`)
- Runs through the exact same server-side `axe-core` pipeline as live scans.
- Features an inline HTML source viewer and a standalone fixture preview route (`/api/demo/preview`).

### 4. Educational Field Guide (`/guide`)
- Explains the four WCAG POUR principles: Perceivable, Operable, Understandable, and Robust.
- Clarifies the boundaries between automated testing and manual evaluation.
- Details the top 5 most frequent web accessibility barriers with code solutions.
- **Interactive Accessibility Lab:**
  - *Accessible Name Simulator:* Demonstrates how screen readers compute accessible labels from visible text, `aria-label`, or icon buttons.
  - *WCAG Color Contrast Calculator:* Computes relative luminance and contrast ratios in real time, validating results against WCAG 2.1 Level AA (4.5:1) and AAA (7.0:1) standards.

### 5. Accessibility-Conscious Platform Design
- Valid semantic HTML5 hierarchy (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`).
- Screen-reader skip-to-content shortcut (`#main-content`).
- High-contrast visual focus rings (`:focus-visible`).
- Respects user operating system motion preferences via `prefers-reduced-motion`.

---

## Technology Stack

| Technology | Version | Purpose in WebForAll |
|:---|:---|:---|
| **[Next.js](https://nextjs.org/)** | `16.4.0` | React framework providing App Router, serverless route handlers, and static optimization |
| **[React](https://react.dev/)** | `19.3.0` | UI component library with Server and Client Components |
| **[TypeScript](https://www.typescriptlang.org/)** | `7.0.2` | Static type safety and strict interface definitions across scanner and security libraries |
| **[axe-core](https://github.com/dequelabs/axe-core)** | `^4.14.0` | Industry-standard accessibility testing engine for WCAG rule evaluation |
| **[jsdom](https://github.com/jsdom/jsdom)** | `^30.1.2` | Pure-JavaScript DOM implementation for running axe-core in Node.js server environments |
| **[jsPDF](https://github.com/parallax/jsPDF)** | `^4.2.1` | Client-side vector generation of downloadable multi-page accessibility reports |
| **[Tailwind CSS](https://tailwindcss.com/)** | `^3.4.19` | Utility-first styling with custom "Bright Signals" design system and dark/light palettes |
| **[motion](https://motion.dev/)** | `^14.1.0` | Accessible micro-animations with integrated reduced-motion detection |
| **[lucide-react](https://lucide.dev/)** | `^1.55.0` | Accessible iconography across navigation, report metrics, and finding badges |
| **[tsx](https://github.com/privatenumber/tsx)** | `^4.23.15` | TypeScript execution runtime for running Node.js unit and integration tests |

---

## Project Structure

```
webforall/
├── app/                                # Next.js App Router root
│   ├── about/
│   │   └── page.tsx                    # Mission, security policy & architecture page
│   ├── api/
│   │   ├── demo/
│   │   │   ├── preview/
│   │   │   │   └── route.ts            # GET: Serves raw HTML fixture
│   │   │   └── route.ts                # GET/POST: Evaluates demo fixture via axe-core
│   │   └── scan/
│   │       └── route.ts                # POST: Safe URL fetch & axe-core scan handler
│   ├── demo/
│   │   └── page.tsx                    # Interactive demo storefront page
│   ├── guide/
│   │   └── page.tsx                    # Accessibility field guide & POUR documentation
│   ├── globals.css                     # Global styles, color tokens & print layout
│   ├── layout.tsx                      # Root layout with Header, Footer, skip link, metadata
│   ├── manifest.ts                     # Web App Manifest configuration
│   └── page.tsx                        # Homepage with scanner form & report viewer
├── components/                         # Reusable React components
│   ├── BrandLogo.tsx                   # Official icon + readable wordmark branding
│   ├── Footer.tsx                      # Global footer navigation & metadata
│   ├── Header.tsx                      # Global responsive header navigation
│   ├── InteractiveA11yLab.tsx          # Accessible Name simulator & contrast calculator
│   ├── ReportView.tsx                  # Accessibility report dashboard & export controls
│   └── SkipToContent.tsx               # Keyboard skip-to-content accessibility link
├── lib/                                # Core business logic & libraries
│   ├── fixtures/
│   │   ├── demo-fixture.ts             # Raw inaccessible HTML fixture string
│   │   └── demo-page.ts                # Demo scan orchestration helper
│   ├── motion.ts                       # Motion variants with prefers-reduced-motion helpers
│   ├── reports/
│   │   └── pdf-generator.ts            # Client-side multi-page PDF generation via jsPDF
│   ├── scanner/
│   │   ├── axe-runner.ts               # JSDOM + axe-core execution engine
│   │   ├── remediation-catalog.ts      # Educational catalog with user impact & code fixes
│   │   └── types.ts                    # TypeScript definitions for reports & findings
│   └── security/
│       ├── safe-fetch.ts               # SSRF-guarded HTTP fetcher with size & timeout caps
│       └── url-validator.ts            # URL parser, port filter & private IP blacklists
├── public/                             # Static public assets
│   ├── brand/
│   │   ├── webforall-full-logo.png     # Full brand banner asset
│   │   ├── webforall-icon.png          # Circular icon asset (used in header & favicon)
│   │   └── webforall-icon.jpg          # Alternate icon asset
│   └── favicon.ico                     # Browser favicon
├── tests/                              # Automated test suites
│   ├── pdf-generator.test.js           # PDF generation & filename sanitization tests
│   ├── scanner-engine.test.js          # axe-core scanner & remediation catalog tests
│   └── url-validator.test.js           # SSRF & IP validation security tests
├── next.config.mjs                     # Next.js configuration (serverExternalPackages)
├── package.json                        # Project metadata, scripts, and dependencies
├── postcss.config.js                   # PostCSS configuration for Tailwind CSS
├── tailwind.config.js                  # Tailwind design tokens, typography, and colors
└── tsconfig.json                       # TypeScript compiler configuration
```

---

## Local Installation and Development

### Prerequisites

- **Node.js:** Version 20.x, 22.x, or 24.x (Node.js 24 LTS recommended)
- **npm:** Version 10.x or later
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/nabeel05-ship-it/webforall.git
cd webforall
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The application will hot-reload as source files change.

### 4. Run Linting and Type Checking

WebForAll enforces strict TypeScript compilation:

```bash
npm run lint
```
*(Executes `tsc --noEmit`)*

### 5. Run the Automated Test Suite

WebForAll uses the Node.js native test runner via `tsx`:

```bash
npm test
```
*(Executes `tsx --test tests/**/*.test.js`)*

### 6. Build for Production

To create an optimized production build:

```bash
npm run build
```

To run the production server locally after building:

```bash
npm start
```

### Environment Variables

**No environment variables are required.** WebForAll operates without third-party API keys, authentication secrets, or external databases.

---

## API Documentation

All server-side endpoints are implemented as Next.js Route Handlers.

### 1. `POST /api/scan`

Evaluates a publicly accessible website URL for accessibility barriers using `axe-core`.

- **Method:** `POST`
- **Content-Type:** `application/json`
- **Headers:** None required

#### Request Body

```json
{
  "url": "https://example.com"
}
```

#### Success Response (`200 OK`)

```json
{
  "success": true,
  "report": {
    "targetUrl": "https://example.com",
    "finalUrl": "https://example.com/",
    "timestamp": "2026-10-12T00:00:00.000Z",
    "scanDurationMs": 482,
    "engine": {
      "name": "axe-core",
      "version": "4.14.0",
      "environment": "Serverless Node.js (JSDOM Virtual DOM)"
    },
    "summary": {
      "totalViolations": 1,
      "totalAffectedElements": 2,
      "byImpact": {
        "critical": 0,
        "serious": 1,
        "moderate": 0,
        "minor": 0
      },
      "incompleteCount": 3,
      "passedCount": 18
    },
    "violations": [
      {
        "id": "image-alt",
        "impact": "critical",
        "title": "Images Must Have Alternative Text",
        "description": "Ensures <img> elements have alternate text or a role of none or presentation",
        "help": "Images must have alternate text",
        "helpUrl": "https://dequeuniversity.com/rules/axe/4.14/image-alt",
        "tags": ["cat.text-alternatives", "wcag2a", "wcag111", "section508"],
        "nodes": [
          {
            "target": ["img.hero-banner"],
            "html": "<img class=\"hero-banner\" src=\"banner.jpg\">",
            "failureSummary": "Fix any of the following:\n  Element does not have an alt attribute"
          }
        ],
        "remediation": {
          "ruleId": "image-alt",
          "friendlyTitle": "Images Must Have Alternative Text",
          "whatIsWrong": "An image element is missing an alt attribute.",
          "whyItMatters": "Screen readers read alternative text aloud to convey image meaning.",
          "whoIsAffected": "Blind and low-vision individuals using screen reading software.",
          "howToFix": "Add a descriptive alt attribute, or alt=\"\" if decorative.",
          "codeExample": {
            "incorrect": "<img src=\"product.jpg\">",
            "correct": "<img src=\"product.jpg\" alt=\"Silver travel backpack with padded straps\">",
            "explanation": "Provide concise text describing the image content."
          },
          "wcagCriteria": ["WCAG 2.1 - 1.1.1 Non-text Content (Level A)"],
          "referenceUrl": "https://dequeuniversity.com/rules/axe/4.10/image-alt"
        }
      }
    ],
    "incomplete": [
      {
        "id": "color-contrast",
        "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
        "help": "Elements must meet minimum color contrast ratio thresholds",
        "helpUrl": "https://dequeuniversity.com/rules/axe/4.14/color-contrast",
        "nodesCount": 1,
        "reason": "Requires manual verification or visual context not fully computable automatically."
      }
    ],
    "passes": [
      {
        "id": "document-title",
        "description": "Ensure each HTML document contains a non-empty <title> element",
        "help": "Documents must have <title> element to aid in navigation"
      }
    ],
    "disclaimer": "Automated scanning detects a subset of potential accessibility barriers...",
    "isDemo": false
  }
}
```

#### Error Responses

| Status | Code | Description |
|:---|:---|:---|
| `400 Bad Request` | `MISSING_URL` | Request body did not contain a string `url` property. |
| `400 Bad Request` | `EMPTY_URL` | The provided `url` was empty or whitespace. |
| `422 Unprocessable` | `SSRF_BLOCKED` | Target resolves to a private IP, loopback, cloud metadata address, or unpermitted scheme. |
| `422 Unprocessable` | `TIMEOUT` | Fetch request exceeded the 10-second connection timeout. |
| `422 Unprocessable` | `PAYLOAD_TOO_LARGE` | Response exceeded the 5 MB streaming limit. |
| `422 Unprocessable` | `MAX_REDIRECTS_EXCEEDED` | Target performed more than 5 consecutive redirects. |
| `500 Server Error` | `SCAN_FAILED` | Internal virtual DOM parsing or engine execution failure. |

---

### 2. `GET /api/demo`

Executes `axe-core` analysis against the internal inaccessible storefront fixture (`DEMO_HTML`) and returns an `AccessibilityReport`.

- **Method:** `GET` (also accepts `POST`)
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "report": {
      "targetUrl": "https://demo.webforall.local/sample-inaccessible-page",
      "isDemo": true,
      "summary": { "totalViolations": 6, ... }
    }
  }
  ```

---

### 3. `GET /api/demo/preview`

Returns the raw, rendered HTML fixture used for demonstration testing as a standalone web page.

- **Method:** `GET`
- **Response Headers:**
  - `Content-Type: text/html; charset=utf-8`
  - `X-Robots-Tag: noindex, nofollow`
- **Success Response (`200 OK`):** Returns the HTML document string for `Apex Community Outfitters`.

---

## Accessibility Scope and Limitations

WebForAll advocates for honest, transparent accessibility engineering. Automated scanning tools play an indispensable role in continuous delivery, but they do not replace human evaluation.

### What Automated Scanning Detects (~30%–50% of WCAG Criteria)
- Missing structural landmarks (`<main>`, `<nav>`, `<header>`).
- Image alternative text omissions (`alt` attribute presence).
- Form controls lacking accessible names (`<label>`, `aria-label`).
- Heading level hierarchy skipping (e.g., `<h1>` followed directly by `<h4>`).
- Buttons and links without discernible text content.
- Missing document language attributes (`<html lang="en">`).
- Invalid ARIA attributes, roles, and child-parent relationship rules.

### What Requires Manual Human Review
- **Contextual Meaning:** Automated tools verify that `alt="image"` exists, but cannot evaluate whether the text accurately describes the image context.
- **Reading Order:** Ensuring that layout CSS (`order`, `flex-direction`, absolute positioning) preserves logical tab and reading sequences.
- **Dynamic Color Contrast:** Testing text placed across complex background gradients, photography, or transparency overlays.
- **Assistive Technology Usability:** Verifying how screen readers (NVDA, JAWS, VoiceOver), switch access, and screen magnification actually experience interactive workflows.

> **Important Conformance Notice:**  
> A scan with zero detected automated violations does **not** certify that a website is 100% WCAG-compliant or free of accessibility barriers. Full accessibility requires manual review, keyboard testing, and user feedback from individuals with disabilities.

---

## Security and Privacy Engineering

Because WebForAll accepts arbitrary URLs from users and fetches them server-side, it implements multi-layered Server-Side Request Forgery (SSRF) and data-privacy protections.

### Implemented Security Controls (`lib/security/`)

1. **Protocol Allowlisting:** Only `http:` and `https:` schemes are permitted. Schemes such as `file:`, `ftp:`, `data:`, `javascript:`, and `gopher:` are rejected.
2. **Port Restrictions:** Requests are restricted to standard web ports: `80`, `443`, `8080`, and `8443`.
3. **Disallowed Credentials:** URLs containing user credentials (e.g., `https://user:password@example.com`) are rejected before resolution.
4. **Pre-Flight DNS Resolution:** The destination hostname is resolved via `node:dns/promises` before opening an HTTP connection.
5. **Private and Reserved IP Blocking:** Every resolved IPv4 and IPv6 address is evaluated against strict network filters:
   - Loopback addresses (`127.0.0.0/8`, `::1`)
   - RFC 1918 Private ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`)
   - Link-local and Cloud Metadata addresses (`169.254.0.0/16`, specifically `169.254.169.254`)
   - Carrier-grade NAT (`100.64.0.0/10`)
   - IPv6 Link-local (`fe80::/10`) and Unique Local (`fc00::/7`)
   - Multicast, broadcast, and reserved test ranges
6. **Per-Hop Redirect Defense:** The HTTP client uses manual redirect handling (`redirect: 'manual'`). Every redirect destination (up to a maximum of 5 hops) is passed through full DNS and IP validation before being requested.
7. **Resource Quotas:**
   - **Timeout:** 10-second abort signal armed across connection and streaming read phases.
   - **Payload Limit:** 5 MB streaming byte cap prevents memory exhaustion attacks.
8. **HTML Evidence Sanitization:** Code snippets extracted from scanned pages are safely truncated (max 400 characters) and treated as untrusted text within preformatted code containers to prevent XSS.

### Privacy Policy
- **Zero Database Persistence:** WebForAll does not store user accounts, scanned URLs, or audit reports in any database (no SQL, MongoDB, or third-party storage).
- **Ephemeral In-Memory Execution:** Scanned HTML is parsed in volatile process memory and discarded immediately once the scan response is returned.

---

## Testing and Quality Assurance

The test suite covers security defenses, the scanning engine, fixture evaluation, remediation catalog mappings, and PDF generation.

### Run Tests

```bash
npm test
```

### Verified Test Suites

```
✔ sanitizeHostnameForFilename extracts clean alphanumeric filenames (tests/pdf-generator.test.js)
✔ createPdfDocument generates genuine multi-page PDF from real report fixture (tests/pdf-generator.test.js)
✔ createPdfDocument handles zero violations report cleanly (tests/pdf-generator.test.js)
✔ runAxeScan detects violations accurately on sample markup with accessibility issues (tests/scanner-engine.test.js)
✔ runAxeScan on accessible markup returns 0 violations and records passed rules (tests/scanner-engine.test.js)
✔ getDemoReport executes axe-core on controlled demo fixture (tests/scanner-engine.test.js)
✔ getRemediationForRule returns rich catalog items and valid fallbacks (tests/scanner-engine.test.js)
✔ isPrivateIP correctly identifies private IPv4 addresses (tests/url-validator.test.js)
✔ isPrivateIP correctly identifies private IPv6 addresses (tests/url-validator.test.js)
✔ validateTargetUrl accepts valid public URLs without DNS check (tests/url-validator.test.js)
✔ validateTargetUrl rejects dangerous or invalid URLs (tests/url-validator.test.js)

ℹ tests 11, suites 0, pass 11, fail 0
```

---

## Deployment

WebForAll is optimized for deployment on [Vercel](https://vercel.com/) or any platform supporting Next.js App Router serverless runtimes.

### Deploying to Vercel

1. Push your repository to GitHub.
2. In the Vercel dashboard, click **Add New Project** and select the `webforall` repository.
3. Configure project settings:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Install Command:** `npm install`
   - **Output Directory:** `.next`
4. **Environment Variables:** None required.
5. Click **Deploy**.
6. Once deployed, verify:
   - Homepage loads and header branding displays cleanly.
   - Live scanning against a public URL (e.g. `https://example.com`) returns a report.
   - Interactive Demo (`/demo`) scans and generates the demo report.
   - PDF export generates and downloads a `.pdf` file.

---

## Contributing

Contributions that enhance accessibility detection, improve remediation guidance, or strengthen security controls are welcome.

### Contribution Steps

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/webforall.git
   cd webforall
   ```
3. **Create a feature branch:**
   ```bash
   git checkout -b feature/accessible-feature-name
   ```
4. **Make focused changes** adhering to existing styling and typing patterns.
5. **Verify quality checks pass:**
   ```bash
   npm run lint
   npm test
   npm run build
   ```
6. **Commit with conventional commit messages:**
   ```bash
   git commit -m "feat: add remediation guidance for table headers"
   ```
7. **Push to your fork** and open a **Pull Request** targeting `main`.

---

## License

No license has been specified for this project. Although `package.json` references the ISC identifier, no formal `LICENSE` file is currently present in the repository root. All rights are reserved by the repository owner until an official open-source license is added.

---

## Acknowledgements

- **[Deque Systems](https://www.deque.com/)** for creating and maintaining [`axe-core`](https://github.com/dequelabs/axe-core), the gold standard in automated accessibility evaluation.
- **[W3C Web Accessibility Initiative (WAI)](https://www.w3.org/WAI/)** for defining the [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/standards-guidelines/wcag/).
- **[jsdom](https://github.com/jsdom/jsdom)** for providing a robust Node.js virtual DOM implementation.
- **[jsPDF](https://github.com/parallax/jsPDF)** for client-side PDF document generation.
- **[Lucide](https://lucide.dev/)** for clean, accessible UI iconography.
