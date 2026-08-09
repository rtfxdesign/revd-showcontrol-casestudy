# REVd Cycling — Show Control System (case study)

Public-facing portfolio version of the REVd project. Same system as the
internal technical reference, told as a case study: what the problem was, what
got built, and why the decisions were made that way.

Live: https://revd-showcontrol.netlify.app

## Stack

No build step, no dependencies.

| Path | Purpose |
| --- | --- |
| `index.html` | The whole case study, including a hand-authored SVG signal-flow diagram |
| `assets/styles.css` | Design tokens, layout, print stylesheet |
| `assets/app.js` | Progressive enhancement only |
| `media/` | Web-encoded video and stills |
| `docs/` | The instructor quick guide, shipped as the original PDF |

`app.js` adds: hero play/pause, click-to-play gallery clips (which pause
themselves when scrolled off-screen), a `<dialog>` lightbox, and scroll
reveals. With JS disabled the page still reads completely — clips show their
posters and the hero autoplays from the attribute.

## Media pipeline

Originals live in Google Drive (~1 GB of 4K/1080p `.MOV` and full-res stills).
They are **not** committed. What ships is transcoded down to ~9 MB total:

```bash
ffmpeg -ss <start> -t <dur> -i src.MOV -vf "scale=-2:720:flags=lanczos" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 27 -preset slow \
  -movflags +faststart -an out.mp4
```

Stills go through ImageMagick to WebP (`-auto-orient -resize 1800x> -quality 78`).
`-auto-orient` matters — the rack photos carry EXIF orientation 6.

Every `<img>` carries explicit `width`/`height` matching the encoded file, so
there is no layout shift. If you re-encode at different dimensions, update the
attributes to match.

## Local preview

```bash
npx -y serve .
```

## Deploy

```bash
npx -y netlify-cli deploy --prod
```

## Content notes

- Deliberately excludes everything operational: no IP addresses, device
  serials, RustDesk credentials, or file paths. Those live only in the private
  technical-reference repo.
- Credited to **rtfx design**.
- The instructor guide is linked from a designed document card rather than an
  inline PDF embed. `<iframe>`/`<object>` PDF rendering varies too much across
  browsers to be the load-bearing element — the card always renders, and the
  real PDF is one click away. To show a rendered page image instead, install
  poppler (`winget install oschwartz10612.Poppler`) and use
  `pdftoppm -png -r 150 -f 1 -l 1` to make the thumbnail.
- The prose is a first draft written from the technical reference and the
  instructor guide. Claims about scope and role should be checked before this
  is shown to anyone.
