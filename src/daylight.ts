/** Approximate solar lighting for the Khumbu region, independent of the
 * visitor's time zone. This controls an artistic scene, not a weather feed.
 * Solar equations: https://gml.noaa.gov/grad/solcalc/solareqns.PDF
 */
const NEPAL_OFFSET_MINUTES = 345;
const LATITUDE = (27.98 * Math.PI) / 180;
const LONGITUDE = 86.69;
const DAY_MS = 86_400_000;

function smoothstep(low: number, high: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - low) / (high - low)));
  return t * t * (3 - 2 * t);
}

export function lightingAt(instant: number) {
  const local = new Date(instant + NEPAL_OFFSET_MINUTES * 60_000);
  const year = local.getUTCFullYear();
  const yearStart = Date.UTC(year, 0, 1);
  const yearDays = (Date.UTC(year + 1, 0, 1) - yearStart) / DAY_MS;
  const day = Math.floor((local.getTime() - yearStart) / DAY_MS) + 1;
  const hour =
    local.getUTCHours() +
    local.getUTCMinutes() / 60 +
    local.getUTCSeconds() / 3600 +
    local.getUTCMilliseconds() / 3_600_000;
  const gamma = ((2 * Math.PI) / yearDays) * (day - 1 + (hour - 12) / 24);
  const equation =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));
  const declination =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);
  const solarMinutes =
    hour * 60 + equation + 4 * LONGITUDE - NEPAL_OFFSET_MINUTES;
  const hourAngle = ((solarMinutes / 4 - 180) * Math.PI) / 180;
  const elevation =
    (Math.asin(
      Math.sin(LATITUDE) * Math.sin(declination) +
        Math.cos(LATITUDE) * Math.cos(declination) * Math.cos(hourAngle),
    ) *
      180) /
    Math.PI;
  const daylight = smoothstep(-8, 10, elevation);
  const twilight =
    smoothstep(-10, -2, elevation) * (1 - smoothstep(5, 18, elevation));
  const period =
    elevation <= -8
      ? "night"
      : elevation >= 10
        ? "day"
        : hourAngle < 0
          ? "sunrise"
          : "sunset";
  const nepalTime = `${String(local.getUTCHours()).padStart(2, "0")}:${String(local.getUTCMinutes()).padStart(2, "0")}`;
  return { daylight, twilight, period, nepalTime, elevation };
}

// Development-only clock for visual QA. It is removed from production builds.
// Example: ?sceneTime=2026-09-25T00:00:00%2B05:45
const previewInstant =
  import.meta.env.DEV && typeof window !== "undefined"
    ? Date.parse(
        new URLSearchParams(window.location.search).get("sceneTime") ?? "",
      )
    : NaN;
const clockStarted = Date.now();
let sampledAt = -Infinity;
let cached: ReturnType<typeof lightingAt>;

export function sceneLighting() {
  const now = Date.now();
  const instant = Number.isFinite(previewInstant)
    ? previewInstant + now - clockStarted
    : now;
  // A one-second sample keeps changes imperceptible while avoiding repeated
  // trigonometry at every frame. Clock corrections also invalidate the cache.
  if (!cached || Math.abs(instant - sampledAt) >= 1000) {
    cached = lightingAt(instant);
    sampledAt = instant;
  }
  return cached;
}
