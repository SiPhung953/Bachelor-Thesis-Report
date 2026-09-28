// Defense deck generator — "Big Pickle" thesis defense
// Structure: 9 slides, ~10 minutes. Design per student spec:
//   - off-white background (F7F7F2), thin black+red streaks top & bottom
//   - section label above the top streak, page counter bottom-right
const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pptx.author = "Phung Dam Tien Si";
pptx.title = "Thesis Defense — Recruitment Platform";

const IMG = (name) => path.join(__dirname, "..", "images", "defense", name);
const LOGO = path.join(__dirname, "..", "images", "USTH-logo.png");

// Read PNG dimension from the IHDR chunk (no deps needed).
function pngSize(file) {
  const b = fs.readFileSync(file);
  const w = b.readUInt32BE(16);
  const h = b.readUInt32BE(20);
  return { w, h, aspect: w / h };
}
const LOGO_A = pngSize(LOGO).aspect; // ~2.0 (1200x600)

const SW = 13.333; // slide width
const SH = 7.5; // slide height

// Palette
const C = {
  bg: "F7F7F2",
  ink: "1A1A1A",
  red: "C62828",
  muted: "5A564E",
  faint: "8B867C",
  card: "FFFFFF",
  cardLine: "DDD9CF",
  panel: "F0EEE6",
};

const F_HEAD = "Cambria"; // serif headers (safe)
const F_BODY = "Calibri"; // sans body (safe)

const TOTAL = 9;

// ---------- shared chrome helpers ----------

function streaks(slide, redW = 1.5) {
  // top streak
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0.3, w: SW, h: 0.1,
    fill: { color: C.ink }, line: { type: "none" },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0.3, w: redW, h: 0.1,
    fill: { color: C.red }, line: { type: "none" },
  });
  // bottom streak
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 7.1, w: SW, h: 0.1,
    fill: { color: C.ink }, line: { type: "none" },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 7.1, w: redW, h: 0.1,
    fill: { color: C.red }, line: { type: "none" },
  });
}

function sectionLabel(slide, label, opts = {}) {
  if (!label) return;
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.55, y: 0.145, w: 0.085, h: 0.085,
    fill: { color: C.red }, line: { type: "none" },
  });
  slide.addText(label, {
    x: 0.72, y: 0.075, w: 10.5, h: 0.24,
    fontFace: F_BODY, fontSize: 10.5, bold: true,
    color: C.faint, charSpacing: 1.6, isTextBox: true,
    ...opts,
  });
}

function counter(slide, n) {
  slide.addText(`${n} / ${TOTAL}`, {
    x: SW - 1.0 - 0.55, y: 7.0, w: 1.0, h: 0.22,
    fontFace: F_BODY, fontSize: 10.5, color: C.faint,
    align: "right", isTextBox: true,
  });
}

function title(slide, text, opts = {}) {
  slide.addText(text, {
    x: 0.55, y: 0.62, w: SW - 1.1, h: 0.66,
    fontFace: F_HEAD, fontSize: 33, bold: true, color: C.ink,
    isTextBox: true, ...opts,
  });
}

function card(slide, o) {
  const rawLine = o.line;
  let lineOpt;
  if (rawLine === "none" || (rawLine && rawLine.type === "none")) {
    lineOpt = { type: "none" };
  } else if (typeof rawLine === "string") {
    lineOpt = { color: rawLine, width: 0.75 };
  } else {
    lineOpt = { color: C.cardLine, width: 0.75 };
  }
  slide.addShape(pptx.ShapeType.rect, {
    x: o.x, y: o.y, w: o.w, h: o.h,
    fill: { color: o.fill || C.card },
    line: lineOpt,
  });
}

function bullets(slide, items, x, y, w, h, fontSize = 14, gap = 12) {
  const paras = items.map((t, i) => ({
    text: t,
    options: {
      bullet: true,
      breakLine: i < items.length - 1,
      paraSpaceAfter: gap,
      color: C.ink,
      fontSize,
      fontFace: F_BODY,
    },
  }));
  slide.addText(paras, {
    x, y, w, h, valign: "top", isTextBox: true,
  });
}

