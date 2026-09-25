import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { sceneLighting } from "./daylight";
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
  const skyRef = useRef<HTMLImageElement>(null);
  const pausedRef = useRef(paused);
  const [ready, setReady] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [explored, setExplored] = useState(false);
  const [lighting, setLighting] = useState(sceneLighting);
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const refresh = () => {
      setLighting(sceneLighting());
      // Reduced motion still follows the clock with one still frame. Weather
      // and camera time remain frozen; no continuous frame loop is restarted.
      window.dispatchEvent(new Event("scene-light-change"));
    };
    const visibility = () => {
      clearInterval(timer);
      if (!document.hidden) {
        refresh();
        timer = setInterval(refresh, 30_000);
      }
    };
    document.addEventListener("visibilitychange", visibility);
    visibility();
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => {
    const explore = () => setExplored(true);
    window.addEventListener("scene-look-change", explore, { once: true });
    return () => window.removeEventListener("scene-look-change", explore);
  }, []);
  useEffect(() => {
    pausedRef.current = paused;
    window.dispatchEvent(new Event("scene-preference-change"));
  }, [paused]);
  useEffect(() => {
    const canvas = canvasRef.current,
      image = imageRef.current;
    if (!canvas || !image) return;
    const skyImage = skyRef.current;
    const detailImages = Array.from(
      canvas.parentElement!.querySelectorAll<HTMLImageElement>(
        ".mountain-detail",
      ),
    );
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
      let painted = false;
      try {
        if (lookRef) {
          const blend = moving() ? 1 - Math.exp(-dt * 0.016) : 1;
          look.yaw += (lookRef.current.yaw - look.yaw) * blend;
          look.pitch += (lookRef.current.pitch - look.pitch) * blend;
          painted = renderer.draw(progress, elapsed, look);
        } else painted = renderer.draw(progress, elapsed);
      } catch {
        renderer.dispose();
        renderer = null;
        canvas.dataset.renderer = "fallback";
        delete canvas.dataset.painted;
        setReady(false);
        return;
      }
      if (!painted) {
        frame = requestAnimationFrame(paint);
        return;
      }
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
        renderer = createLakeRenderer(canvas, image, detailImages, skyImage);
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
    skyImage?.addEventListener("load", schedule);
    detailImages.forEach((detail) => detail.addEventListener("load", schedule));
    canvas.addEventListener("webglcontextlost", contextLost);
    canvas.addEventListener("webglcontextrestored", contextRestored);
    window.addEventListener("resize", resize);
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    window.addEventListener("scene-preference-change", preference);
    window.addEventListener("scene-look-change", schedule);
    window.addEventListener("scene-light-change", schedule);
    document.addEventListener("visibilitychange", preference);
    reduced.addEventListener("change", preference);
    initialize();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      renderer?.dispose();
      image.removeEventListener("load", initialize);
      skyImage?.removeEventListener("load", schedule);
      detailImages.forEach((detail) =>
        detail.removeEventListener("load", schedule),
      );
      canvas.removeEventListener("webglcontextlost", contextLost);
      canvas.removeEventListener("webglcontextrestored", contextRestored);
      window.removeEventListener("resize", resize);
      observer.disconnect();
      window.removeEventListener("scene-preference-change", preference);
      window.removeEventListener("scene-look-change", schedule);
      window.removeEventListener("scene-light-change", schedule);
      document.removeEventListener("visibilitychange", preference);
      reduced.removeEventListener("change", preference);
    };
  }, [generation, lookRef]);
  return (
    <div
      className="lake-scene scene-geometry"
      aria-hidden="true"
      data-ready={ready}
      data-lighting={lighting.period}
      style={
        {
          "--fallback-brightness": 0.25 + 0.75 * lighting.daylight,
          "--fallback-saturation": 0.55 + 0.45 * lighting.daylight,
          "--fallback-warmth": 0.45 * lighting.twilight,
        } as CSSProperties
      }
    >
      <div className="scene-fallback">
        <img
          src="/images/himalayas-960.webp"
          width="960"
          height="400"
          alt=""
          fetchPriority="high"
        />
      </div>
      <picture hidden>
        <source
          type="image/avif"
          srcSet="/images/himalayas-surround-1774.avif"
        />
        <img
          ref={imageRef}
          className="environment-texture"
          src="/images/himalayas-surround-1774.webp"
          width="1774"
          height="887"
          alt=""
          hidden
          decoding="async"
          fetchPriority="low"
        />
      </picture>
      <picture hidden>
        <source type="image/avif" srcSet="/images/himalayan-clouds.avif" />
        <img
          ref={skyRef}
          className="cloud-texture"
          src="/images/himalayan-clouds.webp"
          width="1774"
          height="887"
          alt=""
          hidden
          decoding="async"
          fetchPriority="low"
        />
      </picture>
      <canvas ref={canvasRef} className="lake-canvas" />
      {["front", "right", "back", "left"].map((side, i) => (
        <picture key={side} hidden>
          <source
            type="image/avif"
            srcSet={
              i === 0 || explored ? `/images/mountains-${side}.avif` : undefined
            }
          />
          <img
            className="mountain-detail"
            src={
              i === 0 || explored ? `/images/mountains-${side}.webp` : undefined
            }
            alt=""
            hidden
            decoding="async"
            fetchPriority="low"
          />
        </picture>
      ))}
      <div className="scene-shade" />
    </div>
  );
}
