import { useEffect, useRef, useState } from "react";
import NatureWorld, { Sprout } from "./NatureWorld";
import { Arrow } from "./Icons";
import { projects, roles, campusRoles, recognition, skills } from "./content";

const descriptions = [
  "A little preparation. A better next move.",
  "A second pair of eyes. A little more independence.",
  "Better questions for more reliable models.",
  "Turning how we feel into what we hear.",
];
const types = [
  "FULL-STACK PRODUCT",
  "COMPUTER VISION",
  "ML RELIABILITY",
  "MULTIMODAL EXPLORATION",
];
function External({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
      <Arrow diagonal />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export default function App() {
  const [selected, setSelected] = useState<number | null>(null);
  const [visited, setVisited] = useState<number[]>([]);
  const [filter, setFilter] = useState("All work");
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [menu, setMenu] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const project = selected === null ? null : projects[selected];
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (project && dialog.current && !dialog.current.open)
      dialog.current.showModal();
    if (project) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }
  }, [project]);
  function discover(index: number) {
    returnFocus.current = document.activeElement as HTMLElement;
    setSelected(index);
    setVisited((old) => (old.includes(index) ? old : [...old, index]));
  }
  function close() {
    dialog.current?.close();
    setSelected(null);
    returnFocus.current?.focus();
  }
  return (
    <div
      id="top"
      className={`portfolio ${paused || reduced ? "motion-paused" : ""}`}
    >
      <a className="skip-link" href="#projects">
        Skip to projects
      </a>
      <header className="site-header">
        <a
          className="wordmark"
          href="#top"
          aria-label="Mahesh Karthikeyan, home"
        >
          <span className="brand-icon">
            <Sprout />
          </span>
          <span>
            mahesh<span className="brand-period">.</span>
          </span>
        </a>
        <nav
          id="mobile-nav"
          aria-label="Main navigation"
          className={menu ? "navigation is-open" : "navigation"}
        >
          {[
            ["projects", "The work"],
            ["experience", "Experience"],
            ["about", "About"],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={() => setMenu(false)}>
              {label}
            </a>
          ))}
          <a
            className="nav-contact"
            href="#contact"
            onClick={() => setMenu(false)}
          >
            Say hello <Arrow diagonal />
          </a>
        </nav>
        <button
          className="menu-button"
          aria-expanded={menu}
          aria-controls="mobile-nav"
          onClick={() => setMenu(!menu)}
          aria-label={menu ? "Close navigation" : "Open navigation"}
        >
          {menu ? "Close −" : "Menu +"}
        </button>
      </header>
      <main>
        <section className="hero" aria-labelledby="intro-title">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="status-dot" /> MAHESH KARTHIKEYAN{" "}
              <span className="eyebrow-divider">/</span> PORTFOLIO
            </p>
            <h1 id="intro-title">
              A curious mind.
              <br />A world to <em>build.</em>
              <svg
                className="title-spark"
                viewBox="0 0 42 42"
                aria-hidden="true"
              >
                <path
                  d="m21 0 3 15L38 8 27 20l15 4-17 3 6 14-11-12-10 9 5-14L0 19l16-2Z"
                  fill="currentColor"
                />
              </svg>
            </h1>
            <p className="hero-description">
              Hi, I’m Mahesh. I build useful things at the intersection of{" "}
              <strong>
                systems, machine learning, and a little curiosity.
              </strong>
            </p>
            <div className="hero-actions">
              <a className="primary-button" href="#projects">
                Explore my work <Arrow />
              </a>
              <a className="quiet-link" href="#about">
                Meet the builder <span aria-hidden="true">↗</span>
              </a>
            </div>
            <p className="hero-location">
              <span aria-hidden="true">⌖</span> UCLA Computer Science{" "}
              <span>·</span> Class of 2028
            </p>
          </div>
          <NatureWorld onDiscover={discover} visited={visited} />
          <div className="hero-bottom">
            <span className="field-note">
              <span aria-hidden="true">↳</span> Good things grow from curiosity.
            </span>
            <a href="#projects" className="scroll-link">
              TAKE THE SCENIC ROUTE <span aria-hidden="true">↓</span>
            </a>
          </div>
        </section>
        <div className="trail-bar">
          <div className="trail-label">
            <Sprout />
            <span>Your field notes</span>
            <span className="trail-count" aria-live="polite">
              {visited.length} / 4 discoveries
            </span>
            <span className="discovery-dots" aria-hidden="true">
              {projects.map((_, i) => (
                <i key={i} className={visited.includes(i) ? "filled" : ""} />
              ))}
            </span>
          </div>
          <span className="trail-message">
            {visited.length === 4
              ? "A curious mind, indeed. You found every project."
              : "Every project is a new place to wander."}
          </span>
          <button
            className="motion-button"
            aria-pressed={paused || reduced}
            onClick={() => setPaused(!paused)}
            disabled={reduced}
          >
            {paused || reduced ? "▷" : "Ⅱ"} Motion{" "}
            {paused || reduced ? "off" : "on"}
            {reduced && (
              <span className="sr-only"> — follows your system preference</span>
            )}
          </button>
        </div>
        <section
          id="projects"
          className="section projects-section"
          aria-labelledby="projects-title"
          tabIndex={-1}
        >
          <div className="section-top">
            <div>
              <p className="eyebrow">01 / THE EXPLORATIONS</p>
              <h2 id="projects-title">
                Ideas, out in the wild<span>.</span>
              </h2>
            </div>
            <p>
              From a better chess move to a more accessible world.
              <br className="desktop-break" /> A few things I’ve helped bring to
              life.
            </p>
          </div>
          <div className="project-toolbar">
            <div className="filters" role="group" aria-label="Filter projects">
              {["All work", "Products", "Investigations"].map((f) => (
                <button
                  key={f}
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                >
                  {f}
                  {f === "All work" && <span>04</span>}
                </button>
              ))}
            </div>
            <span className="tiny-label">BUILT WITH INTENTION, ALWAYS.</span>
          </div>
          <div className="project-grid">
            {projects.map(
              (p, i) =>
                (filter === "All work" ||
                  (filter === "Products"
                    ? p.category === "product"
                    : p.category === "investigation")) && (
                  <article
                    className={`project-card project-${i}`}
                    key={p.title}
                  >
                    <button
                      className="project-visual"
                      onClick={() => discover(i)}
                      aria-label={`Explore ${p.title}`}
                    >
                      <span className="visual-index">
                        FIELD NOTE / 0{i + 1}
                      </span>
                      <span className="project-badge">
                        {i === 1
                          ? "★ LA HACKS WINNER"
                          : i === 0
                            ? "♧ CO-FOUNDED"
                            : i === 2
                              ? "↗ RELIABILITY"
                              : "♫ APPLIED ML"}
                      </span>
                      {i === 0 ? (
                        <div className="chess-art" aria-hidden="true">
                          <div className="chess-board">
                            {Array.from({ length: 36 }, (_, j) => (
                              <span
                                key={j}
                                className={
                                  (Math.floor(j / 6) + j) % 2 ? "dark" : ""
                                }
                              />
                            ))}
                          </div>
                          <span className="chess-piece">♞</span>
                          <span className="chess-orbit">
                            YOUR NEXT MOVE, INFORMED.
                          </span>
                        </div>
                      ) : i === 1 ? (
                        <div className="eye-art" aria-hidden="true">
                          <div className="vision-ring ring-one" />
                          <div className="vision-ring ring-two" />
                          <div className="vision-frame">
                            <span className="vision-label">PATH DETECTED</span>
                            <svg viewBox="0 0 160 100">
                              <path
                                d="M20 75Q80-25 140 75M20 25Q80 125 140 25"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <circle
                                cx="80"
                                cy="50"
                                r="23"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <circle
                                cx="80"
                                cy="50"
                                r="8"
                                fill="currentColor"
                              />
                            </svg>
                          </div>
                          <div className="audio-line">
                            {Array.from({ length: 21 }, (_, j) => (
                              <i
                                key={j}
                                style={{
                                  height: `${8 + Math.abs(Math.sin(j * 1.8)) * 20}px`,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      ) : i === 2 ? (
                        <div className="sat-art" aria-hidden="true">
                          <span>(x₁ ∨ ¬x₂)</span>
                          <span className="sat-and">∧</span>
                          <span>(x₂ ∨ x₃)</span>
                          <div>
                            600 FORMULAS <span>✓ REPEATABLE</span>
                          </div>
                        </div>
                      ) : (
                        <div className="music-art" aria-hidden="true">
                          <span className="music-input">a feeling</span>
                          <span className="music-arrow">→</span>
                          <div className="music-wave">
                            {Array.from({ length: 25 }, (_, j) => (
                              <i
                                key={j}
                                style={{
                                  height: `${15 + Math.abs(Math.cos(j * 0.7)) * 65}px`,
                                }}
                              />
                            ))}
                          </div>
                          <span className="music-output">a melody</span>
                        </div>
                      )}
                      <span className="visual-open">
                        <Arrow diagonal />
                      </span>
                    </button>
                    <div className="project-info">
                      <p className="eyebrow">
                        {types[i]}{" "}
                        <span className="visited-mark">
                          {visited.includes(i) ? "✓ DISCOVERED" : ""}
                        </span>
                      </p>
                      <h3>
                        <button
                          className="project-title"
                          onClick={() => discover(i)}
                        >
                          <span>{p.title}</span>
                          <Arrow diagonal />
                        </button>
                      </h3>
                      <p>{descriptions[i]}</p>
                      <div className="project-impact">{p.impact}</div>
                    </div>
                  </article>
                ),
            )}
          </div>
        </section>
        <section
          id="experience"
          className="section experience-section"
          tabIndex={-1}
          aria-labelledby="experience-title"
        >
          <div className="section-top">
            <div>
              <p className="eyebrow">02 / THE TRAIL SO FAR</p>
              <h2 id="experience-title">
                Growing through doing<span>.</span>
              </h2>
            </div>
            <p>
              Building in the real world.
              <br />
              Learning from the people around me.
            </p>
          </div>
          <div className="experience-list">
            {roles.map((r, i) => (
              <details className="experience-row" key={r.organization}>
                <summary>
                  <span className="role-number">0{i + 1}</span>
                  <div>
                    <h3>{r.organization}</h3>
                    <p>{r.role}</p>
                  </div>
                  <span className="role-dates">{r.dates}</span>
                  <span className="row-plus" aria-hidden="true">
                    +
                  </span>
                </summary>
                <div className="role-details">
                  <p className="eyebrow">{r.focus}</p>
                  <p>{r.summary}</p>
                  <div className="role-results">
                    {r.results.map((v) => (
                      <div key={v.value}>
                        <strong>{v.value}</strong>
                        <span>{v.label}</span>
                      </div>
                    ))}
                  </div>
                  <ul>
                    {r.responsibilities.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                  {r.link && <External href={r.link}>{r.linkLabel}</External>}
                </div>
              </details>
            ))}
          </div>
        </section>
        <section
          id="about"
          className="section about-section"
          tabIndex={-1}
          aria-labelledby="about-title"
        >
          <div className="about-art" aria-hidden="true">
            <div className="botanical-ring">
              <svg viewBox="0 0 300 340">
                <path
                  d="M144 291c9-65-13-118 11-222"
                  fill="none"
                  stroke="#375a3f"
                  strokeWidth="3"
                />
                <path
                  d="M149 212c-57 0-84-40-78-67 42 6 78 20 78 67Z"
                  fill="#809b68"
                />
                <path
                  d="M151 181c64-7 81-49 70-76-44 9-70 39-70 76Z"
                  fill="#a3b783"
                />
                <path
                  d="M149 142c-44-6-58-37-51-57 32 6 48 26 51 57Z"
                  fill="#56784f"
                />
                <path
                  d="M157 101c47-6 60-38 53-59-31 7-50 25-53 59Z"
                  fill="#7b9865"
                />
                <path
                  d="M144 290c-25-5-59-4-77 4m77-4c32-6 52-2 78 6"
                  fill="none"
                  stroke="#74876a"
                  strokeWidth="2"
                />
                <path
                  d="m98 178 51 34m27-59-25 28m-33-73 31 34m35-65-27 24"
                  stroke="#e9e9d4"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <span className="botanical-caption">ALWAYS A WORK IN GROWTH.</span>
            <span className="little-star">✳</span>
          </div>
          <div className="about-copy">
            <p className="eyebrow">03 / THE PERSON BEHIND THE PROJECTS</p>
            <h2 id="about-title">
              Rooted in curiosity.
              <br />
              <em>Reaching for what’s next.</em>
            </h2>
            <p>
              I’m a Computer Science student at UCLA, expected to graduate in
              2028. My work spans systems engineering, applied machine learning,
              and products that turn complex information into something useful.
            </p>
            <p>
              Beyond the code, I’m part of UCLA’s builder community and computer
              vision team—and a former US Chess Top 100 Junior.
            </p>
            <div className="about-tags">
              <span>⌘ Builder</span>
              <span>♞ Chess player</span>
              <span>✧ Lifelong learner</span>
            </div>
          </div>
        </section>
        <section
          id="campus"
          className="section campus-section"
          aria-labelledby="campus-title"
          tabIndex={-1}
        >
          <div className="section-top">
            <div>
              <p className="eyebrow">04 / GOOD COMPANY</p>
              <h2 id="campus-title">
                Better things grow together<span>.</span>
              </h2>
            </div>
          </div>
          <div className="campus-grid">
            {campusRoles.map((r) => (
              <article key={r.title}>
                <p className="eyebrow">{r.dates}</p>
                <h3>{r.title}</h3>
                <p className="campus-role">{r.role}</p>
                <p>{r.summary}</p>
                <details>
                  <summary>
                    Field notes <span>+</span>
                  </summary>
                  <ul>
                    {r.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                  <p>{r.stack}</p>
                </details>
                <p className="campus-impact">{r.impact}</p>
              </article>
            ))}
          </div>
        </section>
        <section
          id="awards"
          className="section awards-section"
          tabIndex={-1}
          aria-labelledby="awards-title"
        >
          <div>
            <p className="eyebrow">05 / A FEW MILESTONES</p>
            <h2 id="awards-title">
              Along the way<span>.</span>
            </h2>
          </div>
          <div className="awards-list">
            {recognition.map(([title, context]) => (
              <div key={title}>
                <span aria-hidden="true">✧</span>
                <div>
                  <h3>{title}</h3>
                  <p>{context}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section
          className="section toolkit-section"
          aria-labelledby="toolkit-title"
        >
          <p className="eyebrow">THE TOOLS IN MY PACK</p>
          <h2 id="toolkit-title" className="sr-only">
            Technical skills
          </h2>
          <dl>
            {skills.map(([title, list]) => (
              <div key={title}>
                <dt>{title}</dt>
                <dd>{list}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section
          id="contact"
          className="contact-section"
          aria-labelledby="contact-title"
          tabIndex={-1}
        >
          <Sprout className="contact-sprout" />
          <p className="eyebrow">HAVE A SEED OF AN IDEA?</p>
          <h2 id="contact-title">
            Let’s grow something <em>good.</em>
          </h2>
          <a className="contact-email" href="mailto:mahesh523k@gmail.com">
            mahesh523k@gmail.com <Arrow diagonal />
          </a>
          <div className="contact-socials">
            <External href="https://github.com/MK-523">GitHub</External>
            <External href="https://www.linkedin.com/in/mnkarthikeyan/">
              LinkedIn
            </External>
            <External href="https://chessstalker.com/">ChessStalker</External>
          </div>
          <span className="contact-flower flower-left" aria-hidden="true">
            ✳
          </span>
          <span className="contact-flower flower-right" aria-hidden="true">
            ✳
          </span>
        </section>
      </main>
      <footer>
        <span>© {new Date().getFullYear()} Mahesh Karthikeyan</span>
        <span>Built with intention. Still growing.</span>
        <a href="#top">Back to the meadow ↑</a>
      </footer>
      {project && (
        <dialog
          ref={dialog}
          className="project-dialog"
          aria-labelledby="dialog-title"
          onKeyDown={(e) => {
            if (e.key !== "Tab") return;
            const items =
              e.currentTarget.querySelectorAll<HTMLElement>("button, a[href]");
            const first = items[0],
              last = items[items.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }}
          onCancel={(e) => {
            e.preventDefault();
            close();
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="dialog-inner">
            <div className="dialog-top">
              <span className="eyebrow">
                FIELD NOTE / 0{selected! + 1}{" "}
                <span className="dialog-discovered">✓ DISCOVERED</span>
              </span>
              <button
                className="close-button"
                onClick={close}
                aria-label="Close project details"
                autoFocus
              >
                ×
              </button>
            </div>
            <p className="dialog-type">{types[selected!]}</p>
            <h2 id="dialog-title">{project.title}</h2>
            <p className="dialog-role">{project.role}</p>
            <p className="dialog-summary">{project.summary}</p>
            <div className="dialog-impact">{project.impact}</div>
            <h3>Under the canopy</h3>
            <ul>
              {project.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <p className="dialog-stack">{project.stack}</p>
            <div className="dialog-footer">
              <External href={project.href}>{project.linkLabel}</External>
              <span>{visited.length} of 4 places explored</span>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
