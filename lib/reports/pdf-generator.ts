import { jsPDF } from 'jspdf';
import { AccessibilityReport, Finding, ImpactLevel, IncompleteCheck } from '../scanner/types';
import { getRemediationForRule } from '../scanner/remediation-catalog';

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
  const contentWidth = pageWidth - margin * 2; // 532 pt
  const cardPaddingX = 12;
  const cardInnerWidth = contentWidth - cardPaddingX * 2; // 508 pt
  const bottomMargin = 48; // Leaves room for footer at pageHeight - 20
  const maxPageY = pageHeight - bottomMargin; // 744 pt
  const headerRunningY = 46; // Content start Y on pages 2+

  let y = margin;

  // Draws running header on pages 2+
  const drawRunningHeader = (): void => {
    doc.setFillColor(24, 35, 58); // Dark Navy #18233A
    doc.rect(0, 0, pageWidth, 4, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(88, 103, 125); // Ink Muted
    doc.text('WEBFORALL  •  ACCESSIBILITY EVALUATION REPORT', margin, 24);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 150, 165);
    const shortUrl = report.targetUrl.replace(/^https?:\/\//, '').slice(0, 48);
    doc.text(shortUrl, pageWidth - margin, 24, { align: 'right' });

    doc.setDrawColor(220, 226, 235);
    doc.setLineWidth(0.5);
    doc.line(margin, 30, pageWidth - margin, 30);
  };

  const ensureSpace = (neededHeight: number): void => {
    if (y + neededHeight > maxPageY) {
      doc.addPage();
      drawRunningHeader();
      y = headerRunningY;
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
    doc.setFontSize(8);
    const textWidth = doc.getTextWidth(text);
    const paddingX = 7;
    const pillHeight = 15;
    const pillWidth = textWidth + paddingX * 2;

    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.roundedRect(xPos, yPos - 10.5, pillWidth, pillHeight, 3, 3, 'F');

    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(text, xPos + paddingX, yPos);

    return pillWidth;
  };

  // ==========================================
  // 1. BRAND HEADER & REPORT TITLE (PAGE 1)
  // ==========================================
  doc.setFillColor(24, 35, 58); // Dark Navy #18233A
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Eyebrow Brand Mark
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(49, 87, 232); // Electric Blue #3157E8
  doc.text('WEBFORALL  •  ACCESSIBILITY EVALUATOR', margin, y + 10);

  y += 26;

  // Report Main Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(24, 35, 58);
  doc.text(
    report.isDemo ? 'Interactive Storefront Demo Report' : 'Web Accessibility Evaluation Report',
    margin,
    y
  );

  y += 18;

  // Target URL (truncated safely if oversized)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(49, 87, 232);
  const targetUrlDisplay =
    report.targetUrl.length > 76 ? report.targetUrl.slice(0, 73) + '...' : report.targetUrl;
  doc.text(targetUrlDisplay, margin, y);

  y += 15;

  // Metadata Line: Timestamp & Engine
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(88, 103, 125);
  const formattedDate = new Date(report.timestamp).toLocaleString();
  const metaText = `Audited: ${formattedDate}   |   Duration: ${report.scanDurationMs}ms   |   Engine: ${report.engine.name} v${report.engine.version}   |   Standard: WCAG 2.1 Level AA`;
  const metaLines = doc.splitTextToSize(metaText, contentWidth);
  doc.text(metaLines, margin, y);

  y += metaLines.length * 11 + 6;

  doc.setDrawColor(201, 208, 221); // Border #C9D0DD
  doc.setLineWidth(0.75);
  doc.line(margin, y, pageWidth - margin, y);
  y += 14;

  // ==========================================
  // 2. EXECUTIVE SUMMARY & SEVERITY METRICS
  // ==========================================
  ensureSpace(80);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(24, 35, 58);
  doc.text('Summary of Findings', margin, y);

  y += 12;

  // Summary Metric Boxes: dynamically allocate 5 boxes if incomplete checks exist, else 4
  const hasIncomplete = typeof report.summary.incompleteCount === 'number' && report.summary.incompleteCount > 0;
  const metrics: Array<{ label: string; count: number; bg: [number, number, number]; fg: [number, number, number] }> = [
    { label: 'Total Violations', count: report.summary.totalViolations, bg: [242, 240, 255], fg: [24, 35, 58] },
    { label: 'Critical Barriers', count: report.summary.byImpact.critical, bg: [255, 229, 225], fg: [242, 92, 77] },
    { label: 'Serious Barriers', count: report.summary.byImpact.serious, bg: [255, 241, 201], fg: [180, 83, 9] },
  ];

  if (hasIncomplete) {
    metrics.push({
      label: 'Needs Review',
      count: report.summary.incompleteCount,
      bg: [243, 232, 255], // Violet soft #F3E8FF
      fg: [107, 70, 217], // Violet #6B46D9
    });
  }

  metrics.push({
    label: 'Passed Checks',
    count: report.summary.passedCount,
    bg: [221, 246, 241],
    fg: [25, 168, 154],
  });

  const gap = 6;
  const boxWidth = (contentWidth - gap * (metrics.length - 1)) / metrics.length;
  const boxHeight = 42;

  metrics.forEach((m, idx) => {
    const boxX = margin + idx * (boxWidth + gap);
    doc.setFillColor(m.bg[0], m.bg[1], m.bg[2]);
    doc.roundedRect(boxX, y, boxWidth, boxHeight, 3, 3, 'F');
    doc.setDrawColor(201, 208, 221);
    doc.setLineWidth(0.5);
    doc.roundedRect(boxX, y, boxWidth, boxHeight, 3, 3, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(m.fg[0], m.fg[1], m.fg[2]);
    doc.text(String(m.count), boxX + 6, y + 18);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(88, 103, 125);
    doc.text(m.label.toUpperCase(), boxX + 6, y + 32);
  });

  y += boxHeight + 12;

  // Explanation note
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(88, 103, 125);
  const incCount = report.summary.incompleteCount || (report.incomplete ? report.incomplete.length : 0);
  let summaryExplanation = '';
  if (report.summary.totalViolations === 0) {
    summaryExplanation = incCount > 0
      ? `No automated violations were detected on this page DOM. However, ${incCount} item${incCount === 1 ? '' : 's'} require${incCount === 1 ? 's' : ''} human review and manual verification.`
      : 'No automated accessibility violations were detected on this page DOM. Manual verification of keyboard task flows and assistive screen readers is still recommended.';
  } else {
    summaryExplanation = incCount > 0
      ? `The automated scanner identified ${report.summary.totalViolations} accessibility barrier${report.summary.totalViolations === 1 ? '' : 's'} across ${report.summary.totalAffectedElements} affected DOM element${report.summary.totalAffectedElements === 1 ? '' : 's'}, and ${incCount} item${incCount === 1 ? '' : 's'} requiring manual human verification. Prioritize Critical and Serious issues first.`
      : `The automated scanner identified ${report.summary.totalViolations} accessibility barrier${report.summary.totalViolations === 1 ? '' : 's'} across ${report.summary.totalAffectedElements} affected DOM element${report.summary.totalAffectedElements === 1 ? '' : 's'}. Prioritize Critical and Serious issues first to resolve the most severe barriers.`;
  }

  const explanationLines = doc.splitTextToSize(summaryExplanation, contentWidth);
  doc.text(explanationLines, margin, y);
  y += explanationLines.length * 11 + 14;

  // ==========================================
  // 3. DETAILED FINDINGS
  // ==========================================
  if (report.violations.length > 0) {
    report.violations.forEach((violation: Finding, idx: number) => {
      // Impact Chip Colors
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

      // Pre-calculate line wrapping and exact heights for all sections
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      const titleLines = doc.splitTextToSize(`${idx + 1}. ${violation.title}`, cardInnerWidth);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      const problemText = violation.remediation.whatIsWrong || violation.description;
      const problemLines = doc.splitTextToSize(problemText, cardInnerWidth);

      const whyLines = doc.splitTextToSize(violation.remediation.whyItMatters, cardInnerWidth);

      const whoLines = violation.remediation.whoIsAffected
        ? doc.splitTextToSize(violation.remediation.whoIsAffected, cardInnerWidth)
        : null;

      const fixLines = doc.splitTextToSize(violation.remediation.howToFix, cardInnerWidth);

      // Standards text line
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      const rawStandards =
        violation.remediation.wcagCriteria?.join(', ') || violation.tags?.slice(0, 4).join(', ');
      const standardsText = `Rule ID: ${violation.id}   |   Standards: ${rawStandards || 'WCAG 2.1 AA'}`;
      const standardsLines = doc.splitTextToSize(standardsText, cardInnerWidth);

      // Selectors lines
      doc.setFont('courier', 'normal');
      doc.setFontSize(7.5);
      const selectorLinesList: string[][] = [];
      const nodesToShow = violation.nodes.slice(0, 2);
      nodesToShow.forEach((node) => {
        const selText = node.target.join(' ');
        selectorLinesList.push(doc.splitTextToSize(selText, cardInnerWidth - 14));
      });

      // Code example lines
      doc.setFont('courier', 'normal');
      doc.setFontSize(7);
      let badCodeLines: string[] | null = null;
      let goodCodeLines: string[] | null = null;
      let badBoxH = 0;
      let goodBoxH = 0;

      if (violation.remediation.codeExample) {
        const bad = doc.splitTextToSize(violation.remediation.codeExample.incorrect, cardInnerWidth - 16);
        const good = doc.splitTextToSize(violation.remediation.codeExample.correct, cardInnerWidth - 16);
        badCodeLines = bad;
        goodCodeLines = good;
        badBoxH = 10 + bad.length * 8.5 + 4;
        goodBoxH = 10 + good.length * 8.5 + 4;
      }


      // Compute heights for whole card as well as safe split sections
      const cardPaddingTop = 16;
      const cardPaddingBottom = 12;

      const sectionAContentH =
        15 + // badges row
        titleLines.length * 13 + 5 +
        10 + problemLines.length * 10.5 + 5 +
        10 + whyLines.length * 10.5 + 5 +
        (whoLines ? 10 + whoLines.length * 10.5 + 5 : 0) +
        10 + fixLines.length * 10.5 + 5;

      let sectionBContentH = 0;
      if (badCodeLines && goodCodeLines) {
        sectionBContentH += 10 + badBoxH + 4 + goodBoxH + 6;
      }
      sectionBContentH += standardsLines.length * 9.5 + 5;
      if (selectorLinesList.length > 0) {
        sectionBContentH += 10;
        selectorLinesList.forEach((sl) => {
          sectionBContentH += sl.length * 9 + 3;
        });
        if (violation.nodes.length > 2) {
          sectionBContentH += 10;
        }
      }

      const cardH = cardPaddingTop + sectionAContentH + sectionBContentH + cardPaddingBottom;
      const freshPageAvailable = maxPageY - headerRunningY; // ~698 pt
      const cardX = margin + cardPaddingX;

      if (idx === 0) {
        const spaceNeededForFirst = 20 + (cardH <= freshPageAvailable ? cardH : sectionAContentH);
        if (y + spaceNeededForFirst > maxPageY) {
          doc.addPage();
          drawRunningHeader();
          y = headerRunningY;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(24, 35, 58);
        doc.text(`Identified Violations (${report.violations.length})`, margin, y);
        y += 16;
      }

      if (cardH <= freshPageAvailable) {
        // Fits entirely on one page: check if current page has space, otherwise start fresh page
        if (y + cardH > maxPageY) {
          doc.addPage();
          drawRunningHeader();
          y = headerRunningY;
        }

        const cardStartY = y;
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(201, 208, 221);
        doc.setLineWidth(0.75);
        doc.roundedRect(margin, cardStartY, contentWidth, cardH, 4, 4, 'FD');

        let innerY = cardStartY + cardPaddingTop;

        // 1. Top Badges & Count Row
        const pillW = drawPill(violation.impact.toUpperCase(), cardX, innerY, impactBg, impactFg);
        drawPill(violation.id, cardX + pillW + 6, innerY, [242, 240, 255], [24, 35, 58]);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(88, 103, 125);
        const countLabel = `${violation.nodes.length} element${violation.nodes.length === 1 ? '' : 's'} affected`;
        doc.text(countLabel, margin + contentWidth - cardPaddingX, innerY - 0.5, { align: 'right' });
        innerY += 15;

        // 2. Finding Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(24, 35, 58);
        doc.text(titleLines, cardX, innerY);
        innerY += titleLines.length * 13 + 5;

        // 3. What is the problem?
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(49, 87, 232);
        doc.text('What is the problem?', cardX, innerY);
        innerY += 10;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(24, 35, 58);
        doc.text(problemLines, cardX, innerY);
        innerY += problemLines.length * 10.5 + 5;

        // 4. Why does it matter?
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(180, 83, 9);
        doc.text('Why does it matter?', cardX, innerY);
        innerY += 10;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(88, 103, 125);
        doc.text(whyLines, cardX, innerY);
        innerY += whyLines.length * 10.5 + 5;

        // 5. Who may be affected?
        if (whoLines) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(107, 70, 217);
          doc.text('Who may be affected?', cardX, innerY);
          innerY += 10;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(88, 103, 125);
          doc.text(whoLines, cardX, innerY);
          innerY += whoLines.length * 10.5 + 5;
        }

        // 6. How to fix it:
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(25, 168, 154);
        doc.text('How to fix it:', cardX, innerY);
        innerY += 10;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(24, 35, 58);
        doc.text(fixLines, cardX, innerY);
        innerY += fixLines.length * 10.5 + 5;

        // 7. Illustrative Code Example
        if (badCodeLines && goodCodeLines) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(88, 103, 125);
          doc.text('Illustrative Code Example:', cardX, innerY);
          innerY += 10;

          // Problematic code box
          doc.setFillColor(255, 245, 245);
          doc.setDrawColor(254, 215, 215);
          doc.setLineWidth(0.5);
          doc.roundedRect(cardX, innerY, cardInnerWidth, badBoxH, 2, 2, 'FD');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.setTextColor(242, 92, 77);
          doc.text('Problematic Pattern:', cardX + 6, innerY + 8);

          doc.setFont('courier', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(24, 35, 58);
          doc.text(badCodeLines, cardX + 6, innerY + 17);
          innerY += badBoxH + 4;

          // Recommended code box
          doc.setFillColor(240, 253, 244);
          doc.setDrawColor(187, 247, 208);
          doc.setLineWidth(0.5);
          doc.roundedRect(cardX, innerY, cardInnerWidth, goodBoxH, 2, 2, 'FD');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.setTextColor(25, 168, 154);
          doc.text('Recommended Pattern:', cardX + 6, innerY + 8);

          doc.setFont('courier', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(24, 35, 58);
          doc.text(goodCodeLines, cardX + 6, innerY + 17);
          innerY += goodBoxH + 6;
        }

        // 8. Technical Standards & Rule ID
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(88, 103, 125);
        doc.text(standardsLines, cardX, innerY);
        innerY += standardsLines.length * 9.5 + 5;

        // 9. Affected Elements & Selectors
        if (selectorLinesList.length > 0) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(88, 103, 125);
          doc.text('Affected Elements & CSS Selectors:', cardX, innerY);
          innerY += 10;

          selectorLinesList.forEach((selLines) => {
            doc.setFont('courier', 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(49, 87, 232);
            doc.text(selLines, cardX + 6, innerY);
            innerY += selLines.length * 9 + 3;
          });

          if (violation.nodes.length > 2) {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(7.5);
            doc.setTextColor(140, 150, 165);
            doc.text(
              `(+ ${violation.nodes.length - 2} additional element${violation.nodes.length - 2 === 1 ? '' : 's'} on page)`,
              cardX + 6,
              innerY
            );
            innerY += 10;
          }
        }

        y = cardStartY + cardH + 12;
      } else {
        // Exceptionally tall finding exceeding a single page: split cleanly across pages
        const part1H = cardPaddingTop + sectionAContentH + cardPaddingBottom;
        if (y + part1H > maxPageY) {
          doc.addPage();
          drawRunningHeader();
          y = headerRunningY;
        }

        const part1StartY = y;
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(201, 208, 221);
        doc.setLineWidth(0.75);
        doc.roundedRect(margin, part1StartY, contentWidth, part1H, 4, 4, 'FD');

        let innerY = part1StartY + cardPaddingTop;

        const pillW = drawPill(violation.impact.toUpperCase(), cardX, innerY, impactBg, impactFg);
        drawPill(violation.id, cardX + pillW + 6, innerY, [242, 240, 255], [24, 35, 58]);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(88, 103, 125);
        const countLabel = `${violation.nodes.length} element${violation.nodes.length === 1 ? '' : 's'} affected`;
        doc.text(countLabel, margin + contentWidth - cardPaddingX, innerY - 0.5, { align: 'right' });
        innerY += 15;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(24, 35, 58);
        doc.text(titleLines, cardX, innerY);
        innerY += titleLines.length * 13 + 5;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(49, 87, 232);
        doc.text('What is the problem?', cardX, innerY);
        innerY += 10;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(24, 35, 58);
        doc.text(problemLines, cardX, innerY);
        innerY += problemLines.length * 10.5 + 5;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(180, 83, 9);
        doc.text('Why does it matter?', cardX, innerY);
        innerY += 10;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(88, 103, 125);
        doc.text(whyLines, cardX, innerY);
        innerY += whyLines.length * 10.5 + 5;

        if (whoLines) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(107, 70, 217);
          doc.text('Who may be affected?', cardX, innerY);
          innerY += 10;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(88, 103, 125);
          doc.text(whoLines, cardX, innerY);
          innerY += whoLines.length * 10.5 + 5;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(25, 168, 154);
        doc.text('How to fix it:', cardX, innerY);
        innerY += 10;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(24, 35, 58);
        doc.text(fixLines, cardX, innerY);

        y = part1StartY + part1H + 12;

        // Continuation Section B on next page
        const continuationHeaderH = 22;
        const part2H = cardPaddingTop + continuationHeaderH + sectionBContentH + cardPaddingBottom;
        if (y + part2H > maxPageY) {
          doc.addPage();
          drawRunningHeader();
          y = headerRunningY;
        }

        const part2StartY = y;
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(201, 208, 221);
        doc.setLineWidth(0.75);
        doc.roundedRect(margin, part2StartY, contentWidth, part2H, 4, 4, 'FD');

        let innerY2 = part2StartY + cardPaddingTop;

        const pillW2 = drawPill(violation.impact.toUpperCase(), cardX, innerY2, impactBg, impactFg);
        const pillW2Id = drawPill(violation.id, cardX + pillW2 + 6, innerY2, [242, 240, 255], [24, 35, 58]);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(88, 103, 125);
        const contTitle = `${violation.title.slice(0, 42)}... (Continued)`;
        doc.text(contTitle, cardX + pillW2 + 6 + pillW2Id + 8, innerY2);
        innerY2 += 18;

        if (badCodeLines && goodCodeLines) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(88, 103, 125);
          doc.text('Illustrative Code Example:', cardX, innerY2);
          innerY2 += 10;

          doc.setFillColor(255, 245, 245);
          doc.setDrawColor(254, 215, 215);
          doc.setLineWidth(0.5);
          doc.roundedRect(cardX, innerY2, cardInnerWidth, badBoxH, 2, 2, 'FD');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.setTextColor(242, 92, 77);
          doc.text('Problematic Pattern:', cardX + 6, innerY2 + 8);

          doc.setFont('courier', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(24, 35, 58);
          doc.text(badCodeLines, cardX + 6, innerY2 + 17);
          innerY2 += badBoxH + 4;

          doc.setFillColor(240, 253, 244);
          doc.setDrawColor(187, 247, 208);
          doc.setLineWidth(0.5);
          doc.roundedRect(cardX, innerY2, cardInnerWidth, goodBoxH, 2, 2, 'FD');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.setTextColor(25, 168, 154);
          doc.text('Recommended Pattern:', cardX + 6, innerY2 + 8);

          doc.setFont('courier', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(24, 35, 58);
          doc.text(goodCodeLines, cardX + 6, innerY2 + 17);
          innerY2 += goodBoxH + 6;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(88, 103, 125);
        doc.text(standardsLines, cardX, innerY2);
        innerY2 += standardsLines.length * 9.5 + 5;

        if (selectorLinesList.length > 0) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(88, 103, 125);
          doc.text('Affected Elements & CSS Selectors:', cardX, innerY2);
          innerY2 += 10;

          selectorLinesList.forEach((selLines) => {
            doc.setFont('courier', 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(49, 87, 232);
            doc.text(selLines, cardX + 6, innerY2);
            innerY2 += selLines.length * 9 + 3;
          });

          if (violation.nodes.length > 2) {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(7.5);
            doc.setTextColor(140, 150, 165);
            doc.text(
              `(+ ${violation.nodes.length - 2} additional element${violation.nodes.length - 2 === 1 ? '' : 's'} on page)`,
              cardX + 6,
              innerY2
            );
            innerY2 += 10;
          }
        }

        y = part2StartY + part2H + 12;
      }
    });
  } else {
    // Zero violations state in PDF
    ensureSpace(55);
    doc.setFillColor(221, 246, 241); // Teal soft
    doc.roundedRect(margin, y, contentWidth, 48, 4, 4, 'F');
    doc.setDrawColor(25, 168, 154);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, contentWidth, 48, 4, 4, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(25, 168, 154);
    doc.text('No Automated Violations Detected', margin + 12, y + 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(24, 35, 58);
    doc.text(
      'The axe-core engine evaluated the submitted page DOM and detected no automated accessibility violations.',
      margin + 12,
      y + 32
    );
    y += 60;
  }

  // ==========================================
  // 4. ITEMS REQUIRING HUMAN REVIEW (INCOMPLETE)
  // ==========================================
  const incompleteItems = (report.incomplete || []).filter((inc) => {
    // Avoid duplicating an item if it already exists as an automated violation
    return !report.violations.some((v) => v.id === inc.id);
  });

  if (incompleteItems.length > 0) {
    // Section Header Callout
    const reviewHeaderNoticeH = 46;
    ensureSpace(reviewHeaderNoticeH + 30);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(24, 35, 58);
    doc.text(`Items Requiring Human Review (${incompleteItems.length})`, margin, y);
    y += 14;

    // Explanatory guidance banner for human review
    doc.setFillColor(243, 232, 255); // Violet soft #F3E8FF
    doc.roundedRect(margin, y, contentWidth, reviewHeaderNoticeH, 4, 4, 'F');
    doc.setDrawColor(216, 180, 254); // Violet border #D8B4FE
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, contentWidth, reviewHeaderNoticeH, 4, 4, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(107, 70, 217); // Violet #6B46D9
    doc.text('Why do these checks require manual verification?', margin + 10, y + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(88, 103, 125);
    const noticeDesc =
      'Automated algorithms cannot definitively verify visual contrast without rendering context, nor can they determine if a button label is contextually meaningful or an image is truly decorative. Human review ensures full conformance.';
    const noticeLines = doc.splitTextToSize(noticeDesc, contentWidth - 20);
    doc.text(noticeLines, margin + 10, y + 26);
    y += reviewHeaderNoticeH + 12;

    // Render each IncompleteCheck card
    incompleteItems.forEach((item: IncompleteCheck, idx: number) => {
      const remediation = getRemediationForRule(item.id, item.description, item.helpUrl);

      // Pre-calculate wrapped lines
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      const titleLines = doc.splitTextToSize(`${idx + 1}. ${item.help || remediation.friendlyTitle || item.id}`, cardInnerWidth);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      const descText = item.description || remediation.whatIsWrong;
      const descLines = doc.splitTextToSize(descText, cardInnerWidth);

      const reviewRequirement = item.reason || 'Requires manual verification or visual context not fully computable automatically.';
      const reqLines = doc.splitTextToSize(reviewRequirement, cardInnerWidth);

      const howToVerifyText = remediation.howToFix;
      const howToVerifyLines = doc.splitTextToSize(howToVerifyText, cardInnerWidth);

      // Technical Standards & Rule ID
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      const rawStandards = remediation.wcagCriteria?.join(', ');
      const standardsText = `Rule ID: ${item.id}   |   Standards: ${rawStandards || 'WCAG 2.1 AA'}`;
      const standardsLines = doc.splitTextToSize(standardsText, cardInnerWidth);

      // Compute required card height
      const cardPaddingTop = 16;
      const cardPaddingBottom = 12;
      const cardH =
        cardPaddingTop +
        15 + // Badges row
        titleLines.length * 13 + 5 + // Title
        10 + descLines.length * 10.5 + 5 + // Description
        10 + reqLines.length * 10.5 + 5 + // Review Requirement
        10 + howToVerifyLines.length * 10.5 + 5 + // Recommended Manual Verification Steps
        standardsLines.length * 9.5 + 5 + // Standards line
        cardPaddingBottom;

      const cardX = margin + cardPaddingX;
      const freshPageAvailable = maxPageY - headerRunningY;

      // Ensure space on page
      if (cardH <= freshPageAvailable) {
        if (y + cardH > maxPageY) {
          doc.addPage();
          drawRunningHeader();
          y = headerRunningY;
        }

        const cardStartY = y;
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(216, 180, 254); // Subtle violet border
        doc.setLineWidth(0.75);
        doc.roundedRect(margin, cardStartY, contentWidth, cardH, 4, 4, 'FD');

        let innerY = cardStartY + cardPaddingTop;

        // Top Badges: "NEEDS HUMAN REVIEW" + Rule ID + Evaluated count
        const pillW = drawPill('NEEDS HUMAN REVIEW', cardX, innerY, [243, 232, 255], [107, 70, 217]);
        drawPill(item.id, cardX + pillW + 6, innerY, [242, 240, 255], [24, 35, 58]);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(88, 103, 125);
        const countLabel = `${item.nodesCount} element${item.nodesCount === 1 ? '' : 's'} evaluated`;
        doc.text(countLabel, margin + contentWidth - cardPaddingX, innerY - 0.5, { align: 'right' });
        innerY += 15;

        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(24, 35, 58);
        doc.text(titleLines, cardX, innerY);
        innerY += titleLines.length * 13 + 5;

        // Context / Description
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(107, 70, 217); // Violet
        doc.text('Review Context & Description:', cardX, innerY);
        innerY += 10;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(24, 35, 58);
        doc.text(descLines, cardX, innerY);
        innerY += descLines.length * 10.5 + 5;

        // Review Requirement
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(180, 83, 9); // Amber
        doc.text('Why Human Review is Required:', cardX, innerY);
        innerY += 10;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(88, 103, 125);
        doc.text(reqLines, cardX, innerY);
        innerY += reqLines.length * 10.5 + 5;

        // Recommended Manual Verification Steps
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(25, 168, 154); // Teal
        doc.text('Recommended Manual Verification Steps:', cardX, innerY);
        innerY += 10;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(24, 35, 58);
        doc.text(howToVerifyLines, cardX, innerY);
        innerY += howToVerifyLines.length * 10.5 + 5;

        // Standards & Rule ID
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(88, 103, 125);
        doc.text(standardsLines, cardX, innerY);

        y = cardStartY + cardH + 12;
      } else {
        // Safe continuation split across pages for extraordinarily tall review items
        if (y + 120 > maxPageY) {
          doc.addPage();
          drawRunningHeader();
          y = headerRunningY;
        }

        const part1H =
          cardPaddingTop +
          15 +
          titleLines.length * 13 + 5 +
          10 + descLines.length * 10.5 + 5 +
          10 + reqLines.length * 10.5 + 5 +
          cardPaddingBottom;

        const part1StartY = y;
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(216, 180, 254);
        doc.setLineWidth(0.75);
        doc.roundedRect(margin, part1StartY, contentWidth, part1H, 4, 4, 'FD');

        let innerY = part1StartY + cardPaddingTop;

        const pillW = drawPill('NEEDS HUMAN REVIEW', cardX, innerY, [243, 232, 255], [107, 70, 217]);
        drawPill(item.id, cardX + pillW + 6, innerY, [242, 240, 255], [24, 35, 58]);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(88, 103, 125);
        const countLabel = `${item.nodesCount} element${item.nodesCount === 1 ? '' : 's'} evaluated`;
        doc.text(countLabel, margin + contentWidth - cardPaddingX, innerY - 0.5, { align: 'right' });
        innerY += 15;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(24, 35, 58);
        doc.text(titleLines, cardX, innerY);
        innerY += titleLines.length * 13 + 5;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(107, 70, 217);
        doc.text('Review Context & Description:', cardX, innerY);
        innerY += 10;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(24, 35, 58);
        doc.text(descLines, cardX, innerY);
        innerY += descLines.length * 10.5 + 5;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(180, 83, 9);
        doc.text('Why Human Review is Required:', cardX, innerY);
        innerY += 10;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(88, 103, 125);
        doc.text(reqLines, cardX, innerY);

        y = part1StartY + part1H + 12;

        // Continuation part 2
        const part2H =
          cardPaddingTop +
          18 + // continuation title
          10 + howToVerifyLines.length * 10.5 + 5 +
          standardsLines.length * 9.5 + 5 +
          cardPaddingBottom;

        if (y + part2H > maxPageY) {
          doc.addPage();
          drawRunningHeader();
          y = headerRunningY;
        }

        const part2StartY = y;
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(216, 180, 254);
        doc.setLineWidth(0.75);
        doc.roundedRect(margin, part2StartY, contentWidth, part2H, 4, 4, 'FD');

        let innerY2 = part2StartY + cardPaddingTop;

        const pillW2 = drawPill('NEEDS HUMAN REVIEW', cardX, innerY2, [243, 232, 255], [107, 70, 217]);
        const pillW2Id = drawPill(item.id, cardX + pillW2 + 6, innerY2, [242, 240, 255], [24, 35, 58]);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(88, 103, 125);
        const contTitle = `${(item.help || item.id).slice(0, 36)}... (Continued)`;
        doc.text(contTitle, cardX + pillW2 + 6 + pillW2Id + 8, innerY2);
        innerY2 += 18;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(25, 168, 154);
        doc.text('Recommended Manual Verification Steps:', cardX, innerY2);
        innerY2 += 10;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(24, 35, 58);
        doc.text(howToVerifyLines, cardX, innerY2);
        innerY2 += howToVerifyLines.length * 10.5 + 5;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(88, 103, 125);
        doc.text(standardsLines, cardX, innerY2);

        y = part2StartY + part2H + 12;
      }
    });
  }

  // ==========================================
  // 5. TESTING DISCLAIMER & SCOPE
  // ==========================================
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  const disclaimerLines = doc.splitTextToSize(report.disclaimer, contentWidth - 20);
  const disclaimerH = 22 + disclaimerLines.length * 9.5 + 8;

  ensureSpace(disclaimerH);

  doc.setFillColor(242, 240, 255);
  doc.roundedRect(margin, y, contentWidth, disclaimerH, 4, 4, 'F');
  doc.setDrawColor(201, 208, 221);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, disclaimerH, 4, 4, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(107, 70, 217); // Violet
  doc.text('AUTOMATED EVALUATION SCOPE & LIMITATIONS', margin + 10, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(88, 103, 125);
  doc.text(disclaimerLines, margin + 10, y + 24);

  // ==========================================
  // 5. PAGE NUMBERING IN FOOTER (ALL PAGES)
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
      pageHeight - 18,
      { align: 'center' }
    );
  }

  return doc;
}

/**
 * Triggers a cross-browser file download from a Blob with safe asynchronous DOM cleanup.
 * Prevents Chromium/Chrome from cancelling downloads when elements are removed prematurely.
 */
export function triggerBrowserDownload(blob: Blob, filename: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();

  // Asynchronous cleanup: Chrome requires the element to remain connected
  // and the object URL to remain valid until the browser's download manager takes over.
  setTimeout(() => {
    if (a.parentNode) {
      document.body.removeChild(a);
    }
    URL.revokeObjectURL(url);
  }, 1000);
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
    triggerBrowserDownload(blob, filename);
  }
}
