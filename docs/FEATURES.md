# ECE features and asks

## Free web address(es) for the ECE site, with backups (owner, 2026-11-27) — Asked: 2×
- Owner, 26–27 Nov: "I also want my ece project have some easy name to open it." Then, 27 Nov, after the domain
  decisions for crimeWiki, musicsheets and liveradio (several free backup addresses each, and a top-menu banner on
  backups saying "this is a mirror of <main address>"): "note we need for ece project too".
- Plan: ECE gets the same setup: one main free address and several free backups (Firebase `.web.app`, GitHub Pages,
  Vercel and similar), each backup showing the mirror banner and pointing Google at the main address.
- Names checked 27 Nov: Firebase `.web.app` free: ecebench, eceworkbench, ece-workbench, ecelabs ("ece" alone is too
  short; Firebase needs 6+ characters). GitHub: organisations `ecebench` and `eceworkbench` free (gives
  ecebench.github.io), `ecelab` taken. Cloudflare Pages: ecelab.pages.dev free, ece.pages.dev taken.
- Status: todo. Waiting for the owner to pick the name and create the Firebase project / GitHub organisation himself.
  Full notes: ~/Desktop/Projects/MASTER_PLAN.md, "Domains".

## Course opens at https://anupamkhosla.github.io/ECE/ (owner, 2026-11-28) — Asked: 1×
- Owner: "https://anupamkhosla.github.io/ECE/tutorial/ should work at https://anupamkhosla.github.io/ECE/".
- Before: Pages served the repo root (branch main, /); root index.html only meta-refreshed to tutorial/.
- Change: a GitHub Actions workflow (.github/workflows/pages.yml) publishes the tutorial/ folder as the site root, so
  /ECE/ is the course itself and /ECE/practice/... etc. are the lessons. Every old /ECE/tutorial/... page becomes a
  small redirect to its new address (canonical set), so old links keep working. Repo docs/tests are no longer served.
- Status: in progress 28 Nov.
