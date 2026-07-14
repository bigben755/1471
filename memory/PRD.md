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

---

# Squadron photo integration — 2026-06-20
- Extracted 46 real squadron photos from the client's Google Drive folder (raw-HTML data-id parse; lazy-load grid limitation bypassed). Downloaded, EXIF-rotated, resized to max 1600px / q82 (173MB → 14.6MB) and self-hosted under `/app/frontend/public/squadron/` (production-safe, no Google hotlinking/403 risk).
- Mapped photos to 9 of 12 activities (flying, gliding, adventure-training, leadership, sport, camps, drill-and-uniform, aviation-studies, community-events) — each with a hero image + caption gallery. dofe/first-aid/fieldcraft have no matching photos (icon-only, by design).
- Activities listing cards now show photo thumbnails; ActivityDetailPage has photo hero + responsive gallery grid with click-to-open lightbox. Hero + Cadets section backgrounds and About/Parents feature images now use real squadron photos.
- Verified: all images serve HTTP 200 image/jpeg over the public URL; pages render correctly (screenshots).

---

# Phase 2 — Recruitment, Comms & Newsletter — 2026-06-20

## Delivered & tested (testing agent iteration_3: 100% backend 13/13 + 100% frontend flows)
- **Prospective-cadet eligibility stream:** Public Join form now captures Date of Birth + an age-band radio (only for 'Join as a Cadet'). Bands: yr8 & 13_plus → "Can join now"; yr7_starting_yr8 → "Eligible in September" (auto-moves to "now" once 1 Sept passes, via compute_eligibility); under_12 → "Eligible in the future".
- **Staff Recruitment tracker** (`/portal` → Recruitment tab): three buckets with counts + prospect cards (contact details, DoB, age band) + "Create cadet account" action. Endpoint GET /api/enquiries/tracker.
- **Targeted broadcast/notifications** (Comms tab → Send message): recipient picker (everyone / by role / specific people / a cadet's parent) + channels (dashboard + email). POST /api/broadcast → writes db.notifications + emails. Members see them in a new **Inbox** tab with an unread badge (auto-marks read on open). Endpoints: /api/notifications (+ unread-count, /{id}/read, /read-all).
- **Newsletter builder** (Comms tab → Newsletter): compose (subject/heading/intro/body), server-rendered email **Preview** (iframe), save drafts, then **Send** to selected audience + channels. Newsletters CRUD + /preview + /{id}/send.
- **Email is LIVE** via the Emergent managed email proxy (EMERGENT_EMAIL_KEY in backend/.env, EMAIL_FROM_NAME="1471 Horwich Squadron"). No Resend key required. Enquiry notification emails also route through this now. Degrades gracefully (logs+skips) if the key is ever removed.
- **Recruitment emails (2026-06-20):** Staff can email prospects directly from the Recruitment tracker. "Can join now" prospects get **joining-instructions** emails (parade nights, venue, next steps); "September" and "future/too-young" prospects get a **countdown email** to their computed eligibility date (DoB-derived via England school-year rule for future; next 1 Sept for September). Per-prospect (with optional note) + bulk-per-bucket. Endpoints POST /api/enquiries/{id}/recruit-email and POST /api/enquiries/recruit-email/bulk. Tracker cards show estimated join date + live countdown + "email sent" badge. Verified iteration_4: 100% backend 12/12 + 100% frontend flows.
- **Joining-email attachments + time-aware buckets (2026-06-20):** Joining-instructions emails now support **attachments** (joining form, welcome pack). The managed email proxy can't carry attachments, so files are stored in **MongoDB GridFS** and embedded as secure public download links (`GET /api/attachments/{id}/download`). Attachment CRUD: POST/GET/DELETE /api/attachments (staff), download is public/unguessable. Upload UI in the recruit dialog (single + bulk joining). The 3 tracker buckets are now **time-aware** — `compute_eligibility()` recomputes from a canonical DoB-derived eligibility date on every read, so prospects auto-move future→September→now as time passes. Verified iteration_5: 13/13 new backend tests + 100% frontend flows.
  - Known tech debt: server.py ~1200 lines (split into routers overdue); download buffers whole file (switch to StreamingResponse); consider zoneinfo('Europe/London') for the school-year cutoff; bulk countdown still uses window.confirm (cosmetic).

## Phase 3 — Document library, Blogs/News, Calendar sync — 2026-06-20 (verified iteration_6: backend 110/110, frontend 100%)
- **Document library** (staff Documents tab): upload docs (title/category/visible-to-roles) to a shared GridFS-backed library; members browse docs shared with their role (member Documents tab); staff **Send** any doc to selected groups/individuals (dashboard notification with Download button + email link). Endpoints: POST/GET /api/documents, GET /api/documents/library, PATCH, DELETE, public GET /api/documents/{id}/download, POST /api/documents/{id}/send. Notification `link` stored as a relative path (domain-safe) and prefixed in the UI.
- **Blogs/News** (staff News tab): draft/publish posts with cover image + photo gallery (GridFS). Published posts appear on the PUBLIC website **/news** + **/news/:slug** (with a **Share to Facebook** button — sharer.php, no API/token) and in a members read-only News tab. Endpoints: /api/blogs CRUD, /api/blogs/upload-image, /api/blogs/image/{id}, public /api/public/blogs (+/{slug}). Header nav gains "News".
- **Calendar sync**: public **iCal/ICS feed** at GET /api/calendar/events.ics (Subscribe button on the events calendar copies the link). **Word (.docx) import** (staff): POST /api/events/import-docx parses a training programme (python-docx + dateutil, two-default full-date validation, default 19:00–21:30) into an editable preview; POST /api/events/import bulk-creates. 
- Facebook chosen as simple share button (not auto-post). Requirements.txt updated (python-docx).

## Phase 4 — Installable App (PWA) + Push notifications — 2026-06-20 (verified iteration_7: backend 123/123, frontend 95%)
- **Installable PWA**: manifest.json (standalone, start_url /portal, squadron **crest** icons at /public/icons/), apple-touch-icon + iOS meta in index.html, service worker /public/sw.js (push + notificationclick + setAppBadge), registered in src/index.js which also captures beforeinstallprompt.
- **Web Push (VAPID, self-generated keys in backend/.env: VAPID_PUBLIC_KEY, VAPID_PRIVATE_PEM_B64, VAPID_SUBJECT)**. Endpoints: GET /api/push/vapid-public-key, POST /api/push/subscribe, /push/unsubscribe, /push/test. `push_to_user()` (pywebpush, deletes stale 404/410 subs) fires from `deliver_broadcast` (messages/documents/newsletters) and `create_notice` (role-targeted). Push payload carries `badge`=unread count → app-icon badge on installed PWAs.
- **In-app banner** (`PwaManager`, top of portal dashboard): "Install app" (Android/desktop when beforeinstallprompt fires) + "Turn on notifications" + iOS Add-to-Home-Screen guidance; dismissible. `enablePush()` wrapped in try/catch (fixed iteration_7 medium bug).
- Caveat: iPhone/iPad need Add-to-Home-Screen (iOS 16.4+) before push works. Real push delivery can't be validated in headless automation (Chromium treats Push as incognito) — wiring verified at API layer.

## Backlog / tech debt (open, prioritised)
- P1: Event photo galleries (object storage); parents view photos.
- P1: Facebook auto-post option (needs Meta Page token) — currently simple share only.
- P2 (tech debt, cumulative iters 3–7): **split server.py (~1680 lines) into routers (overdue; push/blogs/documents/calendar cleanly extractable)**; StreamingResponse for GridFS downloads; nested pydantic schema for PushSubscription (clean 422); cap push_subscriptions per user (~10, LRU); asyncio.gather fan-out for push sends; BlogUpdate partial model; orphaned-GridFS cleanup; pagination on /public/blogs; zoneinfo('Europe/London') for school-year cutoff; RecruitmentPanel bulk-countdown window.confirm → dialog; return 201 from POST creators.

