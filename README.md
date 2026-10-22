# Careers in Wastewater Management website

A static, multi-page site. Open `index.html` in a browser; no server or build needed to view it.

## Previewing interviews
Interviews play in a pop-up player on the page. YouTube only allows this when the site is on a real web address (https://…). If you open the files directly on your computer, YouTube shows "Error 153"; that goes away once the site is published.

The videos can be Public or Unlisted, but not Private, and "Allow embedding" must be on in YouTube Studio.

## Files
- `index.html`, `interviews.html`, `careers.html`, `quiz.html`, `404.html`: pages
- `explore.html`: only redirects old links to the Interviews or Careers page
- Link tips: `careers.html#lab` jumps to that career; `interviews.html#lab` shows only that area's interviews
- `images.js`: **every photo URL in one place.** All current photos are temporary Unsplash images. Change a `src` to swap one (a full URL or a local path like `assets/photos/hero.jpg`).
- `data.js`: career areas, quiz questions and scoring, and the interviews (name, role, YouTube ID and which career areas each appears under). To add an interview, copy one entry and change those four things.
- `content.md`: all draft copy in one document for review. Anything in [brackets] needs real information from SVCW.
- `app.js`: interactions (header, menu, explorer panel, video library, quiz, form validation, animations)
- `styles.css`: animation and component styles; `tailwind.css`: compiled Tailwind

## Editing styles
Tailwind is compiled ahead of time. After changing Tailwind classes in the HTML or JS, rebuild:

    npx tailwindcss@3.4.16 -c tailwind.config.js -i src/input.css -o tailwind.css --minify

## Still placeholder
Photos are from Unsplash (no credit required); photographer names are listed in images.js.
