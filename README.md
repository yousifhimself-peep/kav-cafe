# Kav Cafe (كاف كافيه) — ordering app demo

Clickable design preview of an ordering app for **Kav Cafe** (instagram.com/kav.cafe, Dammam · Qatif · Drive Thru),
built from the unbranded `~/cafe-demo`. React + Vite + Tailwind CSS. Local data only; orders and payments are simulated.

## Run

```bash
npm install
npm run dev        # http://localhost:5195  (also on your Wi-Fi IP, port 5195, for a phone)
```

| App | URL | Code |
|---|---|---|
| Customer ordering app | `/` | `src/` (screens, components) |
| Admin / Staff Portal | `/admin/` | `src/admin/` |

Demo staff sign-in (no passwords): **Staff / Barista** or **Admin / Manager**. Both apps share localStorage
(`kav-*` keys), so an order placed in the app shows up on the staff board live.

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

## Publish (not done yet)

`npm run deploy` builds with the `/kav-cafe/` base and force-pushes `dist/` to the `gh-pages` branch of
`yousifhimself-peep/kav-cafe` — that repo has to exist first, and it makes the demo public.
