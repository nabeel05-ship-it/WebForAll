import { jsPDF } from 'jspdf';
import { AccessibilityReport, Finding, ImpactLevel } from '../scanner/types';

/**
 * Sanitizes a URL into a safe, alphanumeric filename segment.
 */
export function sanitizeHostnameForFilename(targetUrl: string): string {
  try {
    const url = new URL(targetUrl);
    const host = url.hostname.replace(/^www\./, '').replace(/[^a-zA-Z0-9.-]/g, '_');
    return host || 'report';
  } catch {
    return targetUrl.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 40) || 'report';
  }
}

/**
 * Builds a clean, professional PDF report document from actual AccessibilityReport data.
 */
export function createPdfDocument(report: AccessibilityReport): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
    compress: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  const bottomMargin = 50;

  let y = margin;

  const checkPageBreak = (neededHeight: number): void => {
    if (y + neededHeight > pageHeight - bottomMargin) {
      doc.addPage();
      y = margin + 15;
    }
  };

  // Helper for colored pill
  const drawPill = (
    text: string,
    xPos: number,
    yPos: number,
    bgColor: [number, number, number],
    textColor: [number, number, number]
  ): number => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    const textWidth = doc.getTextWidth(text);
    const paddingX = 8;
    const pillHeight = 16;
    const pillWidth = textWidth + paddingX * 2;

    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.roundedRect(xPos, yPos - 11, pillWidth, pillHeight, 3, 3, 'F');

    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(text, xPos + paddingX, yPos);

    return pillWidth;
  };

  // ==========================================
  // 1. BRAND HEADER & REPORT TITLE
  // ==========================================
  doc.setFillColor(24, 35, 58); // Dark Navy #18233A
  doc.rect(0, 0, pageWidth, 6, 'F');

  // Eyebrow Brand Mark
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(49, 87, 232); // Electric Blue #3157E8
  doc.text('WEBFORALL  •  ACCESSIBILITY EVALUATOR', margin, y + 10);

  y += 26;

  // Report Main Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(24, 35, 58); // #18233A
  doc.text(
    report.isDemo ? 'Interactive Storefront Demo Report' : 'Web Accessibility Evaluation Report',
    margin,
    y
  );

  y += 18;

  // Target URL (truncated or wrapped cleanly)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(49, 87, 232);
  const truncatedUrl = report.targetUrl.length > 80 ? report.targetUrl.slice(0, 77) + '...' : report.targetUrl;
  doc.text(truncatedUrl, margin, y);

  y += 16;

  // Metadata Line: Timestamp & Engine
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(88, 103, 125); // Ink Muted
  const formattedDate = new Date(report.timestamp).toLocaleString();
  doc.text(
    `Audited: ${formattedDate}   |   Duration: ${report.scanDurationMs}ms   |   Engine: ${report.engine.name} v${report.engine.version}   |   Standard: WCAG 2.1 Level AA`,
    margin,
    y
  );

  y += 18;
  doc.setDrawColor(201, 208, 221); // Border #C9D0DD
  doc.setLineWidth(0.75);
  doc.line(margin, y, pageWidth - margin, y);
  y += 18;

  // ==========================================
  // 2. EXECUTIVE SUMMARY & SEVERITY METRICS
  // ==========================================
  checkPageBreak(85);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(24, 35, 58);
  doc.text('Summary of Findings', margin, y);

  y += 14;

  // 4 Metric Summary Boxes
  const boxWidth = (contentWidth - 18) / 4;
  const boxHeight = 44;

  const metrics: Array<{ label: string; count: number; bg: [number, number, number]; fg: [number, number, number] }> = [
    { label: 'Total Violations', count: report.summary.totalViolations, bg: [242, 240, 255], fg: [24, 35, 58] },
    { label: 'Critical Barriers', count: report.summary.byImpact.critical, bg: [255, 229, 225], fg: [242, 92, 77] },
    { label: 'Serious Barriers', count: report.summary.byImpact.serious, bg: [255, 241, 201], fg: [180, 83, 9] },
    { label: 'Passed Checks', count: report.summary.passedCount, bg: [221, 246, 241], fg: [25, 168, 154] },
  ];

  metrics.forEach((m, idx) => {
    const boxX = margin + idx * (boxWidth + 6);
    doc.setFillColor(m.bg[0], m.bg[1], m.bg[2]);
    doc.roundedRect(boxX, y, boxWidth, boxHeight, 4, 4, 'F');
    doc.setDrawColor(201, 208, 221);
    doc.setLineWidth(0.5);
    doc.roundedRect(boxX, y, boxWidth, boxHeight, 4, 4, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(m.fg[0], m.fg[1], m.fg[2]);
    doc.text(String(m.count), boxX + 10, y + 20);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(88, 103, 125);
    doc.text(m.label.toUpperCase(), boxX + 10, y + 34);
  });

  y += boxHeight + 14;

  // Explanation note
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(88, 103, 125);
  const summaryExplanation =
    report.summary.totalViolations === 0
      ? 'No automated accessibility violations were detected on this page DOM. Manual verification of keyboard task flows and assistive screen readers is still recommended.'
      : `The automated scanner identified ${report.summary.totalViolations} accessibility barrier${report.summary.totalViolations === 1 ? '' : 's'} across ${report.summary.totalAffectedElements} affected DOM element${report.summary.totalAffectedElements === 1 ? '' : 's'}. Review the findings below, prioritizing Critical and Serious issues.`;

  const explanationLines = doc.splitTextToSize(summaryExplanation, contentWidth);
  doc.text(explanationLines, margin, y);
  y += explanationLines.length * 12 + 16;

  // ==========================================
  // 3. DETAILED FINDINGS
  // ==========================================
  if (report.violations.length > 0) {
    checkPageBreak(40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(24, 35, 58);
    doc.text(`Identified Violations (${report.violations.length})`, margin, y);
    y += 14;

    report.violations.forEach((violation: Finding, idx: number) => {
      // Estimated block height before page break
      checkPageBreak(130);

      // Card Container Background
      const itemStartY = y;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(201, 208, 221);
      doc.setLineWidth(0.75);

      // Impact Chip
      let impactBg: [number, number, number] = [242, 240, 255];
      let impactFg: [number, number, number] = [24, 35, 58];
      if (violation.impact === 'critical') {
        impactBg = [255, 229, 225];
        impactFg = [242, 92, 77];
      } else if (violation.impact === 'serious') {
        impactBg = [255, 241, 201];
        impactFg = [180, 83, 9];
      } else if (violation.impact === 'moderate') {
        impactBg = [255, 241, 201];
        impactFg = [161, 98, 7];
      } else {
        impactBg = [227, 234, 255];
        impactFg = [49, 87, 232];
      }

      y += 14;
      const pillW = drawPill(violation.impact.toUpperCase(), margin + 10, y, impactBg, impactFg);

      // Rule ID Pill
      drawPill(violation.id, margin + 15 + pillW, y, [242, 240, 255], [24, 35, 58]);

      // Element Count
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(88, 103, 125);
      doc.text(
        `${violation.nodes.length} element${violation.nodes.length === 1 ? '' : 's'} affected`,
        margin + contentWidth - 90,
        y
      );

      y += 16;

      // Issue Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(24, 35, 58);
      const titleLines = doc.splitTextToSize(`${idx + 1}. ${violation.title}`, contentWidth - 20);
      doc.text(titleLines, margin + 10, y);
      y += titleLines.length * 13 + 6;

      // 1. What is the problem?
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(49, 87, 232); // Electric
      doc.text('What is the problem?', margin + 10, y);
      y += 11;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(24, 35, 58);
      const problemLines = doc.splitTextToSize(violation.remediation.whatIsWrong || violation.description, contentWidth - 20);
      doc.text(problemLines, margin + 10, y);
      y += problemLines.length * 11 + 6;

      // 2. Why does it matter?
      checkPageBreak(50);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(180, 83, 9); // Amber
      doc.text('Why does it matter?', margin + 10, y);
      y += 11;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(88, 103, 125);
      const whyLines = doc.splitTextToSize(violation.remediation.whyItMatters, contentWidth - 20);
      doc.text(whyLines, margin + 10, y);
      y += whyLines.length * 11 + 6;

      // 3. Who may be affected?
      if (violation.remediation.whoIsAffected) {
        checkPageBreak(40);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(107, 70, 217); // Violet
        doc.text('Who may be affected?', margin + 10, y);
        y += 11;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(88, 103, 125);
        const whoLines = doc.splitTextToSize(violation.remediation.whoIsAffected, contentWidth - 20);
        doc.text(whoLines, margin + 10, y);
        y += whoLines.length * 11 + 6;
      }

      // 4. How to fix it
      checkPageBreak(50);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(25, 168, 154); // Teal
      doc.text('How to fix it:', margin + 10, y);
      y += 11;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(24, 35, 58);
      const fixLines = doc.splitTextToSize(violation.remediation.howToFix, contentWidth - 20);
      doc.text(fixLines, margin + 10, y);
      y += fixLines.length * 11 + 6;

      // 5. Code Example (if available)
      if (violation.remediation.codeExample) {
        checkPageBreak(70);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(88, 103, 125);
        doc.text('Illustrative Code Example:', margin + 10, y);
        y += 11;

        // Incorrect code snippet
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(242, 92, 77); // Coral
        doc.text('Problematic Pattern:', margin + 10, y);
        y += 9;
        doc.setFont('courier', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(24, 35, 58);
        const badCodeLines = doc.splitTextToSize(violation.remediation.codeExample.incorrect, contentWidth - 25);
        doc.text(badCodeLines, margin + 14, y);
        y += badCodeLines.length * 9 + 4;

        // Correct code snippet
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(25, 168, 154); // Teal
        doc.text('Recommended Pattern:', margin + 10, y);
        y += 9;
        doc.setFont('courier', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(24, 35, 58);
        const goodCodeLines = doc.splitTextToSize(violation.remediation.codeExample.correct, contentWidth - 25);
        doc.text(goodCodeLines, margin + 14, y);
        y += goodCodeLines.length * 9 + 6;
      }

      // 6. Technical Details: Standards & Selectors
      checkPageBreak(50);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(88, 103, 125);
      const standards = violation.remediation.wcagCriteria?.join(', ') || violation.tags?.slice(0, 4).join(', ');
      doc.text(`Rule ID: ${violation.id}   |   Standards: ${standards || 'WCAG 2.1 AA'}`, margin + 10, y);
      y += 12;

      // Technical Elements (first 2 nodes)
      if (violation.nodes.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(88, 103, 125);
        doc.text('Affected Elements & CSS Selectors:', margin + 10, y);
        y += 10;

        violation.nodes.slice(0, 2).forEach((node) => {
          doc.setFont('courier', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(49, 87, 232);
          const selectorText = node.target.join(' ');
          const selLines = doc.splitTextToSize(selectorText, contentWidth - 25);
          doc.text(selLines, margin + 14, y);
          y += selLines.length * 10 + 2;
        });

        if (violation.nodes.length > 2) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8);
          doc.setTextColor(120, 130, 145);
          doc.text(`(+ ${violation.nodes.length - 2} additional element${violation.nodes.length - 2 === 1 ? '' : 's'} on page)`, margin + 14, y);
          y += 10;
        }
      }

      // Card bounding box
      const blockHeight = y - itemStartY + 6;
      doc.roundedRect(margin, itemStartY, contentWidth, blockHeight, 4, 4, 'S');

      y += 16;
    });
  } else {
    // Zero violations state in PDF
    checkPageBreak(60);
    doc.setFillColor(221, 246, 241); // Teal soft
    doc.roundedRect(margin, y, contentWidth, 50, 4, 4, 'F');
    doc.setDrawColor(25, 168, 154);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, contentWidth, 50, 4, 4, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(25, 168, 154);
    doc.text('No Automated Violations Detected', margin + 12, y + 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(24, 35, 58);
    doc.text(
      'The axe-core engine evaluated the submitted page DOM and detected no automated accessibility violations.',
      margin + 12,
      y + 35
    );
    y += 66;
  }

  // ==========================================
  // 4. TESTING DISCLAIMER & FOOTER
  // ==========================================
  checkPageBreak(80);

  doc.setFillColor(242, 240, 255);
  doc.roundedRect(margin, y, contentWidth, 52, 4, 4, 'F');
  doc.setDrawColor(201, 208, 221);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, 52, 4, 4, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(107, 70, 217); // Violet
  doc.text('AUTOMATED EVALUATION SCOPE & LIMITATIONS', margin + 10, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(88, 103, 125);
  const disclaimerLines = doc.splitTextToSize(report.disclaimer, contentWidth - 20);
  doc.text(disclaimerLines, margin + 10, y + 25);

  // ==========================================
  // 5. PAGE NUMBERING IN FOOTER
  // ==========================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 150, 165);
    doc.text(
      `WebForAll Accessibility Report  |  Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 20,
      { align: 'center' }
    );
  }

  return doc;
}

/**
 * Generates and triggers browser download of the PDF report.
 */
export function generatePdfReport(report: AccessibilityReport): void {
  const doc = createPdfDocument(report);
  const filename = `webforall-accessibility-report-${sanitizeHostnameForFilename(report.targetUrl)}.pdf`;
  
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const arrayBuffer = doc.output('arraybuffer');
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
}
