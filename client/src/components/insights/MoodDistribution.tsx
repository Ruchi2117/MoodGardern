import { MOOD_PLANTS } from "../../../../shared/moods.js";
import type { InsightData } from "../../services/api";
export default function MoodDistribution({ data }: { data: InsightData }) {
  const max = Math.max(1, ...data.moodDistribution.map((d) => d.count));
  return (
    <section
      className="insight-distribution"
      aria-labelledby="distribution-title"
    >
      <span className="small-label">THE FEELINGS YOU PLANTED</span>
      <h2 id="distribution-title">How your garden has felt</h2>
      <p>Each little bar is a count of your recorded feelings.</p>
      <ul className="mood-bars">
        {data.moodDistribution.map(({ mood, count }) => {
          const config = MOOD_PLANTS[mood];
          return (
            <li
              key={mood}
              aria-label={`${config.name}: ${count} ${count === 1 ? "check-in" : "check-ins"}`}
            >
              <span className="bar-label">
                <span aria-hidden="true">{config.emoji}</span>
                {config.name}
              </span>
              <span className="mood-bar-track" aria-hidden="true">
                <span
                  style={{
                    width: `${(count / max) * 100}%`,
                    background: config.color,
                  }}
                />
              </span>
              <span className="bar-count" aria-hidden="true">
                {count}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
