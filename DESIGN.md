---
name: INQUISITION visual system
status: active
inherits: IMPACT three-rail language
font_sans: IBM Plex Sans
font_mono: IBM Plex Mono
background: "#07090b"
surface: "#0d1115"
border: "#20262d"
text: "#f2f5f7"
muted: "#8b949e"
evidence: "#64a783"
risk: "#e06b6b"
info: "#7ea4bf"
warning: "#c89a55"
radius_small: 4px
radius_medium: 6px
---

# Character

INQUISITION is the public cyber-materiality casebook in the three-rail family. It shares the restrained institutional language established by IMPACT, but it should feel more forensic than financial: evidence first, assumptions visible, materiality ranges challengeable, and geography used as a case-navigation surface.

The interface should read like a mature research instrument, not a cyber-themed dashboard.

# Shared family language

Use the same foundation as IMPACT:

- Near-black charcoal rails with subtle luminance differences.
- IBM Plex Sans for interface copy.
- IBM Plex Mono for identifiers, numeric ranges, dates, and compact metadata.
- One-pixel rail dividers and flat surfaces.
- Small radii (4px and 6px).
- Semantic color only where it communicates meaning.
- No generic gradients, ambient glow, glass effects, or decorative neon.
- Use hierarchy, spacing, rules, and typography before adding another card.

# Inquisition-specific identity

Muted green is the evidence/provenance accent, not a general decoration color. Amber indicates caution or illustrative assumptions. Red marks adverse materiality, selected-country risk context, and the incident currently under interrogation. Steel blue is informational. Muted violet may distinguish research/taxonomy material when useful.

Do not turn the whole interface green. The casebook should look neutral enough that provenance colors remain meaningful.

# Three rails

1. **Evidence rail**: case selection, timeline, caveats, cited sources, and evidence trust.
2. **Materiality rail**: estimate, assumptions, simulation, and FAIR-informed range decomposition.
3. **Case map**: restrained dark globe, all incident hotspots, selected-case geography, and concise company/security context.

The rails share state. Selecting a case from the evidence rail or a map hotspot must realign all three rails to the same incident.

# Case map and hotspots

The case map is interactive navigation, not decoration.

- Every incident with valid headquarters coordinates remains a selectable hotspot.
- Unselected hotspots use the quiet steel-blue information color.
- The selected hotspot becomes a red incident beacon: the point itself breathes in size while two expanding, fading red rings throb outward from the location.
- The map's compact upper-left case placard shows the selected incident immediately on first load, with its case number, title, type, disclosure date, and headquarters. It visually identifies the red ground pulse without floating labels.
- Hovering an unselected hotspot temporarily replaces the placard with a blue-accented case preview; leaving the hotspot restores the active case without changing the shared selection.
- Clicking a hotspot changes the shared incident selection and opens the case briefing.
- The selected country may receive a subtle translucent risk overlay.
- Default camera framing should show a large, readable globe while keeping the selected hemisphere central.
- Use the original locally hosted charcoal/gray react-globe.gl rendering as the default. Terrain elevation and map tile services are unnecessary for the casebook.
- Satellite imagery is an optional, single-texture view; a missing CDN image must never block the local charcoal globe.
- The bottom horizontal case notebook remains docked beneath the globe and offers three explicit heights (compact, standard, expanded) plus a persistent reopening handle when collapsed.
- The notebook presents **Case**, **Mechanism**, **Loss pathways**, and **Controls** as focused investigative views rather than a vertically compressed encyclopedia. The selected tab persists when the user changes cases, and notebook scroll resets to the top.
- Notebook presentation uses indexed chapters, a legible editorial question lead, high-contrast reading text, and consistent keyboard focus. The Controls view has an intentionally independent layout: paired Detect/Prevent tracks, numbered response priorities, and separate Frequency/Magnitude reasoning. At narrow widths, semantic pairs stack without producing orphaned grid columns.
- Aesthetic interest must come from measured typographic contrast, offset rules, spacing, meaningful chapter indexes and restrained semantic accents—never glow, glass, gratuitous charts, or repeated badges.
- Each view distinguishes curated case descriptions, analyst interpretation, modeled assumptions and suggested controls. FAIR event frequency and loss magnitude must never be conflated or presented as observed results.
- Analyst questions reveal a worked consideration without claiming a single certain answer. Only evidence-supported statements are presented as case facts; uncertain mechanisms and recommended controls remain explicitly hypotheses.
- Cross-rail actions link source context to the existing evidence rail and derived category ranges to the existing materiality rail. They must not silently modify selected cases or user-adjusted model inputs.
- Keep the network-independent 2D map available if the user's browser does not support WebGL.

