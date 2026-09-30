import { useCallback, useEffect, useRef, useState } from "react";
import { ParkGround, ParkTrees, ParkBuildings, ParkCharacter } from "./ParkArt";
import { ParkMap } from "./ParkMap";
import { ParkPanel } from "./ParkPanel";
import { Sprout } from "./NatureWorld";
import {
  cameraFor,
  attractions,
  discoveries,
  findPath,
  locations,
  nearestPlace,
  START,
  stepPosition,
  WORLD,
  type PlaceId,
  type Point,
} from "./park";

const keyVectors: Record<string, Point> = {
  ArrowUp: { x: 0, y: -1 },
  w: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  s: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  a: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  d: { x: 1, y: 0 },
};
export default function App() {
  const [position, setPosition] = useState<Point>(START);
  const pos = useRef<Point>(START),
    keys = useRef(new Set<string>()),
    route = useRef<Point[]>([]),
    pending = useRef<PlaceId | null>(null);
  const [target, setTarget] = useState<Point | null>(null),
    [walking, setWalking] = useState(false),
    [facing, setFacing] = useState(1);
  const [panel, setPanel] = useState<
      PlaceId | "directory" | "help" | "map" | null
    >(null),
    panelRef = useRef(panel);
  const [visited, setVisited] = useState<PlaceId[]>([]),
    [found, setFound] = useState<string[]>([]),
    [paused, setPaused] = useState(false),
    [reduced, setReduced] = useState(false);
  const [size, setSize] = useState({ width: 1440, height: 900 }),
    [message, setMessage] = useState(
      "Use arrow keys or WASD to walk. Directory opens portfolio sections.",
    );
  const stage = useRef<HTMLDivElement>(null),
    dialog = useRef<HTMLDialogElement>(null),
    returnFocus = useRef<HTMLElement | null>(null);
  const scale = Math.max(
    size.width / WORLD.width,
    size.height / WORLD.height,
    size.width < 600
      ? 0.74
      : size.width < 1000
        ? 0.84
        : Math.max(0.82, Math.min(1, size.width / 1600)),
  );
  const camera = cameraFor(position, size.width, size.height, scale);
  const nearby = nearestPlace(position);
  const stop = useCallback(() => {
    keys.current.clear();
    route.current = [];
    pending.current = null;
    setTarget(null);
    setWalking(false);
  }, []);
  const open = useCallback(
    (id: PlaceId | "directory" | "help" | "map") => {
      stop();
      returnFocus.current = document.activeElement as HTMLElement;
      panelRef.current = id;
      setPanel(id);

      if (id !== "directory" && id !== "help" && id !== "map")
        setVisited((v) => (v.includes(id) ? v : [...v, id]));
    },
    [stop],
  );
  const close = useCallback(() => {
    dialog.current?.close();
    panelRef.current = null;
    setPanel(null);
    keys.current.clear();
    const previous = returnFocus.current;
    if (
      previous?.isConnected &&
      previous !== document.body &&
      !previous.closest("dialog")
    )
      previous.focus();
    else stage.current?.focus();
  }, []);
  const go = useCallback((point: Point, id: PlaceId | null = null) => {
    const path = findPath(pos.current, point);
    keys.current.clear();
    route.current = path;
    pending.current = id;
    setTarget(path.length ? path[path.length - 1] : null);

    stage.current?.focus();
    if (!path.length) {
      setMessage("Choose a clear spot on the path.");
      return;
    }
    setMessage(
      id
        ? `Walking to ${locations.find((l) => l.id === id)!.name.toLowerCase()}…`
        : "Walking.",
    );
  }, []);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const update = () => {
      const box = stage.current?.getBoundingClientRect();
      if (box) setSize({ width: box.width, height: box.height });
    };
    update();
    const observer = new ResizeObserver(update);
    if (stage.current) observer.observe(stage.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (panel && dialog.current) {
      if (!dialog.current.open) dialog.current.showModal();
      dialog.current.querySelector<HTMLButtonElement>("button")?.focus();
    }
  }, [panel]);
  useEffect(() => {
    const raw = location.hash.slice(1);
    if (locations.some((l) => l.id === raw)) open(raw as PlaceId);
    const hash = () => {
      const id = location.hash.slice(1);
      if (locations.some((l) => l.id === id)) open(id as PlaceId);
    };
    addEventListener("hashchange", hash);
    return () => removeEventListener("hashchange", hash);
  }, [open]);
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (panelRef.current || e.altKey || e.ctrlKey || e.metaKey) return;
      const node = e.target as HTMLElement;
      if (node.closest("button,a,input,summary")) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (keyVectors[k]) {
        e.preventDefault();
        keys.current.add(k);
        route.current = [];
        pending.current = null;
        setTarget(null);
      }
      if ((k === "e" || k === "Enter") && nearestPlace(pos.current)) {
        e.preventDefault();
        open(nearestPlace(pos.current)!.id);
      }
      if (k === "Escape") {
        stop();
        setMessage("Walk stopped.");
      }
    };
    const up = (e: KeyboardEvent) =>
      keys.current.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key);
    const clear = () => stop();
    const visibility = () => {
      if (document.hidden) clear();
    };
    addEventListener("keydown", down);
    addEventListener("keyup", up);
    addEventListener("blur", clear);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      removeEventListener("keydown", down);
      removeEventListener("keyup", up);
      removeEventListener("blur", clear);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [open, stop]);
  useEffect(() => {
    let frame = 0,
      last = 0,
      wasWalking = false;
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000 || 0, 0.035);
      last = now;
      let dx = 0,
        dy = 0,
        active = false;
      if (!panelRef.current && !document.hidden) {
        keys.current.forEach((k) => {
          dx += keyVectors[k]?.x || 0;
          dy += keyVectors[k]?.y || 0;
        });
        if (dx || dy) {
          const length = Math.hypot(dx, dy);
          dx = (dx / length) * 210 * dt;
          dy = (dy / length) * 210 * dt;
          active = true;
        } else if (route.current.length) {
          const t = route.current[0],
            distance = Math.hypot(t.x - pos.current.x, t.y - pos.current.y),
            step = 210 * dt;
          if (distance <= step + 1) {
            pos.current = t;
            setPosition(t);
            route.current.shift();
            if (!route.current.length) {
              setTarget(null);
              const dest = pending.current;
              pending.current = null;
              if (dest) {
                setMessage(
                  `Arrived at ${locations.find((l) => l.id === dest)!.name.toLowerCase()}.`,
                );
                open(dest);
              } else setMessage("Arrived.");
            }
          } else {
            dx = ((t.x - pos.current.x) / distance) * step;
            dy = ((t.y - pos.current.y) / distance) * step;
            active = true;
          }
        }
        if (dx || dy) {
          const next = stepPosition(pos.current, dx, dy);
          active = next.x !== pos.current.x || next.y !== pos.current.y;
          pos.current = next;
          setPosition(next);
          if (Math.abs(dx) > 0.2) setFacing(dx > 0 ? 1 : -1);
          if (!active && route.current.length) {
            route.current = [];
            pending.current = null;
            setTarget(null);
            setMessage("Try a clear spot on the path.");
          }
        }
      }
      if (active !== wasWalking) {
        wasWalking = active;
        setWalking(active);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [open]);
  useEffect(() => {
    const collected = discoveries.filter(
      (d) =>
        !found.includes(d.id) &&
        Math.hypot(position.x - d.x, position.y - d.y) < 45,
    );
    if (collected.length) {
      setFound((v) => [...new Set([...v, ...collected.map((d) => d.id)])]);
      setMessage(`${collected.map((d) => d.name).join(", ")} collected.`);
    }
  }, [position, found]);
  function directionDown(
    key: string,
    e: React.PointerEvent<HTMLButtonElement>,
  ) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    keys.current.clear();
    keys.current.add(key);
    route.current = [];
    pending.current = null;
    setTarget(null);
  }
  function directionUp() {
    keys.current.clear();
  }
  function direct(id: PlaceId) {
    open(id);
  }
  return (
    <main className={`park-app ${paused || reduced ? "park-still" : ""}`}>
      <h1 className="sr-only">
        Mahesh Karthikeyan’s explorable portfolio park
      </h1>
      <div
        ref={stage}
        className="park-stage"
        tabIndex={0}
        role="region"
        aria-label="Explore the park. Use arrow keys or W A S D to walk. Press E near a place to visit. Click or tap a place to walk there."
        onPointerDown={(e) => {
          if (e.button !== 0 || (e.target as HTMLElement).closest("button,a"))
            return;
          const box = e.currentTarget.getBoundingClientRect();
          go({
            x: (e.clientX - box.left) / scale + camera.x,
            y: (e.clientY - box.top) / scale + camera.y,
          });
        }}
      >
        <div
          className="park-world"
          style={{
            width: WORLD.width,
            height: WORLD.height,
            transform: `translate(${-camera.x * scale}px,${-camera.y * scale}px) scale(${scale})`,
          }}
        >
          <ParkGround />
          <ParkTrees />
          <ParkBuildings />
          {target && (
            <div
              className="destination-marker"
              style={{ left: target.x, top: target.y }}
              aria-hidden="true"
            >
              <span />
            </div>
          )}
          {locations.map((l) => (
            <button
              key={l.id}
              className={`place-sign place-${l.id} ${visited.includes(l.id) ? "is-visited" : ""}`}
              style={{ left: l.x, top: l.y + 35 }}
              onClick={() => go(l.entrance, l.id)}
              aria-label={`Walk to ${l.name}: ${l.category}`}
              tabIndex={
                (l.x - camera.x) * scale > 100 &&
                (l.x - camera.x) * scale < size.width - 100 &&
                (l.y + 35 - camera.y) * scale > 85 &&
                (l.y + 95 - camera.y) * scale < size.height - 120
                  ? 0
                  : -1
              }
            >
              <span className="place-icon">
                {visited.includes(l.id) ? "✓" : l.icon}
              </span>
              <span>
                <strong>{l.name}</strong>
                <small>{l.category}</small>
              </span>
              <span className="place-arrow">↗</span>
            </button>
          ))}
          {attractions.map((a) => (
            <button
              key={a.id}
              className="place-sign attraction-sign"
              style={{ left: a.x, top: a.y + 52 }}
              aria-label={`Walk to ${a.name}`}
              tabIndex={
                (a.x - camera.x) * scale > 100 &&
                (a.x - camera.x) * scale < size.width - 100 &&
                (a.y + 52 - camera.y) * scale > 85 &&
                (a.y + 112 - camera.y) * scale < size.height - 120
                  ? 0
                  : -1
              }
              onClick={() => go(a)}
            >
              <span className="place-icon">{a.icon}</span>
              <strong>{a.name}</strong>
              <span>↗</span>
            </button>
          ))}
          {discoveries.map((d) => (
            <div
              key={d.id}
              className={`park-discovery ${found.includes(d.id) ? "collected" : ""}`}
              style={{ left: d.x, top: d.y - 26, zIndex: d.y + 2 }}
              aria-hidden="true"
            >
              {found.includes(d.id) ? "✓" : d.icon}
            </div>
          ))}
          <div
            className="player"
            data-x={position.x.toFixed(1)}
            data-y={position.y.toFixed(1)}
            style={{
              left: position.x - 38,
              top: position.y - 84,
              zIndex: Math.round(position.y) + 1,
            }}
          >
            <ParkCharacter moving={walking} facing={facing} />
          </div>
          {nearby && !panel && !walking && (
            <button
              className="interact-bubble"
              style={{ left: position.x, top: position.y - 125 }}
              onClick={() => open(nearby.id)}
            >
              <kbd>E</kbd> Visit {nearby.name.toLowerCase()}
            </button>
          )}
        </div>
        <div className="park-vignette" aria-hidden="true" />
      </div>
      <header className="park-header">
        <a
          className="park-brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            stop();
            pos.current = START;
            setPosition(START);

            stage.current?.focus();
          }}
          aria-label="Return to park entrance"
        >
          <span>
            <Sprout />
          </span>
          <span>mahesh’s park</span>
        </a>
        <div className="park-header-actions">
          <div
            className="park-progress"
            aria-label={`${visited.length} of 6 places visited`}
          >
            <span aria-hidden="true">✧</span>
            <span>
              {visited.length}
              <i>/6</i>
            </span>
          </div>
          <button
            className="directory-button"
            onClick={() => open("directory")}
          >
            <span aria-hidden="true">☷</span> Directory
          </button>
          <button
            className="help-button"
            aria-label="How to explore"
            onClick={() => open("help")}
          >
            ?
          </button>
        </div>
      </header>
      <div className="park-bottom">
        <div className="park-controls">
          <span className="keyboard-instructions">
            <kbd>W</kbd>
            <span className="key-row">
              <kbd>A</kbd>
              <kbd>S</kbd>
              <kbd>D</kbd>
            </span>
          </span>
          <span className="controls-text">
            <strong>Controls</strong>
            <span>
              <span className="desktop-instruction">
                WASD / arrow keys to walk ·{" "}
              </span>
              Tap a place to visit
            </span>
          </span>
          <button
            className="motion-control"
            onClick={() => setPaused(!paused)}
            aria-pressed={paused || reduced}
            disabled={reduced}
            aria-label={
              reduced
                ? "Motion off — system preference"
                : paused
                  ? "Turn ambient motion on"
                  : "Turn ambient motion off"
            }
          >
            {paused || reduced ? "▷" : "Ⅱ"}
            <span>Motion</span>
          </button>
        </div>
        <button
          className="return-entrance"
          onClick={() => {
            stop();
            pos.current = START;
            setPosition(START);
            setMessage("Back at the park entrance.");
            stage.current?.focus();
          }}
          aria-label="Return to park entrance"
        >
          ⌖<span>Recenter</span>
        </button>
      </div>
      <div className="touch-pad" aria-label="Walking controls">
        {[
          ["ArrowUp", "↑", "north"],
          ["ArrowLeft", "←", "west"],
          ["ArrowDown", "↓", "south"],
          ["ArrowRight", "→", "east"],
        ].map(([key, label, dir]) => (
          <button
            key={key}
            className={`walk-${dir}`}
            aria-label={`Walk ${dir}`}
            onPointerDown={(e) => directionDown(key, e)}
            onPointerUp={directionUp}
            onPointerCancel={directionUp}
            onLostPointerCapture={directionUp}
            onBlur={directionUp}
            onClick={(e) => {
              if (e.detail === 0) {
                const v = keyVectors[key];
                go({
                  x: pos.current.x + v.x * 48,
                  y: pos.current.y + v.y * 48,
                });
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <button
        className="park-minimap"
        aria-label="Open park map"
        onClick={() => open("map")}
      >
        <ParkMap
          position={position}
          camera={camera}
          viewport={{ x: size.width / scale, y: size.height / scale }}
          visited={visited}
          found={found}
        />
        <span>
          Map{" "}
          <span>
            ◇ {found.length}/{discoveries.length} · N ↑
          </span>
        </span>
      </button>
      <div className="park-status sr-only" role="status" aria-live="polite">
        {message}
      </div>
      {panel && (
        <dialog
          className="park-dialog"
          ref={dialog}
          aria-labelledby="park-panel-title"
          onCancel={(e) => {
            e.preventDefault();
            close();
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          onKeyDown={(e) => {
            if (e.key !== "Tab") return;
            const all = Array.from(
              e.currentTarget.querySelectorAll<HTMLElement>(
                "button,a[href],summary",
              ),
            ).filter(
              (el) =>
                !el.closest("details:not([open])") || el.tagName === "SUMMARY",
            );
            const first = all[0],
              last = all[all.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last?.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first?.focus();
            }
          }}
        >
          <div className="park-dialog-inner">
            <div className="park-dialog-top">
              <button
                className="park-close"
                onClick={close}
                aria-label="Close and return to park"
                autoFocus
              >
                ×
              </button>
              <span>
                <Sprout />{" "}
                <button
                  className="panel-tab"
                  onClick={() => open("directory")}
                  aria-pressed={panel === "directory"}
                >
                  ☷ Directory
                </button>
                <button
                  className="panel-tab"
                  onClick={() => open("map")}
                  aria-pressed={panel === "map"}
                >
                  ⌖ Map
                </button>
              </span>
            </div>
            {panel === "directory" ? (
              <>
                <h2 id="park-panel-title">Directory</h2>
                <div className="directory-list">
                  {locations.map((l) => (
                    <div key={l.id}>
                      <button
                        aria-label={`Open ${l.category}`}
                        onClick={() => direct(l.id)}
                      >
                        <span className="directory-icon">{l.icon}</span>
                        <span>
                          <strong>{l.category}</strong>
                          <small>{l.name}</small>
                        </span>
                        <span>{visited.includes(l.id) ? "✓" : "↗"}</span>
                      </button>
                      <button
                        className="walk-there"
                        onClick={() => {
                          close();
                          go(l.entrance, l.id);
                        }}
                        aria-label={`Walk to ${l.name}`}
                      >
                        Walk there →
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : panel === "map" ? (
              <>
                <h2 id="park-panel-title">Map</h2>
                <div className="expanded-map">
                  <ParkMap
                    position={position}
                    camera={camera}
                    viewport={{ x: size.width / scale, y: size.height / scale }}
                    visited={visited}
                    found={found}
                    interactive
                    onGo={(p) => {
                      close();
                      go(p);
                    }}
                  />
                </div>
                <div className="map-destinations">
                  {attractions.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => {
                        close();
                        go(a);
                      }}
                      aria-label={`Walk to ${a.name}`}
                    >
                      <span>{a.icon}</span>
                      {a.name}
                      <span>↗</span>
                    </button>
                  ))}
                </div>
                <div className="map-portfolio">
                  {locations.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => {
                        close();
                        go(l.entrance, l.id);
                      }}
                      aria-label={`Walk to ${l.name}`}
                    >
                      <span>{l.icon}</span>
                      {l.name}
                    </button>
                  ))}
                </div>
                <div
                  className="discovery-inventory"
                  aria-label={`${found.length} of ${discoveries.length} collectibles found`}
                >
                  {discoveries.map((d) => (
                    <span
                      key={d.id}
                      className={found.includes(d.id) ? "found" : ""}
                      title={found.includes(d.id) ? d.name : "Undiscovered"}
                      aria-label={
                        found.includes(d.id)
                          ? `${d.name} collected`
                          : "Undiscovered collectible"
                      }
                    >
                      {found.includes(d.id) ? d.icon : "?"}
                    </span>
                  ))}
                  <small>
                    {found.length}/{discoveries.length}
                  </small>
                </div>
              </>
            ) : panel === "help" ? (
              <>
                <h2 id="park-panel-title">Controls</h2>
                <ol className="help-list">
                  <li>
                    <strong>Walk</strong>
                    <p>
                      Use WASD or the arrow keys. On a phone, hold the direction
                      buttons. Click or tap the ground to walk to a spot.
                    </p>
                  </li>
                  <li>
                    <strong>Visit</strong>
                    <p>
                      Click a place’s sign to walk there and open it. Or walk up
                      yourself and press E or Enter when the visit prompt
                      appears.
                    </p>
                  </li>
                  <li>
                    <strong>Directory & map</strong>
                    <p>
                      Directory opens portfolio sections immediately. The map
                      selects walking destinations across the park. Escape
                      closes a panel or stops a walk. Walk close to a
                      collectible to pick it up.
                    </p>
                  </li>
                </ol>
                <p className="help-footnote">
                  Use bridges to cross water. The motion control and your system
                  preference disable decorative animation.
                </p>
                <button className="park-external" onClick={close}>
                  Back to the park →
                </button>
              </>
            ) : (
              <ParkPanel key={panel} place={panel} />
            )}
            <div className="panel-bottom-note">
              MAHESH KARTHIKEYAN <span>UCLA · COMPUTER SCIENCE · 2028</span>
            </div>
          </div>
        </dialog>
      )}
    </main>
  );
}