// ---------- slide builders ----------

function slideTitle() {
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  streaks(s);
  const lw = 2.0, lh = lw / LOGO_A;
  s.addImage({ path: LOGO, x: (SW - lw) / 2, y: 0.85, w: lw, h: lh });
  s.addText("BACHELOR THESIS DEFENSE", {
    x: 0, y: 2.25, w: SW, h: 0.3,
    fontFace: F_BODY, fontSize: 13, bold: true, color: C.red,
    align: "center", charSpacing: 3, isTextBox: true,
  });
  s.addText(
    "Design and Implementation of a Full-Stack\nWeb-Based Recruitment Platform\nfor Students and Employers",
    {
      x: 1.0, y: 2.7, w: SW - 2.0, h: 1.75,
      fontFace: F_HEAD, fontSize: 30, bold: true, color: C.ink,
      align: "center", isTextBox: true, lineSpacing: 26,
    }
  );
  s.addText("A centralized platform for the recruitment round trip — from application to decision", {
    x: 1.0, y: 4.55, w: SW - 2.0, h: 0.35,
    fontFace: F_BODY, fontSize: 15, italic: true, color: C.muted,
    align: "center", isTextBox: true,
  });
  s.addText("Phung Dam Tien Si  ·  23BI14384", {
    x: 0, y: 5.35, w: SW, h: 0.4,
    fontFace: F_BODY, fontSize: 17, bold: true, color: C.ink,
    align: "center", isTextBox: true,
  });
  s.addText("External Supervisor: Eng. Dinh Viet Ha   ·   Internal Supervisor: Prof. Dr. Giang Anh Tuan", {
    x: 1.0, y: 5.9, w: SW - 2.0, h: 0.3,
    fontFace: F_BODY, fontSize: 12.5, color: C.muted,
    align: "center", isTextBox: true,
  });
  s.addText("Hanoi, 2026", {
    x: 0, y: 6.35, w: SW, h: 0.3,
    fontFace: F_BODY, fontSize: 13, color: C.faint,
    align: "center", isTextBox: true,
  });
  s.addNotes(
    "Hook (15s): 'Every candidate I know has applied to the same job on three platforms. This thesis builds one place where the whole recruitment round trip — from application to decision — actually lives.' Do not read the title. Move on."
  );
}

