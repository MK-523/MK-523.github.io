/** Current model data, not a local weather-station observation or camera. */
export const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=27.98&longitude=86.69&current=temperature_2m,relative_humidity_2m,rain,showers,snowfall,cloud_cover,wind_speed_10m&timezone=Asia%2FKathmandu&timeformat=unixtime&forecast_days=1";
export const REFRESH_MS = 15 * 60_000;
export const MAX_AGE_MS = 45 * 60_000;
export type WeatherReading = {
  time: number;
  temperature: number;
  humidity: number;
  cloud: number;
  wind: number;
  rain: number; // mm/hour, normalized from the provider's interval
  snow: number; // cm/hour
};
export type WeatherState = {
  status: "connecting" | "live" | "offline" | "stale";
  reading: WeatherReading | null;
};
export type WeatherVisuals = {
  cloud: number;
  wind: number;
  rain: number;
  snow: number;
  mist: number;
};
export const fallbackWeather: WeatherVisuals = {
  cloud: 0.65,
  wind: 0.35,
  rain: 0.18,
  snow: 0,
  mist: 0.55,
};
export function isFresh(reading: WeatherReading, now = Date.now()) {
  const age = now - reading.time;
  return age >= -5 * 60_000 && age < MAX_AGE_MS;
}
export function parseWeather(value: unknown, now = Date.now()): WeatherReading {
  const body = value as {
    current?: Record<string, unknown>;
    current_units?: Record<string, unknown>;
  };
  const current = body?.current;
  const units = body?.current_units;
  const expected = {
    time: "unixtime",
    interval: "seconds",
    temperature_2m: "°C",
    relative_humidity_2m: "%",
    rain: "mm",
    showers: "mm",
    snowfall: "cm",
    cloud_cover: "%",
    wind_speed_10m: "km/h",
  };
  if (
    !current ||
    !units ||
    Object.entries(expected).some(([key, unit]) => units[key] !== unit)
  )
    throw new Error("Unrecognized weather response");
  const number = (key: string, min: number, max: number) => {
    const n = current[key];
    if (typeof n !== "number" || !Number.isFinite(n) || n < min || n > max)
      throw new Error(`Invalid weather field: ${key}`);
    return n;
  };
  const interval = number("interval", 60, 3600);
  const reading = {
    time: number("time", 0, 20_000_000_000) * 1000,
    temperature: number("temperature_2m", -100, 65),
    humidity: number("relative_humidity_2m", 0, 100),
    cloud: number("cloud_cover", 0, 100),
    wind: number("wind_speed_10m", 0, 400),
    rain:
      ((number("rain", 0, 500) + number("showers", 0, 500)) * 3600) / interval,
    snow: (number("snowfall", 0, 100) * 3600) / interval,
  };
  if (!isFresh(reading, now)) throw new Error("Weather data is not current");
  return reading;
}
export function weatherVisuals(reading: WeatherReading): WeatherVisuals {
  return {
    cloud: reading.cloud / 100,
    wind: Math.min(1.5, reading.wind / 35),
    rain: 1 - Math.exp(-reading.rain / 2),
    snow: 1 - Math.exp(-reading.snow / 1.5),
    mist:
      Math.max(0, (reading.humidity - 65) / 35) *
      (0.3 + (0.7 * reading.cloud) / 100),
  };
}
export function describeWeather(reading: WeatherReading) {
  if (reading.snow > 0.01)
    return reading.rain > 0.01 ? "Rain and snow" : "Snow";
  if (reading.rain > 0.01) return reading.rain < 0.5 ? "Light rain" : "Rain";
  return reading.cloud > 85
    ? "Overcast"
    : reading.cloud > 25
      ? "Partly cloudy"
      : "Clear skies";
}
export const nepalWeatherTime = (time: number) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kathmandu",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(time);
