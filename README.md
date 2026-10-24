# I FALL

A privacy-first website that shows which Instagram accounts do not follow you back. Everything
happens in the browser: the ZIP you upload is never sent to a server.

## Features

- **Local only** — the archive is parsed in the browser tab. No backend, no login, no analytics.
- **Guided onboarding** — a step-by-step tutorial for mobile and desktop, with a progress indicator.
- **Automatic parsing** — upload Instagram's ZIP as-is; follower and following files are located
  by name, so nested folders such as `followers_and_following/` work.
- **Split files** — `followers_1.json`, `followers_2.json`, … are merged and deduplicated.
- **Honest errors** — a missing or unreadable file is reported as an error, never as "0 followers".
- **Deactivated accounts** — entries without a profile link are flagged, not silently counted.
- **Results** — five lists (Followers, Following, Mutuals, Doesn't follow back, Fans) with total
  counts, search, A→Z / Z→A sorting, copy username, profile links and CSV export.
- **Accessible** — keyboard-operable tabs, landmarks, focus rings, reduced-motion support.

## Tech stack

- React 19 + TypeScript (strict)
- Vite 8
- React Router 7
- JSZip for reading the archive
- `node:test` for the parser test suite

## Getting started

Requires Node.js 22.6 or newer (the tests run TypeScript directly).

```bash
npm install
npm run dev
```

The dev server serves the app at <http://localhost:5173/I-FALL/> because `base` is set for GitHub
Pages.

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server with HMR |
| `npm run build` | Type-check, then build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Lint with oxlint |
| `npm test` | Run the parser test suite |
| `npm run typecheck` | Type-check without building |

## What the app accepts

- The **JSON** export from Instagram. HTML exports are not supported.
- The ZIP exactly as Instagram provides it — no extraction needed.
- Archives up to 100 MB. Request the export with only followers and following to stay well under.

## How the comparison works

| Category | Definition |
| --- | --- |
| Followers | everyone who follows you |
| Following | everyone you follow |
| Mutuals | people you follow who follow you back |
| Doesn't follow back | accounts you follow minus your followers |
| Fans | your followers minus accounts you follow |

Usernames are trimmed, lowercased for comparison, and deduplicated. Results reflect the export
Instagram generated, which may be a snapshot from days earlier.

## Tests

```bash
npm test
```

The suite covers the standard export layout, the older root-level layout, split follower files,
missing and empty files, malformed JSON, deactivated accounts, case handling, and a 25,000-row
fixture.

## Live site

<https://varun122134.github.io/I-FALL/>

## Deploying to GitHub Pages

The site is published from the `gh-pages` branch.

```bash
npm run deploy
```

This builds the app and pushes `dist/` to `gh-pages`. `public/404.html` provides the SPA
fallback so deep links survive a refresh, and `public/.nojekyll` stops GitHub Pages from
running Jekyll.

If the repository name changes, update `base` in `vite.config.ts` to match.

## Privacy

- No passwords or credentials are requested.
- The archive and every extracted username stay in the browser.
- No third-party analytics receive results.
- Results are held in memory and mirrored to `sessionStorage` for refresh survival; **New analysis**
  clears both.
- I FALL is not affiliated with or endorsed by Instagram or Meta.

Do not commit real exports or real usernames. `result/` is git-ignored for that reason.

## Branding

**A Varun C Creation** — conceptualised, designed and developed by Varun C.

- Developer: Varun C
- Instagram: [@mr_varun_c](https://www.instagram.com/mr_varun_c/)
- LinkedIn: [Varun C](https://www.linkedin.com/in/mrvarunc/)

The shared footer lives in `src/components/Footer.tsx` and is rendered on every page.

## License

MIT — see [LICENSE](LICENSE).
