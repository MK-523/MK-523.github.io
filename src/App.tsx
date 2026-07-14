import { useState } from "react";
import BladeExperience from "./BladeExperience";

const roleHighlights = [
  {
    label: "Current role",
    role: "Software Engineering Intern",
    organization: "Flex",
    result: "30–60 min → under 5 min",
    resultLabel: "workflow walkthroughs",
  },
  {
    label: "Research",
    role: "Undergraduate Research Assistant",
    organization: "UCLA PSS Lab",
    result: "337 → 125 ms",
    resultLabel: "first-request latency",
  },
  {
    label: "Product",
    role: "Co-founder / Full-stack Engineer",
    organization: "ChessStalker",
    result: "11M+ games",
    resultLabel: "indexed for opponent preparation",
  },
];

const roles = [
  {
    track: "experience",
    organization: "Flex",
    dates: "Summer 2026",
    role: "Software Engineering Intern",
    focus: "Underwriting infrastructure · Financial risk tooling",
    summary:
      "Built backend and visualization tooling that made dense production underwriting logic inspectable for engineers and operators.",
    responsibilities: [
      "Built Python and TypeScript workflows with React and ReactFlow decision traces.",
      "Connected applicant inputs, rules, calculations, and outcomes in one review path.",
      "Structured type-safe decision logic for auditability and operator use.",
    ],
    results: [
      { value: "30–60 min → <5 min", label: "workflow walkthroughs" },
      { value: "2 workflows", label: "41 calculation steps visualized" },
      { value: "10 models", label: "approval, decline, and credit-limit logic" },
    ],
  },
  {
    track: "research",
    organization: "UCLA Programmable Software Systems Lab",
    dates: "2025 — Present",
    role: "Undergraduate Research Assistant",
    focus: "JVM / Serverless runtime performance",
    summary:
      "Researching how profiling and compilation artifacts can persist across OpenFaaS cold starts instead of being rebuilt for every bursty workload.",
    responsibilities: [
      "Designed Redis-backed caching for runtime and compilation artifacts.",
      "Benchmarked first-request behavior in Dockerized OpenFaaS workloads.",
      "Traced and validated runtime behavior with gdb.",
    ],
    results: [
      { value: "337 → 125 ms", label: "first-request latency" },
      { value: "2.7×", label: "faster first request" },
      { value: "31.6%", label: "less startup compile / load time" },
    ],
    link: "https://github.com/MK-523/hivejit-openfaas",
    linkLabel: "View runtime experiments",
  },
  {
    track: "experience",
    organization: "US Chess",
    dates: "2023 — 2024",
    role: "Web Developer Intern",
    focus: "Chess Life archive · Data and editorial systems",
    summary:
      "Helped build a searchable digital archive and SQL-backed retrieval workflow for decades of Chess Life issues.",
    responsibilities: [
      "Developed database-backed search and retrieval for archived magazine issues.",
      "Supported the Drupal and Pantheon editorial publishing workflow.",
      "Made historical content easier for readers and editors to locate and explore.",
    ],
    results: [
      { value: "250K+", label: "monthly readers served by the platform" },
      { value: "SQL-backed", label: "archive search and retrieval" },
    ],
    link: "https://new.uschess.org/chess-life-magazine",
    linkLabel: "Open Chess Life archive",
  },
  {
    track: "research",
    organization: "UC Santa Barbara",
    dates: "2022 — 2025",
    role: "Research Assistant",
    focus: "Network systems · Adaptive bitrate experiments",
    summary:
      "Studied adaptive bitrate behavior under changing throughput and latency, turning multi-year experiments into comparable congestion evidence.",
    responsibilities: [
      "Compared adaptive bitrate strategies across controlled network conditions.",
      "Analyzed packet traces and TCP/IP simulation output.",
      "Produced comparable evidence from three years of experiments.",
    ],
    results: [
      { value: "10K+", label: "packet samples analyzed" },
      { value: "6+", label: "adaptive bitrate variants compared" },
      { value: "SIGCOMM ’24", label: "research supported" },
    ],
  },
];

