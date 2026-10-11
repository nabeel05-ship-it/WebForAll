import { RemediationInfo } from './remediation-catalog';

export type ImpactLevel = 'critical' | 'serious' | 'moderate' | 'minor';

export interface AffectedNode {
  target: string[];
  html: string;
  failureSummary?: string;
}

export interface Finding {
  id: string;
  impact: ImpactLevel;
  title: string;
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: AffectedNode[];
  remediation: RemediationInfo;
}

export interface IncompleteCheck {
  id: string;
  description: string;
  help: string;
  helpUrl: string;
  nodesCount: number;
  reason?: string;
}

export interface PassedCheck {
  id: string;
  description: string;
  help: string;
}

export interface ScanSummary {
  totalViolations: number;
  totalAffectedElements: number;
  byImpact: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
  incompleteCount: number;
  passedCount: number;
}

export interface AccessibilityReport {
  targetUrl: string;
  finalUrl: string;
  timestamp: string;
  scanDurationMs: number;
  engine: {
    name: string;
    version: string;
    environment: string;
  };
  summary: ScanSummary;
  violations: Finding[];
  incomplete: IncompleteCheck[];
  passes: PassedCheck[];
  disclaimer: string;
  isDemo?: boolean;
}
