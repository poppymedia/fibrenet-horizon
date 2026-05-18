# Fibrenet Horizon Customizations

## Overview
This document catalogs all customizations made to the Horizon theme for the Fibrenet project.

## Contact System

### Files Added/Modified

#### 1. Header Contact Block
**File:** `blocks/_header-contact.liquid`
**Purpose:** Specialized contact block for header placement
**Key Features:**
- Position control (left, center, right)
- Row control (top, bottom)
- Uses product-contact snippet for rendering

#### 2. General Contact Block
**File:** `blocks/contact.liquid`
**Purpose:** General contact block for product pages and other sections
**Key Features:**
- Full contact button configuration
- Color scheme controls
- Position settings for header usage

#### 3. Contact Snippet
**File:** `snippets/product-contact.liquid`
**Purpose:** Renders contact buttons with chat, call, and email options
**Key Features:**
- Three contact methods (chat, call, email)
- Individual color schemes for each button
- Subtext support for chat button
- Responsive design

#### 4. Contact Wrapper
**File:** `snippets/contact.liquid`
**Purpose:** Wrapper snippet for contact functionality
**Usage:** Used by both header and general contact blocks

### Integration Points

#### Header Integration
The contact system integrates with the header through:

1. **Detection Logic** (`sections/header.liquid` lines 8-14):
```liquid
# Add contact block from section blocks
for block in section.blocks
  if block.type contains 'contact'
    assign order = order | append: ',contact'
    break
  endif
endfor
```

2. **Rendering Logic** (`snippets/header-row.liquid` lines 73-75):
```liquid
{% when 'contact' %}
  {% render 'product-contact', settings: section.blocks.header-contact.settings %}
```

#### Product Page Integration
Contact blocks can be added to product pages through the theme editor:
- Template > Product information > Details > Header
- Uses the general `contact.liquid` block

## Custom Assets

### Brand Styling
**File:** `assets/brand.css`
**Purpose:** Custom brand-specific styling
**Usage:** Loaded in theme layout

### Logo
**File:** `assets/logo.svg`
**Purpose:** Custom Fibrenet logo (animated droplet mark + wordmark)
**Usage:** Inlined in `blocks/_header-logo.liquid` via `inline_asset_content` when no theme logo image is set — required so `assets/brand.css` can animate `.drop` groups (`--ax` / `--ay` pivot vars on each group). Do not use `<img src="logo.svg">` for the default logo; external CSS cannot reach SVG internals.
**Animation:** Pulse keyframes in `brand.css` (`.header-logo__svg .drop.large` / `.small`); disabled under `prefers-reduced-motion: reduce`.

### Custom Fonts
**Files:** 
- `assets/FuturaMedium.ttf`
- `assets/FuturaMedium.woff`
- `assets/FuturaMedium.woff2`
- `assets/FuturaRegular.ttf`
- `assets/FuturaRegular.woff`
- `assets/FuturaRegular.woff2`

**Purpose:** Custom Futura font family for brand consistency

## Configuration Changes

### Header Group Configuration
**File:** `sections/header-group.json`
**Status:** Auto-generated
**Current Configuration:**
- Contact block positioned in header
- Position: right
- Row: top

### Theme Settings
**File:** `config/settings_data.json`
**Changes:** May contain custom settings for contact blocks

## Schema Additions

### Header Contact Schema
Added to `sections/header.liquid`:
```json
{
  "type": "header",
  "content": "t:content.contact_buttons"
},
{
  "type": "select",
  "id": "contact_position",
  "label": "t:settings.position",
  "options": [
    {"value": "left", "label": "t:options.left"},
    {"value": "center", "label": "t:options.center"},
    {"value": "right", "label": "t:options.right"}
  ],
  "default": "right"
},
{
  "type": "select",
  "id": "contact_row",
  "label": "t:settings.row",
  "options": [
    {"value": "top", "label": "t:options.top"},
    {"value": "bottom", "label": "t:options.bottom"}
  ],
  "default": "top"
}
```

## Dependencies

### Internal Dependencies
- Contact blocks depend on the product-contact snippet
- Header contact depends on header-row snippet
- All contact functionality depends on custom CSS

### External Dependencies
- Shopify's Liquid templating system
- Horizon's header component system
- Custom font loading

## Testing Checklist

### Header Contact
- [ ] Contact buttons appear in header
- [ ] Position settings work correctly
- [ ] Row settings work correctly
- [ ] Color schemes apply properly
- [ ] Links function correctly

### Product Page Contact
- [ ] Contact block can be added to product pages
- [ ] All three contact methods work
- [ ] Styling is consistent
- [ ] Responsive design works

