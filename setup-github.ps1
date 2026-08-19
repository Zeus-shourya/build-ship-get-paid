# =============================================================================
#  Publish the funnel to GitHub Pages.
#
#  Run it once, from this folder:
#
#      powershell -ExecutionPolicy Bypass -File setup-github.ps1 -User yourname
#
#  It will:
#    1. work out your live URLs
#    2. write them into index.html (canonical, og:url, og:image) and config.js
#    3. commit that change
#    4. add the GitHub remote and push
#
#  You still have to do two things by hand afterwards - the script prints
#  them at the end. Neither can be automated from here.
# =============================================================================

param(
  [Parameter(Mandatory = $true)][string]$User,
  [string]$Repo = "build-ship-get-paid",
  [switch]$WhatIf
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

# GitHub Pages hostnames are always lower-case, even when the account name
# is not. The remote keeps whatever case you typed - git does not care.
$siteUrl  = "https://$($User.ToLower()).github.io/$($Repo.ToLower())"
$thankYou = "$siteUrl/thank-you.html"
$remote   = "https://github.com/$User/$Repo.git"

Write-Host ""
Write-Host "  Site       $siteUrl/" -ForegroundColor Cyan
Write-Host "  Thank-you  $thankYou" -ForegroundColor Cyan
Write-Host "  Remote     $remote" -ForegroundColor Cyan
Write-Host ""

if ($WhatIf) { Write-Host "  -WhatIf given, stopping here." -ForegroundColor Yellow; exit 0 }

# --- 1. rewrite the absolute URLs -------------------------------------------
$utf8 = New-Object System.Text.UTF8Encoding($false)   # no BOM

# $replacements is an ARRAY of @(pattern, replacement) pairs, applied in order,
# so the most specific pattern always wins. A hashtable would not be ordered.
function Edit-File($path, $replacements) {
  $full = Join-Path $root $path
  $text = [System.IO.File]::ReadAllText($full, $utf8)
  foreach ($pair in $replacements) {
    $text = $text -replace $pair[0], $pair[1]
  }
  [System.IO.File]::WriteAllText($full, $text, $utf8)
  Write-Host "  updated $path" -ForegroundColor Green
}

Edit-File "index.html" @(
  ,@('https://example\.com/funnel/assets/img/og-image\.jpg', "$siteUrl/assets/img/og-image.jpg")
  ,@('https://example\.com/funnel/index\.html',              "$siteUrl/")
  ,@('https://example\.com/funnel/',                         "$siteUrl/")
  ,@('<!--[^>]*replace with your live URL[^>]*-->', '')
)

Edit-File "assets/js/config.js" @(
  ,@('THANK_YOU_PAGE_URL: "YOUR_THANK_YOU_PAGE_URL_HERE"', "THANK_YOU_PAGE_URL: `"$thankYou`"")
)

# --- 2. commit ---------------------------------------------------------------
git add -A
$pending = git diff --cached --name-only
if ($pending) {
  git commit -q -m "Point absolute URLs at $siteUrl"
  Write-Host "  committed" -ForegroundColor Green
} else {
  Write-Host "  nothing new to commit" -ForegroundColor DarkGray
}

# --- 3. remote + push --------------------------------------------------------
$existing = git remote 2>$null
if ($existing -contains "origin") {
  git remote set-url origin $remote
} else {
  git remote add origin $remote
}

Write-Host ""
Write-Host "  Pushing... a browser window may open to sign you in to GitHub." -ForegroundColor Yellow
git push -u origin main

if (-not $?) {
  Write-Host ""
  Write-Host "  Push failed. The usual cause is that the repository does not exist yet." -ForegroundColor Red
  Write-Host "  Create it here (empty - no README, no .gitignore, no licence):" -ForegroundColor Red
  Write-Host "      https://github.com/new?name=$Repo" -ForegroundColor White
  Write-Host "  Then run this script again." -ForegroundColor Red
  exit 1
}

# --- 4. what is left for you -------------------------------------------------
Write-Host ""
Write-Host "  Pushed. Two things left, and neither can be done from here:" -ForegroundColor Green
Write-Host ""
Write-Host "  1. TURN ON GITHUB PAGES" -ForegroundColor White
Write-Host "     https://github.com/$User/$Repo/settings/pages"
Write-Host "     Source: 'Deploy from a branch'   Branch: main   Folder: / (root)"
Write-Host "     Give it a minute, then open  $siteUrl/"
Write-Host ""
Write-Host "  2. MAKE RAZORPAY RETURN BUYERS TO YOUR THANK-YOU PAGE" -ForegroundColor White
Write-Host "     Razorpay Dashboard -> Payment Buttons -> your button -> Edit"
Write-Host "     Find the post-payment / redirect setting and paste:"
Write-Host ""
Write-Host "         $thankYou" -ForegroundColor Cyan
Write-Host ""
Write-Host "     If Payment Buttons on your account cannot redirect, use a Razorpay"
Write-Host "     Payment Page or Payment Link instead - both can - put its URL in"
Write-Host "     PAYMENT_URL and set RAZORPAY_BUTTON_ID to `"`" in config.js."
Write-Host ""
Write-Host "  Then buy your own book once, for real, and refund yourself." -ForegroundColor Yellow
Write-Host ""
