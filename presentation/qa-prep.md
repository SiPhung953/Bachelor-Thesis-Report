# Q&A Prep — answer cards

About 15 minutes of Q&A. The live demo (slide 11) is the bridge into it, so questions may start mid-demo.
Each card gives the likely question, a ~20-second answer and a one-line landing. **Slide** is the slide that backs it.
Cards 6 and 7 are the high-risk ones. Rehearse them out loud more than any other card.

---

### 1. Why recruitment? Isn't this already solved by LinkedIn / TopCV / VietnamWorks?
- **Answer:** Those are job marketplaces, and they're large: TopCV alone has 8M+ profiles. The friction I target is fragmentation of *one application's life*: the seeker re-creates a profile on every site, and the employer tracks applications and decisions outside the posting system. My contribution isn't a new kind of site. It's one platform where the round trip (apply → review → decide → status visible to both sides) lives in one place.
- **Landing line:** "I'm not competing with the marketplaces. I'm closing the loop inside one system."
- **Slide:** 3, 5.

### 2. Why analyze only two of the seven modules in depth?
- **Answer:** Scope. Fully dissecting seven modules would not fit a bachelor thesis. I picked the two that *complete each other*: Job Application on the seeker side and Employer Job Management on the employer side. Together they form the round trip, which is why the platform exists. The other five are implemented and summarized in the paper.
- **Landing line:** "Depth on the round trip beats breadth on seven disconnected features."
- **Slide:** 5.

### 3. Why backend-first, and why Express + TypeScript + Prisma + PostgreSQL?
- **Answer:** Personal reason: I want a Backend Engineering career. Engineering reason: if the rules, transitions and authorization live in the backend, any UI can be rebuilt without re-validating business logic. Express is mature and minimal. TypeScript gives shared, checked types. Prisma gives typed queries and owns the migrations (the test suite re-applies them). PostgreSQL fits relational data: users → companies → postings → applications → resumes, with enums and foreign keys enforced by the database.
- **Landing line:** "The frontend is replaceable; the backend is the product."
- **Slide:** 4, 6.

### 4. What does "contract-first" actually mean, and what happens when the contract changes?
- **Answer:** Controllers carry tsoa decorators. At build time, tsoa emits both the route table and `swagger.json`. The web app's API client is *generated from that file* (`pnpm --filter web generate:api`). Change a response shape on the server, regenerate, and the frontend fails to type-check wherever it used the old shape. The drift shows up at compile time, not in production.
- **Honest caveat if pushed:** the client must be regenerated. Forgetting that step is the one way to get out of sync, and it's a single command.
- **Landing line:** "One source of truth for request and response types."
- **Slide:** 6.

### 5. Explain the state machines. What stops an invalid transition?
- **Answer:** *Job posting:* created as PENDING_APPROVAL → a moderator approves (ACTIVE) or rejects (REJECTED) → an ACTIVE posting can be CLOSED by the employer or EXPIRED by the hourly sweep (it also runs once at startup); any edit sends it back to PENDING_APPROVAL; EXPIRED can only be DELETED. *Application:* SUBMITTED → UNDER_REVIEW → ACCEPTED / REJECTED; the seeker can WITHDRAW only while it is still SUBMITTED. The service checks the current status before every write and answers 409/400 otherwise. It also checks that the caller owns the posting (403).
- **Landing line:** "The lifecycle is enforced in the service, not trusted to the UI."
- **Slide:** 8.

---

### 6. ⚠️ TESTING — "How serious is your testing? Did you write these tests yourself? Why is the review flow untested?"

You told me the tests are largely AI-generated ("vibe-coded"). The council will find that out if you can't explain them, so the plan is to **own the design decisions and know three tests cold**. Never claim more than you can explain.

**The facts (all verified in the repo):**
| | |
|---|---|
| Runner | Vitest (`pnpm --filter api test`), ~30 s |
| Total | 89 tests, 0 failures, 7 files |
| Integration | 74 tests in 6 files: Authentication (8), BackOffice (11), Employer (20), JobExpirySweep (7), JobSeeker (18), PublicJobAccess (10) |
| Unit | 15 tests: `RecommendationScoring.test.ts`, pure functions, no DB |
| How integration tests call the API | `supertest` → `request(app).post("/applications").set("Authorization", …).send({...})`. A real HTTP request goes into the real Express app, with no server started and no mocks. |
| Database | `DATABASE_URL` + `_test` suffix, derived in `TestDatabaseUrl.ts`. `GlobalSetup.ts` runs `prisma migrate deploy` once, so the same migrations as production are used. `resetDatabase()` runs `TRUNCATE … CASCADE` in `beforeEach`. |
| Test data | `Fixtures.ts` writes rows directly with Prisma (not through the API), so a broken *register* endpoint can't make an *apply* test fail. Each test fails only for its own reason. |

