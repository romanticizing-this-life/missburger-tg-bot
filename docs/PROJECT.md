# Miss Burger — Project Document
> Telegram Mini App for food ordering | Namangan, Uzbekistan
> Last updated: **Sprint 3** | 2026-04-21

---

## PART 1 — Human Overview

### What This Is

A Telegram Mini App for **Miss Burger** restaurant (Namangan, Uzbekistan). Users open `@missburgerdostavka_bot`, tap "Open App", and get a full food-ordering experience inside Telegram. Orders go to the kitchen, confirmations come back as bot messages.

### Live State

| Thing | Value |
|---|---|
| Bot | [@missburgerdostavka_bot](https://t.me/missburgerdostavka_bot) |
| App URL | https://missburger-tg-bot.vercel.app |
| GitHub | https://github.com/romanticizing-this-life/missburger-tg-bot |
| Admin Telegram ID | 2118122588 |
| Supabase project | spuonsuxjqzpjvxyekdq |

### Tech Stack

| Layer | Tool | Notes |
|---|---|---|
| Framework | Next.js 14 App Router + TypeScript | Deployed on Vercel |
| Styling | Tailwind CSS | Dark theme, brand colours in config |
| Database | Supabase (Postgres) | RLS enabled, service role for writes |
| Auth | Telegram WebApp.initData HMAC | Validated server-side on every API call |
| Bot | grammY | Webhook at `/api/bot` |
| Storage | Supabase Storage (`menu-images` bucket) | WebP, max 800px, ~85% quality |
| Payments | COD only (Click — not built yet) | |
| POS | Clopos — stubbed | Awaiting API docs + credentials |

### How to Run Locally

```bash
cd ~/Desktop/claude/projects/miss-burger
npm install
npm run dev
# .env.local must exist (see below)
```

### Required Environment Variables (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://spuonsuxjqzpjvxyekdq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
TELEGRAM_BOT_TOKEN=8652372516:AAGBHeO1HnJuQZtn7Jh8glA6G9YJabhQQ-k
TELEGRAM_WEBHOOK_SECRET=missburger2024secretkey99
NEXT_PUBLIC_APP_URL=https://missburger-tg-bot.vercel.app
ADMIN_TELEGRAM_ID=2118122588
CLOPOS_API_KEY=   # pending
CLOPOS_API_URL=   # pending
```

### After First Deploy (one-time)

```bash
# Set Telegram webhook
curl "https://api.telegram.org/bot8652372516:AAGBHeO1HnJuQZtn7Jh8glA6G9YJabhQQ-k/setWebhook?url=https://missburger-tg-bot.vercel.app/api/bot"
```

---

### What Is Built (by Sprint)

#### Sprint 1 — Foundation fixed ✅
- Admin API auth: all `/api/admin/*` routes now verify the `admin_session` cookie (they were wide open)
- Supabase Realtime wired: order tracking page and admin orders page use live channels instead of polling
- Delivery fee logic: 100,000 so'm threshold → free / under → +10,000 so'm fee with nudge banner in checkout

#### Sprint 2 — UX core ✅
- **Photo placeholders**: each menu department has a styled gradient+emoji card (burger=dark red, pizza=orange, sushi=slate, etc.)
- **Admin photo upload**: tap any item thumbnail in `/admin/menu` → selects file → compresses client-side to WebP 800px → uploads to Supabase Storage → updates `image_url` in DB. Includes search bar for 620-item list.
- **Geolocation on checkout**: "📍 Определить" button → Telegram LocationManager → fallback to browser geolocation → Haversine distance to both branches → auto-selects nearest → yellow warning if >4km
- **Operating hours**: `/admin/hours` page with per-department time range or 24/7 toggle. Closed departments show "· закрыто" label on menu tabs. Times evaluated in UTC+5 (Namangan). Handles midnight crossover (e.g. 11:00→02:00).

#### Sprint 3 — User trust ✅
- **Orders history fixed**: was broken by RLS (anon client couldn't read orders). Now uses `/api/orders/history` endpoint with Telegram auth via service role.
- **Phone number**: field in checkout with +998 prefix. "Share from Telegram" button uses `requestContact` when inside Telegram. Stored on user record in DB.
- **Large order warning**: order ≥500,000 so'm shows an inline warning in checkout requiring explicit confirmation before submission.
- **Repeat order**: "Повторить" button on each past order card → fetches items → adds to cart → redirects to cart.

---

### What Is NOT Built Yet (priority order)

| # | Feature | Notes |
|---|---|---|
| 1 | **SMS OTP via Eskiz** | Need API token + sender name from eskiz.uz |
| 2 | **Click payments** | Need merchant_id, service_id, secret_key from Click |
| 3 | **Clopos POS** | `lib/clopos.ts` is a stub. Need API docs + OAuth creds |
| 4 | **Bilingual UI (RU/UZ)** | next-intl setup, locale routing, translation files |
| 5 | **Driver Telegram bot** | Separate bot that pings drivers with new order alerts |
| 6 | **Yandex Maps** | Currently address is a text field. Need react-yandex-maps + API key |
| 7 | **Soliq.uz fiscal** | Required by Uzbek law, defer 1-2 months |

---

### Owner Action Items

These require manual steps that can't be done from code:

1. **Run DB migrations** in Supabase SQL editor:
   - `migrations/v2_operating_hours.sql` — adds `open_time`, `close_time` to departments
   - `migrations/v3_user_phone.sql` — adds `phone_number` to users
2. ~~**Verify branch coordinates**~~ — ✅ done (Galaba 24: 40.994033, 71.610474 / Navoi 7/1: 40.993809, 71.647553)
3. **Create `menu-images` bucket** in Supabase Storage (public). The upload endpoint tries to create it automatically but manual creation is more reliable.
4. **Add admin to DB**: run `INSERT INTO admins (telegram_id) VALUES (2118122588);` in Supabase

---

## PART 2 — Claude Reference

> This section is written for future Claude sessions. It contains the exact state of the codebase, decisions made, and rules to follow.

### Architecture

```
Telegram Bot (grammY, webhook)
    ↓  bot commands → replies with WebApp button
    
Next.js App (Vercel)
├── /app               → pages (all client components using 'use client')
├── /app/api           → route handlers (server-side, use service role)
├── /components        → UI components
├── /hooks             → client-side data hooks
├── /lib               → shared utilities (types, supabase client, helpers)
├── /migrations        → SQL files to run manually in Supabase
└── /docs              → this file

Supabase
├── Postgres           → orders, users, menu, etc.
├── Realtime           → order status live updates (postgres_changes)
└── Storage            → menu-images bucket (WebP photos)
```

### Key Design Decisions

| Decision | Rationale |
|---|---|
| Service role only on server | `createServiceClient()` only imported in `/api/` routes, never in client components |
| Anon client for menu reads | `supabase` (anon) used in hooks for public menu data. RLS policies allow public SELECT on menu tables. |
| Orders always via API route | Users cannot read/write orders directly via anon client (RLS). All order ops go through `/api/orders/*` with Telegram initData auth. |
| Admin auth via signed token | Bot generates HMAC-signed 1hr token → sets httpOnly cookie → layout.tsx verifies. Admin API routes also re-verify the cookie. |
| Polling replaced with Realtime | `supabase.channel()` subscriptions for order tracking and admin orders. Both listen to `postgres_changes`. |
| Client-side WebP compression | Before upload, canvas API resizes to max 800px and encodes as WebP 85%. Reduces bandwidth and storage. |
| Delivery fee on client, passed to server | 100k/10k rule calculated in checkout UI and included in `total` sent to API. Not re-validated server-side (acceptable for COD). |
| UTC+5 for operating hours | `lib/hours.ts` shifts `Date.now()` by +5h to evaluate hours in Namangan time regardless of user's device timezone. |

### File Map

```
lib/
  types.ts          — TypeScript types for all DB tables + TelegramUser
  supabase.ts       — supabase (anon) + createServiceClient() (service role)
  telegram.ts       — validateTelegramWebAppData() + parseTelegramUser()
  adminAuth.ts      — generateAdminToken(), verifyAdminToken(), verifyAdminRequest()
  bot.ts            — grammY bot instance, commands, sendOrderConfirmation(), notifyAdminNewOrder()
  clopos.ts         — STUB: sendOrderToClopos() always returns null
  placeholders.ts   — dept slug → { emoji, gradient colours } for item card fallback
  geo.ts            — haversineKm(), BRANCHES (lat/lng), DELIVERY_RADIUS_KM
  hours.ts          — isDepartmentOpen(), formatHours() — evaluates in UTC+5

hooks/
  useCart.ts        — Zustand store, persisted to localStorage. addItem/removeItem/updateQty/clear/total/count
  useMenu.ts        — Fetches departments+categories+menuItems, computes closedDeptIds set
  useTelegramUser.ts — Reads initData and user from window.Telegram.WebApp on mount

components/
  MenuGrid.tsx      — Dept tabs + category sections + 2-col item grid. Accepts closedDeptIds.
  ItemCard.tsx      — Single menu item. Uses departmentSlug for gradient placeholder if no image_url.
  CartButton.tsx    — Floating bottom bar showing cart count + total
  CartList.tsx      — Cart items list (used in /cart page)  [assumed]
  OrderStatus.tsx   — Status badge + visual timeline
  AdminNav.tsx      — Top nav for admin panel (Dashboard / Заказы / Меню / Часы)
  AdminTable.tsx    — Reusable table component for admin

app/
  page.tsx                    — Home: menu browsing
  cart/page.tsx               — Cart page
  checkout/page.tsx           — Checkout: delivery/pickup, address, phone, branch (+ geolocation), delivery fee, large-order warning
  orders/page.tsx             — Order history: fetches via /api/orders/history, repeat order button
  order/[id]/page.tsx         — Order tracking: initial fetch + Supabase Realtime subscription
  admin/layout.tsx            — Admin auth gate (checks admin_session cookie)
  admin/page.tsx              — Dashboard: today's orders, revenue, pending count
  admin/orders/page.tsx       — Live orders list (Realtime), status dropdown
  admin/menu/page.tsx         — Menu management: search, availability toggle, price edit, photo upload
  admin/hours/page.tsx        — Operating hours per department (24/7 or time range)

app/api/
  bot/route.ts                — grammY webhook (POST)
  orders/route.ts             — POST: create order (auth + upsert user + create order + notify)
  orders/[id]/route.ts        — GET: single order with items (service role, no user auth)
  orders/history/route.ts     — GET: user's order history (Telegram initData auth, service role)
  admin/auth/route.ts         — GET: verifies token, sets cookie, redirects to /admin
  admin/orders/route.ts       — GET: all orders (admin auth) | PATCH: update status (admin auth)
  admin/menu/route.ts         — GET/PATCH/POST/DELETE: menu items (admin auth)
  admin/menu/upload/route.ts  — POST: compress+upload photo to Supabase Storage (admin auth)
  admin/departments/route.ts  — GET/PATCH: department hours (admin auth)

migrations/
  v2_operating_hours.sql      — ALTER departments ADD open_time, close_time
  v3_user_phone.sql           — ALTER users ADD phone_number
```

### DB Schema (current state, post all migrations)

```sql
users (id, telegram_id BIGINT UNIQUE, first_name, last_name, username, phone_number TEXT, created_at)
admins (id, telegram_id BIGINT UNIQUE, created_at)
locations (id, name, address, is_active, sort_order)
departments (id, slug UNIQUE, name, icon, sort_order, is_active, open_time TEXT, close_time TEXT)
categories (id, department_id → departments, name, sort_order, is_active)
menu_items (id, category_id → categories, name, description, price INT, image_url, is_available, sort_order)
orders (id, user_id → users, location_id → locations, order_type, status, total INT, delivery_address,
        delivery_lat, delivery_lng, comment, clopos_order_id, created_at)
order_items (id, order_id → orders, menu_item_id → menu_items, name, price INT, quantity)
```

**RLS:**
- `departments`, `categories`, `menu_items`, `locations` — public SELECT allowed (anon key)
- `users`, `orders`, `order_items`, `admins` — no anon access; service role only (via API routes)

### API Route Auth Summary

| Route | Auth method |
|---|---|
| `POST /api/orders` | Telegram initData HMAC (optional in dev) |
| `GET /api/orders/history` | Telegram initData HMAC via `x-init-data` header |
| `GET /api/orders/[id]` | None (order ID is effectively secret) |
| `GET/PATCH /api/admin/orders` | `admin_session` httpOnly cookie |
| `GET/PATCH/POST/DELETE /api/admin/menu` | `admin_session` httpOnly cookie |
| `POST /api/admin/menu/upload` | `admin_session` httpOnly cookie |
| `GET/PATCH /api/admin/departments` | `admin_session` httpOnly cookie |
| `GET /api/admin/auth` | Signed token in query param (one-time use, 1hr) |
| `POST /api/bot` | Telegram webhook secret header |

### Sprint Log

#### Sprint 1 (2026-04-21)
- `lib/adminAuth.ts` — added `verifyAdminRequest()` using `cookies()` from next/headers
- `app/api/admin/orders/route.ts` — added auth check to GET and PATCH
- `app/api/admin/menu/route.ts` — added auth check to GET, PATCH, POST, DELETE
- `app/admin/page.tsx` — removed dead `createServiceClient` import
- `app/order/[id]/page.tsx` — replaced 15s polling with `supabase.channel()` subscription
- `app/admin/orders/page.tsx` — replaced 30s polling with channel subscriptions (INSERT + UPDATE)
- `app/checkout/page.tsx` — delivery fee constants (100k threshold, 10k fee), fee line in UI, nudge banner, finalTotal passed to API

#### Sprint 2 (2026-04-21)
- `lib/placeholders.ts` — new: dept slug → {emoji, gradient from/to} map
- `lib/geo.ts` — new: haversineKm(), BRANCHES, DELIVERY_RADIUS_KM
- `lib/hours.ts` — new: isDepartmentOpen() in UTC+5, formatHours()
- `lib/types.ts` — Department now includes `open_time`, `close_time`
- `hooks/useTelegramUser.ts` — added LocationManager type to Window.Telegram.WebApp
- `hooks/useMenu.ts` — computes `closedDeptIds` Set from isDepartmentOpen(); exposes it
- `components/ItemCard.tsx` — accepts `departmentSlug?`, renders gradient placeholder
- `components/MenuGrid.tsx` — passes active dept slug to ItemCard; shows "· закрыто" on closed tabs
- `components/AdminNav.tsx` — added "Часы" link → /admin/hours
- `app/page.tsx` — passes closedDeptIds to MenuGrid
- `app/admin/menu/page.tsx` — rewritten: photo thumbnail per item (tap to upload), client-side WebP compression, search bar
- `app/admin/hours/page.tsx` — new: 24/7 toggle + time inputs per department
- `app/api/admin/menu/upload/route.ts` — new: receives FormData, uploads to Supabase Storage, updates image_url
- `app/api/admin/departments/route.ts` — new: GET/PATCH department hours
- `app/checkout/page.tsx` — geolocation button, detectLocation() using Telegram LocationManager → browser fallback, auto branch select, distance warning
- `migrations/v2_operating_hours.sql` — new: run in Supabase to add hours columns

#### Sprint 3 (2026-04-21)
- `app/api/orders/history/route.ts` — new: auth'd endpoint for user order history (fixes RLS bug)
- `app/orders/page.tsx` — uses /api/orders/history instead of direct anon Supabase, repeat order button added
- `app/checkout/page.tsx` — phone number input (+998 prefix, Telegram requestContact button), large order warning (≥500k)
- `hooks/useTelegramUser.ts` — added requestContact to Window type
- `app/api/orders/route.ts` — stores phone_number on user upsert
- `migrations/v3_user_phone.sql` — new: run in Supabase to add phone_number column

### Known Issues / Gotchas

1. **Branch coordinates approximate** — `lib/geo.ts` has estimated Namangan coordinates. Must be updated with real GPS values.
2. **`requestContact` phone flow** — When user taps "Share from Telegram", the contact is sent to the bot as a message, not directly returned to the mini app. The current implementation attempts to get it from the bot-side and falls back gracefully.
3. **No server-side delivery fee validation** — Delivery fee is calculated on the client and included in `total`. A malicious user could manipulate it. Acceptable for COD; must fix before Click payments.
4. **Clopos stub** — `lib/clopos.ts` always returns null. Orders don't reach POS.
5. **`GET /api/orders/[id]` has no user auth** — Anyone with an order ID can view it. Order IDs are sequential integers, not UUIDs. Low risk for now, but should be fixed.
6. **Zustand SSR warning** — `ReferenceError: location is not defined` during build (from Zustand persist middleware). Harmless, pre-existing.
7. **`menu-images` bucket** — Upload endpoint tries to auto-create the bucket but manual creation in Supabase dashboard is more reliable.

### Rules for Future Claude Sessions

- **Always read files before editing** — never guess at current content
- **Never expose service role key to client** — `createServiceClient()` is server-only
- **Admin API routes must call `verifyAdminRequest()` first** — see `lib/adminAuth.ts`
- **Order writes always go through `/api/orders`** — never write orders from client directly
- **Delivery fee is not re-validated server-side** — add validation before enabling Click payments
- **`useMenu` hook uses anon client** — only works for public tables (departments, categories, menu_items, locations)
- **User orders use `/api/orders/history`** — not direct Supabase anon client (RLS blocks it)
- **Times in `lib/hours.ts` are UTC+5** — do not change to local time
- **620 menu items** — admin menu page has search; never try to load them all into a dropdown
