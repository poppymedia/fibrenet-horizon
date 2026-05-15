# Header Order Flow Documentation

## Overview
This document explains how the header element ordering works in the two-row header system, specifically for search and contact button positioning.

## File Structure and Flow

### 1. Main Header Logic (`sections/header.liquid`)
- **Line 3**: Initializes base order: `'logo,menu,contact,localization,search,mobile_search,actions'`
- **Line 54**: Captures contact buttons from `snippets/product-contact.liquid`
- **Line 125**: Captures search button from `snippets/search.liquid`
- **Line 167**: Initializes `bottom_row_blocks` array for two-row system
- **Line 171-196**: Builds `bottom_row_blocks` array based on settings:
  - Search row positioning (line 187-191)
  - Contact row positioning (line 193-196)
- **Line 338-340**: Determines row order:
  - Top row: Uses main `order` variable
  - Bottom row: Uses `bottom_row_blocks` array
- **Line 344**: Renders `header-row` snippet with appropriate order

### 2. Header Row Rendering (`snippets/header-row.liquid`)
- **Line 8**: Splits order string into array
- **Line 11-32**: Processes each item in order:
  - Determines column position (left/center/right)
  - Determines row position (top/bottom)
  - Adds to appropriate column if it matches current row
- **Line 65-80**: Renders elements in the determined order

### 3. Contact Buttons (`snippets/product-contact.liquid`)
- **Line 2-12**: Renders contact buttons HTML
- **Line 3**: Debug comment shows where contact buttons are rendered

## Key Variables

### `order` (Main Order)
- Used for top row elements
- Set in `sections/header.liquid` line 3
- Modified by localization logic (lines 71-91)
- Modified by phone positioning logic (lines 99-110)

### `bottom_row_blocks` (Bottom Row Order)
- Array of elements that should appear in bottom row
- Built in `sections/header.liquid` lines 171-196
- Order is determined by the sequence of `append` operations:
  1. Search (line 189) - appears first
  2. Contact (line 195) - appears second

### `row_order` (Final Order)
- Set in `sections/header.liquid` lines 333-336
- Top row: Uses main `order` variable
- Bottom row: Uses `bottom_row_blocks` array joined as string

## Two-Row Header Settings

### Search Row Override
- **Setting**: `search_row_override`
- **Values**: 'top' or 'bottom'
- **Effect**: Moves search button to specified row

### Contact Row
- **Setting**: `contact_row`
- **Values**: 'top' or 'bottom'
- **Effect**: Moves contact buttons to specified row

## Debug Information

### Console Debug Output
The system outputs debug information showing:
- Main order string
- Bottom row blocks array
- Two-row header enabled status
- Individual row override settings

### HTML Debug Comments
- `<!-- DEBUG: Order for bottom right: search,contact -->`
- `<!-- DEBUG: Contact buttons rendered here -->`

## Expected Behavior

When both search and contact are set to bottom row:
1. **Search button** appears first (left position)
2. **Contact buttons** appear second (right position)

This is achieved by the order in `bottom_row_blocks` array:
1. Search is appended first (line 189)
2. Contact is appended second (line 195)

## Troubleshooting

### If search appears after contact:
- Check that `bottom_row_blocks` array has 'search' before 'contact'
- Verify the append order in lines 189 and 195
- Check that `row_order` is using `bottom_row_blocks` for bottom row

### If elements don't appear in bottom row:
- Verify `enable_two_row_header` is true
- Check individual row settings (`search_row_override`, `contact_row`)
- Ensure `bottom_row_blocks` array is not empty

### Debug Steps:
1. Enable two-row header
2. Set search and contact to bottom row
3. Check page source for debug comments
4. Verify order in `bottom_row_blocks` array
5. Check that `row_order` uses correct order for bottom row

