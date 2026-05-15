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
**Purpose:** Custom Fibrenet logo
**Usage:** Replaces default Horizon logo

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

After pulling Futura values into JSON, confirm fonts resolve in the theme editor (slugs must exist on the shop).

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