function slideWhy() {
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  streaks(s);
  sectionLabel(s, "INTRODUCTION — WHY RECRUITMENT");
  counter(s, 2);
  title(s, "Recruitment is broken at scale");

  const stats = [
    { n: "35%", l: "of Vietnamese professionals are job-hunting right now", src: "Michael Page, 2023" },
    { n: "~44 days", l: "average time from posting to accepted offer", src: "Global recruiter survey, 2023" },
    { n: "≈7 sec", l: "a recruiter spends screening one resume", src: "Ladders eye-tracking, 2018" },
  ];
  const cw = 3.9, gap = 0.24;
  stats.forEach((st, i) => {
    const x = 0.55 + i * (cw + gap);
    card(s, { x, y: 1.32, w: cw, h: 1.85 });
    s.addText(st.n, {
      x, y: 1.5, w: cw, h: 0.75,
      fontFace: F_HEAD, fontSize: 40, bold: true, color: C.ink,
      align: "center", isTextBox: true,
    });
    s.addText(st.l, {
      x: x + 0.15, y: 2.28, w: cw - 0.3, h: 0.55,
      fontFace: F_BODY, fontSize: 12.5, color: C.ink,
      align: "center", isTextBox: true,
    });
    s.addText(st.src, {
      x: x + 0.15, y: 2.83, w: cw - 0.3, h: 0.25,
      fontFace: F_BODY, fontSize: 9.5, color: C.faint,
      align: "center", isTextBox: true,
    });
  });

  s.addShape(pptx.ShapeType.rect, {
    x: 0.55, y: 3.52, w: 12.18, h: 0.95,
    fill: { color: C.panel }, line: { type: "none" },
  });
  s.addShape(pptx.ShapeType.rect, {
    x: 0.55, y: 3.52, w: 0.1, h: 0.95,
    fill: { color: C.red }, line: { type: "none" },
  });
  s.addText("The friction: candidates recreate profiles and resumes on every platform and check each one separately — employers stitch postings, applications and decisions together by hand.", {
    x: 0.95, y: 3.65, w: 11.5, h: 0.7,
    fontFace: F_BODY, fontSize: 14, italic: true, color: C.ink,
    valign: "middle", isTextBox: true,
  });

  s.addText("How I began — self-taught, then a process", {
    x: 0.55, y: 4.72, w: 10, h: 0.32,
    fontFace: F_HEAD, fontSize: 16, bold: true, color: C.ink, isTextBox: true,
  });
  const chips = [
    { t: "Learn SDLC from scratch", d: "no formal process — studied the fundamentals first" },
    { t: "Use-case-driven loop", d: "document → implement → write every surprise back" },
    { t: "Backend-first, deliberately", d: "my goal is Backend Engineering" },
  ];
  const cw2 = 3.85, gap2 = 0.31;
  chips.forEach((ch, i) => {
    const x = 0.55 + i * (cw2 + gap2);
    card(s, { x, y: 5.15, w: cw2, h: 1.45, fill: C.panel, line: { type: "none" } });
    s.addText(ch.t, {
      x: x + 0.2, y: 5.32, w: cw2 - 0.4, h: 0.35,
      fontFace: F_BODY, fontSize: 14, bold: true, color: C.ink, isTextBox: true,
    });
    s.addText(ch.d, {
      x: x + 0.2, y: 5.72, w: cw2 - 0.4, h: 0.75,
      fontFace: F_BODY, fontSize: 11.5, color: C.muted, isTextBox: true,
    });
    if (i < chips.length - 1) {
      s.addText("→", {
        x: x + cw2 - 0.02, y: 5.52, w: gap2 + 0.04, h: 0.4,
        fontFace: F_BODY, fontSize: 20, bold: true, color: C.red,
        align: "center", isTextBox: true,
      });
    }
  });

  s.addNotes(
    "Why Recruitment — 1:45–2:00. Story first: I kept watching friends grind the same application across 3–4 websites, and employers drowning in resumes they screen in seconds. Read the three numbers as a sequence: 35% of the workforce is hunting right now; a posting takes ~44 days to fill; a single resume gets ~7 seconds. Good — thank the sources. Then the friction line. How I began (the personal note): I had no formal SDLC background; I taught myself the fundamentals, then locked onto a use-case-driven loop — document a group, implement backend-first, write any surprise back into the docs. Save the career motive for the demo slide."
  );
}

