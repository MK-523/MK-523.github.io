import { useEffect, useState } from "react";
import {
  WEATHER_URL,
  REFRESH_MS,
  MAX_AGE_MS,
  isFresh,
  parseWeather,
  type WeatherReading,
  type WeatherState,
} from "./weather";

export default function useWeather(): WeatherState {
  const [state, setState] = useState<WeatherState>({
    status: "connecting",
    reading: null,
  });
  useEffect(() => {
    let disposed = false;
    let reading: WeatherReading | null = null;
    let nextFetch = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let expiry: ReturnType<typeof setTimeout> | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let request: AbortController | null = null;
    const publish = (status: WeatherState["status"]) => {
      if (!disposed) setState({ status, reading });
    };
    const expire = () => {
      clearTimeout(expiry);
      if (reading && !document.hidden) {
        const remaining = reading.time + MAX_AGE_MS - Date.now();
        if (!isFresh(reading)) publish("stale");
        else expiry = setTimeout(() => publish("stale"), remaining);
      }
    };
    const refresh = async () => {
      if (disposed || document.hidden || request) return;
      clearTimeout(timer);
      const controller = new AbortController();
      request = controller;
      timeout = setTimeout(() => controller.abort(), 8_000);
      try {
        const response = await fetch(WEATHER_URL, {
          signal: controller.signal,
          credentials: "omit",
          referrerPolicy: "no-referrer",
        });
        if (!response.ok) throw new Error("Weather request failed");
        const next = parseWeather(await response.json());
        if (disposed || controller.signal.aborted) return;
        reading = next;
        publish("live");
        nextFetch = Date.now() + REFRESH_MS;
      } catch {
        if (
          !disposed &&
          !document.hidden &&
          controller.signal.reason !== "hidden"
        )
          publish(reading && !isFresh(reading) ? "stale" : "offline");
        nextFetch =
          controller.signal.reason === "hidden" ? 0 : Date.now() + 60_000;
      } finally {
        clearTimeout(timeout);
        request = null;
        if (!disposed && !document.hidden) {
          expire();
          clearTimeout(timer);
          timer = setTimeout(refresh, Math.max(1000, nextFetch - Date.now()));
        }
      }
    };
    const visibility = () => {
      clearTimeout(timer);
      clearTimeout(expiry);
      if (document.hidden) {
        request?.abort("hidden");
        clearTimeout(timeout);
      } else {
        expire();
        // Never resume with an expired "live" label. Refresh on return when due.
        if (reading && !isFresh(reading)) nextFetch = 0;
        timer = setTimeout(refresh, Math.max(0, nextFetch - Date.now()));
      }
    };
    const online = () => {
      nextFetch = 0;
      visibility();
    };
    const offline = () => {
      request?.abort();
      publish("offline");
    };
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    // Let the first photographic paint and navigation initialize independently.
    if (!document.hidden) timer = setTimeout(refresh, 1500);
    return () => {
      disposed = true;
      clearTimeout(timer);
      clearTimeout(expiry);
      clearTimeout(timeout);
      request?.abort();
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, []);
  return state;
}
