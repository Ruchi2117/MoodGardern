import MoodIllustration from "../MoodIllustration";
import { useState } from "react";
import { MOOD_PLANTS } from "../../../../shared/moods.js";
import type { InsightData } from "../../services/api";
export default function MoodTimeline({ data }: { data: InsightData }) {
  const [days, setDays] = useState<7 | 30>(30);
  const cutoff = days === 7 ? data.timelineSevenStart : data.timelineStart;
  const groups = new Map<string, InsightData["timeline"]>();
  for (const point of data.timeline) {
    if (point.date < cutoff) continue;
    const list = groups.get(point.date) || [];
    list.push(point);
    groups.set(point.date, list);
  }
  return (
    <section className="insight-timeline" aria-labelledby="timeline-title">
      <div className="insight-section-head">
        <div>
          <span className="small-label">ONE LITTLE TRACE AT A TIME</span>
          <h2 id="timeline-title">Your feelings, along the way</h2>
        </div>
        <div
          className="insight-switch"
          role="group"
          aria-label="Timeline window"
        >
          {([7, 30] as const).map((value) => (
            <button
              key={value}
              aria-pressed={days === value}
              onClick={() => setDays(value)}
            >
              {value} days
            </button>
          ))}
        </div>
      </div>
      <p>One bloom for each check-in. Every feeling has the same space here.</p>
      {groups.size ? (
        <ol className="feeling-timeline">
          {[...groups].map(([date, points]) => (
            <li key={date}>
              <time dateTime={date}>
                {new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </time>
              <div className="timeline-blooms">
                {points.map((point, index) => {
                  const config = MOOD_PLANTS[point.mood];
                  const detail = `${config.name} · ${new Date(point.recordedAt).toLocaleString()} · ${point.energy === null ? "Energy not recorded" : `Energy ${point.energy}/5`}`;
                  return (
                    <span
                      className="timeline-bloom"
                      role="img"
                      tabIndex={0}
                      key={`${point.recordedAt}-${index}`}
                      aria-label={detail}
                      style={{ background: config.color }}
                    >
                      <MoodIllustration mood={point.mood} size={30}/>
                      <span className="bloom-tooltip" aria-hidden="true">
                        {detail}
                      </span>
                    </span>
                  );
                })}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="insight-soft-note">
          No feelings recorded in this timeline window. Your older thoughts are
          still in your Journal.
        </p>
      )}
      <p className="insight-caption">
        Showing recorded days within your selected period, up to the last {days}{" "}
        days. Quiet days are simply left open.
      </p>
    </section>
  );
}