const projects = [
  {
    title: "ChessStalker",
    role: "Co-founder / Full-stack Engineer",
    summary:
      "Built a cross-platform opponent-preparation product that resolves player identities across FIDE, Lichess, and Chess.com and turns fragmented game histories into searchable, Stockfish-backed preparation.",
    bullets: [
      "Designed ingestion and identity-resolution workflows across official and online chess data.",
      "Built searchable player profiles and analysis flows for concrete opponent preparation.",
      "Worked across product design, data integration, engine analysis, and the user-facing application.",
    ],
    impact: "11M+ official games indexed · 100K+ engine analyses · 3 integrated data sources",
    stack: "Product engineering · data integration · Stockfish",
    href: "https://chessstalker.com/",
    linkLabel: "Open ChessStalker",
  },
  {
    title: "JIT State Persistence for OpenFaaS",
    role: "Undergraduate Research Assistant · UCLA PSS Lab",
    summary:
      "Built a Redis-backed artifact path that preserves profiling and compilation work across serverless cold starts instead of rebuilding it for every bursty first request.",
    bullets: [
      "Added artifact lookup and restore to the OpenFaaS runtime path.",
      "Containerized benchmark workloads and traced runtime behavior with gdb.",
      "Separated first-request latency from startup compile and load costs against an uncached baseline.",
    ],
    impact: "337 → 125 ms first request · 2.7× faster · 31.6% less compile / load time",
    stack: "OpenFaaS · Redis · Docker · gdb · runtime benchmarking",
    href: "https://github.com/MK-523/hivejit-openfaas",
    linkLabel: "View runtime experiments",
  },
  {
    title: "A-Eye",
    role: "Co-creator / Computer Vision Engineer",
    summary:
      "Built priority-aware spoken guidance from a wearable camera with Arya Kunisetty, Krishay Garg, and Hui-Peng-John-Yao.",
    bullets: [
      "Combined YOLOv8 detections with ByteTrack to preserve object identity across frames.",
      "Designed route-aware audio guidance that prioritized actionable obstacles instead of narrating every detection.",
    ],
    impact: "1st of 76 teams · MLH Best Use of ElevenLabs",
    stack: "YOLOv8 · ByteTrack · computer vision · audio guidance",
    href: "https://devpost.com/software/a-eye-pk9sdw",
    linkLabel: "Open project",
  },
  {
    title: "SAT Policy Audit",
    role: "Model Evaluation / Reliability",
    summary:
      "Audited a reinforcement-learning SAT policy and built deterministic evaluation to separate implementation failures from policy quality.",
    bullets: [
      "Found a tensor-shape failure and formula-independent behavior in the evaluation path.",
      "Tested the corrected system over 600 held-out 3-CNF formulas with exact, repeatable scoring.",
    ],
    impact: "600 held-out formulas · deterministic evaluation",
    stack: "PyTorch · reinforcement learning · exact evaluation",
    href: "https://github.com/MK-523/BooleanSatisfiability/tree/main/benchmark",
    linkLabel: "View benchmark",
  },
  {
    title: "Sentiment → Music",
    role: "Applied ML Prototype Builder",
    summary:
      "Built an end-to-end prototype connecting language-model sentiment representations, expressive music generation, and an alternate Braille-to-music interaction layer.",
    bullets: [
      "Mapped sentiment features from language models into controllable musical output.",
      "Explored a tokenized Braille interface as an alternate input and composition mechanism.",
    ],
    impact: "End-to-end multimodal prototype",
    stack: "BERT · NLTK · music AI",
    href: "https://github.com/MK-523/NLP-music-sentimentanalysis",
    linkLabel: "View project",
  },
];

const tools = [
  ["Production", "Python · TypeScript · React · ReactFlow · SQL"],
  ["Systems", "Linux · Docker · Kubernetes · OpenFaaS · Redis · gdb"],
  ["Applied ML", "PyTorch · JAX / Flax / XLA · OpenCV · BERT · NLP"],
  ["Additional", "Java · C++ · Rust · Shell · OCaml · TCP/IP · distributed systems · network security"],
];

const recognition = [
  ["US Chess Top 100 Juniors", "Competitive chess"],
  ["LA Hacks Winner", "Best Use of ElevenLabs · 1st of 76 teams"],
  ["USNCO Finalist", "Chemistry"],
];

type Role = (typeof roles)[number];
type Project = (typeof projects)[number];

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="resume-section-heading">
      <h2>{title}</h2>
    </div>
  );
}

function RoleList({ items }: { items: Role[] }) {
  return (
    <div className="resume-list">
      {items.map((item) => (
        <article className="resume-entry" key={`${item.track}-${item.organization}`} data-blade-target>
          <div className="resume-entry-header">
            <div>
              <h3>{item.role}</h3>
              <p className="resume-entry-organization">{item.organization}</p>
            </div>
            <time>{item.dates}</time>
          </div>
          <p className="resume-entry-focus">{item.focus}</p>
          <p className="resume-entry-summary">{item.summary}</p>
          <ul className="resume-entry-bullets">
            {item.responsibilities.map((detail) => <li key={detail}>{detail}</li>)}
          </ul>
          <div className="resume-entry-results" aria-label={`${item.organization} results`}>
            {item.results.map((result) => (
              <div className="resume-result" key={`${result.value}-${result.label}`}>
                <strong>{result.value}</strong>
                <span>{result.label}</span>
              </div>
            ))}
          </div>
          {item.link && (
            <a href={item.link} target="_blank" rel="noreferrer" className="case-link resume-entry-link" data-blade-target>
              {item.linkLabel} <span>↗</span>
            </a>
          )}
        </article>
      ))}
    </div>
  );
}

