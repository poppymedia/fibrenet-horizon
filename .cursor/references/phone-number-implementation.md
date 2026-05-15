# Phone Number Header Implementation

## Overview
This document details the phone number feature implementation in the header, providing dynamic phone number handling with flexible positioning and visibility controls.

## Features

### 1. Dynamic Phone Number
- **Store Phone Integration**: Automatically uses `shop.phone` as default
- **Custom Phone Number**: Option to override with custom phone number
- **Display Text**: Custom text display (defaults to phone number)
- **Click-to-Call**: Properly formatted tel: links

### 2. Positioning Controls
- **Left/Right Position**: Place phone before or after actions
- **Two-Row Support**: Phone can be positioned in top or bottom row
- **Flexible Ordering**: Integrates with existing header order system

### 3. Visibility Controls
- **Desktop/Mobile Toggle**: Independent control for desktop and mobile
- **Responsive Classes**: Automatic CSS classes for visibility
- **Icon Option**: Optional phone icon display

## Implementation Details

### Files Modified

#### 1. `sections/header.liquid`
- Added phone capture logic
- Enhanced header order with phone positioning
- Added phone to two-row system
- Added comprehensive phone settings to schema
- Added phone styling CSS

#### 2. `snippets/header-row.liquid`
- Added phone case to header row rendering

#### 3. `snippets/phone.liquid`
- Complete rewrite with dynamic content
- Visibility controls
- Icon support
- Proper tel: link formatting

## Settings Structure

### Phone Number Settings
```json
{
  "type": "checkbox",
  "id": "show_phone_number",
  "label": "Show Phone Number",
  "default": false
},
{
  "type": "text",
  "id": "phone_number",
  "label": "Phone Number",
  "info": "Leave blank to use store phone number",
  "placeholder": "{{ shop.phone }}"
},
{
  "type": "text",
  "id": "phone_text",
  "label": "Display Text",
  "info": "Custom text to display (defaults to phone number)"
}
```

### Positioning Settings
```json
{
  "type": "select",
  "id": "phone_number_position",
  "label": "Phone Number Position",
  "options": [
    {"value": "left", "label": "Left"},
    {"value": "right", "label": "Right"}
  ],
  "default": "right"
},
{
  "type": "select",
  "id": "phone_row",
  "label": "Phone Row",
  "options": [
    {"value": "top", "label": "Top"},
    {"value": "bottom", "label": "Bottom"}
  ],
  "default": "top"
}
```

### Visibility Settings
```json
{
  "type": "checkbox",
  "id": "show_phone_desktop",
  "label": "Show on Desktop",
  "default": true
},
{
  "type": "checkbox",
  "id": "show_phone_mobile",
  "label": "Show on Mobile",
  "default": false
},
{
  "type": "checkbox",
  "id": "phone_icon",
  "label": "Show Phone Icon",
  "default": true
}
```

## Phone Snippet Logic

### Dynamic Content
```liquid
{%- liquid
  assign phone_number = settings.phone_number | default: shop.phone
  assign show_desktop = settings.show_phone_desktop | default: true
  assign show_mobile = settings.show_phone_mobile | default: false
  assign phone_text = settings.phone_text | default: phone_number
  
  assign visibility_classes = ''
  if show_desktop and show_mobile
    assign visibility_classes = ''
  elsif show_desktop
    assign visibility_classes = 'mobile:hidden'
  elsif show_mobile
    assign visibility_classes = 'desktop:hidden'
  else
    assign visibility_classes = 'hidden'
  endif
-%}
```

### HTML Output
```html
<div class="header-phone mobile:hidden">
  <a href="tel:+44166715715" class="phone-link">
    <svg class="phone-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
    </svg>
    <span class="phone-text">+44 (0)1666 715 715</span>
  </a>
</div>
```

## Header Order Integration

### Order Logic
```liquid
# Add phone to order if enabled
if section.settings.show_phone_number
  if section.settings.phone_number_position == 'left'
    assign order = 'logo,menu,contact,localization,search,mobile_search,phone,actions'
  else
    assign order = 'logo,menu,contact,localization,search,mobile_search,actions,phone'
  endif
endif
```

### Two-Row Support
```liquid
# Phone row positioning
if section.settings.show_phone_number
  if section.settings.phone_row == 'bottom'
    assign bottom_row_blocks = bottom_row_blocks | append: 'phone,'
  endif
endif
```

## CSS Styling

### Phone Container
```css
.header-phone {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
```

### Phone Link
```css
.phone-link {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  text-decoration: none;
  color: inherit;
  font-size: 0.875rem;
  transition: color var(--animation-speed) var(--animation-easing);
}

.phone-link:hover {
  color: var(--color-primary);
}
```

### Phone Icon
```css
.phone-icon {
  flex-shrink: 0;
}
```

### Phone Text
```css
.phone-text {
  white-space: nowrap;
}
```

## Use Cases

### 1. Desktop Only Phone
```json
{
  "show_phone_number": true,
  "phone_number": "",
  "phone_text": "Call Us",
  "phone_number_position": "right",
  "show_phone_desktop": true,
  "show_phone_mobile": false,
  "phone_icon": true
}
```

### 2. Mobile Only Phone
```json
{
  "show_phone_number": true,
  "phone_number": "+1-800-123-4567",
  "phone_text": "Call Now",
  "phone_number_position": "left",
  "show_phone_desktop": false,
  "show_phone_mobile": true,
  "phone_icon": false
}
```

### 3. Two-Row Layout with Phone
```json
{
  "enable_two_row_header": true,
  "show_phone_number": true,
  "phone_row": "top",
  "phone_number_position": "right",
  "show_phone_desktop": true,
  "show_phone_mobile": true
}
```

## Testing Checklist

### Basic Functionality
- [ ] Phone number appears when enabled
- [ ] Uses store phone number by default
- [ ] Custom phone number overrides store phone
- [ ] Display text works correctly
- [ ] Click-to-call links work properly

### Positioning
- [ ] Left position places phone before actions
- [ ] Right position places phone after actions
- [ ] Two-row positioning works correctly
- [ ] Phone integrates with header order

### Visibility
- [ ] Desktop visibility toggle works
- [ ] Mobile visibility toggle works
- [ ] Both desktop and mobile can be shown
- [ ] Neither desktop nor mobile can be hidden
- [ ] Responsive classes apply correctly

### Styling
- [ ] Phone icon displays when enabled
- [ ] Phone icon hides when disabled
- [ ] Hover effects work
- [ ] Proper spacing and alignment
- [ ] Responsive design works

## Update Compatibility

### Files to Monitor
- `sections/header.liquid` - Main header logic
- `snippets/header-row.liquid` - Header row rendering
- `snippets/phone.liquid` - Phone number rendering

### Potential Conflicts
- Changes to header order logic
- Changes to header row rendering
- Updates to header schema structure
- Changes to CSS for header elements

### Merge Strategy
1. Keep our phone-related changes
2. Merge any new header functionality
3. Test phone positioning and visibility
4. Verify phone integration with two-row system
5. Ensure backward compatibility