function slideGoal() {
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  streaks(s);
  sectionLabel(s, "GOAL & SCOPE");
  counter(s, 3);
  title(s, "One platform for the whole round trip");

  bullets(s, [
    "Job seekers: search jobs, apply with a resume, track and withdraw applications.",
    "Employers: manage a company, publish postings, run them through their lifecycle, review applications to a decision.",
    "Administration: moderation, user management, audit logs.",
  ], 0.55, 1.35, 6.2, 2.6);

  s.addShape(pptx.ShapeType.rect, {
    x: 0.55, y: 4.45, w: 6.2, h: 2.1,
    fill: { color: C.panel }, line: { type: "none" },
  });
  s.addShape(pptx.ShapeType.rect, {
    x: 0.55, y: 4.45, w: 0.1, h: 2.1,
    fill: { color: C.red }, line: { type: "none" },
  });
  s.addText("TWO FLOWS IN DEPTH", {
    x: 0.9, y: 4.62, w: 5.6, h: 0.3,
    fontFace: F_BODY, fontSize: 12, bold: true, color: C.red,
    charSpacing: 1.4, isTextBox: true,
  });
  s.addText("Job Application (seeker)  +  Employer Job Management (employer) — together the recruitment round trip.", {
    x: 0.9, y: 4.98, w: 5.6, h: 0.7,
    fontFace: F_BODY, fontSize: 13.5, color: C.ink, isTextBox: true,
  });
  s.addText("8 modules built in total; the supporting ones are implemented and summarized, not dissected.", {
    x: 0.9, y: 5.85, w: 5.6, h: 0.55,
    fontFace: F_BODY, fontSize: 12, italic: true, color: C.muted, isTextBox: true,
  });

  s.addImage({ path: IMG("C1! System Context Diagram.png"), x: 7.0, y: 1.35, w: 5.9, h: 3.64 });
  s.addText("System context — three actors around one platform", {
    x: 7.0, y: 5.08, w: 5.9, h: 0.3,
    fontFace: F_BODY, fontSize: 11, italic: true, color: C.faint,
    align: "center", isTextBox: true,
  });

  s.addNotes(
    "Goal & scope — ~1:00. One sentence: the platform is one place for the whole round trip; two of the eight modules — Job Application and Employer Job Management — are examined in depth, and they complete each other: a seeker applies, an employer decides. Everything else (auth, profile, resume, discovery, admin) is built and described briefly. Point at the context diagram: three actors, one system."
  );
}

function slideArch() {
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  streaks(s);
  sectionLabel(s, "SYSTEM DESIGN — ARCHITECTURE");
  counter(s, 4);
  title(s, "Contract-first monorepo");

  bullets(s, [
    "pnpm monorepo — two apps, one contract.",
    "Backend (apps/api): Express 5 + TypeScript; tsoa generates the OpenAPI spec and the routes from annotated controllers; Prisma → PostgreSQL.",
    "Frontend (apps/web): React 19 + Vite; a typed API client is regenerated from the same OpenAPI spec; Tailwind + shadcn/ui.",
  ], 0.55, 1.3, 7.7, 3.0);

  s.addShape(pptx.ShapeType.rect, {
    x: 0.55, y: 4.5, w: 7.7, h: 1.5,
    fill: { color: C.panel }, line: { type: "none" },
  });
  s.addShape(pptx.ShapeType.rect, {
    x: 0.55, y: 4.5, w: 0.1, h: 1.5,
    fill: { color: C.red }, line: { type: "none" },
  });
  s.addText("Why this matters: one source of truth for request/response types.", {
    x: 0.9, y: 4.68, w: 7.1, h: 0.32,
    fontFace: F_BODY, fontSize: 13, bold: true, color: C.ink, isTextBox: true,
  });
  s.addText("Change a response shape on the server and the client type updates at the next build — the two sides can never drift.", {
    x: 0.9, y: 5.06, w: 7.1, h: 0.75,
    fontFace: F_BODY, fontSize: 13, color: C.muted, isTextBox: true,
  });

  s.addImage({ path: IMG("C2! Container Diagram.png"), x: 8.6, y: 1.25, w: 4.1, h: 5.18 });
  s.addText("C2 — the two containers", {
    x: 8.6, y: 6.5, w: 4.1, h: 0.3,
    fontFace: F_BODY, fontSize: 11, italic: true, color: C.faint,
    align: "center", isTextBox: true,
  });

  s.addNotes(
    "Architecture — ~1:30. The one idea to drive home: contract-first. tsoa reads decorators on the controllers and emits both the route table and swagger.json; the web client is generated from that same file. So a change on the server shows up in the client's types at the next build — they cannot drift. Backend owns all rules (controller stays thin, service holds business logic, defense-in-depth role checks). Keep it to three bullets and the container diagram."
  );
}

