# Revorion — Project Context for Claude Code

## What This Is

Revorion is a B2B enterprise SaaS platform for revenue leakage detection. The website is built to a strict design system. Before writing any CSS, component, or markup — read and follow these rules exactly.

## Design System Reference

**Figma:** https://www.figma.com/design/3JwGTqagkA7thfgQchDb7u/Revorion
- DS LIGHT: node 2365:2
- DS DARK: node 2341:1608
- Components: page 2147:2

**CSS tokens:** `styles/revorion-tokens.css` — import this first in every CSS file.
**Cursor rules:** `.cursor/rules/revorion-design-system.mdc` — full rule set.

## Non-Negotiable Rules

### Fonts — three only
- Headlines: `Test Financier Display` → `var(--font-serif)`
- Body/UI: `Test Söhne` → `var(--font-sans)`
- Buttons/labels: `Test Söhne Mono` → `var(--font-mono)`

### Border radius
`border-radius: 0` on everything. Always.

### Colors
Never hardcode hex. Use `var(--color-*)` tokens from `revorion-tokens.css`.
Dark mode is default (`:root`). Light mode via `[data-theme="light"]`.

### Type scale
Use only these classes: `.type-hero`, `.type-display`, `.type-heading`, `.type-subheading`, `.type-heading-md`, `.type-body-lg`, `.type-body`, `.type-body-sm`, `.type-micro`, `.type-whisper`, `.type-button`, `.type-label`, `.type-caption`

Body text never below 16px. Button labels always `.type-button` (uppercase, Söhne Mono).

### Buttons
- Height: 48px, min-width: 200px, border-radius: 0
- Label: `.type-button` (12.8px Söhne Mono, uppercase, 0.1em tracking)
- Dark primary: cream bg / ink-pure text
- Light primary: sage-mid bg / ink-pure text
- One primary button per viewport max

### Spacing
Use `var(--space-*)` tokens only. No magic numbers.

### What never to do
- No Inter, Roboto, or system fonts
- No gradients
- No blue
- No border-radius
- No hardcoded colors or sizes
- No stock photography

## Brand Voice (for copy edits)
Cold, precise, institutional. "Palantir for revenue." CFO and VP RevOps are the personas. No marketing fluff. Specific data over vague claims.
