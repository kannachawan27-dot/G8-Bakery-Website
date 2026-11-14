# G8 Bakery — updated project files

## Files
- `FSD.html`, `FSD.css`, `FSD.js`: customer website
- `onwer.html`, `onwer.js`: admin dashboard
- `onwer-login.html`, `onwer-login.js`: demo admin login (username `kanna`, password `kanna@143`)
- `server.js`, `package.json`: optional Express + SQLite API starter

## Added in this update
1. 10% early-bird discount when pickup is at least 7 calendar days ahead.
2. Discounted amount is saved with the booking and shown in the receipt/admin export.
3. Customer printable itemized receipt (Print / Save as PDF).
4. Admin receipt action for each order.
5. Cake inspiration image upload and preview (reference image only; browser demo stores it in localStorage).
6. Purchase order sheet from active orders; Print dialog can save it as PDF.
7. Ingredient forecast refresh after status changes and cross-tab storage updates.

## Run the website
Keep all five front-end files in the same folder and open `FSD.html` with Live Server.
The admin dashboard is `onwer.html`.

## Optional API starter
The supplied customer/admin JavaScript still uses localStorage for compatibility with the existing browser demo. The Express/SQLite API is a separate starter and is **not yet wired into the front end**.
To start it:
1. Install Node.js.
2. Open a terminal in this folder.
3. Run `npm install`
4. Run `npm start`
5. Open `http://localhost:3000/api/health`

## Important notes
- Ingredient quantities are sample estimates, not a bakery-approved recipe.
- Early-bird rate is set to 10% as a project default in `FSD.js`; change `EARLY_BIRD_DISCOUNT` if your project specification gives a different rate.
- Image upload is limited to 2 MB and is a visual reference, not a true 3D cake render or crop editor.
- The front-end login remains a demo-only browser/session check, not secure production authentication.
