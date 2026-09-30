import { useEffect, useRef, useState } from "react";
import { projects, roles, campusRoles, recognition, skills } from "./content";
import { locations, type PlaceId } from "./park";
import { Arrow } from "./Icons";
export function ParkPanel({ place }: { place: PlaceId }) {
  const [project, setProject] = useState<number | null>(null);
  const location = locations.find((l) => l.id === place)!;
  const projectHeading = useRef<HTMLHeadingElement>(null);
  const projectButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const lastProject = useRef<number | null>(null);
  useEffect(() => {
    if (project !== null) {
      projectHeading.current?.focus();
      lastProject.current = project;
    } else if (lastProject.current !== null) {
      projectButtons.current[lastProject.current]?.focus();
    }
  }, [project]);
  return (
    <>
      <p className="panel-eyebrow">
        {location.name} / {location.category}
      </p>
      <h2 id="park-panel-title">{location.category}</h2>
      {place === "projects" &&
        (project === null ? (
          <>
            <div className="park-project-list">
              {projects.map((p, i) => (
                <button
                  key={p.title}
                  ref={(el) => {
                    projectButtons.current[i] = el;
                  }}
                  onClick={() => setProject(i)}
                >
                  <span className={`project-symbol symbol-${i}`}>
                    {["♞", "◉", "∧", "♫"][i]}
                  </span>
                  <span>
                    <small>
                      {p.category === "product" ? "PRODUCT" : "INVESTIGATION"}
                    </small>
                    <strong>{p.title}</strong>
                    <span>{p.impact}</span>
                  </span>
                  <Arrow />
                </button>
              ))}
            </div>
          </>
        ) : (
          <article className="park-project-detail">
            <button className="back-projects" onClick={() => setProject(null)}>
              ← All projects
            </button>
            <p className="panel-eyebrow">{projects[project].role}</p>
            <h3 tabIndex={-1} ref={projectHeading}>
              {projects[project].title}
            </h3>
            <p>{projects[project].summary}</p>
            <p className="park-impact">{projects[project].impact}</p>
            <ul>
              {projects[project].bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <p className="park-stack">{projects[project].stack}</p>
            <a
              className="park-external"
              href={projects[project].href}
              target="_blank"
              rel="noreferrer"
            >
              {projects[project].linkLabel}
              <Arrow diagonal />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </article>
        ))}
      {place === "experience" && (
        <>
          <div className="park-roles">
            {roles.map((r, i) => (
              <details key={r.organization} open={i === 0}>
                <summary>
                  <span>
                    <small>{r.dates}</small>
                    <strong>{r.organization}</strong>
                    <span>{r.role}</span>
                  </span>
                  <span className="disclosure-plus">+</span>
                </summary>
                <div>
                  <p className="park-stack">{r.focus}</p>
                  <p>{r.summary}</p>
                  <div className="park-results">
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
                  {r.link && (
                    <a
                      className="park-text-link"
                      href={r.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {r.linkLabel} ↗
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  )}
                </div>
              </details>
            ))}
          </div>
        </>
      )}
      {place === "about" && (
        <>
          <p>
            I’m a Computer Science student at UCLA, expected to graduate in
            2028. My work spans systems engineering, applied machine learning,
            and products that turn complex information into something useful.
          </p>
          <p>
            Beyond the code, I’m part of UCLA’s builder community and computer
            vision team—and a former US Chess Top 100 Junior.
          </p>
          <h3 className="panel-subtitle">Skills</h3>
          <dl className="park-skills">
            {skills.map(([title, list]) => (
              <div key={title}>
                <dt>{title}</dt>
                <dd>{list}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
      {place === "contact" && (
        <>
          <a className="park-email" href="mailto:mahesh523k@gmail.com">
            mahesh523k@gmail.com
            <Arrow diagonal />
          </a>
          <div className="park-socials">
            {[
              ["GitHub", "https://github.com/MK-523"],
              ["LinkedIn", "https://www.linkedin.com/in/mnkarthikeyan/"],
              ["ChessStalker", "https://chessstalker.com/"],
            ].map(([name, href]) => (
              <a key={name} href={href} target="_blank" rel="noreferrer">
                {name}
                <Arrow diagonal />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
          </div>
        </>
      )}
      {place === "campus" && (
        <>
          {campusRoles.map((r) => (
            <article className="park-community" key={r.title}>
              <p className="panel-eyebrow">{r.dates}</p>
              <h3>{r.title}</h3>
              <p className="park-stack">{r.role}</p>
              <p>{r.summary}</p>
              <ul>
                {r.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <p className="park-impact">{r.impact}</p>
              <p className="park-stack">{r.stack}</p>
            </article>
          ))}
        </>
      )}
      {place === "awards" && (
        <>
          <div className="park-awards">
            {recognition.map(([title, context]) => (
              <article key={title}>
                <span aria-hidden="true">✧</span>
                <div>
                  <h3>{title}</h3>
                  <p>{context}</p>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </>
  );
}
