import { useEffect, useRef, useState } from "react";
import {
  describeWeather,
  nepalWeatherTime,
  type WeatherState,
} from "./weather";

export default function WeatherStatus({
  weather,
  hidden,
}: {
  weather: WeatherState;
  hidden: boolean;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (hidden) setOpen(false);
  }, [hidden]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target))
        setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  const live = weather.status === "live";
  const label = live
    ? "Live weather"
    : weather.status === "connecting"
      ? "Connecting weather"
      : "Weather offline";
  const reading = weather.reading;
  return (
    <div
      className="weather-station"
      ref={root}
      hidden={hidden}
      data-status={weather.status}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.stopPropagation();
          setOpen(false);
          button.current?.focus();
        }
      }}
    >
      <button
        ref={button}
        className="scene-caption"
        aria-expanded={open}
        aria-controls={open ? "weather-details" : undefined}
        onClick={() => setOpen(!open)}
      >
        <span className="scene-caption-dot" aria-hidden="true" />
        {label}
      </button>
      {open && (
        <section
          className="weather-details"
          id="weather-details"
          aria-label="Live weather details"
        >
          <p className="weather-location">Khumbu, Nepal</p>
          {reading && (
            <>
              <p className="weather-condition">
                {Math.round(reading.temperature)}°C{" "}
                <span>{describeWeather(reading)}</span>
              </p>
              <p>
                Wind {Math.round(reading.wind)} km/h · Cloud cover{" "}
                {reading.cloud}%
              </p>
              <p>
                {live ? "Conditions for" : "Last received conditions:"}{" "}
                <time dateTime={new Date(reading.time).toISOString()}>
                  {nepalWeatherTime(reading.time)} NPT
                </time>
              </p>
            </>
          )}
          <p>
            {live
              ? "Current weather model data shapes the clouds, wind, rain, and snow. Refreshes every 15 minutes."
              : weather.status === "connecting"
                ? "Connecting to current local weather. The landscape is ready to explore."
                : "Current weather is unavailable. The landscape continues with simulated conditions and will reconnect automatically."}
          </p>
          <p className="weather-note">
            A rendered landscape synced to Nepal time, not a camera feed.
          </p>
          <p className="weather-source">
            Weather data:{" "}
            <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
              Open-Meteo
            </a>{" "}
            ·{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noreferrer"
            >
              CC BY 4.0
            </a>
            . Adapted for the scene.
          </p>
        </section>
      )}
    </div>
  );
}
