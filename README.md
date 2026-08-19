# Build. Ship. Get Paid. — sales funnel

A two-page funnel for the e-book: a sales page and a post-payment download page.
Plain HTML, CSS and JavaScript. No build step, no framework, no backend.

```
funnel/
├── index.html            ← the sales page
├── thank-you.html        ← shown after successful payment
├── serve.ps1             local preview only (does not need uploading)
├── README.md             this file
└── assets/
    ├── css/funnel.css    all styling; design tokens at the top
    ├── js/config.js      ← THE ONLY FILE YOU NEED TO EDIT
    ├── js/funnel.js      behaviour (CTA wiring, reveals, lightbox)
    ├── files/             ← put the PDF here (optional; see DOWNLOAD_URL)
    └── img/
        ├── cover.png     book cover, rendered from the PDF
        ├── og-image.jpg  1200×630 social share image
        └── preview/      eight real pages from the book
```

---

## 1. What you must replace

Open **`assets/js/config.js`**. Everything is at the top, commented, in order.
Nothing else in the project needs editing.

| Variable | What to put there | Used by |
| --- | --- | --- |
| `RAZORPAY_BUTTON_ID` | Your Razorpay Payment Button id. Currently `"pl_TRfUmgNo6eigzb"` | The live checkout — the button in the offer section, and every other CTA triggers it |
| `PAYMENT_URL` | Fallback checkout link — already set to the hosted page for the same Razorpay button | Used if the Razorpay script is blocked, and as the entire checkout if you clear `RAZORPAY_BUTTON_ID` |
| `DOWNLOAD_URL` | The PDF. Either a path inside this project — `"assets/files/build-ship-get-paid.pdf"`, the smoothest option — or a full link to Drive / Dropbox / S3 | The download button on `thank-you.html` |
| `BOOK_PRICE` | The price exactly as you want it shown. **Currently set to `"₹350"`.** | The offer section, the hero line, the final CTA and the sticky mobile bar — all four read this one value |
| `REFUND_POLICY_PLACEHOLDER` | Your refund terms in your own words | One FAQ answer |
| `THANK_YOU_PAGE_URL` | The live address of `thank-you.html` once deployed | You paste this into your payment gateway (see §3). Also logged to the console as a reminder |
| `PAYMENT_METHODS` | What your gateway actually accepts. Currently `"UPI · Cards · Net Banking · Wallets"` | A small chip beside the buy button in the hero and in the offer section |

Two optional extras in the same file: `BOOK_COMPARE_AT` (a crossed-out "was"
price — only use one you genuinely charged) and `SUPPORT_EMAIL` (appears in the
FAQ and footer).

> **The price on the page is only a label.** `BOOK_PRICE` does not charge
> anyone — the gateway does. If you change the price, change it in *three*
> places or you will show one number and charge another: `BOOK_PRICE` here, the
> product on your gateway, and the `offers.price` value in the JSON-LD block
> near the top of `index.html` — currently `"price": "350.00", "priceCurrency": "INR"`
> (that one is what Google may show in search results, so a stale number there is
> worse than none).

### Sensible empty-state behaviour

Nothing ever shows a broken placeholder to a visitor:

- **`PAYMENT_URL` not set** → buy buttons scroll to the offer section instead of
  going nowhere, and a small "Setup reminder" box appears in the corner. It is
  impossible for that box to appear once the URL is filled in.
- **`BOOK_PRICE` empty** → the offer shows *"Price shown at checkout"* rather
  than an empty gap or the word `BOOK_PRICE`, and the three smaller price
  mentions remove themselves so no line is left dangling a stray separator.
- **`REFUND_POLICY_PLACEHOLDER` empty** → the refund question is removed from
  the FAQ entirely. No refund policy is invented on your behalf.
- **`BOOK_COMPARE_AT` empty** → no crossed-out price is shown.
- **`DOWNLOAD_URL` not set** → the download button on `thank-you.html` becomes
  an *"email us for your copy"* link, with a short note explaining that the file
  is coming by email. Someone has already paid by the time they reach that page,
  so it must never be a button that silently does nothing.

### Also worth updating before launch

In **`index.html`**, three absolute URLs still say `https://example.com`. Search
for `example.com` and replace with your real domain:

- `<link rel="canonical">`
- `og:url`
- `og:image` and `twitter:image` — these **must** be absolute URLs or
  Facebook, WhatsApp and LinkedIn will not show the preview image.

---


### Selling to Indian buyers — the one decision that matters

