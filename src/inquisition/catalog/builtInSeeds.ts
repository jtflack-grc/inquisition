import type { CatalogSeed } from "../evidenceKit";
import {
  cisaAdvisory,
  courtlistenerPack,
  ftcPressRelease,
  hhsBreachPortal,
} from "../evidenceKit";

/** First wave: flagship cases + major retail / health / hospitality evidence anchors. */
export const BUILTIN_CATALOG_SEEDS: CatalogSeed[] = [
  {
    id: "inc_live_nation_ticketmaster_2024",
    slug: "live-nation-ticketmaster-2024",
    company: {
      name: "Live Nation Entertainment, Inc.",
      type: "Public",
      secCik: "0001335258",
      headquartersLabel: "Beverly Hills, California, USA",
      hqLat: 34.0736,
      hqLon: -118.4004,
      countryCode: "US",
      sector: "Entertainment / Ticketing",
      employeeCount: 48000,
      foundedYear: 2010,
      financials: {
        fiscalYearLabel: "FY2023 (Form 10-K totals, public)",
        revenueUSDm: 22749,
        ebitdaUSDm: 1066.2,
        netIncomeUSDm: 563.3,
      },
    },
    incidentTitle: "Ticketmaster — cloud / credential theft narrative (2024)",
    incidentTypeLabel: "Data Exfiltration",
    incidentSummary:
      "Public reporting described unauthorized access to a Ticketmaster-linked database environment; follow-on coverage focused on third-party cloud configuration and credential hygiene.",
    firstReportedLabel: "May 2024",
    lastUpdatedLabel: "2024 (ongoing filings)",
    taxonomyTags: ["data_exfiltration", "cloud", "credentials", "supply_chain"],
    modelingDefaults: { downtimeDays: 0, recordsMillions: 5 },
    courtlistenerQuery: "Live Nation Ticketmaster data breach",
    extras: [
      {
        id: "ln_news_reuters",
        type: "news",
        source: "seed",
        title: "Reuters — Cybersecurity & cybercrime desk",
        url: "https://www.reuters.com/technology/cybersecurity/",
        excerpt:
          "Wire coverage for cross-checking dates; always reconcile to filed 8-K/10-Q text.",
        teach:
          "Artifact: News desk landing → Use: what the market heard first and headline dates → Misread: using wire timing alone to infer Reg FD or Item 1.05 compliance.",
        publishedAt: "2024-05-01",
        retrievedAt: "2025-03-18",
      },
    ],
  },
  {
    id: "inc_cdk_global_dealers_2024",
    slug: "cdk-global-dealers-2024",
    company: {
      name: "CDK Global, Inc.",
      type: "Public",
      secCik: "0001792580",
      headquartersLabel: "Hoffman Estates, Illinois, USA",
      hqLat: 42.0628,
      hqLon: -88.1228,
      countryCode: "US",
      sector: "Dealer management systems (automotive SaaS)",
      employeeCount: 8500,
      foundedYear: 1972,
      financials: {
        fiscalYearLabel: "Pre-go-private FY context (see filings)",
        revenueUSDm: 1800,
      },
    },
    incidentTitle: "DMS outage — dealer retail operations disruption (2024)",
    incidentTypeLabel: "Business Interruption",
    incidentSummary:
      "Prolonged outages across a major automotive DMS provider idled dealership sales and service workflows nationwide; press and dealer associations documented duration and workarounds.",
    firstReportedLabel: "June 19, 2024",
    lastUpdatedLabel: "Fall 2024 (remediation reporting)",
    taxonomyTags: ["outage", "supply_chain", "dms", "business_interruption"],
    modelingDefaults: { downtimeDays: 10, recordsMillions: 0 },
    courtlistenerQuery: "CDK Global cyber outage",
    extras: [
      {
        id: "cdk_trade",
        type: "news",
        source: "seed",
        title: "Automotive News — dealer operations coverage",
        url: "https://www.autonews.com/",
        excerpt:
          "Trade press estimates downtime exposure per rooftop and OEM workflow impacts.",
        teach:
          "For BI, pair vendor outage days with dealer revenue-at-risk assumptions from industry stats.",
      },
    ],
  },
  {
    id: "inc_mgm_resorts_2023",
    slug: "mgm-resorts-2023",
    company: {
      name: "MGM Resorts International",
      type: "Public",
      secCik: "0000789570",
      headquartersLabel: "Las Vegas, Nevada, USA",
      hqLat: 36.1699,
      hqLon: -115.1398,
      countryCode: "US",
      sector: "Hospitality & gaming",
      employeeCount: 74000,
      foundedYear: 1986,
      financials: {
        fiscalYearLabel: "FY2023 (10-K, public)",
        revenueUSDm: 16160,
        ebitdaUSDm: 4300,
        netIncomeUSDm: 1100,
      },
    },
    incidentTitle:
      "Operational disruption — ransomware / social-engineering narrative",
    incidentTypeLabel: "Business Interruption",
    incidentSummary:
      "High-visibility casino-hospitality outages; public sources discussed ransomware affiliates and social engineering against the IT service desk.",
    firstReportedLabel: "September 10, 2023",
    lastUpdatedLabel: "Q4 2023 (recovery / disclosures)",
    taxonomyTags: ["ransomware", "social_engineering", "hospitality", "outage"],
    modelingDefaults: { downtimeDays: 14, recordsMillions: 0 },
    courtlistenerQuery: "MGM Resorts ransomware",
  },
  {
    id: "inc_moveit_supply_chain_2023",
    slug: "moveit-transfer-supply-chain-2023",
    manualEvidenceOnly: true,
    company: {
      name: "MOVEit Transfer campaign (Progress Software / victims)",
      type: "Unknown",
      headquartersLabel: "USA • pin: Washington, D.C. (policy hub)",
      hqLat: 38.9072,
      hqLon: -77.0369,
      countryCode: "US",
      sector: "Managed file transfer / supply chain",
      financials: { fiscalYearLabel: "N/A — multi-entity campaign" },
    },
    incidentTitle: "Cl0p / MOVEit Transfer mass exploitation (2023)",
    incidentTypeLabel: "Data Exfiltration",
    incidentSummary:
      "Zero-day and patch-gap exploitation of MOVEit Transfer led to data theft across universities, insurers, and public-sector entities; hundreds of breach notifications followed.",
    firstReportedLabel: "May 2023",
    lastUpdatedLabel: "2024+ (notifications & litigation)",
    taxonomyTags: [
      "supply_chain",
      "vulnerability",
      "data_exfiltration",
      "cl0p",
    ],
    modelingDefaults: { downtimeDays: 0, recordsMillions: 2 },
    governance: {
      notes:
        "Campaign seed: multiple victims; financials are not a single issuer 10-K slice.",
    },
    disclosureTimeline: [
      {
        label: "Mass exploitation / zero-day narrative",
        dateLabel: "Late May–June 2023",
        detail:
          "Patching and victim notifications rolled out over weeks; dates differ by entity.",
      },
      {
        label: "CISA advisory AA23-158A",
        dateLabel: "June 7, 2023",
        detail: "Federal severity and mitigation anchor for many IR playbooks.",
      },
      {
        label: "Long-tail breach notifications & litigation",
        dateLabel: "2023–2025+",
        detail: "Compare single-vendor SEC language vs aggregate victim costs.",
      },
    ],
    limitations: [
      "No single “company” P&L—losses are distributed across hundreds of organizations with different insurance and regulatory postures.",
      "Record-count and sector breakdowns in the model are didactic defaults, not a summation of all HHS/OCR entries.",
    ],
    securityLesson: {
      attackMechanism:
        "Campaign-style exploitation of MOVEit Transfer (managed file transfer): attackers abused a software vulnerability to steal data from many downstream organizations using the product—classic supply-chain / Nth-party risk where one product footprint amplifies loss.",
      identification: [
        "Unexpected exfiltration from MFT appliances; new external shares or sync jobs.",
        "Surge in breach notifications referencing the same product line across unrelated sectors.",
      ],
      prevention: [
        "Rapid patching for edge-facing transfer tools; disable anonymous uploads and tighten ACLs.",
        "Vendor tiering for file-transfer and B2B integration; monitor for anomalous bulk downloads.",
      ],
    },
    evidence: [
      (() => {
        const row = cisaAdvisory(
          "moveit",
          "aa23-158a",
          "CISA — Progress MOVEit Critical Vulnerability (AA23-158A)",
          "Federal technical guidance, affected versions, and mitigation steps for the campaign.",
          "Artifact: CISA advisory → Use: official severity, versions, and mitigation framing → Misread: conflating advisory text with a specific victim’s breach letter."
        );
        return { ...row, publishedAt: "2023-06-07", retrievedAt: "2025-03-18" };
      })(),
      {
        id: "moveit_progress_edgar",
        type: "sec_other",
        source: "sec_edgar",
        title: "Progress Software Corp. — SEC EDGAR (MOVEit vendor)",
        url: "https://www.sec.gov/edgar/browse/?CIK=0000876437&owner=exclude",
        excerpt:
          "Vendor risk factors, incident commentary, and insurance language often appear in 10-Q/10-K.",
        teach:
          "Artifact: Vendor EDGAR index → Use: issuer risk factors vs customer breach costs → Misread: assuming vendor stock move equals customer incident loss.",
        retrievedAt: "2025-03-18",
      },
      {
        id: "moveit_sec_fulltext",
        type: "sec_8k",
        source: "sec_edgar",
        title: "SEC full-text — search “MOVEit” across registrants",
        url: "https://www.sec.gov/edgar/search/#/q=MOVEit",
        excerpt:
          "Surfacing Item 1.05 filings and MD&A references tied to the same campaign.",
        teach:
          "Artifact: SEC full-text search → Use: build a peer set of Item 1.05 filers → Misread: citing search results without opening each PDF.",
        retrievedAt: "2025-03-18",
      },
      courtlistenerPack("moveit", "MOVEit Transfer data breach"),
      {
        id: "moveit_naag",
        type: "regulator",
        source: "seed",
        title: "NAAG — Data security multistate patterns",
        url: "https://www.naag.org/issues/data-security-privacy/",
        excerpt:
          "State AG coordination drives notification cadence and consumer redress.",
        teach:
          "Multistate investigations inflate legal spend and extend remediation timelines—secondary costs.",
      },
    ],
  },
  {
    id: "inc_equifax_2017",
    slug: "equifax-2017",
    company: {
      name: "Equifax Inc.",
      type: "Public",
      secCik: "0000743312",
      headquartersLabel: "Atlanta, Georgia, USA",
      hqLat: 33.749,
      hqLon: -84.388,
      countryCode: "US",
      sector: "Credit reporting",
      employeeCount: 14000,
      foundedYear: 1899,
      financials: {
        fiscalYearLabel: "FY2016 (Form 10-K consolidated statements)",
        revenueUSDm: 3145,
        ebitdaUSDm: 900,
        netIncomeUSDm: 489,
        isIllustrative: true,
        statementNote:
          "Rounded from pre-breach Form 10-K consolidated statements—not cyber-specific loss lines. Open the 10-K table for exact figures.",
        filingForm: "10-K",
        filingUrl:
          "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000743312&type=10-K&owner=exclude&count=10",
      },
    },
    // Equifax: older lastVerified on purpose — demonstrates stale verification banner in UI.
    governance: {
      lastVerified: "2025-03-01",
      reviewer: "INQUISITION editorial (Equifax v1 deep pass)",
      notes:
        "FTC press release is a deep regulator anchor; CFPB link is a navigation landing—drill to any published order. SEC pack dates reflect batch link capture, not filing publication.",
    },
    disclosureTimeline: [
      {
        label: "Unauthorized access window (public narrative)",
        dateLabel: "May–July 2017",
        detail:
          "Investigations described access to dispute files; exact start/stop dates vary by source.",
      },
      {
        label: "Internal discovery (company statements)",
        dateLabel: "July 29, 2017",
        detail:
          "Often cited as internal discovery; compare to first press and Item 1.05 timing in 8-Ks.",
      },
      {
        label: "Public disclosure",
        dateLabel: "September 7, 2017",
        detail:
          "Market-moving date for many models—still reconcile to filed issuer language.",
      },
      {
        label: "FTC / CFPB / states global settlement (announced)",
        dateLabel: "July 2019",
        detail:
          "Regulatory cash and injunctive terms—use orders for precision vs press summaries.",
      },
    ],
    limitations: [
      "Consumer count (~147M) and geography mix reflect public enforcement summaries—not a line item in pre-breach GAAP statements.",
      "Attribution and exploit path were debated in reporting; treat technical detail as narrative until tied to a filed exhibit.",
      "CFPB landing page URL may change; verify current enforcement pages before citing in workpapers.",
    ],
    incidentTitle: "2017 consumer credit file breach — regulatory landmark",
    incidentTypeLabel: "Data Exfiltration",
    incidentSummary:
      "Attackers exploited an unpatched Apache Struts vector; ~147M U.S. consumers’ records exposed—driving FTC/CFPB/state settlements and long-run compliance programs.",
    firstReportedLabel: "September 7, 2017",
    lastUpdatedLabel: "2019–2024 (settlements & monitoring)",
    taxonomyTags: ["data_exfiltration", "pii", "regulator", "glba"],
    modelingDefaults: { downtimeDays: 0, recordsMillions: 147 },
    courtlistenerQuery: "Equifax data breach",
    securityLesson: {
      attackMechanism:
        "Public narrative centers on exploitation of an unpatched Apache Struts flaw (CVE-2017-5638) in an internet-facing application, enabling remote code execution and access to sensitive consumer-dispute data. Technical detail and timelines belong in filed materials and forensic reports—treat press summaries as triage only.",
      identification: [
        "Critical CVEs on external-facing middleware without compensating controls (WAF/virtual patch).",
        "Unusual process spawn or shell activity from Java/app tiers toward sensitive databases.",
      ],
      prevention: [
        "Aggressive patch SLAs for internet-facing frameworks; emergency CAB when PoC is public.",
        "Segment DMZ apps from core data stores; require authenticated paths and tight egress rules.",
      ],
    },
    extras: [
      (() => {
        const row = ftcPressRelease(
          "https://www.ftc.gov/news-events/news/press-releases/2019/07/equifax-pay-575-million-part-settlement-ftc-cfpb-states-related-2017-data-breach",
          "FTC — Equifax $575M global settlement press release (2019)",
          "Official FTC summary of allegations, consumer fund, and injunctive security program.",
          "Artifact: FTC press release → Use: high-level settlement economics and program shape → Misread: substituting the release for the full consent order text.",
          "efx",
          "ftc_pr"
        );
        return { ...row, publishedAt: "2019-07-22", retrievedAt: "2025-03-18" };
      })(),
      {
        id: "efx_cfpb",
        type: "regulator",
        source: "seed",
        title: "CFPB — enforcement & orders (search)",
        url: "https://www.consumerfinance.gov/enforcement/",
        excerpt:
          "Parallel financial-regulator penalties often accompany FTC privacy cases.",
        teach:
          "Artifact: CFPB enforcement index → Use: locate orders and complaints by institution → Misread: assuming every privacy case posts a stable deep URL forever.",
        retrievedAt: "2025-03-18",
        linkRole: "navigation_hub",
        trustTier: "regulator_primary",
      },
    ],
  },
  {
    id: "inc_solarwinds_supply_chain_2020",
    slug: "solarwinds-supply-chain-2020",
    company: {
      name: "SolarWinds Corporation",
      type: "Public",
      secCik: "0001739942",
      headquartersLabel: "Austin, Texas, USA",
      hqLat: 30.2672,
      hqLon: -97.7431,
      countryCode: "US",
      sector: "IT operations software",
      employeeCount: 3200,
      foundedYear: 1999,
      financials: {
        fiscalYearLabel: "FY2020 (10-K, public)",
        revenueUSDm: 1009,
        ebitdaUSDm: 280,
        netIncomeUSDm: 70,
      },
    },
    incidentTitle: "SUNBURST — Orion supply-chain compromise (2020)",
    incidentTypeLabel: "Supply Chain / Espionage",
    incidentSummary:
      "Sophisticated actors inserted malware into Orion build pipelines; downstream U.S. government and enterprise victims triggered a whole-of-nation response.",
    firstReportedLabel: "December 2020",
    lastUpdatedLabel: "2021–2024 (remediation / oversight)",
    taxonomyTags: ["supply_chain", "apt", "sunburst", "dwell_time"],
    modelingDefaults: { downtimeDays: 0, recordsMillions: 0.5 },
    courtlistenerQuery: "SolarWinds SUNBURST",
    disclosureTimeline: [
      {
        label: "Compromise window (investigation narrative)",
        dateLabel: "≈ Sept 2019 – Dec 2020",
        detail:
          "Public sources described long dwell in Orion build; treat as narrative until matched to a specific exhibit you cite.",
      },
      {
        label: "Public disclosure wave",
        dateLabel: "December 2020",
        detail:
          "SEC, CISA, and vendor communications clustered; compare issuer 8-K timing to advisories.",
      },
      {
        label: "Oversight / litigation / remediation reporting",
        dateLabel: "2021–2024",
        detail:
          "Multi-year tail—model run-rate security spend separately from one-time incident costs.",
      },
    ],
    limitations: [
      "Victim scope spans private sector and governments; not all costs are disclosed in one registrant’s filings.",
      "Attribution and intent are policy-weighted topics—do not treat press summaries as findings of fact for legal work.",
    ],
    securityLesson: {
      attackMechanism:
        "SUNBURST: malicious code inserted into Orion software builds, distributed as signed updates to customers—trust in the update channel became the attack vector. Detection often required behavioral analytics, not antivirus alone.",
      identification: [
        "Rare parent processes from legitimate vendor services; outbound C2 from trusted binaries.",
        "New SAML tokens or Azure AD anomalies when identity tooling is in blast radius.",
      ],
      prevention: [
        "Reproducible builds, signing ceremony controls, and binary transparency where feasible.",
        "Tier-0 identity isolation; assume vendor compromise in threat models for RMM and IT ops tools.",
      ],
    },
    extras: [
      (() => {
        const row = cisaAdvisory(
          "sw",
          "aa20-352a",
          "CISA — Advanced Persistent Threat Compromise of Government Agencies (AA20-352A)",
          "Early government-wide guidance referencing SolarWinds-related activity.",
          "Artifact: Joint CISA advisory → Use: whole-of-government severity framing for tail scenarios → Misread: mapping advisory language 1:1 to a single company’s damages."
        );
        return { ...row, publishedAt: "2020-12-17", retrievedAt: "2025-03-18" };
      })(),
    ],
  },
  {
    id: "inc_target_2013",
    slug: "target-2013",
    company: {
      name: "Target Corporation",
      type: "Public",
      secCik: "0000027419",
      headquartersLabel: "Minneapolis, Minnesota, USA",
      hqLat: 44.9778,
      hqLon: -93.265,
      countryCode: "US",
      sector: "Retail",
      employeeCount: 440000,
      foundedYear: 1902,
      financials: {
        fiscalYearLabel: "FY2013 10-K context",
        revenueUSDm: 71300,
        ebitdaUSDm: 5200,
      },
    },
    incidentTitle: "Payment card breach — POS / vendor vector (2013)",
    incidentTypeLabel: "Data Exfiltration",
    incidentSummary:
      "Holiday-season compromise of payment terminals exposed tens of millions of cards; accelerated chip-card migration and vendor-risk programs across retail.",
    firstReportedLabel: "December 2013",
    lastUpdatedLabel: "2014–2017 (investigations & settlements)",
    taxonomyTags: ["payment_card", "retail", "vendor_risk", "pci"],
    modelingDefaults: { downtimeDays: 0, recordsMillions: 40 },
    courtlistenerQuery: "Target Corporation data breach",
    disclosureTimeline: [
      {
        label: "Payment card compromise (operations)",
        dateLabel: "Nov–Dec 2013",
        detail:
          "Peak holiday season; forensic timing from filings and AG materials may differ from first press.",
      },
      {
        label: "Public confirmation / investor communications",
        dateLabel: "December 2013",
        detail:
          "Compare retailer statements to later PCI and issuer 8-K language.",
      },
      {
        label: "Multistate AG settlement package",
        dateLabel: "May 2017 (Nevada-led announcement)",
        detail:
          "Injunctive security program + monetary distribution—read the full consent docs for obligations.",
      },
    ],
    limitations: [
      "Card-count estimates evolved across investigations; use enforcement docs if you need a defensible number for teaching.",
      "Payment network assessments and issuer losses are often non-public—model splits are assumptions.",
    ],
    securityLesson: {
      attackMechanism:
        "POS malware / RAM scraping at retail terminals—attackers captured card data in the brief window it was in memory, often via vendor or network paths into the cardholder environment (PCI DSS scope).",
      identification: [
        "Unexpected executables on POS lanes; abnormal east-west traffic inside CDE.",
        "PCI forensic indicators (PFI) such as inconsistent log coverage on terminals.",
      ],
      prevention: [
        "Strict segmentation between POS VLANs and corporate networks; P2PE or E2EE where possible.",
        "Vendor remote access via jump boxes; disable default creds on terminals and controllers.",
      ],
    },
    extras: [
      {
        id: "tgt_nv_ag",
        type: "regulator",
        source: "seed",
        title:
          "Nevada AG — 47-state $18.5M Target settlement (2017) (multistate lead)",
        url: "https://ag.nv.gov/News/PR/2017/Attorney_General_Laxalt_and_47_States_Reach_%2418_5_Million_Settlement_With_Target_Corporation_over_2013_Data_Breach/",
        excerpt:
          "Official state AG release summarizing injunctive security program terms and monetary distribution.",
        teach:
          "Artifact: State AG press release → Use: injunctive program shape and headline monetary figure → Misread: treating the release as the full 47-state agreement text.",
        publishedAt: "2017-05-23",
        retrievedAt: "2025-03-18",
        trustTier: "regulator_primary",
        linkRole: "deep_link",
      },
    ],
  },
  {
    id: "inc_home_depot_2014",
    slug: "home-depot-2014",
    company: {
      name: "The Home Depot, Inc.",
      type: "Public",
      secCik: "0000354950",
      headquartersLabel: "Atlanta, Georgia, USA",
      hqLat: 33.749,
      hqLon: -84.388,
      countryCode: "US",
      sector: "Retail",
      employeeCount: 470000,
      foundedYear: 1978,
      financials: {
        fiscalYearLabel: "FY2014 10-K context",
        revenueUSDm: 83200,
        ebitdaUSDm: 9800,
      },
    },
    incidentTitle: "Payment card malware — self-checkout terminals (2014)",
    incidentTypeLabel: "Data Exfiltration",
    incidentSummary:
      "Custom malware scraped card data from U.S. and Canadian stores; parallel state AG settlements followed investigations into security practices.",
    firstReportedLabel: "September 2014",
    lastUpdatedLabel: "2014–2017 (AG settlements)",
    taxonomyTags: ["payment_card", "retail", "malware", "pci"],
    modelingDefaults: { downtimeDays: 0, recordsMillions: 56 },
    courtlistenerQuery: "Home Depot payment card breach",
    extras: [
      {
        id: "hd_state_ag",
        type: "regulator",
        source: "seed",
        title: "Multistate AG — pattern search (NAAG)",
        url: "https://www.naag.org/issues/data-security-privacy/",
        excerpt:
          "Retail card cases often produce coordinated AG injunctive packages.",
        teach:
          "State privacy enforcement stacks on top of federal settlements—don’t double-count identical spend without counsel input.",
      },
    ],
  },
  {
    id: "inc_anthem_2015",
    slug: "anthem-2015",
    company: {
      name: "Elevance Health, Inc. (f/k/a Anthem, Inc.)",
      type: "Public",
      secCik: "0001156039",
      headquartersLabel: "Indianapolis, Indiana, USA",
      hqLat: 39.7684,
      hqLon: -86.1581,
      countryCode: "US",
      sector: "Health insurance",
      employeeCount: 100000,
      foundedYear: 1944,
      financials: {
        fiscalYearLabel: "FY2015 scale (successor filings)",
        revenueUSDm: 79100,
        ebitdaUSDm: 4200,
      },
    },
    incidentTitle: "Health plan records — large-scale PHI exposure (2015)",
    incidentTypeLabel: "Data Exfiltration",
    incidentSummary:
      "State-sponsored attribution was discussed in public filings; nearly 80M records drove OCR, state insurance, and consumer litigation stacks.",
    firstReportedLabel: "February 2015",
    lastUpdatedLabel: "2015–2023 (OCR resolution & monitoring)",
    taxonomyTags: ["phi", "healthcare", "insurance", "apt"],
    modelingDefaults: { downtimeDays: 0, recordsMillions: 79 },
    courtlistenerQuery: "Anthem data breach",
    extras: [hhsBreachPortal("anthem")],
  },
  {
    id: "inc_marriott_starwood_2018",
    slug: "marriott-starwood-2018",
    company: {
      name: "Marriott International, Inc.",
      type: "Public",
      secCik: "0001048286",
      headquartersLabel: "Bethesda, Maryland, USA",
      hqLat: 38.9847,
      hqLon: -77.0947,
      countryCode: "US",
      sector: "Hospitality",
      employeeCount: 377000,
      foundedYear: 1927,
      financials: {
        fiscalYearLabel: "FY2019 10-K context",
        revenueUSDm: 20900,
        ebitdaUSDm: 3600,
      },
    },
    incidentTitle: "Starwood guest DB — long-dwell compromise disclosed (2018)",
    incidentTypeLabel: "Data Exfiltration",
    incidentSummary:
      "Unauthorized access to Starwood reservation DB began pre-acquisition; passport and payment data for hundreds of millions of guests became a multiregulator matter.",
    firstReportedLabel: "November 2018",
    lastUpdatedLabel: "2019–2024 (FTC / ICO / litigation)",
    taxonomyTags: ["hospitality", "pii", "passport", "m_and_a"],
    modelingDefaults: { downtimeDays: 0, recordsMillions: 339 },
    courtlistenerQuery: "Marriott Starwood breach",
    extras: [
      ftcPressRelease(
        "https://www.ftc.gov/news-events/news/press-releases/2024/10/ftc-takes-action-against-marriott-starwood-over-multiple-data-breaches",
        "FTC — Marriott / Starwood multiple breaches (2024 enforcement)",
        "Official FTC summary of deceptive security claims, breach history, and injunctive program.",
        "Cross-border hospitality breaches often pair FTC (US) with foreign DPAs—allocate regulatory tails by jurisdiction.",
        "mar",
        "ftc_2024"
      ),
      {
        id: "mar_ftc_docket",
        type: "regulator",
        source: "seed",
        title: "FTC — Marriott / Starwood administrative docket",
        url: "https://www.ftc.gov/legal-library/browse/cases-proceedings/192-3022-marriott-international-inc-starwood-hotels-resorts-worldwide-llc-matter",
        excerpt:
          "Orders, complaints, and filings for the underlying investigation.",
        teach:
          "Docket PDFs spell concrete control failures—useful for control-gap narratives in FAIR workshops.",
      },
    ],
  },
  {
    id: "inc_capital_one_2019",
    slug: "capital-one-2019",
    company: {
      name: "Capital One Financial Corporation",
      type: "Public",
      secCik: "0000927628",
      headquartersLabel: "McLean, Virginia, USA",
      hqLat: 38.9339,
      hqLon: -77.1773,
      countryCode: "US",
      sector: "Consumer banking",
      employeeCount: 52000,
      foundedYear: 1994,
      financials: {
        fiscalYearLabel: "FY2019 10-K context",
        revenueUSDm: 28500,
        netIncomeUSDm: 5500,
      },
    },
    incidentTitle: "Cloud misconfiguration — SSAF / IAM failure (2019)",
    incidentTypeLabel: "Data Exfiltration",
    incidentSummary:
      "A former cloud engineer exploited misconfigured WAF credentials to exfiltrate credit application data from AWS-hosted buckets; DOJ conviction followed.",
    firstReportedLabel: "July 2019",
    lastUpdatedLabel: "2022 (sentencing) / ongoing civil",
    taxonomyTags: ["cloud", "iam", "banking", "insider_threat"],
    modelingDefaults: { downtimeDays: 0, recordsMillions: 100 },
    courtlistenerQuery: "Capital One data breach",
    securityLesson: {
      attackMechanism:
        "Public case narrative: a party with knowledge of cloud architecture abused a misconfigured web application firewall (WAF) and cloud IAM to reach and exfiltrate sensitive data from object storage—blending insider knowledge with configuration weakness, not classic SQL injection.",
      identification: [
        "SSRF or WAF SSRF chains that reach instance metadata or role credentials.",
        "Buckets or roles reachable from unexpected principals; spikes in ListBucket/GetObject from new IPs.",
      ],
      prevention: [
        "Block metadata access from app roles where possible; short-lived credentials scoped to workload.",
        "IaC policy-as-code checks for public buckets and overly broad instance profiles.",
      ],
    },
    extras: [
      {
        id: "cof_occ",
        type: "regulator",
        source: "seed",
        title: "OCC — enforcement actions (search)",
        url: "https://www.occ.gov/topics/laws-and-regulations/enforcement-actions/index-enforcement-actions.html",
        excerpt:
          "Prudential bank regulators publish consent orders with civil money penalties.",
        teach:
          "Bank regulatory penalties are distinct from FTC/CFPB privacy tracks—aggregate carefully.",
      },
    ],
  },
  {
    id: "inc_opm_2015",
    slug: "opm-2015",
    company: {
      name: "U.S. Office of Personnel Management",
      type: "Non-profit",
      headquartersLabel: "Washington, D.C., USA",
      hqLat: 38.8949,
      hqLon: -77.0365,
      countryCode: "US",
      sector: "Federal civilian HR",
      employeeCount: 6000,
      foundedYear: 1978,
      financials: { fiscalYearLabel: "Federal — not commercial GAAP" },
    },
    incidentTitle: "Background-investigation records — dual breach (2015)",
    incidentTypeLabel: "Data Exfiltration",
    incidentSummary:
      "Compromise of SF-86 and related datasets affected millions of federal employees and clearance holders; drove multi-year identity-protection programs.",
    firstReportedLabel: "June 2015",
    lastUpdatedLabel: "2015–2020 (Congressional reports)",
    taxonomyTags: ["government", "clearance", "pii", "apt"],
    modelingDefaults: { downtimeDays: 0, recordsMillions: 22 },
    manualEvidenceOnly: true,
    evidence: [
      {
        id: "opm_congress",
        type: "regulator",
        source: "seed",
        title: "U.S. House Oversight — OPM data breach report (archive)",
        url: "https://oversight.house.gov/",
        excerpt:
          "Committee reports summarize scope, contractor roles, and remediation mandates.",
        teach:
          "Government incidents use appropriated budgets—not stock price—but liability and credit-monitoring costs are still quantifiable.",
      },
      {
        id: "opm_dhs",
        type: "regulator",
        source: "seed",
        title: "CISA — federal civilian executive branch guidance",
        url: "https://www.cisa.gov/topics/cyber-threats-and-advisories",
        excerpt:
          "Post-OPM reforms fed into CDM, EINSTAR successor programs, and zero-trust memos.",
        teach:
          "Agency-wide control uplift is a capitalized security investment line in public-sector FAIR bridges.",
      },
      courtlistenerPack("opm", "OPM data breach"),
    ],
  },
];
