import type { MouseEvent } from "react";
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
import useLandscape from "./useLandscape";

const sections = [Projects, Experience, Campus, Awards, About, Contact];
export default function App() {
  const { step, go, advance, viewportRef } = useJourney();
  const { shellRef, sizeRef, lookRef, handlers } = useLandscape(advance);
  const reading = step % 2 === 1;
  const index = Math.floor(step / 2);
  const chapter = chapters[index];
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
          "a, button, input, summary, .content-viewport, .site-header",
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
      ref={shellRef}
      className={`app-shell ${reading ? "is-reading" : "is-traveling"}`}
      onClick={navigate}
      data-step={step}
    >
      <div ref={sizeRef} className="scene-size" aria-hidden="true" />
      <LakeScene progress={index / (chapters.length - 1)} lookRef={lookRef} />
      <a className="skip-link" href="#projects">
        Skip to work
      </a>
      <button
        className="scene-hit scene-geometry"
        {...handlers}
        aria-description="Drag to look around. Click or tap to continue. Left and right arrow keys also look around."
        aria-keyshortcuts="ArrowLeft ArrowRight"
        aria-label={reading ? "Return to the lake" : `Enter ${chapter.label}`}
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
      <p className="sr-only" role="status">
        {reading ? chapter.label : `On the lake. Next: ${chapter.label}.`}
      </p>
    </div>
  );
}
