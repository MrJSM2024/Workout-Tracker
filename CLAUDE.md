# Dose Log: Project Memory

## What This Is
A small Progressive Web App for logging a daily medication dose against a rule-based
taper plan. Replaced an earlier chess app (removed). Hosted free on GitHub Pages and
installed to the owner's Android home screen.

## Owner
GitHub: mrjsm2024
Repo: workout-tracker (name kept for the URL)
Live URL: https://mrjsm2024.github.io/Workout-Tracker/ (capital W and T: Pages paths are case-sensitive)

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

## UI notes
- Visual system: tokens on :root (light) and prefers-color-scheme dark; cards with soft shadow, 20px radius;
  icon bottom nav; per-tab large title. `APP_VERSION` is shown in Settings, bump it on each release.
- Today hero card changes by state (green = dose due, neutral = off/logged) and has a 7-day timeline:
  3 past days (actual), today, 3 future days projected by `projection()` (simulated, never saved).
- Today: one-tap "I took 0.125" / "Confirm off day" from the plan card, undo toast after every save,
  daily "How do you feel" check-in (stored in `S.checkins[date]`: ok / some / rough), and a collapsed
  "Log something different" form for SOS, late, tremor and other-medication entries.
- Check-ins appear in History, the copied log, and the Widening card (last 14 days).

## Rules logic (spec v2, from the owner's plan thread; in `planFor()`, `checks()`, `warningSigns()`)
- Day: a dose before 6 AM, or marked "haven't slept yet", belongs to the previous day.
- Day types by total: off 0, bridge 0.125, high 0.25 to 0.375, very high above 0.375.
- After a bridge (scheduled, late or tremor): next 0.125 after the current interval.
- After a high run: off days = max(2, interval - 1); with a very high day: max(3, interval - 1). Then 0.125.
- After a 3-day high run: default 2 off; "skip 3" shown as an option from bridge start + 21
  if no tremor dose in the last 14 days.
- Interval "none": no scheduled 0.125, nothing follows a high day.
- Tremor dose: warn if any dose yesterday.
- "Other medication" entries (reason othermed) are notes only: dose 0, amount + name in the note.
  The day after one, a due 0.125 shows as "0.125 or off" (owner decides).
- Widening (2 → 3 → 4 → 7 → none) by button only. Warn if before bridge start + 14, under 14 days
  at the step, or any tremor dose in the last 14 days. High days never change the interval.
- Hard limits (warn, never block): above 0.25/day unless sleep exception (max 0.375), 0.125 two days
  in a row, 4th high day in a row, sleep exception two nights in a row or more than 2 in rolling 30 days.
- Warning signs: 2+ tremor doses in rolling 30 days; more than one very high day; 3+ high days within
  7 days that aren't one consecutive run; high days rising across three consecutive 28-day blocks.
- Trends tab: weekly mg stacked bar chart (Mon to Sun, bridge vs high, last 12 weeks) with tap readout
  and table; weekly totals are also appended to the copied log.
- Bridge start: Sep 30, 2026 (settings.startDate). Old v1 data is migrated in `migrate()`.
