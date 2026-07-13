import { useState } from "react";
import BladeExperience from "./BladeExperience";

const work = [
  {
    number: "01",
    context: "UCLA PSS Lab · Runtime systems",
    metric: "337 → 125 ms",
    metricLabel: "first-request latency",
    title: "Giving serverless runtimes a memory.",
    story:
      "Bursty workloads repeatedly pay for the same profiling and compilation work. I research how runtime artifacts can survive across cold starts, turning a blank process into one that remembers.",
    details: ["2.7× faster first request", "Redis-backed compilation cache", "Traced and validated with gdb"],
    link: "https://github.com/MK-523/hivejit-openfaas",
    linkLabel: "Runtime experiments",
  },
  {
    number: "02",
    context: "Flex · Decision systems",
    metric: "<5 min",
    metricLabel: "from 30–60 minute reviews",
    title: "Making financial decisions inspectable.",
    story:
      "At Flex, I turned dense underwriting paths into interactive decision traces so engineers and operators could follow the route from an applicant input to an outcome.",
    details: ["Python and TypeScript workflows", "ReactFlow decision traces", "Type-safe rules built for auditability"],
  },
  {
    number: "03",
    context: "ChessStalker · Competitive intelligence",
    metric: "11M+",
    metricLabel: "official games indexed",
    title: "Preparation at grandmaster scale.",
    story:
      "ChessStalker combines Lichess, Chess.com, and FIDE histories, then turns millions of games into concrete Stockfish-backed opponent preparation.",
    details: ["Used by Hikaru Nakamura", "100K+ player analyses", "Identity resolution and engine analysis"],
    link: "https://chessstalker.com/",
    linkLabel: "Open ChessStalker",
  },
  {
    number: "04",
    context: "A-Eye · Machine perception",
    metric: "1 / 76",
    metricLabel: "LA Hacks track winner",
    title: "Turning a camera feed into a safer next step.",
    story:
      "A-Eye converts a wearable camera stream into priority-aware spoken guidance for blind and low-vision users. I co-created it with Arya Kunisetty, Krishay Garg, and Hui-Peng-John-Yao at LA Hacks 2026.",
    details: ["YOLOv8 and ByteTrack", "Route-aware spoken guidance", "MLH Best Use of ElevenLabs"],
    link: "https://devpost.com/software/a-eye-pk9sdw",
    linkLabel: "See the winning build",
  },
  {
    number: "05",
    context: "UC Santa Barbara · Network experiments",
    metric: "10K+",
    metricLabel: "packet samples analyzed",
    title: "Reading the system through its packets.",
    story:
      "I studied how adaptive bitrate strategies behave when throughput and latency stop being friendly, turning three years of experiments into comparable traces and congestion evidence.",
    details: ["6+ adaptive bitrate variants", "OCaml/ML and TCP/IP simulations", "Work supporting SIGCOMM ’24 research"],
  },
];

const experiments = [
  {
    title: "SAT Policy Audit",
    description: "Found a tensor-shape failure and formula-independent behavior, then built deterministic evaluation over 600 held-out 3-CNF formulas.",
    stack: "PyTorch · reinforcement learning · exact evaluation",
    href: "https://github.com/MK-523/BooleanSatisfiability/tree/main/benchmark",
  },
  {
    title: "Sentiment → Music",
    description: "Explored language-model sentiment representations, expressive music generation, and a tokenized Braille-to-music interface.",
    stack: "BERT · NLTK · music AI",
    href: "https://github.com/MK-523/NLP-music-sentimentanalysis",
  },
  {
    title: "Chess Life Archive",
    description: "Helped shape a SQL-backed archive and editorial workflow that makes decades of Chess Life issues easier to retrieve and explore.",
    stack: "SQL · Drupal · Pantheon",
    href: "https://new.uschess.org/chess-life-magazine",
  },
];

