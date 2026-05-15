# Enhanced Two-Row Header Layout System

## Overview
This document details the enhanced header layout system that allows for flexible two-row positioning of header elements with individual control over each element's placement.

## New Features

### 1. Two-Row Header System
- **Enable Two Row Header**: Master toggle to activate the enhanced layout system
- **Individual Element Control**: Each header element can be positioned in either the top or bottom row
- **Backward Compatibility**: Original single-row behavior is preserved when disabled

### 2. Contact Button Positioning
- **End of Right Column**: Option to place contact buttons at the very end of the right column
- **Flexible Positioning**: Contact buttons can be positioned anywhere in the header order
- **Special Styling**: Automatic spacing and alignment when placed at the end

### 3. Individual Element Row Control
- **Actions Row**: Control where login, cart, and currency elements appear
- **Logo Row**: Control logo positioning between top and bottom rows
- **Menu Row**: Control menu positioning (existing functionality enhanced)
- **Contact Row**: Control contact button positioning
- **Search Row Override**: Override search positioning in two-row mode
- **Localization Row Override**: Override localization positioning in two-row mode

## Settings Structure

### Master Controls
```json
{
  "type": "checkbox",
  "id": "enable_two_row_header",
  "label": "Enable Two Row Header",
  "info": "Allows positioning elements in separate top and bottom rows",
  "default": false
}
```

### Contact Positioning
```json
{
  "type": "checkbox",
  "id": "contact_end_of_right_column",
  "label": "Place Contact at End of Right Column",
  "info": "Places contact buttons at the very end of the right column, after all other elements",
  "default": false
}
```

### Individual Element Controls
```json
{
  "type": "select",
  "id": "actions_row",
  "label": "Actions Row (Login, Cart, Currency)",
  "options": [
    {"value": "top", "label": "Top"},
    {"value": "bottom", "label": "Bottom"}
  ],
  "default": "top",
  "visible_if": "{{ section.settings.enable_two_row_header }}"
}
```

## Layout Logic

### Order Management
The system handles header element ordering based on two-row settings:

```liquid
# Handle contact positioning
if section.settings.contact_end_of_right_column
  assign order = 'logo,menu,localization,search,mobile_search,actions,contact'
else
  assign order = 'logo,menu,contact,localization,search,mobile_search,actions'
endif
```

### Row Assignment
Elements are assigned to rows based on individual settings:

```liquid
# Handle two-row header system
if section.settings.enable_two_row_header
  # Actions row positioning
  if section.settings.actions_row == 'bottom'
    assign bottom_row_blocks = bottom_row_blocks | append: 'actions,'
  endif

  # Logo row positioning
  if section.settings.logo_row == 'bottom'
    assign bottom_row_blocks = bottom_row_blocks | append: 'logo,'
  endif

  # Menu row positioning
  if section.settings.menu_row == 'bottom'
    assign bottom_row_blocks = bottom_row_blocks | append: 'menu,'
  endif

  # Contact row positioning
  if section.settings.contact_row == 'bottom'
    assign bottom_row_blocks = bottom_row_blocks | append: 'contact,'
  endif
endif
```

## Use Cases

### 1. Actions Above Logo
- **Actions Row**: Top
- **Logo Row**: Bottom
- **Menu Row**: Bottom
- **Contact Row**: Bottom

This creates a layout where login/cart/currency appear above the logo, with logo, menu, and contact buttons below.

### 2. Contact at End of Right Column
- **Contact End of Right Column**: Enabled
- **Contact Position**: Right
- **Contact Row**: Top

This places contact buttons at the very end of the right column, after all other right-column elements.

### 3. Balanced Two-Row Layout
- **Actions Row**: Top
- **Logo Row**: Top
- **Menu Row**: Bottom
- **Contact Row**: Top
- **Search Row Override**: Bottom
- **Localization Row Override**: Top

This creates a balanced layout with actions and logo on top, menu and search on bottom.

## CSS Enhancements

### Contact End Positioning
```css
.header__column--right {
  /* Special styling for contact at end of right column */
  &:has(.contacts:last-child) {
    .contacts {
      margin-left: auto;
    }
  }
}
```

This ensures proper spacing when contact buttons are placed at the end of the right column.

## Backward Compatibility

### Single-Row Mode
When `enable_two_row_header` is disabled, the system falls back to the original single-row behavior:

```liquid
else
  # Original single-row logic
  if section.settings.menu_row == 'bottom'
    assign bottom_row_blocks = bottom_row_blocks | append: 'menu,'
  endif

  if section.settings.show_search
    if section.settings.search_row == 'bottom'
      assign bottom_row_blocks = bottom_row_blocks | append: 'search,'
    endif
  endif

  if section.settings.show_country or section.settings.show_language
    if section.settings.localization_row == 'bottom'
      assign bottom_row_blocks = bottom_row_blocks | append: 'localization,'
    endif
  endif
endif
```

## Configuration Examples

### Example 1: Actions Above Everything
```json
{
  "enable_two_row_header": true,
  "actions_row": "top",
  "logo_row": "bottom",
  "menu_row": "bottom",
  "contact_row": "bottom",
  "contact_end_of_right_column": false
}
```

### Example 2: Contact at End of Right Column
```json
{
  "enable_two_row_header": false,
  "contact_end_of_right_column": true,
  "contact_position": "right",
  "contact_row": "top"
}
```

### Example 3: Balanced Two-Row Layout
```json
{
  "enable_two_row_header": true,
  "actions_row": "top",
  "logo_row": "top",
  "menu_row": "bottom",
  "contact_row": "top",
  "search_row_override": "bottom",
  "localization_row_override": "top"
}
```

## Testing Checklist

### Two-Row Header
- [ ] Enable two-row header setting appears
- [ ] Individual element row controls are visible
- [ ] Elements can be moved between top and bottom rows
- [ ] Layout updates correctly when settings change
- [ ] Both rows display properly

### Contact Positioning
- [ ] Contact end of right column setting works
- [ ] Contact buttons appear at the end of right column when enabled
- [ ] Contact buttons maintain proper spacing
- [ ] Contact positioning works with two-row layout

### Backward Compatibility
- [ ] Single-row layout works when two-row is disabled
- [ ] Original settings continue to work
- [ ] No breaking changes to existing functionality

### Responsive Design
- [ ] Two-row layout works on mobile
- [ ] Two-row layout works on tablet
- [ ] Two-row layout works on desktop
- [ ] Contact positioning works across all devices

## Update Compatibility

### Files Modified
- `sections/header.liquid` - Main header logic and settings

### Potential Conflicts
- Changes to header order logic
- Changes to row assignment logic
- Updates to header schema structure
- Changes to CSS for header columns

### Merge Strategy
1. Keep our enhanced two-row logic
2. Merge any new header functionality from Horizon
3. Test both single-row and two-row modes
4. Verify contact positioning still works
5. Ensure backward compatibility is maintained
