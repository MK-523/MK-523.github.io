import { useState } from "react";
import BladeExperience from "./BladeExperience";

const roleHighlights = [
  {
    label: "Current role",
    role: "Software Engineering / Machine Learning Engineering Intern",
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
    number: "01",
    track: "experience",
    organization: "Flex",
    dates: "Summer 2026",
    role: "Software Engineering / Machine Learning Engineering Intern",
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
    number: "01",
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
    number: "02",
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
    number: "02",
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
    track: "experience",
    role: "Co-founder / Full-stack Engineer",
    title: "ChessStalker",
    description:
      "Combined Lichess, Chess.com, and FIDE histories with identity resolution and Stockfish analysis for concrete opponent preparation.",
    result: "11M+ official games · 100K+ analyses · used by Hikaru Nakamura",
    stack: "Product engineering · data integration · chess engines",
    href: "https://chessstalker.com/",
  },
  {
    track: "experience",
    role: "Co-creator / Computer Vision Engineer",
    title: "A-Eye",
    description:
      "Built priority-aware spoken guidance from a wearable camera with Arya Kunisetty, Krishay Garg, and Hui-Peng-John-Yao.",
    result: "1st of 76 teams · MLH Best Use of ElevenLabs",
    stack: "YOLOv8 · ByteTrack · route-aware audio guidance",
    href: "https://devpost.com/software/a-eye-pk9sdw",
  },
  {
    track: "research",
    role: "Model Evaluation / Reliability",
    title: "SAT Policy Audit",
    description: "Found a tensor-shape failure and formula-independent behavior, then built deterministic evaluation over 600 held-out 3-CNF formulas.",
    result: "600 held-out formulas · deterministic evaluation",
    stack: "PyTorch · reinforcement learning · exact evaluation",
    href: "https://github.com/MK-523/BooleanSatisfiability/tree/main/benchmark",
  },
  {
    track: "research",
    role: "Applied ML Prototype Builder",
    title: "Sentiment → Music",
    description: "Explored language-model sentiment representations, expressive music generation, and a tokenized Braille-to-music interface.",
    result: "End-to-end multimodal prototype",
    stack: "BERT · NLTK · music AI",
    href: "https://github.com/MK-523/NLP-music-sentimentanalysis",
  },
];

const tools = [
  ["Languages", "Python, TypeScript, JavaScript, Java, C++, SQL, Rust, Shell, OCaml"],
  ["Product + ML", "React, ReactFlow, PyTorch, JAX/Flax/XLA, BERT, NLP, OpenCV"],
  ["Systems + Databases", "Linux, Git, Docker, Kubernetes, OpenFaaS, Redis, TCP/IP, serverless computing, SQL backends, query execution, gdb, Prometheus-style monitoring"],
  ["Security + Core CS", "Access control, network security, data structures, algorithms, object-oriented programming, distributed systems, performance benchmarking"],
];

const recognition = [
  ["US Chess Top 100 Juniors", "Competitive chess"],
  ["LA Hacks Winner", "Best Use of ElevenLabs · 1st of 76 teams"],
  ["USNCO Finalist", "Chemistry"],
];

type Role = (typeof roles)[number];
type Project = (typeof projects)[number];

function RoleList({ items }: { items: Role[] }) {
  return (
    <div className="work-list">
      {items.map((item) => (
        <article className="work-item" key={`${item.track}-${item.number}`} data-blade-target>
          <div className="work-index">{item.number}</div>
          <div className="work-copy">
            <div className="work-meta">
              <p className="work-context">{item.organization}</p>
              <time>{item.dates}</time>
            </div>
            <h3>{item.role}</h3>
            <p className="work-focus">{item.focus}</p>
            <p className="work-story">{item.summary}</p>
            <ul className="work-responsibilities">
              {item.responsibilities.map((detail) => <li key={detail}>{detail}</li>)}
            </ul>
          </div>
          <aside className="work-results" aria-label={`${item.organization} results`}>
            <p>Results</p>
            {item.results.map((result) => (
              <div className="result-row" key={`${result.value}-${result.label}`}>
                <strong>{result.value}</strong>
                <span>{result.label}</span>
              </div>
            ))}
            {item.link && (
              <a href={item.link} target="_blank" rel="noreferrer" className="case-link" data-blade-target>
                {item.linkLabel} <span>↗</span>
              </a>
            )}
          </aside>
        </article>
      ))}
    </div>
  );
}

function ProjectList({ items }: { items: Project[] }) {
  return (
    <div className="experiment-list">
      {items.map((project, index) => (
        <a
          href={project.href}
          target="_blank"
          rel="noreferrer"
          className="experiment"
          key={project.title}
          data-blade-target
        >
          <span>{String(index + 1).padStart(2, "0")}</span>
          <div className="experiment-identity">
            <small>{project.role}</small>
            <h3>{project.title}</h3>
          </div>
          <p>{project.description}</p>
          <div className="experiment-result">
            <strong>{project.result}</strong>
            <small>{project.stack}</small>
          </div>
          <b>↗</b>
        </a>
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
          <a href="#awards" data-blade-target>Awards</a>
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

        <section className="work-section" id="experience" tabIndex={-1}>
          <div className="section-heading">
            <p>Experience</p>
            <div>
              <h2>Engineering and product roles</h2>
              <span>Flex · US Chess · ChessStalker · A-Eye</span>
            </div>
          </div>
          <RoleList items={roles.filter((item) => item.track === "experience")} />

          <div className="subsection-heading">
            <p>Selected products</p>
            <h3>Product engineering</h3>
          </div>
          <ProjectList items={projects.filter((item) => item.track === "experience")} />
        </section>

        <section className="work-section research-section" id="research" tabIndex={-1}>
          <div className="section-heading compact">
            <p>Research</p>
            <div>
              <h2>Runtime and network systems research</h2>
              <span>UCLA PSS Lab · UC Santa Barbara</span>
            </div>
          </div>
          <RoleList items={roles.filter((item) => item.track === "research")} />

          <div className="subsection-heading">
            <p>Technical investigations</p>
            <h3>Model evaluation and applied ML</h3>
          </div>
          <ProjectList items={projects.filter((item) => item.track === "research")} />
        </section>

        <section className="about-section awards-section" id="awards" tabIndex={-1}>
          <div className="about-column">
            <p className="section-label">Awards and recognition</p>
            {recognition.map(([title, context]) => (
              <div className="about-row" key={title}>
                <h3>{title}</h3>
                <p>{context}</p>
              </div>
            ))}
          </div>
          <div className="about-column">
            <p className="section-label">Technical range</p>
            {tools.map(([title, list]) => (
              <div className="about-row" key={title}>
                <h3>{title}</h3>
                <p>{list}</p>
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
