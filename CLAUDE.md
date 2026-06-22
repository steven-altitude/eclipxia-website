# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Eclipxia (`eclipxia.com`) — a single-page marketing landing for an AI consulting & engineering firm based in Samborondón, Ecuador. Built with Astro 5, deployed to Vercel. Spanish-language, dark, premium, motion-rich one-pager. Primary CTA throughout = `mailto:hola@eclipxia.com`.

This is a faithful rebuild of a design handoff (`design_handoff_eclipxia_landing`): dark monochrome palette, no chromatic accent, kinetic hero headline, progressive word-highlight manifesto, animated canvas "eclipse" rings, marquee, and scroll-reveal sections.

## Commands

```bash
npm run dev       # Dev server (localhost:4321)
npm run build     # Production build → dist/
npm run preview   # Preview the production build locally
```

No test runner, linter, or formatter is configured.

## Architecture

- **Astro 5** static output, adapted to Vercel via `@astrojs/vercel`
- **No CSS framework** — all styling is hand-authored in `src/styles/global.css` (design tokens, sections, responsive)
- **No GSAP / Tailwind** — animations are CSS keyframes + a single vanilla `<script>` in `index.astro`
- Sitemap auto-generated via `@astrojs/sitemap`; Vercel Analytics + Speed Insights wired in `BaseLayout.astro`

### Key Files

| Path | Purpose |
|------|---------|
| `src/layouts/BaseLayout.astro` | `<head>`: meta, OG/Twitter, Geist fonts (Google Fonts), JSON-LD, analytics. Adds `.js` class for progressive-enhancement reveals |
| `src/pages/index.astro` | The entire landing — all section markup (data-driven via frontmatter arrays) + the client interactions script |
| `src/styles/global.css` | All design tokens, section styles, responsive breakpoints, keyframes |
| `public/eclipxia-logo.png` | Wordmark (light, for dark bg). Always constrain by `height` with `width:auto` |

## Design Tokens

Monochrome dark, near-white accent. No chromatic color (the only "color" is the animated eclipse ring on canvas).

- **Background** `#121317` · **Surface alt** `#16171C` · **Card** `#1A1B21` (hover `#1E1F26`) · **Highlight card** `#222329`
- **Text** primary `#F2F2F4`, bright `#F6F6F8`, body `#9D9DA6`, muted `#C8C8CE`, dim `#7A7A84`, faint `#6E6E78`, faintest `#5A5A62`
- **Fonts**: `Geist` (UI/body), `Geist Mono` (eyebrows, marquee, numbers, footer meta) — via Google Fonts
- **Content max-width** `1180px`, side padding `32px`

## Interactions (all in `index.astro` script)

- Fixed nav gains frosted bg after 24px scroll (`.scrolled`)
- Mobile menu overlay (`<820px`), toggled via `.open`
- Scroll-reveal with per-sibling stagger via IntersectionObserver (`[data-reveal]` → `.is-visible`)
- Kinetic hero headline (per-word `ecl-word`), 2s failsafe to force-visible
- Progressive manifesto word-highlight tied to scroll position
- 2px scroll-progress bar
- Animated eclipse ring canvas (hero interactive w/ mouse parallax; contact non-interactive). Respects `prefers-reduced-motion`

## Conventions

- Spanish only (`lang="es"`) — all copy, labels, meta
- Trailing slashes enforced (`trailingSlash: 'always'`)
- Responsive breakpoint at 820px (CSS media queries, not JS); layouts collapse to single column on mobile
- Section content is defined as arrays in `index.astro` frontmatter (services, process, whyUs, marquee) — edit there, not in markup

## Parent Project Rules

Lives under the Altitude Websites workspace. Parent `CLAUDE.md` + `SKILL.md` apply:

- No emojis anywhere
- No Inter font (this site uses Geist)
- No `h-screen` — use `min-h-[100dvh]` / `100vh` patterns
- Animations use `transform` and `opacity` only
- Mobile-first; collapse to single column on small screens
