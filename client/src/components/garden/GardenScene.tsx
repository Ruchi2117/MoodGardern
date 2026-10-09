import { useId } from "react";
import { VISIBLE_PLANT_LIMIT } from "../../../../shared/moods.js";
import type { MoodEntry } from "../../services/api";
import GardenPlant, { PLANT_POSITIONS } from "./GardenPlant";

function Sprig({
  x,
  y,
  scale = 1,
  color = "#71885d",
}: {
  x: number;
  y: number;
  scale?: number;
  color?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g className="scene-sprig">
        <path
          d="M0 0 Q-5-30 1-63"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M-2-20Q-34-22-27-43Q-5-44-2-20M-2-36Q25-35 25-55Q2-57-2-36"
          fill={color}
        />
        <path d="M-2-26L-22-38M1-42L18-50" stroke="#d3dfb7" strokeWidth="1" />
      </g>
    </g>
  );
}
function Flower({
  x,
  y,
  color,
  scale = 1,
}: {
  x: number;
  y: number;
  color: string;
  scale?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g className="scene-sprig">
        <path d="M0 0Q9-32 0-65" stroke="#81956a" strokeWidth="3" fill="none" />
        <path
          d="M3-21Q-24-25-19-40Q1-37 3-21M5-30Q25-47 26-32Q21-22 5-30"
          fill="#91a77a"
        />
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <ellipse
            key={angle}
            cx="0"
            cy="-77"
            rx="8"
            ry="12"
            fill={color}
            transform={`rotate(${angle} 0 -65)`}
          />
        ))}
        <circle cy="-65" r="7" fill="#e5c875" />
      </g>
    </g>
  );
}

