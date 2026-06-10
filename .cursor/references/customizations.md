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
- **Brand tokens:** `--brand-accent` `#525BFF` (H1, labels), `--brand-cta-orange` / `--brand-cta-blue` (legacy refs; CTA pills use each scheme’s primary button settings via `.cta-btn-scheme`), `--brand-radius-pill` `2em`.
- **Heading line height (theme typography):** `snippets/theme-styles-variables.liquid` — `--line-height--display-*` and `--line-height--heading-*` tight / normal / loose map to **1 / 1.2 / 1.4** (H1–H6 theme settings use `display-tight|normal|loose`; block typography uses `heading-*` / `display-*` via `typography-style.liquid`). Body scale unchanged (`1.2 / 1.4 / 1.6`).
- **Theme settings:** `button_border_radius_primary/secondary` and `variant_button_radius` set to `100` in `config/settings_data.json` for pill shapes (Horizon `--style-border-radius-*` + `--variant-picker-button-radius`).
- **CTAs:** Header and product share `snippets/header-cta-buttons.liquid` → `snippets/cta-button.liquid` + `.button--pill`. **Colours (fill + text):** Theme settings → **Contact CTA buttons** (`fibrenet_cta_chat_color_scheme`, etc.) — same source for header and product. Each button uses `.cta-btn-scheme--{scheme}` (primary button tokens only from `snippets/color-schemes.liquid`; never `.color-{scheme}`). **Product borders:** optional per-button border overrides on `_fibrenet-product-contact` (`chat_border_color`, etc.) set inline `--color-primary-button-border` / `--color-primary-button-hover-border` on `.cta-btn-scheme`; blank = scheme default. Output colour settings with `{{ border_color }}` in the `style` attribute — do **not** build override CSS with `append` (Shopify Color drops do not stringify correctly via `append`). `.cta-btn-scheme .button--pill` maps those tokens to `border-color` (pills use physical `border`, not Horizon’s zero-width box-shadow border). Pill colours are scoped to `.cta-btn-scheme .button--pill` so the product section colour scheme does not leak in. `snippets/header-cta-buttons.liquid` falls back to `#` for chat, `tel:` from `shop.phone` for call, and `mailto:` from `shop.email` for email when URLs are blank.
- **Variant labels:** `.variant-picker legend` — purple, bold (700).
- **Pitfall:** Do not set `color: var(--brand-accent)` on `:is(.button, button) span` — it overrides scheme button text and header icon `currentColor` (CTAs, account, currency selector).
- **Variant pills:** Option name (`legend`) stays bold/accent; pill values are `<label class="variant-option__button-label">` — exclude from global `label { font-weight: bold }` via `:not(.variant-option__button-label)`.

After pulling Futura values into JSON, confirm fonts resolve in the theme editor (slugs must exist on the shop).

## Fibrenet three-zone header (Horizon)