function slideDesign() {
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  streaks(s);
  sectionLabel(s, "SYSTEM DESIGN — THE ROUND TRIP");
  counter(s, 5);
  title(s, "Two flows, modeled before code");

  s.addImage({ path: IMG("SD-JobSeeker01-Apply-For-Jobs_Simple.png"), x: 0.55, y: 2.5, w: 6.4, h: 3.11 });
  s.addText("1 · Job Seeker applies — happy path", {
    x: 0.55, y: 5.75, w: 6.4, h: 0.3,
    fontFace: F_BODY, fontSize: 12.5, italic: true, color: C.muted,
    align: "center", isTextBox: true,
  });

  s.addImage({ path: IMG("SD-Employer05-Review-Application_Simple.png"), x: 7.35, y: 1.25, w: 5.2, h: 4.47 });
  s.addText("2 · Employer reviews → status transitions", {
    x: 7.35, y: 5.75, w: 5.2, h: 0.3,
    fontFace: F_BODY, fontSize: 12.5, italic: true, color: C.muted,
    align: "center", isTextBox: true,
  });

  s.addNotes(
    "Design, the round trip — ~1:30. These are the happy-path sequence diagrams, shown exactly as modeled before implementation (the guarded full versions are in the paper). Left: the seeker applies — controller → service → Prisma → 201, application created as SUBMITTED. Right: the employer works through three steps — list, mark UNDER_REVIEW, decide ACCEPTED or REJECTED. Every guard (401/403/404/409) was documented; for the slide we show only the flow you're about to see live."
  );
}

function slideDemo() {
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  streaks(s);
  sectionLabel(s, "LIVE DEMO");
  counter(s, 6);
  title(s, "One application, end to end");

  const cards = [
    { t: "1 · Job Seeker", d: "search the right posting → apply with a saved resume → watch it land in My Applications" },
    { t: "2 · Employer", d: "open the same posting → review the application → mark UNDER_REVIEW → decide ACCEPTED" },
    { t: "3 · Both sides", d: "the status ripples back to the seeker's tracker — same browser, two roles" },
  ];
  const cw = 3.9, gap = 0.24;
  cards.forEach((c, i) => {
    const x = 0.55 + i * (cw + gap);
    card(s, { x, y: 1.35, w: cw, h: 2.4 });
    s.addShape(pptx.ShapeType.rect, {
      x, y: 1.35, w: cw, h: 0.09,
      fill: { color: C.red }, line: { type: "none" },
    });
    s.addText(c.t, {
      x: x + 0.2, y: 1.6, w: cw - 0.4, h: 0.35,
      fontFace: F_BODY, fontSize: 15, bold: true, color: C.ink, isTextBox: true,
    });
    s.addText(c.d, {
      x: x + 0.2, y: 2.05, w: cw - 0.4, h: 1.5,
      fontFace: F_BODY, fontSize: 12.5, color: C.muted, isTextBox: true,
    });
  });

  s.addShape(pptx.ShapeType.rect, {
    x: 0.55, y: 4.15, w: 12.18, h: 0.95,
    fill: { color: C.panel }, line: { type: "none" },
  });
  s.addShape(pptx.ShapeType.rect, {
    x: 0.55, y: 4.15, w: 0.1, h: 0.95,
    fill: { color: C.red }, line: { type: "none" },
  });
  s.addText("Runs locally: apps/api on :3000 (Swagger at /docs) · apps/web on :5173 · seeded data — 3 companies, 12 postings, fixed accounts and passwords.", {
    x: 0.95, y: 4.3, w: 11.5, h: 0.65,
    fontFace: F_BODY, fontSize: 13, color: C.ink,
    valign: "middle", isTextBox: true,
  });

  s.addText("Target: ~2 minutes · scripted and rehearsed · screenshot fallbacks ready", {
    x: 0.55, y: 5.45, w: 12.18, h: 0.4,
    fontFace: F_BODY, fontSize: 13, italic: true, color: C.muted,
    align: "center", isTextBox: true,
  });

  s.addNotes(
    "LIVE DEMO — 2:00 hard cap. Keep the clock; this slides into Q&A. Beat 1: as the seeded seeker (job-seeker account), search a term, open 'Backend Engineer', Apply with the pre-uploaded resume, show it appear in My Applications as SUBMITTED. Beat 2: switch to the employer account (hr@fptsoftware.demo), open the same posting, find the fresh application, mark UNDER_REVIEW, then ACCEPT — and flip back to the seeker view to show the status now reads ACCEPTED. That 'ripple' is the point of one platform. If time remains (optional 15s closer): try an admin action as the seeker and show the 403. Fallback on any failure: say 'here's what that looks like' and jump to the appendix screenshot slide you will add during rehearsal — do not linger, your buffer is only ~30s."
  );
}