// The scene is presentational and isolated so a future 3D renderer can replace it.
export default function GardenScene({
  variant = "starter",
  entries = [],
  plantedId = null,
}: {
  variant?: "starter" | "botanical";
  entries?: MoodEntry[];
  plantedId?: string | null;
}) {
  const id = useId().replace(/:/g, "");
  const start = Math.max(0, entries.length - VISIBLE_PLANT_LIMIT);
  const plants = entries
    .slice(start)
    .map((entry, index) => ({
      entry,
      position: PLANT_POSITIONS[(start + index) % VISIBLE_PLANT_LIMIT],
    }))
    .sort((a, b) => a.position[1] - b.position[1]);
  return (
    <div
      className={`sanctuary-scene scene-${variant}`}
      role="img"
      aria-label={
        entries.length
          ? `Your garden: ${entries.length} ${entries.length === 1 ? "feeling" : "feelings"} planted. ${plants.map(({ entry }) => entry.mood).join(", ")}.`
          : variant === "starter"
            ? "A quiet starter garden with a seed, tiny leaves, sunlight, and a butterfly"
            : "A botanical garden with pink flowers, lavender, and soft sunlight"
      }
    >
      <svg viewBox="0 0 1000 440" aria-hidden="true">
        <defs>
          <radialGradient id={`${id}-sky`}>
            <stop stopColor="#e7ebd8" />
            <stop offset="1" stopColor="#f8f7ef" />
          </radialGradient>
          <linearGradient id={`${id}-soil`} x2="0" y2="1">
            <stop stopColor="#d8bea0" />
            <stop offset="1" stopColor="#c2a180" />
          </linearGradient>
          <linearGradient id={`${id}-grass`} x2="0" y2="1">
            <stop stopColor="#d2dcae" />
            <stop offset="1" stopColor="#b5c491" />
          </linearGradient>
        </defs>
        <ellipse cx="500" cy="230" rx="460" ry="220" fill={`url(#${id}-sky)`} />
        <g className="scene-sun">
          <circle cx="690" cy="88" r="55" fill="#f0e4ab" opacity=".35" />
          <circle cx="690" cy="88" r="33" fill="#eddc9b" />
          <path
            d="M690 39V29M739 88H750M690 137V147M641 88H630M725 53L733 45M725 123L733 131M655 53L647 45M655 123L647 131"
            stroke="#dbc789"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
        <g className="scene-cloud" fill="#fffdf4" opacity=".85">
          <path d="M230 100Q216 83 235 77Q239 52 263 63Q280 52 291 76Q318 80 307 100Z" />
          <path d="M786 162Q773 150 786 143Q790 125 807 134Q823 120 835 143Q854 145 847 162Z" />
        </g>
        <path
          d="M120 288Q212 192 325 239Q441 166 572 239Q707 181 861 280Q928 330 788 360H218Q88 348 120 288Z"
          fill="#e3e7d2"
        />
        <ellipse
          cx="505"
          cy="356"
          rx="328"
          ry="37"
          fill="#899773"
          opacity=".09"
        />
        <path
          d="M202 280Q289 215 449 233Q623 203 774 276L786 318Q651 387 431 366Q263 374 205 319Z"
          fill={`url(#${id}-soil)`}
        />
        <ellipse
          cx="494"
          cy="278"
          rx="291"
          ry="77"
          fill={`url(#${id}-grass)`}
        />
        <path
          d="M303 263Q377 226 500 240Q628 224 693 270Q665 329 499 328Q351 330 303 288Z"
          fill="#bda183"
        />
        <path
          d="M322 267Q397 243 488 254Q615 238 674 273Q630 308 497 309Q381 310 322 279Z"
          fill="#cbb294"
        />
        <g fill="#a48c71" opacity=".6">
          {[
            [352, 277],
            [408, 289],
            [469, 263],
            [532, 290],
            [601, 270],
            [645, 281],
            [487, 301],
          ].map(([x, y]) => (
            <ellipse key={x} cx={x} cy={y} rx="3" ry="1.5" />
          ))}
        </g>
        <g fill="#e7e1cc" stroke="#c8c8ad" strokeWidth="1">
          <ellipse
            cx="600"
            cy="328"
            rx="23"
            ry="10"
            transform="rotate(-10 600 328)"
          />
          <ellipse cx="640" cy="343" rx="26" ry="11" />
          <ellipse cx="685" cy="354" rx="26" ry="10" />
        </g>
        <Sprig x={265} y={289} scale={0.75} />
        <Sprig x={721} y={292} scale={0.9} color="#8ba073" />
        <Sprig x={345} y={337} scale={0.45} />
        <Sprig x={634} y={238} scale={0.4} />
        {entries.length === 0 && (
          <g transform="translate(496 282)">
            <ellipse cy="5" rx="21" ry="5" fill="#ad9277" opacity=".45" />
            <path d="M-10 2Q-17-14 0-22Q19-9 10 2Q0 12-10 2Z" fill="#866447" />
            <path
              d="M0-16Q-5-7 1 2"
              stroke="#c7a07b"
              fill="none"
              strokeWidth="2"
            />
          </g>
        )}
        <g transform="translate(787 265) rotate(7)">
          <path d="M0 0V55" stroke="#a88966" strokeWidth="5" />
          <rect
            x="-40"
            y="-17"
            width="80"
            height="32"
            rx="4"
            fill="#f4e9cf"
            stroke="#bda987"
            strokeWidth="2"
          />
          <text
            textAnchor="middle"
            y="3"
            fontFamily="Georgia,serif"
            fontSize="12"
            fill="#7d785b"
            fontStyle="italic"
          >
            let it grow
          </text>
        </g>
        <g stroke="#93a67c" strokeWidth="2" fill="none" strokeLinecap="round">
          <path d="M230 319l-6-10m6 10l6-13M385 226l-5-10m5 10l6-9M737 325l-6-9m6 9l4-12M559 350l-4-8m4 8l5-8" />
        </g>
        <g fill="#d7b2ae">
          <circle cx="286" cy="308" r="4" />
          <circle cx="707" cy="319" r="4" />
        </g>
        <g className="scene-butterfly" transform="translate(584 165)">
          <g className="butterfly-wings">
            <path
              d="M0 0Q-38-32-31-6Q-32 12-4 8Q-21 32-8 26Q5 23 0 0"
              fill="#cab5d0"
            />
            <path
              d="M0 0Q38-32 31-6Q32 12 4 8Q21 32 8 26Q-5 23 0 0"
              fill="#d8c4da"
            />
          </g>
          <path
            d="M0-7V17M0-5L-6-12M0-5L6-12"
            stroke="#7e796e"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
        <g className="scene-particles" fill="#c5ae72">
          <circle cx="402" cy="153" r="2" />
          <circle cx="335" cy="189" r="2.5" />
          <circle cx="651" cy="193" r="2" />
          <circle cx="748" cy="228" r="2" />
          <path d="M448 119v10m-5-5h10" stroke="#b9ba8d" strokeWidth="1.5" />
        </g>
        {variant === "starter" &&
          plants.map(({ entry, position }) => (
            <GardenPlant
              key={entry._id}
              mood={entry.mood}
              x={position[0]}
              y={position[1]}
              newlyPlanted={entry._id === plantedId}
            />
          ))}
        {variant === "botanical" && (
          <g>
            <Flower x={407} y={280} color="#d8a2a5" scale={1.2} />
            <Flower x={540} y={270} color="#d6c5dc" scale={1.5} />
            <Flower x={604} y={296} color="#e5d18b" scale={0.9} />
            <Flower x={463} y={317} color="#dfbab6" scale={0.65} />
          </g>
        )}
      </svg>
    </div>
  );
}