- **Zone 1:** `sections/header-announcements.liquid` — full-width, `scheme-4`, announcement copy in block/section settings.
- **Zone 2:** `header--utility` utility row (`header__row--utility`) — desktop order (left→right): cart, account (`cart_first` in `header-actions.liquid`), country/currency, phone (`fibrenet_order_top`: `actions,localization,phone`); hidden on mobile (`≤749px`).
- **Zone 3:** `header__row--main` — logo (left), `header__menu` (center, `flex-wrap`), search + `snippets/header-cta-buttons.liquid` (right). CTAs use `snippets/cta-button.liquid` with `show_sub_label: false` in header.
- **Desktop nav dropdown:** When `enable_fibrenet_header` is true, `snippets/header-menu.liquid` renders `snippets/fibrenet-header-submenu.liquid` (simple vertical list) instead of the Horizon mega menu. Parent items with children show `icon-caret.svg` via `.menu-list__link-caret`. Styles in `brand.css` (`.menu-list__submenu--compact`, `.submenu__link`) — light panel under the parent link, not full-width; **no fade/height animation** (`data-menu-mode="fibrenet"` on `<header-menu>`, `--submenu-animation-speed: 0`, instant visibility in CSS, `header-menu.js` uses 0ms deactivate delay and skips `data-animating`). Set header menu block **Media type** to **None** (`menu_style: text`) in `header-group.json`.
- **Desktop “More” overflow:** `overflow-menu--compact` on `<overflow-list>` when Fibrenet header is on. Overrides Horizon’s full-width two-column overflow panel in `brand.css` — single compact panel (`::part(overflow)`), hidden until **More** is hovered (`display: none` by default; shown via `data-overflow-expanded`, `[slot='overflow'] [aria-expanded='true']`, or panel `:hover`). Vertical stack with child links always visible and indented when open (no accordion gaps; carets hidden). Same tokens as `.menu-list__submenu--compact`.
- **Mobile:** utility row shows `header__mobile-cluster` — logo left; account, cart, and hamburger on the right with equal `gap` (`header-row.liquid`). Search is **not** in the header on mobile (rendered in the drawer toolbar when `show_search` is on). Main row hidden; CTAs hidden.
- **Mobile drawer:** opens from the **right** (`.menu-drawer--end` `translateX(100%)`). `snippets/drawer-toolbar.liquid` — round icon buttons (country flag with circular clip like desktop, phone, search, close). Country panel anchors `right: 0`. Accordions forced on (`drawer_accordion: true`) with down chevron (`snippets/fibrenet-drawer-menu-caret.liquid`) and dividers (`drawer_dividers: true`). No drawer/accordion fade animations under `.menu-drawer--end`. Styles in `brand.css`.
- **Typography tokens:** `--brand-body-size: 0.9375rem` (15px) for nav, menus, modals, cookie copy; `--brand-button-size: 0.875rem` (14px) for buttons. Drawer toolbar round buttons: `--toolbar-icon-btn-size: 1.925rem` (~30% smaller than 2.75rem; icon size unchanged).
- **Cookie banner:** `#shopify-pc__banner.shopify-pc__banner__dialog` (same element — do not use a descendant selector) — padding tracks `var(--page-margin)` minus 2px; accept/decline share one row; `#shopify-pc__banner__btn-manage-prefs` full width below.
- **Mobile content inset:** `--content-padding-inline: 10px`, `--content-padding-block-end: var(--padding-lg)` on articles/pages; KC blog listing uses `--page-margin: 10px`. Header action cluster gap `var(--padding-xs)`. Drawer submenu (`.menu-drawer__menu-item--child` only) uses halved block padding and `--drawer-nested-indent: var(--padding-xs)`.
- **Horizon spacing tokens:** Prefer native `--page-margin`, `--padding-*`, `--margin-*` over legacy `--spacing-*`. Brand aliases: `--content-padding-inline: var(--page-margin)`, `--head-to-title-gap: 3.5rem` (mobile `var(--padding-4xl)`), `--variant-btn-radius: calc(var(--brand-radius-pill) * 0.7)`.
- **CSS class naming:** Custom layout classes drop the `fibrenet-` prefix (e.g. `product-information--split`, `header--utility`, `editorial`, `hero-slideshow`). Shopify block/section **filenames** stay `fibrenet-*` / `_fibrenet-*` — JSON `"type"` must match the liquid filename.
- Toggle: section setting `enable_fibrenet_header` (default true). Preset config in `sections/header-group.json`.
- Styles: `assets/brand.css` only (tokens + `.button--pill`); do not override `header-drawer.js` / `predictive-search.js`.

## Fibrenet Knowledge Centre (`templates/blog.json`)

