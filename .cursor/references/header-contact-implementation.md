# Header Contact Block Implementation

## Overview
This document details the hardcoded contact block implementation in the header section, following the same pattern as the Logo and Menu blocks.

## Changes Made

### 1. Modified `sections/header.liquid`

#### Order Logic (Lines 1-6)
**Before:**
```liquid
assign order = 'logo,menu,localization,search,mobile_search,actions'

if shop.customer_accounts_enabled
  assign order = 'mobile_search,logo,menu,localization,search,actions'
endif

# Add contact block from section blocks
for block in section.blocks
  if block.type contains 'contact'
    assign order = order | append: ',contact'
    break
  endif
endfor
```

**After:**
```liquid
assign order = 'logo,menu,contact,localization,search,mobile_search,actions'

if shop.customer_accounts_enabled
  assign order = 'mobile_search,logo,menu,contact,localization,search,actions'
endif
```

#### Contact Capture (Lines 56-58)
**Added:**
```liquid
capture contact
  render 'product-contact', settings: section.settings
endcapture
```

#### Header Row Render (Lines 245)
**Added contact parameter:**
```liquid
{% render 'header-row',
  row: row,
  order: order,
  settings: section.settings,
  first: first,
  logo: logo,
  menu: menu,
  contact: contact,  # Added this line
  actions: actions,
  localization: localization_markup,
  search: search,
  mobile_search: mobile_search
%}
```

#### Schema Settings (Lines 727-786)
**Added contact button settings:**
```json
{
  "type": "header",
  "content": "Contact Buttons"
},
{
  "type": "text",
  "id": "chat_text",
  "label": "Chat Text",
  "default": "Chat"
},
{
  "type": "text",
  "id": "chat_subtext",
  "label": "Chat Subtext"
},
{
  "type": "url",
  "id": "chat_link",
  "label": "Chat Link URL"
},
{
  "type": "color_scheme",
  "id": "chat_color_scheme",
  "label": "Chat Colour Scheme",
  "default": "scheme-3"
},
{
  "type": "text",
  "id": "call_text",
  "label": "Call Text",
  "default": "Call"
},
{
  "type": "url",
  "id": "call_link",
  "label": "Call Link URL"
},
{
  "type": "color_scheme",
  "id": "call_color_scheme",
  "label": "Call Colour Scheme",
  "default": "scheme-4"
},
{
  "type": "text",
  "id": "email_text",
  "label": "Email Text",
  "default": "Email"
},
{
  "type": "url",
  "id": "email_link",
  "label": "Email Link URL"
},
{
  "type": "color_scheme",
  "id": "email_color_scheme",
  "label": "Email Colour Scheme",
  "default": "scheme-5"
}
```

### 2. Modified `snippets/header-row.liquid`

#### Contact Case (Line 74)
**Before:**
```liquid
{% when 'contact' %}
  {% render 'product-contact', settings: section.blocks.header-contact.settings %}
```

**After:**
```liquid
{% when 'contact' %}
  {{ contact }}
```

### 3. Modified `snippets/product-contact.liquid`

#### Settings Reference
**Before:**
```liquid
{{ block.settings.chat_link }}
{{ block.settings.chat_color_scheme }}
{{ block.settings.chat_text }}
```

**After:**
```liquid
{{ settings.chat_link }}
{{ settings.chat_color_scheme }}
{{ settings.chat_text }}
```

## How It Works

### 1. Header Order
The contact block is now hardcoded in the header order between menu and localization, similar to how logo and menu are positioned.

### 2. Contact Capture
The contact content is captured using the same pattern as logo and menu, rendering the product-contact snippet with section settings.

### 3. Header Row Rendering
The contact variable is passed to the header-row snippet and rendered in the appropriate column based on the contact_position setting.

### 4. Settings Integration
Contact button settings are now part of the header section settings, accessible through the theme customizer.

## Configuration

### Header Settings
In the theme customizer, under Header > Header, you'll now see:

1. **Contact Position**: Left, Center, or Right
2. **Contact Row**: Top or Bottom
3. **Contact Buttons**: Individual settings for Chat, Call, and Email buttons

### Contact Button Settings
Each contact button has:
- Text label
- Link URL
- Color scheme
- Subtext (for chat button)

## Benefits

### 1. Minimal Core Changes
- Only 3 files modified
- Follows existing patterns
- Easy to maintain during updates

### 2. Consistent with Horizon Architecture
- Uses same hardcoded approach as Logo and Menu
- Integrates with existing positioning system
- Leverages existing color scheme system

### 3. User-Friendly
- Settings accessible through theme customizer
- No need for complex block management
- Clear separation of concerns

## Update Compatibility

### Files to Monitor During Horizon Updates
- `sections/header.liquid` - Main header logic
- `snippets/header-row.liquid` - Header row rendering
- `snippets/product-contact.liquid` - Contact button rendering

### Potential Conflicts
- Changes to header order logic
- Changes to header row rendering
- Updates to section schema structure

### Merge Strategy
1. Keep our contact-related changes
2. Merge any new header functionality
3. Test contact positioning and rendering
4. Verify settings are preserved

## Testing Checklist

### Header Functionality
- [ ] Contact buttons appear in header
- [ ] Contact position settings work (left/center/right)
- [ ] Contact row settings work (top/bottom)
- [ ] Contact buttons are properly styled
- [ ] Contact links function correctly

### Theme Customizer
- [ ] Contact settings are visible
- [ ] Contact settings can be modified
- [ ] Changes are reflected on frontend
- [ ] Color schemes apply correctly

### Responsive Design
- [ ] Contact buttons work on mobile
- [ ] Contact buttons work on tablet
- [ ] Contact buttons work on desktop
- [ ] Contact buttons don't break header layout

## Rollback Plan

If issues arise, revert these specific changes:

```bash
# Revert header.liquid changes
git checkout HEAD~1 -- sections/header.liquid

# Revert header-row.liquid changes  
git checkout HEAD~1 -- snippets/header-row.liquid

# Revert product-contact.liquid changes
git checkout HEAD~1 -- snippets/product-contact.liquid
```
