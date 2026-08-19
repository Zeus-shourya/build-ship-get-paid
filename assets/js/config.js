/* ============================================================================
   BUILD. SHIP. GET PAID. — FUNNEL CONFIGURATION
   ----------------------------------------------------------------------------
   This is the ONLY file you need to edit to take the funnel live.
   Both index.html (sales page) and thank-you.html read from it.
   Edit the values below, save, upload. Nothing else needs to change.
   ========================================================================== */

var CONFIG = {

  /* --------------------------------------------------------------------------
     0. RAZORPAY_BUTTON_ID   ← the checkout you are using
     --------------------------------------------------------------------------
     The id from your Razorpay Payment Button snippet. Razorpay gives you:

       <form>
         <script src="https://checkout.razorpay.com/v1/payment-button.js"
                 data-payment_button_id="pl_XXXXXXXXXXXX" async></script>
       </form>

     You only need the id — paste it below and the page builds that snippet
     itself, inside the offer section.

     What happens on the page:
       · The real Razorpay button renders in the offer section, with its own
         "Secured by Razorpay" branding.
       · Every other GET THE E-BOOK button (hero, mid-page, final, sticky bar)
         opens the same Razorpay checkout as an overlay, without leaving the page.

     Set to "" if you would rather send buyers to a plain link instead — then
     PAYMENT_URL below is used on its own.
  ---------------------------------------------------------------------------- */
  RAZORPAY_BUTTON_ID: "pl_TRfUmgNo6eigzb",


  /* --------------------------------------------------------------------------
     1. PAYMENT_URL   ← the fallback, and the whole checkout if you clear the id above
     --------------------------------------------------------------------------
     A plain checkout URL. It is used in two situations:
       · as a safety net, if the Razorpay script is blocked or fails to load
         (ad blockers do sometimes block payment scripts)
       · as the entire checkout, if RAZORPAY_BUTTON_ID above is set to ""

     It is currently set to the hosted page for the same Razorpay button, so
     both routes charge exactly the same thing. If you switch gateways, use one
     that takes UPI — Razorpay, Instamojo, Cashfree or PhonePe. Gumroad and
     Stripe work but most Indian buyers cannot pay by UPI there.

     Examples:
       "https://rzp.io/l/xxxxxxxx"                    (Razorpay payment link)
       "https://imjo.in/xxxxxx"                       (Instamojo)
       "https://thebookaddic.gumroad.com/l/bsgp?wanted=true"

     Used by: hero CTA, mid-page CTA, offer CTA, final CTA, sticky mobile CTA.
     Until you replace it, the buttons stay inert and a reminder appears
     on screen so you never accidentally ship a dead checkout.
  ---------------------------------------------------------------------------- */
  PAYMENT_URL: "https://razorpay.com/payment-button/pl_TRfUmgNo6eigzb/view/",


  /* --------------------------------------------------------------------------
     2. DOWNLOAD_URL   ← REQUIRED
     --------------------------------------------------------------------------
     The actual e-book file. Powers the button on thank-you.html.

     SIMPLEST: put the PDF in this project, next to the pages, and use the
     short path. The file then saves straight to the buyer's device the
     instant they tap the button — no redirect, no Drive sign-in screen:

         DOWNLOAD_URL: "assets/files/build-ship-get-paid.pdf"

     (Create assets/files/ and drop the PDF in — see the README in there.)

     OR host it anywhere that serves a direct link — Google Drive (set to
     "anyone with the link"), Dropbox, S3, Cloudflare R2, your own server:

         DOWNLOAD_URL: "https://files.thebookaddic.com/build-ship-get-paid.pdf"

     A link to another site opens in a new tab rather than saving directly,
     because only your own server can hand a browser a file and tell it to
     save. Both work; the local file is the smoother experience.

     Until this is set, the download button on thank-you.html becomes an
     "email us for your copy" link — a buyer who has paid never gets a
     button that does nothing.
  ---------------------------------------------------------------------------- */
  DOWNLOAD_URL: "YOUR_EBOOK_DOWNLOAD_URL_HERE",


  /* --------------------------------------------------------------------------
     3. BOOK_PRICE
     --------------------------------------------------------------------------
     Shown in the offer section. Write it exactly as you want it displayed,
     including the currency symbol:  "₹350"   "₹1,299"   "$19"

     Leave it as an empty string ("") and the page shows a neutral
     "Price shown at checkout" line instead — no broken placeholder text.
  ---------------------------------------------------------------------------- */
  BOOK_PRICE: "₹350",

  /* Optional: a crossed-out "was" price. Only use a price you genuinely
     charged before — fake discounts are illegal in most markets.
     Leave "" to hide it. */
  BOOK_COMPARE_AT: "",


  /* --------------------------------------------------------------------------
     4. REFUND_POLICY_PLACEHOLDER
     --------------------------------------------------------------------------
     Your refund terms, in your own words. This text appears as an FAQ answer.
     Leave it empty ("") and the refund question is removed from the FAQ
     entirely — nothing invented on your behalf.

     Example:
       "Digital products are non-refundable once downloaded. If the file
        will not open, email hello@thebookaddic.com and we will fix it or
        refund you in full."
  ---------------------------------------------------------------------------- */
  REFUND_POLICY_PLACEHOLDER: "",


  /* --------------------------------------------------------------------------
     5. THANK_YOU_PAGE_URL
     --------------------------------------------------------------------------
     The live address of thank-you.html once deployed. You paste this same
     URL into your payment gateway's "redirect after successful payment"
     (sometimes called "success URL" or "post-purchase redirect") field.

     Example: "https://thebookaddic.com/funnel/thank-you.html"

     The site itself does not need this to work — it is here so the whole
     funnel is configured in one place, and it is printed to the browser
     console as a reminder of what to paste into your gateway.
  ---------------------------------------------------------------------------- */
  THANK_YOU_PAGE_URL: "https://bookaddic.shop/thank-you.html",

  /* --------------------------------------------------------------------------
     6. PAYMENT_METHODS
     --------------------------------------------------------------------------
     Shown as a small line under the buy buttons. In India this matters:
     a buyer who cannot see that UPI is accepted often will not click at all.

     IMPORTANT — list only what your gateway actually supports, or you will
     lose the sale at the checkout screen instead of on this page:
       Razorpay / Instamojo / Cashfree / PhonePe  →  UPI, cards, net banking, wallets
       Stripe                                     →  cards (UPI only on some accounts)
       Gumroad / Lemon Squeezy                    →  cards and PayPal, NO UPI

     Leave "" to hide the line entirely.
  ---------------------------------------------------------------------------- */
  PAYMENT_METHODS: "UPI · Cards · Net Banking · Wallets",



  /* --------------------------------------------------------------------------
     Contact address used in the FAQ and footer. Change it to yours.
  ---------------------------------------------------------------------------- */
  SUPPORT_EMAIL: "hello@thebookaddic.com"

};