- Uses `main-blog` with `layout_style: knowledge_centre` (editorial layout unchanged for other blogs).
- Tag sub-nav: `snippets/blog-tag-filter.liquid` — full-bleed white bar (no `section--page-width`; no horizontal padding on bar/scroll host). `overflow-list` scrolls edge-to-edge; `::part(list)` uses `padding-inline: var(--page-margin)` so tabs align with page content at rest but can scroll flush to device edges. Tighter block/tab padding and tab gap on mobile via `--blog-tag-filter-*` tokens in `brand.css`. Rendered on KC blog index and articles (`show_blog_tag_nav` / `show_tag_filters`).
- Cards: `_blog-post-card` with `card_style: knowledge_centre` — full-card link, 4:3 image, title + comma-separated tags. Styles in `brand.css` under `.blog-posts--knowledge-centre`.
- Pagination: `pagination-controls` snippet (9 articles per page). No `blog-posts-list` JS in KC mode.
- Richtext headings: no `class` attributes on HTML in JSON settings (Shopify rejects them on upload).

### Knowledge Centre article (`templates/article.json`)

- `main-blog-post` with `layout_style: knowledge_centre` — centred 60% editorial column on desktop (`.article-editorial__inner`, text left-aligned). Pages use the same via `main-page` + `.editorial__inner`.
- Title: native `blog-post-title` text block via `content_for` (same as KC blog index — `type_preset: rte`, `<h1>{{ article.title }}</h1>`). Section uses `blog-posts--knowledge-centre` so `.text-block h1` styles apply. Tag line is a simple `<p class="article-editorial__tags">` after the block.
- Hero + body: featured image 3:2; first `<p>` split to `.article-editorial__lead`, then metafields snippet, then `.article-editorial__content.rte`.
- Highlight lines: `class="article-highlight"` in the article HTML editor (allowed in article body; not in theme JSON richtext).
- Footer nav: `snippets/article-editorial-navigation.liquid` — history back + `button--pill button--primary` to `blog.url`.
- Styles: `assets/brand.css` (`.article-editorial*`, `.article-highlight` color/weight only).
- **Pitfall:** Horizon allows only one `{% content_for 'blocks' %}` per section file — never duplicate it inside `if`/`else` layout branches; place a single call after the branch closes.
- **Page head H1:** Single rule in `brand.css` via `--head-to-title-gap` (3.5rem desktop, `var(--padding-4xl)` mobile). Gap is `margin-block-start` on the `h1` (specificity beats `base.css` `.text-block > *:first-child`). Title text blocks reset `--padding-block-start: 0` (needs `!important` vs theme-editor inline spacing). Page/collection/product: gap from header; blog/article: gap from tag bar. Homepage exempt.

## Fibrenet alternate product templates

Five assignable templates share `product-information` + Fibrenet blocks; section settings set behaviour:

| Template | `fibrenet_title_mode` | `fibrenet_stock_protect` |
|----------|----------------------|---------------------------|
| `product.aocdac.json` | `aocdac` | `true` |
| `product.cables.json` | `cables` | `false` |
| `product.compatibles.json` | `public_sku` | `false` |
| `product.cwdm.json` | `cwdm` | `false` |
| `product.dwdm.json` | `public_sku` | `false` |

