// Defense deck generator — "Big Pickle" thesis defense
// Structure: 12 slides — a ~10-minute talk, then the live demo as the bridge into Q&A.
// Design per student spec:
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

const TOTAL = 12;

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
    x: SW - 1.0 - 0.55, y: 6.84, w: 1.0, h: 0.22,
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
// Red-barred callout panel, used for the one sentence a slide must land.
function callout(slide, x, y, w, h) {
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color: C.panel }, line: { type: "none" },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w: 0.1, h,
    fill: { color: C.red }, line: { type: "none" },
  });
}

function caption(slide, text, x, y, w) {
  slide.addText(text, {
    x, y, w, h: 0.3,
    fontFace: F_BODY, fontSize: 11.5, italic: true, color: C.muted,
    align: "center", isTextBox: true,
  });
}

function newSlide(label, n, heading) {
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  streaks(s);
  sectionLabel(s, label);
  counter(s, n);
  title(s, heading);
  return s;
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
  s.addText("One platform for the recruitment round trip — from application to decision", {
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
    "~0:30. Hand out the printed copies, greet the council, introduce yourself and the thesis in one sentence. Do not read the title aloud word for word."
  );
}

function slideAgenda() {
  const s = newSlide("OUTLINE", 2, "Outline");
  const rows = [
    { t: "Introduction", d: "why recruitment, and how I worked" },
    { t: "Goal & Scope", d: "four actors, two modules in depth" },
    { t: "System Design", d: "architecture and the two flows of the round trip" },
    { t: "Testing", d: "how the backend is verified — and what is not" },
    { t: "Conclusion", d: "what I built, what I learned, what comes next" },
    { t: "Live Demo → Q&A", d: "one application, end to end" },
  ];
  rows.forEach((r, i) => {
    const y = 1.5 + i * 0.86;
    s.addText(String(i + 1).padStart(2, "0"), {
      x: 1.4, y, w: 0.9, h: 0.6,
      fontFace: F_HEAD, fontSize: 28, bold: true, color: C.red, isTextBox: true,
    });
    s.addText(r.t, {
      x: 2.4, y, w: 4.2, h: 0.6,
      fontFace: F_HEAD, fontSize: 22, bold: true, color: C.ink,
      valign: "middle", isTextBox: true,
    });
    s.addText(r.d, {
      x: 6.6, y, w: 5.6, h: 0.6,
      fontFace: F_BODY, fontSize: 15, color: C.muted,
      valign: "middle", isTextBox: true,
    });
    if (i < rows.length - 1) {
      s.addShape(pptx.ShapeType.rect, {
        x: 1.4, y: y + 0.74, w: 10.8, h: 0.01,
        fill: { color: C.cardLine }, line: { type: "none" },
      });
    }
  });
  s.addNotes("~0:15. One sentence covering all six items. The demo is last on purpose: it is the bridge into Q&A.");
}

function slideWhy() {
  const s = newSlide("INTRODUCTION - WHY RECRUITMENT", 3, "A large, active market - still fragmented");

  const stats = [
    { n: "52.9 M", l: "people in Vietnam's labour force", src: "National Statistics Office, 2024" },
    { n: "35%", l: "of Vietnamese professionals actively job-hunting", src: "Michael Page Vietnam, 2023" },
    { n: "44 days", l: "average from a job being posted to an offer being made", src: "AMS & The Josh Bersin Company, 2023" },
  ];
  const cw = 3.9, gap = 0.24;
  stats.forEach((st, i) => {
    const x = 0.55 + i * (cw + gap);
    card(s, { x, y: 1.4, w: cw, h: 2.0 });
    s.addText(st.n, {
      x, y: 1.58, w: cw, h: 0.75,
      fontFace: F_HEAD, fontSize: 40, bold: true, color: C.ink,
      align: "center", isTextBox: true,
    });
    s.addText(st.l, {
      x: x + 0.2, y: 2.36, w: cw - 0.4, h: 0.62,
      fontFace: F_BODY, fontSize: 13, color: C.ink,
      align: "center", valign: "middle", isTextBox: true,
    });
    s.addText(st.src, {
      x: x + 0.15, y: 3.02, w: cw - 0.3, h: 0.25,
      fontFace: F_BODY, fontSize: 9.5, color: C.faint,
      align: "center", isTextBox: true,
    });
  });

  s.addText("TopCV alone reports 8M+ candidate profiles and 540,000+ employers (TopCV, 2023), yet hiring remains slow and largely manual.", {
    x: 0.55, y: 3.7, w: 12.18, h: 0.75,
    fontFace: F_BODY, fontSize: 14.5, color: C.muted, isTextBox: true,
  });

  callout(s, 0.55, 4.75, 12.18, 1.75);
  s.addText("THE FRICTION I FOCUS ON", {
    x: 0.95, y: 4.9, w: 11.5, h: 0.3,
    fontFace: F_BODY, fontSize: 12, bold: true, color: C.red,
    charSpacing: 1.4, isTextBox: true,
  });
  s.addText([
    { text: "Job seekers ", options: { bold: true } },
    { text: "recreate the same profile and resume on every site, then check each one separately.", options: { breakLine: true } },
    { text: "Employers ", options: { bold: true } },
    { text: "stitch postings, applications and decisions together by hand." },
  ], {
    x: 0.95, y: 5.25, w: 11.5, h: 1.1,
    fontFace: F_BODY, fontSize: 15, color: C.ink,
    valign: "top", paraSpaceAfter: 6, isTextBox: true,
  });

  s.addNotes(
    "~1:10. Scale first (labour force, 35% hunting), then: platforms are already big, yet hiring is still slow and manual (44 days, posted → offer made). Then pivot: the part of that friction I address is fragmentation. Do NOT say the platform shortens time-to-hire; these are market figures, not my measurements."
  );
}

function slideApproach() {
  const s = newSlide("INTRODUCTION - HOW I WORKED", 4, "A use-case-driven loop");

  const steps = [
    { t: "1 · Document", d: "use cases, specifications, class and sequence diagrams for one group" },
    { t: "2 · Implement", d: "backend first, then the frontend that consumes it" },
    { t: "3 · Write back", d: "anything unexpected becomes a documented use case" },
  ];
  const bw = 3.4, bg = 0.79, by = 1.55, bh = 1.75;
  const xs = steps.map((_, i) => 0.75 + i * (bw + bg));
  steps.forEach((st, i) => {
    const x = xs[i];
    card(s, { x, y: by, w: bw, h: bh });
    s.addShape(pptx.ShapeType.rect, {
      x, y: by, w: bw, h: 0.09,
      fill: { color: C.red }, line: { type: "none" },
    });
    s.addText(st.t, {
      x: x + 0.2, y: by + 0.25, w: bw - 0.4, h: 0.4,
      fontFace: F_HEAD, fontSize: 18, bold: true, color: C.ink, isTextBox: true,
    });
    s.addText(st.d, {
      x: x + 0.2, y: by + 0.72, w: bw - 0.4, h: 0.9,
      fontFace: F_BODY, fontSize: 13, color: C.muted, valign: "top", isTextBox: true,
    });
    if (i < steps.length - 1) {
      s.addShape(pptx.ShapeType.line, {
        x: x + bw + 0.12, y: by + bh / 2, w: bg - 0.24, h: 0,
        line: { color: C.red, width: 2, endArrowType: "triangle" },
      });
    }
  });

  // Return path: step 3 back to step 1.
  const loopY = by + bh + 0.45;
  const x1 = xs[0] + bw / 2, x3 = xs[2] + bw / 2;
  const lineStyle = { color: C.red, width: 2 };
  s.addShape(pptx.ShapeType.line, { x: x3, y: by + bh, w: 0, h: loopY - (by + bh), line: lineStyle });
  s.addShape(pptx.ShapeType.line, { x: x1, y: loopY, w: x3 - x1, h: 0, line: lineStyle });
  s.addShape(pptx.ShapeType.line, {
    x: x1, y: by + bh, w: 0, h: loopY - (by + bh),
    line: { ...lineStyle, beginArrowType: "triangle" },
  });
  s.addText("repeat for each group: profile · resume · job application · employer · back office", {
    x: x1, y: loopY + 0.05, w: x3 - x1, h: 0.35,
    fontFace: F_BODY, fontSize: 12, italic: true, color: C.muted,
    align: "center", isTextBox: true,
  });

  const notes = [
    { t: "Started from the fundamentals", d: "During my internship I first studied the Software Development Life Cycle, then applied it to this project." },
    { t: "Backend-first, on purpose", d: "My goal is to learn Backend Engineering skills, so the business rules were built and tested first." },
  ];
  notes.forEach((n, i) => {
    const x = 0.55 + i * 6.19;
    callout(s, x, 4.9, 5.99, 1.35);
    s.addText(n.t, {
      x: x + 0.35, y: 5.05, w: 5.45, h: 0.35,
      fontFace: F_BODY, fontSize: 15, bold: true, color: C.ink, isTextBox: true,
    });
    s.addText(n.d, {
      x: x + 0.35, y: 5.45, w: 5.45, h: 0.75,
      fontFace: F_BODY, fontSize: 13, color: C.muted, valign: "top", isTextBox: true,
    });
  });

  s.addNotes("~0:40. The loop is why the paper and the code agree: every surprise found during implementation was written back into the analysis. If running long, cut this slide and say it in one sentence on slide 3.");
}

function slideGoal() {
  const s = newSlide("GOAL & SCOPE", 5, "One platform for the whole round trip");

  bullets(s, [
    "Guest: a visitor - search jobs, see companies and their jobs, no account needed.",
    "Job Seeker: search, apply with a resume, track and withdraw applications; recommendations ranked on stated preferences.",
    "Employer: company profile, job postings through their lifecycle, review applications to a decision.",
    "Back-Office Worker: moderate postings, manage users, read audit logs.",
  ], 0.55, 1.35, 6.3, 3.1, 14, 9);

  callout(s, 0.55, 4.6, 6.3, 1.95);
  s.addText("TWO MODULES IN DEPTH", {
    x: 0.9, y: 4.75, w: 5.7, h: 0.3,
    fontFace: F_BODY, fontSize: 12, bold: true, color: C.red,
    charSpacing: 1.4, isTextBox: true,
  });
  s.addText("Job Application (Job Seeker)  +  Employer Job Management (Employer) together makes the recruitment round trip.", {
    x: 0.9, y: 5.08, w: 5.75, h: 0.75,
    fontFace: F_BODY, fontSize: 14, color: C.ink, isTextBox: true,
  });
  s.addText("7 modules built in total; the other five are implemented and summarized in the paper.", {
    x: 0.9, y: 5.9, w: 5.75, h: 0.5,
    fontFace: F_BODY, fontSize: 12, italic: true, color: C.muted, isTextBox: true,
  });

  s.addImage({ path: IMG("C1! System Context Diagram.png"), x: 7.1, y: 1.45, w: 5.65, h: 5.65 / 1.619 });
  caption(s, "System context: four actors around one platform", 7.1, 5.05, 5.65);

  s.addNotes(
    "~0:45. Four actors; I focus on the two every recruitment platform needs. The Job Seeker applies, the Employer manages postings and decides, those two modules complete each other."
  );
}

function slideArch() {
  const s = newSlide("SYSTEM DESIGN - ARCHITECTURE", 6, "Three containers, one contract");

  bullets(s, [
    "Frontend Web App: React 19 + Vite single-page app (Tailwind, shadcn/ui).",
    "Backend API: Express 5 + TypeScript; every business rule lives here.",
    "Database: PostgreSQL, accessed through the Prisma ORM.",
  ], 0.55, 1.35, 8.0, 1.85, 15, 8);

  callout(s, 0.55, 3.3, 8.0, 1.3);
  s.addText("Contract-first", {
    x: 0.9, y: 3.43, w: 7.4, h: 0.35,
    fontFace: F_BODY, fontSize: 15, bold: true, color: C.ink, isTextBox: true,
  });
  s.addText("tsoa generates the OpenAPI spec and the routes from annotated controllers; the frontend's typed API client is generated from the same spec so the two sides cannot drift apart.", {
    x: 0.9, y: 3.8, w: 7.45, h: 0.75,
    fontFace: F_BODY, fontSize: 13, color: C.muted, valign: "top", isTextBox: true,
  });

  callout(s, 0.55, 4.85, 8.0, 1.3);
  s.addText("Every request takes the same path", {
    x: 0.9, y: 4.98, w: 7.4, h: 0.35,
    fontFace: F_BODY, fontSize: 15, bold: true, color: C.ink, isTextBox: true,
  });
  s.addText("Route → Controller → Service → Prisma. Controllers stay thin; services own the rules and re-check the caller's role (defense in depth).", {
    x: 0.9, y: 5.35, w: 7.45, h: 0.75,
    fontFace: F_BODY, fontSize: 13, color: C.muted, valign: "top", isTextBox: true,
  });

  const ih = 5.2, iw = ih * 0.626;
  s.addImage({ path: IMG("C2! Container Diagram.png"), x: 9.0 + (3.75 - iw) / 2, y: 1.3, w: iw, h: ih });
  caption(s, "C2: three containers", 9.0, 6.55, 3.75);

  s.addNotes(
    "~1:15. One sentence per container, then the decision that is mine: contract-first. Change a response shape on the server and the client's types change at the next build. Then the request path: controller → service → Prisma; the service re-checks the role even though the route already did."
  );
}

// Round-trip slides show the happy-path sequence diagram alone, as large as
// the slide allows: the labels are small, and the guards live in the paper.
function diagramSlide(label, n, heading, file, aspect, cap, notes) {
  const s = newSlide(label, n, heading);
  const top = 1.35, maxW = SW - 1.1, maxH = 6.45 - top;
  let w = maxW, h = w / aspect;
  if (h > maxH) { h = maxH; w = h * aspect; }
  s.addImage({ path: IMG(file), x: (SW - w) / 2, y: top, w, h });
  caption(s, cap, 0.55, top + h + 0.05, maxW);
  s.addNotes(notes);
}

function slideSeekerFlow() {
  diagramSlide(
    "SYSTEM DESIGN — ROUND TRIP ①", 7, "The Job Seeker applies for a job",
    "SD-JobSeeker01-Apply-For-Jobs_Simple.png", 2.056,
    "Apply for a job — happy path, modeled before implementation",
    "~0:40. Follow one request down the lifelines: Frontend → ApplicationController → ApplicationService → Prisma → Database, and back as 201 Created with the application stored as SUBMITTED. Same path as the architecture slide. Don't read every arrow; the demo shows it live."
  );
}

function slideEmployerFlow() {
  diagramSlide(
    "SYSTEM DESIGN — ROUND TRIP ②", 8, "The Employer reviews and decides",
    "SD-Employer05-Review-Application_Simple.png", 1.164,
    "Review an application — happy path, modeled before implementation",
    "~0:40. Three steps, top to bottom: the employer opens the posting's application list; marks one application under review; then records the decision (accepted). Each step goes through the same controller → service → Prisma path. This closes the round trip the seeker started on the previous slide."
  );
}

function slideTesting() {
  const s = newSlide("TESTING", 9, "How the backend is verified");

  const stats = [
    { n: "89", l: "test cases, 0 failures", s2: "the whole suite runs in ~30 s" },
    { n: "74", l: "integration tests", s2: "HTTP request → real PostgreSQL" },
    { n: "15", l: "unit tests", s2: "the recommendation scoring, no database" },
  ];
  const cw = 3.9, gap = 0.24;
  stats.forEach((st, i) => {
    const x = 0.55 + i * (cw + gap);
    card(s, { x, y: 1.35, w: cw, h: 1.8 });
    s.addText(st.n, {
      x, y: 1.5, w: cw, h: 0.7,
      fontFace: F_HEAD, fontSize: 40, bold: true, color: C.red,
      align: "center", isTextBox: true,
    });
    s.addText(st.l, {
      x: x + 0.15, y: 2.22, w: cw - 0.3, h: 0.35,
      fontFace: F_BODY, fontSize: 14, bold: true, color: C.ink,
      align: "center", isTextBox: true,
    });
    s.addText(st.s2, {
      x: x + 0.15, y: 2.6, w: cw - 0.3, h: 0.3,
      fontFace: F_BODY, fontSize: 11, color: C.faint,
      align: "center", isTextBox: true,
    });
  });

  bullets(s, [
    "A separate _test database, built from the real migrations and emptied before every test.",
    "Requirements traceability: each tested rule is mapped to its use case and its test (full matrix in the paper).",
  ], 0.55, 3.45, 12.2, 1.4, 14, 8);

  callout(s, 0.55, 5.0, 12.18, 1.55);
  s.addText("NOT YET COVERED", {
    x: 0.95, y: 5.12, w: 11.5, h: 0.3,
    fontFace: F_BODY, fontSize: 12, bold: true, color: C.red,
    charSpacing: 1.4, isTextBox: true,
  });
  s.addText("The employer's application review, profile management and password reset have no automated tests yet; the React UI is checked by hand; no load or concurrency testing.", {
    x: 0.95, y: 5.45, w: 11.5, h: 0.95,
    fontFace: F_BODY, fontSize: 14, color: C.ink, valign: "top", isTextBox: true,
  });

  s.addNotes(
    "~0:50. Numbers, then how: real database, real migrations, reset before each test. Then say the gaps yourself before they ask; the paper lists them in the Results section. Be ready to open one test and explain it line by line (see qa-prep.md)."
  );
}

function slideConclusion() {
  const s = newSlide("CONCLUSION", 10, "What I built, what I learned");

  s.addText("Contribution", {
    x: 0.55, y: 1.3, w: 6.0, h: 0.35,
    fontFace: F_BODY, fontSize: 16, bold: true, color: C.ink, isTextBox: true,
  });
  bullets(s, [
    "A working platform for the recruitment round trip.",
    "Simple job recommendations, ranked on the seeker's stated preferences.",
    "89 passing tests, traced back to the use cases they verify.",
  ], 0.55, 1.8, 6.2, 3.2, 14, 10);

  s.addText("What I learned", {
    x: 7.05, y: 1.3, w: 5.7, h: 0.35,
    fontFace: F_BODY, fontSize: 16, bold: true, color: C.ink, isTextBox: true,
  });
  const lessons = [
    "Writing surprises back keeps the documents and the code honest.",
    "A generated contract removes drift between two codebases.",
    "Backend-first builds the core that every screen depends on.",
  ];
  lessons.forEach((l, i) => {
    const y = 1.8 + i * 0.95;
    card(s, { x: 7.05, y, w: 5.7, h: 0.8, fill: C.panel, line: { type: "none" } });
    s.addShape(pptx.ShapeType.rect, {
      x: 7.05, y, w: 0.09, h: 0.8,
      fill: { color: C.red }, line: { type: "none" },
    });
    s.addText(l, {
      x: 7.35, y: y + 0.1, w: 5.25, h: 0.6,
      fontFace: F_BODY, fontSize: 13.5, color: C.ink, valign: "middle", isTextBox: true,
    });
  });

  callout(s, 0.55, 5.1, 12.18, 1.45);
  s.addText([
    { text: "Limitations: ", options: { bold: true } },
    { text: "a prototype run locally (not deployed and used by real users, not load-tested).", options: { breakLine: true } },
    { text: "Next: ", options: { bold: true } },
    { text: "notifications · employer-applicant messaging · deployment & scale · a mobile app." },
  ], {
    x: 0.95, y: 5.22, w: 11.5, h: 1.2,
    fontFace: F_BODY, fontSize: 14, color: C.ink,
    valign: "middle", paraSpaceAfter: 6, isTextBox: true,
  });

  s.addNotes(
    "~0:50. Contribution, then the three personal lessons, then the limitations — said before they ask. End with: 'Let me show you the platform.' and move straight to the demo."
  );
}

function slideDemo() {
  const s = newSlide("LIVE DEMO → Q&A", 11, "Live demo: one application, end to end");

  const cards = [
    { t: "1 · Job Seeker", d: "dashboard recommendations, each with its reason → open “Backend Engineer” → apply with a saved resume → SUBMITTED" },
    { t: "2 · Employer", d: "open the same posting → find the new application → mark UNDER_REVIEW → ACCEPT" },
    { t: "3 · Back to the seeker", d: "My Applications now reads ACCEPTED" },
  ];
  const cw = 3.9, gap = 0.24;
  cards.forEach((c, i) => {
    const x = 0.55 + i * (cw + gap);
    card(s, { x, y: 1.4, w: cw, h: 2.6 });
    s.addShape(pptx.ShapeType.rect, {
      x, y: 1.4, w: cw, h: 0.09,
      fill: { color: C.red }, line: { type: "none" },
    });
    s.addText(c.t, {
      x: x + 0.2, y: 1.65, w: cw - 0.4, h: 0.35,
      fontFace: F_BODY, fontSize: 16, bold: true, color: C.ink, isTextBox: true,
    });
    s.addText(c.d, {
      x: x + 0.2, y: 2.1, w: cw - 0.4, h: 1.75,
      fontFace: F_BODY, fontSize: 14, color: C.muted, valign: "top", isTextBox: true,
    });
  });

  callout(s, 0.55, 4.35, 12.18, 0.95);
  s.addText("Runs locally: API on :3000 (Swagger UI at /docs) · web app on :5173 · seeded data - 3 companies, 12 postings.", {
    x: 0.95, y: 4.45, w: 11.5, h: 0.75,
    fontFace: F_BODY, fontSize: 13.5, color: C.ink,
    valign: "middle", isTextBox: true,
  });

  s.addText("Questions are welcome during the demo.", {
    x: 0.55, y: 5.7, w: 12.18, h: 0.45,
    fontFace: F_HEAD, fontSize: 20, italic: true, color: C.muted,
    align: "center", isTextBox: true,
  });

  s.addNotes(
    "The demo sits outside the 10-minute talk and bridges into Q&A. Follow demo-script.md. If a council member interrupts with a question, answer it: that is Q&A starting early. If anything breaks, switch to the screenshots and carry on."
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
  s.addImage({ path: LOGO, x: (SW - 1.8) / 2, y: 4.8, w: 1.8, h: 1.8 / LOGO_A });
  s.addNotes(
    "Leave on screen during Q&A. Prepared answers: qa-prep.md — especially Testing (card 6) and Recommendations (card 7)."
  );
}

slideTitle();
slideAgenda();
slideWhy();
slideApproach();
slideGoal();
slideArch();
slideSeekerFlow();
slideEmployerFlow();
slideTesting();
slideConclusion();
slideDemo();
slideThankYou();

const out = path.join(__dirname, "defense-deck.pptx");
pptx.writeFile({ fileName: out }).then(() => {
  console.log("Wrote " + out);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
