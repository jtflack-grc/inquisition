import type { Incident } from "./types";
import { getGlobeCaseIntelBySlug } from "./globeCaseIntelBySlug";

/** Tag-keyed hints merged under curator `securityLesson` (deduped, capped). */
const TAXONOMY_HINTS: Record<
  string,
  { identification: string[]; prevention: string[] }
> = {
  ransomware: {
    identification: [
      "Mass file encryption or renamed extensions on shares and endpoints.",
      "Ransom notes, TOR pages, or sudden spikes in SMB/RDP before encryption.",
    ],
    prevention: [
      "Immutable or offline backups with tested restores; block backup deletion from primary AD.",
      "MFA on VPN/RDP; privileged access workstations for admins.",
      "Segmentation between user LAN, servers, and DC/backup networks.",
    ],
  },
  data_exfiltration: {
    identification: [
      "DLP alerts, unusual egress volume, or new cloud storage destinations.",
      "Large ZIP/archive creation on sensitive shares; off-hours admin access.",
    ],
    prevention: [
      "Least privilege on data stores; encryption at rest and in transit.",
      "Egress filtering and SaaS/API governance; CASB where applicable.",
    ],
  },
  cloud: {
    identification: [
      "CloudTrail / activity log gaps, new IAM users or access keys.",
      "Public bucket ACLs, security-group changes exposing storage.",
    ],
    prevention: [
      "Infrastructure-as-code guardrails; deny policies for public exposure.",
      "SCPs / org policies; periodic IAM access reviews and key rotation.",
    ],
  },
  supply_chain: {
    identification: [
      "Unexpected binaries or updates from vendors; new outbound C2 from trusted software paths.",
      "SBOM drift or unsigned artifacts where signing is expected.",
    ],
    prevention: [
      "Vendor risk tiers, attestation, and patch SLAs for critical software.",
      "Code signing verification; allowlisting for updates where feasible.",
    ],
  },
  vulnerability: {
    identification: [
      "Scanner coverage gaps on edge apps (e.g. WAF/API gateways).",
      "Exploit attempts in WAF/SIEM correlated with published CVE chatter.",
    ],
    prevention: [
      "Emergency patch playbooks for critical CVEs; virtual patching when hotfix lags.",
      "Attack-surface reduction: remove unused services, enforce TLS and HSTS.",
    ],
  },
  credentials: {
    identification: [
      "Impossible-travel logins, password-spray patterns, or new MFA devices.",
      "Credential stuffing against customer or employee portals.",
    ],
    prevention: [
      "Phishing-resistant MFA for privileged roles; passwordless where viable.",
      "Rate limits, CAPTCHA, and breach-password blocklists for customer auth.",
    ],
  },
  /** Cloud IAM misconfigs, over-privileged instance roles, SSRF to metadata. */
  iam: {
    identification: [
      "New IAM users/roles, access keys, or bucket policies outside change windows.",
      "SSRF or SSRF-like patterns reaching cloud metadata endpoints.",
    ],
    prevention: [
      "Least-privilege IAM; SCPs and permission boundaries for human and machine roles.",
      "Secrets in vaults—not in WAF configs or repos; periodic key rotation and access reviews.",
    ],
  },
  payment_card: {
    identification: [
      "PCI log anomalies on POS or terminal lanes; unexpected card-present absent stores.",
      "Network traffic from POS VLANs to unknown IPs.",
    ],
    prevention: [
      "Network segmentation for cardholder environment; P2PE or point-to-point encryption.",
      "Vendor remote access controls and jump boxes for franchisees.",
    ],
  },
  business_interruption: {
    identification: [
      "Monitoring loss across dependent SaaS or MSP links; cascading ticket volume.",
      "DNS or CDN misconfigurations affecting customer-facing apps.",
    ],
    prevention: [
      "Redundant paths and runbooks for single-vendor outages; tabletop exercises.",
      "Contractual SLAs and exit plans for critical SaaS.",
    ],
  },
  social_engineering: {
    identification: [
      "Help-desk password resets without standard verification; VIP impersonation.",
      "New MFA devices shortly after help-desk contact.",
    ],
    prevention: [
      "Verifier callbacks for sensitive changes; staff training on vishing.",
      "Tiered help-desk permissions and session recording for high-risk actions.",
    ],
  },
  /** Teaching tag — use for injection-style OWASP A03 discussions even when incident isn’t classic SQLi. */
  owasp_injection: {
    identification: [
      "SQL/parser errors in app logs; abnormal query shapes or stacked statements.",
      "User input reflected in OS commands, LDAP, or XPath contexts.",
    ],
    prevention: [
      "Parameterized queries / prepared statements; avoid string-concat SQL.",
      "Input validation with allowlists; encode output by context (HTML, URL, JS).",
      "Least-privilege DB and OS accounts; WAF rules tuned to app baselines.",
    ],
  },
  insider_threat: {
    identification: [
      "Data access volumes or queries that don’t match role history or ticket trail.",
      "Use of admin or break-glass accounts without corresponding change records.",
    ],
    prevention: [
      "Separation of duties; UEBA on sensitive stores; just-in-time privileged access.",
      "Contractor and employee offboarding with immediate key revocation; session recording for tier-0.",
    ],
  },
};

