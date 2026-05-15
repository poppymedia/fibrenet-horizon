# Phone Positioning Debug Guide

## Expected Behavior

### Left Position
When `phone_number_position = "left"`:
- Phone should appear before actions (cart, login, currency)
- Order: `[Logo] [Menu] [Contact] [Search] [Phone] [Actions]`

### Right Position  
When `phone_number_position = "right"`:
- Phone should appear after actions (cart, login, currency)
- Order: `[Logo] [Menu] [Contact] [Search] [Actions] [Phone]`

## Header Order Logic

### Without Contact End of Right Column
```liquid
# Left position
order = 'logo,menu,contact,localization,search,mobile_search,phone,actions'

# Right position  
order = 'logo,menu,contact,localization,search,mobile_search,actions,phone'
```

### With Contact End of Right Column
```liquid
# Left position
order = 'logo,menu,localization,search,mobile_search,phone,actions,contact'

# Right position
order = 'logo,menu,localization,search,mobile_search,actions,phone,contact'
```

### With Customer Accounts Enabled
```liquid
# Left position
order = 'mobile_search,logo,menu,contact,localization,search,phone,actions'

# Right position
order = 'mobile_search,logo,menu,contact,localization,search,actions,phone'
```

## CSS Positioning

### Right Column End Positioning
```css
.header__column--right:has(.header-phone:last-child) {
  .header-phone {
    margin-left: auto;
  }
}
```

This ensures the phone number is pushed to the very end of the right column when it's the last element.

## Testing Steps

1. **Enable Phone Number**: Check "Show Phone Number"
2. **Set Position to Right**: Select "Right" for Phone Number Position
3. **Verify Order**: Phone should appear after cart/login/currency
4. **Check CSS**: Phone should have `margin-left: auto` when last in right column

## Common Issues

### Phone Not Appearing on Right
- Check if `phone_number_position` is set to "right"
- Verify phone is enabled with `show_phone_number`
- Check if contact end of right column is interfering

### Phone Not at Very End
- Ensure CSS `margin-left: auto` is applied
- Check if other elements are positioned after phone
- Verify header order logic is correct

### Phone Appearing in Wrong Column
- Check header order logic
- Verify phone is being added to correct position in order
- Check if customer accounts setting affects positioning
