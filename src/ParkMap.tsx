import {
  attractions,
  corePaths,
  discoveries,
  lakes,
  locations,
  trailPaths,
  WORLD,
  type Point,
} from "./park";
export function ParkMap({
  position,
  camera,
  viewport,
  visited,
  found,
  interactive = false,
  onGo,
}: {
  position: Point;
  camera: Point;
  viewport: Point;
  visited: string[];
  found: string[];
  interactive?: boolean;
  onGo?: (p: Point) => void;
}) {
  return (
    <svg
      viewBox={`0 0 ${WORLD.width} ${WORLD.height}`}
      aria-hidden={interactive ? undefined : true}
      role={interactive ? "img" : undefined}
      aria-label={
        interactive
          ? "Park map. Portfolio attractions are circles; outer attractions are diamonds. Choose a destination below or tap the map to walk."
          : undefined
      }
      onPointerDown={
        interactive
          ? (e) => {
              const r = e.currentTarget.getBoundingClientRect();
              onGo?.({
                x: ((e.clientX - r.left) / r.width) * WORLD.width,
                y: ((e.clientY - r.top) / r.height) * WORLD.height,
              });
            }
          : undefined
      }
    >
      <rect width={WORLD.width} height={WORLD.height} rx="120" fill="#b7cda0" />
      <path
        d="M1780 0h1220v1150H1780ZM1050 1250h1030v950H1050Z"
        fill="#98b397"
      />
      <path d="M0 1230h1000v970H0Z" fill="#d0d8a0" />
      <path
        d={corePaths + trailPaths}
        fill="none"
        stroke="#f0dfb5"
        strokeWidth="85"
        strokeLinecap="round"
      />
      {lakes.map((l, i) => (
        <g key={i}>
          <ellipse cx={l.x} cy={l.y} rx={l.rx} ry={l.ry} fill="#78aaa0" />
          {l.bridge && (
            <path
              d={`M${l.x - l.rx - 10} ${(l.bridge[0] + l.bridge[1]) / 2}h${l.rx * 2 + 20}`}
              stroke="#dac493"
              strokeWidth="45"
            />
          )}
        </g>
      ))}
      {locations.map((l) => (
        <circle
          key={l.id}
          cx={l.x}
          cy={l.y}
          r="33"
          fill={visited.includes(l.id) ? "#ae844c" : "#47674e"}
          stroke="#eef0d5"
          strokeWidth="9"
        />
      ))}
      {attractions.map((a) => (
        <path
          key={a.id}
          d={`m${a.x} ${a.y - 38} 38 38-38 38-38-38Z`}
          fill="#bc895f"
          stroke="#f6e7c6"
          strokeWidth="8"
        />
      ))}
      {discoveries
        .filter((d) => found.includes(d.id))
        .map((d) => (
          <circle
            key={d.id}
            cx={d.x}
            cy={d.y}
            r="28"
            fill="#eed986"
            stroke="#8e8855"
            strokeWidth="5"
          />
        ))}
      <rect
        x={camera.x}
        y={camera.y}
        width={viewport.x}
        height={viewport.y}
        fill="#fff9df"
        fillOpacity=".12"
        stroke="#f9f3d8"
        strokeWidth="12"
        rx="25"
      />
      <circle
        cx={position.x}
        cy={position.y}
        r="44"
        fill="#fff4c8"
        stroke="#375b45"
        strokeWidth="14"
      />
    </svg>
  );
}
