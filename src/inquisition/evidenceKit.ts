import type {
  EvidenceItem,
  Incident,
  IncidentGovernance,
  IncidentSecurityLesson,
  IncidentTimelineEvent,
} from "./types";
import { annotateEvidenceTrust } from "./trustTiers";

/** Default editorial metadata — merge per-seed via `governance` on `CatalogSeed`. */
export const DEFAULT_INCIDENT_GOVERNANCE: IncidentGovernance = {
  lastVerified: "2026-07-31",
  reviewer: "INQUISITION editorial",
  reviewPolicyNote:
    "Curated retrospective evidence; verify the linked primary artifact before professional use.",
  reviewPolicyHref: "./docs/REVIEW_POLICY.md",
};

/** Curated row used to compile a full `Incident` with consistent SEC / docket scaffolding. */
export type CatalogSeed = {
  id: string;
  slug: string;
  company: Incident["company"];
  incidentTitle: string;
  incidentTypeLabel: string;
  incidentSummary: string;
  firstReportedLabel: string;
  lastUpdatedLabel: string;
  taxonomyTags: string[];
  modelingDefaults?: Incident["modelingDefaults"];
  governance?: Partial<IncidentGovernance>;
  /** Skip auto SEC pack & court search; use `evidence` as the full list (campaign / multi-entity rows). */
  manualEvidenceOnly?: boolean;
  /** Required when `manualEvidenceOnly` */
  evidence?: EvidenceItem[];
  /** Free-text CourtListener search (federal RECAP mirror). */
  courtlistenerQuery?: string;
  /** Appended after SEC pack (or after manual list if you merge manually). */
  extras?: EvidenceItem[];
  disclosureTimeline?: IncidentTimelineEvent[];
  limitations?: string[];
  securityLesson?: IncidentSecurityLesson;
};

function normalizeCik(cik: string): string {
  const digits = cik.replace(/\D/g, "");
  return digits.length
    ? digits.padStart(Math.max(10, digits.length), "0").slice(-10)
    : cik;
}

/** Standard issuer anchors: EDGAR landing, 8-K filter, full-text search hint. */
export function standardSecPack(
  prefix: string,
  cik: string,
  legalName: string
): EvidenceItem[] {
  const padded = normalizeCik(cik);
  const browse = `https://www.sec.gov/edgar/browse/?CIK=${padded}&owner=exclude`;
  const eightK = `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${padded}&type=8-K&owner=exclude&count=40`;
  const firstToken = legalName.split(/[\s,]+/)[0] ?? legalName;
  return [
    {
      id: `${prefix}_sec_landing`,
      type: "sec_other",
      source: "sec_edgar",
      title: `SEC EDGAR — ${legalName} (all forms)`,
      url: browse,
      excerpt: `Official filing index for ${legalName}. Filter by 10-K, 10-Q, 8-K, DEF 14A, and exhibits.`,
      teach:
        "Artifact: EDGAR company index → Use: locate the exact 8-K/10-Q PDF for dates and MD&A → Misread: treating the landing page as the disclosure itself.",
      retrievedAt: "2025-03-18",
      trustTier: "issuer_primary",
      linkRole: "navigation_hub",
    },
    {
      id: `${prefix}_sec_8k`,
      type: "sec_8k",
      source: "sec_edgar",
      title: `Form 8-K — ${legalName} current reports`,
      url: eightK,
      excerpt:
        "Cyber events often surface as Item 1.05 (Reg S-K) or predecessor risk/operations disclosures—compare across quarters.",
      teach:
        "Artifact: Form 8-K queue → Use: compare Item 1.05 filing time vs first press → Misread: assuming the first news article matches Reg FD timing.",
      retrievedAt: "2025-03-18",
      trustTier: "issuer_primary",
      linkRole: "deep_link",
    },
    {
      id: `${prefix}_sec_search`,
      type: "sec_other",
      source: "sec_edgar",
      title: "SEC full-text search (EDGAR)",
      url: `https://www.sec.gov/edgar/search/#/q=${encodeURIComponent(firstToken)}%20(cyber%20OR%20breach%20OR%20ransomware)`,
      excerpt: `Catch MD&A, risk-factor, and footnote language that may not appear on the narrow 8-K queue.`,
      teach:
        "Artifact: EDGAR full-text search → Use: find cyber language outside the 8-K filter → Misread: citing a search results page as if it were a single filed exhibit.",
      retrievedAt: "2025-03-18",
      trustTier: "navigation_hub",
      linkRole: "navigation_hub",
    },
  ];
}

