import { useEffect, useRef, useState, type RefObject } from "react";
import {
  createLakeRenderer,
  type LakeRenderer,
  type LookDirection,
} from "./lake-renderer";

export default function LakeScene({
  paused = false,
  progress: destination = 0,
  lookRef,
}: {
  paused?: boolean;
  progress?: number;
  lookRef?: RefObject<LookDirection>;
}) {
  const destinationRef = useRef(destination);
  useEffect(() => {
    destinationRef.current = destination;
    window.dispatchEvent(new Event("scene-preference-change"));
  }, [destination]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const pausedRef = useRef(paused);
  const [ready, setReady] = useState(false);
  const [generation, setGeneration] = useState(0);
  useEffect(() => {
    pausedRef.current = paused;
    window.dispatchEvent(new Event("scene-preference-change"));
  }, [paused]);
  useEffect(() => {
    const canvas = canvasRef.current,
      image = imageRef.current;
    if (!canvas || !image) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const touch = window.matchMedia("(pointer: coarse)");
    let renderer: LakeRenderer | null = null;
    let frame = 0,
      lastFrame = 0,
      elapsed = 0,
      progress = 0,
      lastStamp = 0;
    let disposed = false,
      lost = false;
    const look = { yaw: 0, pitch: 0 };
    const moving = () => !pausedRef.current && !reduced.matches;
    const paint = (stamp: number) => {
      frame = 0;
      if (!renderer || disposed || lost || document.hidden) return;
      const interval = 1000 / (touch.matches ? 30 : 60) - 0.5;
      if (moving() && stamp - lastFrame < interval) {
        frame = requestAnimationFrame(paint);
        return;
      }
      const dt = lastStamp ? Math.min(stamp - lastStamp, 80) : 0;
      if (moving()) elapsed += dt / 1000;
      lastStamp = stamp;
      lastFrame = stamp;
      const target = destinationRef.current;
      progress = moving()
        ? progress + (target - progress) * (1 - Math.exp(-dt * 0.0018))
        : target;
      if (lookRef) {
        const blend = moving() ? 1 - Math.exp(-dt * 0.016) : 1;
        look.yaw += (lookRef.current.yaw - look.yaw) * blend;
        look.pitch += (lookRef.current.pitch - look.pitch) * blend;
        renderer.draw(progress, elapsed, look);
      } else renderer.draw(progress, elapsed);
      const second = String(Math.floor(elapsed));
      if (canvas.dataset.time !== second) canvas.dataset.time = second;
      canvas.dataset.progress = progress.toFixed(3);
      canvas.dataset.motion = moving() ? "running" : "static";
      if (!canvas.dataset.painted) {
        canvas.dataset.painted = "true";
        setReady(true);
      }
      if (moving()) frame = requestAnimationFrame(paint);
    };
    const schedule = () => {
      if (!frame && renderer && !document.hidden && !lost)
        frame = requestAnimationFrame(paint);
    };
    const preference = () => {
      lastStamp = 0;
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else schedule();
    };
    const resize = () => {
      renderer?.resize();
      schedule();
    };
    const initialize = () => {
      if (!image.complete || !image.naturalWidth || disposed || lost) return;
      try {
        renderer?.dispose();
        renderer = createLakeRenderer(canvas, image);
        if (renderer) {
          canvas.dataset.renderer = "webgl2";
          schedule();
        } else canvas.dataset.renderer = "fallback";
      } catch {
        renderer = null;
        canvas.dataset.renderer = "fallback";
        setReady(false);
      }
    };
    const contextLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      cancelAnimationFrame(frame);
      frame = 0;
      setReady(false);
      delete canvas.dataset.painted;
      canvas.dataset.renderer = "fallback";
    };
    const contextRestored = () => setGeneration((value) => value + 1);
    image.addEventListener("load", initialize);
    canvas.addEventListener("webglcontextlost", contextLost);
    canvas.addEventListener("webglcontextrestored", contextRestored);
    window.addEventListener("resize", resize);
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    window.addEventListener("scene-preference-change", preference);
    window.addEventListener("scene-look-change", schedule);
    document.addEventListener("visibilitychange", preference);
    reduced.addEventListener("change", preference);
    initialize();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      renderer?.dispose();
      image.removeEventListener("load", initialize);
      canvas.removeEventListener("webglcontextlost", contextLost);
      canvas.removeEventListener("webglcontextrestored", contextRestored);
      window.removeEventListener("resize", resize);
      observer.disconnect();
      window.removeEventListener("scene-preference-change", preference);
      window.removeEventListener("scene-look-change", schedule);
      document.removeEventListener("visibilitychange", preference);
      reduced.removeEventListener("change", preference);
    };
  }, [generation, lookRef]);
  return (
    <div
      className="lake-scene scene-geometry"
      aria-hidden="true"
      data-ready={ready}
    >
      <img
        ref={imageRef}
        src="/images/himalayas-1920.webp"
        srcSet="/images/himalayas-960.webp 960w, /images/himalayas-1920.webp 1920w"
        sizes="100vw"
        width="1920"
        height="800"
        alt=""
        fetchPriority="high"
      />
      <canvas ref={canvasRef} className="lake-canvas" />
      <div className="scene-shade" />
    </div>
  );
}
