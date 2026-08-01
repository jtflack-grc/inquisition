import type { CatalogSeed } from "../evidenceKit";
import { cisaAdvisory, courtlistenerPack } from "../evidenceKit";

/** Additional curated cases to reach a broad 30+ incident teaching library. */
export const MORE_CATALOG_SEEDS: CatalogSeed[] = [
  {
    id: "inc_colonial_pipeline_2021",
    slug: "colonial-pipeline-2021",
    manualEvidenceOnly: true,
    company: {
      name: "Colonial Pipeline Company",
      type: "Private",
      headquartersLabel: "Alpharetta, Georgia, USA",
      hqLat: 34.0754,
      hqLon: -84.2941,
      countryCode: "US",
      sector: "Energy pipelines (critical infrastructure)",
      financials: { fiscalYearLabel: "Private — throughput-based economics" },
    },
    incidentTitle:
      "Ransomware — refined products pipeline operations halt (2021)",
    incidentTypeLabel: "Cyber Extortion / OT",
    incidentSummary:
      "DarkSide affiliate ransomware led to proactive shutdown of billing/IT systems and voluntary pipeline operations; TSA subsequently issued cybersecurity directives for pipeline owners.",
    firstReportedLabel: "May 7, 2021",
    lastUpdatedLabel: "2021–2022 (recovery & policy)",
    taxonomyTags: ["ransomware", "critical_infrastructure", "darkside", "ot"],
    modelingDefaults: { downtimeDays: 6, recordsMillions: 0 },
    disclosureTimeline: [
      {
        label: "Ransomware event & voluntary pipeline shutdown",
        dateLabel: "May 7, 2021",
        detail:
          "Operational and policy narrative; pair with company statements and TSA directive timeline.",
      },
      {
        label: "Federal guidance / joint advisory wave",
        dateLabel: "May–June 2021",
        detail:
          "CISA/FBI materials on DarkSide ecosystem—use for TTP and response framing.",
      },
      {
        label: "Sector rulemaking (TSA pipeline security)",
        dateLabel: "2021–2022",
        detail:
          "Regulatory minimums become recurring compliance cost for peers—not just Colonial.",
      },
    ],
    limitations: [
      "Ransom payment details and insurer positions are partly non-public—model splits are assumptions.",
      "Macro fuel-price effects are societal externalities; don’t merge them into a single-company FAIR sheet without scope notes.",
    ],
    evidence: [
      cisaAdvisory(
        "colonial",
        "aa21-201a",
        "CISA / FBI — DarkSide ransomware (AA21-201A)",
        "Joint guidance on DarkSide TTPs contemporaneous with Colonial response.",
        "Artifact: Joint CISA/FBI advisory → Use: TTP and IR framing contemporaneous with the event → Misread: treating the advisory as Colonial-specific forensic findings."
      ),
      {
        id: "colonial_dhs",
        type: "regulator",
        source: "seed",
        title: "TSA — Pipeline cybersecurity directives (policy context)",
        url: "https://www.tsa.gov/for-industry/pipeline-security",
        excerpt: "Post-incident regulatory minimums for owner/operators.",
        teach:
          "New directives become recurring compliance CapEx/OpEx—secondary tail for the sector.",
      },
      courtlistenerPack("colonial", "Colonial Pipeline ransomware"),
    ],
  },
  {
    id: "inc_jbs_foods_2021",
    slug: "jbs-foods-2021",
    company: {
      name: "JBS S.A. (global meat processing; U.S. subsidiary ops)",
      type: "Public",
      secCik: "0001450123",
      headquartersLabel:
        "São Paulo, Brazil (issuer) · major U.S. plants in multiple states",
      hqLat: -23.5505,
      hqLon: -46.6333,
      countryCode: "BR",
      sector: "Food processing",
      employeeCount: 250000,
      foundedYear: 1953,
      financials: {
        fiscalYearLabel: "JBS S.A. annual/20-F (USD, public)",
        revenueUSDm: 72000,
        ebitdaUSDm: 6800,
      },
    },
    incidentTitle:
      "REvil ransomware — North American slaughter & processing disruption",
    incidentTypeLabel: "Cyber Extortion",
    incidentSummary:
      "Meat plants in U.S., Canada, and Australia experienced IT outages; public statements discussed ransom payment and FBI coordination.",
    firstReportedLabel: "May 30, 2021",
    lastUpdatedLabel: "June 2021 (recovery)",
    taxonomyTags: [
      "ransomware",
      "revil",
      "food_supply",
      "business_interruption",
    ],
    modelingDefaults: { downtimeDays: 3, recordsMillions: 0 },
    courtlistenerQuery: "JBS ransomware",
    extras: [
      cisaAdvisory(
        "jbs",
        "aa21-131a",
        "CISA — DarkSide ransomware best practices (AA21-131A)",
        "Contemporaneous ransomware guidance for CI operators (DarkSide ecosystem).",
        "Food & ag sector outages map cleanly to BI curves—lost throughput per plant-day."
      ),
    ],
  },
  {
    id: "inc_kaseya_vsa_2021",
    slug: "kaseya-vsa-revil-2021",
    manualEvidenceOnly: true,
    company: {
      name: "Kaseya Limited",
      type: "Private",
      headquartersLabel: "Miami, Florida, USA",
      hqLat: 25.7617,
      hqLon: -80.1918,
      countryCode: "US",
      sector: "MSP remote management software",
      financials: { fiscalYearLabel: "Private" },
    },
    incidentTitle: "REvil — VSA supply-chain ransomware (July 2021)",
    incidentTypeLabel: "Supply Chain / Extortion",
    incidentSummary:
      "Criminals exploited VSA on-prem instances to push ransomware downstream to MSP customers; thousands of endpoints encrypted globally.",
    firstReportedLabel: "July 2, 2021",
    lastUpdatedLabel: "2021–2022 (decryptor / remediation)",
    taxonomyTags: ["ransomware", "revil", "msp", "supply_chain"],
    modelingDefaults: { downtimeDays: 5, recordsMillions: 0 },
    evidence: [
      {
        id: "kaseya_cisa_alert",
        type: "regulator",
        source: "seed",
        title: "CISA — Kaseya VSA supply-chain ransomware attack (Jul 2021)",
        url: "https://www.cisa.gov/news-events/alerts/2021/07/02/kaseya-vsa-supply-chain-ransomware-attack",
        excerpt:
          "Same-day federal alert with containment priorities for on-prem VSA servers.",
        teach:
          "MSP supply-chain events need correlated loss models: one patch gap → many tenant deductibles.",
      },
      {
        id: "kaseya_cisa_msp",
        type: "regulator",
        source: "seed",
        title: "CISA-FBI — Guidance for MSPs affected by Kaseya VSA incident",
        url: "https://www.cisa.gov/news-events/alerts/2021/07/04/cisa-fbi-guidance-msps-and-their-customers-affected-kaseya-vsa-supply-chain-ransomware-attack",
        excerpt:
          "Joint remediation sequencing for providers and downstream customers.",
        teach:
          "Contractual pass-through of response costs shows up in SLA disputes—watch MSAs.",
      },
      courtlistenerPack("kaseya", "Kaseya VSA ransomware"),
    ],
  },
  {
    id: "inc_cna_financial_2021",
    slug: "cna-financial-2021",
    company: {
      name: "CNA Financial Corporation",
      type: "Public",
      secCik: "0001160529",
      headquartersLabel: "Chicago, Illinois, USA",
      hqLat: 41.8781,
      hqLon: -87.6298,
      countryCode: "US",
      sector: "Commercial insurance",
      employeeCount: 6000,
      foundedYear: 1897,
      financials: {
        fiscalYearLabel: "FY2021 10-K context",
        revenueUSDm: 10600,
        netIncomeUSDm: 1200,
      },
    },
    incidentTitle:
      "Ransomware — corporate network encryption & recovery (2021)",
    incidentTypeLabel: "Cyber Extortion",
    incidentSummary:
      "Major U.S. insurer disclosed disruption; press reporting described weeks-long restoration and eight-figure ransom dynamics (verify in filings).",
    firstReportedLabel: "March 2021",
    lastUpdatedLabel: "2021–2022 (10-Q / risk disclosures)",
    taxonomyTags: ["ransomware", "insurance", "business_interruption"],
    modelingDefaults: { downtimeDays: 10, recordsMillions: 0 },
    courtlistenerQuery: "CNA Financial ransomware",
  },
  {
    id: "inc_change_healthcare_2024",
    slug: "change-healthcare-2024",
    company: {
      name: "UnitedHealth Group Incorporated (Optum / Change Healthcare)",
      type: "Public",
      secCik: "0000731766",
      headquartersLabel: "Minnetonka, Minnesota, USA",
      hqLat: 44.9212,
      hqLon: -93.4681,
      countryCode: "US",
      sector: "Managed care / health tech",
      employeeCount: 440000,
      foundedYear: 1977,
      financials: {
        fiscalYearLabel: "FY2024 (see 8-K / earnings)",
        revenueUSDm: 371000,
        ebitdaUSDm: 32000,
      },
    },
    incidentTitle:
      "Change Healthcare outage — ransomware & payment switch disruption (2024)",
    incidentTypeLabel: "Business Interruption",
    incidentSummary:
      "Widely reported ransomware against Change Healthcare interrupted claims, pharmacy billing, and cash flows across U.S. healthcare providers for weeks.",
    firstReportedLabel: "February 21, 2024",
    lastUpdatedLabel: "2024 (HHS OCR guidance / restatements)",
    taxonomyTags: [
      "ransomware",
      "healthcare",
      "supply_chain",
      "payment_switch",
    ],
    modelingDefaults: { downtimeDays: 21, recordsMillions: 0 },
    courtlistenerQuery: "Change Healthcare ransomware",
    extras: [
      {
        id: "ch_hhs_faq",
        type: "regulator",
        source: "seed",
        title: "HHS — HIPAA / Change Healthcare cyber response resources",
        url: "https://www.hhs.gov/hipaa/for-professionals/security/guidance/cybersecurity/index.html",
        excerpt:
          "Agency guidance on continuity and breach reporting during vendor outages.",
        teach:
          "Downstream covered entities may still owe OCR notifications even when a BA is the initial victim.",
      },
    ],
  },
  {
    id: "inc_tmobile_2021",
    slug: "tmobile-2021",
    company: {
      name: "T-Mobile US, Inc.",
      type: "Public",
      secCik: "0001283694",
      headquartersLabel: "Bellevue, Washington, USA",
      hqLat: 47.6101,
      hqLon: -122.2015,
      countryCode: "US",
      sector: "Wireless telecommunications",
      employeeCount: 71000,
      foundedYear: 1994,
      financials: {
        fiscalYearLabel: "FY2021 10-K context",
        revenueUSDm: 80500,
        ebitdaUSDm: 27000,
      },
    },
    incidentTitle: "Customer API data — ~76M records marketed on forums (2021)",
    incidentTypeLabel: "Data Exfiltration",
    incidentSummary:
      "Carrier confirmed intrusion into testing environments exposing names, DOBs, SSNs, and IMEIs; FTC and state investigations followed.",
    firstReportedLabel: "August 2021",
    lastUpdatedLabel: "2022–2024 (FTC settlement)",
    taxonomyTags: ["telecom", "pii", "api", "ftc"],
    modelingDefaults: { downtimeDays: 0, recordsMillions: 76 },
    courtlistenerQuery: "T-Mobile data breach",
    extras: [
      {
        id: "tmobile_fcc",
        type: "regulator",
        source: "seed",
        title: "FCC — T-Mobile data security enforcement (2024)",
        url: "https://www.fcc.gov/document/t-mobile-required-change-business-practices-after-data-breaches-0",
        excerpt:
          "Commission consent decree on breach notifications, encryption, and security program obligations for carrier data.",
        teach:
          "Carriers face FCC jurisdiction alongside FTC/state AG privacy tracks—don’t model only one regulator.",
      },
    ],
  },
  {
    id: "inc_uber_2016",
    slug: "uber-2016-coverup",
    company: {
      name: "Uber Technologies, Inc.",
      type: "Public",
      secCik: "0001543151",
      headquartersLabel: "San Francisco, California, USA",
      hqLat: 37.7749,
      hqLon: -122.4194,
      countryCode: "US",
      sector: "Mobility / delivery platform",
      employeeCount: 32000,
      foundedYear: 2009,
      financials: {
        fiscalYearLabel: "FY2023 10-K scale",
        revenueUSDm: 37200,
        ebitdaUSDm: 1700,
      },
    },
    incidentTitle: "2016 breach — delayed disclosure & FTC resolution (2018)",
    incidentTypeLabel: "Data Exfiltration",
    incidentSummary:
      "Attackers accessed rider/driver data; public enforcement focused on failure to notify and deceptive claims about monitoring programs.",
    firstReportedLabel: "November 2017 (public disclosure of 2016 event)",
    lastUpdatedLabel: "2018 (FTC administrative order)",
    taxonomyTags: ["cover_up", "ftc", "pii", "platform"],
    modelingDefaults: { downtimeDays: 0, recordsMillions: 57 },
    courtlistenerQuery: "Uber FTC data breach",
    extras: [
      {
        id: "uber_ftc_order",
        type: "regulator",
        source: "seed",
        title: "FTC — Uber Technologies, Inc. (C-4662 / File 152-3054)",
        url: "https://www.ftc.gov/legal-library/browse/cases-proceedings/152-3054-c-4662-uber-technologies-inc-matter",
        excerpt:
          "Administrative matter including data security representations and monitoring of employee access to rider data.",
        teach:
          "Delayed disclosure can convert a privacy incident into a securities / consumer-protection multiplier.",
      },
    ],
  },
  {
    id: "inc_robinhood_2021",
    slug: "robinhood-2021",
    company: {
      name: "Robinhood Markets, Inc.",
      type: "Public",
      secCik: "0001783879",
      headquartersLabel: "Menlo Park, California, USA",
      hqLat: 37.453,
      hqLon: -122.1817,
      countryCode: "US",
      sector: "Retail brokerage / fintech",
      employeeCount: 2300,
      foundedYear: 2013,
      financials: {
        fiscalYearLabel: "FY2023 10-K",
        revenueUSDm: 1900,
        netIncomeUSDm: 30,
      },
    },
    incidentTitle: "November 2021 — ~5M customer email/name exposure",
    incidentTypeLabel: "Data Exfiltration",
    incidentSummary:
      "Social engineering against support employee led to customer list exfiltration; separate crypto-wallet SMS campaign followed weeks later.",
    firstReportedLabel: "November 8, 2021",
    lastUpdatedLabel: "2021–2022 (state AG letters / disclosures)",
    taxonomyTags: ["social_engineering", "fintech", "broker_dealer"],
    modelingDefaults: { downtimeDays: 0, recordsMillions: 5 },
    courtlistenerQuery: "Robinhood data breach",
  },
  {
    id: "inc_nvidia_2022",
    slug: "nvidia-2022",
    company: {
      name: "NVIDIA Corporation",
      type: "Public",
      secCik: "0001045810",
      headquartersLabel: "Santa Clara, California, USA",
      hqLat: 37.3541,
      hqLon: -121.9552,
      countryCode: "US",
      sector: "Semiconductors / AI software",
      employeeCount: 36000,
      foundedYear: 1993,
      financials: {
        fiscalYearLabel: "FY2024 10-K",
        revenueUSDm: 60900,
        ebitdaUSDm: 34000,
      },
    },
    incidentTitle: "Extortion group claims credentials & code theft (2022)",
    incidentTypeLabel: "Data Exfiltration / Extortion",
    incidentSummary:
      "Criminal group asserted access to proprietary information; company investigated with law enforcement—model as potential IP + extortion tail.",
    firstReportedLabel: "February 2022",
    lastUpdatedLabel: "2022 (investigations)",
    taxonomyTags: ["extortion", "ip_theft", "semiconductor"],
    modelingDefaults: { downtimeDays: 0, recordsMillions: 0 },
    courtlistenerQuery: "NVIDIA cyber attack",
  },
  {
    id: "inc_twilio_2022",
    slug: "twilio-2022",
    company: {
      name: "Twilio Inc.",
      type: "Public",
      secCik: "0001447669",
      headquartersLabel: "San Francisco, California, USA",
      hqLat: 37.7749,
      hqLon: -122.4194,
      countryCode: "US",
      sector: "Communications platform (CPaaS)",
      employeeCount: 8000,
      foundedYear: 2008,
      financials: {
        fiscalYearLabel: "FY2023 10-K",
        revenueUSDm: 4300,
        ebitdaUSDm: 600,
      },
    },
    incidentTitle:
      "Okta / vendor-path phishing — customer account access (2022)",
    incidentTypeLabel: "Account Takeover",
    incidentSummary:
      "SMS-phished employees led to limited customer contact data exposure; incident highlighted supply-chain trust in IdP workflows.",
    firstReportedLabel: "August 2022",
    lastUpdatedLabel: "2022 (post-mortem blogs)",
    taxonomyTags: ["phishing", "supply_chain", "saas"],
    modelingDefaults: { downtimeDays: 0, recordsMillions: 0.1 },
    courtlistenerQuery: "Twilio phishing breach",
  },
  {
    id: "inc_okta_2022",
    slug: "okta-lapsus-2022",
    company: {
      name: "Okta, Inc.",
      type: "Public",
      secCik: "0001660134",
      headquartersLabel: "San Francisco, California, USA",
      hqLat: 37.7898,
      hqLon: -122.3942,
      countryCode: "US",
      sector: "Identity & access management",
      employeeCount: 6000,
      foundedYear: 2009,
      financials: {
        fiscalYearLabel: "FY2024 10-K",
        revenueUSDm: 2300,
        ebitdaUSDm: 200,
      },
    },
    incidentTitle:
      "LAPSUS$ — subprocessor laptop access & support tooling (2022)",
    incidentTypeLabel: "Supply Chain / Insider-Like Access",
    incidentSummary:
      "Screenshots of internal apps circulated; Okta narrowed blast radius but faced scrutiny on customer SSO reliance.",
    firstReportedLabel: "March 22, 2022",
    lastUpdatedLabel: "2022 (transparency reports)",
    taxonomyTags: ["lapsus", "identity", "subprocessor"],
    modelingDefaults: { downtimeDays: 0, recordsMillions: 0 },
    courtlistenerQuery: "Okta LAPSUS",
  },
  {
    id: "inc_msft_exchange_hafnium_2021",
    slug: "microsoft-exchange-hafnium-2021",
    company: {
      name: "Microsoft Corporation",
      type: "Public",
      secCik: "0000789019",
      headquartersLabel: "Redmond, Washington, USA",
      hqLat: 47.674,
      hqLon: -122.1215,
      countryCode: "US",
      sector: "Enterprise software / cloud",
      employeeCount: 221000,
      foundedYear: 1975,
      financials: {
        fiscalYearLabel: "FY2024 10-K",
        revenueUSDm: 245000,
        ebitdaUSDm: 120000,
      },
    },
    incidentTitle: "ProxyLogon — on-prem Exchange zero-days exploited (2021)",
    incidentTypeLabel: "Supply Chain / Mass Exploitation",
    incidentSummary:
      "HAFNIUM and other actors chained SSRF/RCE flaws; defenders raced to patch while web shells proliferated globally.",
    firstReportedLabel: "March 2, 2021",
    lastUpdatedLabel: "2021 (out-of-band patches)",
    taxonomyTags: ["zero_day", "exchange", "nation_state", "on_prem"],
    modelingDefaults: { downtimeDays: 2, recordsMillions: 0 },
    courtlistenerQuery: "Microsoft Exchange ProxyLogon",
    extras: [
      {
        id: "exch_cisa_ed",
        type: "regulator",
        source: "seed",
        title:
          "CISA — Emergency Directive & Microsoft Exchange vulnerabilities (Mar 2021)",
        url: "https://www.cisa.gov/news-events/alerts/2021/03/03/cisa-issues-emergency-directive-and-alert-microsoft-exchange",
        excerpt:
          "Federal guidance requiring rapid patching of on-premises Exchange in response to active exploitation.",
        teach:
          "Zero-day waves create correlated loss across tenants—temporarily lift loss frequency in sector models.",
      },
      {
        id: "exch_cisa_fbi",
        type: "regulator",
        source: "seed",
        title:
          "CISA-FBI — Joint advisory on compromised Microsoft Exchange Server",
        url: "https://www.cisa.gov/news-events/alerts/2021/03/10/fbi-cisa-joint-advisory-compromise-microsoft-exchange-server",
        excerpt:
          "Technical detail on observed post-exploitation including web shells.",
        teach:
          "Use joint advisories to justify dwell-time and forensics cost assumptions.",
      },
    ],
  },
  {
    id: "inc_rackspace_2022",
    slug: "rackspace-hosted-exchange-2022",
    company: {
      name: "Rackspace Technology, Inc.",
      type: "Public",
      secCik: "0001648146",
      headquartersLabel: "Windcrest, Texas, USA (San Antonio area)",
      hqLat: 29.5152,
      hqLon: -98.3844,
      countryCode: "US",
      sector: "Managed cloud hosting",
      employeeCount: 6600,
      foundedYear: 1998,
      financials: {
        fiscalYearLabel: "FY2022 10-K",
        revenueUSDm: 3100,
        ebitdaUSDm: 450,
      },
    },
    incidentTitle:
      "Hosted Exchange outage — extended customer email disruption",
    incidentTypeLabel: "Business Interruption",
    incidentSummary:
      "Security incident disabled legacy Hosted Exchange; thousands of SMB customers migrated under duress with weeks of downtime.",
    firstReportedLabel: "December 2022",
    lastUpdatedLabel: "Q1 2023 (customer credits / 10-K)",
    taxonomyTags: ["outage", "msp", "email", "smb"],
    modelingDefaults: { downtimeDays: 14, recordsMillions: 0 },
    courtlistenerQuery: "Rackspace Hosted Exchange",
  },
  {
    id: "inc_dish_2023",
    slug: "dish-network-2023",
    company: {
      name: "DISH Network Corporation",
      type: "Public",
      secCik: "0001041039",
      headquartersLabel: "Englewood, Colorado, USA",
      hqLat: 39.6478,
      hqLon: -104.9878,
      countryCode: "US",
      sector: "Satellite TV / wireless",
      employeeCount: 14000,
      foundedYear: 1980,
      financials: {
        fiscalYearLabel: "FY2023 10-K",
        revenueUSDm: 15600,
        ebitdaUSDm: 2800,
      },
    },
    incidentTitle:
      "February 2023 — ransomware impacting call centers & billing",
    incidentTypeLabel: "Cyber Extortion",
    incidentSummary:
      "Customer-facing systems and internal communications degraded; SEC filings discussed material impacts and remediation.",
    firstReportedLabel: "February 2023",
    lastUpdatedLabel: "2023 (8-K / 10-Q)",
    taxonomyTags: ["ransomware", "telecom", "customer_ops"],
    modelingDefaults: { downtimeDays: 7, recordsMillions: 0 },
    courtlistenerQuery: "DISH Network ransomware",
  },
  {
    id: "inc_merck_notpetya_2017",
    slug: "merck-notpetya-2017",
    company: {
      name: "Merck & Co., Inc.",
      type: "Public",
      secCik: "0000310158",
      headquartersLabel: "Kenilworth, New Jersey, USA",
      hqLat: 40.6765,
      hqLon: -74.2943,
      countryCode: "US",
      sector: "Pharmaceuticals",
      employeeCount: 69000,
      foundedYear: 1891,
      financials: {
        fiscalYearLabel: "FY2017 disruption costs (see filings)",
        revenueUSDm: 40100,
        ebitdaUSDm: 12500,
      },
    },
    incidentTitle: "NotPetya — global production & shipment disruption (2017)",
    incidentTypeLabel: "Wiper / Global Malware",
    incidentSummary:
      "Wiper masquerading as ransomware spread via tax software updates; Merck publicly quantified lost sales and remediation across manufacturing.",
    firstReportedLabel: "June 27, 2017",
    lastUpdatedLabel: "2017–2020 (insurance litigation)",
    taxonomyTags: ["notpetya", "wiper", "manufacturing", "insurance"],
    modelingDefaults: { downtimeDays: 30, recordsMillions: 0 },
    courtlistenerQuery: "Merck NotPetya insurance",
    extras: [
      {
        id: "merck_cisa_np",
        type: "regulator",
        source: "seed",
        title: "CISA — NotPetya / global destructive malware context",
        url: "https://www.cisa.gov/news-events/cybersecurity-advisories",
        excerpt:
          "Use advisories archive to anchor nation-state wiper risk in enterprise FAIR narratives.",
        teach:
          "Property/cyber insurance fights are a distinct secondary loss stream—track case law for coverage precedents.",
      },
    ],
  },
  {
    id: "inc_jpmorgan_2014",
    slug: "jpmorgan-2014",
    company: {
      name: "JPMorgan Chase & Co.",
      type: "Public",
      secCik: "0000019617",
      headquartersLabel: "New York, New York, USA",
      hqLat: 40.7557,
      hqLon: -73.9754,
      countryCode: "US",
      sector: "Global systemically important bank",
      employeeCount: 290000,
      foundedYear: 2000,
      financials: {
        fiscalYearLabel: "FY2014 10-K scale",
        revenueUSDm: 95000,
        netIncomeUSDm: 21000,
      },
    },
    incidentTitle:
      "2014 — contact data for ~76M households / 7M small businesses",
    incidentTypeLabel: "Data Exfiltration",
    incidentSummary:
      "DOJ charged co-conspirators; breach accelerated bank info-sharing programs and regulatory expectations for cyber hygiene.",
    firstReportedLabel: "October 2014",
    lastUpdatedLabel: "2015–2016 (criminal cases)",
    taxonomyTags: ["banking", "doj", "pii"],
    modelingDefaults: { downtimeDays: 0, recordsMillions: 83 },
    courtlistenerQuery: "JPMorgan data breach",
    extras: [
      {
        id: "jpm_doj",
        type: "regulator",
        source: "seed",
        title: "DOJ — press releases (search: cyber / bank intrusion)",
        url: "https://www.justice.gov/news",
        excerpt:
          "Criminal indictments provide technical fact patterns for threat intel teams.",
        teach:
          "When DOJ publishes attribution, insurers and regulators may treat controls failures as aggravating.",
      },
    ],
  },
  {
    id: "inc_british_airways_2018",
    slug: "british-airways-2018",
    company: {
      name: "British Airways plc (International Airlines Group)",
      type: "Public",
      secCik: "0001378789",
      headquartersLabel:
        "London, United Kingdom (Harmondsworth / Waterside ops)",
      hqLat: 51.47,
      hqLon: -0.4543,
      countryCode: "GB",
      sector: "International airline",
      employeeCount: 45000,
      foundedYear: 1974,
      financials: {
        fiscalYearLabel: "IAG annual report context",
        revenueUSDm: 16000,
      },
    },
    incidentTitle:
      "Magecart-style web skimming — payment & loyalty data (2018)",
    incidentTypeLabel: "Data Exfiltration",
    incidentSummary:
      "ICO announced intention to fine for GDPR infringements; fine was later reduced on appeal—study regulatory discounting in models.",
    firstReportedLabel: "September 2018",
    lastUpdatedLabel: "2019–2023 (ICO / UK tribunal)",
    taxonomyTags: ["magecart", "gdpr", "payment_card", "aviation"],
    modelingDefaults: { downtimeDays: 0, recordsMillions: 0.5 },
    courtlistenerQuery: "British Airways ICO GDPR",
    extras: [
      {
        id: "ba_edpb",
        type: "regulator",
        source: "seed",
        title: "EDPB — ICO statement on BA intention to fine (2019)",
        url: "https://www.edpb.europa.eu/news/national-news/2019/ico-statement-intention-fine-british-airways-ps18339m-under-gdpr-data_en",
        excerpt:
          "EU-level summary of UK ICO’s original penalty theory under GDPR.",
        teach:
          "GDPR fines are probabilistic—model scenarios for initial notice vs. appealed outcome.",
      },
      {
        id: "ba_bbc",
        type: "news",
        source: "seed",
        title: "BBC News — BA breach reporting (context)",
        url: "https://www.bbc.co.uk/news/business-48905907",
        excerpt:
          "Timeline reporting; pair with ICO decisions for legal accuracy.",
        teach:
          "Wire services help establish public-awareness dates for securities disclosure questions.",
      },
    ],
  },
  {
    id: "inc_maersk_notpetya_2017",
    slug: "maersk-notpetya-2017",
    company: {
      name: "A.P. Møller – Mærsk A/S",
      type: "Public",
      headquartersLabel: "Copenhagen, Denmark",
      hqLat: 55.6761,
      hqLon: 12.5683,
      countryCode: "DK",
      sector: "Container shipping & logistics",
      employeeCount: 100000,
      foundedYear: 1904,
      financials: {
        fiscalYearLabel: "2017 annual report — disclosed incident costs",
        revenueUSDm: 40000,
        ebitdaUSDm: 3500,
      },
    },
    incidentTitle: "NotPetya — global container terminal IT rebuild (2017)",
    incidentTypeLabel: "Wiper / Global Malware",
    incidentSummary:
      "Maursk publicly described reinstallation of tens of thousands of endpoints; case became the canonical BI example for logistics malware.",
    firstReportedLabel: "June 27, 2017",
    lastUpdatedLabel: "2017–2018 (earnings / investor communications)",
    taxonomyTags: ["notpetya", "logistics", "wiper", "business_interruption"],
    modelingDefaults: { downtimeDays: 14, recordsMillions: 0 },
    manualEvidenceOnly: true,
    evidence: [
      {
        id: "maersk_ir",
        type: "news",
        source: "seed",
        title: "Maersk — investor / annual report portal",
        url: "https://investor.maersk.com/",
        excerpt:
          "Official channel for quantified incident impacts and resilience investments.",
        teach:
          "Non-U.S. filers still produce English disclosures—use them like 10-K analogues for materiality.",
      },
      courtlistenerPack("maersk", "Maersk NotPetya"),
      {
        id: "maersk_reuters",
        type: "news",
        source: "seed",
        title: "Reuters — Maersk cyberattack coverage",
        url: "https://www.reuters.com/world/",
        excerpt: "Cross-check dates against issuer statements.",
        teach:
          "Shipping outages have knock-on trade finance impacts—tertiary effects for macro-linked FAIR scenarios.",
      },
    ],
  },
  {
    id: "inc_sony_pictures_2014",
    slug: "sony-pictures-2014",
    company: {
      name: "Sony Group Corporation (Sony Pictures Entertainment context)",
      type: "Public",
      secCik: "0000313838",
      headquartersLabel:
        "Tokyo, Japan (issuer) · incident ops: Culver City, CA",
      hqLat: 35.6762,
      hqLon: 139.6503,
      countryCode: "JP",
      sector: "Entertainment / electronics",
      employeeCount: 108000,
      foundedYear: 1946,
      financials: {
        fiscalYearLabel: "FY2014 Sony consolidated (public)",
        revenueUSDm: 77000,
        ebitdaUSDm: 4200,
      },
    },
    incidentTitle:
      "Destructive wiper / extortion — SPE network compromise (2014)",
    incidentTypeLabel: "Destructive Attack / Extortion",
    incidentSummary:
      "Data destruction and large-scale exfiltration against a major studio; drove executive turnover, insurance battles, and national-security attribution debates.",
    firstReportedLabel: "November 24, 2014",
    lastUpdatedLabel: "2015–2016 (DPRK attribution / civil suits)",
    taxonomyTags: ["wiper", "extortion", "entertainment", "dprk"],
    modelingDefaults: { downtimeDays: 45, recordsMillions: 0 },
    courtlistenerQuery: "Sony Pictures hack",
    extras: [
      {
        id: "sony_fbi",
        type: "regulator",
        source: "seed",
        title: "FBI — cyber investigations & alerts (search)",
        url: "https://www.fbi.gov/investigate/cyber",
        excerpt:
          "Official statements on major nation-state and criminal cyber campaigns.",
        teach:
          "Attribution statements affect sanctions / OFAC exposure—model legal review costs separately.",
      },
    ],
  },
  {
    id: "inc_godaddy_2021",
    slug: "godaddy-2021",
    company: {
      name: "GoDaddy Inc.",
      type: "Public",
      secCik: "0001609715",
      headquartersLabel: "Tempe, Arizona, USA",
      hqLat: 33.4255,
      hqLon: -111.94,
      countryCode: "US",
      sector: "Domain registrar & hosting",
      employeeCount: 9000,
      foundedYear: 1997,
      financials: {
        fiscalYearLabel: "FY2023 10-K",
        revenueUSDm: 4100,
        ebitdaUSDm: 720,
      },
    },
    incidentTitle:
      "Compromised hosting credentials — multi-year access (disclosed 2021)",
    incidentTypeLabel: "Account Compromise",
    incidentSummary:
      "Issuer disclosed unauthorized access to provisioning systems affecting managed WordPress customers; highlighted supply-chain trust in hosting stacks.",
    firstReportedLabel: "November 2021",
    lastUpdatedLabel: "2022 (customer notifications)",
    taxonomyTags: ["hosting", "supply_chain", "wordpress"],
    modelingDefaults: { downtimeDays: 0, recordsMillions: 1.2 },
    courtlistenerQuery: "GoDaddy breach",
  },
  {
    id: "inc_23andme_2023",
    slug: "23andme-2023",
    company: {
      name: "23andMe Holding Co.",
      type: "Public",
      secCik: "0001804591",
      headquartersLabel: "South San Francisco, California, USA",
      hqLat: 37.6547,
      hqLon: -122.4077,
      countryCode: "US",
      sector: "Consumer genomics",
      employeeCount: 600,
      foundedYear: 2006,
      financials: {
        fiscalYearLabel: "FY2024 10-K (scale)",
        revenueUSDm: 240,
        ebitdaUSDm: -120,
      },
    },
    incidentTitle: "Credential stuffing — DNA Relatives data exposure (2023)",
    incidentTypeLabel: "Data Exfiltration",
    incidentSummary:
      "Threat actors recycled leaked passwords; company filings discussed scope of profile data tied to the DNA Relatives feature.",
    firstReportedLabel: "October 2023",
    lastUpdatedLabel: "2023–2024 (regulatory scrutiny)",
    taxonomyTags: ["credential_stuffing", "genetics", "privacy"],
    modelingDefaults: { downtimeDays: 0, recordsMillions: 7 },
    courtlistenerQuery: "23andMe data breach",
  },
  {
    id: "inc_lastpass_2022",
    slug: "lastpass-2022",
    manualEvidenceOnly: true,
    company: {
      name: "LastPass (GoTo / LogMeIn portfolio)",
      type: "Private",
      headquartersLabel: "Fairfax, Virginia, USA",
      hqLat: 38.8462,
      hqLon: -77.3064,
      countryCode: "US",
      sector: "Password management SaaS",
      financials: { fiscalYearLabel: "Private — no SEC issuer" },
    },
    incidentTitle: "Vault backup theft — iterative disclosures (2022–2023)",
    incidentTypeLabel: "Data Exfiltration",
    incidentSummary:
      "Customer vault backups and partial secrets were exfiltrated; vendor post-mortems described architecture risks for master-password-derived keys.",
    firstReportedLabel: "December 2022",
    lastUpdatedLabel: "2023 (security bulletins)",
    taxonomyTags: ["password_manager", "crypto", "saas"],
    modelingDefaults: { downtimeDays: 0, recordsMillions: 0 },
    evidence: [
      {
        id: "lp_blog",
        type: "news",
        source: "seed",
        title: "LastPass — official security incident notices (blog)",
        url: "https://blog.lastpass.com/",
        excerpt:
          "Vendor primary-source narrative; compare each revision for scope changes.",
        teach:
          "Iterative breach notices create disclosure lag risk—model legal and churn effects across quarters.",
      },
      courtlistenerPack("lastpass", "LastPass breach"),
      {
        id: "lp_cisa_zero",
        type: "regulator",
        source: "seed",
        title: "CISA — credential hygiene guidance (context)",
        url: "https://www.cisa.gov/secure-our-world/use-strong-passwords",
        excerpt:
          "Federal consumer guidance supporting post-incident awareness campaigns.",
        teach:
          "Password-manager breaches shift baseline threat models for enterprises relying on BYO vaults.",
      },
    ],
  },
];
