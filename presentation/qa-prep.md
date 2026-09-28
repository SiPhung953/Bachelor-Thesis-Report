# Q&A Prep — answer cards

10–15 minutes of Q&A after the talk. Each card: likely question → the 20-second answer → the 1-sentence landing line.
**Jump target** = the slide that proves it.

---

### 1. Why recruitment? Isn't this problem already solved by LinkedIn / TopCV / VietnamWorks?
- **Answer:** Those are listings marketplaces. The friction I targeted is *coordination across one application's whole life*: a candidate's profile and resume are re-created on every platform, and an employer reviews applications outside the posting system. The thesis's contribution isn't "new category of site" — it's one contract-first platform where the **round trip (apply → review → decide → status shown to both sides)** lives in a single source of truth.
- **Landing line:** "I'm not competing with the marketplace — I'm closing the loop the marketplace never shows."
- **Slide:** 2 (stats), 3 (scope).

### 2. Why analyze only two of the eight modules in depth?
- **Answer:** Scope discipline — eight modules fully dissected would be a research project, not a thesis. I picked the two that *complete each other*: Job Application (seeker side) and Employer Job Management (employer side). Together they demonstrate the full round trip, which is the platform's reason to exist. The other six are implemented and summarized.
- **Landing line:** "Depth on the round trip beats breadth on eight disconnected features."
- **Slide:** 3.

### 3. Why backend-first, and why Express + TypeScript + Prisma?
- **Answer:** Two reasons. Career reason: my goal is Backend Engineering, so I wanted the core under tension first. Engineering reason: if the rules, status transitions and authorization live in a tested backend, then any UI can be rebuilt without re-validating business logic. Stack choice: Express 5 is mature and light; TypeScript for shared types; Prisma gives compile-time-safe queries and migrations that the test suite re-applies from scratch; PostgreSQL for ACID, enums and relational integrity.
- **Landing line:** "The frontend is replaceable; the backend is the product."
- **Slide:** 4, 7.

### 4. What does "contract-first" actually mean here, and what happens when the contract changes?
- **Answer:** Controllers are annotated; `tsoa` emits both the route table and `swagger.json`; the web client's typed API module is *generated from that same file*. Changing a response shape on the server updates the client types at the next build — the two sides **cannot drift**, the #1 cause of integration bugs in naive stacks.
- **Landing line:** "One source of truth for request/response types — drift is structurally impossible."
- **Slide:** 4.

### 5. Explain the state machines.
- **Answer:** ApplicationStatus — *SUBMITTED → UNDER_REVIEW → ACCEPTED / REJECTED*, plus WITHDRAWN from the candidate side. JobStatus — postings start *PENDING_APPROVAL*, go *ACTIVE*, and move to *REJECTED / CLOSED / EXPIRED / DELETED*. Transitions are enforced in the service layer, not trusted to the UI; invalid transitions are rejected with 400/409.
- **Landing line:** "The lifecycle is a machine, not a convention."
- **Slide:** 5 (SDs), 9 → follow up with the ERD/statechart backup in `images/defense/` if needed.

### 6. How serious is the testing?
- **Answer:** 89 test cases in 7 suites, 0 failures, ~30 seconds, run against a **real PostgreSQL `_test` database built from real migrations** — not mocks. Every business rule is mapped in the requirements-traceability matrix to its use case and its passing test.
- **Honest part (say it before they ask):** the React UI is verified manually, and there is no load or concurrency testing. The paper says so; I say so.
- **Landing line:** "Verified at the API layer where the business rules live; the gaps are named, not hidden."
- **Slide:** 7.

### 7. Security — what actually protects the app?
- **Answer:** Passwords hashed with Argon2; stateless JWT auth + refresh; role-based access (seeker / employer / admin) enforced by authorization middleware in the API, not hidden in the UI — the demo's 403 is exactly that. Defense-in-depth: even if a role check vanished from a form, the endpoint refuses.
- **Landing line:** "Authorization at the API is the boundary; the button is just decoration."
- **Slide:** 6 (403 closer), 4.

### 8. Why PostgreSQL over MongoDB, or Prisma over raw SQL?
- **Answer:** Recruiters' data is inherently relational — users, companies, postings, applications, resumes, statuses. PostgreSQL gives declarative constraints, enum types and transactional integrity. Prisma keeps the queries type-safe and owns migrations, which the CI/dev loop re-runs deterministically. MongoDB would store the same graph less safely for zero gain here.
- **Landing line:** "This domain is a graph; I chose the database that enforces the edges."
- **Slide:** 4.

### 9. What's missing / what would you do next?
- **Answer (from the paper's limitations):** It's a prototype, not deployed. Next: in-app/email **notifications** for the decision ripple, **deployment & scale** (containers, staging, CI/CD), **mobile**, and load testing.
- **Landing line:** "Known, bounded, and written down — the roadmap is the natural next thesis."
- **Slide:** 8.

### 10. How did you keep the documentation and code in sync? (This is personal — deliver it as a story.)
- **Answer:** I worked in a loop: document a use case → implement backend-first → write every surprise back into the docs → repeat. The traceability matrix is the audit trail of that loop. The hardest lesson: letting code drift from docs for one week creates two weeks of reconciliation.
- **Landing line:** "The document isn't a deliverable of the process — it *is* the process discipline."
- **Slide:** 2 (loop chip), 8.

---

## Never say (hard rules)

- ❌ Do **not cite use-case IDs aloud** (`UC-EMP-06/07/08`). Some exported diagram names in `images/defense/` don't match the paper's numbering — if asked, refer to *"the employer's review flow,"* never to an ID.
- ❌ Do not claim the platform is **deployed or production-ready**. It is a locally-run prototype.
- ❌ Do not claim the platform **reduces time-to-hire**. The 44-day / 7-second figures are market data, not your measurements.
- ❌ Do not claim **load-tested** or **pen-tested**.
- ❌ Do not over-sell the **8 modules** as all equally complete — the two deep ones are the standard.

## If you don't know

- Say "I didn't measure that — here's what I did instead" and bridge to the two deep flows. The committee respects a named limitation far more than a hedge.