The page is set up for an Indian audience: price in rupees (₹350), `lang="en-IN"`,
INR in the structured data, British/Indian spelling throughout, and a visible
"UPI · Cards · Net Banking · Wallets" chip next to every buy button.

**That chip is only honest if your gateway actually takes UPI.** This is the
single biggest conversion decision for an Indian product at this price:

| Gateway | UPI | Notes |
| --- | --- | --- |
| **Razorpay** | Yes | Payment Links/Pages, INR settlement to an Indian bank. The default choice. |
| **Instamojo** | Yes | Simplest setup for a solo seller; built for digital products. |
| **Cashfree** / **PhonePe** | Yes | Fine alternatives. |
| Gumroad | **No** | Cards and PayPal only. A lot of Indian buyers will simply bounce. |
| Stripe | Partly | India support is limited and UPI is not available on most accounts. |

If you pick a gateway without UPI, edit `PAYMENT_METHODS` to say what it really
accepts (e.g. `"Cards · PayPal"`) — or set it to `""` to hide the chip. Promising
UPI and then not offering it at checkout loses the sale at the worst moment.

Also worth knowing: the benchmark figures in the "does the math" section stay in
US dollars because that is how the book prints them and how ad networks and
affiliate programmes actually pay. The page says so explicitly, so nobody
mistakes them for rupee amounts.

---

## 2. Preview it locally

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Then open <http://localhost:8090>. (Opening `index.html` by double-clicking
mostly works too, but some browsers restrict scripts on `file://`.)

---

## 3. How the payment flow works

You are using a **Razorpay Payment Button** (`pl_TRfUmgNo6eigzb`). That is an
embedded widget, not a redirect link, so the checkout opens *on top of* the
sales page instead of sending the buyer to another site.

```
        SALES PAGE  (index.html)
                │
                │  visitor clicks any GET THE E-BOOK button
                │  (hero, mid-page, offer, final, sticky bar, nav)
                ▼
    RAZORPAY CHECKOUT OVERLAY
    UPI / cards / net banking / wallets.
    Razorpay handles the money. This site never sees card or UPI details.
                │
                │  payment succeeds
                │  → Razorpay decides what happens next  ← SEE THE WARNING BELOW
                ▼
     THANK-YOU PAGE  (thank-you.html)
                │
                │  buyer clicks DOWNLOAD YOUR E-BOOK
                ▼
            THE PDF  (DOWNLOAD_URL)
```

The real Razorpay button (dark, "Secured by Razorpay") renders inside the offer
section — that is the actual checkout, with Razorpay's own branding intact. The
other five buttons are the page's crimson CTAs; clicking any of them opens the
very same checkout without scrolling anywhere.

### ⚠️ The one thing you must set up in the Razorpay dashboard

**A Payment Button does not redirect anywhere by default.** After a successful
payment Razorpay shows its own confirmation and emails a receipt — the buyer
stays on the sales page and never sees `thank-you.html` or the download button.

So, in the **Razorpay Dashboard → Payment Button → this button → edit**, find the
post-payment / redirect setting and paste your live thank-you URL (the same
string you put in `THANK_YOU_PAGE_URL`).

If your account does not offer a redirect for Payment Buttons, you have two
good options — pick one before you take real money:

1. **Use a Razorpay Payment Page or Payment Link instead.** Both support a
   custom redirect URL. Create one, put its URL in `PAYMENT_URL`, and set
   `RAZORPAY_BUTTON_ID` to `""`. The page then works as a plain redirect
   funnel and every button sends buyers straight there.
2. **Deliver the file by email.** Attach the PDF (or a download link) to the
   Razorpay payment confirmation, and treat `thank-you.html` as a bonus rather
   than the delivery mechanism.

Whichever you choose, **make one real ₹350 purchase and refund yourself** before
you share the link. That is the only way to find out what your account actually
does after payment.

### What the thank-you page actually does

`thank-you.html` is the delivery page. Top to bottom:

1. **Payment complete**, and — if the gateway appended one to the redirect —
   the **payment reference** underneath it. Razorpay sends
   `razorpay_payment_id`; other gateways use `order_id`, `payment_id`,
   `reference` and so on, and the page shows whichever turned up. Nothing to
   configure. If the gateway sends no reference, the line simply isn't there.
   The signature parameter is never displayed.
2. **The download button** — the whole point of the page. A file inside this
   project saves straight to the buyer's device; a link to Drive, Dropbox or
   S3 opens in a new tab instead, because only your own server can hand a
   browser a file and tell it to save.
3. **A reading order** for the book, so the file gets opened rather than
   filed away.
