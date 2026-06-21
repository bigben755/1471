# PRD — 1471 Horwich Squadron RAF Air Cadets Website

## Original problem statement
Build a modern, mobile-first, RAFAC-compliant recruitment/marketing website for 1471 Horwich
Squadron RAF Air Cadets. Audiences: prospective cadets (12–17), current cadets, parents/carers,
and prospective adult volunteers. Must feel professional, aviation-led, trustworthy and aspirational
(not a generic youth club). UK English. No fake cadet imagery / AI faces / distorted aircraft.

## Architecture
- Frontend: React 19 (CRA + craco), Tailwind, shadcn/ui, framer-motion, sonner. Routes: `/` (Landing), `/admin` (Admin).
- Backend: FastAPI + MongoDB (motor). JWT admin auth (Bearer, localStorage). Resend email (key pending).
- Design: light theme, RAF Blue/Red/Navy palette, Cabinet Grotesk + Public Sans, roundel/swoosh motifs.

## User personas
1. Young person (12–17) considering joining as a cadet.
2. Parent/carer wanting reassurance on structure, safety, value, commitment.
3. Adult considering volunteering.
4. Squadron staff (admin) reviewing enquiries.

## Core requirements (static)
- Sections: Hero, About, Activities (12 cards), Cadets, Parents, Volunteer, Qualifications, Join (form + 3 pathways), FAQ (12 Q&A accordion), Footer.
- Sticky header, mobile menu, smooth scroll, JSON-LD Organisation + FAQ schema, SEO title/meta/keywords.
- Enquiry form (name, email, phone, type, message, consent) stored in DB + admin panel to view/manage.
- Brand-safe imagery (aviation/sky/glider, no faces). Careful, non-committal activity wording.

## Implemented (2026-06-18)
- Multi-page public site (React Router): Home, About, Activities, Cadets, Parents, Volunteer, FAQ, Join — persistent Header/Footer via Layout, scroll-to-top on route change, per-page SEO titles/descriptions, Organisation JSON-LD site-wide + FAQ JSON-LD on /faq. Header is transparent over the Home hero and solid/sticky on inner pages with active-link highlighting. CTAs deep-link to /join with a preselected enquiry type via router state.
- Full responsive landing page with all required sections, RAFAC-compliant styling, crest used tastefully.
- Backend: `/api/auth/login`, `/api/auth/me`, `/api/enquiries` (POST public, GET/PATCH/DELETE admin), `/api/enquiries/stats`. Admin seeded from env.
- Admin panel at `/admin`: login, enquiry list, status filters, mark read/actioned, delete, stats cards.
- Resend integration wired (sends on submission when RESEND_API_KEY set; stored-only until then).
- SEO JSON-LD (Organisation + FAQPage), meta tags, page title.
- Verified: 16/16 backend pytest, 100% frontend flows (testing agent iteration_1).

## Backlog / remaining
- P1: Add RESEND_API_KEY (user providing) to enable enquiry email notifications + NOTIFY_EMAIL config.
- P2: Optional separate pages (currently single-page anchors); events/news section; gallery (brand-safe).
- P2: Production hardening — pin CORS origin, rotate JWT secret, brute-force/rate limiting, lifespan handlers.
- P3: Admin banner indicating email status; CSV export of enquiries.

## Next tasks
1. When user provides Resend key: set RESEND_API_KEY + NOTIFY_EMAIL in backend/.env, restart, verify email delivery.
2. Consider splitting anchors into routed pages as content grows.

---

# Members Portal (Phase 1) — implemented 2026-06-18

## Scope delivered
- Multi-role JWT auth + sign-in at `/portal` (admin, cfav, cadet, parent). Old `/admin` → redirects to `/portal`.
- Mandatory in-app notices gate: notices flagged `requires_ack` must be acknowledged on login before the dashboard loads (per-user ack state).
- Role-based dashboards:
  - Cadet: events calendar (bidding, green/amber/red capacity), points & streaks, notices, message board, account/password.
  - Parent: calendar, notices, message board, account.
  - CFAV/Admin: create/edit events + mark attendance (awards points), manage members (create/assign type/link parent↔cadet/reset password/edit bonus points), post notices (optional push/ack), view & action enquiries + create accounts from them, staff message threads, account.
- Points = attended-event points + staff bonus; Streak = attended volunteer events. Premium events flagged.
- Seed: admin/cfav/cadet/parent demo accounts (see test_credentials.md), 4 demo events, 1 welcome ack-notice.
- Verified: testing agent iteration_2 — 26/26 backend pytest + 100% frontend flows. Minor warnings (dup message key, dialog aria) fixed.

## Portal backlog (Phase 2)
- P1: Event photo galleries (object storage) with optional public visibility for recruitment; parents view photos.
- P1: Blogs (in-app) + later Facebook auto-post (needs Meta Page token).
- P2: Word (.docx) training-programme import → calendar events.
- P2: Real browser web-push; forgot-password email (Resend); split server.py into routers; 201 status codes; login rate-limiting; pin CORS for production.

