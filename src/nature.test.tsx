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
import App from "./FieldGuide";
import { projects, roles, campusRoles, recognition } from "./content";
let reduced = false;
let listeners: Set<() => void>;
beforeEach(() => {
  reduced = false;
  listeners = new Set();
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      get matches() {
        return reduced;
      },
      addEventListener: (_: string, fn: () => void) => listeners.add(fn),
      removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
    })),
  );
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
});
describe("nature portfolio", () => {
  it("keeps original sections, facts and contact links available without discovery", () => {
    render(<App />);
    for (const id of [
      "projects",
      "experience",
      "campus",
      "awards",
      "about",
      "contact",
    ])
      expect(document.getElementById(id)).not.toBeNull();
    for (const p of projects)
      expect(screen.getByRole("heading", { name: p.title })).toBeTruthy();
    for (const r of roles)
      expect(
        screen.getByRole("heading", { name: r.organization }),
      ).toBeTruthy();
    for (const r of campusRoles)
      expect(screen.getByRole("heading", { name: r.title })).toBeTruthy();
    for (const [r] of recognition)
      expect(screen.getByRole("heading", { name: r })).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: "mahesh523k@gmail.com" })
        .getAttribute("href"),
    ).toBe("mailto:mahesh523k@gmail.com");
    expect(screen.queryByRole("link", { name: /resume/i })).toBeNull();
  });
  it("opens all source-backed details, counts unique discoveries and never gates work", () => {
    render(<App />);
    projects.forEach((p, i) => {
      fireEvent.click(
        screen.getByRole("button", { name: `Explore ${p.title}` }),
      );
      const modal = screen.getByRole("dialog", { name: p.title });
      expect(within(modal).getByText(p.summary)).toBeTruthy();
      expect(within(modal).getByRole("link").getAttribute("href")).toBe(p.href);
      p.bullets.forEach((b) => expect(within(modal).getByText(b)).toBeTruthy());
      expect(screen.getByText(`${i + 1} / 4 discoveries`)).toBeTruthy();
      fireEvent.click(
        within(modal).getByRole("button", { name: "Close project details" }),
      );
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Explore ChessStalker" }),
    );
    expect(screen.getByText("4 / 4 discoveries")).toBeTruthy();
    expect(
      screen.getByText("A curious mind, indeed. You found every project."),
    ).toBeTruthy();
  });
  it("restores focus and scroll after Escape, and cycles dialog keyboard focus", () => {
    render(<App />);
    const trigger = screen.getByRole("button", { name: "Explore A-Eye" });
    trigger.focus();
    fireEvent.click(trigger);
    const modal = screen.getByRole("dialog");
    const close = within(modal).getByRole("button", {
      name: "Close project details",
    });
    const link = within(modal).getByRole("link");
    expect(document.body.style.overflow).toBe("hidden");
    close.focus();
    fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(link);
    fireEvent.keyDown(link, { key: "Tab" });
    expect(document.activeElement).toBe(close);
    fireEvent(modal, new Event("cancel", { cancelable: true }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).toBe("");
  });
  it("filters project cards without changing the map discoveries", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Investigations" }));
    expect(
      screen.queryByRole("button", { name: "Explore ChessStalker" }),
    ).toBeNull();
    expect(
      screen.getByRole("button", { name: "Explore SAT Policy Audit" }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /01\s*ChessStalker/ }));
    expect(screen.getByRole("dialog", { name: "ChessStalker" })).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Close project details" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Products" }));
    expect(screen.getByRole("button", { name: "Explore A-Eye" })).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Explore SAT Policy Audit" }),
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /All work/ }));
    expect(document.querySelectorAll(".project-card").length).toBe(4);
  });
  it("supports a user motion toggle and live system reduced-motion changes", () => {
    const view = render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Motion on/ }));
    expect(
      view.container.firstElementChild?.classList.contains("motion-paused"),
    ).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: /Motion off/ }));
    expect(
      view.container.firstElementChild?.classList.contains("motion-paused"),
    ).toBe(false);
    act(() => {
      reduced = true;
      listeners.forEach((fn) => fn());
    });
    const toggle = screen.getByRole("button", {
      name: /Motion off/,
    }) as HTMLButtonElement;
    expect(toggle.disabled).toBe(true);
    expect(
      view.container.firstElementChild?.classList.contains("motion-paused"),
    ).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Explore A-Eye" }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    act(() => {
      reduced = false;
      listeners.forEach((fn) => fn());
    });
    expect(toggle.disabled).toBe(false);
    view.unmount();
    expect(listeners.size).toBe(0);
    expect(document.body.style.overflow).toBe("");
  });
  it("closes the compact menu when a direct section is selected", () => {
    render(<App />);
    const button = screen.getByRole("button", { name: "Open navigation" });
    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(screen.getByRole("link", { name: "Experience" }));
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });
});
