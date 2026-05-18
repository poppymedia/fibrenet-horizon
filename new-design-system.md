# Fibrenet Design System — Horizon Token Reference

## 1. Global Containers

### Page Width
| Token | Value | Notes |
|---|---|---|
| `--page-width` | `1200px` | Max content width for all standard pages |
| `--page-width-narrow` | `800px` | Legacy narrow reference (prefer editorial width below) |
| `--fibrenet-editorial-width` | `60%` | Article body, Page body — left-aligned on desktop |
| `--page-width-full` | `100%` | Hero sections, announcement bar |

### Outer Content Padding
| Context | Desktop | Mobile (≤749px) |
|---|---|---|
| Standard sections | `0 40px` | `0 16px` |
| Hero / full-bleed | `0` | `0` |
| Product / Collection grids | `0 40px` | `0 12px` |
| Article / Page body | `0 40px` | `0 20px` |

---

## 2. Grid & Alignment Tokens

### Column Grids
| Layout | Columns | Gap (Desktop) | Gap (Mobile) |
|---|---|---|---|
| Product collection grid | 4 col | `24px` | n/a → horizontal slider |
| Most Popular / You may also like | 5 col (equal width) | `24px` | horizontal scroll |
| Blog Knowledge Centre | 3 col | `24px` | 1 col stacked |
| Collection subcategory | 5 col icon+label | `16px` | horizontal scroll |
| Footer columns | 2 col (33% / 55%) | `80px` | 1 col stacked |
| Header utility bar | flex row, space-between | `16px` | hidden → hamburger |

### Spacing Scale
| Token | Value | Usage |
|---|---|---|
| `--spacing-xs` | `4px` | Inline label gaps |
| `--spacing-sm` | `8px` | Icon-to-text gaps, tag padding |
| `--spacing-md` | `16px` | Section element separation |
| `--spacing-lg` | `24px` | Grid gaps, card internal padding |
| `--spacing-xl` | `40px` | Section vertical rhythm |
| `--spacing-2xl` | `48px` | Head/tag bar to page H1 (`--fibrenet-head-to-title-gap`) |
| `--spacing-3xl` | `80px` | Major section separation |

### Flexbox Alignment Norms
- Header: `display:flex; align-items:center; justify-content:space-between`
- Navigation row: `display:flex; align-items:center; flex-wrap:wrap; gap:0` — wraps to second line on narrow viewports before hamburger breakpoint
- CTA button group (Chat/Call/Email): `display:flex; gap:8px; align-items:center`
- Product option selectors: `display:flex; flex-wrap:wrap; gap:8px`
- Footer: `display:grid; grid-template-columns:1fr 2fr; gap:80px`

---

## 3. Viewport Transitions

### Breakpoints
| Name | Value | Trigger |
|---|---|---|
| `--mobile` | `749px` | Horizon native mobile breakpoint |
| `--tablet` | `990px` | Mid-range layout adjustments |

### Collapse Behaviours at ≤749px

| Desktop Component | Mobile Treatment |
|---|---|
| 4-col product grid | Horizontal scroll slider (use Horizon `overflow-list` component) |
| 5-col icon category row | Horizontal scroll slider (same `overflow-list`) |
| 5-col Most Popular / related products | Horizontal scroll slider |
| 3-col Blog grid | Single column stacked cards |
| Header nav (multi-line links) | Hidden; replaced by hamburger → Horizon slide-out drawer |
| Header CTA buttons (Chat/Call/Email) | Hidden in header; only shown on product pages |
| Footer 2-col grid | Single column; stacked vertically with `gap:32px` |
| Article category tab bar | Horizontal scroll, no scrollbar, touch-draggable |

### Slider Implementation Rule
All horizontal sliders on mobile MUST use Horizon's native `overflow-list` CSS class and component rather than custom scroll CSS. This ensures native momentum scrolling, snap points, and accessibility compliance without duplicating Horizon's built-in overflow logic from `overflow-list.css`.

---

## 4. Color System

### Brand Primaries (map to Horizon CSS custom properties)
| Role | Hex | Horizon Variable |
|---|---|---|
| Brand Navy (header bg, footer bg) | `#0D1B4B` (approx) | `--color-background-primary` on dark surface |
| Brand Blue (announcement bar) | `#0038FF` (approx) | `--color-accent-1` |
| Interactive Orange (Chat CTA) | `#F56A00` (approx) | `--color-button-primary-background` |
| Interactive Purple-Blue (Call CTA) | `#4B6BFF` (approx) | `--color-button-secondary-background` |
| Body background | `#EEF1F7` (approx) | `--color-background-2` |
| Content heading blue | `#1D3A8A` (approx) | `--color-foreground-accent` |
| Highlight orange (section headings) | `#F56A00` | `--color-accent-2` |

> All color tokens must be set in `brand.css` via the Horizon theme editor schema. Do not hardcode hex values in component CSS files.

---

## 5. Typography

| Role | Size | Weight | Horizon Token |
|---|---|---|---|
| H1 Hero | `clamp(32px, 4vw, 52px)` | 400 (light) | `--font-heading-scale` |
| H1 Page/Article | `28px` | 500 | |
| H2 Section | `22px` | 500 | |
| Body | `15px` | 400 | `--font-body-scale` |
| Nav links | `14px` | 400 | |
| Price primary | `18px` | 500 | |
| Product tag/label | `12px` | 400 uppercase | |
| CTA button text | `14px` | 500 | |

---

## 6. Component Tokens

### CTA Capsule Buttons (Chat / Call / Email)
- Border radius: `999px` (pill shape)
- Padding: `8px 20px`
- Height: `36px`
- Font: `14px / 500`
- Chat: filled orange (`--color-button-primary-background`)
- Call: filled purple-blue (`--color-button-secondary-background`)
- Email: outlined, transparent bg, white border + text (inverted context: white bg with dark border on light pages)
- Sub-label text (product page only): `11px`, `0.85` opacity, displayed as a second line below main label

### Announcement Bar
- Full width, sticky top
- Height: `36px`
- Background: brand blue
- Text: white, centered, `13px`

### Product Card
- No border, light background
- Image ratio: `1:1` square
- Title: 2 lines max, `14px`
- Price: `14px / 500`
- No hover overlay — image stays static; no add-to-cart on hover

### Compatibility Pill Tags (Product page)
- Border: `1px solid --color-border`
- Radius: `999px`
- Padding: `4px 12px`
- Size: `13px`
- Selected state: border `2px solid --color-foreground-accent`

---

## 7. Architecture Rules

1. **Always extend Horizon's `base.css` layout primitives** — never write a `display:flex` wrapper when a `page-width` container class already exists.
2. **Never override `overflow-list.css`** — use its classes directly for horizontal scroll containers.
3. **All color and type tokens live in `brand.css`** — no inline hex or font-size values in section/component Liquid or CSS files.
4. **Section schema settings must control:** CTA button URLs, CTA button labels, sub-label text, enable/disable toggles for each CTA button individually.
5. **Mobile nav must not touch Horizon's `predictive-search.js` or `header-drawer.js`** — only extend, never replace.