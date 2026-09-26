// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useWeather from "./useWeather";
import WeatherStatus from "./WeatherStatus";
import {
  MAX_AGE_MS,
  REFRESH_MS,
  isFresh,
  parseWeather,
  weatherVisuals,
} from "./weather";

const now = Date.parse("2026-09-25T12:00:00Z");
const response = (time = Date.now()) => ({
  current_units: {
    time: "unixtime",
    interval: "seconds",
    temperature_2m: "°C",
    relative_humidity_2m: "%",
    rain: "mm",
    showers: "mm",
    snowfall: "cm",
    cloud_cover: "%",
    wind_speed_10m: "km/h",
  },
  current: {
    time: time / 1000,
    interval: 900,
    temperature_2m: -1.5,
    relative_humidity_2m: 91,
    rain: 0,
    showers: 0,
    snowfall: 0.42,
    cloud_cover: 100,
    wind_speed_10m: 5.1,
  },
});
const ok = (body = response()) => ({ ok: true, json: async () => body });
function Harness() {
  const weather = useWeather();
  return <WeatherStatus weather={weather} hidden={false} />;
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
  vi.spyOn(document, "hidden", "get").mockReturnValue(false);
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ok()),
  );
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

describe("current weather data", () => {
  it("normalizes accumulation units and renders snow without inventing rain", () => {
    const reading = parseWeather(response());
    expect(reading.snow).toBe(1.68);
    const visuals = weatherVisuals(reading);
    expect(visuals.rain).toBe(0);
    expect(visuals.snow).toBeGreaterThan(0.6);
    expect(visuals.cloud).toBe(1);
    expect(visuals.wind).toBeGreaterThan(0);
    const clear = { ...reading, cloud: 0, humidity: 40, snow: 0, wind: 0 };
    expect(weatherVisuals(clear)).toEqual({
      cloud: 0,
      wind: 0,
      rain: 0,
      snow: 0,
      mist: 0,
    });
  });
  it("rejects stale, future, missing, nonnumeric, and wrong-unit data", () => {
    expect(() => parseWeather(response(now - MAX_AGE_MS))).toThrow();
    expect(() => parseWeather(response(now + 6 * 60_000))).toThrow();
    expect(() => parseWeather(null)).toThrow();
    expect(() =>
      parseWeather({
        ...response(),
        current: { ...response().current, cloud_cover: null },
      }),
    ).toThrow();
    expect(() =>
      parseWeather({
        ...response(),
        current_units: { ...response().current_units, wind_speed_10m: "mph" },
      }),
    ).toThrow();
    expect(isFresh(parseWeather(response()), now + MAX_AGE_MS)).toBe(false);
  });
  it("only labels a successful current response live and refreshes every 15 minutes", async () => {
    const view = render(<Harness />);
    expect(
      screen.getByRole("button", { name: "Connecting weather" }),
    ).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
    await advance(1500);
    const badge = screen.getByRole("button", { name: "Live weather" });
    fireEvent.click(badge);
    expect(screen.getByText(/not a camera feed/)).toBeTruthy();
    expect(screen.getByText("17:45 NPT")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Open-Meteo" }).getAttribute("href"),
    ).toBe("https://open-meteo.com/");
    fireEvent.keyDown(badge, { key: "Escape" });
    expect(badge.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(badge);
    await advance(REFRESH_MS);
    expect(fetch).toHaveBeenCalledTimes(2);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("drops the live label on failure and reconnects without blocking the landscape", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("offline"));
    render(<Harness />);
    await advance(1500);
    fireEvent.click(screen.getByRole("button", { name: "Weather offline" }));
    expect(screen.getByText(/simulated conditions/)).toBeTruthy();
    await advance(60_000);
    expect(screen.getByRole("button", { name: "Live weather" })).toBeTruthy();
    fireEvent(window, new Event("offline"));
    expect(
      screen.getByRole("button", { name: "Weather offline" }),
    ).toBeTruthy();
  });
  it("stops hidden requests, expires old data on return, and refreshes immediately", async () => {
    render(<Harness />);
    await advance(1500);
    vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    fireEvent(document, new Event("visibilitychange"));
    expect(vi.getTimerCount()).toBe(0);
    await advance(MAX_AGE_MS + 1000);
    expect(fetch).toHaveBeenCalledTimes(1);
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    fireEvent(document, new Event("visibilitychange"));
    expect(
      screen.getByRole("button", { name: "Weather offline" }),
    ).toBeTruthy();
    await advance(1);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("button", { name: "Live weather" })).toBeTruthy();
  });
  it("aborts a stalled request after eight seconds and cleans up on unmount", async () => {
    let signal: AbortSignal;
    vi.mocked(fetch).mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          signal = init!.signal!;
          signal.addEventListener("abort", () => reject(new Error("aborted")), {
            once: true,
          });
        }),
    );
    const view = render(<Harness />);
    await advance(9500);
    expect(signal!.aborted).toBe(true);
    expect(
      screen.getByRole("button", { name: "Weather offline" }),
    ).toBeTruthy();
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
