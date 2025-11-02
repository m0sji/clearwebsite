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

### Changed
- Navigation layout and style to match design:
  - Dark header bar, centered links, grid layout.
  - Dropdown styling and desktop/mobile behaviors.
- Home link updated to scroll to the hero section (`#hero`).

### Fixed
- Fixed incorrect Home anchor (`#home` → `#hero`).

### Technical Notes
- Files updated:
  - `website/index.html` — navigation structure; added Testimonials, Pricing, FAQ, Why Us, Skills, Back‑to‑Top.
  - `website/css/style.css` — header/nav overhaul; dropdown styles; new blocks for Testimonials, Pricing, FAQ, Why Us, Skills, Back‑to‑Top; smooth scroll and offsets.
  - `website/js/main.js` — sticky header shadow; mobile menu; logo scroller; active link highlighting; dropdown active sync; Back‑to‑Top behavior; year injection.