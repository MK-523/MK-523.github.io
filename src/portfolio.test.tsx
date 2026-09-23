// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import AlpineHero from "./AlpineHero";

let mediaMatches = true;
let mediaListeners: Set<() => void>;
let observers: Array<(entries: Array<{ isIntersecting: boolean }>) => void>;

beforeEach(() => {
  window.history.replaceState(null, "", "/");
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
  it("uses a static scene for reduced motion or a coarse pointer and follows live preference changes", () => {
    mediaMatches = false;
    render(<AlpineHero />);
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
        .getByRole("button", { name: "Close menu" })
        .getAttribute("aria-expanded"),
    ).toBe("true");
    fireEvent.keyDown(window, { key: "Escape" });
    const menu = screen.getByRole("button", { name: "Menu" });
    expect(menu.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(menu);
  });
  it("opens each section directly, separates campus from awards, and preserves old anchors", async () => {
    render(<App />);
    for (const [id, title] of [
      ["projects", "Projects"],
      ["experience", "Experience"],
      ["campus", "Campus involvement"],
      ["awards", "Awards & recognition"],
      ["about", "About"],
      ["contact", "Contact"],
    ]) {
      act(() => {
        window.history.pushState(null, "", `#${id}`);
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      });
      const heading = await screen.findByRole("heading", {
        level: 2,
        name: title,
      });
      const section = heading.closest("section");
      expect(section?.id).toBe(id);
      expect(document.activeElement).toBe(section);
      expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(1);
      if (id === "campus") {
        expect(screen.getByText("VEST at UCLA")).toBeTruthy();
        expect(screen.queryByText("USNCO Finalist")).toBeNull();
      }
      if (id === "awards") {
        expect(screen.getByText("USNCO Finalist")).toBeTruthy();
        expect(screen.queryByText("VEST at UCLA")).toBeNull();
      }
      if (id === "experience")
        expect(screen.getByText("Summer 2026")).toBeTruthy();
    }
  });
  it("opens a bookmarked section immediately and returns focus to the home heading on Escape", async () => {
    window.history.replaceState(null, "", "#campus");
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "Campus involvement" }),
    ).toBeTruthy();
    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => expect(window.location.hash).toBe("#top"));
    await waitFor(() => expect(document.activeElement?.id).toBe("hero-name"));
    expect(
      screen.queryByRole("heading", { name: "Campus involvement" }),
    ).toBeNull();
  });
  it("closes the phone menu after a destination link is followed", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    fireEvent.click(screen.getByRole("link", { name: /^About$/ }));
    await screen.findByRole("heading", { name: "About" });
    expect(
      screen
        .getByRole("button", { name: "Menu" })
        .getAttribute("aria-expanded"),
    ).toBe("false");
  });
  it("returns an unknown hash to the usable home view", () => {
    window.history.replaceState(null, "", "#unknown");
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "Mahesh Karthikeyan" }),
    ).toBeTruthy();
    expect(screen.getByRole("link", { name: "Explore my work" })).toBeTruthy();
  });
});