- **Title:** `blocks/_fibrenet-product-title.liquid` + `assets/fibrenet-product-title.js` — custom element `<product-title-split>`, classes `.product-title-split*`. On split product pages (`product-information--split`), **`assets/variant-picker.js`** re-renders the whole `product-information` section via `sectionRenderer.renderSection()` (Section Rendering API + `morphSection`), so the H1 updates from Liquid like other section blocks. `fibrenet-product-title.js` listens on `document` (survives morph) and prefers copying `.product-title-split__heading` from `event.detail.data.html`; falls back to variant JSON. Non-split product pages still morph only `variant-picker`. Title Liquid must live in the block file (not a rendered snippet) because `{% render %}` does not expose snippet assigns to the parent.
- **Stock:** `blocks/_fibrenet-product-stock.liquid` + `assets/fibrenet-product-stock.js` — replaces `product-inventory` on all product templates. Stock Liquid must live in the block (same `{% render %}` assign pitfall as title). `snippets/fibrenet-product-stock-helpers.liquid` is reference-only. Lead-time from `custom.lead_time.value.entries` overrides quantity. `fibrenet-product-stock.js` listens on `document`, prefers copying `[data-product-stock-text]` from `event.detail.data.html`, then falls back to per-variant JSON. `fibrenet_stock_protect: true` on `product.aocdac.json` re-enables add-to-cart when tracked qty &gt; 0.
- **Locales:** `products.product.in_stock_label`, `stock_label_fibrenet_html`, `sold_out_fibrenet_html`, `lead_time_label`, `download_datasheet`, `no_download_datasheet`, and `spec_*` row labels in `locales/en.default.json`.
- **Type scale:** `--brand-type-min` (`0.875rem` / 14px) — minimum for `.paragraph`, `.rte`, and spec table; variant option labels use `--brand-button-size` (14px); body copy remains `--brand-body-size` (15px).
- **Specs:** `blocks/_fibrenet-product-specs.liquid` (classes `.product-specs-table*`) + `snippets/fibrenet-spec-row.liquid` + `snippets/fibrenet-product-spec-datasheet.liquid` — rows from `spec.*` metafields (only when populated), `data.public_sku`, datasheet from `spec.datasheet_pdf` (link if PDF URL, else `no_download_datasheet` text). **Datasheet fallback:** when description has no `.pdf` link and contains heading `FN SKU`, CDN URL `https://cdn.shopify.com/s/files/1/0263/6110/2422/files/{sku}.pdf`.
- **Not implemented:** linked-product variant UI (`custom.variants_from_another_product`) — not needed; Horizon `option_values` + section renderer handles large catalogs.

## Fibrenet product page (`templates/product.json`)

- **Layout:** `product-information` with `layout_style: fibrenet` → class `product-information--split`. Uses `equal_columns: true` with `desktop_media_width` (default **40**%, details **60**%) via `--product-media-width` on `product-information__grid--half`. `gap: 48`, `sticky_details_desktop: false`. Media: carousel + dots, `aspect_ratio: 1` (square), `zoom: false`.
- **Blocks (in `_product-details`):** `_fibrenet-product-subtitle`, `_fibrenet-product-contact` (`header-cta-buttons` with `product_layout: true` — chat on top with `cta-btn--split`: flex row (heading `flex: 0 0 auto`, subtext `flex: 1`) with equal `--cta-split-gap` padding-inline on each text column — column widths vary, inset around content does not; override product `white-space: nowrap` on `.cta-btn--split` only; call + email equal width below; width capped on `.product-information--split .product-contact--stacked` via `--product-cta-max-width`, default `30rem`), `_fibrenet-product-compatibility`, native **`variant-picker`**, `_fibrenet-product-quantity-label`, `buy-buttons` / `quantity`, `_fibrenet-product-specs`, `_fibrenet-product-share`.
- **Quantity selector:** `buy-buttons` sets `.product-form-buttons button { width: 100% }`, which breaks `quantity-minus` / `quantity-plus` (they use `button button-unstyled`). Fibrenet styles in `brand.css` must exclude `.button-unstyled` from full-width CTA rules and reset +/- to `var(--minimum-touch-target)`.
- **Tag pills:** `.button--tag` / `.button--tag--selected` in `brand.css` only.
- **Variant pills (production):** Wrapping flex row, `justify-content: center`. Compact padding; `border-radius: calc(var(--brand-radius-pill) * 0.7)`. Text `nowrap` on desktop, wraps on mobile. Transparent fill; default `1px var(--color-border)`; selected `var(--variant-selected-border-width)` (2px) `var(--color-selected-variant-border)` on the label only (Horizon `::before` border disabled on selected to avoid double stroke). Border colour uses `--scheme-accent-background` from color scheme 5 in theme editor (`snippets/color-schemes.liquid`).
- **Below fold:** `product-recommendations` (5 cols, mobile carousel), `recently-viewed-products` section + `recently-viewed-products-section.js` (uses `@theme/recently-viewed-products` + search API). Back-to-collection button lives at the bottom of `recently-viewed-products` (`show_back_to_collection` setting) — do not use a separate section (Shopify section schema cannot set block `id` in the section file).
- **H1 on product:** Same unified H1 rule as blog/page (`--font-h1--*` with brand fallbacks, `--head-to-title-gap`); centred in the product column via `.product-information--split`. Composite title (`.product-title-split__heading` + child spans): one `line-height` on the H1 (`--font-h1--line-height`, fallback `1.2`); all parts use `line-height: inherit` so wrapped lines and suffix (`font-size: 90%`) share the same rhythm; flex column `gap: 0` (no extra em gap between leading/middle/suffix rows). No `body.template-*` scoping — use section/layout classes instead.
- **Pitfall:** Do not add `class` attributes inside richtext JSON; style list headings via `.product-recommendations .text-block h2` selectors.

