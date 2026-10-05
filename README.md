# Kav Cafe (كاف كافيه) — ordering app demo

Clickable design preview of an ordering app for **Kav Cafe** (instagram.com/kav.cafe, Dammam · Qatif · Drive Thru),
built from the unbranded `~/cafe-demo`. React + Vite + Tailwind CSS. Local data only; orders and payments are simulated.

## Run

```bash
npm install
npm run dev        # http://localhost:5195  (also on your Wi-Fi IP, port 5195, for a phone)
```

| App | Live | Code |
|---|---|---|
| Phone-frame app demo | https://yousifhimself-peep.github.io/kav-cafe/ | `src/` (screens, components) |
| Full-screen website (desktop + phone) | https://yousifhimself-peep.github.io/kav-cafe/site/ | `src/site/` (reuses bag/checkout/order screens) |
| Admin / Staff Portal | https://yousifhimself-peep.github.io/kav-cafe/admin/ | `src/admin/` |
| Inventory count (جرد) + dashboard | https://yousifhimself-peep.github.io/kav-cafe/inventory/ | `src/inventory/` |

Portal pages: live orders (branch + type filters), menu & stock (edit price/name/description/photo, add, hide, feature),
branches (close for the day, today's numbers), reports (+ CSV export), offers & promo codes (banner + codes that work at
checkout), loyalty rules, customers & reviews, push notifications (pop up live in the open app/site), staff & roles, settings.
Everything is shared through localStorage (`kav-*` keys, `src/shared/storage.js` → `CONTENT`, `src/shared/catalog.js`),
so in one browser a change in the portal shows instantly in both customer versions.

Demo staff sign-in (no passwords): **Staff / Barista** or **Admin / Manager**. Both apps share localStorage
(`kav-*` keys), so an order placed in the app shows up on the staff board live.

## Inventory count (`/inventory/`)

Daily stock count for each branch + management dashboard, a copy of the Nira inventory trial (`~/nira-inventory`) with
Kav's logo, colours and 7 branches. Self-contained in `src/inventory/` with its own `styles.css` theme and localStorage
keys (`kav-inventory-v1`, `kav-inv-*`), so it doesn't touch the ordering demo.
Demo logins: staff password `1234`; dashboard at `/inventory/#/admin`, `manager` / `1234`.
`src/inventory/items.csv` is a **proposed** item list built from the menu (minimums and order quantities are guesses):
replace it with Kav's real count list; the app reads it directly.

## What came from Kav's Instagram

| Where | What |
|---|---|
| `src/data/menu.js` → `menu` | Full menu from the "المنيو" highlight: 5 categories, ~42 items, real prices and calories |
| `public/assets/menu/<id>.jpg` | Product photos cut from the menu pages (480px source, so they're shown small / uncropped) |
| `public/assets/menu/_*.jpg` | Hero and category photos from their posts (green cups, cold brew, latte art, cheesecake) |
| `public/assets/logo-*.png`, `icon.png`, `favicon.png` | Logo traced from a post, in cream and maroon |
| `src/data/menu.js` → `branches` | 5 branches + hours from the "أوقات العمل" highlight (drive-thru, hospitals, Al Aziziyah) |
| `src/styles.css` → `@theme` | Kav green (cups), maroon (logo), cream (menu), gold (cup pattern); ornament texture |

## Still placeholders — confirm with Kav

- Item descriptions (except sandwich fillings) and all allergens.
- Milk / shot / ice / sandwich add-on options and their prices (marked "Sample" in the app).
- Two newer branches have no published hours yet, so they're not in the picker:
  King Fahd Specialist Hospital (Dammam, opened 30 Aug) and Al Salam district (King Abdulaziz St).
- Espresso Shake (posted, branch 2 only) isn't on the menu highlight, so it's not in the app.
- Delivery (fee, zones), payment, loyalty rules; no phone number is listed, so branches link to Google Maps instead.

## Publish

Source is on `main` of github.com/yousifhimself-peep/kav-cafe (public). `npm run deploy` builds with the `/kav-cafe/`
base and force-pushes `dist/` to `gh-pages`, which GitHub Pages serves.
