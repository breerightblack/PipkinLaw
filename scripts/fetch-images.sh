#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# fetch-images.sh
# Downloads the firm's existing photos from pipkinlawfirm.com into
# assets/images/, keeping the original filenames.
#
# Usage (from the project root):   bash scripts/fetch-images.sh
#
# Any file that fails to download is listed at the end (and in
# assets/images/_failed.txt) so it can be noted in the README. Pages fall
# back to a navy placeholder block for missing images (see main.js).
# ---------------------------------------------------------------------------
set -u

BASE="https://www.pipkinlawfirm.com/images"
DEST="$(cd "$(dirname "$0")/.." && pwd)/assets/images"
mkdir -p "$DEST"

FILES=(
  plflogo3.png
  carwreck01.webp
  truckwreck01.webp
  plantfire01.webp
  pipkinsoso06.webp
  pipkinsoso02.webp
  pipkinsoso03.webp
  pipkinsoso07.webp
  pipemp04.jpg
  pipemp02.jpg
  pipemp03.jpg
  truck-accidents.jpg
  wrongful-death.jpg
  auto-defects.jpg
  Serious-Injury.jpg
  work-accidents.jpg
  personalinjury00.webp
  Defective-products.jpg
  attorneysbesttexas.png
  attorneysofdistinction.png
  attorneytop100.png
  attorneytrialtop100.png
)

FAILED=()
for f in "${FILES[@]}"; do
  if curl -fsSL --retry 2 -A "Mozilla/5.0 (design preview asset fetch)" -o "$DEST/$f" "$BASE/$f"; then
    echo "ok      $f"
  else
    echo "FAILED  $f"
    rm -f "$DEST/$f"
    FAILED+=("$f")
  fi
done

# ---------------------------------------------------------------------------
# Optimize: shrink any JPG over ~300 KB (the staff photos come in at 1.2 MB).
# Uses macOS's built-in `sips`. Max 1200px on the long side, JPEG quality 55.
# Filenames stay the same so HTML references don't change.
# ---------------------------------------------------------------------------
if command -v sips >/dev/null 2>&1; then
  for f in "$DEST"/*.jpg; do
    [ -f "$f" ] || continue
    if [ "$(stat -f%z "$f")" -gt 300000 ]; then
      sips -s format jpeg -s formatOptions 55 -Z 1200 "$f" --out "$f" >/dev/null && echo "resized $(basename "$f")"
    fi
  done
fi

if [ ${#FAILED[@]} -gt 0 ]; then
  printf '%s\n' "${FAILED[@]}" > "$DEST/_failed.txt"
  echo ""
  echo "${#FAILED[@]} download(s) failed. See assets/images/_failed.txt"
else
  rm -f "$DEST/_failed.txt"
  echo ""
  echo "All images downloaded."
fi
