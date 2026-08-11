# MASTER SPECIFICATION: Universal Offline PWA Phone Directory
**Version:** 2.0 Universal (Institution-Agnostic)
**Date:** 2026-08-12
**Primary UI Language:** Bengali (Bangla script) — configurable for any institution
**Inspiration/Reference Build:** Cox's Bazar Government Polytechnic Institute (CBPI) Phone Directory
---
## 1. PURPOSE & PROBLEM STATEMENT
Build a lightweight, installable, offline-capable Progressive Web App (PWA) phone directory that can be configured for **any institution** — polytechnics, schools, colleges, universities, offices, clubs, NGOs, or organizations — without code changes.
### Core problems solved:
- Printed phone directories go out of date instantly; editing/reprinting is costly
- Shared WhatsApp/PDF contact lists cannot be searched, filtered, or called from one tap
- Most office directories require a backend server, database, and ongoing maintenance cost
- Existing directory apps require internet and cannot be used during outages
- Institute admins without coding skill cannot easily update a live directory
### Core value proposition:
1. **Zero backend** — 100% static HTML/CSS/JS, deployable to any static host (Netlify, GitHub Pages, Vercel, hosting cPanel, local file)
2. **Offline-first PWA** — works without internet after first load, installable to phone home screen as a native-style app
3. **Secret admin panel** — non-technical admin can add/edit/archive/delete contacts via browser, no GitHub/VS Code required
4. **One-tap deploy** — download updated full site as zip, drag-and-drop to host, or use `push.bat` for GitHub→Netlify auto-deploy
5. **Configurable per institution** — site name, logo, brand color, departments, ranks all set via admin UI (no code edits needed)
6. **Mobile-first** — primary use case is mobile phone calling; full desktop support as bonus
---
## 2. TARGET USERS
| Role | Access | Capabilities |
|------|--------|--------------|
| **Public user** (students, staff, visitors) | Public `index.html` URL, shared openly via link/QR/PWA install | Search, filter by department, one-tap calls, send emails, install app for offline use, view archived contacts. No edit/delete controls visible. |
| **Administrator** (1 or more trusted owners) | Secret unlisted `/admin.html` URL (no PIN/password — security via URL obscurity + `robots.txt` disallow + `noindex` meta) | Full CRUD on contacts, customize site settings (name/logo/color/footer), manage departments and rank order, bulk CSV import/export, vCard import, export full site zip, manage archive, deploy updates. |
---
## 3. FINAL FEATURES
### Public Page (`index.html`)
1. **Configurable tabs** — dynamically generated from admin-defined departments + mandatory "All" and "Archive" tabs (tabs with 0 contacts hidden, **except Archive tab which is always visible**). Each tab shows count badge.
2. **Real-time full-text search** — matches name (Bengali + English), designation, department, phone number, email. Clear (✕) button appears when input has content.
3. **Sticky search + tabs** — only the search box and department tabs stick to the top while scrolling; site title/logo/share and zoom bar scroll away naturally.
4. **Contact grouping** — "All" tab groups contacts by department with colored headings and count badges; single-dept view shows a colored result banner.
5. **Contact cards** — circular avatar/photo, Bengali name, English name (if present), Bengali designation, teal bold phone number, optional mailto icon, large green gradient circular call button.
   - 🚫 **ONLY the green call button triggers a phone call** — clicking the rest of the card does nothing (text is selectable for copy-paste).
6. **Configurable sort order** — primary sort by admin-defined rank/designation order, secondary sort by Bengali name using `Intl.Collator("bn")`.
7. **Font zoom control** — +/- buttons (12–28px range), persists to `localStorage`, shows percentage. Centered between controls: small italic note configurable by admin (default: *"Not based on seniority."*).
8. **Back-to-top button (↑)** — smooth scroll to top of list.
9. **Share button** — native Web Share API on mobile, clipboard copy fallback on desktop with toast confirmation.
10. **PWA install button** — appears when browser fires `beforeinstallprompt`, hides after install.
11. **Pinned footer** — configurable credit/copyright text, always at bottom of app container (never spans full desktop viewport).
12. **Empty state** — icon + message ("কোনো কন্টাক্ট পাওয়া যায়নি") when no matches.
13. **Archived contacts** — only visible in Archive tab; rendered at 55% opacity with 45° light stripe pattern; call button remains functional.
14. **Theming** — primary color, logo, title, subtitle all loaded from site config and applied via CSS custom properties at runtime.
### Admin Panel (`admin.html`)
6 tabs (first 4 are CBPI-legacy; 2 new for universality):
1. **Dashboard** — totals (contacts/active/archived), quick action buttons, usage instructions, site preview card.
2. **Site Settings** (NEW) — configure:
   - Institution Bengali name, English name, short name (app title)
   - Logo upload (auto-cropped square, 64–128px)
   - Primary theme color (color picker, default `#009578` teal)
   - Footer credit text
   - Zoom note text
   - Export / import full site configuration as JSON
