import type { CatalogSeed } from "../evidenceKit";

/**
 * Sixteen independent major-event teaching additions curated October 31, 2026.
 * These are NOT a purported ranking or subset-membership list for Cyentia's
 * unpublished underlying IRIS Xtreme 2026 individual-case dataset.
 * Sources below are incident-specific primary issuer/regulator publications.
 */
export const XTREME_CONTEXT_CATALOG_SEEDS: CatalogSeed[] = [
  {
    id: "inc_jaguar_land_rover_2025",
    slug: "jaguar-land-rover-2025",
    manualEvidenceOnly: true,
    company: {
      name: "Jaguar Land Rover Automotive plc",
      type: "Subsidiary",
      headquartersLabel: "Gaydon, Warwickshire, United Kingdom",
      hqLat: 52.19,
      hqLon: -1.47,
      countryCode: "GB",
      sector: "Automotive manufacturing",
      financials: {
        fiscalYearLabel:
          "Not verified for this case — obtain as-of filings before dollar-model calibration",
      },
    },
    incidentTitle: "2025 — production and supply-chain shutdown",
    incidentTypeLabel: "Business Interruption",
    incidentSummary:
      "JLR stopped systems and production after a cyber incident; the organization and UK government documented downstream supplier impacts.",
    firstReportedLabel: "2025-09",
    lastUpdatedLabel: "Source checked October 2026",
    taxonomyTags: [
      "outage",
      "supply_chain",
      "business_interruption",
      "manufacturing",
    ],
    limitations: [
      "Independently curated for learning. Cyentia has not identified this row as a member of its 136-event research sample.",
      "No benchmark or published global loss is automatically assigned to this individual case's model.",
      "Do not treat unavailable organization-specific financials or incident records as confirmed zero; provide evidence before modeling.",
    ],
    governance: {
      lastVerified: "2026-10-31",
      notes:
        "Independent public-source case; IRIS Xtreme 2026 is comparative population context only, not the case's supporting source.",
    },
    evidence: [
      {
        id: "inc_jaguar_land_rover_2025_primary",
        type: "issuer",
        source: "seed",
        title: "JLR — statement on cyber incident",
        url: "https://media.jlr.com/corporate/news/2025/09/statement-cyber-incident",
        excerpt:
          "JLR confirmed a precautionary systems shutdown and disruptions to production and retail operations.",
        teach:
          "Do not equate lost gross sales, cash-flow pressure and retained loss. Trace supplier impacts separately.",
        retrievedAt: "2026-10-31",
        trustTier: "issuer_primary",
        linkRole: "deep_link",
      },
    ],
    securityLesson: {
      caseAnalysis:
        "Do not equate lost gross sales, cash-flow pressure and retained loss. Trace supplier impacts separately.",
      identification: [
        "Locate the exact first-party disclosure and its publication date; compare subsequent updates before relying on a loss number.",
      ],
      prevention: [
        "Name the specific access or dependency control relevant to this event and how its effectiveness would be demonstrated.",
      ],
      mitigationPriority: [
        "Separate observed loss or disruption from estimated exposure and model only the entity whose financial boundary is defined.",
      ],
    },
  },
  {
    id: "inc_marks_spencer_2025",
    slug: "marks-spencer-2025",
    manualEvidenceOnly: true,
    company: {
      name: "Marks and Spencer Group plc",
      type: "Public",
      headquartersLabel: "London, England, United Kingdom",
      hqLat: 51.518,
      hqLon: -0.15,
      countryCode: "GB",
      sector: "Retail",
      financials: {
        fiscalYearLabel:
          "Not verified for this case — obtain as-of filings before dollar-model calibration",
      },
    },
    incidentTitle: "2025 — retail online trading and operational disruption",
    incidentTypeLabel: "Business Interruption",
    incidentSummary:
      "Cyber incident interrupted online trading and supply operations; the issuer projected around £300 million of 2025/26 operating-profit impact before mitigations.",
    firstReportedLabel: "2025-04",
    lastUpdatedLabel: "Source checked October 2026",
    taxonomyTags: ["retail", "outage", "business_interruption", "recovery"],
    limitations: [
      "Independently curated for learning. Cyentia has not identified this row as a member of its 136-event research sample.",
      "No benchmark or published global loss is automatically assigned to this individual case's model.",
      "Do not treat unavailable organization-specific financials or incident records as confirmed zero; provide evidence before modeling.",
    ],
    governance: {
      lastVerified: "2026-10-31",
      notes:
        "Independent public-source case; IRIS Xtreme 2026 is comparative population context only, not the case's supporting source.",
    },
    evidence: [
      {
        id: "inc_marks_spencer_2025_primary",
        type: "issuer",
        source: "seed",
        title: "Marks & Spencer — FY2025 results and cyber guidance",
        url: "https://corporate.marksandspencer.com/newsroom/press-releases/full-year-results-52-weeks-ended-29-march-2025",
        excerpt:
          "The issuer projected an approximately £300m impact to operating profit before cost mitigation, insurance and trading actions.",
        teach:
          "Differentiate a prospective profit impact from incurred cost and revenue. Do not double-count later recoveries.",
        retrievedAt: "2026-10-31",
        trustTier: "issuer_primary",
        linkRole: "deep_link",
      },
    ],
    securityLesson: {
      caseAnalysis:
        "Differentiate a prospective profit impact from incurred cost and revenue. Do not double-count later recoveries.",
      identification: [
        "Locate the exact first-party disclosure and its publication date; compare subsequent updates before relying on a loss number.",
      ],
      prevention: [
        "Name the specific access or dependency control relevant to this event and how its effectiveness would be demonstrated.",
      ],
      mitigationPriority: [
        "Separate observed loss or disruption from estimated exposure and model only the entity whose financial boundary is defined.",
      ],
    },
  },
  {
    id: "inc_coop_group_2025",
    slug: "coop-group-2025",
    manualEvidenceOnly: true,
    company: {
      name: "Co-operative Group Limited",
      type: "Private",
      headquartersLabel: "Manchester, England, United Kingdom",
      hqLat: 53.481,
      hqLon: -2.243,
      countryCode: "GB",
      sector: "Retail / wholesale",
      financials: {
        fiscalYearLabel:
          "Not verified for this case — obtain as-of filings before dollar-model calibration",
      },
    },
    incidentTitle: "2025 — retail and logistics cyber disruption",
    incidentTypeLabel: "Business Interruption",
    incidentSummary:
      "Co-op reported a major cyber incident with system restrictions and later reported separate effects on sales and profitability.",
    firstReportedLabel: "2025-04",
    lastUpdatedLabel: "Source checked October 2026",
    taxonomyTags: ["retail", "outage", "business_interruption", "supply_chain"],
    limitations: [
      "Independently curated for learning. Cyentia has not identified this row as a member of its 136-event research sample.",
      "No benchmark or published global loss is automatically assigned to this individual case's model.",
      "Do not treat unavailable organization-specific financials or incident records as confirmed zero; provide evidence before modeling.",
    ],
    governance: {
      lastVerified: "2026-10-31",
      notes:
        "Independent public-source case; IRIS Xtreme 2026 is comparative population context only, not the case's supporting source.",
    },
    evidence: [
      {
        id: "inc_coop_group_2025_primary",
        type: "issuer",
        source: "seed",
        title: "Co-op — 2025 annual results",
        url: "https://www.co-operative.coop/annual-results",
        excerpt:
          "Co-op reported estimated effects of the attack on sales and on operating profitability separately.",
        teach:
          "Sales disruption is not the same as net economic loss; model the contribution margin and time window.",
        retrievedAt: "2026-10-31",
        trustTier: "issuer_primary",
        linkRole: "deep_link",
      },
    ],
    securityLesson: {
      caseAnalysis:
        "Sales disruption is not the same as net economic loss; model the contribution margin and time window.",
      identification: [
        "Locate the exact first-party disclosure and its publication date; compare subsequent updates before relying on a loss number.",
      ],
      prevention: [
        "Name the specific access or dependency control relevant to this event and how its effectiveness would be demonstrated.",
      ],
      mitigationPriority: [
        "Separate observed loss or disruption from estimated exposure and model only the entity whose financial boundary is defined.",
      ],
    },
  },
  {
    id: "inc_coinbase_2025",
    slug: "coinbase-2025",
    manualEvidenceOnly: true,
    company: {
      name: "Coinbase Global, Inc.",
      type: "Public",
      headquartersLabel: "New York, New York, USA (office reference)",
      hqLat: 40.713,
      hqLon: -74.006,
      countryCode: "US",
      sector: "Digital assets / exchange",
      financials: {
        fiscalYearLabel:
          "Not verified for this case — obtain as-of filings before dollar-model calibration",
      },
    },
    incidentTitle: "2025 — compromised outsourced support access and extortion",
    incidentTypeLabel: "Data Exfiltration",
    incidentSummary:
      "Coinbase reported contractors or support personnel being paid to misuse legitimate access, followed by extortion and fraud-remediation exposure.",
    firstReportedLabel: "2025-05",
    lastUpdatedLabel: "Source checked October 2026",
    taxonomyTags: [
      "credentials",
      "insider",
      "third_party",
      "data_exfiltration",
      "extortion",
    ],
    limitations: [
      "Independently curated for learning. Cyentia has not identified this row as a member of its 136-event research sample.",
      "No benchmark or published global loss is automatically assigned to this individual case's model.",
      "Do not treat unavailable organization-specific financials or incident records as confirmed zero; provide evidence before modeling.",
    ],
    governance: {
      lastVerified: "2026-10-31",
      notes:
        "Independent public-source case; IRIS Xtreme 2026 is comparative population context only, not the case's supporting source.",
    },
    evidence: [
      {
        id: "inc_coinbase_2025_primary",
        type: "sec_other",
        source: "seed",
        title: "Coinbase — May 2025 Item 1.05 disclosure",
        url: "https://www.sec.gov/Archives/edgar/data/1679788/000167978825000094/coin-20250514.htm",
        excerpt:
          "Company filing traces misuse of support access and customer information, with extortion-related demands.",
        teach:
          "Differentiate extortion demand, actual payments, customer reimbursements and preventive investments.",
        retrievedAt: "2026-10-31",
        trustTier: "issuer_primary",
        linkRole: "deep_link",
      },
    ],
    securityLesson: {
      caseAnalysis:
        "Differentiate extortion demand, actual payments, customer reimbursements and preventive investments.",
      identification: [
        "Locate the exact first-party disclosure and its publication date; compare subsequent updates before relying on a loss number.",
      ],
      prevention: [
        "Name the specific access or dependency control relevant to this event and how its effectiveness would be demonstrated.",
      ],
      mitigationPriority: [
        "Separate observed loss or disruption from estimated exposure and model only the entity whose financial boundary is defined.",
      ],
    },
  },
  {
    id: "inc_bybit_2025",
    slug: "bybit-2025",
    manualEvidenceOnly: true,
    company: {
      name: "Bybit exchange",
      type: "Private",
      headquartersLabel: "Dubai, United Arab Emirates",
      hqLat: 25.205,
      hqLon: 55.27,
      countryCode: "AE",
      sector: "Cryptocurrency exchange",
      financials: {
        fiscalYearLabel:
          "Not verified for this case — obtain as-of filings before dollar-model calibration",
      },
    },
    incidentTitle: "2025 — $1.5B virtual-asset theft",
    incidentTypeLabel: "Financial Theft",
    incidentSummary:
      "The FBI attributed approximately $1.5 billion in virtual-asset theft from Bybit to DPRK-linked TraderTraitor activity.",
    firstReportedLabel: "2025-02",
    lastUpdatedLabel: "Source checked October 2026",
    taxonomyTags: [
      "financial_theft",
      "crypto",
      "trusted_relationship",
      "supply_chain",
    ],
    limitations: [
      "Independently curated for learning. Cyentia has not identified this row as a member of its 136-event research sample.",
      "No benchmark or published global loss is automatically assigned to this individual case's model.",
      "Do not treat unavailable organization-specific financials or incident records as confirmed zero; provide evidence before modeling.",
    ],
    governance: {
      lastVerified: "2026-10-31",
      notes:
        "Independent public-source case; IRIS Xtreme 2026 is comparative population context only, not the case's supporting source.",
    },
    evidence: [
      {
        id: "inc_bybit_2025_primary",
        type: "issuer",
        source: "seed",
        title: "FBI — Bybit $1.5B theft attribution",
        url: "https://www.fbi.gov/investigate/cyber/alerts/2025/north-korea-responsible-for-1-5-billion-bybit-hack",
        excerpt:
          "FBI identified the incident date, theft magnitude and attribution in a public service announcement.",
        teach:
          "Directly stolen asset value is not business interruption, a privacy record cost, or necessarily the company's ultimate retained loss.",
        retrievedAt: "2026-10-31",
        trustTier: "regulator_primary",
        linkRole: "deep_link",
      },
    ],
    securityLesson: {
      caseAnalysis:
        "Directly stolen asset value is not business interruption, a privacy record cost, or necessarily the company's ultimate retained loss.",
      identification: [
        "Locate the exact first-party disclosure and its publication date; compare subsequent updates before relying on a loss number.",
      ],
      prevention: [
        "Name the specific access or dependency control relevant to this event and how its effectiveness would be demonstrated.",
      ],
      mitigationPriority: [
        "Separate observed loss or disruption from estimated exposure and model only the entity whose financial boundary is defined.",
      ],
    },
  },
  {
    id: "inc_synnovis_2024",
    slug: "synnovis-2024",
    manualEvidenceOnly: true,
    company: {
      name: "Synnovis LLP",
      type: "Private",
      headquartersLabel: "London, England, United Kingdom",
      hqLat: 51.5,
      hqLon: -0.11,
      countryCode: "GB",
      sector: "Clinical pathology",
      financials: {
        fiscalYearLabel:
          "Not verified for this case — obtain as-of filings before dollar-model calibration",
      },
    },
    incidentTitle: "2024 — NHS pathology service dependency outage",
    incidentTypeLabel: "Business Interruption",
    incidentSummary:
      "A ransomware attack disrupted NHS-connected pathology services and delayed thousands of patient appointments and procedures.",
    firstReportedLabel: "2024-06",
    lastUpdatedLabel: "Source checked October 2026",
    taxonomyTags: ["healthcare", "ransomware", "supply_chain", "outage"],
    limitations: [
      "Independently curated for learning. Cyentia has not identified this row as a member of its 136-event research sample.",
      "No benchmark or published global loss is automatically assigned to this individual case's model.",
      "Do not treat unavailable organization-specific financials or incident records as confirmed zero; provide evidence before modeling.",
    ],
    governance: {
      lastVerified: "2026-10-31",
      notes:
        "Independent public-source case; IRIS Xtreme 2026 is comparative population context only, not the case's supporting source.",
    },
    evidence: [
      {
        id: "inc_synnovis_2024_primary",
        type: "regulator",
        source: "seed",
        title: "NHS England — Synnovis incident record",
        url: "https://www.england.nhs.uk/synnovis-cyber-incident/",
        excerpt:
          "NHS England documented service impacts, displaced appointments and continuing recovery.",
        teach:
          "Clinical harm and partner disruption are not automatically booked expenses of Synnovis; define the loss-bearing entity.",
        retrievedAt: "2026-10-31",
        trustTier: "regulator_primary",
        linkRole: "deep_link",
      },
    ],
    securityLesson: {
      caseAnalysis:
        "Clinical harm and partner disruption are not automatically booked expenses of Synnovis; define the loss-bearing entity.",
      identification: [
        "Locate the exact first-party disclosure and its publication date; compare subsequent updates before relying on a loss number.",
      ],
      prevention: [
        "Name the specific access or dependency control relevant to this event and how its effectiveness would be demonstrated.",
      ],
      mitigationPriority: [
        "Separate observed loss or disruption from estimated exposure and model only the entity whose financial boundary is defined.",
      ],
    },
  },
  {
    id: "inc_ascension_2024",
    slug: "ascension-2024",
    manualEvidenceOnly: true,
    company: {
      name: "Ascension",
      type: "Non-profit",
      headquartersLabel: "St. Louis, Missouri, USA",
      hqLat: 38.627,
      hqLon: -90.2,
      countryCode: "US",
      sector: "Healthcare",
      financials: {
        fiscalYearLabel:
          "Not verified for this case — obtain as-of filings before dollar-model calibration",
      },
    },
    incidentTitle: "2024 — hospital clinical-network interruption",
    incidentTypeLabel: "Business Interruption",
    incidentSummary:
      "Ascension detected a cybersecurity event and interrupted selected technology services while activating continuity procedures for care delivery.",
    firstReportedLabel: "2024-05",
    lastUpdatedLabel: "Source checked October 2026",
    taxonomyTags: [
      "healthcare",
      "outage",
      "business_interruption",
      "ransomware",
    ],
    limitations: [
      "Independently curated for learning. Cyentia has not identified this row as a member of its 136-event research sample.",
      "No benchmark or published global loss is automatically assigned to this individual case's model.",
      "Do not treat unavailable organization-specific financials or incident records as confirmed zero; provide evidence before modeling.",
    ],
    governance: {
      lastVerified: "2026-10-31",
      notes:
        "Independent public-source case; IRIS Xtreme 2026 is comparative population context only, not the case's supporting source.",
    },
    evidence: [
      {
        id: "inc_ascension_2024_primary",
        type: "regulator",
        source: "seed",
        title: "Ascension — May 2024 network interruption",
        url: "https://about.ascension.org/en/news/2024/05/network-interruption",
        excerpt:
          "Ascension's public statement describes system interruptions and patient-care continuity measures.",
        teach:
          "Separate observed service interruptions from assumed ransomware details and quantified downstream patient harm.",
        retrievedAt: "2026-10-31",
        trustTier: "issuer_primary",
        linkRole: "deep_link",
      },
    ],
    securityLesson: {
      caseAnalysis:
        "Separate observed service interruptions from assumed ransomware details and quantified downstream patient harm.",
      identification: [
        "Locate the exact first-party disclosure and its publication date; compare subsequent updates before relying on a loss number.",
      ],
      prevention: [
        "Name the specific access or dependency control relevant to this event and how its effectiveness would be demonstrated.",
      ],
      mitigationPriority: [
        "Separate observed loss or disruption from estimated exposure and model only the entity whose financial boundary is defined.",
      ],
    },
  },
  {
    id: "inc_dmm_bitcoin_2024",
    slug: "dmm-bitcoin-2024",
    manualEvidenceOnly: true,
    company: {
      name: "DMM Bitcoin Co., Ltd.",
      type: "Private",
      headquartersLabel: "Tokyo, Japan",
      hqLat: 35.676,
      hqLon: 139.65,
      countryCode: "JP",
      sector: "Cryptocurrency exchange",
      financials: {
        fiscalYearLabel:
          "Not verified for this case — obtain as-of filings before dollar-model calibration",
      },
    },
    incidentTitle: "2024 — $308M bitcoin theft through trusted access",
    incidentTypeLabel: "Financial Theft",
    incidentSummary:
      "The FBI and Japan's National Police Agency described compromise of a related wallet provider and transaction manipulation causing a 4,502.9 BTC theft.",
    firstReportedLabel: "2024-05",
    lastUpdatedLabel: "Source checked October 2026",
    taxonomyTags: ["financial_theft", "crypto", "credentials", "third_party"],
    limitations: [
      "Independently curated for learning. Cyentia has not identified this row as a member of its 136-event research sample.",
      "No benchmark or published global loss is automatically assigned to this individual case's model.",
      "Do not treat unavailable organization-specific financials or incident records as confirmed zero; provide evidence before modeling.",
    ],
    governance: {
      lastVerified: "2026-10-31",
      notes:
        "Independent public-source case; IRIS Xtreme 2026 is comparative population context only, not the case's supporting source.",
    },
    evidence: [
      {
        id: "inc_dmm_bitcoin_2024_primary",
        type: "issuer",
        source: "seed",
        title: "FBI / Japan NPA — DMM Bitcoin $308M attribution",
        url: "https://www.fbi.gov/news/press-releases/fbi-dc3-and-npa-identification-of-north-korean-cyber-actors-tracked-as-tradertraitor-responsible-for-theft-of-308-million-from-bitcoindmmcom",
        excerpt:
          "Law-enforcement statement documents the employee impersonation and substituted transaction.",
        teach:
          "Do not confuse stolen asset face value, reimbursement to customers and risk-transfer effects.",
        retrievedAt: "2026-10-31",
        trustTier: "regulator_primary",
        linkRole: "deep_link",
      },
    ],
    securityLesson: {
      caseAnalysis:
        "Do not confuse stolen asset face value, reimbursement to customers and risk-transfer effects.",
      identification: [
        "Locate the exact first-party disclosure and its publication date; compare subsequent updates before relying on a loss number.",
      ],
      prevention: [
        "Name the specific access or dependency control relevant to this event and how its effectiveness would be demonstrated.",
      ],
      mitigationPriority: [
        "Separate observed loss or disruption from estimated exposure and model only the entity whose financial boundary is defined.",
      ],
    },
  },
  {
    id: "inc_wazirx_2024",
    slug: "wazirx-2024",
    manualEvidenceOnly: true,
    company: {
      name: "WazirX",
      type: "Private",
      headquartersLabel: "Mumbai, Maharashtra, India",
      hqLat: 19.076,
      hqLon: 72.878,
      countryCode: "IN",
      sector: "Cryptocurrency exchange",
      financials: {
        fiscalYearLabel:
          "Not verified for this case — obtain as-of filings before dollar-model calibration",
      },
    },
    incidentTitle: "2024 — multisignature custody wallet theft",
    incidentTypeLabel: "Financial Theft",
    incidentSummary:
      "WazirX reported theft of more than $230 million from a multisignature wallet managed using third-party custody infrastructure.",
    firstReportedLabel: "2024-07",
    lastUpdatedLabel: "Source checked October 2026",
    taxonomyTags: ["financial_theft", "crypto", "third_party", "supply_chain"],
    limitations: [
      "Independently curated for learning. Cyentia has not identified this row as a member of its 136-event research sample.",
      "No benchmark or published global loss is automatically assigned to this individual case's model.",
      "Do not treat unavailable organization-specific financials or incident records as confirmed zero; provide evidence before modeling.",
    ],
    governance: {
      lastVerified: "2026-10-31",
      notes:
        "Independent public-source case; IRIS Xtreme 2026 is comparative population context only, not the case's supporting source.",
    },
    evidence: [
      {
        id: "inc_wazirx_2024_primary",
        type: "regulator",
        source: "seed",
        title: "WazirX — incident disclosure",
        url: "https://wazirx.com/blog/important-update-cyber-attack-incident-and-measures-to-protect-your-assets/",
        excerpt:
          "The exchange publicly documented the incident and reported a loss of digital assets exceeding $230m.",
        teach:
          "Compare issuer narrative with outside-party forensic evidence; distinguish alleged mechanism from confirmed facts.",
        retrievedAt: "2026-10-31",
        trustTier: "issuer_primary",
        linkRole: "deep_link",
      },
    ],
    securityLesson: {
      caseAnalysis:
        "Compare issuer narrative with outside-party forensic evidence; distinguish alleged mechanism from confirmed facts.",
      identification: [
        "Locate the exact first-party disclosure and its publication date; compare subsequent updates before relying on a loss number.",
      ],
      prevention: [
        "Name the specific access or dependency control relevant to this event and how its effectiveness would be demonstrated.",
      ],
      mitigationPriority: [
        "Separate observed loss or disruption from estimated exposure and model only the entity whose financial boundary is defined.",
      ],
    },
  },
  {
    id: "inc_att_cloud_2024",
    slug: "att-cloud-2024",
    manualEvidenceOnly: true,
    company: {
      name: "AT&T Inc.",
      type: "Public",
      headquartersLabel: "Dallas, Texas, USA",
      hqLat: 32.777,
      hqLon: -96.798,
      countryCode: "US",
      sector: "Telecommunications",
      financials: {
        fiscalYearLabel:
          "Not verified for this case — obtain as-of filings before dollar-model calibration",
      },
    },
    incidentTitle: "2024 — third-party cloud call-record exfiltration",
    incidentTypeLabel: "Data Exfiltration",
    incidentSummary:
      "AT&T reported unauthorized extraction of customer call/text interaction records from a third-party cloud environment.",
    firstReportedLabel: "2024-04",
    lastUpdatedLabel: "Source checked October 2026",
    taxonomyTags: ["data_exfiltration", "cloud", "third_party", "privacy"],
    limitations: [
      "Independently curated for learning. Cyentia has not identified this row as a member of its 136-event research sample.",
      "No benchmark or published global loss is automatically assigned to this individual case's model.",
      "Do not treat unavailable organization-specific financials or incident records as confirmed zero; provide evidence before modeling.",
    ],
    governance: {
      lastVerified: "2026-10-31",
      notes:
        "Independent public-source case; IRIS Xtreme 2026 is comparative population context only, not the case's supporting source.",
    },
    evidence: [
      {
        id: "inc_att_cloud_2024_primary",
        type: "sec_other",
        source: "seed",
        title: "AT&T — July 2024 Item 1.05 filing",
        url: "https://www.sec.gov/Archives/edgar/data/732717/000073271724000046/t-20240506.htm",
        excerpt:
          "Issuer's 8-K details the third-party workspace and the categories of call/text interaction records.",
        teach:
          "Record counts show scope; they cannot reliably convert to total financial loss using a single cost-per-record multiplier.",
        retrievedAt: "2026-10-31",
        trustTier: "issuer_primary",
        linkRole: "deep_link",
      },
    ],
    securityLesson: {
      caseAnalysis:
        "Record counts show scope; they cannot reliably convert to total financial loss using a single cost-per-record multiplier.",
      identification: [
        "Locate the exact first-party disclosure and its publication date; compare subsequent updates before relying on a loss number.",
      ],
      prevention: [
        "Name the specific access or dependency control relevant to this event and how its effectiveness would be demonstrated.",
      ],
      mitigationPriority: [
        "Separate observed loss or disruption from estimated exposure and model only the entity whose financial boundary is defined.",
      ],
    },
  },
  {
    id: "inc_clorox_2023",
    slug: "clorox-2023",
    manualEvidenceOnly: true,
    company: {
      name: "The Clorox Company",
      type: "Public",
      headquartersLabel: "Oakland, California, USA",
      hqLat: 37.804,
      hqLon: -122.271,
      countryCode: "US",
      sector: "Consumer goods / manufacturing",
      financials: {
        fiscalYearLabel:
          "Not verified for this case — obtain as-of filings before dollar-model calibration",
      },
    },
    incidentTitle: "2023 — order-processing and manufacturing disruption",
    incidentTypeLabel: "Business Interruption",
    incidentSummary:
      "Clorox described order-processing delays and product outages after a cyberattack, together with net incremental expenses and insurance recoveries.",
    firstReportedLabel: "2023-08",
    lastUpdatedLabel: "Source checked October 2026",
    taxonomyTags: [
      "manufacturing",
      "outage",
      "business_interruption",
      "insurance",
    ],
    limitations: [
      "Independently curated for learning. Cyentia has not identified this row as a member of its 136-event research sample.",
      "No benchmark or published global loss is automatically assigned to this individual case's model.",
      "Do not treat unavailable organization-specific financials or incident records as confirmed zero; provide evidence before modeling.",
    ],
    governance: {
      lastVerified: "2026-10-31",
      notes:
        "Independent public-source case; IRIS Xtreme 2026 is comparative population context only, not the case's supporting source.",
    },
    evidence: [
      {
        id: "inc_clorox_2023_primary",
        type: "sec_other",
        source: "seed",
        title: "Clorox — issuer filing on August 2023 cyberattack",
        url: "https://www.sec.gov/Archives/edgar/data/21076/000155278124000563/e24323_clx-def14a.htm",
        excerpt:
          "Filing distinguishes lost sales, replacement inventory timing and incremental expenses net of insurance.",
        teach:
          "Don't add foregone sales directly to insured response expenses; examine the displaced/recovered sales window.",
        retrievedAt: "2026-10-31",
        trustTier: "issuer_primary",
        linkRole: "deep_link",
      },
    ],
    securityLesson: {
      caseAnalysis:
        "Don't add foregone sales directly to insured response expenses; examine the displaced/recovered sales window.",
      identification: [
        "Locate the exact first-party disclosure and its publication date; compare subsequent updates before relying on a loss number.",
      ],
      prevention: [
        "Name the specific access or dependency control relevant to this event and how its effectiveness would be demonstrated.",
      ],
      mitigationPriority: [
        "Separate observed loss or disruption from estimated exposure and model only the entity whose financial boundary is defined.",
      ],
    },
  },
  {
    id: "inc_johnson_controls_2023",
    slug: "johnson-controls-2023",
    manualEvidenceOnly: true,
    company: {
      name: "Johnson Controls International plc",
      type: "Public",
      headquartersLabel: "Cork, Ireland",
      hqLat: 51.898,
      hqLon: -8.475,
      countryCode: "IE",
      sector: "Building systems / industrial technology",
      financials: {
        fiscalYearLabel:
          "Not verified for this case — obtain as-of filings before dollar-model calibration",
      },
    },
    incidentTitle: "2023 — enterprise IT and building systems disruption",
    incidentTypeLabel: "Business Interruption",
    incidentSummary:
      "Johnson Controls disclosed a cybersecurity incident affecting internal infrastructure and applications and activated business-continuity and remediation plans.",
    firstReportedLabel: "2023-09",
    lastUpdatedLabel: "Source checked October 2026",
    taxonomyTags: [
      "manufacturing",
      "outage",
      "business_interruption",
      "data_exfiltration",
    ],
    limitations: [
      "Independently curated for learning. Cyentia has not identified this row as a member of its 136-event research sample.",
      "No benchmark or published global loss is automatically assigned to this individual case's model.",
      "Do not treat unavailable organization-specific financials or incident records as confirmed zero; provide evidence before modeling.",
    ],
    governance: {
      lastVerified: "2026-10-31",
      notes:
        "Independent public-source case; IRIS Xtreme 2026 is comparative population context only, not the case's supporting source.",
    },
    evidence: [
      {
        id: "inc_johnson_controls_2023_primary",
        type: "sec_other",
        source: "seed",
        title: "Johnson Controls — September 2023 SEC filing",
        url: "https://www.sec.gov/Archives/edgar/data/833444/000083344423000036/jci-20230927.htm",
        excerpt:
          "Issuer acknowledged affected IT systems and a continuing investigation, with impact not yet fully known.",
        teach:
          "An early filing isn't an exhaustive loss accounting; compare subsequent disclosure as more evidence emerged.",
        retrievedAt: "2026-10-31",
        trustTier: "issuer_primary",
        linkRole: "deep_link",
      },
    ],
    securityLesson: {
      caseAnalysis:
        "An early filing isn't an exhaustive loss accounting; compare subsequent disclosure as more evidence emerged.",
      identification: [
        "Locate the exact first-party disclosure and its publication date; compare subsequent updates before relying on a loss number.",
      ],
      prevention: [
        "Name the specific access or dependency control relevant to this event and how its effectiveness would be demonstrated.",
      ],
      mitigationPriority: [
        "Separate observed loss or disruption from estimated exposure and model only the entity whose financial boundary is defined.",
      ],
    },
  },
  {
    id: "inc_caesars_2023",
    slug: "caesars-2023",
    manualEvidenceOnly: true,
    company: {
      name: "Caesars Entertainment, Inc.",
      type: "Public",
      headquartersLabel: "Reno, Nevada, USA",
      hqLat: 39.529,
      hqLon: -119.814,
      countryCode: "US",
      sector: "Hospitality / gaming",
      financials: {
        fiscalYearLabel:
          "Not verified for this case — obtain as-of filings before dollar-model calibration",
      },
    },
    incidentTitle: "2023 — outsourced IT support social engineering",
    incidentTypeLabel: "Data Exfiltration",
    incidentSummary:
      "Caesars disclosed social engineering against an outsourced IT support vendor and theft of loyalty-program information; customer-facing operations were not disrupted.",
    firstReportedLabel: "2023-09",
    lastUpdatedLabel: "Source checked October 2026",
    taxonomyTags: [
      "credentials",
      "social_engineering",
      "third_party",
      "data_exfiltration",
    ],
    limitations: [
      "Independently curated for learning. Cyentia has not identified this row as a member of its 136-event research sample.",
      "No benchmark or published global loss is automatically assigned to this individual case's model.",
      "Do not treat unavailable organization-specific financials or incident records as confirmed zero; provide evidence before modeling.",
    ],
    governance: {
      lastVerified: "2026-10-31",
      notes:
        "Independent public-source case; IRIS Xtreme 2026 is comparative population context only, not the case's supporting source.",
    },
    evidence: [
      {
        id: "inc_caesars_2023_primary",
        type: "sec_other",
        source: "seed",
        title: "Caesars — September 2023 Form 8-K",
        url: "https://www.sec.gov/Archives/edgar/data/1590895/000119312523235015/d537840d8k.htm",
        excerpt:
          "Issuer distinguishes third-party support access and data theft from an absence of customer-facing outages.",
        teach:
          "Compare with MGM: similar social engineering narratives can have very different operational loss pathways.",
        retrievedAt: "2026-10-31",
        trustTier: "issuer_primary",
        linkRole: "deep_link",
      },
    ],
    securityLesson: {
      caseAnalysis:
        "Compare with MGM: similar social engineering narratives can have very different operational loss pathways.",
      identification: [
        "Locate the exact first-party disclosure and its publication date; compare subsequent updates before relying on a loss number.",
      ],
      prevention: [
        "Name the specific access or dependency control relevant to this event and how its effectiveness would be demonstrated.",
      ],
      mitigationPriority: [
        "Separate observed loss or disruption from estimated exposure and model only the entity whose financial boundary is defined.",
      ],
    },
  },
  {
    id: "inc_icbc_financial_2023",
    slug: "icbc-financial-2023",
    manualEvidenceOnly: true,
    company: {
      name: "ICBC Financial Services LLC",
      type: "Subsidiary",
      headquartersLabel: "New York, New York, USA",
      hqLat: 40.713,
      hqLon: -74.006,
      countryCode: "US",
      sector: "Financial services / clearing",
      financials: {
        fiscalYearLabel:
          "Not verified for this case — obtain as-of filings before dollar-model calibration",
      },
    },
    incidentTitle: "2023 — ransomware disrupts securities processing records",
    incidentTypeLabel: "Business Interruption",
    incidentSummary:
      "A ransomware incident disrupted ICBC Financial Services' access to and maintenance of books and records; the SEC later censured the firm without financial penalty.",
    firstReportedLabel: "2023-11",
    lastUpdatedLabel: "Source checked October 2026",
    taxonomyTags: ["ransomware", "outage", "financial_services", "resilience"],
    limitations: [
      "Independently curated for learning. Cyentia has not identified this row as a member of its 136-event research sample.",
      "No benchmark or published global loss is automatically assigned to this individual case's model.",
      "Do not treat unavailable organization-specific financials or incident records as confirmed zero; provide evidence before modeling.",
    ],
    governance: {
      lastVerified: "2026-10-31",
      notes:
        "Independent public-source case; IRIS Xtreme 2026 is comparative population context only, not the case's supporting source.",
    },
    evidence: [
      {
        id: "inc_icbc_financial_2023_primary",
        type: "sec_other",
        source: "seed",
        title: "SEC — ICBC Financial Services ransomware order",
        url: "https://www.sec.gov/enforcement-litigation/administrative-proceedings/34-101794-s",
        excerpt:
          "SEC documented recordkeeping disruption and deficient operational preparedness; no civil penalty was assessed.",
        teach:
          "Distinguish regulatory sanction, actual operational cost and hypothetical avoided losses; censure is not a dollar fine.",
        retrievedAt: "2026-10-31",
        trustTier: "regulator_primary",
        linkRole: "deep_link",
      },
    ],
    securityLesson: {
      caseAnalysis:
        "Distinguish regulatory sanction, actual operational cost and hypothetical avoided losses; censure is not a dollar fine.",
      identification: [
        "Locate the exact first-party disclosure and its publication date; compare subsequent updates before relying on a loss number.",
      ],
      prevention: [
        "Name the specific access or dependency control relevant to this event and how its effectiveness would be demonstrated.",
      ],
      mitigationPriority: [
        "Separate observed loss or disruption from estimated exposure and model only the entity whose financial boundary is defined.",
      ],
    },
  },
  {
    id: "inc_ronin_bridge_2022",
    slug: "ronin-bridge-2022",
    manualEvidenceOnly: true,
    company: {
      name: "Ronin Network / Sky Mavis",
      type: "Private",
      headquartersLabel: "Ho Chi Minh City, Vietnam",
      hqLat: 10.824,
      hqLon: 106.63,
      countryCode: "VN",
      sector: "Blockchain gaming / bridge",
      financials: {
        fiscalYearLabel:
          "Not verified for this case — obtain as-of filings before dollar-model calibration",
      },
    },
    incidentTitle: "2022 — Axie Infinity bridge theft",
    incidentTypeLabel: "Financial Theft",
    incidentSummary:
      "The U.S. Treasury attributed a theft valued at nearly $620 million from the Axie Infinity-linked blockchain project to the Lazarus Group.",
    firstReportedLabel: "2022-03",
    lastUpdatedLabel: "Source checked October 2026",
    taxonomyTags: ["financial_theft", "crypto", "supply_chain", "controls"],
    limitations: [
      "Independently curated for learning. Cyentia has not identified this row as a member of its 136-event research sample.",
      "No benchmark or published global loss is automatically assigned to this individual case's model.",
      "Do not treat unavailable organization-specific financials or incident records as confirmed zero; provide evidence before modeling.",
    ],
    governance: {
      lastVerified: "2026-10-31",
      notes:
        "Independent public-source case; IRIS Xtreme 2026 is comparative population context only, not the case's supporting source.",
    },
    evidence: [
      {
        id: "inc_ronin_bridge_2022_primary",
        type: "regulator",
        source: "seed",
        title: "U.S. Treasury — Ronin bridge theft and sanctions",
        url: "https://home.treasury.gov/news/press-releases/jy0768",
        excerpt:
          "OFAC-linked announcement reports the theft magnitude and Lazarus attribution.",
        teach:
          "Contrast direct stolen assets with gross company revenue; look for concentration and authorization controls.",
        retrievedAt: "2026-10-31",
        trustTier: "regulator_primary",
        linkRole: "deep_link",
      },
    ],
    securityLesson: {
      caseAnalysis:
        "Contrast direct stolen assets with gross company revenue; look for concentration and authorization controls.",
      identification: [
        "Locate the exact first-party disclosure and its publication date; compare subsequent updates before relying on a loss number.",
      ],
      prevention: [
        "Name the specific access or dependency control relevant to this event and how its effectiveness would be demonstrated.",
      ],
      mitigationPriority: [
        "Separate observed loss or disruption from estimated exposure and model only the entity whose financial boundary is defined.",
      ],
    },
  },
  {
    id: "inc_costa_rica_public_services_2022",
    slug: "costa-rica-public-services-2022",
    manualEvidenceOnly: true,
    company: {
      name: "Republic of Costa Rica — public institutions",
      type: "Unknown",
      headquartersLabel: "San José, Costa Rica",
      hqLat: 9.928,
      hqLon: -84.091,
      countryCode: "CR",
      sector: "Government / public services",
      financials: {
        fiscalYearLabel:
          "Not verified for this case — obtain as-of filings before dollar-model calibration",
      },
    },
    incidentTitle: "2022 — national public-service ransomware emergency",
    incidentTypeLabel: "Business Interruption",
    incidentSummary:
      "Conti-linked attacks disrupted tax, customs and other government systems and triggered a national cyber emergency.",
    firstReportedLabel: "2022-04",
    lastUpdatedLabel: "Source checked October 2026",
    taxonomyTags: [
      "government",
      "ransomware",
      "outage",
      "critical_infrastructure",
    ],
    limitations: [
      "Independently curated for learning. Cyentia has not identified this row as a member of its 136-event research sample.",
      "No benchmark or published global loss is automatically assigned to this individual case's model.",
      "Do not treat unavailable organization-specific financials or incident records as confirmed zero; provide evidence before modeling.",
    ],
    governance: {
      lastVerified: "2026-10-31",
      notes:
        "Independent public-source case; IRIS Xtreme 2026 is comparative population context only, not the case's supporting source.",
    },
    evidence: [
      {
        id: "inc_costa_rica_public_services_2022_primary",
        type: "regulator",
        source: "seed",
        title:
          "World Bank / Costa Rica — From Cyber Disaster to Digital Resilience",
        url: "https://documents.worldbank.org/en/publication/documents-reports/documentdetail/099093026162532922",
        excerpt:
          "Government and World Bank case study documents the multi-institution disruption and macroeconomic effects.",
        teach:
          "A 2.4%-of-GDP economic disruption estimate is not single-entity FAIR loss magnitude; preserve the loss boundary.",
        retrievedAt: "2026-10-31",
        trustTier: "regulator_primary",
        linkRole: "deep_link",
      },
    ],
    securityLesson: {
      caseAnalysis:
        "A 2.4%-of-GDP economic disruption estimate is not single-entity FAIR loss magnitude; preserve the loss boundary.",
      identification: [
        "Locate the exact first-party disclosure and its publication date; compare subsequent updates before relying on a loss number.",
      ],
      prevention: [
        "Name the specific access or dependency control relevant to this event and how its effectiveness would be demonstrated.",
      ],
      mitigationPriority: [
        "Separate observed loss or disruption from estimated exposure and model only the entity whose financial boundary is defined.",
      ],
    },
  },
];
