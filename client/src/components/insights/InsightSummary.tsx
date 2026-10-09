import { MOOD_PLANTS } from "../../../../shared/moods.js";
import type { InsightData } from "../../services/api";
export default function InsightSummary({ data }: { data: InsightData }) {
  const s = data.summary;
  return (
    <dl className="insight-summary">
      <div>
        <dt>Check-ins</dt>
        <dd>{s.totalCheckIns}</dd>
      </div>
      <div className="insight-common">
        <dt>
          {s.mostCommonMoods.length > 1
            ? "Most common · tied"
            : "Most common feeling"}
        </dt>
        <dd>
          {s.mostCommonMoods
            .map((mood) => MOOD_PLANTS[mood].name)
            .join(" · ") || "—"}
        </dd>
      </div>
      <div>
        <dt>Average recorded energy</dt>
        <dd>
          {s.averageEnergy === null ? "—" : s.averageEnergy.toFixed(1)}
          <small> / 5</small>
        </dd>
      </div>
      <div>
        <dt>Current check-in streak</dt>
        <dd>
          {s.currentStreak}
          <small> {s.currentStreak === 1 ? "day" : "days"}</small>
        </dd>
      </div>
    </dl>
  );
}
