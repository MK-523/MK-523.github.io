import { useEffect, useState, type MouseEvent } from "react";
import {
  Projects,
  Experience,
  Campus,
  Awards,
  About,
  Contact,
} from "./PortfolioSections";
import LakeScene from "./LakeScene";
import { Arrow } from "./Icons";
import useJourney, { chapters } from "./useJourney";

const sections = [Projects, Experience, Campus, Awards, About, Contact];
export default function App() {
  const { step, go, advance, viewportRef } = useJourney();
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const reading = step % 2 === 1;
  const index = Math.floor(step / 2);
  const chapter = chapters[index];
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const navigate = (event: MouseEvent<HTMLDivElement>) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const anchor = (event.target as Element).closest<HTMLAnchorElement>(
      'a[href^="#"]',
    );
    const id = anchor?.getAttribute("href")?.slice(1);
    if (!id) {
      if (
        reading &&
        !(event.target as Element).closest(
          "a, button, input, summary, .content-viewport, .site-header, .journey-controls",
        )
      )
        advance();
      return;
    }
    const target = chapters.findIndex((item) => item.id === id);
    if (id !== "top" && target < 0) return;
    event.preventDefault();
    go(id === "top" ? 0 : target * 2 + 1);
  };
  return (
    <div
      className={`app-shell ${reading ? "is-reading" : "is-traveling"}`}
      onClick={navigate}
      data-step={step}
    >
      <LakeScene paused={paused} progress={index / (chapters.length - 1)} />
      <a className="skip-link" href="#projects">
        Skip to work
      </a>
      <button
        className="scene-hit scene-geometry"
        onClick={() => advance()}
        aria-label={
          reading ? "Continue across the lake" : `Enter ${chapter.label}`
        }
      />
      <header className="site-header">
        <a
          className="brand"
          href="#top"
          aria-label="mk. — Mahesh Karthikeyan, return to lake"
        >
          mk.
        </a>
        <nav aria-label="Portfolio sections">
          {chapters.map(({ id, label }, i) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={reading && i === index ? "page" : undefined}
            >
              {label}
            </a>
          ))}
        </nav>
      </header>
      <main>
        <section
          id="top"
          tabIndex={-1}
          aria-label={`Himalayan lake — ${chapter.label} is next`}
          className="lake-home"
        >
          <h1 className="sr-only">Mahesh Karthikeyan</h1>
        </section>
        <div ref={viewportRef} className="content-viewport" hidden={!reading}>
          {sections.map((Section, i) => (
            <div key={chapters[i].id} hidden={i !== index}>
              <Section />
            </div>
          ))}
          <button className="continue-reading" onClick={() => advance()}>
            Continue across the lake <Arrow />
          </button>
        </div>
      </main>
      <div className="circle-caption" aria-hidden="true">
        THE HIMALAYAS
        <br />
        <span>0{index + 1} / 06</span>
      </div>
      <aside className="journey-controls" aria-label="Journey navigation">
        <button
          className="previous-step"
          onClick={() => advance(-1)}
          disabled={step === 0}
          aria-label="Previous view"
        >
          <Arrow />
        </button>
        <span className="journey-status">
          0{index + 1}
          <span> / 06</span>
          <span className="chapter-title">{chapter.label}</span>
        </span>
        <span className="journey-track" aria-hidden="true">
          <span style={{ transform: `scaleX(${(step + 1) / 12})` }} />
        </span>
        <button className="next-chapter" onClick={() => advance()}>
          {reading ? "Continue journey" : `View ${chapter.label}`}
          <Arrow />
        </button>
        <details className="scene-settings">
          <summary aria-label="Scene settings">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 7h18M3 17h18M8 4v6m8 4v6"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </summary>
          <div>
            <label>
              <input
                type="checkbox"
                checked={!paused && !reduced}
                disabled={reduced}
                onChange={(event) => setPaused(!event.target.checked)}
              />
              Animate the landscape
            </label>
            {reduced && <p>Reduced motion follows your device setting.</p>}
          </div>
        </details>
      </aside>
      <p className="sr-only" role="status">
        {reading ? chapter.label : `On the lake. Next: ${chapter.label}.`}
      </p>
    </div>
  );
}