## Fibrenet homepage (`templates/index.json`)

- **Hero:** `sections/fibrenet-slideshow.liquid` (class `hero-slideshow`) + `blocks/fibrenet-slide.liquid` (class `hero-slide`) — wraps Horizon `slideshow-component`, `slideshow.js`, native dots/arrows. Section outputs `--slideshow-height-desktop` / `--slideshow-height-mobile` on the wrapper. `{% javascript %}` pauses autoplay when `prefers-reduced-motion: reduce`.
- **Partner bar:** `sections/partner-bar.liquid` — `overflow-list` (disabled, all logos visible); mobile horizontal scroll via `brand.css` on the `overflow-list` host. Logos: `filter: brightness(0) invert(1)`, height token `--partner-logo-height`.
- **Category navigator:** `sections/category-navigator.liquid` + `snippets/category-navigator-item.liquid` — 8-col CSS grid desktop (`hidden--mobile`); mobile `overflow-list` slider (`hidden--desktop`). Section settings: **Label position** (`below` default / `above` via `category-navigator--labels-above` + `flex-direction: column-reverse` on `.category-navigator__link`); **Label font size** (11–18px, default 13) sets `--category-label-size` on the section wrapper (overrides `:root` `0.8125rem` default); **Image size** (80–200px, step 20, default 80) sets `--category-image-size` on the section wrapper and is passed to the snippet as `image_size` for `image_url` / `sizes` (not `block.settings` — setting is section-level).
- **Most Popular:** native `product-list` section — 5 columns, `carousel_on_mobile: true`, square product images, heading via `_product-list-text` HTML class `fibrenet-most-popular__heading`.
- **Styles:** `assets/brand.css` only (spacing tokens, section typography). No custom carousel JS.

## Fibrenet footer

- Section: `sections/fibrenet-footer.liquid` (classes `site-footer-ext`, `site-footer__*`; replaces default `footer` + `footer-utilities` in `sections/footer-group.json`).
- **Columns (desktop):** Three columns with configurable widths (defaults 20% / 32% / 25%): Further details (`link_list` menu), custom column (heading, richtext, image — empty by default), newsletter (heading + richtext + form + LinkedIn). No per-link URL settings in schema.
- **Copyright:** Company name + `link_list` menu for legal links (not individual terms/privacy URL fields).
- **Layout width:** `content_width` setting (`standard` / `wide` 1400px / `full`) on `.site-footer__inner`.
- Newsletter: `snippets/fibrenet-footer-newsletter.liquid` uses `{% form 'customer' %}`, `<email-signup-block>`, and `assets/email-signup.js`. Layout is a single flex row (underline border, no boxed input): placeholder text and outline envelope submit icon share one baseline. All styles live in `assets/brand.css` under `.site-footer__newsletter` (do not rely on `blocks/email-signup.liquid` stylesheet, which only loads when that block is on the page).
- Payment icons: `shop.enabled_payment_types` + `payment_type_svg_tag`; gap `var(--padding-md)`.
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
