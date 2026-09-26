import { useCallback, useEffect, useRef, useState } from "react";

export const chapters = [
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "campus", label: "Campus" },
  { id: "awards", label: "Awards" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];
const lastStep = chapters.length * 2 - 1;
export function stepFromHash(hash: string) {
  const id = hash.replace(/^#/, "");
  const travel = id.startsWith("lake-");
  const index = chapters.findIndex(
    (item) => item.id === id.replace(/^lake-/, ""),
  );
  return index < 0 ? 0 : index * 2 + (travel ? 0 : 1);
}
export function hashFromStep(step: number) {
  if (!step) return "#top";
  const chapter = chapters[Math.floor(step / 2)];
  return `#${step % 2 ? "" : "lake-"}${chapter.id}`;
}

export default function useJourney() {
  const [step, setStep] = useState(() => stepFromHash(window.location.hash));
  const stepRef = useRef(step);
  const [approached, setApproached] = useState(step > 0);
  const approachedRef = useRef(approached);
  const viewportRef = useRef<HTMLDivElement>(null);
  const lockUntil = useRef(0);
  const go = useCallback((value: number, record = true) => {
    const next = Math.max(0, value > lastStep ? 0 : value);
    lockUntil.current = Date.now() + 1100;
    stepRef.current = next;
    approachedRef.current = next > 0;
    setApproached(next > 0);
    setStep(next);
    if (record && window.location.hash !== hashFromStep(next))
      window.history.pushState(null, "", hashFromStep(next));
  }, []);
  const advance = useCallback(
    (direction = 1) => {
      // The first deliberate scroll is only a camera approach. Opening clicks
      // are reserved for exploration; no timer can reveal content for the user.
      if (stepRef.current === 0 && direction > 0 && !approachedRef.current) {
        approachedRef.current = true;
        setApproached(true);
        lockUntil.current = Date.now() + 1100;
        return;
      }
      go(stepRef.current + direction);
    },
    [go],
  );

  useEffect(() => {
    const panel = viewportRef.current;
    if (panel) panel.scrollTop = 0;
    const target = document.getElementById(
      step % 2 ? chapters[Math.floor(step / 2)].id : "top",
    );
    target?.focus({ preventScroll: true });
  }, [step]);

  useEffect(() => {
    let lastWheel = 0,
      accumulated = 0,
      gestureUsed = false;
    let touchStart: {
      x: number;
      y: number;
      inside: boolean;
      up: boolean;
      down: boolean;
    } | null = null;
    const isControl = (target: EventTarget | null) =>
      target instanceof Element &&
      !!target.closest("input, textarea, select, .weather-station");
    const canReadScroll = (target: EventTarget | null, direction: number) => {
      const panel = viewportRef.current;
      if (
        !(stepRef.current % 2) ||
        !panel ||
        !(target instanceof Node) ||
        !panel.contains(target)
      )
        return false;
      return direction > 0
        ? panel.scrollTop + panel.clientHeight < panel.scrollHeight - 2
        : panel.scrollTop > 2;
    };
    const wheel = (event: WheelEvent) => {
      if (
        event.ctrlKey ||
        isControl(event.target) ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
      )
        return;
      const now = Date.now();
      if (now - lastWheel > 180) {
        accumulated = 0;
        gestureUsed = false;
      }
      lastWheel = now;
      const direction = Math.sign(event.deltaY);
      if (!direction) return;
      if (now < lockUntil.current) {
        event.preventDefault();
        gestureUsed = true;
        return;
      }
      if (canReadScroll(event.target, direction)) {
        gestureUsed = true;
        return;
      }
      event.preventDefault();
      if (gestureUsed) return;
      const delta =
        event.deltaY *
        (event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? window.innerHeight
            : 1);
      accumulated =
        Math.sign(accumulated) === direction ? accumulated + delta : delta;
      if (Math.abs(accumulated) >= 40) {
        gestureUsed = true;
        advance(direction);
      }
    };
    const key = (event: KeyboardEvent) => {
      if (
        isControl(event.target) ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      )
        return;
      if (event.key === "Escape" && stepRef.current % 2) {
        event.preventDefault();
        go(stepRef.current - 1);
        return;
      }
      if (
        event.target instanceof Element &&
        event.target.closest("a, button, summary")
      )
        return;
      const direction = ["ArrowDown", "PageDown", " "].includes(event.key)
        ? event.shiftKey
          ? -1
          : 1
        : ["ArrowUp", "PageUp"].includes(event.key)
          ? -1
          : 0;
      if (!direction || canReadScroll(event.target, direction)) return;
      event.preventDefault();
      if (!event.repeat && Date.now() >= lockUntil.current) advance(direction);
    };
    const touchstart = (event: TouchEvent) => {
      if (
        event.touches.length !== 1 ||
        isControl(event.target) ||
        (event.target instanceof Element && event.target.closest(".scene-hit"))
      ) {
        touchStart = null;
        return;
      }
      const touch = event.touches[0];
      touchStart = {
        x: touch.clientX,
        y: touch.clientY,
        inside:
          event.target instanceof Node &&
          !!viewportRef.current?.contains(event.target),
        up: canReadScroll(event.target, -1),
        down: canReadScroll(event.target, 1),
      };
    };
    const touchend = (event: TouchEvent) => {
      const start = touchStart;
      touchStart = null;
      if (
        !start ||
        event.changedTouches.length !== 1 ||
        Date.now() < lockUntil.current
      )
        return;
      const touch = event.changedTouches[0],
        delta = start.y - touch.clientY;
      if (
        Math.abs(delta) < 55 ||
        Math.abs(delta) < Math.abs(start.x - touch.clientX)
      )
        return;
      const direction = Math.sign(delta);
      if (start.inside && (direction > 0 ? start.down : start.up)) return;
      advance(direction);
    };
    const hash = () => go(stepFromHash(window.location.hash), false);
    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("keydown", key);
    window.addEventListener("touchstart", touchstart, { passive: true });
    window.addEventListener("touchend", touchend, { passive: true });
    window.addEventListener("hashchange", hash);
    return () => {
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("keydown", key);
      window.removeEventListener("touchstart", touchstart);
      window.removeEventListener("touchend", touchend);
      window.removeEventListener("hashchange", hash);
    };
  }, [advance, go]);
  return { step, approached, go, advance, viewportRef };
}