4. **"Getting the file open"** — the four support emails you would otherwise
   receive, answered in advance: in-app browsers that block downloads, where
   the file lands on iPhone and Android, and what to do if they lose it.

The page is deliberately plain HTML: no nav, no upsell, nothing competing
with the download button.

### A note on what the thank-you page can and cannot do

`thank-you.html` **does not verify payment**. It is a static page that renders
whenever it is opened, so anyone who knows the address could reach it. That is
the normal trade-off for a static funnel. If you want the file itself protected,
let Razorpay email the download link and treat this page as the friendly landing
spot rather than the lock on the door.

### If the Razorpay script is blocked

Ad blockers occasionally block payment scripts. If the widget has not rendered
after about 8 seconds, the page keeps its own crimson button visible and that
button links to `PAYMENT_URL` — currently
`https://razorpay.com/payment-button/pl_TRfUmgNo6eigzb/view/`, the hosted page
for the same button. Same product, same price, no sale lost.

---

## 4. Conversion tracking

Placeholders are already in both pages, commented out and clearly labelled.
Search for these markers:

| Marker | Where |
| --- | --- |
| `ADD META PIXEL HERE` | `<head>` of both pages |
| `ADD GOOGLE ANALYTICS HERE` | `<head>` of both pages |
| `ADD GOOGLE TAG MANAGER HERE` | `<head>` of both pages |
| `PURCHASE EVENT` | `thank-you.html` — fires once, after a completed payment |

Checkout-start events are already hooked up in code: every buy button calls
`trackCheckoutStart()` in `assets/js/funnel.js`, which has ready-made
`fbq` / `gtag` / `dataLayer` lines waiting to be uncommented. The location of
the click (`hero`, `mid`, `offer`, `final`, `sticky`, `nav`) is passed in, so
you can see which CTA actually earns its place.

---

## 5. Put it online

Static files, so anything works. All free:

- **Netlify** — drag the `funnel` folder onto <https://app.netlify.com/drop>
- **Cloudflare Pages** / **Vercel** — connect a folder or repo
- **GitHub Pages** — push and enable Pages

The folder also sits happily inside the main Bookaddic store deploy, in which
case the funnel lives at `yourdomain.com/funnel/` and the thank-you page at
`yourdomain.com/funnel/thank-you.html`.

After deploying, do these four things in order:

1. Copy the live thank-you URL into `THANK_YOU_PAGE_URL` **and** into your
   gateway's redirect field.
2. Make one real test purchase, at the real price, and refund yourself.
   An untested checkout is not a checkout; it is a hope.
3. Click the download button on the thank-you page and confirm the PDF opens.
4. Open the sales page on an actual phone.

---

## 6. Where the content came from

Every claim, number, framework and chapter description on the sales page is
taken from the book itself:

- The chapter list, the four revenue engines, the Four Ladders, the Wedge
  Formula, the 70/30 rule, the 90-minute validation protocol, the 30-outreach
  sprint and the five-stage 90-day plan are the book's own frameworks.
- The benchmark figures in the "does the math" section (≈100,000 pageviews for
  display ads down to 0 visitors for services) are reproduced from the
  comparison table in Chapter 1, and are labelled on the page as illustrative
  benchmarks rather than forecasts — which is how the book labels them.
- The eight preview images in `assets/img/preview/` are genuine rendered pages
  from the PDF (pages 10, 13, 18, 25, 34, 40, 46 and 87). `cover.png` is page 1,
  cropped.

There are **no testimonials, no reviews, no student results, no revenue
screenshots, no countdown timers and no scarcity counters** anywhere on the
page, because none of those exist yet. If you add testimonials later, use real
ones with real names and real permission — invented reviews are illegal under
FTC rules in the US, ASA/CMA rules in the UK, and consumer-protection law in
India.

---

## 7. Editing the design

Colours, fonts and spacing are CSS custom properties in section 1 of
`assets/css/funnel.css`. The palette is taken from the book: crimson `#C9151F`,
warm bone `#FAF8F4`, near-black ink `#14100F`, teal `#0C7A6B` for the
"fast/positive" signals. Type is Archivo (display and UI) and Source Serif 4
(pull quotes), loaded from Google Fonts with a system-font fallback.

Sections are ordered and commented in `index.html` — each is wrapped in a
numbered banner comment, so deleting or reordering one is a copy-paste job.

Motion respects `prefers-reduced-motion`: if a visitor has asked their OS to
reduce animation, the scroll reveals, bar animations and the book tilt all hold
still.
