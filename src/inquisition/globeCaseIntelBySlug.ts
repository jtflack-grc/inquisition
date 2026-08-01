/**
 * Per-slug globe copy: case-specific analysis + mitigation/response priorities.
 * Curator `securityLesson.caseAnalysis` / `mitigationPriority` override these when set.
 */

export type GlobeCaseIntel = {
  caseAnalysis: string;
  mitigationPriority: string[];
};

export const GLOBE_CASE_INTEL_BY_SLUG: Record<string, GlobeCaseIntel> = {
  "live-nation-ticketmaster-2024": {
    caseAnalysis:
      "Cloud- and credential-centric narrative around a major ticketing platform: attackers often chase API keys, OAuth flows, and third-party SaaS admin paths rather than a single on-prem breach. Loss shows up in fraud, customer trust, and partner SLAs as much as in classic ‘records exposed’ counts.",
    mitigationPriority: [
      "Rotate and vault cloud/API credentials; enforce short-lived tokens for partner integrations.",
      "Harden CI/CD and admin consoles with phishing-resistant MFA and session binding.",
      "DLP/UEBA on bulk export and ticket-inventory APIs; alert on anomalous inventory transfers.",
      "War-game fraud spikes and chargebacks alongside security IR—finance must be in the bridge.",
    ],
  },
  "cdk-global-dealers-2024": {
    caseAnalysis:
      "DMS outage idled thousands of dealer rooftops: the material story is concurrent revenue loss across a sector dependent on one vendor stack, plus workarounds (manual deals, spreadsheets) that create their own compliance and fraud risk.",
    mitigationPriority: [
      "Contractual RTO/RPO and failover data paths for business-critical SaaS; don’t assume ‘they’re big so they’re safe.’",
      "Offline/cached transaction modes with reconciliation controls for extended outages.",
      "Parallel vendor or read-only continuity for VIN, titling, and OEM integrations.",
      "Sector ISAC sharing for early warning when the same threat hits multiple dealers.",
    ],
  },
  "mgm-resorts-2023": {
    caseAnalysis:
      "Hospitality outages often blend social engineering against the help desk, identity reset paths, and rapid lateral movement into POS, loyalty, and property-management systems—guest-facing downtime is the visible tip of a broader identity and recovery problem.",
    mitigationPriority: [
      "Verifier callbacks and manager escalation for any credential or MFA reset on privileged staff.",
      "Tier-0 session recording and PAWs for admins who can reach property networks.",
      "Pre-staged guest comp and manual check-in runbooks with PCI guardrails when POS is down.",
      "Tabletop that chains desk social engineering → AD/Azure → OT/building systems.",
    ],
  },
  "moveit-transfer-supply-chain-2023": {
    caseAnalysis:
      "A single MFT product footprint created correlated victimhood across education, insurance, and public sector: attackers exploited patch timing gaps while legal notification clocks started per entity—making aggregate ‘campaign loss’ hard to read from any one 10-Q.",
    mitigationPriority: [
      "Emergency patch cadence for internet-facing transfer tools; disable risky anonymous upload paths immediately after CVEs.",
      "Tenant isolation reviews: separate instances and keys per major business unit or customer group where feasible.",
      "Pre-drafted BA/customer comms when your file-transfer vendor is in active exploitation.",
      "Forensic prioritization on ‘who downloaded what’ logs, not just perimeter alerts.",
    ],
  },
  "equifax-2017": {
    caseAnalysis:
      "Struts-class gaps on internet-facing apps plus delayed patching created a path to high-value dispute data at national scale—the regulatory and consumer-remediation tail became the dominant cost story, not the initial exploit alone.",
    mitigationPriority: [
      "Critical CVE SLAs for external-facing middleware with compensating WAF/virtual patch when rebuild lags.",
      "Segment DMZ application tiers from core consumer databases; assume RCE on the edge is possible.",
      "Pre-negotiated consumer-notification and call-center surge capacity; test under SEC-style timelines.",
      "Board-level materiality rehearsal tying technical scope to finance and legal sign-off.",
    ],
  },
  "solarwinds-supply-chain-2020": {
    caseAnalysis:
      "SUNBURST weaponized trust in signed vendor updates; detection leaned on behavioral analytics and identity telemetry because traditional file reputation failed. Victim costs mixed vendor remediation, government oversight, and long-tail identity exposure.",
    mitigationPriority: [
      "Tier-0 isolation for RMM, Orion-class tooling, and break-glass—treat as potential supply-chain choke points.",
      "Binary transparency / hash verification discipline for build pipelines; segregate build signing keys.",
      "Hunt for SAML/Azure anomalies when SSO tools are in suspected blast radius.",
      "Customer transparency on subprocessors and update channels under contractual security clauses.",
    ],
  },
  "target-2013": {
    caseAnalysis:
      "POS RAM scraping via vendor/network paths into the cardholder environment showed that PCI scope and segmentation failures turn a retail malware event into a payment-system and brand crisis spanning issuers, PCI assessments, and multistate AG settlements.",
    mitigationPriority: [
      "Strict VLAN segmentation between POS, corporate, and vendor remote access; no flat networks.",
      "P2PE or point-to-point encryption to shrink clear-text card data in memory exposure.",
      "Vendor jump boxes with session recording; disable default creds on HVAC/POS maintenance paths.",
      "PCI forensic retainer and PFI engagement playbook before peak season.",
    ],
  },
  "home-depot-2014": {
    caseAnalysis:
      "Self-checkout and custom POS malware across two countries stressed parallel regulatory regimes (U.S./Canada) and showed that malware tuned for magnetic-stripe-era environments still drives years of AG and payment-network fallout.",
    mitigationPriority: [
      "Chip/chip-and-PIN migration completion and terminal hardening where mag stripe still exists.",
      "Application allowlisting on POS lanes; integrity monitoring on payment binaries.",
      "Cross-border breach notification matrix (PIPEDA vs state AG patterns) in the runbook.",
      "Franchise and co-brand operator segmentation—don’t inherit their flat network.",
    ],
  },
  "anthem-2015": {
    caseAnalysis:
      "Large health-plan data exposure triggered OCR, state insurance regulators, and multiyear monitoring—PHI scale makes this a template for ‘records’ models that must separate medical identity theft programs from generic credit monitoring.",
    mitigationPriority: [
      "Identity-proofing for portal and call-center account recovery; watch for medical identity theft patterns.",
      "Encrypt PHI flows end-to-end where attackers historically moved laterally from user to data warehouse tiers.",
      "Regulatory mapping: OCR + state DOI + consumer litigation—three parallel cost stacks.",
      "Tabletop with chief privacy officer and actuarial on credible record-count scenarios.",
    ],
  },
  "marriott-starwood-2018": {
    caseAnalysis:
      "Long-dwell access to a legacy reservation estate post-M&A highlighted failure to retire or integrate toxic assets—passport and travel data raised cross-border DPAs (ICO, FTC) beyond U.S. card-centric thinking.",
    mitigationPriority: [
      "M&A cyber diligence with kill switches for legacy guest DBs until fully assimilated.",
      "Data minimization on passport and loyalty fields; retention sunsets enforced in schema.",
      "Cross-border breach counsel bench (EU/UK/U.S.) before first public statement.",
      "Guest comms that separate ‘payment card’ from ‘travel document’ risk to reduce panic churn.",
    ],
  },
  "capital-one-2019": {
    caseAnalysis:
      "Cloud SSRF/IAM misconfiguration let an actor reach object storage containing credit-application data—the lesson is that WAF metadata chains and over-broad instance roles can bypass strong app-layer controls customers assumed they had.",
    mitigationPriority: [
      "Block or tightly scope instance metadata access from application roles; prefer OIDC workload identity.",
      "Policy-as-code to deny public buckets and wildcard IAM to sensitive prefixes.",
      "Secrets out of WAF configs/repos; rotate keys on any hint of config repo exposure.",
      "Purple-team SSRF tests specifically against internal cloud control planes.",
    ],
  },
  "opm-2015": {
    caseAnalysis:
      "Federal background-investigation data loss affected clearance holders nationwide—costs sit in appropriated programs, identity protection, and long-cycle trust damage rather than stock price, but dollar totals are still material to budget and oversight.",
    mitigationPriority: [
      "Zero-trust segmentation for personnel and clearance systems; assume nation-state persistence.",
      "Continuous monitoring of cleared personnel for suspicious credit/PII use post-breach.",
      "Congressional and IG comms discipline—technical timelines will be politicized.",
      "Vendor and legacy mainframe exit strategies where auth models predate modern MFA.",
    ],
  },
  "colonial-pipeline-2021": {
    caseAnalysis:
      "Operational decision to halt pipeline flow for safety while billing IT was encrypted made this a national energy-security story—BI and societal externality (fuel prices) dwarf a narrow ‘ransom paid’ line item in many teaching models.",
    mitigationPriority: [
      "OT/IT segmentation with explicit ‘manual safe operations’ procedures that don’t require full IT stack.",
      "Pre-negotiated TSA and DHS coordination paths; practice under CISA joint advisory tempo.",
      "Immutable backups for SCADA-adjacent engineering workstations, not just office 365.",
      "Separate financial models for firm loss vs macro price effects to avoid double counting.",
    ],
  },
  "jbs-foods-2021": {
    caseAnalysis:
      "REvil hit slaughter and processing plants across continents simultaneously—food supply BI is measured in lost carcass throughput and spoilage, with national security and export implications.",
    mitigationPriority: [
      "Air-gapped or resilient recipes for plant-floor HMI when central IT is down.",
      "Regional redundancy: can another geography absorb kill capacity during encryption?",
      "Ransom policy with FBI coordination pre-cleared at board level for CI food firms.",
      "Cold-chain and safety compliance when labeling/traceability systems fail mid-shift.",
    ],
  },
  "kaseya-vsa-revil-2021": {
    caseAnalysis:
      "MSP remote-management compromise created a fan-out of ransomware tenants—legal liability, SLA credits, and forensic queue depth became the MSP’s existential problem, not only encryption on one network.",
    mitigationPriority: [
      "Emergency disable of agent push/update until VSA (or equivalent) is verified clean.",
      "Customer segregation: separate RMM tenants/keys per vertical or risk tier.",
      "MSA clauses for supply-chain incident cost allocation and forensic cooperation.",
      "Canary agents that detect mass script deployment across estates.",
    ],
  },
  "cna-financial-2021": {
    caseAnalysis:
      "A major insurer encrypted mid-pandemic stress—attackers target cyber insurers and brokers because policy data and claims systems are high leverage; recovery intersects with regulatory reporting and policyholder service.",
    mitigationPriority: [
      "War-game ransomware when claims volume is already elevated (CAT season, pandemic).",
      "Segregate actuarial and underwriting gold sources from general corporate AD.",
      "Pre-arranged breach counsel and PR that understand insurance regulatory speech constraints.",
      "Validate backup restore for legacy policy admin mainframes, not just laptops.",
    ],
  },
  "change-healthcare-2024": {
    caseAnalysis:
      "Clearinghouse outage starved cash across ambulatory care—this is payment-switch BI at national scale, with OCR guidance on BA vs CE duties while small practices faced payroll risk.",
    mitigationPriority: [
      "Diversify claims clearing paths or maintain manual fallback billing with audit trails.",
      "Treasury lines and bridge financing playbooks when AR stops for weeks.",
      "BA incident comms that distinguish ‘no PHI accessed’ vs ‘switch down’ vs ‘data stolen’ early.",
      "State Medicaid and payer-by-payer contingency routes documented before peak flu season.",
    ],
  },
  "tmobile-2021": {
    caseAnalysis:
      "API/testing-environment exposure at carrier scale tied IMEI and identity data together—perfect for SIM-swap and account takeover fraud rings; FCC and FTC tracks added to the usual state AG privacy stack.",
    mitigationPriority: [
      "Kill non-prod paths to production subscriber data; synthetic data only in lower environments.",
      "Rate limits and device binding on SIM change and port-out APIs.",
      "Fraud ops integration: watch for SIM-swap spikes correlated with credential dumps.",
      "Regulator matrix: FCC + FTC + states for carrier breaches—don’t model one fine.",
    ],
  },
  "uber-2016-coverup": {
    caseAnalysis:
      "Enforcement focused on delayed disclosure and deceptive security claims—turning a technical intrusion into a governance and securities-style multiplier; good teaching case for ‘when did leadership know’ timelines.",
    mitigationPriority: [
      "Single source of truth incident timeline shared with legal, audit committee, and disclosure counsel.",
      "Whistleblower-safe reporting for engineers who see scope grow post-breach.",
      "No marketing claims about ‘monitoring’ unless operationally true and logged.",
      "FTC order compliance program ownership at CISO + GC level.",
    ],
  },
  "robinhood-2021": {
    caseAnalysis:
      "Support-employee social engineering exposed customer lists usable for targeted phishing against retail traders—small record count vs Equifax but high conversion fraud risk because of asset proximity.",
    mitigationPriority: [
      "Support tier least privilege: no bulk export without dual control and ticket.",
      "VIP impersonation playbooks with out-of-band verification.",
      "Broker-dealer Reg SCI / customer protection overlays on outage and breach comms.",
      "Rapid customer SMS/email warning templates for follow-on phishing waves.",
    ],
  },
  "nvidia-2022": {
    caseAnalysis:
      "Extortion against a semiconductor leader mixed IP theft narrative with signing-key fears—materiality may hinge on unreleased product roadmaps and customer trust in driver integrity, not only PII.",
    mitigationPriority: [
      "Code-signing ceremony and HSM policies; assume build artifacts are crown jewels.",
      "Threat intel on extortion groups targeting R&D VPN and dev workstations.",
      "Customer comms if any risk to binary integrity or supply of signed firmware.",
      "Legal strategy for trade-secret theft vs public bravado from criminals.",
    ],
  },
  "twilio-2022": {
    caseAnalysis:
      "Phish of employees with access to customer-facing admin paths showed IdP and SaaS trust boundaries—downstream customer account risk even when Twilio’s core crypto wasn’t ‘broken.’",
    mitigationPriority: [
      "Step-up auth for any customer tenant admin action from new devices.",
      "Vendor-Okta posture reviews; subprocessors with standing access need JIT.",
      "Customer notification when CPaaS abuse could enable OTP interception.",
      "Rotate all employee SSO sessions after confirmed credential theft.",
    ],
  },
  "okta-lapsus-2022": {
    caseAnalysis:
      "Subprocessor laptop with screenshotable support tooling put SSO vendor trust under a microscope—customers had to reassess blast radius of ‘we trust Okta for everything’ architectures.",
    mitigationPriority: [
      "Customer-side break-glass admin outside IdP for critical apps.",
      "Contractual right to audit subprocessor endpoint security for identity vendors.",
      "Session and screen capture policies on support workstations touching tenant data.",
      "Assume breach hunts on SAML assertions and new app registrations post-incident.",
    ],
  },
  "microsoft-exchange-hafnium-2021": {
    caseAnalysis:
      "Mass exploitation of on-prem Exchange created a correlated global incident set—defenders raced out-of-band patches while web shells persisted; many orgs learned true dependency on legacy mail as identity backbone.",
    mitigationPriority: [
      "Emergency patch SLAs when Microsoft releases out-of-band security updates.",
      "Hunt web shells in IIS/Exchange paths; assume parallel actors after PoC release.",
      "Accelerate cloud migration or hardened perimeter for remaining on-prem Exchange.",
      "Backup and legal hold on mailboxes before destructive second-stage actors arrive.",
    ],
  },
  "rackspace-hosted-exchange-2022": {
    caseAnalysis:
      "Hosted Exchange sunset under attack forced SMB customers through forced migration under duress—multi-week email loss is classic BI with contractual credits and churn, not a subtle ‘security incident’ footnote.",
    mitigationPriority: [
      "Exit strategy from single-vendor hosted mail; local PST/legal hold exports before crisis.",
      "SLA credits and insurance claims documentation per customer contract.",
      "Parallel DNS/MX cutover runbooks when primary hosted stack is declared untrusted.",
      "SMB customers: prioritize OAuth app inventory when migrating to M365 under pressure.",
    ],
  },
  "dish-network-2023": {
    caseAnalysis:
      "Customer call-center and billing degradation during ransomware showed operational resilience limits in telco/satellite retail—8-K materiality language became the teaching artifact for how firms describe ongoing customer impact.",
    mitigationPriority: [
      "IVR and call-center overflow to alternate geographies when core CRM is encrypted.",
      "Customer payment holiday policies pre-approved to reduce churn during outage.",
      "Segment broadcast ops from corporate IT ransomware blast radius where architecture allows.",
      "Law enforcement and cyber-insurance notification sequencing practiced quarterly.",
    ],
  },
  "merck-notpetya-2017": {
    caseAnalysis:
      "NotPetya proved wiper malware dressed as ransomware could erase manufacturing and vaccine capacity—Merck’s public quantification became the textbook pharma BI + insurance litigation case for non-physical cyber catastrophe.",
    mitigationPriority: [
      "Separate cyber-war and act-of-war policy language review with brokers before events.",
      "Manufacturing OT recovery images offline; validate golden images aren’t on domain-joined shares.",
      "Global batch release decisions when quality systems are suspect post-wiper.",
      "Don’t assume ‘we’re not in Ukraine’ exempts you from wormable payloads.",
    ],
  },
  "jpmorgan-2014": {
    caseAnalysis:
      "Massive household and SMB contact data theft from a G-SIB accelerated industry ISAC collaboration and raised the bar for bank cyber spend—the DOJ narrative matters for threat-intel and control failure storylines.",
    mitigationPriority: [
      "Tier-1 bank sharing via FS-ISAC; pre-clear legal for indicator distribution.",
      "DB access anomaly detection on bulk queries from unexpected app tiers.",
      "Customer comms that don’t over-promise ‘no fraud’ when credentials weren’t stolen but PII was.",
      "Board reporting that ties control uplift to actual attack path retrospective.",
    ],
  },
  "british-airways-2018": {
    caseAnalysis:
      "Magecart-style web skimming on payment and loyalty pages produced ICO GDPR fines (later reduced)—cross-border DPAs and airline PCI environments make this the European counterpart to Target-era card theft teaching.",
    mitigationPriority: [
      "Subresource integrity and strict CSP on payment pages; monitor third-party JS changes.",
      "Separate payment fields from marketing tag managers.",
      "GDPR breach clock discipline with UK/EU legal lead, not only U.S. counsel.",
      "Fraud monitoring on loyalty points redemption spikes after skimmer dwell.",
    ],
  },
  "maersk-notpetya-2017": {
    caseAnalysis:
      "Container-terminal IT rebuild from bare metal in days is the canonical logistics BI case—global trade felt port throughput loss; lessons span insurance, nation-state attribution, and OT dependency on Windows AD.",
    mitigationPriority: [
      "Domain-independent recovery images for terminal OS builds stored offline.",
      "Manual container release procedures with customs and port authority coordination.",
      "Cyber insurance and war exclusion legal prep in shipping conglomerates.",
      "Executive tabletop with COO on ‘no TOS for a week’ cash and contract impacts.",
    ],
  },
  "sony-pictures-2014": {
    caseAnalysis:
      "Destructive wiper plus extortion against a studio mixed IP leak, HR embarrassment, and operational paralysis—attribution debates became geopolitical, but IR lessons are identity, flat networks, and executive targeting.",
    mitigationPriority: [
      "Executive and creative staff as high-value phishing targets—PAM and device attestation.",
      "Pre-publish legal review of leaked scripts; DMCA and employment law coordination.",
      "Air-gap critical render and edit farms from general corporate AD where feasible.",
      "Destructive malware playbooks distinct from ransomware (no key to buy).",
    ],
  },
  "godaddy-2021": {
    caseAnalysis:
      "Long-lived compromise of hosting provisioning exposed managed WordPress customers—supply-chain trust in a registrar/hosting stack creates correlated site defacement and credential theft across SMBs.",
    mitigationPriority: [
      "Customer notification with forced credential resets across all hosted panels.",
      "Separate signing keys for provisioning automation vs customer admin APIs.",
      "Audit years of SSL issuance and redirect rules for attacker persistence.",
      "Offer migration credits when trust in shared hosting control plane is broken.",
    ],
  },
  "23andme-2023": {
    caseAnalysis:
      "Credential stuffing against consumer accounts weaponized the DNA Relatives graph—small initial access could imply large inferred genetic-relationship exposure, a novel privacy harm shape for regulators.",
    mitigationPriority: [
      "Step-up for relatives-feature toggles; rate limits on graph queries.",
      "Force password resets and block known breached-password lists aggressively.",
      "FTC/SEC sensitivity on ‘how many genomes’ claims vs actual accessed accounts.",
      "Communicate genetic vs account metadata exposure separately to reduce panic.",
    ],
  },
  "lastpass-2022": {
    caseAnalysis:
      "Iterative disclosure of vault backup theft raised questions about master-password iteration and architecture—password managers are single points of failure; user guidance on rotation and MFA became the mitigation story.",
    mitigationPriority: [
      "High-iteration KDF settings and migration prompts when vault blobs may be offline-bruteforced.",
      "Rotate all secrets stored in vault if backup exfiltration is confirmed.",
      "Transparent architecture post-mortems: what attackers got vs what they didn’t.",
      "Enterprise offboarding to alternate vaults with re-enrollment campaigns.",
    ],
  },
};

export function getGlobeCaseIntelBySlug(
  slug: string
): GlobeCaseIntel | undefined {
  return GLOBE_CASE_INTEL_BY_SLUG[slug];
}