### General Functionality
- [ ] No JavaScript errors
- [ ] No broken links
- [ ] Custom fonts load correctly
- [ ] Brand styling applies
- [ ] Mobile responsiveness

## Legacy donor theme → Horizon `settings_data.json`

When migrating flat legacy colour keys from another theme into Horizon, paste donor JSON locally as reference only (`settings_data_donor.json`). Do **not** replace Horizon `settings_data.json` wholesale — map semantics into Horizon tokens (`color_schemes.*`, fonts, etc.). Keeping `presets.Default.color_schemes` identical to `current.color_schemes` avoids mismatched defaults after edits.

**Initial Fibrenet mapping applied:**

| Donor idea | Horizon target |
|------------|----------------|
| `color_body_bg` `#E9F0FE` | Main surfaces (`scheme-1`) |
| `color_button`, drawers `#FF6610` | Primary buttons + accents across schemes |
| `color_header` / `color_footer` `#0D0D52` | `scheme-5` (footer group defaults here) |
| `color_announcement` `#525BFF` | `scheme-4` — assign announcement sections if desired |
| `color_drawer_*`, white cart UI | `scheme-2` |
| `color_savings_text` `#ff4e4e` | Sale badges → repurposed UUID scheme + `badge_sale_color_scheme` |
| Logo PNG URLs | Theme `logo` / `logo_inverse`; favicon asset URL |
| `type_*_font_family` Futura | `type_heading_font` `futura_n6`, `type_body_font` `futura_n3`, `type_subheading_font` `futura_n4` |
| Square buttons | `button_border_radius_*` = `0`, `variant_button_radius` = `0` |

Donor checkout branding (`checkout_*`) belongs under **Shopify Admin → Settings → Checkout**, not Horizon theme JSON.

## Store-wide design system (`assets/brand.css` + `snippets/fibrenet-fonts.liquid`)

- **Font:** DM Sans via Google Fonts (`fibrenet-fonts.liquid` in `layout/theme.liquid`). Removed legacy Futura `* { !important }` overrides.
- **Brand tokens:** `--fibrenet-brand-purple` `#525BFF` (H1, labels), `--fibrenet-brand-orange` `#FF6610` (primary CTAs / add to cart), `--fibrenet-brand-blue` `#111EFA` (Call / secondary CTAs), `--fibrenet-radius-pill` `2em`.
- **Theme settings:** `button_border_radius_primary/secondary` and `variant_button_radius` set to `100` in `config/settings_data.json` for pill shapes (Horizon `--style-border-radius-*` + `--variant-picker-button-radius`).
- **CTAs:** Header and product use `snippets/cta-button.liquid` + `.button--pill` (14px / 500, sub-label 11px on product). `snippets/header-cta-buttons.liquid` falls back to `#` for chat, `tel:` from `shop.phone` for call, and `mailto:` from `shop.email` for email when URLs are blank — all three buttons render when enabled.
- **Variant labels:** `.variant-picker legend` — purple, bold (700).

After pulling Futura values into JSON, confirm fonts resolve in the theme editor (slugs must exist on the shop).

## Fibrenet three-zone header (Horizon)