3. **Departments** (NEW) — add/edit/reorder/delete departments:
   - Bengali name, key, Font Awesome icon picker, optional custom accent color
   - Drag-and-drop reorder
   - System-protected departments: "All" and "Archive" (cannot be deleted, only relabeled)
4. **Designations/Ranks** (NEW) — add/edit/reorder/delete job titles:
   - Bengali designation pattern/keyword (for matching)
   - Numeric rank value (lower = higher in list)
   - Drag-and-drop reorder
   - Default rank table provided as starting point (see §5)
5. **Add Contact** — form with: Bengali name (required), English name, category (teacher/staff/administration), department (dropdown), designation (dropdown from ranks), mobile (BD or generic format validation), email, photo upload (auto-resize to 220px JPEG @ 82% quality, stored as base64 or file path).
6. **Manage Contacts** — search/filter table, checkboxes (show active/archived), per-row actions:
   - Inline edit (name, designation, phone, email, department)
   - Toggle archive/unarchive
   - Delete (allowed for admin-added contacts only; built-in contacts can only be archived)
   - Photo replace
7. **Data & Deploy**:
   - Download fresh `data.js` (contains site config + contacts + departments + ranks, assigns to `window.DATA`)
   - Download **entire website as ZIP** (HTML/CSS/JS/data.js/images) for drag-and-drop hosting
   - Export JSON backup
   - Import JSON backup (cross-browser session transfer)
   - **Bulk CSV import** (with downloadable CSV template: `bn_name,name,category,dept_key,bn_designation,mobile,email,image_url`)
   - **vCard (.vcf) import** — batch import from phone contact exports
   - Reset session (clear local changes)
