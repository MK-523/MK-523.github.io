import { memo } from "react";
import { locations, trees, WORLD } from "./park";
import { ExtendedGround, ExtendedBuildings } from "./ParkExpansion";
export const ParkGround = memo(function ParkGround() {
  return (
    <svg
      className="park-ground"
      width={WORLD.width}
      height={WORLD.height}
      viewBox={`0 0 ${WORLD.width} ${WORLD.height}`}
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="lawn"
          width="110"
          height="90"
          patternUnits="userSpaceOnUse"
        >
          <path
            fill="none"
            d="m17 22-3-5m3 5 4-6m62 41-3-5m3 5 4-6"
            stroke="#729b68"
            strokeWidth="1.4"
            opacity=".4"
          />
          <circle cx="43" cy="69" r="1.3" fill="#c6d8a7" />
          <circle cx="101" cy="16" r="1" fill="#689566" opacity=".5" />
        </pattern>
        <radialGradient id="lawn-light">
          <stop stopColor="#c0d3a1" />
          <stop offset="1" stopColor="#9abd89" />
        </radialGradient>
        <linearGradient id="pond-water" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#74aca4" />
          <stop offset="1" stopColor="#94c4b2" />
        </linearGradient>
        <pattern
          id="paving"
          width="28"
          height="22"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 21h28M14 0v21"
            fill="none"
            stroke="#c2b68e"
            strokeWidth=".7"
            opacity=".3"
          />
        </pattern>
      </defs>
      <rect width={WORLD.width} height={WORLD.height} fill="url(#lawn-light)" />
      <rect width={WORLD.width} height={WORLD.height} fill="url(#lawn)" />
      <path
        d="M0 0h1800v155c-193 39-296-44-467-28S949 157 762 129 384 182 0 143Z"
        fill="#88aa7a"
      />
      <ExtendedGround />
      <g stroke="#708b66" strokeWidth="5" opacity=".5">
        <path d="M100 172Q900 35 1720 180" fill="none" />
        {Array.from({ length: 25 }, (_, i) => (
          <path
            key={i}
            d={`M${100 + i * 66} ${165 - Math.sin((i / 24) * Math.PI) * 65}v-24`}
          />
        ))}
      </g>
      <path
        d="M315 1100Q355 972 498 927Q678 869 758 832Q863 773 1046 811Q1240 850 1480 905Q1645 916 1674 1017M440 510Q410 642 521 735Q574 783 758 832M440 510Q627 403 869 356Q1100 390 1305 505Q1357 645 1460 710Q1510 778 1480 905M560 714Q638 605 761 591H1220Q1291 570 1305 505M1046 811Q1100 838 1110 885"
        fill="none"
        stroke="#a6af7f"
        strokeWidth="67"
        strokeLinecap="round"
      />
      <path
        d="M315 1100Q355 972 498 927Q678 869 758 832Q863 773 1046 811Q1240 850 1480 905Q1645 916 1674 1017M440 510Q410 642 521 735Q574 783 758 832M440 510Q627 403 869 356Q1100 390 1305 505Q1357 645 1460 710Q1510 778 1480 905M560 714Q638 605 761 591H1220Q1291 570 1305 505M1046 811Q1100 838 1110 885"
        fill="none"
        stroke="#e2d6ad"
        strokeWidth="59"
        strokeLinecap="round"
      />
      <path
        d="M315 1100Q355 972 498 927Q678 869 758 832Q863 773 1046 811Q1240 850 1480 905M440 510Q410 642 521 735Q574 783 758 832M440 510Q627 403 869 356Q1100 390 1305 505"
        fill="none"
        stroke="#f1e5be"
        strokeWidth="2"
        strokeDasharray="2 13"
        opacity=".6"
      />
      <ellipse cx="963" cy="605" rx="260" ry="158" fill="#90b781" />
      <ellipse cx="963" cy="593" rx="242" ry="145" fill="#d6d7ad" />
      <ellipse cx="963" cy="590" rx="230" ry="133" fill="url(#pond-water)" />
      <path
        d="M782 544Q849 469 977 477M1158 631q-26 51-125 67"
        fill="none"
        stroke="#c4e0c5"
        strokeWidth="3"
        opacity=".65"
      />
      <g
        className="water-ripples"
        fill="none"
        stroke="#d4e8d2"
        strokeWidth="2"
        opacity=".55"
      >
        <path d="M881 519h36m104 13h44m-264 90h32m80 55h31m128-16h26M1042 561h30" />
        <ellipse cx="880" cy="646" rx="29" ry="6" />
        <ellipse cx="1083" cy="531" rx="23" ry="5" />
      </g>
      <g fill="#619469">
        <ellipse cx="821" cy="539" rx="16" ry="8" />
        <ellipse cx="843" cy="526" rx="12" ry="6" />
        <ellipse cx="1095" cy="674" rx="14" ry="7" />
      </g>
      <g className="park-ducks">
        <g transform="translate(890 642)">
          <ellipse cy="8" rx="14" ry="4" fill="#528b81" opacity=".3" />
          <ellipse rx="11" ry="6" fill="#fbefd0" />
          <circle cx="8" cy="-6" r="5" fill="#fbefd0" />
          <path d="m12-6 6 2-6 2Z" fill="#c49649" />
          <circle cx="10" cy="-7" r="1" fill="#435b48" />
        </g>
        <g transform="translate(1075 525) scale(.8)">
          <ellipse rx="11" ry="6" fill="#eee6c6" />
          <circle cx="8" cy="-6" r="5" fill="#486c4c" />
          <path d="m12-6 6 2-6 2Z" fill="#c49649" />
        </g>
      </g>
      <g>
        <path d="M725 557h480v71H725Z" fill="#74634b" />
        {Array.from({ length: 25 }, (_, i) => (
          <path
            fill="none"
            key={i}
            d={`M${731 + i * 19} 560v65`}
            stroke={i % 3 === 0 ? "#bca477" : "#cbb58a"}
            strokeWidth="16"
          />
        ))}
        <path
          fill="none"
          d="M719 554h492M719 630h492"
          stroke="#655d43"
          strokeWidth="6"
        />
        <path
          fill="none"
          d="M720 550h490M720 625h490"
          stroke="#dec9a0"
          strokeWidth="4"
        />
        {[733, 826, 925, 1025, 1123, 1200].map((x) => (
          <g key={x}>
            <path
              fill="none"
              d={`M${x} 553v-21M${x} 631v-21`}
              stroke="#695f43"
              strokeWidth="5"
            />
            <circle cx={x} cy="531" r="3" fill="#d3bd90" />
          </g>
        ))}
        <path fill="none" d="M733 534h467" stroke="#988361" strokeWidth="4" />
      </g>
      <g fill="#bed097" opacity=".6">
        <ellipse cx="595" cy="230" rx="94" ry="48" />
        <ellipse cx="1530" cy="554" rx="111" ry="57" />
        <ellipse cx="757" cy="998" rx="115" ry="50" />
      </g>
      {Array.from({ length: 80 }, (_, i) => {
        const x = 110 + ((i * 137) % 1570),
          y = 230 + ((i * 193) % 820);
        if ((x > 720 && x < 1220 && y > 450 && y < 750) || (i * 31) % 7 < 3)
          return null;
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <path
              fill="none"
              d="M0 2v8m4-5v5"
              stroke="#698b58"
              strokeWidth="1.5"
            />
            <circle r="3" fill={i % 3 ? "#f4edd0" : "#cc9baa"} />
            <circle cx="5" cy="4" r="2.5" fill="#ece4b1" />
            <circle r="1" fill="#bd9651" />
          </g>
        );
      })}
      <g transform="translate(350 815)">
        <ellipse rx="27" ry="10" fill="#58794b" opacity=".16" />
        <path
          fill="none"
          d="M-10-35v36m20-36V1"
          stroke="#6a6e4b"
          strokeWidth="5"
        />
        <path d="M-24-35h48v22h-48Z" fill="#a98d60" />
        <path fill="none" d="M-24-27h48" stroke="#dec59a" strokeWidth="2" />
        <path fill="none" d="M-28-7h56" stroke="#ab9064" strokeWidth="10" />
      </g>
      <g transform="translate(1390 601)">
        <ellipse rx="26" ry="9" fill="#58794b" opacity=".16" />
        <path
          fill="none"
          d="M-10-33v36m20-36V1"
          stroke="#6a6e4b"
          strokeWidth="5"
        />
        <path d="M-24-35h48v22h-48Z" fill="#a98d60" />
        <path fill="none" d="M-24-27h48" stroke="#dec59a" strokeWidth="2" />
        <path fill="none" d="M-28-7h56" stroke="#ab9064" strokeWidth="10" />
      </g>
      <g transform="translate(680 855)">
        <ellipse rx="21" ry="7" fill="#6e8652" opacity=".2" />
        <path fill="none" d="M0 0v-68" stroke="#80774d" strokeWidth="7" />
        <path d="M-34-67h68l10 12-10 12h-68Z" fill="#bba374" />
        <path d="M-35-36h64v20h-64l-9-10Z" fill="#bba374" />
        <text
          y="-52"
          textAnchor="middle"
          fontSize="8"
          fill="#46563e"
          fontFamily="sans-serif"
        >
          →
        </text>
        <text
          y="-22"
          textAnchor="middle"
          fontSize="8"
          fill="#46563e"
          fontFamily="sans-serif"
        >
          ←
        </text>
      </g>
      <g className="butterfly" transform="translate(700 400)">
        <path d="M0 0c-18-20-21 9 0 3C17-17 21 10 0 3Z" fill="#e9c680" />
        <path fill="none" d="M0-1v8" stroke="#627548" strokeWidth="2" />
      </g>
      <g className="butterfly second" transform="translate(1190 940)">
        <path d="M0 0c-18-20-21 9 0 3C17-17 21 10 0 3Z" fill="#d3a9b0" />
      </g>
    </svg>
  );
});
const Tree = memo(function Tree({ variant = 0 }: { variant?: number }) {
  return (
    <svg width="190" height="230" viewBox="0 0 190 230" aria-hidden="true">
      <ellipse cx="103" cy="205" rx="69" ry="19" fill="#466745" opacity=".15" />
      <path
        fill="none"
        d="M94 199v-103m0 68-26-29m26 13 24-30"
        stroke="#7c7751"
        strokeWidth="11"
        strokeLinecap="round"
      />
      {variant === 1 ? (
        <g>
          <path d="m94 9-53 83h24l-43 66h145l-44-66h26Z" fill="#496f4b" />
          <path d="m94 9 0 149h73l-44-66h26Z" fill="#365d44" />
          <path
            fill="none"
            d="m51 125 30-8m-15-45 19-7"
            stroke="#86a56a"
            strokeWidth="4"
          />
        </g>
      ) : (
        <g>
          <path
            d="M48 154c-44-9-43-58-13-75-5-45 34-70 62-48 35-25 79 5 70 41 44 23 24 77-8 80-28 30-91 31-111 2Z"
            fill={variant === 2 ? "#849b58" : "#65864e"}
          />
          <path
            d="M53 149c25 14 65 8 82-15 39 1 56-37 38-54 23 21 17 64-14 72-28 30-91 31-111 2Z"
            fill={variant === 2 ? "#728b4e" : "#4d7347"}
          />
          <path
            fill="none"
            d="M43 84c1-29 20-40 40-33m33-3c20-5 32 6 35 20"
            stroke={variant === 2 ? "#a7b76d" : "#91ab66"}
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            fill="none"
            d="M42 109c-7 11-6 19 0 27"
            stroke="#a9be79"
            strokeWidth="7"
            strokeLinecap="round"
            opacity=".5"
          />
        </g>
      )}
    </svg>
  );
});
export const ParkTrees = memo(function ParkTrees() {
  return (
    <>
      <ExtendedBuildings />
      {trees.map((t, i) => (
        <div
          key={i}
          className="park-tree"
          style={{
            left: t.x - 95 * t.scale,
            top: t.y - 205 * t.scale,
            width: 190 * t.scale,
            height: 230 * t.scale,
            zIndex: Math.round(t.y),
            transform: `scale(${t.scale})`,
            transformOrigin: "top left",
          }}
        >
          <Tree variant={t.variant} />
        </div>
      ))}
    </>
  );
});
function Workshop() {
  return (
    <svg viewBox="0 0 260 270" aria-hidden="true">
      <ellipse
        cx="138"
        cy="241"
        rx="104"
        ry="23"
        fill="#55734b"
        opacity=".15"
      />
      <path d="M43 104h164v127H43Z" fill="#e4d6ad" />
      <path d="m207 104 27 22v110l-27-5Z" fill="#c7be91" />
      <path d="m22 111 66-82h108l48 86Z" fill="#a3664c" />
      <path d="m88 29 108 0 48 86H153Z" fill="#b37c52" />
      <path fill="none" d="M22 113h222" stroke="#815b44" strokeWidth="7" />
      {[53, 77, 101, 125, 149, 173, 197, 221].map((x) => (
        <path
          fill="none"
          key={x}
          d={`m${x} 101 20-40`}
          stroke="#cf9a6b"
          strokeWidth="2"
          opacity=".6"
        />
      ))}
      <path d="M150 33V8h24v58" fill="#a48561" />
      <path fill="none" d="M147 8h30" stroke="#d1ba8b" strokeWidth="7" />
      <path d="M102 156q24-25 47 0v76h-47Z" fill="#6a7854" />
      <path d="M108 160q18-20 35 0v36h-35Z" fill="#afc6a0" />
      <path
        fill="none"
        d="M126 150v46m-18-20h35"
        stroke="#667956"
        strokeWidth="3"
      />
      <circle cx="140" cy="211" r="3" fill="#d7bc7b" />
      <g fill="#a9c5a2" stroke="#879a73" strokeWidth="5">
        <path d="M57 145h29v40H57Z" />
        <path d="M169 145h29v40h-29Z" />
      </g>
      <path
        fill="none"
        d="M56 166h31m-16-20v40m97-20h31m-16-20v40"
        stroke="#e3d7ae"
        strokeWidth="3"
      />
      <path d="M96 231h60v11H96Z" fill="#b2a17c" />
      <path d="M52 191h40v13H52m73-76h-27" fill="#937a54" />
      <g fill="#70894d">
        <circle cx="61" cy="186" r="9" />
        <circle cx="74" cy="182" r="11" />
        <circle cx="84" cy="188" r="7" />
      </g>
      <rect x="169" y="205" width="25" height="28" rx="3" fill="#9d7853" />
      <path
        fill="none"
        d="m169 208 25 23m0-23-25 23"
        stroke="#c4a271"
        strokeWidth="2"
      />
    </svg>
  );
}
function Greenhouse() {
  return (
    <svg viewBox="0 0 300 280" aria-hidden="true">
      <ellipse
        cx="157"
        cy="248"
        rx="130"
        ry="23"
        fill="#55734b"
        opacity=".15"
      />
      <path
        d="m27 119 113-94 132 90v127H27Z"
        fill="#a7c4ad"
        stroke="#637d63"
        strokeWidth="6"
      />
      <path d="m140 25 0 217h132V115Z" fill="#8caca0" />
      <path d="m27 119 113-94 132 90H27Z" fill="#c5d8ba" />
      <path
        fill="none"
        d="M27 119h245M140 25v217M65 88v154m38-184v184m74-191v191m45-160v160M27 178h245"
        stroke="#6f8768"
        strokeWidth="5"
      />
      <path fill="none" d="M27 241h245" stroke="#687e5a" strokeWidth="11" />
      <g fill="#698753">
        <path d="M52 236c-35-12-27-51-21-59 30 3 39 37 21 59Zm26 0c-20-26-3-51 10-54 19 21 11 46-10 54Zm145 0c-33-18-22-55-6-64 25 22 29 39 6 64Zm30 0c-6-34 12-48 28-47 4 29-7 42-28 47Z" />
      </g>
      <path
        d="M109 154q29-27 61 0v89h-61Z"
        fill="#d3ddbe"
        stroke="#60785e"
        strokeWidth="5"
      />
      <path d="M119 158h41v57h-41Z" fill="#91afa0" />
      <path fill="none" d="M139 155v61" stroke="#60785e" strokeWidth="3" />
      <circle cx="158" cy="227" r="3" fill="#6b7a54" />
      <path fill="none" d="M98 249h82" stroke="#afa482" strokeWidth="10" />
      <path
        fill="none"
        d="M55 98 124 45m48 10 66 45"
        stroke="#ecf0d7"
        strokeWidth="3"
        opacity=".8"
      />
      <g transform="translate(278 231)">
        <path fill="none" d="M0 0v-34" stroke="#687e54" strokeWidth="3" />
        <path
          d="M0-10c-23-1-23-23-23-23 17 0 22 11 23 23Zm0-12c20-2 20-23 20-23-15 1-21 13-20 23Z"
          fill="#749353"
        />
        <path d="M-12-2h25L7 19H-7Z" fill="#b6835e" />
      </g>
    </svg>
  );
}
function Lookout() {
  return (
    <svg viewBox="0 0 200 270" aria-hidden="true">
      <ellipse cx="99" cy="242" rx="73" ry="18" fill="#55734b" opacity=".15" />
      <path
        fill="none"
        d="m47 165-9 81m117-81 9 81M48 186h111M44 219h117"
        stroke="#8c8159"
        strokeWidth="9"
      />
      <path
        fill="none"
        d="m51 179 101 58m-1-58-105 58"
        stroke="#b2a174"
        strokeWidth="5"
      />
      <path d="M40 99h117v69H40Z" fill="#dfd8ab" />
      <path d="M41 100a58 58 0 0 1 116 0Z" fill="#829f88" />
      <path fill="none" d="M99 42v59" stroke="#557d68" strokeWidth="3" />
      <path
        fill="none"
        d="M34 99h129M29 171h139"
        stroke="#7c7756"
        strokeWidth="8"
      />
      <path fill="none" d="M64 132h68" stroke="#776d50" strokeWidth="8" />
      <path d="m77 130 47-19 5 13-48 19Z" fill="#8b8560" />
      <path
        fill="none"
        d="m105 132-8 34m5-34 17 32"
        stroke="#625f48"
        strokeWidth="4"
      />
      <path
        fill="none"
        d="M47 58q9-21 28-27"
        stroke="#b5c5a0"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path fill="none" d="M100 41V21" stroke="#736e52" strokeWidth="3" />
      <path d="m100 20 20 8-20 8Z" fill="#cfaf71" />
    </svg>
  );
}
function Grove() {
  return (
    <svg viewBox="0 0 220 160" aria-hidden="true">
      <ellipse cx="114" cy="126" rx="93" ry="19" fill="#55734b" opacity=".16" />
      <path
        fill="none"
        d="M45 125V66m125 59V66"
        stroke="#647551"
        strokeWidth="7"
      />
      <path d="M26 62h162v42H26Z" fill="#bc9a67" />
      {[68, 81, 94].map((y) => (
        <path
          fill="none"
          key={y}
          d={`M26 ${y}h162`}
          stroke="#e1c591"
          strokeWidth="5"
        />
      ))}
      <path fill="none" d="M23 112h168" stroke="#987d53" strokeWidth="11" />
      <path fill="none" d="M23 109h168" stroke="#d5b17a" strokeWidth="8" />
      <path d="m88 87 18-3 18 3v23l-18-4-18 4Z" fill="#f1e8c9" />
      <path fill="none" d="M106 84v22" stroke="#b3a480" strokeWidth="1.5" />
      <path
        fill="none"
        d="m93 90 8-1m-8 6 8-1m10-5 8 1m-8 5 8 1"
        stroke="#a39b7a"
      />
      <g transform="translate(176 116)">
        <path d="M0-15h18L15 2H4Z" fill="#d5c5a0" />
        <path
          d="M18-13q14 0 6 10h-7"
          fill="none"
          stroke="#d5c5a0"
          strokeWidth="3"
        />
      </g>
    </svg>
  );
}
function Postbox() {
  return (
    <svg viewBox="0 0 150 230" aria-hidden="true">
      <ellipse cx="79" cy="202" rx="48" ry="13" fill="#55734b" opacity=".18" />
      <path fill="none" d="M75 121v80" stroke="#8a7957" strokeWidth="13" />
      <path d="M38 76q0-36 35-36h19q34 0 34 36v66H38Z" fill="#8e5345" />
      <path d="M38 76q0-36 35-36t35 36v66H38Z" fill="#b87659" />
      <path
        fill="none"
        d="M49 91h47"
        stroke="#624a3c"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M52 63q19-19 36 0"
        stroke="#d39670"
        strokeWidth="5"
        fill="none"
      />
      <path d="M64 112h21v16H64Z" fill="#ead7ad" />
      <path d="m64 112 11 8 10-8" stroke="#ae8d65" fill="none" />
      <path
        d="M120 99V42h19v18h-19"
        fill="#e3bd79"
        stroke="#ddbb7c"
        strokeWidth="4"
      />
      <g transform="translate(25 193)">
        <path
          fill="none"
          d="m0 0-5-33m7 30 7-25"
          stroke="#6a8954"
          strokeWidth="3"
        />
        <circle cx="-5" cy="-36" r="8" fill="#e9d592" />
        <circle cx="9" cy="-29" r="6" fill="#d4a2a2" />
      </g>
    </svg>
  );
}
function Camp() {
  return (
    <svg viewBox="0 0 250 235" aria-hidden="true">
      <ellipse
        cx="126"
        cy="211"
        rx="103"
        ry="18"
        fill="#55734b"
        opacity=".17"
      />
      <path d="m35 177 83-131 93 136Z" fill="#d6b678" />
      <path d="m118 46 93 136-76 8Z" fill="#bb995f" />
      <path d="m35 177 51-81 49 94Z" fill="#7c7952" />
      <path d="m35 177 49-49 2-32-3 87Z" fill="#e4c991" />
      <path d="m86 96 49 94-26-10Z" fill="#c4a573" />
      <path fill="none" d="m118 46-2-21" stroke="#766b4b" strokeWidth="4" />
      <path
        fill="none"
        d="m48 155-27 29m174-24 34 30"
        stroke="#eee0b3"
        strokeWidth="2"
      />
      <g transform="translate(60 211)">
        <ellipse rx="26" ry="11" fill="#a8a58a" />
        <path
          fill="none"
          d="m-14 5 29-10m-27-1L13 6"
          stroke="#806b4a"
          strokeWidth="6"
        />
        <path
          className="camp-flame"
          d="M-10 0c-9-12 6-20 3-32 20 12 29 23 13 34Z"
          fill="#d99a57"
        />
        <path
          className="camp-flame"
          d="M-2 0c-5-9 5-14 4-21 12 13 13 20-4 21Z"
          fill="#e8c27a"
        />
      </g>
    </svg>
  );
}
export const ParkBuildings = memo(function ParkBuildings() {
  const arts = [Workshop, Greenhouse, Grove, Postbox, Camp, Lookout];
  const sizes = [
    [260, 270, 240],
    [300, 280, 245],
    [220, 160, 125],
    [150, 230, 202],
    [250, 235, 210],
    [200, 270, 242],
  ];
  return (
    <>
      {locations.map((l, i) => {
        const Art = arts[i];
        const [w, h, foot] = sizes[i];
        return (
          <div
            className={`park-building building-${l.id}`}
            key={l.id}
            style={{
              left: l.x - w / 2,
              top: l.y - foot,
              width: w,
              height: h,
              zIndex: l.y,
            }}
          >
            <Art />
          </div>
        );
      })}
    </>
  );
});
export function ParkCharacter({
  moving,
  facing,
}: {
  moving: boolean;
  facing: number;
}) {
  return (
    <svg
      viewBox="0 0 76 96"
      className={moving ? "character is-walking" : "character"}
      aria-hidden="true"
    >
      <ellipse cx="38" cy="84" rx="19" ry="7" fill="#33583e" opacity=".2" />
      <g
        className="character-person"
        style={{ transform: `scaleX(${facing})`, transformOrigin: "38px 50px" }}
      >
        <g className="leg leg-left">
          <path
            fill="none"
            d="M30 62v18"
            stroke="#3e5446"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            fill="none"
            d="M27 82h9"
            stroke="#594f3d"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </g>
        <g className="leg leg-right">
          <path
            fill="none"
            d="M46 62v18"
            stroke="#435f4c"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            fill="none"
            d="M43 82h9"
            stroke="#594f3d"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </g>
        <path
          fill="none"
          d="M20 44q-7 6-7 19"
          stroke="#b88d65"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          fill="none"
          d="M53 44q7 6 7 19"
          stroke="#b88d65"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <rect x="19" y="36" width="37" height="32" rx="10" fill="#d8ad65" />
        <path
          fill="none"
          d="M25 40v25m24-25v25"
          stroke="#aa8a50"
          strokeWidth="3"
        />
        <rect x="28" y="41" width="19" height="24" rx="5" fill="#6e825b" />
        <path fill="none" d="M30 46h15" stroke="#92a16d" strokeWidth="3" />
        <circle cx="38" cy="25" r="15" fill="#c99c72" />
        <path d="M23 24q-3-17 15-17 20 0 16 17l-11-5-11 4Z" fill="#4e4c36" />
        <path d="M17 14q20-17 42 0v8H17Z" fill="#e9d6a3" />
        <ellipse cx="38" cy="22" rx="27" ry="5" fill="#d9c28c" />
        <path
          fill="none"
          d="M23 13q17-9 31 0"
          stroke="#9e8e63"
          strokeWidth="4"
        />
      </g>
    </svg>
  );
}
