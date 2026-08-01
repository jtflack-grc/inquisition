import { catalogEntryToIncident } from "./evidenceKit";
import { BUILTIN_CATALOG_SEEDS } from "./catalog/builtInSeeds";
import { MORE_CATALOG_SEEDS } from "./catalog/moreSeeds";
import { enrichIncidentBreadth } from "./enrichIncidentBreadth";

/**
 * Full INQUISITION incident library: compiled from curated seeds with
 * consistent SEC / CISA / litigation anchors plus case-specific regulator links.
 * `enrichIncidentBreadth` ensures every row has baseline limitations + globe attack summary when omitted in seeds.
 */
export const SEEDED_INCIDENTS = [
  ...BUILTIN_CATALOG_SEEDS,
  ...MORE_CATALOG_SEEDS,
]
  .map(catalogEntryToIncident)
  .map(enrichIncidentBreadth);