export function courtlistenerPack(prefix: string, query: string): EvidenceItem {
  return {
    id: `${prefix}_cl`,
    type: "lawsuit",
    source: "courtlistener",
    title: "Federal docket search (CourtListener)",
    url: `https://www.courtlistener.com/?q=${encodeURIComponent(query)}&type=r`,
    excerpt:
      "Free RECAP-backed index of federal complaints, MDL tags, and key dates.",
    teach:
      "Artifact: Federal docket search → Use: spot complaints, MDL tags, and scheduling orders for tail risk → Misread: confusing the search URL with a final judgment or settlement amount.",
    retrievedAt: "2025-03-18",
    trustTier: "litigation_index",
    linkRole: "navigation_hub",
  };
}

export function cisaAdvisory(
  prefix: string,
  slug: string,
  title: string,
  excerpt: string,
  teach: string
): EvidenceItem {
  return {
    id: `${prefix}_cisa_${slug}`,
    type: "regulator",
    source: "seed",
    title,
    url: `https://www.cisa.gov/news-events/cybersecurity-advisories/${slug}`,
    excerpt,
    teach,
    trustTier: "regulator_primary",
    linkRole: "deep_link",
  };
}

export function hhsBreachPortal(prefix: string): EvidenceItem {
  return {
    id: `${prefix}_hhs_wall`,
    type: "regulator",
    source: "seed",
    title: "HHS OCR — Breach Portal (HIPAA)",
    url: "https://ocrportal.hhs.gov/ocr/breach/breach_report.jsf",
    excerpt:
      "Covered entities and business associates report breaches affecting 500+ individuals.",
    teach:
      "Wall of Shame entries give notification timing and individuals affected—high-signal for health privacy loss magnitude.",
    trustTier: "regulator_primary",
    linkRole: "deep_link",
  };
}

export function ftcPressRelease(
  url: string,
  title: string,
  excerpt: string,
  teach: string,
  prefix: string,
  id: string
): EvidenceItem {
  return {
    id: `${prefix}_${id}`,
    type: "regulator",
    source: "seed",
    title,
    url,
    excerpt,
    teach,
    trustTier: "regulator_primary",
    linkRole: "deep_link",
  };
}

export function catalogEntryToIncident(c: CatalogSeed): Incident {
  let evidence: EvidenceItem[] = [];
  if (c.manualEvidenceOnly) {
    evidence = [...(c.evidence ?? [])];
    if (c.extras?.length) evidence.push(...c.extras);
  } else {
    if (c.company.secCik) {
      evidence.push(...standardSecPack(c.id, c.company.secCik, c.company.name));
    }
    if (c.courtlistenerQuery) {
      evidence.push(courtlistenerPack(c.id, c.courtlistenerQuery));
    }
    if (c.extras?.length) evidence.push(...c.extras);
  }
  return {
    id: c.id,
    slug: c.slug,
    company: c.company,
    incidentTitle: c.incidentTitle,
    incidentTypeLabel: c.incidentTypeLabel,
    incidentSummary: c.incidentSummary,
    firstReportedLabel: c.firstReportedLabel,
    lastUpdatedLabel: c.lastUpdatedLabel,
    taxonomyTags: c.taxonomyTags,
    modelingDefaults: c.modelingDefaults,
    governance: { ...DEFAULT_INCIDENT_GOVERNANCE, ...c.governance },
    disclosureTimeline: c.disclosureTimeline,
    limitations: c.limitations,
    securityLesson: c.securityLesson,
    evidence: annotateEvidenceTrust(evidence),
  };
}
