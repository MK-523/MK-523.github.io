import {
  useLayoutEffect,
  useRef,
  type PointerEvent,
  type MouseEvent,
  type KeyboardEvent,
} from "react";
import type { LookDirection } from "./lake-renderer";

/** Keep the drawing surface fixed during the circle transition and handle
 * direct manipulation independently from click-to-continue navigation. */
export default function useLandscape(advance: () => void) {
  const shellRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  const lookRef = useRef<LookDirection>({ yaw: 0, pitch: 0 });
  const gesture = useRef({
    pointer: -1,
    x: 0,
    y: 0,
    yaw: 0,
    pitch: 0,
    moved: false,
  });
  useLayoutEffect(() => {
    const shell = shellRef.current,
      size = sizeRef.current;
    if (!shell || !size) return;
    const resize = () => {
      const diameter = size.getBoundingClientRect().width;
      if (diameter > 0 && shell.clientHeight > 0)
        shell.style.setProperty(
          "--scene-scale",
          String(diameter / shell.clientHeight),
        );
    };
    const observer = new ResizeObserver(resize);
    observer.observe(size);
    observer.observe(shell);
    resize();
    return () => observer.disconnect();
  }, []);
  const look = (yaw: number, pitch: number) => {
    lookRef.current = {
      yaw: Math.max(-0.28, Math.min(0.28, yaw)),
      pitch: Math.max(-0.11, Math.min(0.11, pitch)),
    };
    window.dispatchEvent(new Event("scene-look-change"));
  };
  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || event.isPrimary === false) return;
    gesture.current = {
      pointer: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      ...lookRef.current,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const start = gesture.current;
    if (event.pointerId !== start.pointer) return;
    const dx = event.clientX - start.x,
      dy = event.clientY - start.y;
    if (!start.moved && Math.hypot(dx, dy) < 7) return;
    start.moved = true;
    look(start.yaw - dx * 0.0015, start.pitch + dy * 0.0009);
  };
  const onPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerId !== gesture.current.pointer) return;
    gesture.current.pointer = -1;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (gesture.current.moved && event.detail !== 0) {
      gesture.current.moved = false;
      event.preventDefault();
      return;
    }
    advance();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    look(
      lookRef.current.yaw + (event.key === "ArrowLeft" ? -0.035 : 0.035),
      lookRef.current.pitch,
    );
  };
  return {
    shellRef,
    sizeRef,
    lookRef,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onClick,
      onKeyDown,
    },
  };
}
