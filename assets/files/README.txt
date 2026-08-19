PUT THE E-BOOK PDF IN THIS FOLDER
=================================

Save it here, then point config.js at it:

    assets/files/build-ship-get-paid.pdf

    DOWNLOAD_URL: "assets/files/build-ship-get-paid.pdf"

That's it. The download button on thank-you.html will save the file
straight to the buyer's device — no redirect, no Google sign-in wall, no
"request access" screen, which is the most common reason a Drive link
loses a customer.

The filename becomes the filename they get, so name it properly:
build-ship-get-paid.pdf reads better in someone's Downloads folder than
final_v3_compressed.pdf.

You can also skip this folder entirely and put a full https:// link in
DOWNLOAD_URL instead (Drive, Dropbox, S3, R2, your own server). Both are
supported.

ONE THING WORTH KNOWING
-----------------------
A file kept here is public to anyone who knows its address — this is a
static site, so there is no login to put in front of it. That is the
normal trade-off for a funnel like this one, and the same is true of a
shared Drive link. If you need the file genuinely locked down, host it
behind a gateway that issues signed, expiring links and paste that link
into DOWNLOAD_URL instead.

Don't rename this folder — the path above assumes it.


⚠️ IF YOU DEPLOY THIS SITE TO GITHUB PAGES — READ THIS
-------------------------------------------------------
GitHub Pages on the free plan only serves PUBLIC repositories. A PDF
committed to a public repo is not merely "public to anyone who knows the
address" — it is listed in the repository file tree, browsable by anyone
who opens the repo, and indexed by search engines. That is giving the
book away, not selling it.

For that reason `.gitignore` in the project root deliberately ignores
*.pdf. Drop the file in this folder for LOCAL testing and it will work
locally, but it will not be uploaded to GitHub.

So when you go live on GitHub Pages, host the PDF somewhere else and put
that link in DOWNLOAD_URL:

    Google Drive  →  share "anyone with the link", copy the link
    Dropbox       →  create link, change ?dl=0 to ?dl=1 for direct download
    Cloudflare R2 / S3 / your own server

If you have GitHub Pro you can serve Pages from a PRIVATE repo, and then
committing the PDF is fine. On the free plan it is not.

To override the ignore rule on purpose:  git add -f assets/files/yourbook.pdf
