# Horizon Merge Strategy

## Quick Reference Commands

### Setup Upstream Remote (One-time)
```bash
git remote add upstream https://github.com/Shopify/horizon.git
```

### Update from Horizon
```bash
# 1. Backup current state
git add .
git commit -m "Backup before Horizon update"

# 2. Fetch latest Horizon changes
git fetch upstream main

# 3. Create update branch
git checkout -b horizon-update-$(date +%Y%m%d)

# 4. Merge Horizon changes
git merge upstream/main

# 5. Resolve conflicts if any
# 6. Test thoroughly
# 7. Merge back to main
git checkout main
git merge horizon-update-$(date +%Y%m%d)
```

## Conflict Resolution Guide

### High Priority (Keep Our Changes)
- `blocks/_header-contact.liquid`
- `blocks/contact.liquid`
- `snippets/product-contact.liquid`
- `snippets/contact.liquid`
- `assets/brand.css`
- `assets/logo.svg`
- Custom font files

### Medium Priority (Merge Carefully)
- `sections/header.liquid` - May have both changes
- `snippets/header-row.liquid` - May have both changes
- `layout/theme.liquid` - Check for custom additions

### Low Priority (Accept Horizon Changes)
- `sections/header-group.json` - Auto-generated, will be recreated
- Core Horizon files without customizations

## Testing Checklist After Merge

### Header Functionality
- [ ] Header contact buttons appear
- [ ] Header contact positioning works
- [ ] Header contact styling is correct
- [ ] No JavaScript errors in console

### Product Page Functionality
- [ ] Product contact block can be added
- [ ] Product contact buttons work
- [ ] Product contact styling is correct

### General Theme Functionality
- [ ] Custom fonts load
- [ ] Brand styling applies
- [ ] No broken links
- [ ] Mobile responsiveness works
- [ ] All pages load correctly

## Rollback Commands

### Full Rollback
```bash
git checkout main
git reset --hard HEAD~1
```

### Partial Rollback (Specific Files)
```bash
git checkout HEAD~1 -- sections/header.liquid
git checkout HEAD~1 -- snippets/header-row.liquid
```

## Monitoring Commands

### Check for Changes
```bash
# See what changed in last update
git log --oneline -10

# Compare with upstream
git diff upstream/main

# See file changes
git diff --name-only upstream/main
```

### Verify Custom Files
```bash
# Check if custom files still exist
ls blocks/_header-contact.liquid
ls blocks/contact.liquid
ls snippets/product-contact.liquid
ls assets/brand.css
```

## Emergency Procedures

### If Header Breaks
1. Check `sections/header.liquid` for contact detection logic
2. Check `snippets/header-row.liquid` for contact rendering
3. Verify `blocks/_header-contact.liquid` exists
4. Check `snippets/product-contact.liquid` exists

### If Contact Buttons Don't Work
1. Verify all contact files exist
2. Check for JavaScript errors
3. Verify CSS is loading
4. Check for broken Liquid syntax

### If Styling Breaks
1. Check `assets/brand.css` is loading
2. Verify custom fonts are loading
3. Check for CSS conflicts
4. Verify color schemes are working

## Best Practices

1. **Always test in development first**
2. **Keep backups of working states**
3. **Document any manual fixes needed**
4. **Use feature branches for updates**
5. **Test on multiple devices/browsers**
6. **Verify all contact functionality works**
7. **Check mobile responsiveness**
8. **Test with different products/pages**
