# The Pipkin Law Firm: redesign preview

A rough-draft static site for pitching a redesign to The Pipkin Law Firm (Dallas personal injury). It's plain HTML, one CSS file and a little vanilla JS, with no build step and no framework.

> **This is a preview.** Every page has `<meta name="robots" content="noindex, nofollow">`, and `netlify.toml` sends an `X-Robots-Tag: noindex, nofollow` header on everything. Leave both in place until launch so the demo never competes with the live site in Google.

---

## Where the copy comes from

**All copy is taken from the firm's current site, pipkinlawfirm.com** (home, About Us, Attorney Bio, and the truck, wrongful death, car accident, auto defect, rollover, personal injury and premises liability pages). It was cleaned up for typos and sentence case, and shortened, but no facts, results, credentials or quotes were invented. Anything the current site doesn't cover is marked `[PLACEHOLDER]` or `[DRAFT COPY]` (see the list below).

The brand lines from the brief are used exactly as written: "Over $100 million in client victories," "Every client has the attorney's cell phone number," "I used to defend insurance companies. Now I fight them," "Smaller firm by design," and the hero subhead.

### Conflicting facts on the current site (confirm with the client)
These appear on pipkinlawfirm.com and contradict each other, so the preview avoids them:

| Claim | Where | Conflict |
|---|---|---|
| "Since forming the firm **17 years ago**… more than **$100 million**… on trucking cases alone" | bio.html | The same page repeats an older version: "**9 years ago**… more than **$24 million**." The preview uses the $100M figure only as the firm-wide "client victories" line. |
| Auto defect recoveries of "**over $1 billion**," "**over $25 million**" and "**more than $20 million**" | autodefect.html | Three different totals on one page. None are used. |
| "Over a century of combined experience," "over three decades" | truck, auto defect, car pages | Hard to square with a firm of one attorney, a paralegal and two legal assistants. Not used. |
| Hours | homepage | The site only says the phone line is "24/7." No office hours are listed, so the preview says "24/7 by phone," and the JSON-LD `openingHoursSpecification` reflects the phone line. |

The 18-wheeler results on the current homepage name clients ("Flores and Lopez family," "L. Johnson," "P. Villereal"). The case results page keeps the initials the site already publishes and leaves out the family names. Confirm the firm is comfortable with this.

---

## Run it locally

Links are root-relative (`/css/styles.css`), so opening the files straight from Finder won't work. Serve the folder instead:

```bash
cd /Users/brianna/Pipkin.Preview
```
```bash
python3 scripts/serve.py
```

Use `scripts/serve.py` rather than `python3 -m http.server`. The built-in server doesn't support byte-range requests, so the hero video can't seek back to the start and the loop stalls. `serve.py` has no dependencies and behaves like Netlify.

Then open http://localhost:8080.

## Deploy to Netlify (don't do this until the client pitch is approved)

- **Drag and drop:** go to app.netlify.com > Add new site > Deploy manually, then drag the whole project folder onto the page.
- **From GitHub:** push this repo, then in Netlify choose Add new site > Import an existing project and pick the repo. Leave the build command empty. The publish directory is set to `.` in `netlify.toml`.

The contact forms have `data-netlify="true"`, so once the site is deployed, submissions appear under Site > Forms. There's a `contact` form (English pages) and a `contacto-es` form (Spanish page).

---

## File map

```
index.html                 Homepage (all 12 sections)
case-results.html          Filterable results grid
about.html                 Firm story + Steve's bio, timeline, team carousel, badges
contact.html               Contact details, map placeholder, form
practice/truck-accidents.html   Full practice page template
practice/wrongful-death.html    Same layout, real copy from the site
practice/car-accidents.html     Same layout, real copy from the site
practice/auto-defects.html      Same layout, real copy from the site
es/index.html              Spanish landing stub
css/styles.css             Every style, with design tokens at the top
js/main.js                 Menu, dropdown, count-up, scroll reveal, filters, year
js/carousel.js             Team carousel only (Slick 1.8.1 + jQuery from jsDelivr)
scripts/fetch-images.sh    Re-downloads and compresses the firm's photos
scripts/serve.py           Local preview server (supports video seeking)
assets/images/             Local copies of the firm's images
assets/video/              Hero video (hero.webm, hero.mp4) + poster frame
netlify.toml               Publish settings + noindex header
```