- **Zone 1:** `sections/header-announcements.liquid` — full-width, `scheme-4`, announcement copy in block/section settings.
- **Zone 2:** `header--fibrenet` utility row (`header__row--utility`) — desktop order (left→right): cart, account (`cart_first` in `header-actions.liquid`), country/currency, phone (`fibrenet_order_top`: `actions,localization,phone`); hidden on mobile (`≤749px`).
- **Zone 3:** `header__row--main` — logo (left), `header__menu` (center, `flex-wrap`), search + `snippets/header-cta-buttons.liquid` (right). CTAs use `snippets/cta-button.liquid` with `show_sub_label: false` in header.
- **Desktop nav dropdown:** When `enable_fibrenet_header` is true, `snippets/header-menu.liquid` renders `snippets/fibrenet-header-submenu.liquid` (simple vertical list) instead of the Horizon mega menu. Parent items with children show `icon-caret.svg` via `.menu-list__link-caret`. Styles in `brand.css` (`.menu-list__submenu--fibrenet`, `.fibrenet-submenu__link`) — light panel under the parent link, not full-width; **no fade/height animation** (`data-menu-mode="fibrenet"` on `<header-menu>`, `--submenu-animation-speed: 0`, instant visibility in CSS, `header-menu.js` uses 0ms deactivate delay and skips `data-animating`). Set header menu block **Media type** to **None** (`menu_style: text`) in `header-group.json`.
- **Mobile:** utility row shows `header__mobile-cluster` — logo left; account, cart, and hamburger on the right with equal `gap` (`header-row.liquid`). Search is **not** in the header on mobile (rendered in the drawer toolbar when `show_search` is on). Main row hidden; CTAs hidden.
- **Mobile drawer:** opens from the **right** (`.menu-drawer--fibrenet` `translateX(100%)`). `snippets/fibrenet-drawer-toolbar.liquid` — round icon buttons (country flag with circular clip like desktop, phone, search, close). Country panel anchors `right: 0`. Accordions forced on (`drawer_accordion: true`) with down chevron (`snippets/fibrenet-drawer-menu-caret.liquid`) and dividers (`drawer_dividers: true`). No drawer/accordion fade animations under `.menu-drawer--fibrenet`. Styles in `brand.css`.
- **Typography tokens:** `--fibrenet-body-font-size: 0.9375rem` (15px) for nav, menus, modals, cookie copy; `--fibrenet-button-font-size: 0.875rem` (14px) for buttons. Drawer toolbar round buttons: `--fibrenet-toolbar-icon-btn-size: 1.925rem` (~30% smaller than 2.75rem; icon size unchanged).
- **Cookie banner:** `#shopify-pc__banner` — padding tracks `--fibrenet-content-padding-inline` minus 2px (with `spacing-sm` block); accept/decline share one row; `#shopify-pc__banner__btn-manage-prefs` full width below.
- **Mobile content inset:** `--fibrenet-content-padding-inline: 10px`, `--fibrenet-content-padding-block-end: 16px` on articles/pages; KC blog listing uses `--page-margin: 10px`. Header action cluster gap `var(--spacing-sm)`. Drawer submenu (`.menu-drawer__menu-item--child` only) uses halved block padding and `--fibrenet-drawer-nested-indent: var(--spacing-sm)`.
- Toggle: section setting `enable_fibrenet_header` (default true). Preset config in `sections/header-group.json`.
- Styles: `assets/brand.css` only (tokens + `.button--pill`); do not override `header-drawer.js` / `predictive-search.js`.

## Fibrenet Knowledge Centre (`templates/blog.json`)

- Uses `main-blog` with `layout_style: knowledge_centre` (editorial layout unchanged for other blogs).
- Tag sub-nav: `snippets/blog-tag-filter.liquid` — full-bleed white bar (no `section--page-width`; no horizontal padding on bar/scroll host). `overflow-list` scrolls edge-to-edge; `::part(list)` uses `padding-inline: var(--page-margin)` so tabs align with page content at rest but can scroll flush to device edges. Tighter block/tab padding and tab gap on mobile via `--blog-tag-filter-*` tokens in `brand.css`. Rendered on KC blog index and articles (`show_blog_tag_nav` / `show_tag_filters`).
- Cards: `_blog-post-card` with `card_style: knowledge_centre` — full-card link, 4:3 image, title + comma-separated tags. Styles in `brand.css` under `.blog-posts--knowledge-centre`.
- Pagination: `pagination-controls` snippet (9 articles per page). No `blog-posts-list` JS in KC mode.
- Richtext headings: no `class` attributes on HTML in JSON settings (Shopify rejects them on upload).

### Knowledge Centre article (`templates/article.json`)

- `main-blog-post` with `layout_style: knowledge_centre` — centred 60% editorial column on desktop (`.fibrenet-article__inner`, text left-aligned). Pages use the same via `main-page` + `.fibrenet-editorial__inner`.
- Title: native `blog-post-title` text block via `content_for` (same as KC blog index — `type_preset: rte`, `<h1>{{ article.title }}</h1>`). Section uses `blog-posts--knowledge-centre` so `.text-block h1` styles apply. Tag line is a simple `<p class="fibrenet-article__tags">` after the block.
- Hero + body: featured image 3:2; first `<p>` split to `.fibrenet-article__lead`, then metafields snippet, then `.fibrenet-article__content.rte`.
- Highlight lines: `class="article-highlight"` in the article HTML editor (allowed in article body; not in theme JSON richtext).
- Footer nav: `snippets/fibrenet-article-navigation.liquid` — history back + `button--pill button--primary` to `blog.url`.
- Styles: `assets/brand.css` (`.fibrenet-article*`, `.article-highlight` color/weight only).
- **Pitfall:** Horizon allows only one `{% content_for 'blocks' %}` per section file — never duplicate it inside `if`/`else` layout branches; place a single call after the branch closes.
- **Page head H1:** Unified in `brand.css` via `--fibrenet-head-to-title-gap` (`--spacing-2xl` / 56px desktop, 32px mobile). Gap is `margin-block-start` on the `h1` with `!important` — Horizon `base.css` sets `.text-block > *:first-child { margin-block-start: 0 }`, so section/block padding alone does not add space above the title. Keep title text blocks at `padding-block-start: 0`. Page/collection/product: gap from header; blog/article: gap from tag bar. Homepage exempt.

