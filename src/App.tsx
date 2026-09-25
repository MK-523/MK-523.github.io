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
import useJourney, { chapters } from "./useJourney";
import useLandscape from "./useLandscape";

const sections = [Projects, Experience, Campus, Awards, About, Contact];
export default function App() {
  const { step, approached, go, advance, viewportRef } = useJourney();
  const exploring = step === 0;
  const { shellRef, sizeRef, lookRef, handlers } = useLandscape(
    advance,
    exploring,
  );
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
      <LakeScene
        progress={(index + (approached ? 0.35 : 0)) / (chapters.length - 0.65)}
        lookRef={lookRef}
      />
      <a className="skip-link" href="#projects">
        Skip to work
      </a>
      {exploring ? (
        <div
          role="group"
          tabIndex={0}
          className="scene-hit scene-geometry"
          {...handlers}
          aria-label="Explore the Himalayan lake"
          aria-description="Drag to look around. Left and right arrow keys also look around. Scroll or press Page Down twice to begin the portfolio, or use a section link."
          aria-keyshortcuts="ArrowLeft ArrowRight PageDown"
        />
      ) : (
        <button
          className="scene-hit scene-geometry"
          {...handlers}
          aria-description="Drag to look around. Click or tap to continue. Left and right arrow keys also look around."
          aria-keyshortcuts="ArrowLeft ArrowRight"
          aria-label={reading ? "Return to the lake" : `Enter ${chapter.label}`}
        />
      )}
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
      <p
        className="scene-caption"
        hidden={reading}
        title="Interactive Himalayan-inspired artwork. Lighting follows Nepal time; weather and moonlight are simulated."
      >
        <span className="scene-caption-dot" aria-hidden="true" />
        <span className="scene-caption-live">Live-rendered view</span>
        <span className="scene-caption-static">Landscape view</span>
      </p>
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
        </div>
      </main>
      <p className="sr-only" role="status">
        {reading
          ? chapter.label
          : exploring
            ? approached
              ? "Exploring the lake. Scroll again to open Projects."
              : "Explore the lake. Scroll to move closer, or choose a section above."
            : `On the lake. Next: ${chapter.label}.`}
      </p>
    </div>
  );
}
