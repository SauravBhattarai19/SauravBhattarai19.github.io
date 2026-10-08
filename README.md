# sauravbhattarai19.github.io

Personal academic website of Saurav Bhattarai, hydrologist and Ph.D. candidate at Jackson State University.
Plain static HTML, CSS, and JavaScript: no framework and no build step. GitHub Actions
(`.github/workflows/deploy.yml`) publishes the repository root to GitHub Pages on every push to `main`.

## Pages

| File | Content |
| --- | --- |
| `index.html` | Home: hero with the live drainage-basin figure, key numbers, the dissertation in five steps, MRRpy and GeoClimate, first-author articles, recent news, about, recognition, contact |
| `research.html` | Research by theme (hydroclimatic extremes, compound hazards, Earth observation, flood modeling, heat and urban cooling, open tools), with animations; tabs link the two degree pages |
| `phd.html` | Ph.D. dissertation, chapter by chapter, with figures, animations, and results (source: the committee write-up, Oct 2026) |
| `ms.html` | M.S. thesis (May 2025), study by study, with figures from the thesis |
| `software.html` | MRRpy, the GeoClimate Intelligence Platform (nine tools), Earth Engine apps, course platforms, research code |
| `publications.html` | All journal articles, proceedings, manuscripts, and the dataset, with topic filters, search, and copy-citation |
| `talks.html` | Map of presentation cities and the full list of talks and posters, filterable by type |
| `teaching.html` | Teaching, mentoring, workshops, training programs, service |
| `404.html` | Not-found page (uses absolute paths because it is served for any missing URL) |
| `conferences.html`, `achievements.html` | Redirects from the old site's URLs |
| `CV.pdf` | Built from `Dissertation/CV/CV_general.tex` |

## Assets

- `assets/css/site.css`: the only stylesheet. Colors are tokens on `:root` (dark mode redefines them); the five
  chapter colors match the dissertation figures.
- `assets/js/site.js`: theme toggle, mobile menu, scroll reveals, copy buttons, figure lightbox, list filters,
  table-of-contents highlighting, map tooltips.
- `assets/js/basin.js`: the home-page figure. A random terrain is filled from one outlet into a D8 drainage tree;
  rain parcels are routed to the outlet and counted as the hydrograph. Pauses when off screen and respects
  reduced-motion settings.
- `assets/img/`: web-sized WebP figures (from the proposal, defense, and M.S. thesis), headshot, social card (`og-image.png`).
- `assets/img/anim/`: animated WebP files (like GIFs, about a third of the size) made from the defense-deck animation frames,
  each with a `-still.webp` frame shown to visitors who turn off motion. To add one, save frames as an animated WebP
  (Pillow: `frames[0].save(path, save_all=True, append_images=frames[1:], duration=ms, loop=0)`) and use the
  `<picture>` markup already on `phd.html`. A plain `.gif` also works in an `<img>` tag.

## Common updates

- **New publication.** In `publications.html`, copy an `<li class="pub">` block into the right year group and edit it.
  `data-tags` drives the filters (`first`, `flood`, `rs`, `heat`, `compound`, `proj`, `software`); `data-cite` is
  the text copied by "Copy citation". Update the counts in the page heading, on the home page, and in the numbers strip.
- **New talk.** In `talks.html`, copy an `<li class="talk">` block (`data-type` is `oral`, `poster`, `coauthor`, or
  `invited`). If the city is new, add it to `CITIES` in `tools/make_talks_map.py` and run
  `python tools/make_talks_map.py` (needs geopandas) to redraw the map.
- **News.** Edit the `<ul class="news">` list in `index.html`.
- **CV.** Rebuild `CV_general.pdf` with `Dissertation/CV/build_general.sh` and copy it here as `CV.pdf`.

## Preview locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

Writing rule for this site: no em dashes in prose.
