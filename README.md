# Smart Analysis — company website

Single-page, static website (HTML + CSS + vanilla JS). No build step.

## Structure
```
index.html              All page content, split into clearly commented sections
assets/css/styles.css   All styling (brand colours & fonts in :root at the top)
assets/js/main.js       SITE_CONFIG (WhatsApp numbers, form inbox), nav, animations, QR codes, contact form
assets/images/          Logos, favicons, social share image (og-image.jpg)
netlify.toml / vercel.json   Deploy config
robots.txt / sitemap.xml     SEO
```

## Edit checklist
1. `assets/js/main.js` → `SITE_CONFIG`: WhatsApp numbers (digits only, with country code) and the inbox for form messages.
   The WhatsApp QR code regenerates automatically.
2. `index.html` → office addresses (search for `[Street address]`), social links in the footer (`href="#"`),
   unique-feature cards (search for `UNIQUE FEATURES`).
3. Replace `https://www.example.com` in `index.html`, `robots.txt` and `sitemap.xml` with your domain.
4. Contact form: messages go to `formEmail` in `SITE_CONFIG` (`assets/js/main.js`) via FormSubmit.co.
   The first message from the live site sends an "Activate form" email to that inbox. Click it once.

## Run locally
```
npx serve .          # or: python3 -m http.server 8000
```
Then open http://localhost:3000 (or :8000).

## Deploy
- **Netlify:** drag the folder onto app.netlify.com/drop, or connect the Git repo (publish directory: `.`).
- **Vercel:** `npx vercel` in this folder, or import the Git repo (Framework preset: Other, no build command).
