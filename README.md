# INQUISITION

**Interrogate the loss story.**

**Live casebook:** https://jtflack-grc.github.io/inquisition/

INQUISITION is a public, browser-based casebook for examining the financial shape of public cyber incidents. Choose from 34 documented cases, inspect the evidence record, challenge the assumptions behind each loss category, and simulate how the materiality range changes.

The application is intentionally retrospective. It does not scrape live sources, make legal materiality determinations, or disguise teaching assumptions as measured losses.

## What is inside

- **Case library:** 34 public incidents spanning privacy, operational interruption, destructive malware, extortion, payment-card exposure, and supply-chain compromise.
- **Evidence record:** issuer filings, regulators, litigation indexes, and reporting labeled by provenance.
- **Source Facts:** a nutrition-label scan of source mix, sample size, population, observation window, and promotional-content review, adapted from Tony Martin-Vegue's five-field security-report test.
- **Estimate:** a readable min / most likely / max loss story by category.
- **Assumptions:** the inputs, formulas, and provenance under the estimate.
- **Simulation:** independent triangular sampling of the same loss buckets, with an optional FAIR-style LEF / EAL sketch.
- **Globe briefing:** geographic and financial context tied to the active case.

## Run locally

```bash
npm ci
npm run dev
```

Quality checks:

```bash
npm test
npm run lint
npm run build
```

## Model boundaries

The deterministic bridge uses transparent teaching heuristics. Business interruption estimates lost contribution margin rather than treating all delayed revenue as loss. Gross primary loss, insurance recovery, retained primary loss, and conditional secondary loss remain distinct. The Monte Carlo view samples each cost bucket independently and applies an explicit probability to outside-party reaction; it does not model correlation or a complete FAIR factor tree. Outputs are structured questions, not forecasts.

Each editable input is labeled as a case default, filed context, illustrative figure, user edit, or absent value. Extortion and insurance remain zero unless the user enters an evidenced or scenario assumption.

FAIR™ is a trademark of The FAIR Institute. INQUISITION uses core FAIR concepts with an original compact incident-cost taxonomy; it is not affiliated with or certified by The FAIR Institute. It is not legal, investment, actuarial, insurance, or incident-response advice. Verify the linked primary artifacts before professional use.

Created by John Flack.
