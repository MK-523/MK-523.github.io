import { useEffect, useRef, useState } from "react";
import { Arrow } from "./Icons";

const imageSet =
  "/images/alpine-960.webp 960w, /images/alpine-1600.webp 1600w, /images/alpine-2560.webp 2560w";
// Match the HTML preload. The portrait crop benefits from extra resolution.
const imageSizes = "(max-width: 640px) 140vw, 106vw";
function initialMotionChoice() {
  try {
    return localStorage.getItem("portfolio-motion") !== "off";
  } catch {
    return true;
  }
}
export default function AlpineHero() {
  const heroRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const [motionWanted, setMotionWanted] = useState(initialMotionChoice);
  const [motionSupported, setMotionSupported] = useState(false);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const motionOn = motionWanted && motionSupported;
  useEffect(() => {
    const media = window.matchMedia(
      "(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)",
    );
    const update = () => setMotionSupported(media.matches);
    const visibility = () => setPageVisible(!document.hidden);
    update();
    visibility();
    media.addEventListener("change", update);
    document.addEventListener("visibilitychange", visibility);
    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            ([entry]) => setInView(entry.isIntersecting),
            { rootMargin: "-100px 0px 0px 0px" },
          )
        : null;
    if (heroRef.current) observer?.observe(heroRef.current);
    return () => {
      media.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", visibility);
      observer?.disconnect();
    };
  }, []);
  useEffect(() => {
    const scene = sceneRef.current;
    const hero = heroRef.current;
    if (!scene || !hero) return;
    if (!motionOn || !inView || !pageVisible) {
      scene.style.setProperty("--scene-x", "0px");
      scene.style.setProperty("--scene-y", "0px");
      scene.style.setProperty("--foreground-x", "0px");
      scene.style.setProperty("--foreground-y", "0px");
      return;
    }
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    const paint = () => {
      const scroll = Math.min(
        Math.max(-hero.getBoundingClientRect().top, 0),
        hero.offsetHeight,
      );
      scene.style.setProperty("--scene-x", `${pointerX * -5}px`);
      scene.style.setProperty(
        "--scene-y",
        `${pointerY * -3 + scroll * 0.07}px`,
      );
      scene.style.setProperty("--foreground-x", `${pointerX * -11}px`);
      scene.style.setProperty(
        "--foreground-y",
        `${pointerY * -7 + scroll * 0.025}px`,
      );
      frame = 0;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const pointer = (event: PointerEvent) => {
      pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      pointerY = (event.clientY / window.innerHeight) * 2 - 1;
      schedule();
    };
    const reset = () => {
      pointerX = 0;
      pointerY = 0;
      schedule();
    };
    hero.addEventListener("pointermove", pointer, { passive: true });
    hero.addEventListener("pointerleave", reset);
    window.addEventListener("scroll", schedule, { passive: true });
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      hero.removeEventListener("pointermove", pointer);
      hero.removeEventListener("pointerleave", reset);
      window.removeEventListener("scroll", schedule);
    };
  }, [motionOn, inView, pageVisible]);
  const toggleMotion = () => {
    const next = !motionWanted;
    setMotionWanted(next);
    try {
      localStorage.setItem("portfolio-motion", next ? "on" : "off");
    } catch {
      /* Storage restrictions must not prevent using the control. */
    }
  };
  return (
    <section
      id="top"
      ref={heroRef}
      className="hero"
      aria-labelledby="hero-name"
      data-motion={motionOn ? "on" : "off"}
      data-animating={motionOn && inView && pageVisible ? "true" : "false"}
    >
      <div className="alpine-scene" ref={sceneRef} aria-hidden="true">
        <img
          className="alpine-background"
          src="/images/alpine-1600.webp"
          srcSet={imageSet}
          sizes={imageSizes}
          width="2560"
          height="1440"
          alt=""
          fetchPriority="high"
        />
        <img
          className="alpine-foreground"
          src="/images/alpine-1600.webp"
          srcSet={imageSet}
          sizes={imageSizes}
          width="2560"
          height="1440"
          alt=""
          decoding="async"
        />
        <div className="valley-mist mist-one" />
        <div className="valley-mist mist-two" />
        <div className="hero-shade" />
      </div>
      <div className="hero-content">
        <p className="hero-eyebrow">
          SOFTWARE ENGINEER <span aria-hidden="true">·</span> UCLA COMPUTER
          SCIENCE
        </p>
        <h1 id="hero-name" aria-label="Mahesh Karthikeyan">
          Mahesh
          <br />
          <em>Karthikeyan</em>
          <span className="hero-period" aria-hidden="true">
            .
          </span>
        </h1>
        <p className="hero-description">
          Exploring systems. Building useful things.
        </p>
        <div className="hero-actions">
          <a className="button-primary" href="#projects">
            Explore my work
            <Arrow />
          </a>
          <a className="hero-contact" href="#contact">
            Get in touch
            <Arrow diagonal />
          </a>
        </div>
      </div>
      <div className="hero-bottom">
        <p>
          ROOTED IN CURIOSITY.
          <br />
          <span>Always looking a little further.</span>
        </p>
        <a href="#projects" className="scroll-cue">
          <span>SCROLL TO EXPLORE</span>
          <span className="scroll-line" aria-hidden="true" />
        </a>
        <button
          type="button"
          className="motion-toggle"
          onClick={toggleMotion}
          aria-pressed={motionOn}
          disabled={!motionSupported}
          aria-label={
            !motionSupported
              ? "Motion off: static view follows your device preferences"
              : `Motion ${motionOn ? "on" : "off"}: toggle landscape animation`
          }
        >
          <span className="motion-icon" aria-hidden="true">
            {motionOn ? "Ⅱ" : "▷"}
          </span>
          <span>{motionOn ? "Motion on" : "Motion off"}</span>
        </button>
      </div>
    </section>
  );
}