## Design tokens

Everything visual is in `:root` at the top of **`css/styles.css`** (section 1):

- **Colors:** `--navy`, `--off-white`, `--sky`, `--navy-ink` and `--white` are the brand palette. They were sampled from a swatch image, so they're **approximate**. Swap in exact values when you have them. Derived tints (`--sky-light`, `--sky-pale`, `--navy-soft`, `--gray-text`, …) sit just below. The comment block lists the contrast ratios; white text on sky blue fails WCAG AA and isn't used anywhere.
- **Fonts:** `--font-serif` (Playfair Display) and `--font-sans` (Inter). To swap one, change the Google Fonts `<link>` in each page's `<head>` and the variable.
- **Type scale, spacing, radii, shadows** and component sizes (`--header-h`, `--team-caption-h`, `--team-curve-h`) are there too.

## Shared header and footer

The header and footer are identical on every page, between `<!-- HEADER START -->` / `<!-- HEADER END -->` and `<!-- FOOTER START -->` / `<!-- FOOTER END -->`. Edit one page, then find-and-replace the block on the rest. The current page is highlighted automatically by `js/main.js`, so the markup never needs per-page changes.

The Spanish page reuses the English header and footer so the blocks stay identical. Translate them if the Spanish section grows.

## Demo banner

The "Design preview for The Pipkin Law Firm, prepared by GNYZ." strip is a single `<div class="demo-banner">` inside the header block. Visitors can dismiss it (it stays dismissed in their browser). To remove it for good, delete the div, or uncomment `.demo-banner { display: none !important; }` in section 5 of the CSS.

## Hero video

The homepage hero plays `assets/video/hero.mp4` (H.264 High, level 4.0, 1.9 MB), with `hero.webm` (VP9 profile 0, 0.9 MB) as a fallback. Both are 1920×1080, 8-bit, 9.4 seconds, silent, and loop. Tested playing and looping in iOS Safari (iPhone simulator) and Android Chrome. They were encoded from the original 16 MB HEVC file, which Chrome and Firefox often can't play. The poster, `hero-poster.webp`, is the video's first frame, so nothing jumps when playback starts. Visitors with "reduce motion" turned on see only the poster.

- **Navy overlay:** it's the `.hero::before` gradient in section 7 of `styles.css`. Raise or lower the alpha values to darken or lighten it (the left side is darker so the headline reads).
- **Mobile compatibility (important):** keep the MP4 listed first. iOS Safari picks the first source it thinks it might support and won't fall back if decoding fails. Keep both files 8-bit (`-pix_fmt yuv420p`); 10-bit video, which the original HEVC export was, doesn't play on most phones. If autoplay is blocked (iOS Low Power Mode, Android Data Saver), `main.js` starts the video on the visitor's first tap or scroll. With "reduce motion" turned on, the poster is shown instead, by design.
- **Framing:** `.hero__media { object-position: center 40%; }` controls the crop.
- **Replacing the video:** export a new clip (MP4 H.264 + WebM, 1920×1080, under 5 MB, 15–30 second loop, no audio), overwrite the two files, and re-export the first frame as `hero-poster.webp`. These commands do all three from a source file:

```bash
ffmpeg -i source.mp4 -an -c:v libx264 -preset slow -crf 25 -pix_fmt yuv420p -profile:v high -level:v 4.0 -movflags +faststart assets/video/hero.mp4
```
```bash
ffmpeg -i source.mp4 -an -c:v libvpx-vp9 -profile:v 0 -pix_fmt yuv420p -crf 40 -b:v 0 -row-mt 1 assets/video/hero.webm
```
```bash
ffmpeg -i source.mp4 -frames:v 1 poster.png && cwebp -q 72 poster.png -o assets/video/hero-poster.webp
```

