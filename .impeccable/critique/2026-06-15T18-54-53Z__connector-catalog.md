---
target: connector catalog
total_score: 25
p0_count: 0
p1_count: 2
timestamp: 2026-06-15T18-54-53Z
slug: connector-catalog
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | "Showing X of Y" and active chip states work; freshness bar has no legend |
| 2 | Match System / Real World | 3 | Terminology matches Microsoft conventions; "triggers" unexplained for makers |
| 3 | User Control and Freedom | 3 | Clear-all, Escape on modal, URL sync — missing X button in SearchBar |
| 4 | Consistency and Standards | 2 | Category uses select while all other filters use chips; badge colors inconsistent in modal |
| 5 | Error Prevention | 3 | Read-only catalog; debounced search; URL persistence prevents accidental loss |
| 6 | Recognition Rather Than Recall | 3 | Filters visible; active state clear; freshness bar meaning invisible without legend |
| 7 | Flexibility and Efficiency | 2 | URL params for bookmarks; no keyboard shortcut to focus search; cards have no href |
| 8 | Aesthetic and Minimalist Design | 3 | Clean and functional; freshness bar too faint; sidebar and content hierarchy flat |
| 9 | Error Recovery | 2 | "No connectors found" empty state has no suggested action |
| 10 | Help and Documentation | 1 | No tooltips; Certified vs Independent undefined; triggers undefined; freshness bar legend absent |
| **Total** | | **25/40** | **Acceptable — significant improvements available** |

## Anti-Patterns Verdict
Not AI slop. No gradient text, no side-stripe borders, no metric-hero template. Deterministic scan: 0 findings.

## Overall Impression
Solid, functional catalog with one standout differentiator (git-date freshness data) that the UI undersells. Connector circles carry the visual weight. Two biggest gaps are information gaps: no explanations of filter terms, no guidance on empty state.

## What's Working
1. URL state sync — every filter combination bookmarkable and shareable
2. Connector brand circles — make the grid scannable in a way no generic icon library could
3. Detail modal depth — first/last published dates, privacy policy, capabilities, API version — significantly more than MS Learn

## Priority Issues

**[P1] Empty state is a dead end**
- What: "No connectors found matching your filters." — no next step, no suggestion
- Why: Both personas hit this; maker who searched "slack" with wrong filters has no path forward
- Fix: Add recovery actions inline — "Clear all filters" and show active filters as culprit
- Command: /impeccable harden

**[P1] No contextual explanation of key filter terms**
- What: "Certified", "Independent", "triggers" — zero explanation anywhere
- Why: Independent connectors are all Premium (paid license required); maker doesn't know
- Fix: Tooltips on Type and Triggers section labels in FilterBar
- Command: /impeccable clarify

**[P2] Category filter is the odd one out**
- What: All filters are chips; categories are a select dropdown. Inconsistent.
- Why: select on mobile is native OS picker that doesn't match UI vocabulary
- Fix: Scrollable chip/checkbox panel or improve select to show active state in trigger
- Command: /impeccable layout

**[P2] Freshness bar communicates that it exists, not what it means**
- What: 2px top border (green/yellow/gray) — no legend, no tooltip
- Why: Signal with no legend is noise; catalog's best feature nearly invisible on cards
- Fix: Make bar more substantial (4px) or add tooltip; lean into the date in footer instead
- Command: /impeccable clarify

**[P2] Stats bar not visibly interactive**
- What: Clickable shortcuts present as plain text metadata
- Why: Power users who find them love them; everyone else never knows
- Fix: Underline on hover or more pronounced hover color shift
- Command: /impeccable layout

## Persona Red Flags

**Alex (Power User):** No Cmd+K to focus search; cards are div not a (can't open in new tab); stat shortcuts invisible

**Jordan (First-Timer):** "Power Platform connectors" assumes prior knowledge; Certified/Independent unexplained; empty state = abandonment

**Morgan (Admin — project persona):** No tier data (Standard/Premium) for DLP decisions; capabilities filter absent; privacy policy not filterable

## Minor Observations
- Grid caps at 3 cols on 2xl — dead space on wide screens
- buildMicrosoftLearnUrl may produce broken URLs for connectors with special chars
- dark:text-gray-400 on dark:bg-gray-800 approximately 4.1:1 — borderline failing AA in dark mode
- Contact name in modal can render as technical strings from swagger

## Questions to Consider
- "The catalog's edge over MS Learn is freshness data — what if the date wasn't a footnote but part of the card identity?"
- "What does an admin use this for at 11am on a Thursday? Does every pixel serve that moment?"
- "If you removed all the filter chrome and left only the search box and the grid, what would you lose that actually matters?"