export type ResolvedGlobeSecurityLesson = {
  attackMechanism: string;
  /** Lived-in scenario read—why this case matters for analysts. */
  caseAnalysis: string;
  /** Response / recovery / program actions tailored to this incident (not generic hardening only). */
  mitigationPriority: string[];
  identification: string[];
  prevention: string[];
  /** True if taxonomy tags contributed identification/prevention bullets beyond curator lists. */
  mergedTaxonomyHints: boolean;
};

function dedupePush(target: string[], items: string[], cap: number) {
  for (const x of items) {
    if (target.length >= cap) return;
    const t = x.trim();
    if (t && !target.some((y) => y.toLowerCase() === t.toLowerCase()))
      target.push(t);
  }
}

const GENERIC_MITIGATION_FALLBACK = [
  "Stand up a single incident commander with legal, comms, and IT authority; freeze scope creep until facts are logged.",
  "Preserve logs and artifacts under legal hold before mass reimage; document chain-of-custody for regulators.",
  "Rehearse materiality and disclosure timing with finance and securities counsel using the documented incident-cost draft.",
];

/**
 * Curator fields override slug library; identification/prevention merge taxonomy tag hints (deduped).
 */
export function resolveGlobeSecurityLesson(
  inc: Incident
): ResolvedGlobeSecurityLesson {
  const curated = inc.securityLesson;
  const slugIntel = getGlobeCaseIntelBySlug(inc.slug);

  const mechanism =
    curated?.attackMechanism?.trim() ||
    `${inc.incidentTypeLabel}: use the summary below and issuer/regulator filings in the left column for authoritative narrative.`;

  const caseAnalysis =
    curated?.caseAnalysis?.trim() ||
    slugIntel?.caseAnalysis ||
    `This scenario (${inc.incidentTypeLabel}: ${inc.incidentTitle}) should be anchored to primary evidence and filings in the left column—headlines set triage priority, not legal or financial truth.`;

  const mitigationPriority: string[] = [];
  dedupePush(mitigationPriority, curated?.mitigationPriority ?? [], 10);
  dedupePush(mitigationPriority, slugIntel?.mitigationPriority ?? [], 10);
  if (mitigationPriority.length < 3) {
    dedupePush(mitigationPriority, GENERIC_MITIGATION_FALLBACK, 10);
  }

  const identification: string[] = [];
  const prevention: string[] = [];

  dedupePush(identification, curated?.identification ?? [], 8);
  dedupePush(prevention, curated?.prevention ?? [], 8);

  let merged = false;
  for (const tag of inc.taxonomyTags) {
    const hint = TAXONOMY_HINTS[tag];
    if (!hint) continue;
    const beforeI = identification.length;
    const beforeP = prevention.length;
    dedupePush(identification, hint.identification, 8);
    dedupePush(prevention, hint.prevention, 8);
    if (identification.length > beforeI || prevention.length > beforeP)
      merged = true;
  }

  return {
    attackMechanism: mechanism,
    caseAnalysis,
    mitigationPriority,
    identification,
    prevention,
    mergedTaxonomyHints: merged,
  };
}
