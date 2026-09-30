import { useId } from "react";

export function Sprout({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 21V12M12 16C4 16 3 9 3 6c6 0 10 3 9 10ZM12 12C12 5 16 3 21 3c0 6-3 10-9 9Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function NatureWorld({
  onDiscover,
  visited,
}: {
  onDiscover: (index: number) => void;
  visited: number[];
}) {
  const id = useId().replace(/:/g, "");
  return (
    <div className="world" aria-label="Interactive project landscape">
      <svg
        className="landscape"
        viewBox="0 0 820 620"
        fill="none"
        role="img"
        aria-labelledby={`${id}-title`}
      >
        <title id={`${id}-title`}>
          An illustrated mountain meadow, with a winding river, pine trees, a
          tiny cabin, and a curious rabbit.
        </title>
        <defs>
          <linearGradient
            id={`${id}-land`}
            x1="400"
            y1="200"
            x2="400"
            y2="570"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#c5d397" />
            <stop offset="1" stopColor="#95b67c" />
          </linearGradient>
          <linearGradient
            id={`${id}-water`}
            x1="450"
            y1="200"
            x2="340"
            y2="600"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#d1e8d4" />
            <stop offset="1" stopColor="#7eafb1" />
          </linearGradient>
          <pattern
            id={`${id}-grain`}
            width="13"
            height="13"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="3" cy="8" r=".6" fill="#24492b" opacity=".11" />
            <circle cx="11" cy="2" r=".5" fill="#fff" opacity=".5" />
          </pattern>
          <g id={`${id}-pine`}>
            <path d="M0 2v64" stroke="#5e6344" strokeWidth="4" />
            <path d="m0-24-22 39h10l-18 29h60L12 15h10Z" fill="#315d46" />
            <path d="m0-24 0 68h30L12 15h10Z" fill="#254c3b" />
            <path
              d="m-15 15 9-3m-16 21 15-4"
              stroke="#729165"
              strokeWidth="2"
            />
          </g>
          <g id={`${id}-round`}>
            <path d="M0 0v54" stroke="#6a6645" strokeWidth="5" />
            <path d="m0 36-13-16m13 7 10-17" stroke="#6a6645" strokeWidth="3" />
            <path
              d="M-24 9c-19-18-1-39 12-38C0-49 25-30 20-16c25 6 18 35 4 35C11 33-14 28-24 9Z"
              fill="#799554"
            />
            <path
              d="M-17-12c7-16 21-15 28-7"
              stroke="#a4b56a"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>
          <g
            id={`${id}-grass`}
            stroke="#638453"
            strokeWidth="1.7"
            strokeLinecap="round"
          >
            <path d="m0 0-3-6M1 0l3-8M5 0l3-4" />
          </g>
          <g id={`${id}-flower`}>
            <path d="M0 0v10" stroke="#6b874d" strokeWidth="1.7" />
            <circle cy="-2" r="5" fill="#f3ead0" />
            <circle cy="-2" r="2" fill="#c99945" />
          </g>
        </defs>
        <ellipse
          cx="437"
          cy="551"
          rx="293"
          ry="29"
          fill="#284a2c"
          opacity=".07"
        />
        <circle cx="548" cy="120" r="51" fill="#ebcf85" opacity=".7" />
        <circle
          cx="548"
          cy="120"
          r="65"
          stroke="#d5bc7b"
          strokeDasharray="2 8"
          opacity=".45"
        />
        <g className="cloud cloud-one" fill="#fffdf4" stroke="#e4e5d7">
          <path d="M177 121c-5-21 21-30 33-19 7-24 46-25 52-1 21-12 42 6 37 20Z" />
          <path d="M601 198c-3-12 11-20 23-14 4-22 37-24 44-2 21-6 29 8 29 16Z" />
        </g>
        <path d="m233 272 116-158 50 63 49-92 151 192Z" fill="#b4c4ac" />
        <path d="m349 114 50 63-28 29-33-15-35 39Z" fill="#809b84" />
        <path d="m448 85 151 192-126-40-18-73-18 34-20-16Z" fill="#7e9b84" />
        <path
          d="m349 114 25 32-15-3-11 12-12-6-21 14Zm99-29 42 53-25-8-14 14-10-17-23 14Z"
          fill="#f4f1df"
        />
        <path
          d="M111 307c42-59 98-71 175-63 74-43 135-25 204-1 47-38 89-39 128-9 79 0 146 56 161 121-8 98-100 179-211 198-118 31-254 2-365-26C92 502 57 416 111 307Z"
          fill={`url(#${id}-land)`}
        />
        <path
          d="M97 383c103-84 149-86 222-39 67 42 131 11 162-5 91-61 180-44 293 46-34 108-132 164-242 179-148 10-306-9-393-76-37-28-50-64-42-105Z"
          fill="#adc58a"
        />
        <path
          d="M490 247c-82 41-118 68-81 99 33 28 130 25 146 61 34 74-164 65-179 149l-83-9c16-81 221-98 211-134-9-32-99-22-139-68-29-39 40-84 92-110Z"
          fill="#e4dfb3"
        />
        <path
          d="M479 245c-61 39-102 70-68 102 34 29 124 24 139 62 22 57-155 73-183 145l-60-9c30-74 217-102 200-134-18-28-102-24-136-65-29-34 29-78 93-105Z"
          fill={`url(#${id}-water)`}
        />
        <g stroke="#e6efdc" strokeWidth="2" opacity=".7">
          <path d="m419 281 17-8m-47 38 10-8m-3 41 15 7m35 12 23 5m40 17 16 9m-11 41-31 11m-47 18-27 10m-48 21-20 13m-19 20-7 9" />
        </g>
        <path
          d="M228 506c-64-39-64-87-19-106s102 13 128-16 0-39-29-73"
          stroke="#eadbb0"
          strokeWidth="20"
          strokeLinecap="round"
        />
        <path
          d="M228 506c-64-39-64-87-19-106s102 13 128-16 0-39-29-73"
          stroke="#bdad7d"
          strokeWidth="1.5"
          strokeDasharray="3 8"
        />
        <path
          d="M98 384c-6 50 15 89 52 114M594 543c78-21 138-70 164-128"
          stroke="#71965d"
          strokeWidth="2"
          opacity=".5"
        />
        <g opacity=".6">
          <path
            d="m305 301 83-10M590 355l109 14M142 455l47 16M570 498l111-20"
            stroke="#89a66c"
          />
          <ellipse cx="617" cy="401" rx="53" ry="13" fill="#88a46b" />
        </g>
        <g className="trees">
          {[
            [195, 293, 0.8],
            [226, 270, 0.75],
            [178, 330, 0.92],
            [251, 303, 0.6],
            [589, 268, 0.75],
            [616, 291, 0.95],
            [652, 309, 0.73],
            [665, 365, 0.85],
            [704, 381, 0.95],
            [153, 407, 1.05],
            [129, 369, 0.85],
            [588, 480, 0.9],
            [629, 461, 1.12],
            [680, 449, 0.75],
            [255, 484, 0.65],
          ].map(([x, y, s], i) => (
            <use
              key={i}
              href={`#${id}-pine`}
              transform={`translate(${x} ${y}) scale(${s})`}
            />
          ))}
          <use
            href={`#${id}-round`}
            transform="translate(269 337) scale(.85)"
          />
          <use href={`#${id}-round`} transform="translate(548 493) scale(.8)" />
        </g>
        <g transform="translate(535 314)">
          <ellipse cx="0" cy="31" rx="42" ry="11" fill="#73945c" opacity=".3" />
          <path d="m-28-15 36-12 25 23-36 15Z" fill="#466448" />
          <path d="m-28-15 25 26v31l-25-17Z" fill="#e5c791" />
          <path d="m-3 11 36-15v30L-3 42Z" fill="#f4dfb0" />
          <path d="m-33-14 39-18 33 26-42 21Z" fill="#a26044" />
          <path d="m6-32 33 26-42 21 5-40Z" fill="#b77551" />
          <path d="m9 21 11-4v19L9 41Z" fill="#556347" />
          <path d="m-21 6 10 5v10l-10-5Z" fill="#627e62" />
          <path d="m14-22 0-19 8-3v27" fill="#b39169" />
          <g
            className="chimney-smoke"
            stroke="#faf7e8"
            strokeWidth="4"
            strokeLinecap="round"
            opacity=".8"
          >
            <path d="M19-50q-8-9 0-18t0-18" />
          </g>
        </g>
        <g transform="translate(377 332) rotate(-24)">
          <path d="M-32-7h64v26h-64Z" fill="#8a7753" />
          {[-26, -16, -6, 4, 14, 24].map((x) => (
            <path key={x} d={`M${x}-6v24`} stroke="#c1a576" strokeWidth="3" />
          ))}
          <path d="M-34-12h68M-34 23h68" stroke="#685b41" strokeWidth="4" />
        </g>
        {[
          [216, 355],
          [312, 436],
          [295, 491],
          [578, 441],
          [677, 407],
          [581, 286],
          [225, 462],
          [459, 488],
          [268, 273],
          [719, 425],
          [547, 285],
        ].map(([x, y], i) => (
          <use
            key={i}
            href={`#${id}-grass`}
            transform={`translate(${x} ${y})`}
          />
        ))}
        {[
          [231, 369],
          [245, 380],
          [298, 466],
          [284, 456],
          [563, 428],
          [581, 431],
          [667, 423],
          [227, 504],
          [459, 468],
          [470, 469],
        ].map(([x, y], i) => (
          <use
            key={i}
            href={`#${id}-flower`}
            transform={`translate(${x} ${y})`}
          />
        ))}
        <g fill="#8c9981">
          <ellipse cx="432" cy="287" rx="9" ry="5" />
          <ellipse cx="444" cy="291" rx="6" ry="4" />
          <path d="m456 522 6-12 18-2 12 16Z" />
          <path d="m184 470 9-11 12 3 7 12Z" />
        </g>
        <g className="rabbit" transform="translate(315 401)">
          <ellipse cx="0" cy="18" rx="18" ry="4" fill="#526e46" opacity=".2" />
          <g className="rabbit-body">
            <ellipse cy="3" rx="12" ry="10" fill="#fff7db" />
            <circle cx="11" cy="-4" r="9" fill="#fff7db" />
            <ellipse
              cx="9"
              cy="-18"
              rx="3.5"
              ry="12"
              fill="#fff7db"
              transform="rotate(-15 9 -18)"
            />
            <ellipse
              cx="17"
              cy="-16"
              rx="3"
              ry="11"
              fill="#fff7db"
              transform="rotate(15 17 -16)"
            />
            <path d="m10-23 1 9m7-7-1 8" stroke="#dcb6a0" strokeWidth="2" />
            <circle cx="14" cy="-5" r="1.5" fill="#344b38" />
            <circle cx="-12" cy="1" r="5" fill="#fff7db" />
            <path
              d="M-5 12h8m6-1h8"
              stroke="#f7edcc"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </g>
        </g>
        <g
          className="birds"
          stroke="#6d8061"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M321 93q8-7 15 0 7-8 14-2M621 145q6-6 12 0 6-7 12-2" />
        </g>
        <path
          d="M111 307c42-59 98-71 175-63 74-43 135-25 204-1 47-38 89-39 128-9 79 0 146 56 161 121-8 98-100 179-211 198-118 31-254 2-365-26C92 502 57 416 111 307Z"
          fill={`url(#${id}-grain)`}
          pointerEvents="none"
        />
        <g transform="translate(735 163)" stroke="#7d8b6b">
          <circle r="25" strokeDasharray="2 5" />
          <path d="m0-18-5 18h10Zm0 36-5-18h10Z" fill="#7d8b6b" stroke="none" />
          <text
            y="-35"
            textAnchor="middle"
            fill="#657459"
            stroke="none"
            fontSize="11"
            fontFamily="monospace"
          >
            N
          </text>
        </g>
      </svg>
      <span className="map-caption">A SMALL WORLD OF BIG CURIOSITIES</span>
      <button
        className={`map-pin pin-chess ${visited.includes(0) ? "discovered" : ""}`}
        onClick={() => onDiscover(0)}
      >
        <span className="pin-dot">{visited.includes(0) ? "✓" : "01"}</span>
        ChessStalker <span aria-hidden="true">↗</span>
      </button>
      <button
        className={`map-pin pin-eye ${visited.includes(1) ? "discovered" : ""}`}
        onClick={() => onDiscover(1)}
      >
        <span className="pin-dot">{visited.includes(1) ? "✓" : "02"}</span>A-Eye{" "}
        <span aria-hidden="true">↗</span>
      </button>
      <button
        className={`map-pin pin-sat ${visited.includes(2) ? "discovered" : ""}`}
        onClick={() => onDiscover(2)}
      >
        <span className="pin-dot">{visited.includes(2) ? "✓" : "03"}</span>SAT
        Policy Audit <span aria-hidden="true">↗</span>
      </button>
      <button
        className={`map-pin pin-music ${visited.includes(3) ? "discovered" : ""}`}
        onClick={() => onDiscover(3)}
      >
        <span className="pin-dot">{visited.includes(3) ? "✓" : "04"}</span>
        Sentiment → Music <span aria-hidden="true">↗</span>
      </button>
      <div className="world-hint">
        <span aria-hidden="true">✧</span> Follow your curiosity. Pick a place.
      </div>
    </div>
  );
}
