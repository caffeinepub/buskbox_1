# Specification

## Summary
**Goal:** Enable guest users to make donations via card payments using the existing Stripe Checkout flow.

**Planned changes:**
- Add a guest donation checkout path that does not require Internet Identity authentication.
- Create/update backend endpoints to initialize a Stripe Checkout session for guest donations and record the resulting donation using the existing single-actor backend architecture.
- Update donation UI to offer “Donate as guest” with a card payment option and handle Stripe Checkout redirect return states (success/cancel) without real-time updates.

**User-visible outcome:** A visitor can donate to a busker as a guest using a card payment through Stripe Checkout and see a success or cancellation result after returning from Stripe.