## Fibrenet alternate product templates

Five assignable templates share `product-information` + Fibrenet blocks; section settings set behaviour:

| Template | `fibrenet_title_mode` | `fibrenet_stock_protect` |
|----------|----------------------|---------------------------|
| `product.aocdac.json` | `aocdac` | `true` |
| `product.cables.json` | `cables` | `false` |
| `product.compatibles.json` | `public_sku` | `false` |
| `product.cwdm.json` | `cwdm` | `false` |
| `product.dwdm.json` | `public_sku` | `false` |

- **Title:** `blocks/_fibrenet-product-title.liquid` + `assets/fibrenet-product-title.js` — on Fibrenet product pages (`product-information--fibrenet`), **`assets/variant-picker.js`** re-renders the whole `product-information` section via `sectionRenderer.renderSection()` (Section Rendering API + `morphSection`), so the H1 updates from Liquid like other section blocks. `fibrenet-product-title.js` listens on `document` (survives morph) and prefers copying `.fibrenet-product-title__heading` from `event.detail.data.html`; falls back to variant JSON. Non-Fibrenet product pages still morph only `variant-picker`. Title Liquid must live in the block file (not a rendered snippet) because `{% render %}` does not expose snippet assigns to the parent.
- **Stock:** `blocks/_fibrenet-product-stock.liquid` + `snippets/fibrenet-product-stock-helpers.liquid` + `assets/fibrenet-product-stock.js` — replaces `product-inventory` on all product templates; lead-time from `custom.lead_time.value.entries`.
- **Locales:** `products.product.in_stock_label`, `stock_label_fibrenet_html`, `sold_out_fibrenet_html`, `lead_time_label`, `download_datasheet`, `no_download_datasheet`, and `spec_*` row labels in `locales/en.default.json`.
- **Type scale:** `--fibrenet-type-min-size` (`0.875rem` / 14px) — minimum for `.paragraph`, `.rte`, and spec table; variant option labels use `--fibrenet-button-font-size` (14px); body copy remains `--fibrenet-body-font-size` (15px).
- **Specs:** `blocks/_fibrenet-product-specs.liquid` + `snippets/fibrenet-spec-row.liquid` + `snippets/fibrenet-product-spec-datasheet.liquid` — rows from `spec.*` metafields (only when populated), `data.public_sku`, datasheet from `spec.datasheet_pdf` (link if PDF URL, else `no_download_datasheet` text). **Datasheet fallback:** when description has no `.pdf` link and contains heading `FN SKU`, CDN URL `https://cdn.shopify.com/s/files/1/0263/6110/2422/files/{sku}.pdf`.
- **Not implemented:** linked-product variant UI (`custom.variants_from_another_product`) — not needed; Horizon `option_values` + section renderer handles large catalogs.

## Fibrenet product page (`templates/product.json`)

