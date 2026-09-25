import { describe, expect, it } from "vitest";
import { lightingAt } from "./daylight";

const at = (iso: string) => lightingAt(Date.parse(iso));

describe("Nepal solar lighting", () => {
  it("uses Nepal's quarter-hour offset across the UTC date boundary", () => {
    const midnight = at("2026-09-24T18:15:00Z");
    expect(midnight.nepalTime).toBe("00:00");
    expect(midnight.period).toBe("night");
    expect(midnight.daylight).toBe(0);
    expect(midnight).toEqual(at("2026-09-25T00:00:00+05:45"));
    expect(at("2026-09-25T06:15:00Z").nepalTime).toBe("12:00");
  });
  it("produces distinct midnight, dawn, noon, and dusk states", () => {
    const dawn = at("2026-09-25T05:45:00+05:45");
    const noon = at("2026-09-25T12:00:00+05:45");
    const dusk = at("2026-09-25T18:00:00+05:45");
    expect(dawn.period).toBe("sunrise");
    expect(dusk.period).toBe("sunset");
    for (const lighting of [dawn, dusk]) {
      expect(lighting.daylight).toBeGreaterThan(0);
      expect(lighting.daylight).toBeLessThan(1);
      expect(lighting.twilight).toBeGreaterThan(0.3);
    }
    expect(noon.period).toBe("day");
    expect(noon.daylight).toBe(1);
    expect(noon.twilight).toBe(0);
  });
  it("follows seasonal daylight instead of fixed sunrise and sunset hours", () => {
    const summer = at("2026-06-21T05:30:00+05:45");
    const winter = at("2026-12-21T05:30:00+05:45");
    expect(summer.daylight).toBeGreaterThan(winter.daylight + 0.4);
    expect(winter.period).toBe("night");
    expect(at("2026-06-21T18:30:00+05:45").daylight).toBeGreaterThan(
      at("2026-12-21T18:30:00+05:45").daylight,
    );
  });
  it("keeps transitions continuous across a full day, midnight, and leap day", () => {
    for (const date of ["2026-09-25", "2028-02-29", "2026-12-31"]) {
      const start = Date.parse(`${date}T00:00:00+05:45`);
      let previous = lightingAt(start);
      for (let minute = 1; minute <= 1440; minute++) {
        const next = lightingAt(start + minute * 60_000);
        expect(Math.abs(next.daylight - previous.daylight)).toBeLessThan(0.03);
        expect(Math.abs(next.twilight - previous.twilight)).toBeLessThan(0.06);
        expect(next.daylight).toBeGreaterThanOrEqual(0);
        expect(next.daylight).toBeLessThanOrEqual(1);
        previous = next;
      }
    }
  });
});