Do not replace hotspots with a single selected marker. That would remove a core Inquisition navigation behavior.

# Evidence rail

The evidence rail can be dense, but it should not feel like a stack of glowing cards.

**Source Facts stays visible.** The Tony Martin-Vegue-inspired label and barcode are an intentional signature of the evidence rail, not expendable advanced metadata. Keep it fully rendered immediately after the featured source entry; retain the disclaimer that source classification does not establish truthfulness.

First contact should answer **what incident is selected, and which cited source can I open?** Keep incident selection and a clearly qualified source link visible. Put search, complete Source Facts, source metadata, disclosure timeline and caveats behind easily opened local disclosures. Deep-links from the notebook must expand their targets before scrolling. Counts and provenance tiers are classifications, never confidence or truth scores.

- Search and incident selection are primary controls and should be visually calm.
- Evidence trust tiers may use restrained color distinctions.
- Provenance, retrieval dates, filing identifiers, and source roles should favor mono text and alignment.
- Use dividers and grouped sections before introducing additional framed containers.
- Preserve links and evidence semantics exactly; styling must not imply stronger source quality than the underlying trust model.

# Materiality rail

The materiality rail shares IMPACT's analytical language but focuses on ranges and uncertainty.

- Make min / most likely / max ranges easy to scan.
- Treat Estimate / Assumptions / Simulation as tabs, not filled pills.
- Use mono numerals for dollar outputs and technical parameters.
- Keep controls compact and explicit.
- Do not visually collapse deterministic estimates, assumptions, and simulation outputs into one undifferentiated layer.
- FAIR pedagogy belongs in the first Estimate view, but in concise layers: introduce loss magnitude (LM) for one event versus loss event frequency (LEF), identify primary loss versus conditional external stakeholder reactions, and clarify that ranges are neither probabilities nor confidence intervals. The detailed category ledger should be collapsed in Estimate and fully available under the deeper model views.
- Shared information popovers must escape scrollable rails, appear above rail content but below actual Welcome/Method dialogs, and support viewport-aware placement, keyboard focus, Escape and click-away dismissal.
- Estimate starts with an honest common-dollar-scale visualization of gross primary and **conditional** secondary loss magnitudes, not a probability chart. Scenario stress, editable inputs and model export/reset belong in Assumptions or Simulation, and notebook links continue to navigate to precise categories.
- Replace beginner-facing heuristic 'confidence' with an explicit input-basis description; historical model confidence remains described as a non-calibrated flag in deeper views. No uncertainty metric implies statistical confidence without actual calibration.
- At widths below 1280px, offer Evidence / Loss model / Notebook views rather than clipping three side-by-side minimum-width rails. Full three-rail globe layout starts when the available viewport can fit all three columns. The notebook's mobile close control returns to Evidence.
- The Materiality stress factor is shared with the notebook and resets to the neutral 100% when selecting another incident. Never display unstressed notebook amounts alongside adjusted model ranges without a clearly labeled distinction. Label the shared magnitude chart endpoints and teach that business-interruption loss models **lost contribution**, not gross revenue.

# Dialogs

Dialogs should be concise operating surfaces. The first-run introduction can explain the casebook in a few sentences. Method/credits may be longer because model boundaries matter, but should remain one coherent surface rather than a stack of decorative cards.

# Avoid

- Hacker-terminal green as a page-wide aesthetic.
- Pulsing or animated dots that do not communicate a real active state.
- Card-on-card nesting.
- Wide tracking on ordinary body copy.
- Pill-shaped buttons for ordinary actions.
- Neon borders, glow, frosted glass, or decorative gradients.
- Hiding or removing incident hotspots for visual simplicity.
- Styling that makes illustrative assumptions look like filed facts.
