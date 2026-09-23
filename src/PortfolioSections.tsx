import type { ReactNode } from "react";
import { campusRoles, projects, recognition, roles, skills } from "./content";
import { Arrow } from "./Icons";

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a className="text-link" href={href} target="_blank" rel="noreferrer">
      {children}
      <Arrow diagonal />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
function SectionHeading({
  number,
  children,
}: {
  number: string;
  children: ReactNode;
}) {
  return (
    <h2 className="section-heading">
      <span aria-hidden="true">{number}</span>
      {children}
    </h2>
  );
}
export function Projects() {
  return (
    <section
      id="projects"
      className="journey-section"
      tabIndex={-1}
      aria-labelledby="projects-label"
    >
      <div className="reading-column">
        <div id="projects-label">
          <SectionHeading number="01">Projects</SectionHeading>
        </div>
        <div className="work-list">
          {projects.map((project, index) => (
            <article className="work-entry" key={project.title}>
              <div className="entry-topline">
                <span>{index < 2 ? "SELECTED PROJECT" : "EXPLORATION"}</span>
                <span aria-hidden="true">0{index + 1}</span>
              </div>
              <h3>{project.title}</h3>
              <p className="entry-role">{project.role}</p>
              <p className="entry-summary">{project.summary}</p>
              <p className="entry-impact">{project.impact}</p>
              <details className="work-details">
                <summary>
                  Technical details <span aria-hidden="true">+</span>
                </summary>
                <ul>
                  {project.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
                <p>{project.stack}</p>
              </details>
              <ExternalLink href={project.href}>
                {project.linkLabel}
              </ExternalLink>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
export function Experience() {
  return (
    <section
      id="experience"
      className="journey-section"
      tabIndex={-1}
      aria-labelledby="experience-label"
    >
      <div className="reading-column">
        <div id="experience-label">
          <SectionHeading number="02">Experience</SectionHeading>
        </div>
        <div className="work-list">
          {roles.map((role) => (
            <article className="work-entry" key={role.organization}>
              <div className="entry-topline">
                <span>
                  {role.track === "research" ? "RESEARCH" : "ENGINEERING"}
                </span>
                <span>{role.dates}</span>
              </div>
              <h3>{role.organization}</h3>
              <p className="entry-role">{role.role}</p>
              <p className="entry-focus">{role.focus}</p>
              <p className="entry-summary">{role.summary}</p>
              <ul className="results">
                {role.results.map((result) => (
                  <li key={result.value}>
                    <strong>{result.value}</strong>
                    <span>{result.label}</span>
                  </li>
                ))}
              </ul>
              <details className="work-details">
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
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
export function Campus() {
  return (
    <section
      id="campus"
      className="journey-section"
      tabIndex={-1}
      aria-labelledby="campus-label"
    >
      <div className="reading-column">
        <div id="campus-label">
          <SectionHeading number="03">Campus involvement</SectionHeading>
        </div>
        <div className="work-list">
          {campusRoles.map((role) => (
            <article className="work-entry" key={role.title}>
              <div className="entry-topline">
                <span>UCLA</span>
                <span>{role.dates}</span>
              </div>
              <h3>{role.title}</h3>
              <p className="entry-role">{role.role}</p>
              <p className="entry-summary">{role.summary}</p>
              <p className="entry-impact">{role.impact}</p>
              <details className="work-details">
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
      </div>
    </section>
  );
}
export function Awards() {
  return (
    <section
      id="awards"
      className="journey-section"
      tabIndex={-1}
      aria-labelledby="awards-label"
    >
      <div className="reading-column">
        <div id="awards-label">
          <SectionHeading number="04">Awards & recognition</SectionHeading>
        </div>
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
      </div>
    </section>
  );
}
export function About() {
  return (
    <section
      id="about"
      className="journey-section"
      tabIndex={-1}
      aria-labelledby="about-label"
    >
      <div className="reading-column">
        <div id="about-label">
          <SectionHeading number="05">About</SectionHeading>
        </div>
        <div className="about-copy">
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
        <h3 className="skills-heading">Technical skills</h3>
        <dl className="skills-list">
          {skills.map(([title, list]) => (
            <div key={title}>
              <dt>{title}</dt>
              <dd>{list}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
export function Contact() {
  return (
    <section
      id="contact"
      className="journey-section contact-section"
      tabIndex={-1}
      aria-labelledby="contact-label"
    >
      <div className="reading-column">
        <div id="contact-label">
          <SectionHeading number="06">Contact</SectionHeading>
        </div>
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
        <p className="copyright">
          © {new Date().getFullYear()} Mahesh Karthikeyan
        </p>
      </div>
    </section>
  );
}
