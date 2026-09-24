// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import LakeScene from "./LakeScene";
import { createLakeRenderer, type LookDirection } from "./lake-renderer";
import { chapters } from "./useJourney";

vi.mock("./lake-renderer", () => ({ createLakeRenderer: vi.fn() }));
let reduced = false;
let listeners: Set<() => void>;
let frames: Map<number, FrameRequestCallback>;
let nextFrame = 0;
let draw =
  vi.fn<(progress: number, seconds: number, look?: LookDirection) => boolean>();
let dispose = vi.fn<() => void>();
beforeEach(() => {
  window.history.replaceState(null, "", "/");
  reduced = false;
  listeners = new Set();
  frames = new Map();
  nextFrame = 0;
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      get matches() {
        return query.includes("reduced-motion") && reduced;
      },
      addEventListener: (_: string, fn: () => void) => listeners.add(fn),
      removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
    })),
  );
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((fn: FrameRequestCallback) => {
      const id = ++nextFrame;
      frames.set(id, fn);
      return id;
    }),
  );
  vi.stubGlobal(
    "cancelAnimationFrame",
    vi.fn((id: number) => frames.delete(id)),
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  HTMLElement.prototype.setPointerCapture = vi.fn();
  HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
  HTMLElement.prototype.releasePointerCapture = vi.fn();
  draw = vi.fn(() => true);
  dispose = vi.fn();
  vi.mocked(createLakeRenderer).mockReturnValue({
    draw,
    dispose,
    resize: vi.fn(),
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
function loadImage(container: HTMLElement) {
  const image = container.querySelector(".environment-texture")!;
  Object.defineProperties(image, {
    complete: { value: true, configurable: true },
    naturalWidth: { value: 1920, configurable: true },
  });
  fireEvent.load(image);
}
function tick(time: number) {
  act(() => {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((fn) => fn(time));
  });
}

describe("living landscape", () => {
  it("defers side and rear detail downloads until visitors look around", () => {
    reduced = true;
    const view = render(<App />);
    const details = Array.from(
      view.container.querySelectorAll<HTMLImageElement>(".mountain-detail"),
    );
    expect(details[0].getAttribute("src")).toBe("/images/mountains-front.webp");
    expect(details.slice(1).every((image) => !image.getAttribute("src"))).toBe(
      true,
    );
    expect(
      details
        .slice(1)
        .every(
          (image) => !image.previousElementSibling?.getAttribute("srcset"),
        ),
    ).toBe(true);
    fireEvent.keyDown(
      screen.getByRole("group", { name: "Explore the Himalayan lake" }),
      { key: "ArrowRight" },
    );
    expect(details.every((image) => image.getAttribute("src"))).toBe(true);
    expect(
      details.every((image) =>
        image.previousElementSibling?.getAttribute("srcset")?.endsWith(".avif"),
      ),
    ).toBe(true);
    expect(window.location.hash).toBe("");
  });
  it("animates after image readiness and releases GPU resources on unmount", () => {
    const view = render(<LakeScene paused={false} />);
    loadImage(view.container);
    tick(100);
    tick(150);
    expect(draw).toHaveBeenCalledTimes(2);
    expect(draw.mock.calls[1][1]).toBeGreaterThan(draw.mock.calls[0][1]);
    view.unmount();
    expect(dispose).toHaveBeenCalled();
    expect(frames.size).toBe(0);
  });
  it("keeps the fallback visible while shaders compile, including reduced motion", () => {
    reduced = true;
    draw.mockReturnValueOnce(false).mockReturnValueOnce(false);
    const view = render(<LakeScene />);
    loadImage(view.container);
    tick(100);
    expect(view.container.firstElementChild?.getAttribute("data-ready")).toBe(
      "false",
    );
    tick(150);
    expect(frames.size).toBe(1);
    tick(200);
    expect(view.container.firstElementChild?.getAttribute("data-ready")).toBe(
      "true",
    );
    expect(frames.size).toBe(0);
  });
  it("retains the fallback if asynchronous shader setup fails", () => {
    draw.mockImplementationOnce(() => {
      throw new Error("Shader failed");
    });
    const view = render(<LakeScene />);
    loadImage(view.container);
    tick(100);
    expect(view.container.querySelector("canvas")?.dataset.renderer).toBe(
      "fallback",
    );
    expect(dispose).toHaveBeenCalledOnce();
    expect(frames.size).toBe(0);
  });
  it("stops the frame loop in hidden tabs and resumes without a time jump", () => {
    const view = render(<LakeScene paused={false} />);
    loadImage(view.container);
    tick(100);
    tick(150);
    const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    fireEvent(document, new Event("visibilitychange"));
    expect(frames.size).toBe(0);
    hidden.mockReturnValue(false);
    fireEvent(document, new Event("visibilitychange"));
    tick(5000);
    expect(draw.mock.calls.at(-1)?.[1]).toBe(0.05);
  });
  it("uses one static frame for reduced motion and follows live preference changes", () => {
    reduced = true;
    const view = render(<LakeScene paused={false} />);
    loadImage(view.container);
    tick(100);
    expect(draw).toHaveBeenLastCalledWith(0, 0);
    expect(frames.size).toBe(0);
    act(() => {
      reduced = false;
      listeners.forEach((fn) => fn());
    });
    tick(150);
    expect(frames.size).toBe(1);
  });
  it("pauses continuous weather without hiding content and can resume", () => {
    const view = render(<LakeScene paused={false} />);
    loadImage(view.container);
    tick(100);
    tick(150);
    view.rerender(<LakeScene paused />);
    tick(200);
    expect(frames.size).toBe(0);
    expect(draw).toHaveBeenLastCalledWith(0, 0.05);
    view.rerender(<LakeScene paused={false} />);
    tick(250);
    expect(frames.size).toBe(1);
  });
  it("keeps all work and links accessible when WebGL is unavailable", () => {
    vi.mocked(createLakeRenderer).mockReturnValue(null);
    const view = render(<App />);
    loadImage(view.container);
    expect(view.container.querySelector("canvas")?.dataset.renderer).toBe(
      "fallback",
    );
    fireEvent.click(screen.getByRole("link", { name: "Projects" }));
    expect(screen.getByRole("heading", { name: "ChessStalker" })).toBeTruthy();
    fireEvent.click(screen.getByRole("link", { name: "Experience" }));
    expect(screen.getByRole("heading", { name: "Flex" })).toBeTruthy();
    fireEvent.click(screen.getByRole("link", { name: "Contact" }));
    expect(
      screen
        .getByRole("link", { name: "mahesh523k@gmail.com" })
        .getAttribute("href"),
    ).toBe("mailto:mahesh523k@gmail.com");
  });
  it("falls back on GPU context loss and stops drawing", () => {
    const view = render(<LakeScene paused={false} />);
    loadImage(view.container);
    tick(100);
    fireEvent(
      view.container.querySelector("canvas")!,
      new Event("webglcontextlost", { cancelable: true }),
    );
    expect(frames.size).toBe(0);
    expect(view.container.firstElementChild?.getAttribute("data-ready")).toBe(
      "false",
    );
  });
  it("moves the camera between stops and uses a static destination when paused", () => {
    const view = render(<LakeScene paused={false} progress={0} />);
    loadImage(view.container);
    tick(100);
    view.rerender(<LakeScene paused={false} progress={0.6} />);
    tick(150);
    tick(200);
    const position = draw.mock.calls.at(-1)![0];
    expect(position).toBeGreaterThan(0);
    expect(position).toBeLessThan(0.6);
    view.rerender(<LakeScene paused progress={0.6} />);
    tick(250);
    expect(draw.mock.calls.at(-1)![0]).toBe(0.6);
    expect(frames.size).toBe(0);
  });
});
describe("alternating journey navigation", () => {
  it("retains all anchors and separates campus involvement from awards", () => {
    const view = render(<App />);
    for (const chapter of chapters)
      expect(document.getElementById(chapter.id)).not.toBeNull();
    const campus = document.getElementById("campus")!,
      awards = document.getElementById("awards")!;
    expect(within(campus).getByText("VEST at UCLA")).toBeTruthy();
    expect(within(campus).queryByText("USNCO Finalist")).toBeNull();
    expect(within(awards).getByText("USNCO Finalist")).toBeTruthy();
    expect(screen.getByText("Summer 2026")).toBeTruthy();
    expect(view.container.querySelector(".menu-toggle")).toBeNull();
  });
  it("alternates a reading stop with lake travel before showing the next section", () => {
    const view = render(<App />);
    expect(screen.queryByRole("heading", { name: "ChessStalker" })).toBeNull();
    fireEvent.click(screen.getByRole("link", { name: "Projects" }));
    expect(window.location.hash).toBe("#projects");
    expect(document.activeElement?.id).toBe("projects");
    expect(screen.getByRole("heading", { name: "ChessStalker" })).toBeTruthy();
    expect(
      view.container.firstElementChild?.classList.contains("is-reading"),
    ).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Return to the lake" }));
    expect(window.location.hash).toBe("#lake-experience");
    expect(screen.queryByRole("heading", { name: "Flex" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Enter Experience" }));
    expect(screen.getByRole("heading", { name: "Flex" })).toBeTruthy();
    expect(window.location.hash).toBe("#experience");
  });
  it("keeps opening drags and clicks in exploration until a section is chosen", () => {
    const view = render(<App />);
    loadImage(view.container);
    tick(100);
    const scene = screen.getByRole("group", {
      name: "Explore the Himalayan lake",
    });
    fireEvent.pointerDown(scene, {
      pointerId: 1,
      button: 0,
      clientX: 600,
      clientY: 300,
      isPrimary: true,
    });
    fireEvent.pointerMove(scene, { pointerId: 1, clientX: 420, clientY: 330 });
    fireEvent.pointerUp(scene, { pointerId: 1, clientX: 420, clientY: 330 });
    fireEvent.click(scene, { detail: 1 });
    tick(150);
    expect(window.location.hash).toBe("");
    expect(draw.mock.calls.at(-1)?.[2]?.yaw).toBeGreaterThan(0);
    fireEvent.pointerDown(scene, {
      pointerId: 2,
      button: 0,
      clientX: 600,
      clientY: 300,
      isPrimary: true,
    });
    fireEvent.pointerUp(scene, { pointerId: 2, clientX: 600, clientY: 300 });
    fireEvent.click(scene, { detail: 1 });
    expect(window.location.hash).toBe("");
    expect(screen.queryByRole("heading", { name: "ChessStalker" })).toBeNull();
    fireEvent.click(screen.getByRole("link", { name: "Projects" }));
    expect(window.location.hash).toBe("#projects");
  });
  it("lets repeated drags turn all the way around without entering a section", () => {
    reduced = true;
    const view = render(<App />);
    loadImage(view.container);
    tick(100);
    const scene = screen.getByRole("group", {
      name: "Explore the Himalayan lake",
    });
    for (let pointerId = 1; pointerId <= 5; pointerId++) {
      fireEvent.pointerDown(scene, {
        pointerId,
        button: 0,
        clientX: 800,
        clientY: 300,
        isPrimary: true,
      });
      fireEvent.pointerMove(scene, { pointerId, clientX: 300, clientY: 300 });
      fireEvent.pointerUp(scene, { pointerId });
      fireEvent.click(scene, { detail: 1 });
      tick(100 + pointerId * 50);
    }
    expect(draw.mock.calls.at(-1)?.[2]?.yaw).toBeGreaterThan(Math.PI * 2);
    expect(window.location.hash).toBe("");
    expect(frames.size).toBe(0);
  });
  it("supports keyboard look with reduced motion without starting continuous animation", () => {
    reduced = true;
    const view = render(<App />);
    loadImage(view.container);
    tick(100);
    fireEvent.keyDown(
      screen.getByRole("group", { name: "Explore the Himalayan lake" }),
      {
        key: "ArrowRight",
      },
    );
    tick(150);
    expect(draw.mock.calls.at(-1)?.[2]?.yaw).toBe(0.035);
    expect(frames.size).toBe(0);
    expect(window.location.hash).toBe("");
  });
  it("opens direct links and follows browser Back/Forward without depending on motion", () => {
    reduced = true;
    window.history.replaceState(null, "", "#campus");
    render(<App />);
    expect(document.activeElement?.id).toBe("campus");
    act(() => {
      window.history.replaceState(null, "", "#lake-experience");
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(document.activeElement?.id).toBe("top");
    expect(
      screen.getByRole("button", { name: "Enter Experience" }),
    ).toBeTruthy();
    act(() => {
      window.history.replaceState(null, "", "#experience");
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(document.activeElement?.id).toBe("experience");
  });
  it("advances once per wheel gesture and does not skip sections on trackpad momentum", () => {
    let now = 10000;
    vi.spyOn(Date, "now").mockImplementation(() => now);
    render(<App />);
    fireEvent.wheel(window, { deltaY: 60 });
    expect(window.location.hash).toBe("");
    expect(screen.queryByRole("heading", { name: "ChessStalker" })).toBeNull();
    for (let i = 0; i < 20; i++) {
      now += 100;
      fireEvent.wheel(window, { deltaY: 80 });
    }
    expect(window.location.hash).toBe("");
    now += 300;
    fireEvent.wheel(window, { deltaY: 60 });
    expect(window.location.hash).toBe("#projects");
    now += 1200;
    fireEvent.wheel(window, { deltaY: 60 });
    expect(window.location.hash).toBe("#lake-experience");
  });
  it("allows reading scroll and requires a fresh gesture at the content edge", () => {
    let now = 10000;
    vi.spyOn(Date, "now").mockImplementation(() => now);
    window.history.replaceState(null, "", "#projects");
    const view = render(<App />);
    const panel = view.container.querySelector(".content-viewport")!;
    Object.defineProperties(panel, {
      clientHeight: { value: 500 },
      scrollHeight: { value: 1600 },
      scrollTop: { value: 0, writable: true },
    });
    const event = new WheelEvent("wheel", {
      deltaY: 70,
      bubbles: true,
      cancelable: true,
    });
    fireEvent(panel, event);
    expect(event.defaultPrevented).toBe(false);
    panel.scrollTop = 1100;
    now += 100;
    fireEvent.wheel(panel, { deltaY: 70 });
    expect(window.location.hash).toBe("#projects");
    now += 300;
    fireEvent.wheel(panel, { deltaY: 70 });
    expect(window.location.hash).toBe("#lake-experience");
  });
  it("supports keyboard travel, Escape, and touch swipes", () => {
    let now = 10000;
    vi.spyOn(Date, "now").mockImplementation(() => now);
    render(<App />);
    fireEvent.keyDown(window, { key: "PageDown" });
    expect(window.location.hash).toBe("");
    now += 1200;
    fireEvent.keyDown(window, { key: "PageDown" });
    expect(window.location.hash).toBe("#projects");
    fireEvent.keyDown(window, { key: "Escape" });
    expect(window.location.hash).toBe("#top");
    now += 1200;
    fireEvent.touchStart(window, { touches: [{ clientX: 180, clientY: 600 }] });
    fireEvent.touchEnd(window, {
      changedTouches: [{ clientX: 180, clientY: 400 }],
    });
    expect(window.location.hash).toBe("#top");
    now += 1200;
    fireEvent.touchStart(window, { touches: [{ clientX: 180, clientY: 600 }] });
    fireEvent.touchEnd(window, {
      changedTouches: [{ clientX: 180, clientY: 400 }],
    });
    expect(window.location.hash).toBe("#projects");
  });
  it("does not intercept external project links or expanded technical details", () => {
    window.history.replaceState(null, "", "#projects");
    render(<App />);
    const link = screen.getByRole("link", {
      name: /Open ChessStalker|Visit ChessStalker|Explore ChessStalker/,
    });
    expect(link.getAttribute("href")).toBe("https://chessstalker.com/");
    const details = screen
      .getAllByText("Technical details")[0]
      .closest("summary")!;
    fireEvent.click(details);
    expect(window.location.hash).toBe("#projects");
  });
  it("keeps all navigation usable with image failure and returns home after Contact", () => {
    const view = render(<App />);
    view.container
      .querySelectorAll("img")
      .forEach((image) => fireEvent.error(image));
    fireEvent.click(screen.getByRole("link", { name: "Projects" }));
    expect(document.activeElement?.id).toBe("projects");
    fireEvent.click(screen.getByRole("link", { name: "Contact" }));
    expect(
      screen
        .getByRole("link", { name: "mahesh523k@gmail.com" })
        .getAttribute("href"),
    ).toBe("mailto:mahesh523k@gmail.com");
    fireEvent.click(screen.getByRole("button", { name: "Return to the lake" }));
    expect(window.location.hash).toBe("#top");
    expect(
      screen.getByRole("group", { name: "Explore the Himalayan lake" }),
    ).toBeTruthy();
  });
});
