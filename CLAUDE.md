# Dose Log: Project Memory

## What This Is
A small Progressive Web App for logging a daily medication dose against a rule-based
taper plan. Replaced an earlier chess app (removed). Hosted free on GitHub Pages and
installed to the owner's Android home screen.

## Owner
GitHub: mrjsm2024
Repo: workout-tracker (name kept for the URL)
Live URL: https://mrjsm2024.github.io/workout-tracker/

## Tech
- Single file `app/index.html` (vanilla HTML/CSS/JS). No build step, no dependencies.
- `app/manifest.json` + `app/icon-*.png` make it installable. `app/sw.js` is a
  network-first service worker for offline use.
- Deploy: `.github/workflows/deploy.yml` uploads `./app` to GitHub Pages on push to
  `claude/coding-guide-beginners-p5oQx` (the default branch) or `main`.

## Data
- Stored only in the phone's localStorage (key `doselog.v1`). Nothing is sent anywhere.
- Backup: Settings → Back up shares a JSON file (owner picks Google Drive). Restore
  reads it back. Export CSV is for the prescriber.
- Repo is public: keep the medication name and any personal data OUT of the code.
  The display name is typed into the app and stored locally.

## Rules logic (in `planFor()` and `checks()`)
- Day types: off (0), bridge (0.125), high (>= 0.25).
- After a high run: off days = max(2, or 3 after a 0.5 day, interval - 1), then 0.125.
- After a bridge: next 0.125 after the current interval. Late doses restart the count.
- Warnings never block saving; they ask for confirmation.
- Interval widening (2 → 3 → 4 → 7 → none) only happens when the owner taps it,
  after 14+ days at a step and not before the "earliest widening" date setting.
- Before 4 AM counts as the previous day.

## Owner's interpretations of ambiguous plan rules (confirm before changing)
1. Hard day on a wider interval: off days = max(2, interval - 1).
2. Tremor 0.125 only warns if yesterday was a 0.125.
3. Missed dose: count restarts from the day it is taken.
4. Oct 14 / Oct 21 plan dates are editable settings.