### PWA / Platform Features
1. Full offline after first load via Service Worker (cache-first, stale cache cleanup on activate, offline fallback to cached homepage)
2. Installable to Android/iOS/desktop home screen as standalone app with custom icon + theme color
3. Works via `file://` double-click for local testing (SW disabled for browser security; core features work)
4. Modern browser support (Chrome 100+, Safari 15+, Firefox 100+, Edge 100+)
5. Total bundle size target <700KB (initial), <1MB with photos
6. Works on 2G/3G connections
---
## 4. FINAL UI/UX SPECIFICATION
### Default Color Palette (overridable per institution)
| Role | Hex Value |
|------|-----------|
| Primary brand color | `#009578` (teal, configurable) |
| Primary light | `#e6f5f1` (computed from primary with 8% alpha) |
| Primary dark | `#007a63` (computed darken ~15%) |
| Header gradient | `linear-gradient(135deg, primary, lighten(primary, 8%))` |
| Outer page bg (desktop) | `#e8ecf0` (cool light gray) |
| App inner bg | `#f5f6fa` (off-white) |
| Card bg | `#ffffff` |
| Primary text | `#222222` |
| Muted text | `#888888` |
| Border | `#eeeeee` |
| Archive gray | `#616161` |
| Warning orange | `#ef6c00` |
| Danger red | `#e53935` |
| Success green | `#2e7d32` |
| Info blue | `#1565c0` |
#### Department Accent Palette (default, overridable)
12-color deterministic palette: `[#009578, #1565c0, #c2185b, #f57c00, #00838f, #ad1457, #2e7d32, #6a1b9a, #5d4037, #455a64, #e53935, #00acc1]` — cycled for departments without explicit colors.
### Typography
- **Font stack (Bengali-first):** `'Noto Sans Bengali', 'Hind Siliguri', 'SolaimanLipi', 'Vrinda', 'Siyam Rupali', 'Tiro Bangla', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- Base size 16px, line-height 1.45, antialiased
### Layout Structure (`index.html`)
```
┌─────────────────────────────────────────┐
│ .app (max-width 680px, centered, flex column, height:100dvh, overflow:hidden, soft desktop shadow)
├─────────────────────────────────────────┤
│ .scroll-area (flex:1, overflow-y:auto, bg:#f5f6fa)
│  ├─ .hero-band (branded gradient, scrolls away)
│  │   ├─ Logo (white rounded square, 44px)
│  │   ├─ <short name title> + <full institution subtitle>
│  │   └─ Share + Install circular buttons
│  ├─ .sticky-band (position:sticky; top:0; gradient, soft shadow — ALWAYS VISIBLE WHEN SCROLLING)
│  │   ├─ White pill search bar (🔍 placeholder "নাম, পদবী বা নম্বর দিয়ে খুঁজুন...", ✕ clear)
│  │   └─ Horizontally scrollable tab pills (hidden scrollbar):
│  │       • Active tab: white bg, primary-color text, shadow
│  │       • Inactive: translucent white bg, white text
│  │       • Count badges
│  ├─ .zoom-band (gradient, scrolls away)
│  │   ├─ Tt icon, minus, percentage label, plus
│  │   ├─ Centered small italic note (admin-configurable)
│  │   └─ Circular ↑ back-to-top button
│  ├─ .contacts
│  │   ├─ Department headings (colored circle icon, name, count badge)
│  │   └─ Contact cards (white, 12px radius, soft shadow, left primary border on hover):
│  │       ├─ 50px circular avatar (photo or initial fallback)
│  │       ├─ Bengali name (bold), English (small italic), designation, teal phone, optional email
│  │       └─ 46px circular gradient call button — ONLY clickable call trigger
│  └─ .empty state (icon + message)
├─────────────────────────────────────────┤
│ .footer (flex-shrink:0, top border, centered muted text, configurable credit)
└─────────────────────────────────────────┘
```
### Admin Layout
- Standard scrollable page (NO viewport lock), background `#f5f7fa`, max-width 900px centered, 16px padding
- Teal gradient rounded header with gear icon, title, subtitle, pill link back to public directory
- White rounded pill tab bar for admin sections
- White rounded soft-shadow cards for content, rounded form fields with primary focus ring, color-coded action buttons
- Responsive table for contacts, 36px mini avatars, inline edit forms
- Modal dialogs for confirmations and complex actions
### Responsive Breakpoints
| Screen | Behavior |
|--------|----------|
| <380px (small phones) | Compact logo/buttons/tabs, hide tab icons and zoom note, smaller call button (42px) |
| 380–480px | Reduced zoom note font |
| >560px (tablet/desktop) | Centered app container with outer shadow on gray background |
### Interaction & Feedback
- Minimum 38×38px touch targets (WCAG)
- Buttons scale 0.92–0.95 on press
- Cards elevate shadow + left primary-color border on hover
- Smooth 300ms scroll animations
- Toast notifications: bottom-centered dark pill, white text, 2.5s auto-dismiss (Bengali messages)
---
## 5. FINAL PROCESSING LOGIC
### Data Structure (`data.js`)
🚫 File **MUST** start with `window.DATA = { ... }` — never use top-level `const`/`let` (breaks `file://`):
```javascript
window.DATA = {
  version: 2,
  site: {
    name_bn: "কক্সবাজার সরকারি পলিটেকনিক ইনস্টিটিউট",
    name_en: "Cox's Bazar Govt. Polytechnic Institute",
    short_name: "CBPI Phone Directory",
    footer_text: "Developed by Mohammad Arman · AI-Assisted",
    zoom_note: "Not based on seniority.",
    primary_color: "#009578",
    logo: "images/logo.png",
    search_placeholder: "নাম, পদবী বা নম্বর দিয়ে খুঁজুন...",
    empty_msg: "কোনো কন্টাক্ট পাওয়া যায়নি"
  },
  departments: [
    { key: "administration", bn: "প্রশাসন", icon: "fa-building", color: "#c2185b" },
    { key: "civil", bn: "সিভিল", icon: "fa-road", color: "#5d4037" }
    // ... plus Archive auto-added
  ],
  ranks: [
    { pattern: "অধ্যক্ষ|Principal", value: 10 },
    { pattern: "উপাধ্যক্ষ|Vice", value: 20 }
    // ...
  ],
  contacts: [
    {
      sl: 1,
      category: "teacher|staff|administration",
      bn_name: "মোঃ ...",
      name: "Md. ...",
      bn_designation: "ইন্সট্রাক্টর",
      designation: "Instructor",
      department: "সিভিল টেকনোলজি",
      dept_key: "civil",
      mobile: "01XXXXXXXXX",
      email: "name@example.com",
      image: "images/teachers/t_01.png" || "data:image/jpeg;base64,..." || "",
      archived: false
    }
  ]
};
```
### Default Rank Table (starting template; admin can reorder/add/delete)
| Value | Pattern |
|-------|---------|
| 10 | অধ্যক্ষ / Principal / Director / Headmaster |
| 20 | উপাধ্যক্ষ / Vice Principal / Vice Head |
| 30 | রেজিস্ট্রার / Registrar |
| 40 | চিফ ইনস্ট্রাক্টর / বিভাগীয় প্রধান / CI / Head of Dept / Chief |
| 45 | ওয়ার্কশপ সুপার / Workshop Superintendent |
| 50 | ইনস্ট্রাক্টর / Instructor / Teacher / Lecturer |
| 55 | ফিজিক্যাল / Physical Education |
| 60 | জুনিয়র ইনস্ট্রাক্টর / Junior Instructor / Assistant Teacher |
| 65 | ল্যাব সহকারী / Lab Assistant |
| 70 | ক্রাফট ইনস্ট্রাক্টর / Craft Instructor |
| 80 | প্রধান সহকারী / Head Assistant |
| 85 | হিসাবরক্ষক / Accountant |
| 90 | স্টোর কিপার / Store Keeper |
| 100 | কেয়ারটেকার / Caretaker |
| 110 | ইলেকট্রিশিয়ান / Electrician |
| 120 | ডাটা প্রসেসর / Data Processor / Computer Operator |
| 130 | ক্যাশিয়ার / Cashier |
| 140 | ক্যাশ সরকার / Cash Sarkar |
| 150 | নিরাপত্তা প্রহরী / Security / Guard |
| 160 | ক্লিনার / Cleaner / পরিচ্ছন্ন কর্মী |
| 170 | সুইপার / Sweeper |
| 500 | (unknown — sorted to end of dept group) |
### Grouping Logic
1. If `contact.archived === true` → group = `archive`
2. Else if `contact.category === "administration"` → group = `administration`
3. Else → group = `contact.dept_key` (must match an entry in `departments[]`, otherwise falls back to "office"/"other")
### Phone Sanitization (configurable for country; default BD)
1. Strip all non-digit characters
2. If starts with `880` → replace with leading `0`
3. If no leading `0` → prepend `0`
4. Default BD validation pattern: `^01[3-9][0-9]{8}$` (admin can override country code/pattern in site settings)
### Image Processing
- Admin contact photo uploads: FileReader → HTMLImageElement → proportional resize max dimension 220px → Canvas → JPEG @ 82% quality → base64 data URL
- Logo upload: square-crop, resize to 128px, PNG or JPEG
- Broken image → deterministic initial avatar (12-color palette hashed by name, first character of Bengali name as text)
### Service Worker
- Cache name format: `<short-name-slug>-v<VERSION>` (VERSION must be bumped on every deploy)
- Pre-cache core assets, uploaded images, Font Awesome CDN
- Activate: delete old caches, claim clients
- Fetch: cache-first strategy; navigation falls back to cached index.html offline
- NOT registered on `file://`
### Admin `localStorage` State
- Key: `<short-name-slug>_admin_v1` (per-instance, so multiple directories don't clash)
- Shape: `{ site_patch:{...}, dept_patches:[...], rank_patches:[...], added:[...], edits:{}, archived:[], nextId:10000 }`
- Merge: start from `window.DATA`, apply patches, append added, apply edits/archived flags
- Built-in contacts (non-`local:` IDs) cannot be deleted, only edited/archived
### CSV Import/Export
- Template columns: `bn_name,name,category,dept_key,bn_designation,mobile,email`
- Image column: accepts URL or relative path; local file upload via separate photo batch upload UI
- Validation: skips rows without Bengali name + mobile, shows summary of successes/errors
### vCard (.vcf) Import
- Parse VERSION, FN, TEL, EMAIL, ORG, TITLE, PHOTO fields
- Map ORG → department, TITLE → designation (match via rank patterns)
- Photos embedded as base64 preserved; resize to 220px
### ZIP Export (full site download)
- Bundle all files: index.html, admin.html, app.js, admin.js, style.css, data.js, sw.js, manifest.json, push.bat, push.sh, README.md, images/
- Inject current `window.DATA` into data.js
- Trigger browser download of `.zip` blob via JSZip library (inlined or lightweight custom ZIP)
---
## 6. VALIDATION & ERROR HANDLING
### Form Validation
- Required: Bengali name, department, designation, valid phone
- Email: HTML5 email type validation
- Photo: accept image/* only, max 10MB per file (auto-compressed)
- Mobile: configurable pattern, default BD 11-digit format
### Error Handling
- Broken images → initial avatar fallback (no broken icon)
- Invalid JSON/CSV/vCard import → error summary, no partial state corruption
- SW registration failure → console warn, page continues online
- Web Share unavailable → clipboard fallback; clipboard failure → toast shows URL
- Color input invalid → fallback to primary
### Bengali UI Messages (default; all configurable via admin settings)
| Scenario | Default |
|----------|---------|
| No results | কোনো কন্টাক্ট পাওয়া যায়নি |
| Link copied | লিঙ্ক কপি হয়েছে |
| Contact added | কন্টাক্ট যোগ হয়েছে ✅ — data.js ডাউনলোড করুন |
| Saved | সেভ হয়েছে ✅ |
| Archived | আর্কাইভ করা হয়েছে |
| Restored | ফিরিয়ে আনা হয়েছে |
| Deleted | মুছে ফেলা হয়েছে |
| Import success | ইমপোর্ট সফল ✅ |
| Session reset | রিসেট করা হয়েছে |
| Download ready | data.js ডাউনলোড শুরু হয়েছে — রিপ্লেস করে push করুন |
| Missing number | নম্বর নেই |
| Delete confirmation | স্থায়ীভাবে মুছে ফেলবেন? |
| Reset warning | সব স্থানীয় পরিবর্তন মুছে ফেলবেন? (ফাইল বা গিটে প্রভাব নেই) |
| Git not installed | [ERROR] Git ইনস্টল করা নেই। https://git-scm.com/download/win |
| Admin localStorage warning | ⚠️ গুরুত্বপূর্ণ: এখানে করা পরিবর্তন শুধু ব্রাউজার মেমরিতে থাকে — ডাউনলোড না করা পর্যন্ত লাইভ হবে না। |
---
## 7. TECHNICAL REQUIREMENTS
### Stack Rules
1. **Vanilla HTML/CSS/JS only** — no React/Vue/jQuery, no build tools, no npm, no bundlers required for runtime. (JSZip may be vendored as minified JS for ZIP export.)
2. **Must work via `file://`** — all data via `<script>` tag globals, no `fetch()`/ES modules for core data (avoid CORS).
3. **Fully static hosting** — zero server-side code, zero databases, zero APIs.
4. **Responsive** 320px–4K screens.
5. **Viewport lock** (`overflow:hidden`, `height:100dvh`) scoped to `body:has(.app)` so it only applies to `index.html`; `admin.html` scrolls normally.
6. **`100dvh`** (dynamic viewport height) instead of `100vh` for mobile address bar handling.
7. **WCAG touch targets** minimum 38×38px.
8. **Bengali-first UI** (all user-visible strings configurable in admin).
9. **Photos optimized**: JPEG ≤220px, <20KB per photo; total site <1MB compressed.
10. **SW cache version bumped** on every asset/data change.
### Security & Privacy
- No public admin controls on `index.html`
- Security-by-obscurity for admin (unlisted URL, `robots.txt`, `noindex,nofollow`)
- No tracking, analytics, or third-party scripts except Font Awesome (bundled or cdnjs-cached)
- 100% client-side processing — no data sent to external servers
- Optional PIN/password for admin may be added in future (v3+) — see §11
### Browser Compatibility
- Evergreen desktop + mobile browsers (Chrome 100+, Safari 15+, Firefox 100+, Edge 100+)
- Graceful JS-fail: static contact list still readable if JS disabled (via noscript fallback)
- `file://`: full core features work; SW/PWA disabled per browser security
---
## 8. FINAL FILE / FOLDER STRUCTURE
```
institute-directory/
├── index.html              # Public PWA directory (no admin links)
├── admin.html              # Secret admin panel (noindex, nofollow)
├── app.js                  # Public rendering: config load, render, search, sort, tabs, SW
├── admin.js                # Admin logic: settings CRUD, contacts CRUD, CSV/vCard, ZIP export
├── data.js                 # Single source of truth: window.DATA = {site,departments,ranks,contacts}
├── sw.js                   # Service Worker (cache-first, offline)
├── style.css               # CSS custom properties for theming; styles for public+admin
├── manifest.json           # PWA manifest (auto-filled from site config at runtime)
├── robots.txt              # Disallow: /admin.html
├── .gitignore
├── push.bat                # Windows one-click git add/commit/push to main
├── push.sh                 # Mac/Linux one-click push
├── init-repo.bat           # First-time git init + remote add + initial commit
├── README.md               # Bangla deployment/admin docs
├── lib/
│   └── jszip.min.js        # Vendored for full-site ZIP export (optional if CDN used)
└── images/
    ├── logo.png            # Institution logo (admin-uploadable)
    ├── icons/
    │   ├── icon-192.png
    │   ├── icon-512.png
    │   └── icon.svg
    └── contacts/           # All contact photos (admin-uploaded; auto-named)
```
---
## 9. FINAL USER FLOW
### First-time Setup (Admin)
1. Download starter template zip
2. Open `admin.html` in browser
3. Go to **Site Settings** → set institution name, upload logo, choose brand color, customize footer/zoom note
4. Go to **Departments** → add/rename/reorder departments (or import CSV with departments)
5. Go to **Designations/Ranks** → adjust ranks to match institution organogram
6. Add contacts one-by-one via **Add Contact**, or batch import via CSV/vCard
7. Go to **Data & Deploy** → download full site as ZIP
8. Drag ZIP contents to Netlify Drop / upload to GitHub → live in 30 seconds
9. Share URL / QR code with community
### Ongoing Updates (Admin)
1. Visit `/admin.html` on live site
2. Add/edit/archive contacts (changes saved to localStorage as they go)
3. Click **Download full site ZIP** in Data & Deploy tab
4. Unzip, replace local project, run `push.bat` (or re-drag to Netlify Drop)
5. SW cache bump ensures users get new version on next visit
### Public User
1. Visit URL / open installed PWA
2. Search, tap tabs, tap green phone icon to call
3. Archive tab shows former/transferred contacts
4. "Add to Home Screen" to install as offline app
---
## 10. FINAL CONSTRAINTS / NEVER VIOLATE
1. 🚫 No admin/gear/edit controls visible on public `index.html`
2. 🚫 No link to `admin.html` anywhere on public page
3. 🚫 Clicking card body (except green call button) must NOT trigger calls
4. 🚫 Archive tab must always be visible (even with 0 archived contacts)
5. 🚫 `data.js` must assign to `window.DATA` (or `window.CONTACTS` for v1 compat), never top-level `const` (breaks `file://`)
6. 🚫 Viewport lock must NOT apply to `admin.html` (admin must scroll normally)
7. 🚫 Bengali is default primary UI language (admin can translate, but Bangla strings are default)
8. 🚫 Sticky header contains ONLY search + tabs; title/logo/zoom scroll away
9. 🚫 SW cache version must be bumped on every asset/data change
10. 🚫 No code edits required from admin after initial setup — all customization via admin UI
11. 🚫 No tracking/analytics scripts
12. 🚫 Do not modify code unless user uses explicit keyword "update" (conversation rule)
---
## 11. KNOWN LIMITATIONS
1. SW/PWA offline features require HTTP/HTTPS hosting (no `file://` SW)
2. Source PDF parsing (as done for CBPI) is NOT part of universal version — admin provides contacts via form/CSV/vCard
3. Photos for bulk CSV import must be uploaded separately or hosted externally; vCard embedded photos handled automatically
4. `:has()` CSS selector for viewport scoping not supported pre-2022 Firefox; graceful degradation (page scrolls normally, sticky still works)
5. Multi-admin real-time collaboration not supported (single-editor workflow — last download wins)
6. No server-side auth for admin; URL secrecy + robots.txt is security baseline
### UNFINALIZED / OPTIONAL FUTURE FEATURES
- Optional PIN/password for admin panel (hashed, client-side)
- Dark mode toggle
- QR code generation for public URL share
- SMS/WhatsApp share button
- Contact vCard download per card
- Multi-language UI toggle
- Backup/restore of entire site config via JSON
- Automatic GitHub commit/push via admin panel (requires GitHub OAuth — requires backend)
---
## 12. DEVELOPMENT HISTORY / KEY BUG FIXES (Context)
For reference when rebuilding:
1. **Horizontal overflow** — fixed-position elements escaped centered container; resolved with bounded `.app` flex column + `overflow-x:hidden`
2. **0 contacts after admin export** — admin wrote `const CONTACTS =` instead of `window.CONTACTS =`, breaking file://; fixed to always use window assignment
3. **Admin scroll lock** — global viewport overflow:hidden prevented admin scroll; scoped to `body:has(.app)` so only index locks
4. **Nested scroll jank** — fixed-height contact list caused viewport issues; replaced with single middle flex scroll container
5. **Green color bleed behind cards** — hardcoded gradient fixed by applying brand gradient only to individual bands (hero/sticky/zoom)
6. **White stripe gap** — margin collapse between bands; fixed with overflow:hidden + unified padding
7. **Footer spanning full viewport** — fixed by placing footer inside bounded `.app` flex container instead of `position:fixed`
8. **Image bloat** — original 1.8MB principal photo compressed to 11KB; all photos auto-resized/compressed on upload
9. **PDF ligature issues** (CBPI-specific) — PyMuPDF used for extraction; not part of universal build
---
## 13. FINAL BUILD CHECKLIST (100% pass required before release)
1.  ✅ `index.html` works via `file://` with no console errors
2.  ✅ `admin.html` scrolls normally on all screen sizes; accessible via direct URL only
3.  ✅ Search + tabs stick to top while scrolling; title/logo/zoom scroll out
4.  ✅ Archive tab always visible (0+ count)
5.  ✅ Only green call button triggers `tel:`; card body click does nothing
6.  ✅ Footer displays configured credit, pinned within app container (no full-viewport bleed)
7.  ✅ Zoom bar shows configured note between +/-/↑
8.  ✅ Admin export produces `data.js` starting with `window.DATA =` (or `window.CONTACTS =`)
9.  ✅ Phone numbers sanitized before `tel:` insertion
10. ✅ No horizontal scrollbars at any viewport 320px–4K
11. ✅ No color bleed / stripe gaps in header area
12. ✅ SW registers on http/https, cache version correctly bumped
13. ✅ `robots.txt` disallows `/admin.html`; admin page has `noindex,nofollow`
14. ✅ Contacts sort by rank then Bengali name using `Intl.Collator("bn")`
15. ✅ Admin photo upload resizes to 220px JPEG, generates base64
16. ✅ PWA manifest valid; install prompt works; all icons present
17. ✅ All tabs generated from site config, with 0-count tabs hidden (except Archive)
18. ✅ Total site payload <1MB (excluding photos); photos <20KB each
19. ✅ `push.bat`/`push.sh`/`init-repo.bat` functional on respective OSes
20. ✅ Bengali text renders correctly without overflow/ligature breakage
21. ✅ Theme color customization propagates to header, buttons, active tab, borders, favicon theme
22. ✅ Logo upload updates header and PWA icons
23. ✅ CSV import validates rows, reports errors, preserves valid entries
24. ✅ vCard import correctly parses names/phones/emails/titles
25. ✅ Full-site ZIP export produces deployable bundle openable via `file://` and hostable on Netlify
26. ✅ Departments/ranks CRUD works with drag-reorder, delete protection for All/Archive
---
*This specification is the single source of truth for rebuilding the Universal Offline PWA Phone Directory. Any implementation that satisfies §10 (NEVER VIOLATE) and passes §13 (Checklist) is considered a correct implementation.*