**The three design choices you must be able to defend (these are your answers, not the AI's):**
1. **Why integration tests against a real database instead of mocks?** The business rules live in the services and depend on real data: a unique application per job, foreign keys, status enums. A mock would only test my assumptions about Prisma. The real database tests the actual behaviour.
2. **Why truncate before *every* test (`beforeEach`), not once (`beforeAll`)?** So no test depends on what an earlier test left behind. Otherwise the result would depend on the order the tests run in.
3. **Why a *derived* `_test` database?** Tests delete every row. Deriving the name in one place makes it impossible to point the suite at the development database by mistake.

**Know these three tests line by line** (open them before the defense and read each one out loud):
- `JobSeekerFlow.test.ts` → *"refuses a second application to the same posting"*: arrange (job + resume + existing application) → act (POST again) → assert **409** *and* `application.count() === 1`. The second assert proves nothing was written.
- `EmployerFlow.test.ts` → *"creates the posting as PENDING_APPROVAL, not ACTIVE"*: moderation can't be skipped.
- `BackOfficeFlow.test.ts` → *"takes effect on a token the banned user already holds"*: the ban check runs on every request in `authentication.ts`, so an already-issued JWT stops working immediately.

**The gap. Say it before they find it:**
- **UC-EMP-06 to 08 (the employer's application review), half of your round trip, has no automated tests.** Also untested: profile (UC-PROFILE-01–06), create company (UC-EMP-00), forgot password (UC-AUTH-04) and view users (UC-ADMIN-03). The paper already says this in §5.4.
- **Answer:** "The review flow is verified manually. You'll see it working in the demo. It is the first thing I would add tests for: invalid transitions such as accepting a SUBMITTED application, accepting a WITHDRAWN one, and another employer trying to review it. The guards already exist in `EmployerApplicationService`, so these tests follow the same pattern as the posting tests."

**If asked directly whether you used AI to write the tests:** answer truthfully. For example: "I used an AI assistant to help write the test code. I defined which business rules to verify from my use cases, I made the design choices (real database, reset before each test, direct fixtures), and I checked each test against the rule it verifies. That mapping is the traceability table in the paper." Check what your university's rules say about declaring AI use (the thesis has no such statement right now) and make sure what you say matches what you submitted.

- **Landing line:** "Verified at the API, where the business rules live. The gaps are named in the paper, not hidden."
- **Slide:** 9.

---

### 7. ⚠️ RECOMMENDATIONS — "How does it work? Is it AI? How do you know it's any good?"

This is your unique selling point, so it will be attacked. Know the formula, the reasons behind it, and its weaknesses. Admitting a weakness and naming the fix scores better than defending it.

**What it is (one breath):** content-based filtering with a linear weighted scoring function. Each active posting is scored against the two preferences the seeker entered (desired job title, preferred location), and each result carries a human-readable reason.

**The formula** (`RecommendationScoring.ts`):

    score(user, job) = 0.50 · titleMatch + 0.20 · textMatch + 0.25 · locationMatch + 0.05 · recency

- Every feature is in [0, 1], and the weights sum to 1, so the score is in [0, 1]. A unit test checks this.
- `titleMatch` = fraction of the desired-title words found in the job title. `textMatch` = the same words in the description and requirements (a weaker signal). `locationMatch` = preferred location vs. the job's location *or* the company's city. `recency` = 1 for a posting published today, falling to 0 at 30 days.
- Text is lower-cased and split into words, and a short stopword list is removed (English and unaccented Vietnamese, e.g. "job", "tuyen", "dung").

**The pipeline** (`RecommendationService.ts`): Job Seeker only → if the seeker set "NOT_LOOKING", return nothing → exclude postings already applied to → candidates = ACTIVE postings with a future deadline (same as public search) → with no preferences entered, show the newest postings and label them **LATEST**, not "recommended" → otherwise score, **drop any job with no reason**, sort, take the top 6, label **PREFERENCES**.

**Design decisions to defend:**
1. **Why not collaborative filtering / machine learning?** A new platform has no interaction history, so every user is a cold start. Collaborative filtering needs many users' behaviour. Content-based filtering only needs the job text and what the user asked for, both of which exist on day one.
2. **Why hand-picked weights?** With no usage data there is nothing to learn weights from. Fixed weights are transparent: each one reads as "how much this signal is worth". Title outranks body text because a word in the title says more than a word buried in a requirements list.
3. **Why explanations?** The reasons are built from the *same comparisons* that produce the score, so the explanation can't disagree with the ranking. A company based in the preferred city is explained differently from a job *located* there, because a wrong reason is worse than none.
4. **Why drop jobs with no reason instead of filtering on score > 0?** Recency gives every job a small non-zero score. Ranking on score alone would just sort by "newest first" and call it a recommendation.
5. **How is it tested?** 15 unit tests on the pure function (no database, every input visible in the test) and 5 integration tests on the endpoint: ranking with reasons, excludes applied jobs, LATEST fallback, NOT_LOOKING, omits non-matches.

**Weaknesses they may find. Admit each one and name the fix:**
| Attack | Honest answer | Fix |
|---|---|---|
| "How do you know the recommendations are good?" | **I haven't evaluated them.** There are no users, so no click-through data and no precision/recall. The tests prove the function behaves *as designed*, not that the design matches what users want. | Log impressions and applications, then measure precision@6 or click-through; A/B test the weights. |
| "Is this AI?" | No. It is a transparent scoring function, not machine learning. I chose that deliberately for the cold-start reason above. | Once there is data, learn the weights (e.g. logistic regression on "applied / not applied"). |
| "Substring matching is naive": `text.includes(term)` | True. Searching "java" also matches "JavaScript", and a short term like "it" matches inside "digital". | Compare whole words instead of substrings; add a skill/synonym dictionary. |
| "Only two preference fields?" | Yes: desired title and location. It ignores skills, salary, experience level and the resume content. | Extract skills from resumes; add salary/level filters as features. |
| "'Ha Noi' vs 'Hà Nội'?" | Accented and unaccented spellings don't match each other. | Strip diacritics on both sides before comparing. |
| "Does it scale?" | It scores every active posting in memory on each request. That's fine for a prototype, but not for 100k postings. | Pre-filter in SQL (full-text search), cache per user, or precompute scores. |

- **Landing line:** "It's deliberately simple and explainable. A new platform has no data for anything smarter, and every result can answer 'why this job?'"
- **Slide:** 5 (scope), 11 (demo shows the reasons), 9 (the 15 unit tests).

---

### 8. Security: what actually protects the app?
- **Answer:** Passwords are hashed with **bcrypt** (cost factor 10). Authentication uses a stateless **JWT access token**. Every request is also checked against the user's banned flag in `authentication.ts`, so a ban takes effect even on a token already issued. Role checks happen twice: the tsoa route declares the required role, and the service asserts it again (defense in depth). Ownership checks return 403 when an employer touches another company's posting or application.
- **Honest caveat:** there are no refresh tokens and no token revocation list. Logout is client-side, and the ban check covers the most important revocation case. Also, uploaded resumes are served as static files under `/uploads` without an auth check. The random UUID file names make them hard to guess, but not private (see card 11).
- **Landing line:** "Authorization is enforced at the API. The button in the UI is just decoration."
- **Slide:** 6.

### 9. What's missing / what would you do next?
- **Answer:** It's a prototype run locally: not deployed, no real users, no load testing. Next steps from the paper: notifications when a status changes, employer–applicant messaging, deployment and scale (containers, load balancing, caching search), and a mobile app. From the testing chapter: automated tests for the review flow.
- **Landing line:** "The limits are known, bounded and written down."
- **Slide:** 10.

### 10. How did you keep the documentation and code in sync?
- **Answer (tell it as a story):** document a group of use cases → implement backend-first → any surprise goes back into the documentation → repeat. Several employer use cases were added mid-implementation this way, which is why a few of them have no sequence diagram. The traceability table in the paper is the record of that loop.
- **Landing line:** "The documentation wasn't a deliverable at the end. It was how I worked."
- **Slide:** 4, 10.

---

### 11. ⚠️ DEPLOYMENT — "Why didn't you deploy it? Did anyone test it apart from you?"

**Why your first-draft answer is risky:**
- *"Deployment is out of scope"*: the council can reply "you set your own scope; why exclude it?" Also, the paper only lists deployment as a **limitation** (Ch. 7). The Aim/Scope section (§1.3) never says it's excluded. Either add one sentence there (see the fix list below) or don't lean on "scope" alone.
- *"Deploying wouldn't give me data because I have no users"*: this is circular. The obvious reply is "that's exactly why you deploy: to get users." It also sounds as if deployment has no value, while your own Future Work lists "deployment and scale".

**Better answer. Lead with the decision, then the concrete reason, then what you did instead:**
> "I chose to spend the time on the correctness of the core rather than on hosting it, and I deliberately did not put it online, for one concrete reason: it isn't ready to hold real people's data.
> The clearest example is resumes. They're stored on the server's local disk and served as static files under `/uploads`. The file names are random UUIDs, so they're hard to guess, but anyone with the link can download a CV without logging in. That's acceptable on my laptop, but I wouldn't put real candidates' CVs online like that.
> Instead, I verified it in the ways I could: 89 automated tests against a real database, a CI pipeline that lints and builds both apps on every push, and manual walkthroughs of each use case against its specification. You'll see the round trip working live in the demo."

**What deploying would actually take (shows you know the path; use it if they push):**
| Need | Now | For production |
|---|---|---|
| Resume files | Local disk, public `/uploads` route | Object storage (e.g. S3), downloads through an authorized endpoint or signed short-lived URLs |
| Runtime | `pnpm dev` on a laptop | Containerize API + web, managed PostgreSQL, `prisma migrate deploy` on release |
| Secrets & HTTPS | `.env` file | Secret manager; TLS in front of the API |
| Email (password reset) | SMTP settings in `.env` | A real mail provider and domain |
| Expiry sweep | `setInterval` inside the API process, hourly and once at startup | Fine for a single instance. With several instances, run it as a separate scheduled job. It is already safe to run twice (tested: "is safe to run twice"). |
| CI | Self-hosted runner: lint + build on push/PR to `main` | Also run the test suite in CI (it doesn't today), then deploy on merge |

**"Did anyone test it apart from you?"**
- **Answer truthfully.** From the paper, there was no user testing and it was not used by real users (Ch. 7 says so). Only mention your supervisor, internship colleagues or friends trying it **if that actually happened**, and say exactly what they did.
- Honest answer: "No formal user testing. The system was verified by automated tests and by my own manual walkthroughs against the use-case specifications. A usability study with a few job seekers and one or two employers is the first thing I'd do after deployment. That's also where the data to evaluate the recommendations would come from."
- The last sentence links to card 7, so you turn a weakness into a coherent plan: **deploy safely → small user study → measure recommendations**.

- **Landing line:** "I didn't put it online because it wasn't yet safe for real CVs. I know exactly what it needs first."
- **Slide:** 10 (limitations).

---

## Fix in the paper before submission / defense (found while preparing this)

- **Recommendation algorithm is not described in Chapter 5 (Implementation)**, although Chapter 6 says it is ("described in Section [Implementation]") and traces 15 tests to it. Add a short subsection (formula, the pipeline, why content-based). Otherwise the council will point out the dangling reference.
- **Withdraw rule wording:** the code allows withdrawal **only while SUBMITTED** (`ApplicationService.ts`, line 185). The Conclusion says "withdraw an application that has not yet been decided", which also covers UNDER_REVIEW. Align it with Chapter 5 ("Withdraw a submitted application").
- **System Context text (§3.2.1)** says "three actors … the System Administrator", but the diagram shows four actors, one of them the **Back-Office Worker**. Align the text with the diagram.
- **Scope sentence for deployment (§1.3):** add e.g. "Deployment to a production environment and evaluation with real users are outside the scope of this thesis." Then card 11's "out of scope" is backed by the paper, not only by the Limitations.
- **C1 diagram typo:** "applicaitons" in the Job Seeker arrow label.

## Never say (hard rules)

- ❌ Don't **cite use-case IDs aloud** (`UC-EMP-06/07/08`). Some exported diagram names in `images/defense/` don't match the paper's numbering. Say "the employer's review flow".
- ❌ Don't claim the platform is **deployed or production-ready**.
- ❌ Don't claim it **reduces time-to-hire**. The 44-day figure is market data, not your measurement.
- ❌ Don't claim **every business rule is tested**. The review flow isn't.
- ❌ Don't call the recommender **AI / machine learning**, and don't claim it is **accurate**. It has never been evaluated.
- ❌ Don't say deployment **"wouldn't give useful data"** or has no value. Your Future Work lists it. Say *why not yet* instead.
- ❌ Don't invent testers. Mention people who tried it only if they really did.
- ❌ Don't claim **Argon2** or **refresh tokens**. The code uses bcrypt and a single access token.

## If you don't know

Say "I didn't measure that; here's what I did instead" and bridge to the round trip or the tests. The council respects a named limitation far more than a hedge.
