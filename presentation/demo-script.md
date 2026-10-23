# Live Demo Script — "One application, end to end"

Where this fits: **Slide 11 of `defense-deck.pptx`**, right after the Conclusion. The demo sits **outside** the
10-minute talk and is the bridge into Q&A. Start it as soon as the talk ends, even if the talk ran to 10:00.
Aim for ~2:00, but if a council member asks a question mid-demo, answer it: that's Q&A starting early.
Everything below is scripted so you type nothing and only ever *click*.

---

## 1. Before defense day (~45 min) — do this at home, not on stage

| # | Task | How |
|---|------|-----|
| 1 | Reset seed data | `pnpm --filter api seed` (3 companies, 12 ACTIVE jobs). Re-run before every rehearsal so no old applications survive. |
| 2 | Create the **Job Seeker** account by hand | Register in the UI with a fixed account (e.g. `si.seeker@demo.local` / `Password123!`). Verify the profile is complete. |
| 2b | Set that seeker's **job preferences** | Desired job title `Backend Engineer`, preferred location `Ho Chi Minh City`, status actively looking. Without this the dashboard falls back to "latest postings" and shows **no reasons**, and the recommender is your selling point. Check that the dashboard shows "Backend Engineer" (FPT Software) with the reason chips. |
| 3 | Upload one resume to that seeker | Through the UI — a 1-page PDF, “Curriculum Vitae – Phung Dam Tien Si”. This is the pre-loaded resume you will apply with. |
| 4 | Create the **Admin** account (for the optional 403 closer) | Admin cannot be self-registered; add the row directly in the DB using the same `PasswordHasher` (bcrypt) that `prisma/seed.ts` uses, role `ADMIN`. |
| 5 | Seed **none** of the demo applications | The whole point of the demo is to create the application *live*. Keep the DB clean. |
| 6 | Take fallback screenshots | Capture every screen below at 1920×1080. Insert them as a hidden appendix slide **after slide 12** (or duplicate slide 11 and paste images under it). Your insurance policy. |
| 7 | Open the running apps in a fixed window | `pnpm --filter api dev` (:3000, Swagger at `/docs`) and `pnpm --filter web dev` (:5173). Browser fullscreen; set zoom so the UI fits now, and test on **this laptop only**. |

---

## 2. The two-minute run (what you actually click)

**Beat 1 — Job Seeker applies (0:00 → 0:50)**  *(login: seeker account)*
1. Land on the **dashboard**: point at the recommended jobs and their reason chips. *"These are ranked from the preferences
   the seeker entered, and each one says why it's here."* (One sentence only. The details belong in Q&A, card 7.)
2. Open **“Backend Engineer”** (FPT Software) from the recommendations → **Apply** → pick the pre-loaded resume → confirm.
3. Open **My Applications**: the new row shows **SUBMITTED**. Point at it: *“created, waiting for a decision.”*
4. Say one line: *“That is the whole candidate side — search, apply, track.”*

**Beat 2 — Employer reviews (0:50 → 1:35)**  *(logout, login: `hr@fptsoftware.demo` / `Password123!`)*
1. Open the **same** posting (FPT Software). Say *“same job the candidate just applied to.”*
2. Applications tab → the fresh application is right there (**SUBMITTED**).
3. Click **Mark under review** → badge flips to **UNDER_REVIEW**.
4. Click **Accept** → status becomes **ACCEPTED**. One line: *“decision made, stored, and it ripples back.”*

**Beat 3 — The ripple (1:35 → 1:55)**  *(logout, login: seeker account)*
1. Open **My Applications** again: the status now reads **ACCEPTED**.
2. Close with the thesis sentence: *“One platform, one round trip — the application I created on the left was decided on the right, with no copy-pasting, no spreadsheets.”*

**Optional closer (1:55 → 2:10, only if on time) — the 403 proof**
- While still logged in as the seeker, open an employer/admin URL (or attempt the action) → the API answers **403 Forbidden**. Say *“and the platform refuses what you aren’t allowed to do — at the API, not just in the UI.”* Then stop. Never run into the bonus if the clock is against you.

---

## 3. Zero-typing rules

- Account credentials are **click-login only** (autofill or a sticky note **off-screen**).
- The resume is already uploaded; you never attach a file live.
- The URL is already open; you never type `localhost`.
- Browser window is fixed and pre-sized; **zoom is set during rehearsal** — check it against the projector if you can.
- Keep the DB **seeded** → every run starts identical.

## 4. If something breaks (recovery ladder — max 30 s total, then bail)

1. **Repeat the click** — most failures are an already-submitted button.
2. **Fallback to screenshots** — say *“here’s what that looks like”* and jump to the appendix slide. No fixing on stage.
3. **Never** open a terminal during the demo in front of the committee.

> Rule of thumb: the demo wins the presentation if it *looks* effortless. A 90-second scripted loop that lands is
> worth more than any unplanned flourish.

---

## 5. Rehearsal cadence

- Run the full loop **3× back-to-back** per rehearsal; aim for beat times above to be stable.
- Time Drill 1: talk only, slides 1–10, must land at or under 10:00 (`speech-draft.txt` has cumulative timings). Drill 2: talk + demo back to back (~12:00). Drill 3: full run + Q&A cards 6 (Testing) and 7 (Recommendations) answered out loud.
- Kill all non-demo apps, disable OS/browser notifications, mute Slack/Teams.