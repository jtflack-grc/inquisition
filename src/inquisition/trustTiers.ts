import type {
  EvidenceItem,
  EvidenceTrustTier,
  EvidenceLinkRole,
} from "./types";

const TIER_LABELS: Record<EvidenceTrustTier, string> = {
  issuer_primary: "Issuer / primary",
  regulator_primary: "Regulator",
  litigation_index: "Docket index",
  navigation_hub: "Start here",
  news_media: "News / trade",
};

const TIER_SHORT: Record<EvidenceTrustTier, string> = {
  issuer_primary: "Primary",
  regulator_primary: "Regulator",
  litigation_index: "Docket",
  navigation_hub: "Hub",
  news_media: "News",
};

/** Lower sorts earlier (more authoritative first). */
const TIER_SORT_ORDER: Record<EvidenceTrustTier, number> = {
  issuer_primary: 0,
  regulator_primary: 1,
  litigation_index: 2,
  navigation_hub: 3,
  news_media: 4,
};

/** UI glossary: what the tier is good / not good for. */
export const TRUST_TIER_GLOSSARY: Record<
  EvidenceTrustTier,
  { title: string; goodFor: string; notFor: string }
> = {
  issuer_primary: {
    title: "Issuer / primary",
    goodFor:
      "Filing dates, issuer materiality language, and financial statement anchors on EDGAR.",
    notFor:
      "Proving criminal attribution or the full scope of consumer harm without other artifacts.",
  },
  regulator_primary: {
    title: "Regulator",
    goodFor:
      "Official allegations, orders, advisories, and breach-portal counts from CISA, FTC, HHS OCR, AGs, etc.",
    notFor:
      "Substituting for issuer GAAP lines or private settlement terms not in public orders.",
  },
  litigation_index: {
    title: "Docket index",
    goodFor:
      "Spotting active MDLs, complaint themes, and litigation timeline pressure.",
    notFor:
      "Treating a search results page as a final damages number or admitted liability.",
  },
  navigation_hub: {
    title: "Hub / search",
    goodFor:
      "Jumping off to the right index, full-text search, or desk landing page before you open a PDF.",
    notFor:
      "Citing as a single primary document—always drill to the underlying filing or article.",
  },
  news_media: {
    title: "News / trade press",
    goodFor:
      "Triage timing, narrative context, and what the market heard first.",
    notFor:
      "Sole proof of legal materiality, exact loss figures, or technical root cause.",
  },
};

export function trustTierSortKey(tier: EvidenceTrustTier): number {
  return TIER_SORT_ORDER[tier] ?? 99;
}

/** Resolve trust tier for UI badges (explicit field wins, else heuristic). */
export function resolveEvidenceTrust(e: EvidenceItem): {
  tier: EvidenceTrustTier;
  linkRole: EvidenceLinkRole;
  label: string;
  shortLabel: string;
} {
  const linkRole: EvidenceLinkRole = e.linkRole ?? inferLinkRole(e);
  const tier: EvidenceTrustTier = e.trustTier ?? inferTrustTier(e, linkRole);
  return {
    tier,
    linkRole,
    label: TIER_LABELS[tier],
    shortLabel: TIER_SHORT[tier],
  };
}

function inferLinkRole(e: EvidenceItem): EvidenceLinkRole {
  const u = e.url.toLowerCase();
  if (u.includes("/edgar/search") || u.includes("courtlistener.com/?q="))
    return "navigation_hub";
  if (
    e.type === "news" &&
    (u.endsWith("reuters.com/technology") || u.endsWith("reuters.com/world"))
  )
    return "navigation_hub";
  if (e.type === "sec_8k" || u.includes("type=8-k")) return "deep_link";
  return "deep_link";
}

function inferTrustTier(
  e: EvidenceItem,
  linkRole: EvidenceLinkRole
): EvidenceTrustTier {
  const u = e.url.toLowerCase();
  if (e.type === "lawsuit") return "litigation_index";
  if (e.type === "regulator") return "regulator_primary";
  if (e.type === "news")
    return linkRole === "navigation_hub" ? "navigation_hub" : "news_media";
  if (e.type === "sec_8k") return "issuer_primary";
  if (e.type === "sec_other") {
    if (linkRole === "navigation_hub" || u.includes("edgar/search"))
      return "navigation_hub";
    return "issuer_primary";
  }
  return "navigation_hub";
}

/** Ensure every evidence row has trust metadata for consistent UI. */
export function annotateEvidenceTrust(items: EvidenceItem[]): EvidenceItem[] {
  return items.map((e) => {
    if (e.trustTier && e.linkRole) return e;
    const r = resolveEvidenceTrust({
      ...e,
      trustTier: undefined,
      linkRole: undefined,
    });
    return {
      ...e,
      trustTier: e.trustTier ?? r.tier,
      linkRole: e.linkRole ?? r.linkRole,
    };
  });
}