function slideTesting() {
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  streaks(s);
  sectionLabel(s, "TESTING & RESULTS");
  counter(s, 7);
  title(s, "Every business rule is verified");

  const stats = [
    { n: "89", l: "test cases", s2: "across 7 suites" },
    { n: "0", l: "failures", s2: "entire suite in ~30 s" },
    { n: "7", l: "integration files", s2: "one per actor + expiry sweep" },
  ];
  const cw = 3.9, gap = 0.24;
  stats.forEach((st, i) => {
    const x = 0.55 + i * (cw + gap);
    card(s, { x, y: 1.3, w: cw, h: 1.8 });
    s.addText(st.n, {
      x, y: 1.48, w: cw, h: 0.7,
      fontFace: F_HEAD, fontSize: 40, bold: true, color: C.red,
      align: "center", isTextBox: true,
    });
    s.addText(st.l, {
      x: x + 0.15, y: 2.22, w: cw - 0.3, h: 0.35,
      fontFace: F_BODY, fontSize: 13.5, bold: true, color: C.ink,
      align: "center", isTextBox: true,
    });
    s.addText(st.s2, {
      x: x + 0.15, y: 2.6, w: cw - 0.3, h: 0.3,
      fontFace: F_BODY, fontSize: 10.5, color: C.faint,
      align: "center", isTextBox: true,
    });
  });

  bullets(s, [
    "Real database, real migrations — the suite derives a dedicated _test DB and applies prisma migrate deploy before every run.",
    "Requirements traceability — each business rule is mapped to its use case and its passing test (the matrix is in the paper).",
  ], 0.55, 3.45, 12.2, 1.9, 14, 10);

  s.addShape(pptx.ShapeType.rect, {
    x: 0.55, y: 5.5, w: 12.18, h: 0.95,
    fill: { color: C.panel }, line: { type: "none" },
  });
  s.addShape(pptx.ShapeType.rect, {
    x: 0.55, y: 5.5, w: 0.1, h: 0.95,
    fill: { color: C.red }, line: { type: "none" },
  });
  s.addText("Honest limits: the React UI is verified manually; load and concurrency are not yet exercised.", {
    x: 0.95, y: 5.65, w: 11.5, h: 0.65,
    fontFace: F_BODY, fontSize: 13, italic: true, color: C.ink,
    valign: "middle", isTextBox: true,
  });

  s.addNotes(
    "Testing — ~1:00. Numbers first: 89 cases, 0 failures, ~30 seconds — and it's not mocked, it runs against a derived test database built from the real migrations. The requirements traceability table is the strongest evidence: rule ↔ use case ↔ passing test. Then say the honest sentence yourself before they can: the UI is verified manually, and there is no load testing yet — the paper says so and so do I. That defuses the Q&A."
  );
}

