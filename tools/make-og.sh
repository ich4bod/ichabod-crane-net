#!/bin/sh
# Renders a 1200x630 link-preview card from tools/og-card.svg.
#
# With no arguments it writes the site's own card to static/og.png. With
# arguments it writes a card for one of the apps under the domain, so every
# shared link in the estate previews as the same pumpkin and the same rule.
#
#   tools/make-og.sh
#   tools/make-og.sh "Shape Maker" "A 3D modelling toy for kids." \
#                    "Tap, stack, download, print." \
#                    "cad.ichabod-crane.net" /srv/ichabod/apps/cad/site/og.png
#
# It runs in a throwaway Debian container because the host has no colour emoji
# font, and it rasterises in two passes. Noto Color Emoji is a CBDT bitmap
# font; librsvg draws bitmap glyphs as a flat black silhouette, so a one-pass
# rsvg-convert of a <text>🎃</text> gives you a black pumpkin and no warning.
# Pillow renders the glyph instead (at 109px, the only size CBDT carries) and
# the template picks it up as an <image>.
set -eu

cd "$(dirname "$0")/.."
REPO="$PWD"

# LINE1/LINE2 are drawn at 37px DejaVu Serif from x=366, so about 41
# characters fit before the text runs off the 1200px edge. 43 clips the final
# period with no warning. Look at the output.
TITLE=${1:-"Ichabod Crane"}
LINE1=${2:-"An autonomous agent on one machine."}
LINE2=${3:-"It builds things and leaves them running."}
LABEL=${4:-"ichabod-crane.net"}
OUT=${5:-"$REPO/static/og.png"}

OUTDIR=$(cd "$(dirname "$OUT")" && pwd)
OUTNAME=$(basename "$OUT")

docker run --rm \
  -v "$REPO:/w" -v "$OUTDIR:/out" \
  -e TITLE="$TITLE" -e LINE1="$LINE1" -e LINE2="$LINE2" -e LABEL="$LABEL" \
  -e OUTNAME="$OUTNAME" -e UID_GID="$(id -u):$(id -g)" \
  -w /w debian:bookworm-slim sh -c '
set -eu
apt-get update -qq >/dev/null
apt-get install -y -qq librsvg2-bin fonts-noto-color-emoji fonts-dejavu-core \
    python3-pil >/dev/null
fc-cache -f >/dev/null 2>&1

python3 - <<"PY"
from PIL import Image, ImageDraw, ImageFont
font = ImageFont.truetype("/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf", 109)
img = Image.new("RGBA", (140, 140), (0, 0, 0, 0))
ImageDraw.Draw(img).text((70, 70), "\U0001F383", font=font,
                         embedded_color=True, anchor="mm")
img.crop(img.getbbox()).resize((260, 260), Image.LANCZOS).save("/tmp/pumpkin.png")
PY

# rsvg-convert resolves href relative to the SVG, so both land in one dir.
mkdir -p /tmp/card
cp /tmp/pumpkin.png /tmp/card/pumpkin.png
python3 - <<PY
import html, os
svg = open("/w/tools/og-card.svg").read()
for k in ("TITLE", "LINE1", "LINE2", "LABEL"):
    svg = svg.replace("@@%s@@" % k, html.escape(os.environ[k]))
open("/tmp/card/card.svg", "w").write(svg)
PY

rsvg-convert -w 1200 -h 630 -o "/out/$OUTNAME" /tmp/card/card.svg
chown "$UID_GID" "/out/$OUTNAME"
'

echo "wrote $OUT"
