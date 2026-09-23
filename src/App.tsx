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
    <p className="section-label">
      <span>{number}</span>
      {children}
    </p>
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
      <SectionLabel number="01">SELECTED WORK</SectionLabel>
      <div className="section-intro">
        <h2>
          From curiosity
          <br />
          to <em>something useful.</em>
        </h2>
        <p>
          Products, experiments, and the engineering
          <br className="desktop-break" /> that brings them to life.
        </p>
      </div>
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
      <SectionLabel number="02">EXPERIENCE</SectionLabel>
      <div className="section-intro">
        <h2>
          Good ideas.
          <br />
          <em>Real-world rigor.</em>
        </h2>
        <p>
          Across production systems, research labs,
          <br className="desktop-break" /> and the space in between.
        </p>
      </div>
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
    <section id="campus" className="section about-section" tabIndex={-1}>
      <SectionLabel number="03">A LITTLE MORE ABOUT ME</SectionLabel>
      <div className="about-opening">
        <h2>
          A curious mind.
          <br />
          <em>A builder at heart.</em>
        </h2>
        <div>
          <p>
            I'm a Computer Science student at UCLA, expected to graduate in
            2028. My work spans systems engineering, applied machine learning,
            and products that turn complex information into something useful.
          </p>
          <p>
            Beyond the code, I'm part of UCLA's builder community and computer
            vision team—and a former US Chess Top 100 Junior.
          </p>
        </div>
      </div>
      <div className="about-columns">
        <div>
          <h3 className="subsection-title">Around campus</h3>
          {campusRoles.map((role) => (
            <article className="campus-role" key={role.title}>
              <p className="small-label">{role.dates}</p>
              <h4>{role.title}</h4>
              <p className="campus-position">{role.role}</p>
              <p>{role.summary}</p>
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
            </article>
          ))}
        </div>
        <div>
          <h3 className="subsection-title">Along the way</h3>
          <div className="recognition-list">
            {recognition.map(([title, context]) => (
              <div key={title}>
                <span className="recognition-mark" aria-hidden="true">
                  ✧
                </span>
                <div>
                  <h4>{title}</h4>
                  <p>{context}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="toolkit">
        <h3 className="subsection-title">Tools of the trade</h3>
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

function Contact() {
  return (
    <section id="contact" className="section contact-section" tabIndex={-1}>
      <div className="contour-lines" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span key={i} style={{ inset: `${i * 24}px ${i * 34}px` }} />
        ))}
      </div>
      <SectionLabel number="04">WHAT'S NEXT?</SectionLabel>
      <p className="contact-kicker">
        A project, a question, or a shared curiosity.
      </p>
      <h2>
        Let's build
        <br />
        <em>something good.</em>
      </h2>
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

export default function App() {
  const [pastHero, setPastHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting),
      { rootMargin: "-100px 0px 0px 0px" },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const closeOutside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node))
        setMenuOpen(false);
    };
    const closeAtDesktop = () => {
      if (window.innerWidth > 640) setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("pointerdown", closeOutside);
    window.addEventListener("resize", closeAtDesktop);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("pointerdown", closeOutside);
      window.removeEventListener("resize", closeAtDesktop);
    };
  }, [menuOpen]);
  return (
    <>
      <a className="skip-link" href="#projects">
        Skip to selected work
      </a>
      <header
        ref={headerRef}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setMenuOpen(false);
        }}
        className={`site-header${pastHero ? " is-solid" : ""}${menuOpen ? " menu-open" : ""}`}
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
        </a>
        <button
          ref={menuButtonRef}
          className="menu-toggle"
          aria-controls="primary-nav"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "Close" : "Menu"}
          <span aria-hidden="true">{menuOpen ? "−" : "+"}</span>
        </button>
        <nav id="primary-nav" aria-label="Primary navigation">
          {[
            ["experience", "Experience"],
            ["projects", "Projects"],
            ["campus", "About"],
            ["contact", "Contact"],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>
              {label}
              {id === "contact" && <Arrow diagonal />}
            </a>
          ))}
        </nav>
      </header>
      <main>
        <AlpineHero />
        <Projects />
        <Experience />
        <About />
        <Contact />
      </main>
      <footer>
        <a href="#top" className="footer-name">
          Mahesh Karthikeyan<span>© {new Date().getFullYear()}</span>
        </a>
        <p>UCLA CS · Systems · Product · Chess</p>
        <a href="#top" className="back-top">
          Back to the view <span aria-hidden="true">↑</span>
        </a>
      </footer>
    </>
  );
}