function slideConclusion() {
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  streaks(s);
  sectionLabel(s, "CONCLUSION");
  counter(s, 8);
  title(s, "What I built, what I learned");

  s.addText("Contribution", {
    x: 0.55, y: 1.3, w: 6.0, h: 0.35,
    fontFace: F_BODY, fontSize: 16, bold: true, color: C.ink, isTextBox: true,
  });
  bullets(s, [
    "A centralized platform spanning the recruitment round trip — application to decision — in one contract-first monorepo.",
    "89 passing tests pin the business rules to their use cases; the docs and the code never fell out of step.",
  ], 0.55, 1.8, 6.2, 2.4);

  s.addText("What I learned", {
    x: 7.05, y: 1.3, w: 5.7, h: 0.35,
    fontFace: F_BODY, fontSize: 16, bold: true, color: C.ink, isTextBox: true,
  });
  const lessons = [
    "The document loop keeps analysis and implementation honest.",
    "Generated contracts eliminate drift between two codebases.",
    "Backend-first builds the core that every UI talks to.",
  ];
  lessons.forEach((l, i) => {
    const y = 1.8 + i * 0.85;
    card(s, { x: 7.05, y, w: 5.7, h: 0.72, fill: C.panel, line: { type: "none" } });
    s.addShape(pptx.ShapeType.rect, {
      x: 7.05, y, w: 0.09, h: 0.72,
      fill: { color: C.red }, line: { type: "none" },
    });
    s.addText(l, {
      x: 7.35, y: y + 0.13, w: 5.25, h: 0.5,
      fontFace: F_BODY, fontSize: 13, color: C.ink, isTextBox: true,
    });
  });

  s.addShape(pptx.ShapeType.rect, {
    x: 0.55, y: 5.35, w: 12.18, h: 1.05,
    fill: { color: C.panel }, line: { type: "none" },
  });
  s.addShape(pptx.ShapeType.rect, {
    x: 0.55, y: 5.35, w: 0.1, h: 1.05,
    fill: { color: C.red }, line: { type: "none" },
  });
  s.addText("Limitations owned: prototype, not deployed. Next: notifications · deployment & scale · mobile.", {
    x: 0.95, y: 5.55, w: 11.5, h: 0.65,
    fontFace: F_BODY, fontSize: 14, italic: true, color: C.ink,
    valign: "middle", isTextBox: true,
  });

  s.addNotes(
    "Conclusion — ~1:00. Contribution in two lines; then the three lessons, deliberately personal (that's the 'what I learned' the committee is told to listen for). Close by owning the limits before they ask: prototype, not deployed; the future list — notifications, deployment and scale, mobile — shows where this goes. Land it and open for questions."
  );
}

function slideThankYou() {
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  streaks(s);
  sectionLabel(s, "Q&A");
  s.addText("Thank you", {
    x: 0, y: 2.55, w: SW, h: 0.9,
    fontFace: F_HEAD, fontSize: 42, bold: true, color: C.ink,
    align: "center", isTextBox: true,
  });
  s.addText("Questions are welcome.", {
    x: 0, y: 3.7, w: SW, h: 0.4,
    fontFace: F_BODY, fontSize: 19, color: C.muted,
    align: "center", isTextBox: true,
  });
  s.addText("— or ask me to open the repo: Swagger UI lives at /docs on apps/api —", {
    x: 0, y: 4.35, w: SW, h: 0.35,
    fontFace: F_BODY, fontSize: 13, italic: true, color: C.faint,
    align: "center", isTextBox: true,
  });
  s.addImage({ path: LOGO, x: (SW - 1.8) / 2, y: 5.05, w: 1.8, h: 1.8 / LOGO_A });
  s.addNotes(
    "Leave this on screen during Q&A. Expected themes: why 2 modules in depth, the contract-first choice, the state machines, testing limits, and deployment plans — each has a prepared answer."
  );
}

slideTitle();
slideWhy();
slideGoal();
slideArch();
slideDesign();
slideDemo();
slideTesting();
slideConclusion();
slideThankYou();

const out = path.join(__dirname, "defense-deck.pptx");
pptx.writeFile({ fileName: out }).then(() => {
  console.log("Wrote " + out);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});