function ProjectList({ items }: { items: Project[] }) {
  return (
    <div className="resume-project-list">
      {items.map((project) => (
        <article className="resume-project" key={project.title} data-blade-target>
          <div className="resume-project-header">
            <div>
              <h3>{project.title}</h3>
              <p>{project.role}</p>
            </div>
            <a href={project.href} target="_blank" rel="noreferrer" className="case-link resume-project-link" data-blade-target>
              {project.linkLabel} <span>↗</span>
            </a>
          </div>
          <p className="resume-project-summary">{project.summary}</p>
          <ul className="resume-project-bullets">
            {project.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
          </ul>
          <div className="resume-project-meta">
            <strong>{project.impact}</strong>
            <span>{project.stack}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);

  return (
    <>
      <BladeExperience onReady={() => setReady(true)} />

      <header className={ready ? "site-header is-ready" : "site-header"} aria-hidden={!ready} inert={!ready ? true : undefined}>
        <a href="#top" className="site-name" data-blade-target>Mahesh Karthikeyan</a>
        <nav aria-label="Primary navigation">
          <a href="#experience" data-blade-target>Experience</a>
          <a href="#research" data-blade-target>Research</a>
          <a href="#projects" data-blade-target>Projects</a>
          <a href="#contact" data-blade-target>Contact</a>
        </nav>
      </header>

      <main className="portfolio-shell" inert={!ready ? true : undefined} aria-busy={!ready}>
        <section className="hero" id="top">
          <p className="eyebrow">UCLA Computer Science · Expected 2028</p>
          <div className="hero-display">
            <h1 className="hero-name" tabIndex={-1} aria-label="Mahesh Karthikeyan">
              <span data-text="Mahesh">Mahesh</span>
              <span data-text="Karthikeyan">Karthikeyan</span>
            </h1>
            <div className="hero-role-grid" aria-label="Current roles and selected results">
              {roleHighlights.map((item) => (
                <article className="hero-role" key={item.organization}>
                  <p>{item.label}</p>
                  <h2>{item.role}</h2>
                  <span>{item.organization}</span>
                  <strong>{item.result}</strong>
                  <small>{item.resultLabel}</small>
                </article>
              ))}
            </div>
          </div>
          <div className="hero-bottom">
            <p>Also: Web Developer Intern at US Chess · Research Assistant at UC Santa Barbara</p>
            <a href="#experience" className="text-action" data-blade-target>View experience <span>↓</span></a>
          </div>
        </section>

        <section className="work-section resume-section" id="experience" tabIndex={-1}>
          <SectionHeading title="Experience" />
          <RoleList items={roles.filter((item) => item.track === "experience")} />
        </section>

        <section className="work-section research-section resume-section" id="research" tabIndex={-1}>
          <SectionHeading title="Research" />
          <RoleList items={roles.filter((item) => item.track === "research")} />
        </section>

        <section className="resume-projects-section resume-section" id="projects" tabIndex={-1}>
          <SectionHeading title="Selected Projects" />
          <ProjectList items={projects} />
        </section>

        <section className="about-section awards-section" id="awards" tabIndex={-1}>
          <div className="about-column">
            <h2 className="about-heading">Awards</h2>
            {recognition.map(([title, context]) => (
              <div className="about-row" key={title}>
                <h3>{title}</h3>
                <p>{context}</p>
              </div>
            ))}
          </div>
          <div className="about-column technical-column">
            <h2 className="about-heading">Skills</h2>
            {tools.map(([title, list]) => (
              <div className="about-row skill-row resume-skill-row" key={title}>
                <h3>{title}</h3>
                <p className="skill-list">{list}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="contact-section" id="contact" tabIndex={-1}>
          <p>Systems engineering · Applied ML · Research collaboration</p>
          <h2>Email Mahesh.</h2>
          <a href="mailto:mahesh523k@gmail.com" className="contact-link" data-blade-target>
            mahesh523k@gmail.com <span>↗</span>
          </a>
          <div className="social-links">
            <a href="https://github.com/MK-523" target="_blank" rel="noreferrer" data-blade-target>GitHub</a>
            <a href="https://www.linkedin.com/in/mnkarthikeyan/" target="_blank" rel="noreferrer" data-blade-target>LinkedIn</a>
            <a href="https://chessstalker.com/" target="_blank" rel="noreferrer" data-blade-target>ChessStalker</a>
          </div>
        </section>
      </main>

      <footer aria-hidden={!ready} inert={!ready ? true : undefined}>
        <span>Mahesh Karthikeyan</span>
        <span>UCLA CS · Systems · Product · Chess</span>
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </>
  );
}