- **Layout:** `product-information` with `layout_style: fibrenet` → class `product-information--fibrenet`. Uses `equal_columns: true` with `desktop_media_width` (default **40**%, details **60**%) via `--product-media-width` on `product-information__grid--half`. `gap: 48`, `sticky_details_desktop: false`. Media: carousel + dots, `aspect_ratio: 1` (square), `zoom: false`.
- **Blocks (in `_product-details`):** `_fibrenet-product-subtitle`, `_fibrenet-product-contact` (`header-cta-buttons` with `product_layout: true` — chat on top with `cta-btn--split` label | divider | 15px subtext; call + email equal width below; max-width `25rem` / ~400px centred), `_fibrenet-product-compatibility`, native **`variant-picker`**, `_fibrenet-product-quantity-label`, `buy-buttons` / `quantity-input`, `_fibrenet-product-specs`, `_fibrenet-product-share`.
- **Quantity selector:** `buy-buttons` sets `.product-form-buttons button { width: 100% }`, which breaks `quantity-minus` / `quantity-plus` (they use `button button-unstyled`). Fibrenet styles must exclude `.button-unstyled` from full-width CTA rules and reset +/- to `var(--minimum-touch-target)`.
- **Tag pills:** `.button--tag` / `.button--tag--selected` in `brand.css` only.
- **Variant pills (production):** Wrapping flex row, `justify-content: center`. Compact padding; `border-radius: calc(var(--fibrenet-radius-pill) * 0.7)`. Text `nowrap` on desktop, wraps on mobile. Transparent fill; default `1px var(--color-border)`; selected `var(--fibrenet-variant-selected-border-width)` (2px) `var(--color-selected-variant-border)` on the label only (Horizon `::before` border disabled on selected to avoid double stroke). Border colour uses `--fibrenet-scheme-5-background` from color scheme 5 in theme editor (`snippets/color-schemes.liquid`).
- **Below fold:** `product-recommendations` (5 cols, mobile carousel), `recently-viewed-products` section + `recently-viewed-products-section.js` (uses `@theme/recently-viewed-products` + search API). Back-to-collection button lives at the bottom of `recently-viewed-products` (`show_back_to_collection` setting) — do not use a separate section (Shopify section schema cannot set block `id` in the section file).
- **H1 on product:** Same brand tokens as blog/page (`1.75rem`, brand blue, `--fibrenet-head-to-title-gap`); centred in the product column only. Requires `template-{{ template.name }}` on `<body>` in `layout/theme.liquid` — Horizon omits this by default, so `body.template-product` selectors do not work without it.
- **Pitfall:** Do not add `class` attributes inside richtext JSON; style list headings via `.product-recommendations .text-block h2` selectors.

## Fibrenet homepage (`templates/index.json`)

- **Hero:** `sections/fibrenet-slideshow.liquid` + `blocks/fibrenet-slide.liquid` — wraps Horizon `slideshow-component`, `slideshow.js`, native dots/arrows. Section outputs `--slideshow-height-desktop` / `--slideshow-height-mobile` on the wrapper. `{% javascript %}` pauses autoplay when `prefers-reduced-motion: reduce`.
- **Partner bar:** `sections/partner-bar.liquid` — `overflow-list` (disabled, all logos visible); mobile horizontal scroll via `brand.css` on the `overflow-list` host. Logos: `filter: brightness(0) invert(1)`, height token `--fibrenet-partner-logo-height`.
- **Category navigator:** `sections/category-navigator.liquid` + `snippets/category-navigator-item.liquid` — 8-col CSS grid desktop (`hidden--mobile`); mobile `overflow-list` slider (`hidden--desktop`).
- **Most Popular:** native `product-list` section — 5 columns, `carousel_on_mobile: true`, square product images, heading via `_product-list-text` HTML class `fibrenet-most-popular__heading`.
- **Styles:** `assets/brand.css` only (spacing tokens, section typography). No custom carousel JS.

## Fibrenet footer

- Section: `sections/fibrenet-footer.liquid` (replaces default `footer` + `footer-utilities` in `sections/footer-group.json`).
- **Columns (desktop):** Three columns with configurable widths (defaults 20% / 32% / 25%): Further details (`link_list` menu), custom column (heading, richtext, image — empty by default), newsletter (heading + richtext + form + LinkedIn). No per-link URL settings in schema.
- **Copyright:** Company name + `link_list` menu for legal links (not individual terms/privacy URL fields).
- **Layout width:** `content_width` setting (`standard` / `wide` 1400px / `full`) on `.fibrenet-footer__inner`.
- Newsletter: `snippets/fibrenet-footer-newsletter.liquid` uses `{% form 'customer' %}`, `<email-signup-block>`, and `assets/email-signup.js`. Layout is a single flex row (underline border, no boxed input): placeholder text and outline envelope submit icon share one baseline. All styles live in `assets/brand.css` under `.fibrenet-footer__newsletter` (do not rely on `blocks/email-signup.liquid` stylesheet, which only loads when that block is on the page).
- Payment icons: `shop.enabled_payment_types` + `payment_type_svg_tag`; gap `--spacing-md` (16px).
- Headings: 14px / 500, `--color-accent-heading` (brand purple). Body links 14px / 400.
- Color scheme: `scheme-5` (navy). Assign Shopify menus for **Further details** and **Legal links** in the theme editor after schema change (old per-link settings are removed).

## Maintenance Notes

### Files to Monitor During Updates
- `sections/header.liquid` - Header logic changes
- `snippets/header-row.liquid` - Header layout changes
- Any new header-related blocks or snippets

### Potential Breaking Changes
- Changes to header block detection logic
- Changes to header positioning system
- Updates to header schema structure
- Changes to snippet rendering system

### Backup Strategy
- Always backup before updates
- Test updates in development environment
- Keep custom files in version control
- Document any changes to core files
