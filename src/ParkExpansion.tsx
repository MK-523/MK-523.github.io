import { memo } from "react";
import { orchardTrees, standingStones, trailPaths } from "./park";

export const ExtendedGround = memo(function ExtendedGround() {
  return (
    <>
      <path
        d="M1780 0H3000V1080Q2690 1200 2270 1020T1780 0Z"
        fill="#95b199"
        opacity=".6"
      />
      <path d="M0 1240Q620 1170 1010 1450L1100 2200H0Z" fill="#bfd09a" />
      <path d="M1080 1320Q1540 1150 2020 1410L2190 2200H1040Z" fill="#8eae86" />
      <path d="M2180 1240Q2550 1120 3000 1200V2200H2180Z" fill="#acc79e" />
      <path
        d={trailPaths}
        fill="none"
        stroke="#9eae7d"
        strokeWidth="66"
        strokeLinecap="round"
      />
      <path
        d={trailPaths}
        fill="none"
        stroke="#e0d5ad"
        strokeWidth="56"
        strokeLinecap="round"
      />
      <path
        d="M1950 900Q2080 1150 1980 1420Q1840 1530 1580 1850"
        fill="none"
        stroke="#f3e7be"
        strokeWidth="2"
        strokeDasharray="3 19"
      />
      <ellipse cx="2480" cy="505" rx="295" ry="192" fill="#819d80" />
      <ellipse cx="2480" cy="505" rx="277" ry="178" fill="#c9cfa8" />
      <ellipse cx="2480" cy="505" rx="270" ry="170" fill="url(#pond-water)" />
      <g className="water-ripples" fill="none" stroke="#d5e8d4" strokeWidth="3">
        <path d="M2280 510q180 50 370 0m-305 85q120 25 240-5M2350 440h40m120 175h30" />
        <ellipse cx="2460" cy="450" rx="100" ry="18" />
      </g>
      <ellipse cx="2570" cy="1550" rx="327" ry="243" fill="#8daa88" />
      <ellipse cx="2570" cy="1550" rx="310" ry="230" fill="#d9d6ad" />
      <ellipse cx="2570" cy="1550" rx="300" ry="220" fill="url(#pond-water)" />
      <path
        d="M2300 1500q15-105 175-125m260 300q-140 100-275 30"
        fill="none"
        stroke="#c9e0c4"
        strokeWidth="4"
      />
      <g className="water-ripples" stroke="#cde5cf" fill="none" strokeWidth="2">
        <path d="M2380 1610h70m-10 55h30m220-20h60m-30-170h35m-160 235h40" />
      </g>
      <ellipse cx="2570" cy="1480" rx="83" ry="70" fill="#789b6b" />
      <ellipse cx="2570" cy="1470" rx="76" ry="61" fill="#b8ce96" />
      <path d="M2250 1524h630v65h-630Z" fill="#73694f" />
      {Array.from({ length: 35 }, (_, i) => (
        <path
          key={i}
          d={`M${2258 + i * 18} 1527v59`}
          stroke={i % 3 ? "#c9b183" : "#b89e75"}
          strokeWidth="15"
        />
      ))}
      <path
        d="M2247 1523h636m-636 67h636"
        fill="none"
        stroke="#e0cca4"
        strokeWidth="5"
      />
      <path
        d="M2260 1510h240m140 0h225"
        fill="none"
        stroke="#8c7958"
        strokeWidth="5"
      />
      {Array.from({ length: 9 }, (_, i) => (
        <path
          key={i}
          d={`M${2260 + i * 75} 1510v24`}
          stroke="#887a57"
          strokeWidth="6"
        />
      ))}
      <ellipse
        cx="1580"
        cy="1660"
        rx="220"
        ry="150"
        fill="#7f9d77"
        opacity=".6"
      />
      <ellipse cx="1580" cy="1660" rx="153" ry="97" fill="#a3b78b" />
      <path
        d="m1560 1660 20-20 20 20-20 20Z"
        fill="none"
        stroke="#dce0b4"
        strokeWidth="5"
      />
      {Array.from({ length: 70 }, (_, i) => {
        const x = 160 + ((i * 179) % 2690),
          y = 1250 + ((i * 133) % 820);
        if (x > 2190 && y < 1800) return null;
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <path d="M0 0v9" stroke="#71895b" strokeWidth="2" />
            <circle r="4" fill={i % 2 ? "#d7acb5" : "#eee4b6"} />
            <circle r="1.3" fill="#b7954b" />
          </g>
        );
      })}
      {[
        { x: 2170, y: 840 },
        { x: 950, y: 1710 },
        { x: 1920, y: 1750 },
        { x: 2790, y: 1920 },
      ].map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y})`}>
          <ellipse rx="39" ry="14" fill="#658554" opacity=".2" />
          <path
            d="M-35-27h70m-70 11h70m-60 1v21m50-21v21"
            stroke="#ac9264"
            strokeWidth="9"
          />
          <path d="M-30-4h60" stroke="#d7bc85" strokeWidth="8" />
        </g>
      ))}
      <g transform="translate(730 1640)">
        <path d="M-42-30h84v62h-84Z" fill="#d9b0a6" />
        <path
          d="M-42-10h84m-84 20h84m-63-40v62m42-62v62"
          stroke="#ead5b1"
          strokeWidth="3"
        />
        <ellipse rx="13" ry="8" fill="#f5e4bf" />
        <circle cx="-6" cy="-3" r="4" fill="#b97052" />
        <circle cx="7" cy="0" r="4" fill="#b97052" />
      </g>
    </>
  );
});

export const ExtendedBuildings = memo(function ExtendedBuildings() {
  return (
    <>
      <svg
        className="expansion-object"
        style={{ left: 2190, top: 120, zIndex: 355 }}
        width="590"
        height="340"
        viewBox="0 0 590 340"
        aria-hidden="true"
      >
        <ellipse
          cx="290"
          cy="268"
          rx="250"
          ry="55"
          fill="#476e60"
          opacity=".23"
        />
        <path
          d="m30 213 42-106 63 20 28-72 84 11 26-48 80 13 27 52 95 19 57 119-79 49H89Z"
          fill="#7f9180"
        />
        <path
          d="m30 213 91-8 35-80 66 31 55-95 58 54 80-12 28 110 89 8-79 49H89Z"
          fill="#627c6c"
        />
        <path
          d="m85 132 51 9 27-57m245 66 48-9m-301 79 43-13m165 23 43-18"
          fill="none"
          stroke="#a7b29a"
          strokeWidth="8"
        />
        <path d="M228 110h115l12 151q-64 28-142-2Z" fill="#95c3bc" />
        <path
          className="waterfall-flow"
          d="M244 119v138m25-138v141m30-141v143m28-143v137"
          fill="none"
          stroke="#d2e8db"
          strokeWidth="8"
          strokeDasharray="27 13"
        />
        <ellipse
          className="water-ripples"
          cx="283"
          cy="271"
          rx="91"
          ry="20"
          fill="#c1e0d1"
          opacity=".7"
        />
        <path
          d="m115 201 32-11m266-10 37 8"
          stroke="#97af79"
          strokeWidth="15"
          strokeLinecap="round"
        />
      </svg>
      {orchardTrees.map((t, i) => (
        <svg
          key={i}
          className="expansion-object"
          style={{ left: t.x - 65, top: t.y - 140, zIndex: t.y }}
          width="130"
          height="165"
          viewBox="0 0 130 165"
          aria-hidden="true"
        >
          <ellipse
            cx="67"
            cy="145"
            rx="55"
            ry="15"
            fill="#7d9a65"
            opacity=".2"
          />
          <path
            d="M65 142V60m0 44L40 80m25 31 23-35"
            stroke="#8a7853"
            strokeWidth="8"
            fill="none"
          />
          <path
            d="M23 97C-5 79 10 44 27 42 29 5 80 7 89 29c44-3 52 39 31 55-2 43-79 45-97 13Z"
            fill={i % 3 ? "#a8b875" : "#d8b5b7"}
          />
          <path
            d="M30 94q-18-19-5-35m30-29q22-8 33 8"
            stroke={i % 3 ? "#c8d396" : "#e9cdca"}
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
          />
          {[
            [36, 62],
            [82, 82],
            [65, 43],
            [48, 94],
          ].map(([x, y], j) => (
            <g key={j}>
              <circle
                cx={x}
                cy={y}
                r="6"
                fill={i % 3 ? "#bc7952" : "#f2dfce"}
              />
              <path d={`M${x} ${y - 6}l3-5`} stroke="#6e8250" strokeWidth="2" />
            </g>
          ))}
        </svg>
      ))}
      {standingStones.map((t, i) => (
        <svg
          key={i}
          className="expansion-object"
          style={{ left: t.x - 40, top: t.y - 100, zIndex: t.y }}
          width="85"
          height="125"
          viewBox="0 0 85 125"
          aria-hidden="true"
        >
          <ellipse
            cx="45"
            cy="106"
            rx="37"
            ry="12"
            fill="#536e5b"
            opacity=".25"
          />
          <path
            d="m15 101 2-67 17-24 32 8 7 81-29 9Z"
            fill={i % 2 ? "#8f9e8d" : "#a5af99"}
          />
          <path d="m44 11-2 96 31-8-7-81Z" fill="#798d7f" />
          <path
            d="m26 52 13-15 10 20-12 8Z"
            stroke="#d0d7b9"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M18 91q17-12 33 3"
            stroke="#769765"
            strokeWidth="9"
            fill="none"
          />
        </svg>
      ))}
      <svg
        className="expansion-object"
        style={{ left: 2470, top: 1240, zIndex: 1480 }}
        width="200"
        height="270"
        viewBox="0 0 200 270"
        aria-hidden="true"
      >
        <ellipse
          cx="104"
          cy="242"
          rx="88"
          ry="21"
          fill="#536e4d"
          opacity=".18"
        />
        <path d="M30 115h140v123H30Z" fill="#a4b58c" />
        <path
          d="M30 115v125m140-125v125M65 128v110m70-110v110"
          stroke="#b8a57a"
          strokeWidth="10"
        />
        <path d="M22 237h156v14H22Z" fill="#bda77a" />
        <path d="m100 26-91 93h182Z" fill="#6e907d" />
        <path d="m100 26 12 91h79Z" fill="#547765" />
        <path d="M9 119h182" stroke="#d6c698" strokeWidth="8" />
        <path d="M100 26V5" stroke="#817653" strokeWidth="4" />
        <path d="M101 5h33l-10 9h-23Z" fill="#d3af66" />
        <path
          d="M56 196h88m-78 0v30m66-30v30"
          stroke="#8f865f"
          strokeWidth="8"
        />
        <circle cx="100" cy="135" r="9" fill="#ead7a0" />
      </svg>
    </>
  );
});
