import type { MaterialityViewTab } from "./materialityViewTab";

export interface GoldenExample {
  id: string;
  title: string;
  premise: string;
  sourceQuestion: string;
  modelQuestion: string;
  decisionQuestion: string;
  reveal: string;
  teachingPoint: string;
  researchPage: number;
  modelTab: MaterialityViewTab;
}

/** Five different investigative skills, not five versions of the same ransomware demo. */
export const GOLDEN_EXAMPLES: GoldenExample[] = [
  {
    id: "inc_jaguar_land_rover_2025",
    title: "01 · Jaguar Land Rover / dependency cascade",
    premise: "When production stops, whose loss is it?",
    sourceQuestion: "Read JLR's initial September 2025 statement. What does it establish? Which supplier losses are established by separate UK government and corporate statements?",
    modelQuestion: "What revenue and contribution-margin evidence would be needed before converting a production halt into a retained economic loss? Does the default model have it?",
    decisionQuestion: "Which time-to-recover or supplier-continuity control would change the loss curve? What test would establish its effectiveness?",
    reveal: "JLR acknowledged severe disruption; an outage duration and sales figure alone do not establish retained enterprise loss. Supplier effects require their own loss boundaries.",
    teachingPoint: "Primary-vs-third-party loss, dependency cascades, and evidence-based business interruption",
    researchPage: 21,
    modelTab: "advanced",
  },
  {
    id: "inc_mgm_resorts_2023",
    title: "02 · MGM / identity into interruption",
    premise: "A control's presence is not evidence it worked.",
    sourceQuestion: "Compare MGM's reported operational disruption with the security narrative. Which access method is actually demonstrated in an issuer or official artifact?",
    modelQuestion: "Separate an annual LEF hypothesis from the magnitude of one disruption. Which recovery and insurance assumptions are supported versus invented?",
    decisionQuestion: "Would service-desk verification, privileged access controls or recovery testing have changed the outcome? What observations would settle that?",
    reveal: "A vivid attack narrative does not itself establish TEF, susceptibility or causal control failure. Model what the evidence can support and flag the rest.",
    teachingPoint: "Valid accounts, causal uncertainty, implemented-versus-effective controls",
    researchPage: 30,
    modelTab: "fair_native",
  },
  {
    id: "inc_moveit_supply_chain_2023",
    title: "03 · MOVEit / one event, many entities",
    premise: "Can you use hundreds of victims as an annual rate?",
    sourceQuestion: "Read the official campaign advisory and compare disclosures by impacted organizations. Where are the boundaries of the event and the affected population?",
    modelQuestion: "The app's case is a campaign, not a company. Can a single company revenue or annual loss frequency be derived from it? Why not?",
    decisionQuestion: "Which exposure inventory, patch cadence and vendor dependency tests would help decide where to invest?",
    reveal: "A selected set of victims is not a TEF numerator over a known, consistently exposed company-year denominator. Aggregating victim costs is not a single-firm loss.",
    teachingPoint: "Denominators, vector overlap, supply-chain and campaign aggregation",
    researchPage: 30,
    modelTab: "advanced",
  },
  {
    id: "inc_equifax_2017",
    title: "04 · Equifax / the record-count trap",
    premise: "If records double, does loss double?",
    sourceQuestion: "Find the contemporaneous disclosures and later settlements. Which costs were observed, incurred or merely projected at each point in time?",
    modelQuestion: "Interrogate the fixed $2.4M-per-million-record proxy and explain why a per-record component doesn't predict total enterprise loss.",
    decisionQuestion: "What documented cost categories and controls would materially alter the decision—and which are just correlated with the record count?",
    reveal: "IRIS Xtreme Figure 11 finds near-zero predictive power for record count versus total loss among its analyzed extreme non-crypto cases; it does not negate legitimate per-person notification expenses.",
    teachingPoint: "Source facts versus proxies, temporal evidence, and false precision",
    researchPage: 17,
    modelTab: "advanced",
  },
  {
    id: "inc_bybit_2025",
    title: "05 · Bybit / stolen assets versus severity proxies",
    premise: "What happens when the taxonomy omits the main loss?",
    sourceQuestion: "Read the FBI's public attribution and asset-theft magnitude. Which amounts describe gross asset theft rather than company expenses or final retained loss?",
    modelQuestion: "Does INQUISITION's current cost taxonomy contain direct virtual-asset theft? If not, why would its generic simulated magnitude be misleading?",
    decisionQuestion: "Would authorization, transaction verification, custody segregation and recovery change the loss pathway? How would we know?",
    reveal: "The FBI reports approximately $1.5B in stolen virtual assets. Our existing LM bridge lacks a direct financial-theft category: this is a documented limitation, not permission to reinterpret the theft as response or privacy costs.",
    teachingPoint: "Loss-boundary discipline, direct theft, controls and model incompleteness",
    researchPage: 18,
    modelTab: "advanced",
  },
];
