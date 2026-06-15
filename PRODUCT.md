# Product

## Register

product

## Users

Two personas, one interface:

- **Power Platform makers** — low-code builders working in Power Automate or Power Apps. They arrive during a build, wanting to know whether a connector exists for a given service, what operations it exposes, and whether it requires a premium license. Speed of discovery is the priority.
- **Power Platform admins and architects** — IT pros evaluating connectors for DLP policy decisions, licensing cost planning, or integration architecture. They want auth type, operation depth, tier, publisher credibility, and recency. Depth of evaluation is the priority.

Both land on the same catalog. The design must serve fast browsing (maker) and deliberate evaluation (admin) without optimizing for one at the expense of the other.

## Product Purpose

A fast, searchable, filterable catalog of 1,100+ Microsoft Power Platform connectors — built as an independent alternative to the official MS Learn connector reference, which is a flat HTML table with no real search, no filtering, and no freshness signal.

Success looks like: a maker finds the right connector in under 30 seconds; an admin gets enough detail from the modal to make a licensing or DLP decision without leaving the page.

## Brand Personality

Approachable authority. Like a well-maintained docs site run by someone who actually uses the product. Friendly but precise. The visual language earns trust through clarity, not decoration.

Three words: **organized, current, useful**.

## Anti-references

- **Generic SaaS dashboard** — card grids with metric widgets, purple/blue gradients, "hero stats" sections, everything feeling like it's selling something. This catalog informs; it doesn't pitch.
- **Dark mode dev tool** — terminal aesthetic, monospace everywhere, VS Code clone energy. The audience includes non-developers; the interface should feel welcoming, not exclusionary.
- **MS Learn connector reference** — the flat, dense, un-searchable HTML table this catalog exists to replace. No inspiration to take from it, even as a cautionary reference point.

## Design Principles

1. **Data is the visual** — connector brand colors, operation counts, and freshness indicators are the color and rhythm of this interface. Build around them rather than overlaying a separate decorative language.
2. **Density that doesn't exhaust** — makers and admins are on a task. Pack in information, but use whitespace and hierarchy to make scanning effortless rather than demanding.
3. **Two jobs, one flow** — the grid is for discovery (maker mode); the modal is for evaluation (admin mode). Each should feel complete for its job, not like a stripped-down version of something bigger.
4. **Freshness is the differentiator** — recency data (new connectors, recent updates) is what MS Learn doesn't surface. Make it visible without making it the only story.
5. **Earn authority through structure** — not through branding, chrome, or visual noise. Consistent layout, predictable patterns, and reliable information are the brand.

## Accessibility & Inclusion

Reasonable effort baseline. Keyboard navigation on all interactive elements (cards, modal, filters) is already implemented. Maintain color contrast at WCAG 2.1 AA for text. No specific compliance target.
