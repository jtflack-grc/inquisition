export type EvidenceType =
  "sec_8k" | "sec_other" | "lawsuit" | "regulator" | "news";

export type EvidenceSource =
  "seed" | "sec_edgar" | "courtlistener" | "gdelt" | "rss";

/** How much to trust the URL for legal/financial truth (UI + export). */
export type EvidenceTrustTier =
  | "issuer_primary"
  | "regulator_primary"
  | "litigation_index"
  | "navigation_hub"
  | "news_media";

/** Whether the link jumps to a specific filing or a search / index page. */
export type EvidenceLinkRole = "deep_link" | "navigation_hub";

export interface EvidenceItem {
  id: string;
  type: EvidenceType;
  source: EvidenceSource;
  title: string;
  url: string;
  retrievedAt?: string;
  publishedAt?: string;
  excerpt?: string;
  /** Short educational note shown under the link (what this artifact means). */
  teach?: string;
  tags?: string[];
  /** Curator-supplied trust tier; otherwise inferred in `annotateEvidenceTrust`. */
  trustTier?: EvidenceTrustTier;
  linkRole?: EvidenceLinkRole;
}

/** Milestone for teaching “event vs disclosure” lag (human-readable dates). */
export interface IncidentTimelineEvent {
  /** e.g. "Public disclosure", "Form 8-K Item 1.05" */
  label: string;
  /** e.g. "September 7, 2017" or "Q3 2017" */
  dateLabel: string;
  /** Optional one-line context */
  detail?: string;
}

/** Editorial control metadata — drives “last reviewed” and accountability. */
export interface IncidentGovernance {
  /** ISO date (YYYY-MM-DD) when evidence/financials were last reviewed. */
  lastVerified: string;
  reviewer?: string;
  /** Optional link to review policy (path in repo or external). */
  reviewPolicyHref?: string;
  /** Human-readable pointer, e.g. `docs/REVIEW_POLICY.md` in repo. */
  reviewPolicyNote?: string;
  /** Curator notes shown in the governance card (process, scope of review). */
  notes?: string;
}

export interface FinancialSnapshot {
  fiscalYearLabel: string;
  revenueUSDm?: number;
  ebitdaUSDm?: number;
  netIncomeUSDm?: number;
  provenance?: EvidenceItem[];
  /** Human-readable note, e.g. which statement line was approximated. */
  statementNote?: string;
  /** SEC accession number as filed, e.g. 0001048286-24-000089 */
  filingAccessionNumber?: string;
  /** Known-good link to filing or EDGAR index (optional). */
  filingUrl?: string;
  /** Form type when accession is cited, e.g. 10-K */
  filingForm?: string;
  /** If true, figures are teaching-scale / rounded — not cyber line items from a 10-K. */
  isIllustrative?: boolean;
}

export interface CompanyProfile {
  name: string;
  type: "Public" | "Private" | "Subsidiary" | "Non-profit" | "Unknown";
  secCik?: string;
  headquartersLabel: string;
  hqLat: number;
  hqLon: number;
  /** ISO 3166-1 alpha-2 for optional country highlight on globe */
  countryCode?: string;
  sector?: string;
  employeeCount?: number;
  foundedYear?: number;
  financials?: FinancialSnapshot;
}

/** Globe / workshop: attack mechanics and defensive framing (curator + taxonomy merge in UI). */
export interface IncidentSecurityLesson {
  /** How the incident class manifested technically (plain language, cite filings for precision). */
  attackMechanism?: string;
  /** Scenario-specific “what this case teaches” narrative for the globe (overrides slug library if set). */
  caseAnalysis?: string;
  /** Ordered response / recovery / program priorities tailored to this incident. */
  mitigationPriority?: string[];
  /** Detection, logging, threat-hunting, or audit angles. */
  identification?: string[];
  /** Preventive controls, architecture, and process. */
  prevention?: string[];
}

export interface Incident {
  id: string;
  slug: string;
  company: CompanyProfile;
  incidentTitle: string;
  incidentSummary: string;
  incidentTypeLabel: string;
  firstReportedLabel: string;
  lastUpdatedLabel: string;
  taxonomyTags: string[];
  evidence: EvidenceItem[];
  governance: IncidentGovernance;
  /** Intrusion → press → issuer/regulator artifacts (teaching order). */
  disclosureTimeline?: IncidentTimelineEvent[];
  /** Explicit unknowns; reduces overconfidence in models and headlines. */
  limitations?: string[];
  /** Curated attack + ID/prevention notes for globe popup (merged with tag-based hints). */
  securityLesson?: IncidentSecurityLesson;
  /** Default FAIR/materiality inputs for demo when user has not overridden */
  modelingDefaults?: {
    downtimeDays?: number;
    recordsMillions?: number;
  };
}

export type MaterialityCategory =
  | "information_privacy"
  | "business_interruption"
  | "cyber_extortion"
  | "network_security"
  | "reputational_damage";

export type Range3 = {
  min: number;
  mostLikely: number;
  max: number;
};

export type Provenance = {
  label: string;
  formula: string;
  inputs: Record<string, number | string | null>;
  notes?: string[];
  /** How this category should be read in the INQUISITION loss model. */
  analysisHint?: string;
  /** Questions that connect this loss category to control performance. */
  controlQuestions?: string[];
};

export type CategoryEstimate = {
  category: MaterialityCategory;
  rangeUSDm: Range3;
  provenance: Provenance;
  kind: "primary" | "secondary";
};

export type MaterialityOutputs = {
  grossPrimaryTotalUSDm: Range3;
  /** Primary loss after the explicitly entered insurance-recovery assumption. */
  primaryTotalUSDm: Range3;
  secondaryTotalUSDm: Range3;
  categories: CategoryEstimate[];
  confidenceLabel: string;
};

export type MaterialityInputs = {
  downtimeDays: number | null;
  recordsMillions: number | null;
  revenueUSDm: number | null;
  ebitdaUSDm: number | null;
  netIncomeUSDm: number | null;
  extortionPaymentUSDm: number | null;
  insuranceOffsetUSDm: number | null;
};

export type MaterialityOverrides = Partial<MaterialityInputs> & {
  confidenceLabel?: string;
};
