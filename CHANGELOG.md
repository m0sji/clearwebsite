# Changelog

## 1.10.2025-2.11.2025

### Added

- Added new Contact page (contact.html, contact.css, contact.js).
- Added Contact link in navigation menu.
- Implemented frontend form with name/email/message fields.
- Added client-side validation and success/error message feedback.
- Implemented contact.js to send form data to backend /api/contact/ endpoint.
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
- New informative and contextual text content throughout the homepage.
- Expanded hero, about, and footer sections with descriptive and relevant text.
- Added short explanations in Services, Pricing, and Contact sections to improve clarity.
- Included keywords and readable phrasing for improved SEO and user engagement.

### Changed

- Updated index.html navigation to include Contact page link.
- Improved file organization by adding new Contact assets in /website/.
- Navigation layout and style to match design:
  - Dark header bar, centered links, grid layout.
  - Dropdown styling and desktop/mobile behaviors.
- Home link updated to scroll to the hero section (`#hero`).
- Refactored project structure under Django with backend integration.
- Replaced static file references with Django {% static %} template tags.

### Fixed

- Fixed missing script/style paths for contact page (contact.js and contact.css now load correctly).
- Fixed incorrect Home anchor (`#home` → `#hero`).
- Fixed missing HttpResponse returns in API views.
- Fixed image, CSS, and JS loading errors through proper Django static setup.
- Replaced placeholder and lorem ipsum text with real, meaningful content related to **AI în Acțiune**.
- Updated section headings and subheadings to better match the project's tone and purpose.
- Improved grammar, consistency, and readability across all text blocks.
- Adjusted button labels and call-to-action phrases for a clearer user flow.
- Refined text alignment and spacing where new content affected layout.
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
- File updated:
  - `backend/templates/index.html` — replaced placeholder text with finalized descriptive content across all sections.
- Branch: `feature/add-useful-text-section`
- Purpose: improve content quality, clarity, and project presentation.

- ## 2.11.2025-30.11.2025

### Added

-Lead scoring and routing on contact submissions: score by role/budget/timeline/intent, classify priority (hot/normal/low), and trigger hot-lead webhook notifications (via LEAD_WEBHOOK_URL).
-Newsletter/contact intake enhancements: subscriber status/reactivation, source tracking, and ROI context capture for downstream CRM/lead use.

### Changed

- Unified contact/subscribe API responses to {success, message/error} and added per-IP/email throttling to reduce spam.
- Frontend forms now POST to /api/subscribe/ and /api/contact/ with status messaging and stored ROI context included.

### Fixed

- Backend subscribe flow aligned with subscriber fields and duplicate handling; consistent responses consumed by the frontend.

### Technical Notes
- Files added:
  - website/contact.html
  - website/contact.css
  - website/contact.js
- Backend compatibility:
  - Frontend form POSTs to /api/contact/ using JSON.
- Files updated:
  - website/index.html – added Contact link
  - backend/api/models.py — added lead_score/priority for ContactMessage; status/source/last_confirmed_at for Subscriber.
  - backend/api/views.py — lead scoring heuristics, priority classification, hot-lead webhook dispatch, subscriber reactivation, consistent JSON responses, and rate limiting.
  - backend/api/migrations/0002_extend_subscriber_contactmessage.py, 0003_contactmessage_lead_scoring.py — schema changes for intake tracking and lead scoring.
  - backend/api/admin.py — surfaced lead score/priority for triage in Django Admin.
  - backend/static/js/main.js, website/js/main.js — hooked newsletter/contact forms to backend APIs with ROI context and inline status feedback.
