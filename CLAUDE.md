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
- Import links: `#import=<base64url JSON>`, either rows `[[date, dose, reason, note], ...]` or a compact run
  `{s: startDate, d: [dose per consecutive day], n: [extra rows]}` (`expandImport()`). Import only fills days that have
  no entry and keeps anything already logged (conflicts are listed in the confirm sheet). Never overwrite or double-count.
- Trends compares rolling 7-day and 28-day windows (`rollingWindows()`), not Monday weeks; the chart has an 8 / 16 / All
  weeks toggle and there is a month-by-month table (per-7-day average uses logged days only). History folds weeks older than 8.
- CSV export is one row per day (status, total, doses, reasons, notes, felt, tags, day note).
- Data completeness: a day with no entry is "not logged", never "off" (History pill, calendar dashes, copied log).
  Today shows a one-at-a-time catch-up card for unlogged days in the last 7 (`gapDays()`); answers: took 0.125,
  off day, other, skip (`S.skipped[date]`), or mark all as off. The plan engine treats unlogged days as off, so
  the hero warns when gaps exist.
- Daily check-in = feeling (`S.checkins[date]`: ok/some/rough) + tags and note (`S.symptoms[date] = {tags, note}`;
  tags from `SYMPTOM_TAGS`, canonical order). Shown in History, day sheet, Trends (14-day counts) and the copied log.
- Backup: after the share sheet returns, the app asks "Did the backup save?" and only records `lastBackup` on yes.
  Today shows backup age plus entries added since (`e.at > lastBackup`). Use `logicalOf()` for any date derived from a
  timestamp (6 AM day cutoff), never `slice(0, 10)`.
- Copy log opens a range sheet (14 days, 30 days, everything, summary only); `logText(range)` always starts with a SUMMARY.
- Trends: partial weeks are drawn at 50% opacity; `trendInsight()` compares this week so far with the same days last week.
- No native alert/confirm anywhere. Use `askConfirm()` (bottom sheet, returns a Promise), `showToast(text, undoFn)`,
  and `makeSheet()`. One history entry stands in for "a sheet is open" so the Android back button closes the
  sheet; `releaseMarker()` defers `history.back()` so close-then-open never races. Do not call `history.back()` elsewhere.
- Tapping any day (timeline, History calendar, History rows, Today's entries) opens `openDay()`: view, edit, delete
  (with Undo), add, set the day's check-in. Logging goes through `openLog()` presets (`PRESETS`), not an inline form.
- Manifest `shortcuts` (long-press the icon) launch `?action=take|off|sos`, handled by `handleLaunchAction()`;
  take and off always ask for confirmation.
- Visual system: tokens on :root (light) and prefers-color-scheme dark; cards with soft shadow, 20px radius;
  icon bottom nav; per-tab large title. `APP_VERSION` is shown in Settings, bump it on each release.
- Today hero card changes by state (green = dose due, neutral = off/logged) and shows the current cycle as a
  pattern chain (`currentCycle()` + `chainHtml()`): from the last dose (whole high run) to the next 0.125, with
  today ringed and planned days dashed (from `projection()`, simulated, never saved). Off runs of 4+ collapse to "off ×N".
- Today: one-tap "I took 0.125" / "Confirm off day" from the plan card, undo toast after every save,
  daily check-in (faces first; tags and note appear once a face is picked), and a floating "+ Log" button
  that opens `openLog()` (PRESETS order: SOS first, tremor last).
- Logging a dose above 0 removes that day's "off" entry (`autoRemoved`); Undo puts it back. Existing data is never auto-cleaned.
- Plan tab (`renderPlan()`): every scenario drawn as a chain by `simulatePattern()`, which runs the real engine on a
  blank simulated state (swaps `S`, restores it in `finally`). Plus widening ladder, hard limits, warning signs.
- Trends is a dashboard: status line (warning signs), 4 tiles, taper curve (`taperCurve()`: 28-day rolling mg per 7 days,
  tap readout), 12-week day grid (`dayGridHtml()`, rough-day dots), weekly mg chart, month table, warning signs, widening.
- Check-ins appear in History, the copied log, and the Widening card (last 14 days).

## Rules logic (spec v2, from the owner's plan thread; in `planFor()`, `checks()`, `warningSigns()`)
- The rules apply only from the plan start date (`inPlan()`, `planDay()`). Days before it (owner's earlier routine,
  Jul 10 to Sep 29) are kept for charts and totals, but the plan engine and warning signs ignore them.
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
