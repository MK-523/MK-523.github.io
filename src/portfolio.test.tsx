// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import AlpineHero from "./AlpineHero";

let mediaMatches = true;
let mediaListeners: Set<() => void>;
let observers: Array<(entries: Array<{ isIntersecting: boolean }>) => void>;

beforeEach(() => {
  localStorage.clear();
  mediaMatches = true;
  mediaListeners = new Set();
  observers = [];
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      get matches() {
        return mediaMatches;
      },
      addEventListener: (_: string, listener: () => void) =>
        mediaListeners.add(listener),
      removeEventListener: (_: string, listener: () => void) =>
        mediaListeners.delete(listener),
    })),
  );
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(
        callback: (entries: Array<{ isIntersecting: boolean }>) => void,
      ) {
        observers.push(callback);
      }
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn(() => 1),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const hero = () => screen.getByRole("region", { name: "Mahesh Karthikeyan" });

describe("landscape motion", () => {
  it("lets visitors stop motion and preserves the choice after remount", () => {
    const first = render(<AlpineHero />);
    expect(hero().getAttribute("data-motion")).toBe("on");
    fireEvent.click(screen.getByRole("button", { name: /Motion on:/ }));
    expect(hero().getAttribute("data-motion")).toBe("off");
    expect(localStorage.getItem("portfolio-motion")).toBe("off");
    first.unmount();
    render(<AlpineHero />);
    expect(hero().getAttribute("data-motion")).toBe("off");
  });
  it("uses a static scene for reduced motion or a coarse pointer and follows live preference changes", () => {
    mediaMatches = false;
    render(<AlpineHero />);
    const toggle = screen.getByRole("button", {
      name: /Motion off:/,
    }) as HTMLButtonElement;
    expect(toggle.disabled).toBe(true);
    expect(hero().getAttribute("data-animating")).toBe("false");
    expect(requestAnimationFrame).not.toHaveBeenCalled();
    act(() => {
      mediaMatches = true;
      mediaListeners.forEach((listener) => listener());
    });
    expect(hero().getAttribute("data-motion")).toBe("on");
    act(() => {
      mediaMatches = false;
      mediaListeners.forEach((listener) => listener());
    });
    expect(hero().getAttribute("data-motion")).toBe("off");
  });
  it("stops work while outside the viewport and resumes on return", () => {
    render(<AlpineHero />);
    act(() =>
      observers.forEach((callback) => callback([{ isIntersecting: false }])),
    );
    expect(hero().getAttribute("data-animating")).toBe("false");
    vi.mocked(requestAnimationFrame).mockClear();
    fireEvent.scroll(window);
    fireEvent.pointerMove(hero(), { clientX: 300, clientY: 200 });
    expect(requestAnimationFrame).not.toHaveBeenCalled();
    act(() =>
      observers.forEach((callback) => callback([{ isIntersecting: true }])),
    );
    expect(hero().getAttribute("data-animating")).toBe("true");
  });
  it("stops animation when the tab is hidden", () => {
    render(<AlpineHero />);
    const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    fireEvent(document, new Event("visibilitychange"));
    expect(hero().getAttribute("data-animating")).toBe("false");
    hidden.mockReturnValue(false);
    fireEvent(document, new Event("visibilitychange"));
    expect(hero().getAttribute("data-animating")).toBe("true");
  });
  it("keeps the page and toggle usable when local storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Storage disabled");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage disabled");
    });
    render(<AlpineHero />);
    fireEvent.click(screen.getByRole("button", { name: /Motion on:/ }));
    expect(hero().getAttribute("data-motion")).toBe("off");
    expect(
      screen
        .getByRole("link", { name: "Explore my work" })
        .getAttribute("href"),
    ).toBe("#projects");
  });
  it("keeps the name and actions available if both image layers fail", () => {
    const { container } = render(<AlpineHero />);
    container
      .querySelectorAll("img")
      .forEach((image) => fireEvent.error(image));
    expect(
      screen.getByRole("heading", { name: "Mahesh Karthikeyan" }),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: "Explore my work" })
        .getAttribute("href"),
    ).toBe("#projects");
    expect(
      screen.getByRole("link", { name: "Get in touch" }).getAttribute("href"),
    ).toBe("#contact");
  });
});

describe("portfolio navigation", () => {
  it("closes the phone menu with Escape and restores focus to its control", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    expect(
      screen
        .getByRole("button", { name: "Close" })
        .getAttribute("aria-expanded"),
    ).toBe("true");
    fireEvent.keyDown(window, { key: "Escape" });
    const menu = screen.getByRole("button", { name: "Menu" });
    expect(menu.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(menu);
  });
  it("closes the menu after navigation and preserves every existing section anchor", () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    fireEvent.click(screen.getByRole("link", { name: "About" }));
    expect(
      screen
        .getByRole("button", { name: "Menu" })
        .getAttribute("aria-expanded"),
    ).toBe("false");
    for (const anchor of container.querySelectorAll<HTMLAnchorElement>(
      'a[href^="#"]',
    )) {
      expect(
        document.getElementById(anchor.hash.slice(1)),
        anchor.hash,
      ).not.toBeNull();
    }
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByText("Summer 2026")).toBeTruthy();
    expect(container.querySelector("[inert]")).toBeNull();
  });
});