const tools = [
  ["Languages", "Python, TypeScript, JavaScript, Java, C++, SQL, Rust, OCaml"],
  ["Systems", "Linux, Docker, Kubernetes, OpenFaaS, Redis, TCP/IP, gdb, Git"],
  ["Product + ML", "React, ReactFlow, PyTorch, JAX/XLA, BERT, OpenCV, benchmarking"],
];

const recognition = [
  ["US Chess Top 100 Juniors", "Competitive chess"],
  ["LA Hacks Winner", "Best Use of ElevenLabs · 1st of 76 teams"],
  ["USNCO Finalist", "Chemistry"],
];

export default function App() {
  const [ready, setReady] = useState(false);

  return (
    <>
      <BladeExperience onReady={() => setReady(true)} />

      <header className="site-header">
        <a href="#top" className="site-name" data-blade-target>Mahesh Karthikeyan</a>
        <nav aria-label="Primary navigation">
          <a href="#work" data-blade-target>Work</a>
          <a href="#experiments" data-blade-target>Experiments</a>
          <a href="#about" data-blade-target>About</a>
        </nav>
      </header>

      <main className="portfolio-shell" inert={!ready ? true : undefined} aria-busy={!ready}>
        <section className="hero" id="top">
          <p className="eyebrow">Software engineer · UCLA Computer Science</p>
          <div className="hero-display">
            <h1 className="hero-name" tabIndex={-1} aria-label="Mahesh Karthikeyan">
              <span data-text="Mahesh">Mahesh</span>
              <span data-text="Karthikeyan">Karthikeyan</span>
            </h1>
            <p className="hero-thesis">Systems that remember. Products that explain themselves.</p>
          </div>
          <div className="hero-bottom">
            <p>
              I’m Mahesh. I work across runtime performance, decision systems,
              machine perception, and competitive chess.
            </p>
            <a href="#work" className="text-action" data-blade-target>Selected work <span>↓</span></a>
          </div>
        </section>

        <section className="work-section" id="work">
          <div className="section-heading">
            <p>Selected work</p>
            <h2>Five systems.<br />Five measurable outcomes.</h2>
          </div>

          <div className="work-list">
            {work.map((item) => (
              <article className="work-item" key={item.number} data-blade-target>
                <div className="work-index">{item.number}</div>
                <div className="work-copy">
                  <p className="work-context">{item.context}</p>
                  <h3>{item.title}</h3>
                  <p className="work-story">{item.story}</p>
                  <ul>
                    {item.details.map((detail) => <li key={detail}>{detail}</li>)}
                  </ul>
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noreferrer" className="case-link" data-blade-target>
                      {item.linkLabel} <span>↗</span>
                    </a>
                  )}
                </div>
                <div className="work-metric">
                  <strong>{item.metric}</strong>
                  <span>{item.metricLabel}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="experiments-section" id="experiments">
          <div className="section-heading compact">
            <p>Experiments</p>
            <h2>Questions worth taking apart.</h2>
          </div>
          <div className="experiment-list">
            {experiments.map((experiment, index) => (
              <a
                href={experiment.href}
                target="_blank"
                rel="noreferrer"
                className="experiment"
                key={experiment.title}
                data-blade-target
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{experiment.title}</h3>
                <p>{experiment.description}</p>
                <small>{experiment.stack}</small>
                <b>↗</b>
              </a>
            ))}
          </div>
        </section>

        <section className="about-section" id="about">
          <div className="about-column">
            <p className="section-label">Tools</p>
            {tools.map(([title, list]) => (
              <div className="about-row" key={title}>
                <h3>{title}</h3>
                <p>{list}</p>
              </div>
            ))}
          </div>
          <div className="about-column">
            <p className="section-label">Recognition</p>
            {recognition.map(([title, context]) => (
              <div className="about-row" key={title}>
                <h3>{title}</h3>
                <p>{context}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="contact-section">
          <p>Have a hard systems problem?</p>
          <h2>Let’s make it<br />measurably better.</h2>
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

      <footer>
        <span>Mahesh Karthikeyan</span>
        <span>UCLA CS · Systems · Product · Chess</span>
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </>
  );
}
