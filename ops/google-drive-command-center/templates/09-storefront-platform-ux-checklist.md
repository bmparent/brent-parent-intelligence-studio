# Storefront Platform UX Checklist

## Business and access

- [ ] Store audience and access rules are explicit (public, employee, cast/crew, school, etc.).
- [ ] Authentication/PERNR/password behavior is tested on home, category, product, cart, and return visits.
- [ ] Store dates, eligibility, discount/subsidy rules, and support contact are accurate.
- [ ] No private roster, identifier, or authorization logic is exposed in browser source.

## Navigation and discovery

- [ ] Homepage shows only the categories and information customers need.
- [ ] Category names, product grouping, filters, search, and back behavior are predictable.
- [ ] Logos, decorative scenes, and motion do not obscure shopping actions.
- [ ] Product links and category links go to the intended platform routes.

## Product decisions

- [ ] Product imagery is accurate and does not imply unavailable colors/decorations.
- [ ] Decoration placement, personalization, price, size options, and restrictions are clear.
- [ ] Size guides are reachable before add-to-cart.
- [ ] Turnaround, returns, and fulfillment expectations are visible before checkout.

## Mobile and accessibility

- [ ] Test at narrow phone, large phone, tablet, and desktop widths.
- [ ] No horizontal overflow, clipped hero, covered anchor, or unreachable control.
- [ ] Tap targets are comfortable and focus/keyboard behavior works.
- [ ] Text has strong contrast and does not rely on images or animation.
- [ ] Reduced-motion preference disables nonessential motion.
- [ ] Core content remains available when WebGL/canvas fails.

## Platform integration

- [ ] Embed seam/header spacing is intentional and stable.
- [ ] CSS/JavaScript is scoped to avoid platform checkout/account regressions.
- [ ] External assets use HTTPS, optimized formats, dimensions, and fallbacks.
- [ ] Console/network errors are reviewed on representative devices.
- [ ] Analytics and conversion events avoid restricted employee/customer data.

## Checkout proof

- [ ] Eligible customer can select a product, decorate/personalize, add to cart, and pay.
- [ ] Discounts/subsidies and overspend behavior calculate correctly.
- [ ] Tax, shipping/pickup, confirmation, and notification behavior are verified.
- [ ] A failed payment or invalid code gives a recoverable message.
- [ ] Test orders are removed/refunded and documented.

## Handoff

- [ ] Client receives editable-copy locations, asset registry, platform constraints, and support path.
- [ ] Known browser/device limitations are documented.
- [ ] Launch evidence and rollback instructions are saved.
