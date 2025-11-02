# Changelog

## 1.10.2025-2.11.2025

### Added

- Navigation CTA button `Get Started` on the right of the header.
- Dropdown menu in navigation ("Dropdown") linking to `#testimonials` and `#faq`.
- Smooth scrolling with header offset and section scroll margins.
- Testimonials section with 3 testimonial cards.
- FAQ section.
- Pricing section with three plans.
- "Why Us" section under About with illustration and accordion.
- "Skills" section with progress bars;
- Back‑to‑Top floating button that appears after scrolling and returns to top on click.
- Backend API integration with Django:
- Added api app to project for backend functionality.
- Implemented /api/subscribe/ endpoint for newsletter subscriptions.
- Implemented /api/contact/ endpoint for contact form submissions.
- Created Subscriber and ContactMessage models with email, name, message, and timestamp fields.
- Added validation for required fields and email format.
- Prevented duplicate email subscriptions.
- Added support for both JSON and form-encoded requests.
- Integrated Django Admin registration for managing subscribers and messages.
- Added CSRF-exempt decorators for frontend integration.
- Provided clear success/error JSON responses for frontend JavaScript.
- Configured settings.py and urls.py for API routing and static files.

### Changed

- Navigation layout and style to match design:
  - Dark header bar, centered links, grid layout.
  - Dropdown styling and desktop/mobile behaviors.
- Home link updated to scroll to the hero section (`#hero`).
- Refactored project structure under Django with backend integration.
- Replaced static file references with Django {% static %} template tags.

### Fixed

- Fixed incorrect Home anchor (`#home` → `#hero`).
- Fixed missing HttpResponse returns in API views.
- Fixed image, CSS, and JS loading errors through proper Django static setup.

### Technical Notes

- Files updated:
  - `website/index.html` — navigation structure; added Testimonials, Pricing, FAQ, Why Us, Skills, Back‑to‑Top.
  - `website/css/style.css` — header/nav overhaul; dropdown styles; new blocks for Testimonials, Pricing, FAQ, Why Us, Skills, Back‑to‑Top; smooth scroll and offsets.
  - `website/js/main.js` — sticky header shadow; mobile menu; logo scroller; active link highlighting; dropdown active sync; Back‑to‑Top behavior; year injection.
- backend/api/views.py — implemented subscribe and contact endpoints with validation and DB save.
- backend/api/models.py — created Subscriber and ContactMessage models.
- backend/api/admin.py — registered models in Django Admin.
- backend/backend/settings.py — added api app, static file setup.
- backend/backend/urls.py — added /api/ routes for backend endpoints.
