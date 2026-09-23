import { useEffect, useRef, useState, type ReactNode } from "react";
import { campusRoles, projects, recognition, roles, skills } from "./content";
import AlpineHero from "./AlpineHero";
import { Arrow } from "./Icons";

function ExternalLink({
  href,
  children,
  className = "text-link",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
      <Arrow diagonal />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

function SectionLabel({
  number,
  children,
}: {
  number: string;
  children: ReactNode;
}) {
  return (
    <h2 className="section-label">
      <span aria-hidden="true">{number}</span>
      {children}
    </h2>
  );
}

function ChessVisual() {
  return (
    <div className="project-art chess-art" aria-hidden="true">
      <div className="art-topline">
        <span>CHESSSTALKER</span>
        <span>OPPONENT INTELLIGENCE</span>
      </div>
      <div className="chess-grid">
        {Array.from({ length: 64 }, (_, i) => (
          <span
            key={i}
            className={(i + Math.floor(i / 8)) % 2 ? "dark-square" : ""}
          />
        ))}
      </div>
      <svg className="chess-knight" viewBox="0 0 200 240" fill="none">
        <path
          d="M58 194c-6-34 6-55 29-79l-28 10-19-22 29-48 28-18 6-23 20 22c41 8 64 43 60 79-3 27-26 57-15 79H58Z"
          fill="currentColor"
        />
        <path
          d="m82 56 18-9M51 106l21-4m37-42c-3 25-20 44-34 53m41 9c18-15 24-31 16-51"
          stroke="#9faa8e"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="85" cy="74" r="4" fill="#9faa8e" />
        <path d="M48 198h125v15H48zm-7 20h139v12H41z" fill="currentColor" />
      </svg>
      <span className="chess-orbit orbit-one" />
      <span className="chess-orbit orbit-two" />
      <div className="art-bottomline">
        <span>FIDE · LICHESS · CHESS.COM</span>
        <span>
          One complete picture. <Arrow diagonal />
        </span>
      </div>
    </div>
  );
}

function VisionVisual() {
  return (
    <div className="project-art vision-art" aria-hidden="true">
      <div className="art-topline">
        <span>A-EYE</span>
        <span>PERCEPTION → GUIDANCE</span>
      </div>
      <svg className="vision-scene" viewBox="0 0 560 340" fill="none">
        <defs>
          <linearGradient
            id="path-light"
            x1="280"
            y1="145"
            x2="280"
            y2="335"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#b6c6a9" stopOpacity="0" />
            <stop offset="1" stopColor="#b6c6a9" stopOpacity=".45" />
          </linearGradient>
        </defs>
        <path d="M260 146 120 340h320L297 146" fill="url(#path-light)" />
        {[190, 230, 282, 335].map((y) => (
          <path
            key={y}
            d={`M${260 - (y - 146) * 0.72} ${y}H${297 + (y - 146) * 0.74}`}
            stroke="#abc2b1"
            strokeOpacity=".13"
          />
        ))}
        <path
          d="m281 334-1-170m-11 14 11-14 11 14"
          stroke="#c5d2b5"
          strokeWidth="2"
          strokeDasharray="5 8"
        />
        <rect
          x="108"
          y="70"
          width="77"
          height="150"
          rx="3"
          stroke="#bdd0a7"
          strokeOpacity=".75"
        />
        <circle cx="146" cy="108" r="15" fill="#90a993" fillOpacity=".2" />
        <path
          d="M124 160c-4-29 47-29 45 0v24h-45z"
          fill="#90a993"
          fillOpacity=".2"
        />
        <path
          d="M351 146v-37h79v101h-43"
          stroke="#a2bdac"
          strokeOpacity=".55"
        />
        <rect x="338" y="160" width="70" height="95" rx="3" stroke="#bdd0a7" />
        <path
          d="M47 88V45h43m380 0h43v43M47 255v43h43m380 0h43v-43"
          stroke="#d0dcc9"
          strokeOpacity=".45"
        />
        <circle cx="280" cy="146" r="5" fill="#d0dcc9" />
        <circle cx="280" cy="146" r="26" stroke="#d0dcc9" strokeOpacity=".15" />
      </svg>
      <div className="vision-chip">
        <span />
        Detect. Track. Guide.
      </div>
      <div className="art-bottomline">
        <span>COMPUTER VISION · AUDIO</span>
        <span>
          A clearer way forward. <Arrow diagonal />
        </span>
      </div>
    </div>
  );
}

function Projects() {
  return (
    <section id="projects" className="section projects-section" tabIndex={-1}>
      <SectionLabel number="01">Projects</SectionLabel>
      <div className="featured-projects">
        {projects.slice(0, 2).map((project, index) => (
          <article className="featured-project" key={project.title}>
            {index === 0 ? <ChessVisual /> : <VisionVisual />}
            <div className="project-caption">
              <span className="small-label">
                {index === 0
                  ? "PRODUCT ENGINEERING"
                  : "APPLIED MACHINE LEARNING"}
              </span>
              <span className="project-index">0{index + 1}</span>
            </div>
            <h3>{project.title}</h3>
            <p className="project-role">{project.role}</p>
            <p className="project-summary">
              {index === 0
                ? "Turning fragmented chess histories into a complete picture of your next opponent. I built cross-platform player search, identity resolution, and Stockfish-backed preparation."
                : "Turning a wearable camera into priority-aware spoken guidance. With my team, I combined object detection, persistent tracking, and route-aware audio to focus on what matters ahead."}
            </p>
            <p className="project-impact">{project.impact}</p>
            <details className="project-details">
              <summary>
                Behind the build <span aria-hidden="true">+</span>
              </summary>
              <ul>
                {project.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              {index === 1 && (
                <p>
                  Co-created with Arya Kunisetty, Krishay Garg, and
                  Hui-Peng-John-Yao.
                </p>
              )}
              <p className="detail-stack">{project.stack}</p>
            </details>
            <ExternalLink href={project.href}>{project.linkLabel}</ExternalLink>
          </article>
        ))}
      </div>
      <div className="more-projects">
        {projects.slice(2).map((project, index) => (
          <article key={project.title}>
            <span className="small-label">
              0{index + 3} /{" "}
              {index === 0 ? "MODEL RELIABILITY" : "MULTIMODAL EXPLORATION"}
            </span>
            <h3>{project.title}</h3>
            <p>{project.summary}</p>
            <p className="mini-impact">{project.impact}</p>
            <details className="project-details">
              <summary>
                Behind the build <span aria-hidden="true">+</span>
              </summary>
              <p>{project.role}</p>
              <ul>
                {project.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              <p>{project.stack}</p>
            </details>
            <ExternalLink href={project.href}>{project.linkLabel}</ExternalLink>
          </article>
        ))}
      </div>
    </section>
  );
}

function Experience() {
  return (
    <section
      id="experience"
      className="section experience-section"
      tabIndex={-1}
    >
      <SectionLabel number="02">Experience</SectionLabel>
      <div className="experience-list">
        {roles.map((role, index) => (
          <article className="experience-entry" key={role.organization}>
            <div className="experience-meta">
              <span className="small-label">
                0{index + 1} /{" "}
                {role.track === "research" ? "RESEARCH" : "ENGINEERING"}
              </span>
              <h3>{role.organization}</h3>
              <p className="role-title">{role.role}</p>
              <p className="role-date">{role.dates}</p>
            </div>
            <div className="experience-body">
              <p className="experience-focus">{role.focus}</p>
              <p>{role.summary}</p>
              <div className="results">
                {role.results.map((result) => (
                  <div key={result.value}>
                    <strong>
                      {result.value
                        .replaceAll(" min", "\u00a0min")
                        .replaceAll(" ms", "\u00a0ms")}
                    </strong>
                    <span>{result.label}</span>
                  </div>
                ))}
              </div>
              <details className="project-details">
                <summary>
                  Technical details <span aria-hidden="true">+</span>
                </summary>
                <ul>
                  {role.responsibilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </details>
              {role.link && (
                <ExternalLink href={role.link}>{role.linkLabel}</ExternalLink>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="section about-section" tabIndex={-1}>
      <SectionLabel number="05">About</SectionLabel>
      <div className="about-opening">
        <p>
          I'm a Computer Science student at UCLA, expected to graduate in 2028.
          My work spans systems engineering, applied machine learning, and
          products that turn complex information into something useful.
        </p>
        <p>
          Beyond the code, I'm part of UCLA's builder community and computer
          vision team—and a former US Chess Top 100 Junior.
        </p>
      </div>
      <div className="toolkit">
        <h3 className="subsection-title">Technical skills</h3>
        <div>
          {skills.map(([title, list]) => (
            <div className="skill-row" key={title}>
              <h4>{title}</h4>
              <p>{list}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Campus() {
  return (
    <section id="campus" className="section campus-section" tabIndex={-1}>
      <SectionLabel number="03">Campus involvement</SectionLabel>
      <div className="campus-list">
        {campusRoles.map((role) => (
          <article className="campus-role" key={role.title}>
            <div className="campus-meta">
              <p className="small-label">{role.dates}</p>
              <h3>{role.title}</h3>
              <p className="campus-position">{role.role}</p>
            </div>
            <div>
              <p className="campus-summary">{role.summary}</p>
              <p className="mini-impact">{role.impact}</p>
              <details className="project-details">
                <summary>
                  More about this work <span aria-hidden="true">+</span>
                </summary>
                <ul>
                  {role.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
                <p>{role.stack}</p>
              </details>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Awards() {
  return (
    <section id="awards" className="section awards-section" tabIndex={-1}>
      <SectionLabel number="04">Awards & recognition</SectionLabel>
      <div className="recognition-list">
        {recognition.map(([title, context]) => (
          <article key={title}>
            <span className="recognition-mark" aria-hidden="true">
              ✧
            </span>
            <div>
              <h3>{title}</h3>
              <p>{context}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="section contact-section" tabIndex={-1}>
      <SectionLabel number="06">Contact</SectionLabel>
      <a className="contact-email" href="mailto:mahesh523k@gmail.com">
        mahesh523k@gmail.com
        <Arrow diagonal />
      </a>
      <div className="social-links">
        <ExternalLink href="https://github.com/MK-523">GitHub</ExternalLink>
        <ExternalLink href="https://www.linkedin.com/in/mnkarthikeyan/">
          LinkedIn
        </ExternalLink>
        <ExternalLink href="https://chessstalker.com/">
          ChessStalker
        </ExternalLink>
      </div>
    </section>
  );
}

const destinations = [
  { id: "projects", label: "Projects", component: Projects },
  { id: "experience", label: "Experience", component: Experience },
  { id: "campus", label: "Campus", component: Campus },
  { id: "awards", label: "Awards", component: Awards },
  { id: "about", label: "About", component: About },
  { id: "contact", label: "Contact", component: Contact },
];

function currentDestination() {
  const id = window.location.hash.slice(1);
  return destinations.find((destination) => destination.id === id) ?? null;
}

export default function App() {
  const [active, setActive] = useState(currentDestination);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousDestination = useRef(active);

  useEffect(() => {
    const navigate = () => {
      setActive(currentDestination());
      setMenuOpen(false);
    };
    window.addEventListener("hashchange", navigate);
    return () => window.removeEventListener("hashchange", navigate);
  }, []);

  useEffect(() => {
    if (active) {
      const section = panelRef.current?.querySelector<HTMLElement>("section");
      section?.focus({ preventScroll: true });
    } else if (previousDestination.current) {
      document.getElementById("hero-name")?.focus({ preventScroll: true });
    }
    previousDestination.current = active;
  }, [active]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (menuOpen) {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      } else if (active) {
        window.location.hash = "top";
      }
    };
    const closeOutside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node))
        setMenuOpen(false);
    };
    const closeAtDesktop = () => {
      if (window.innerWidth > 760) setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("pointerdown", closeOutside);
    window.addEventListener("resize", closeAtDesktop);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("pointerdown", closeOutside);
      window.removeEventListener("resize", closeAtDesktop);
    };
  }, [menuOpen, active]);

  const Content = active?.component;
  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document
            .getElementById("main-content")
            ?.focus({ preventScroll: true });
        }}
      >
        Skip to content
      </a>
      <header
        ref={headerRef}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setMenuOpen(false);
        }}
        className={`site-header${active ? " is-solid" : ""}${menuOpen ? " menu-open" : ""}`}
      >
        <a className="brand" href="#top" onClick={() => setMenuOpen(false)}>
          <span className="brand-monogram">
            mk<span>.</span>
          </span>
          <span className="brand-caption">
            MAHESH
            <br />
            KARTHIKEYAN
          </span>
          <span className="sr-only"> (home)</span>
        </a>
        <button
          ref={menuButtonRef}
          className="menu-toggle"
          aria-controls="primary-nav"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "Close menu" : "Menu"}
          <span aria-hidden="true">{menuOpen ? "−" : "+"}</span>
        </button>
        <nav id="primary-nav" aria-label="Primary navigation">
          {destinations.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active?.id === id ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {label}
              {id === "contact" && <Arrow diagonal />}
            </a>
          ))}
        </nav>
      </header>
      <main id="main-content" tabIndex={-1}>
        <AlpineHero covered={!!active} />
        {Content && (
          <div className="portfolio-panel" key={active.id} ref={panelRef}>
            <div className="panel-toolbar">
              <span>
                PORTFOLIO <span aria-hidden="true">/</span>{" "}
                {active.label.toUpperCase()}
              </span>
              <a
                href="#top"
                className="panel-close"
                aria-label="Back to landscape, close section"
              >
                Back to landscape <span aria-hidden="true">×</span>
              </a>
            </div>
            <div className="panel-scroll">
              <Content />
            </div>
          </div>
        )}
      </main>
      {!active && (
        <p className="home-footer">
          © {new Date().getFullYear()} Mahesh Karthikeyan
        </p>
      )}
    </>
  );
}
