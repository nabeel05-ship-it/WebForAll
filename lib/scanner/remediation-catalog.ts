export interface RemediationInfo {
  ruleId: string;
  friendlyTitle: string;
  whatIsWrong: string;
  whyItMatters: string;
  whoIsAffected: string;
  howToFix: string;
  codeExample?: {
    incorrect: string;
    correct: string;
    explanation: string;
  };
  wcagCriteria?: string[];
  referenceUrl?: string;
}

export const REMEDIATION_CATALOG: Record<string, RemediationInfo> = {
  'image-alt': {
    ruleId: 'image-alt',
    friendlyTitle: 'Images Missing Alternative Text',
    whatIsWrong: 'One or more <img> elements do not provide an "alt" attribute or an accessible name.',
    whyItMatters: 'Screen readers cannot describe visual imagery unless alternative text is provided. Without it, users hear only the raw image filename or "graphic", missing critical context.',
    whoIsAffected: 'People who are blind, have low vision, or use screen readers, as well as users on slow connections where images fail to render.',
    howToFix: 'Add a descriptive alt attribute that conveys the image\'s purpose or message. If the image is purely decorative (such as a background pattern or spacer), use an empty alt attribute (alt="") so screen readers ignore it.',
    codeExample: {
      incorrect: '<img src="/assets/chart-q3.png">\n<!-- Or purely decorative without alt -->\n<img src="/icons/divider.png">',
      correct: '<img src="/assets/chart-q3.png" alt="Bar chart showing Q3 revenue increased by 14%">\n<!-- Decorative image correctly marked: -->\n<img src="/icons/divider.png" alt="" role="presentation">',
      explanation: 'Informative images need concise descriptions of their meaning; decorative images should use empty alt="" so they are safely skipped.',
    },
    wcagCriteria: ['WCAG 2.1 - 1.1.1 Non-text Content (Level A)'],
    referenceUrl: 'https://www.w3.org/WAI/tutorials/images/',
  },

  'button-name': {
    ruleId: 'button-name',
    friendlyTitle: 'Buttons Missing Discernible Text',
    whatIsWrong: 'A <button> element has no visible text or accessible label, often because it contains only an icon (like an SVG or font icon).',
    whyItMatters: 'Screen readers read the button as "button" with no indication of what clicking it will do (such as "Search", "Delete", or "Close"). Voice control users cannot activate it by name.',
    whoIsAffected: 'Screen reader users, braille display users, and speech recognition users who navigate web pages by naming interactive controls.',
    howToFix: 'Include clear visible text inside the button, or provide an "aria-label" or visually hidden text (<span class="sr-only">) explaining the button\'s exact action.',
    codeExample: {
      incorrect: '<button>\n  <svg class="icon-trash"></svg>\n</button>',
      correct: '<button aria-label="Delete item">\n  <svg class="icon-trash" aria-hidden="true"></svg>\n</button>\n<!-- Alternatively with hidden text: -->\n<button>\n  <svg class="icon-trash" aria-hidden="true"></svg>\n  <span class="sr-only">Delete item</span>\n</button>',
      explanation: 'Always supply a clear label for icon-only buttons so assistive technologies can announce their action.',
    },
    wcagCriteria: ['WCAG 2.1 - 4.1.2 Name, Role, Value (Level A)'],
    referenceUrl: 'https://dequeuniversity.com/rules/axe/4.10/button-name',
  },

  'link-name': {
    ruleId: 'link-name',
    friendlyTitle: 'Links Missing Discernible Text',
    whatIsWrong: 'A link (<a> tag) has no text content or accessible label, or contains only vague wording without context.',
    whyItMatters: 'Users who navigate by browsing links in screen reader lists hear blank items or generic "click here" announcements, making it impossible to know where the link leads.',
    whoIsAffected: 'Screen reader users, switch device users, and keyboard navigators who scan link lists to jump through a page.',
    howToFix: 'Provide clear, meaningful anchor text that indicates the link destination. For icon links, add an aria-label or accessible text inside.',
    codeExample: {
      incorrect: '<a href="/annual-report.pdf">\n  <i class="fa fa-download"></i>\n</a>\n<!-- Or ambiguous text: -->\n<a href="/pricing">Click here</a>',
      correct: '<a href="/annual-report.pdf" aria-label="Download 2024 Annual Report (PDF)">\n  <i class="fa fa-download" aria-hidden="true"></i>\n</a>\n<!-- Clear text: -->\n<a href="/pricing">View subscription plans and pricing</a>',
      explanation: 'Ensure the link text clearly identifies the specific destination or downloaded resource.',
    },
    wcagCriteria: ['WCAG 2.1 - 2.4.4 Link Purpose (In Context) (Level A)', 'WCAG 2.1 - 4.1.2 Name, Role, Value (Level A)'],
    referenceUrl: 'https://dequeuniversity.com/rules/axe/4.10/link-name',
  },

  'color-contrast': {
    ruleId: 'color-contrast',
    friendlyTitle: 'Insufficient Color Contrast Ratio',
    whatIsWrong: 'The contrast ratio between the text color and its background color is below the required WCAG threshold.',
    whyItMatters: 'Text with low contrast is difficult or impossible to read in bright sunlight, on lower quality screens, or for users with visual impairments.',
    whoIsAffected: 'People with low vision, age-related vision changes, color blindness, or situational impairments like glare.',
    howToFix: 'Adjust text or background colors to achieve a contrast ratio of at least 4.5:1 for normal body text, or 3:1 for large text (18pt / 24px or bold 14pt / 18.66px).',
    codeExample: {
      incorrect: '/* Light gray text on white background: 2.1:1 ratio */\n.caption {\n  color: #a0aec0;\n  background-color: #ffffff;\n}',
      correct: '/* Dark slate text on white background: 7.2:1 ratio (AAA compliant) */\n.caption {\n  color: #4a5568;\n  background-color: #ffffff;\n}',
      explanation: 'Use high-contrast combinations to ensure readability across all ambient lighting and display conditions.',
    },
    wcagCriteria: ['WCAG 2.1 - 1.4.3 Contrast (Minimum) (Level AA)'],
    referenceUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html',
  },

  'document-title': {
    ruleId: 'document-title',
    friendlyTitle: 'Missing or Empty Page Title',
    whatIsWrong: 'The document does not have a non-empty <title> element inside the <head>.',
    whyItMatters: 'The page title is the first thing announced by screen readers when navigating between pages, and it is displayed in browser tabs and search engine results.',
    whoIsAffected: 'All users, especially screen reader users and people with multiple open browser tabs or cognitive disabilities.',
    howToFix: 'Include a unique, descriptive <title> tag inside the <head> element representing the specific page and site name.',
    codeExample: {
      incorrect: '<head>\n  <!-- Missing title -->\n</head>',
      correct: '<head>\n  <title>Accessibility Report &bull; WebForAll</title>\n</head>',
      explanation: 'Make the title specific to the page content followed by the site or application name.',
    },
    wcagCriteria: ['WCAG 2.1 - 2.4.2 Page Titled (Level A)'],
    referenceUrl: 'https://dequeuniversity.com/rules/axe/4.10/document-title',
  },

  'html-has-lang': {
    ruleId: 'html-has-lang',
    friendlyTitle: 'HTML Element Missing "lang" Attribute',
    whatIsWrong: 'The top-level <html> tag is missing a valid "lang" attribute (e.g. lang="en").',
    whyItMatters: 'Screen readers rely on the lang attribute to select the correct speech synthesizer voice and pronunciation rules. Without it, English text may be pronounced with French or Spanish phonetics or vice versa.',
    whoIsAffected: 'Screen reader and text-to-speech users, as well as automated translation tools.',
    howToFix: 'Specify the primary natural language of the page on the <html> element using a standard BCP 47 language code (such as "en", "es", "fr", "de").',
    codeExample: {
      incorrect: '<html>\n  <head>...</head>\n  <body>...</body>\n</html>',
      correct: '<html lang="en">\n  <head>...</head>\n  <body>...</body>\n</html>',
      explanation: 'Add the appropriate two-letter or language-country code to the root HTML element.',
    },
    wcagCriteria: ['WCAG 2.1 - 3.1.1 Language of Page (Level A)'],
    referenceUrl: 'https://dequeuniversity.com/rules/axe/4.10/html-has-lang',
  },

  'label': {
    ruleId: 'label',
    friendlyTitle: 'Form Inputs Missing Accessible Labels',
    whatIsWrong: 'A form control (<input>, <textarea>, or <select>) does not have a corresponding <label> element or accessible name attribute.',
    whyItMatters: 'When a user tabs into the field, a screen reader will announce only "edit text" without explaining whether the field asks for a name, email address, password, or phone number. Placeholders disappear upon typing and are not accessible substitutes.',
    whoIsAffected: 'Screen reader users, voice dictation users, and users with cognitive or memory difficulties.',
    howToFix: 'Pair the input with a visible <label> using matching "for" and "id" attributes, or wrap the input inside the <label>. For search bars or inputs where design constraints omit visible labels, use "aria-label".',
    codeExample: {
      incorrect: '<!-- Relying only on placeholder is an accessibility barrier: -->\n<input type="email" placeholder="Enter your email">',
      correct: '<label for="user-email" class="block font-medium">Email Address</label>\n<input id="user-email" type="email" name="email" required>\n\n<!-- Or accessible aria-label if visual label is hidden: -->\n<input type="search" aria-label="Search articles" placeholder="Search...">',
      explanation: 'Every form control requires an explicit label programmatically tied via id and for, or an aria-label.',
    },
    wcagCriteria: ['WCAG 2.1 - 1.3.1 Info and Relationships (Level A)', 'WCAG 2.1 - 3.3.2 Labels or Instructions (Level A)'],
    referenceUrl: 'https://www.w3.org/WAI/tutorials/forms/labels/',
  },

  'landmark-one-main': {
    ruleId: 'landmark-one-main',
    friendlyTitle: 'Page Missing a Main Landmark (<main>)',
    whatIsWrong: 'The document does not contain a single top-level <main> landmark tag.',
    whyItMatters: 'Landmarks allow assistive technology users to skip repetitive header and navigation menus directly to the primary page content with a single keystroke.',
    whoIsAffected: 'Screen reader users and keyboard navigators who rely on landmark shortcuts.',
    howToFix: 'Enclose the primary unique content of the page in a single <main> element.',
    codeExample: {
      incorrect: '<body>\n  <div class="header">...</div>\n  <div class="content">Primary page text</div>\n  <div class="footer">...</div>\n</body>',
      correct: '<body>\n  <header>...</header>\n  <main id="main-content">\n    <h1>Primary Page Title</h1>\n    <p>Main content goes here...</p>\n  </main>\n  <footer>...</footer>\n</body>',
      explanation: 'Use semantic HTML5 <main> element for the central content and avoid multiple <main> tags on a single page.',
    },
    wcagCriteria: ['WCAG 2.1 - 1.3.1 Info and Relationships (Level A)', 'WCAG 2.1 - 2.4.1 Bypass Blocks (Level A)'],
    referenceUrl: 'https://dequeuniversity.com/rules/axe/4.10/landmark-one-main',
  },

  'region': {
    ruleId: 'region',
    friendlyTitle: 'Content Outside Landmark Regions',
    whatIsWrong: 'Substantial page content is placed outside of HTML5 structural landmarks (such as <header>, <nav>, <main>, <aside>, or <footer>).',
    whyItMatters: 'Screen readers allow users to jump quickly between page sections via landmarks. Content stranded outside landmarks can easily be missed during navigation.',
    whoIsAffected: 'Screen reader users seeking an overview of the page structure.',
    howToFix: 'Organize page sections inside semantic HTML5 containers: <header>, <nav>, <main>, <aside>, and <footer>.',
    codeExample: {
      incorrect: '<body>\n  <div class="sidebar">Links</div>\n  <div class="main-body">Content</div>\n</body>',
      correct: '<body>\n  <aside aria-label="Sidebar navigation">\n    <nav>...</nav>\n  </aside>\n  <main>\n    <!-- Main content -->\n  </main>\n</body>',
      explanation: 'Wrap top-level layout sections in semantic landmark elements so assistive technologies can navigate them efficiently.',
    },
    wcagCriteria: ['WCAG 2.1 - 1.3.1 Info and Relationships (Level A)'],
    referenceUrl: 'https://dequeuniversity.com/rules/axe/4.10/region',
  },

  'heading-order': {
    ruleId: 'heading-order',
    friendlyTitle: 'Headings Skip Structural Levels',
    whatIsWrong: 'Heading tags (h1 through h6) skip logical levels, such as jumping from an <h2> directly to an <h4> without an intermediate <h3>.',
    whyItMatters: 'Screen reader users rely on headings to build a mental outline of the page hierarchy. Skips cause confusion about whether sections or subtopics are missing.',
    whoIsAffected: 'Screen reader users and people with cognitive disabilities who use headings to understand content structure.',
    howToFix: 'Structure headings sequentially to reflect the document outline. Do not pick heading tags for visual font size; use CSS classes to adjust visual sizing instead.',
    codeExample: {
      incorrect: '<h1>Document Title</h1>\n<!-- Skipped h2 directly to h4: -->\n<h4>Sub-section heading</h4>',
      correct: '<h1>Document Title</h1>\n<h2>Section Heading</h2>\n<h3>Sub-section heading</h3>',
      explanation: 'Ensure heading levels increase by at most one level at a time (e.g. h1 -> h2 -> h3).',
    },
    wcagCriteria: ['WCAG 2.1 - 1.3.1 Info and Relationships (Level A)', 'WCAG 2.1 - 2.4.6 Headings and Labels (Level AA)'],
    referenceUrl: 'https://dequeuniversity.com/rules/axe/4.10/heading-order',
  },

  'meta-viewport': {
    ruleId: 'meta-viewport',
    friendlyTitle: 'Pinch-to-Zoom is Disabled',
    whatIsWrong: 'The <meta name="viewport"> tag includes user-scalable="no" or maximum-scale="1.0".',
    whyItMatters: 'Users with visual impairments frequently need to zoom in on mobile devices to read text. Blocking zoom creates an insurmountable barrier.',
    whoIsAffected: 'People with low vision or anyone reading in bright sunlight on a mobile device.',
    howToFix: 'Remove maximum-scale=1.0 and user-scalable=no from your viewport tag. Allow users to zoom up to at least 200%-400%.',
    codeExample: {
      incorrect: '<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0">',
      correct: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      explanation: 'Never prevent user zooming; responsive CSS should accommodate zoomed layouts.',
    },
    wcagCriteria: ['WCAG 2.1 - 1.4.4 Resize Text (Level AA)'],
    referenceUrl: 'https://dequeuniversity.com/rules/axe/4.10/meta-viewport',
  },

  'duplicate-id-active': {
    ruleId: 'duplicate-id-active',
    friendlyTitle: 'Duplicate ID On Interactive Elements',
    whatIsWrong: 'Multiple focusable or interactive elements share the same HTML id attribute value.',
    whyItMatters: 'Assistive technologies and form label pairings rely on unique IDs. Duplicate IDs break ARIA references and label associations.',
    whoIsAffected: 'Screen reader users and keyboard navigators.',
    howToFix: 'Ensure every HTML element on the page has a unique id attribute value.',
    codeExample: {
      incorrect: '<input id="search-input" name="q">\n<!-- Duplicate: -->\n<input id="search-input" name="mobile_q">',
      correct: '<input id="desktop-search-input" name="q">\n<input id="mobile-search-input" name="mobile_q">',
      explanation: 'IDs must be document-wide unique to preserve deterministic references.',
    },
    wcagCriteria: ['WCAG 2.1 - 4.1.1 Parsing (Level A)'],
    referenceUrl: 'https://dequeuniversity.com/rules/axe/4.10/duplicate-id-active',
  },

  'tabindex': {
    ruleId: 'tabindex',
    friendlyTitle: 'Positive tabindex Value Used',
    whatIsWrong: 'An element specifies a positive tabindex attribute (e.g. tabindex="1" or tabindex="5").',
    whyItMatters: 'Positive tabindex values disrupt the natural source order of keyboard focus navigation, creating unpredictable jumping that disorients keyboard users.',
    whoIsAffected: 'Keyboard-only navigators, switch control users, and screen reader users.',
    howToFix: 'Remove positive tabindex values. Use natural DOM order for focus sequence, and only use tabindex="0" (to make custom elements focusable) or tabindex="-1" (for programmatic focus).',
    codeExample: {
      incorrect: '<button tabindex="3">Submit</button>\n<input tabindex="1">',
      correct: '<input>\n<button>Submit</button>',
      explanation: 'Organize elements in logical source order rather than forcing focus with positive tabindex.',
    },
    wcagCriteria: ['WCAG 2.1 - 2.4.3 Focus Order (Level A)'],
    referenceUrl: 'https://dequeuniversity.com/rules/axe/4.10/tabindex',
  },
};

/**
 * Returns structured remediation information for any axe-core rule.
 * Provides rich deterministic guidance for cataloged rules and intelligent,
 * accurate fallbacks for other standard rules.
 */
export function getRemediationForRule(ruleId: string, ruleDescription: string, helpUrl?: string): RemediationInfo {
  const existing = REMEDIATION_CATALOG[ruleId];
  if (existing) {
    return existing;
  }

  // Deterministic fallback for uncataloged axe-core rules
  return {
    ruleId,
    friendlyTitle: ruleDescription || ruleId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    whatIsWrong: `The automated testing engine detected an issue matching rule "${ruleId}": ${ruleDescription}.`,
    whyItMatters: 'Accessibility barriers can prevent individuals using assistive technologies or keyboard navigation from accessing content or operating interface controls.',
    whoIsAffected: 'Users relying on screen readers, keyboard-only controls, or specialized browser preferences.',
    howToFix: `Inspect the affected HTML elements highlighted below and align the markup with the WCAG criteria associated with "${ruleId}". Consult the rule documentation for exact syntax requirements.`,
    wcagCriteria: ['WCAG 2.1 Conformity'],
    referenceUrl: helpUrl || `https://dequeuniversity.com/rules/axe/4.10/${ruleId}`,
  };
}
