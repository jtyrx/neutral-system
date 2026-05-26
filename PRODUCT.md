# Product

> **On-demand reference.** Load this file explicitly when working on product strategy, user journey, or feature prioritization decisions. It is not auto-loaded on every agent turn.

## Register

**Product** — expert workbench first, not brand-first marketing or portfolio.

The site may signal taste and identity, but the primary register is a **serious design-system tool**: the product proves the designer’s thinking through operable output, not through promotional framing. Design serves the task; the workbench is the argument.

## Users

**Primary:** Internal cross-functional design–engineering experts. Designers arrive to build a neutral ramp and map semantic roles; engineers arrive to validate token outputs and integrate CSS/Tailwind exports. Both are fluent in their domain. Neither needs hand-holding — they need accuracy, inspectability, and speed.

**Secondary:** AI-augmented product builders — designers, frontend engineers, and agentic coding workflows that need structured tokens, semantic mappings, guardrails, and exportable decisions they can hand to tools without losing intent.

## Product Purpose

neutral-system is a precision workbench for building OKLCH-based neutral color systems. It generates a calibrated ramp (up to 41 steps), maps semantic tokens (surface, text, border roles) for light and dark modes, and exports production-ready CSS, JSON, and Tailwind v4 output. It bridges the gap between color theory and shipped design tokens, turning perceptual color math into a system both designers and engineers can trust.

Success: a designer configures a ramp, an engineer exports tokens, and the CSS lands in production unchanged — with no manual translation step between them. Secondary success: an agent or codegen pipeline consumes the same structured decisions without re-inventing semantics.

## Brand Personality

**Rigorous · Composed · Operable**

Less flashy portfolio, more calibrated system — something you could actually use inside Anthropic, Stripe, Vercel, or Figma. Every control communicates defensible logic; ambiguity is a defect, not a style. The interface stays calm under density so experts can work fast without visual noise competing with the ramp.

## References

Named influences for tone, density, and inspectability — not literal copies:

- **Stripe dashboard** — operational clarity, information density without clutter, trustworthy defaults.
- **Figma variables / token panels** — inspectable design logic, explicit mappings, engineer-readable structure.
- **Linear** — restrained hierarchy, fast focused workflows, no decorative chrome.
- **Klim Type Foundry specimen pages** *(supporting)* — typographic discipline, pacing, editorial confidence in labels and readouts.

## Anti-references

- **Adobe-style tool heaviness** — dark chrome, dense icon bars, multiple persistent floating panels. Feels like Photoshop.
- **Generic no-code SaaS gloss** — bubbly cards, pastel gradients, marketing-style layout. Feels like Canva or Webflow.
- **Notion-style everything-is-a-block** — vertical stacking of nested blocks, wiki rhythm, spatial hierarchy lost in infinite scroll.
- **AI-wrapper aesthetics** — glowing gradients, vague “magic” panels, chatbot-first framing. The tool is authoritative, not performatively intelligent.
- **Portfolio theatrics** — motion, branding, or visual effects that overpower system logic. Taste is shown through the system, not around it.
- **Analytics-dashboard clutter** — metric cards, chart chrome, or BI density that makes the workbench feel like reporting software instead of design-system authoring.

## Design Principles

1. **Rigor in the open** — Every mapping and readout should be inspectable and defensible. If the output is ambiguous, the UI has failed.
2. **Composed under load** — Dense layouts stay visually calm: hierarchy, spacing, and type do the work; decoration does not.
3. **Operable end-to-end** — Configure, preview, validate, export. No dead-end previews; no exports that require translation.
4. **The tool disappears** — When the workbench works well, users think about their color problem, not the interface. Navigation overhead is waste.
5. **Shared language** — Design, engineering, and agents see the same tokens in the same names. The workbench bridges roles and workflows, not just file formats.
6. **Earn the opinion** — Opinionated defaults (OKLCH ramps, semantic elevation model, scalable step count) should be visibly justified by the quality of output they produce.

## Accessibility & Inclusion

Accessibility is part of the system’s intelligence, not a compliance layer bolted on later.

- **Baseline:** WCAG 2.x AA (4.5:1 for normal text; 3:1 for large text and UI components where applicable).
- **Target bar:** Design and validate closer to a strict product standard — visible focus, logical tab order, meaningful labels, and contrast pairings that reflect real semantic roles, not theoretical cross-products.
- **Keyboard:** Full keyboard navigation across workbench, dock, panels, ramp rail, and export flows.
- **Focus:** Visible, consistent focus rings that work in light and dark chrome.
- **Motion:** Respect `prefers-reduced-motion`; avoid motion that is decorative; state feedback may simplify when reduced motion is on.
- **Themes:** High-contrast theme considerations; **forced-colors** compatibility where possible (semantic tokens and borders must not rely on color alone).
- **Evaluation:** Contrast tooling should support both **WCAG** and **APCA** so experts can judge perceptual contrast, not only ratio thresholds.
