import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Lock, Terminal, Sparkles, Heart } from 'lucide-react';

export const metadata = {
  title: 'About WebForAll — Mission, Privacy & Security',
  description:
    'Overview of WebForAll mission, who it helps, how website evaluation works, zero-database privacy policy, and SSRF security safeguards.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen py-10 sm:py-16 bg-canvas text-ink">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Page Header */}
        <header className="space-y-4 pb-6 border-b border-border-ink">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-soft border border-violet/30 text-violet text-xs font-extrabold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 text-coral" aria-hidden="true" />
            <span>Mission & Security</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-ink tracking-tight leading-tight">
            About WebForAll
          </h1>
          <p className="text-lg sm:text-xl text-ink-muted leading-relaxed font-medium">
            An open web accessibility evaluation instrument designed to provide developers and site owners with clear, actionable guidance without opaque compliance scores.
          </p>
        </header>

        {/* 1. Why WebForAll Exists & Who It Helps */}
        <section className="space-y-4" aria-labelledby="heading-purpose">
          <h2 id="heading-purpose" className="text-2xl sm:text-3xl font-extrabold text-ink">
            Why WebForAll Exists & Who It Helps
          </h2>
          <p className="text-base sm:text-lg text-ink-muted leading-relaxed font-medium">
            Millions of people with visual, motor, auditory, or cognitive differences encounter barriers on the web every single day. Many website creators want to fix these barriers, but are overwhelmed by technical jargon, expensive enterprise software, or opaque tools that sell false compliance guarantees.
          </p>
          <p className="text-base sm:text-lg text-ink-muted leading-relaxed font-medium">
            WebForAll was created to make digital accessibility evaluation straightforward, honest, and actionable for developers, designers, educators, and website owners. We extract concrete DOM violations, pinpoint exact CSS selectors, and provide copy-ready code examples to fix them.
          </p>
        </section>

        {/* 2. How Website Evaluation Works */}
        <section className="space-y-4 pt-6 border-t border-border-ink" aria-labelledby="heading-evaluation">
          <h2 id="heading-evaluation" className="text-2xl sm:text-3xl font-extrabold text-ink">
            How Website Evaluation Works
          </h2>
          <p className="text-base sm:text-lg text-ink-muted leading-relaxed font-medium">
            When you enter a website URL, WebForAll validates the address, fetches the static HTML payload over a secure connection, builds an in-memory virtual DOM in a sandboxed headless environment (JSDOM), and evaluates axe-core rules against WCAG 2.1 Level A and AA standards.
          </p>

          <details className="text-xs sm:text-sm text-ink-muted bg-surface border-2 border-border-ink rounded-2xl p-5 cursor-pointer shadow-subtle">
            <summary className="font-extrabold text-ink text-sm sm:text-base select-none flex items-center justify-between">
              <span>Technical pipeline details</span>
              <span className="text-xs text-electric font-bold">Click to expand</span>
            </summary>
            <div className="mt-3 pt-3 border-t border-border-subtle space-y-2 leading-relaxed">
              <p>
                <strong>Evaluation Engine:</strong> Deque axe-core 4.10 executed within Node.js JSDOM 30.
              </p>
              <p>
                <strong>Execution Isolation:</strong> Client-side JavaScript from target websites is never executed on our servers to ensure complete sandboxing.
              </p>
              <p>
                <strong>Resource Bounds:</strong> Requests enforce a strict 12-second abort timeout and a 5 MB payload streaming cap.
              </p>
            </div>
          </details>
        </section>

        {/* 3. Privacy and Data Handling */}
        <section className="space-y-4 pt-6 border-t border-border-ink" aria-labelledby="heading-privacy">
          <h2 id="heading-privacy" className="text-2xl sm:text-3xl font-extrabold text-ink">
            Privacy & Zero-Retention Policy
          </h2>
          <p className="text-base sm:text-lg text-ink-muted leading-relaxed font-medium">
            WebForAll is architected with privacy by design. We maintain no persistent databases (no PostgreSQL, MySQL, MongoDB, Firebase, or Supabase).
          </p>
          <ul className="text-sm sm:text-base text-ink-muted space-y-2 list-disc pl-5 leading-relaxed font-medium" role="list">
            <li><strong className="text-ink">No user accounts:</strong> You never need to sign up, log in, or provide personal credentials.</li>
            <li><strong className="text-ink">No scan history stored:</strong> Evaluation reports exist only in ephemeral server memory during the active request and in your browser session.</li>
            <li><strong className="text-ink">Local exports only:</strong> Report downloads (JSON and printable PDF) are assembled directly on your computer.</li>
            <li><strong className="text-ink">Zero third-party tracking:</strong> No advertising trackers, commercial cookies, or telemetry beacons.</li>
          </ul>
        </section>

        {/* 4. Security Protections */}
        <section className="space-y-4 pt-6 border-t border-border-ink" aria-labelledby="heading-security">
          <h2 id="heading-security" className="text-2xl sm:text-3xl font-extrabold text-ink">
            Security Engineering & SSRF Protection
          </h2>
          <p className="text-base sm:text-lg text-ink-muted leading-relaxed font-medium">
            Allowing a server to fetch public web pages requires rigorous Server-Side Request Forgery (SSRF) defenses to protect private network environments.
          </p>

          <details className="text-xs sm:text-sm text-ink-muted bg-surface border-2 border-border-ink rounded-2xl p-5 cursor-pointer shadow-subtle">
            <summary className="font-extrabold text-ink text-sm sm:text-base select-none flex items-center justify-between">
              <span>SSRF safeguards specification</span>
              <span className="text-xs text-electric font-bold">Click to expand</span>
            </summary>
            <div className="mt-3 pt-3 border-t border-border-subtle space-y-2 leading-relaxed">
              <p>
                <strong>DNS Pre-Resolution:</strong> Target hostnames are resolved via DNS before initiating an HTTP connection.
              </p>
              <p>
                <strong>Private Network Rejection:</strong> Destination IPs in RFC 1918 private ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16), loopback (127.0.0.0/8, ::1), carrier-grade NAT, and cloud metadata (169.254.169.254) are rejected immediately.
              </p>
              <p>
                <strong>Per-Hop Redirect Defense:</strong> Every redirect hop (up to 5 maximum) is re-validated through the full DNS and IP security filter.
              </p>
              <p>
                <strong>HTML Evidence Escaping:</strong> Extracted code snippets from scanned websites are strictly rendered as escaped text inside code blocks to prevent XSS.
              </p>
            </div>
          </details>
        </section>

        {/* 5. Testing Limitations */}
        <section className="space-y-4 pt-6 border-t border-border-ink" aria-labelledby="heading-limitations">
          <h2 id="heading-limitations" className="text-2xl sm:text-3xl font-extrabold text-ink">
            Testing Scope & Limitations
          </h2>
          <p className="text-base sm:text-lg text-ink-muted leading-relaxed font-medium">
            Automated tools are an essential first step for rapid discovery, but they cannot evaluate all aspects of digital inclusion:
          </p>
          <ul className="text-sm sm:text-base text-ink-muted space-y-2 list-disc pl-5 leading-relaxed font-medium" role="list">
            <li>Automated testing evaluates approximately 30% to 50% of potential WCAG criteria.</li>
            <li>Whether alternative text is genuinely descriptive and contextually helpful requires human review.</li>
            <li>Client-side heavy single-page apps (SPAs) without SSR may evaluate only the initial HTML shell.</li>
            <li>Full WCAG compliance always requires manual testing with screen readers and keyboard navigation.</li>
          </ul>

          <div className="pt-6">
            <Link
              href="/"
              className="inline-flex items-center text-base font-extrabold text-electric hover:underline"
            >
              Back to Home &rarr;
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
