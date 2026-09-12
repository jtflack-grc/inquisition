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
3. **Case map**: realistic Earth, all incident hotspots, selected-case geography, and concise company/security context.

The rails share state. Selecting a case from the evidence rail or a map hotspot must realign all three rails to the same incident.

# Case map and hotspots

The case map is interactive navigation, not decoration.

- Every incident with valid headquarters coordinates remains a selectable hotspot.
- Unselected hotspots use the quiet steel-blue information color.
- The selected hotspot becomes a red incident beacon: the point itself breathes in size while two expanding, fading red rings throb outward from the location.
- The active company label remains attached to the selected point so the red pulse communicates focus, not an unlabeled alarm.
- Hovering an unselected hotspot reveals company and incident identity without opening a modal.
- Clicking a hotspot changes the shared incident selection and opens the case briefing.
- The selected country may receive a subtle translucent risk overlay.
- Default camera framing should show a large, readable globe while keeping the selected hemisphere central.
- Terrain and imagery may be realistic because geography contributes directly to case comprehension.

Do not replace hotspots with a single selected marker. That would remove a core Inquisition navigation behavior.

# Evidence rail

The evidence rail can be dense, but it should not feel like a stack of glowing cards.

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