`es/index.html` has the same hero with its `<source>` lines still commented out. Uncomment them (and switch its poster to `/assets/video/hero-poster.webp`) to use the video there too.

## Adding a team member

In `index.html` and `about.html`, find the `team-track` block and either copy an existing `<div class="team-card">` or uncomment one of the two `<!-- TEMPLATE SLIDE -->` blocks. Set the photo, alt text, name and title. Add `team-card--alt` to every other card to alternate the lighter backing. Portraits about 864×1100 (4:5) work best.

The color block behind each photo only really shows through with background-removed (transparent PNG) cutouts. If you get cutouts, add the `team-card--cutout` class to that card.

Carousel speed: change `SLIDE_SPEED_MS` at the top of `js/carousel.js` (1200 now; ALH uses 2000).

## Adding a case result

In `case-results.html`, copy an `<li>` in the `result-grid` (or uncomment one of the four `TEMPLATE CARD` blocks). Set `data-category` to one or more of `trucking`, `wrongful-death`, `serious-injury`; that's what the filter buttons match. To show a result on the homepage or a practice page, copy a `stat-card`: `data-count`, `data-prefix` and `data-suffix` drive the count-up.

## Other switches

- **Scroll reveal:** set `ENABLE_SCROLL_REVEAL = false` at the top of `js/main.js`.
- **FAQ:** the homepage FAQ answers also live in the FAQPage JSON-LD in the `<head>`. Keep the two in sync.

---

## To replace before client review

| Page | Item |
|---|---|
| `index.html` | 3 testimonial cards: `[PLACEHOLDER – replace with a real, approved client review]` and `[PLACEHOLDER – client name or initials, case type]`. Use real, approved reviews only (with written permission). |
| `practice/truck-accidents.html` | "Black box and ELD data" card: `[DRAFT COPY – needs firm input…]`. Not covered on the current site. |
| `practice/truck-accidents.html` | "Federal regulations" card: `[DRAFT COPY – needs firm input…]`. Not covered on the current site. |
| `practice/auto-defects.html` | `[PLACEHOLDER – add auto defect case results…]`. The strip shows firm-wide results until the firm supplies defect-specific ones. |
| `practice/car-accidents.html` | The results strip shows firm-wide results (labeled "Recent firm results"); the site has no car-only amounts. |
| All pages with the contact block + `contact.html` | `[PLACEHOLDER – map embed]` / `[PLACEHOLDER – Google Maps embed]`: swap for a Google Maps iframe. |
| `es/index.html` | `[BORRADOR – requires review by a native speaker]` banner, `[PLACEHOLDER – mapa]`. All Spanish copy needs native review. |
| `about.html` | Timeline: only 1992 and 2008 are dated on the current site. Add years for the Allstate, defense-firm and plaintiff-firm entries if the firm provides them. |
| Homepage practice grid | Serious injury, premises liability and defective products have no page in this preview, so those cards link to `/contact.html`. |

## Image downloads

All 22 images from the brief downloaded successfully (no failures). `scripts/fetch-images.sh` re-downloads them and shrinks any JPG over 300 KB (the two 1.2 MB staff photos, `pipemp02.jpg` and `pipemp03.jpg`, are now about 290 KB and 210 KB at 1200px). If a download ever fails, the script lists it in `assets/images/_failed.txt`, and `main.js` swaps any missing image for a navy block showing the filename.

## Checks run

- Local server: all internal links, images and CDN files return 200; no console errors.
- One `<h1>` and a unique `<title>` + meta description on every page.
- No horizontal scroll at 375, 768, 1024 or 1440px on any page.
- Carousel: loops seamlessly with 4 people (3 visible), shows 2 at ≤991px and 1 at ≤479px, and the arrow buttons work.
- The old site's typos ("TheThe," "DEFECCTS," "love ones," "for a clients," "atate") don't appear anywhere.
