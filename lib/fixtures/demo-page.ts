import { runAxeScan } from '../scanner/axe-runner';
import { AccessibilityReport } from '../scanner/types';
import { DEMO_HTML, DEMO_SAMPLE_URL } from './demo-fixture';

export { DEMO_HTML, DEMO_SAMPLE_URL };

/**
 * Runs the real axe-core testing engine against the controlled demo fixture.
 */
export async function getDemoReport(): Promise<AccessibilityReport> {
  return runAxeScan({
    html: DEMO_HTML,
    targetUrl: DEMO_SAMPLE_URL,
    finalUrl: DEMO_SAMPLE_URL,
    isDemo: true,
    fetchTimeMs: 15,
  });
}
