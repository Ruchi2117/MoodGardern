import { Leaf, Flower2 } from "lucide-react";
import type { InsightData } from "../../services/api";
export default function GentleObservations({ data }: { data: InsightData }) {
  return (
    <div className="insight-reflections">
      <section aria-labelledby="observations-title">
        <span className="small-label">EVERY FEELING LEAVES A LITTLE TRACE</span>
        <h2 id="observations-title">A few things we noticed</h2>
        <ul>
          {data.observations.map((text) => (
            <li key={text}>
              <Leaf size={18} aria-hidden="true" />
              <span>{text}</span>
            </li>
          ))}
          {data.rituals.completedCount > 0 && (
            <li>
              <Flower2 size={18} aria-hidden="true" />
              <span>
                You’ve completed {data.rituals.completedCount} little{" "}
                {data.rituals.completedCount === 1 ? "ritual" : "rituals"} in
                this period.
              </span>
            </li>
          )}
        </ul>
      </section>
      <section className="energy-reflection" aria-labelledby="energy-title">
        <span className="small-label">A MOMENT TO NOTICE</span>
        <h2 id="energy-title">Your recorded energy</h2>
        <p className="energy-number">
          {data.summary.averageEnergy === null
            ? "Not recorded"
            : `${data.summary.averageEnergy.toFixed(1)} / 5`}
        </p>
        <p>
          {data.summary.energySampleCount
            ? `An average of ${data.summary.energySampleCount} recorded energy ${data.summary.energySampleCount === 1 ? "value" : "values"} in this period.`
            : "These check-ins don’t have energy values yet."}
        </p>
        <p>
          {data.summary.energySampleCount < 7
            ? "Keep checking in to see your energy patterns."
            : "Energy is a snapshot of each check-in, with room for every kind of day."}
        </p>
      </section>
    </div>
  );
}
