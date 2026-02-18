# Specification

## Summary
**Goal:** Create a busking platform where artists can sign in, publish categorized media items, and receive per-item Stripe donations with a 10% platform fee.

**Planned changes:**
- Add Internet Identity sign-in plus artist onboarding to create/update an artist profile (display name, bio, avatar URL or uploaded avatar) and publish a public artist page.
- Implement multi-file media uploads where each file becomes its own media item with title, description, category (Recording / Live Session / Video), optional tags, and created timestamp.
- Build guest-facing browsing: landing page, category browse views, and basic search/filter by artist name and/or item title.
- Add Stripe Connect-style artist account connection (connect/disconnect, status display) and disable donations when not connected with a clear message.
- Add per-media-item Stripe donation flow with a Donate button; route funds to the artist’s connected Stripe account and collect a 10% application fee; show success/cancel states.
- Provide an artist dashboard to manage media (list/edit/delete) and view donation totals (lifetime and per item) plus recent donations.
- Apply a consistent visual theme and information architecture across the app (avoiding blue/purple as the primary palette).
- Add and use static generated assets (logo, default avatar, media placeholder thumbnails) in the UI.

**User-visible outcome:** Artists can sign in, set up a profile, upload categorized recordings/live sessions/videos, connect Stripe, and manage items and donations in a dashboard; guests can browse/search artists and media, and donate to specific items when Stripe is connected.
