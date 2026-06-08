# Horizon Update Strategy

## Overview
This document outlines how to safely update from the main Horizon branch while preserving customizations.

## Custom Files to Preserve
These files contain our customizations and should be preserved during updates:

### Contact System
- `blocks/_header-contact.liquid` - Header-specific contact block
- `blocks/contact.liquid` - General contact block for product pages
- `snippets/product-contact.liquid` - Contact buttons snippet
- `snippets/contact.liquid` - Contact snippet wrapper

### Custom Assets
- `assets/brand.css` - Custom brand styling
- `assets/logo.svg` - Custom logo
- `assets/FuturaMedium.*` - Custom fonts
- `assets/FuturaRegular.*` - Custom fonts

## Files That May Be Updated
These files may change in Horizon updates and need careful merging:

### Header System
- `sections/header.liquid` - Main header section
- `snippets/header-row.liquid` - Header row layout logic

### Auto-Generated Files
- `sections/header-group.json` - Auto-generated, will be overwritten

## Update Process

### 1. Before Updating
```bash
# Create backup of current state
git add .
git commit -m "Backup before Horizon update"

# Create branch for update
git checkout -b horizon-update-$(date +%Y%m%d)
```

### 2. Fetch Horizon Updates
```bash
# Add upstream remote if not already added
git remote add upstream https://github.com/Shopify/horizon.git

# Fetch latest changes
git fetch upstream main

# Merge upstream changes
git merge upstream/main
```

### 3. Handle Conflicts
If conflicts occur, prioritize our customizations for:
- Contact system files
- Custom assets
- Brand-specific styling

### 4. Verify Integration
After merging, verify:
- Header contact block still works
- Product page contact block still works
- No broken references to custom assets
- Header layout still functions correctly

### 5. Test and Commit
```bash
# Test the updated theme
# Fix any issues that arise

# Commit the merged changes
git add .
git commit -m "Merge Horizon updates with customizations"
```

## Key Integration Points

### Header Contact Integration
The header system looks for contact blocks and automatically includes them. The integration happens in:

1. `sections/header.liquid` lines 8-14: Detects contact blocks
2. `snippets/header-row.liquid` lines 73-75: Renders contact content

### Custom Block Registration
Our contact blocks are registered in the header schema and should continue working as long as:
- The block naming convention remains consistent
- The header detection logic isn't significantly changed
- The header-row rendering logic is preserved

## Monitoring for Changes

### Critical Files to Watch
- `sections/header.liquid` - Changes to header logic
- `snippets/header-row.liquid` - Changes to header layout
- Any new header-related blocks or snippets

### Update Indicators
Watch for these changes in Horizon updates:
- New header block types
- Changes to header positioning logic
- Updates to header schema structure
- New header-related snippets

## Rollback Plan
If an update breaks functionality:

```bash
# Revert to previous working state
git checkout main
git reset --hard HEAD~1

# Or revert specific files
git checkout HEAD~1 -- sections/header.liquid
git checkout HEAD~1 -- snippets/header-row.liquid
```

## Best Practices

1. **Always test updates in a development environment first**
2. **Keep customizations in separate files when possible**
3. **Document any changes made to core Horizon files**
4. **Use feature flags for conditional customizations**
5. **Maintain a changelog of customizations**

## Refactor pitfalls (class vs Shopify type)

When renaming custom CSS classes, **do not** bulk-replace `fibrenet-*` inside theme JSON `"type"` fields or `{% render %}` snippet paths — those must match liquid **filenames** (`sections/fibrenet-footer.liquid` → `"type": "fibrenet-footer"`; `blocks/fibrenet-slide.liquid` → `"type": "fibrenet-slide"`, not `hero-slide`). CSS/layout classes use shorter names (`site-footer-ext`, `product-information--split`, `hero-slideshow`, `hero-slide__heading`).

Prefer Horizon tokens in `brand.css`: `--page-margin`, `--padding-*`, `--font-h1--*` instead of legacy `--spacing-*` or hard-coded px. Map brand aliases in `:root` only where needed (`--head-to-title-gap`, `--content-padding-inline`).

Avoid `body.template-*` selectors — scope with section/layout classes. Cookie banner: `#shopify-pc__banner.shopify-pc__banner__dialog` (same element; descendant selector never matches).
