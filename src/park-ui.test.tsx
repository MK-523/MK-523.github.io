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
import { attractions, discoveries, locations, START } from "./park";
let frames: Map<number, FrameRequestCallback>,
  next = 0,
  time = 0,
  reduced = false,
  listeners: Set<() => void>;
function advance(n = 1) {
  act(() => {
    for (let i = 0; i < n; i++) {
      time += 16;
      const batch = [...frames.values()];
      frames.clear();
      batch.forEach((fn) => fn(time));
    }
  });
}
function coordinates() {
  const p = document.querySelector(".player")!;
  return {
    x: Number(p.getAttribute("data-x")),
    y: Number(p.getAttribute("data-y")),
  };
}
beforeEach(() => {
  frames = new Map();
  next = 0;
  time = 0;
  reduced = false;
  listeners = new Set();
  window.history.replaceState(null, "", "/");
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => {
    frames.set(++next, fn);
    return next;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  vi.stubGlobal("matchMedia", () => ({
    get matches() {
      return reduced;
    },
    addEventListener: (_: string, fn: () => void) => listeners.add(fn),
    removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
  }));
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    "PointerEvent",
    class extends MouseEvent {
      pointerId = 1;
    },
  );
  HTMLElement.prototype.setPointerCapture = vi.fn();
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
    this.querySelector<HTMLButtonElement>("button")?.focus();
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
describe("explorable park", () => {
  it("walks with the keyboard, stops on keyup/blur, and opens nearby places with E", () => {
    render(<App />);
    const stage = screen.getByRole("region");
    stage.focus();
    fireEvent.keyDown(stage, { key: "ArrowRight" });
    advance(60);
    fireEvent.keyUp(stage, { key: "ArrowRight" });
    expect(coordinates().x).toBeGreaterThan(START.x + 100);
    const stopped = coordinates();
    advance(20);
    expect(coordinates()).toEqual(stopped);
    fireEvent.keyDown(stage, { key: "ArrowDown" });
    advance(12);
    fireEvent(window, new Event("blur"));
    const blurred = coordinates();
    advance(20);
    expect(coordinates()).toEqual(blurred);
    fireEvent.click(
      screen.getByRole("button", {
        name: "Walk to The reading grove: About me",
      }),
    );
    advance(500);
    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Close and return to park" }),
    );
    fireEvent.keyDown(stage, { key: "e" });
    expect(screen.getByRole("heading", { name: "About me" })).toBeTruthy();
  });
  it("click-to-walk reaches a landmark and opens its original project details", () => {
    render(<App />);
    fireEvent.click(
      screen.getByRole("button", { name: "Walk to The workshop: Projects" }),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    advance(700);
    const panel = screen.getByRole("dialog");
    expect(
      within(panel).getByRole("heading", { name: "Projects" }),
    ).toBeTruthy();
    expect(coordinates()).toEqual(locations[0].entrance);
    fireEvent.click(
      within(panel).getByRole("button", { name: /ChessStalker/ }),
    );
    expect(
      screen
        .getByRole("link", { name: /Open ChessStalker/ })
        .getAttribute("href"),
    ).toBe("https://chessstalker.com/");
    expect(screen.getByText(/11M\+ official games indexed/)).toBeTruthy();
    expect(document.activeElement).toBe(
      screen.getByRole("heading", { name: "ChessStalker" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "← All projects" }));
    expect(document.activeElement).toBe(
      within(panel).getByRole("button", { name: /ChessStalker/ }),
    );
  });
  it("provides direct access without walking, deduplicates visits, and restores focus", () => {
    render(<App />);
    const directory = screen.getByRole("button", { name: "Directory" });
    directory.focus();
    fireEvent.click(directory);
    for (const l of locations) {
      fireEvent.click(
        screen.getByRole("button", {
          name: `Open ${l.category}`,
        }),
      );
      fireEvent.click(
        screen.getByRole("button", { name: "Close and return to park" }),
      );
      fireEvent.click(directory);
    }
    fireEvent.click(screen.getByRole("button", { name: "Open Projects" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Close and return to park" }),
    );
    expect(screen.getByLabelText("6 of 6 places visited")).toBeTruthy();
    expect(coordinates()).toEqual(START);
    expect(document.activeElement).toBe(screen.getByRole("region"));
  });
  it("navigates the expanded map, collects optional items once, and keeps flavor copy offscreen", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Open park map" }));
    const map = screen.getByRole("img", { name: /Park map/ });
    vi.spyOn(map, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 600,
      bottom: 440,
      width: 600,
      height: 440,
      toJSON: () => ({}),
    });
    fireEvent.pointerDown(map, {
      button: 0,
      clientX: discoveries[0].x / 5,
      clientY: discoveries[0].y / 5,
    });
    expect(screen.queryByRole("dialog")).toBeNull();
    advance(1500);
    expect(coordinates()).toEqual({ x: discoveries[0].x, y: discoveries[0].y });
    expect(screen.getByRole("status").textContent).toBe("Apple collected.");
    fireEvent.click(screen.getByRole("button", { name: "Open park map" }));
    expect(screen.getByLabelText("1 of 4 collectibles found")).toBeTruthy();
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Walk to Island pavilion",
      }),
    );
    advance(2000);
    expect(coordinates()).toEqual({ x: attractions[3].x, y: attractions[3].y });
    expect(document.querySelector(".walking-status")).toBeNull();
    expect(
      screen.queryByText(
        /Curiosity|scenic route|Wander a little|WELCOME, WANDERER/,
      ),
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Open park map" }));
    expect(screen.getByLabelText("1 of 4 collectibles found")).toBeTruthy();
  });
  it("supports held touch directions and stops on cancellation", () => {
    render(<App />);
    const north = screen.getByRole("button", { name: "Walk north" });
    fireEvent.pointerDown(north, { button: 0, pointerId: 1 });
    advance(30);
    expect(coordinates().y).toBeLessThan(START.y);
    fireEvent.pointerCancel(north);
    const stopped = coordinates();
    advance(30);
    expect(coordinates()).toEqual(stopped);
  });
  it("traps overlay focus, closes on Escape, and keeps motion preferences live", () => {
    const view = render(<App />);
    const directory = screen.getByRole("button", { name: "Directory" });
    directory.focus();
    fireEvent.click(directory);
    const modal = screen.getByRole("dialog"),
      close = screen.getByRole("button", { name: "Close and return to park" }),
      last = screen.getByRole("button", { name: "Walk to The lookout" });
    close.focus();
    fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
    fireEvent.keyDown(last, { key: "Tab" });
    expect(document.activeElement).toBe(close);
    fireEvent(modal, new Event("cancel", { cancelable: true }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(directory);
    fireEvent.click(
      screen.getByRole("button", { name: "Turn ambient motion off" }),
    );
    expect(
      view.container.firstElementChild?.classList.contains("park-still"),
    ).toBe(true);
    fireEvent.click(
      screen.getByRole("button", { name: "Turn ambient motion on" }),
    );
    act(() => {
      reduced = true;
      listeners.forEach((fn) => fn());
    });
    expect(
      (
        screen.getByRole("button", {
          name: "Motion off — system preference",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    view.unmount();
    expect(frames.size).toBe(0);
    expect(listeners.size).toBe(0);
  });
  it("supports existing direct section anchors and pauses movement inside overlays", () => {
    window.history.replaceState(null, "", "#contact");
    render(<App />);
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: "mahesh523k@gmail.com" })
        .getAttribute("href"),
    ).toBe("mailto:mahesh523k@gmail.com");
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "ArrowRight" });
    advance(60);
    expect(coordinates()).toEqual(START);
  });
});
