import MoodIllustration from "../MoodIllustration";
import { Flower2 } from "lucide-react";
import { MOOD_PLANTS } from "../../../../shared/moods.js";
import type { MoodEntry } from "../../services/api";
import { dateLabel } from "../../utils/dates";
export function EnergyDots({ energy }: { energy: number }) {
  return (
    <span
      className="energy-dots"
      role="img"
      aria-label={`Energy ${energy} of 5`}
    >
      {[1, 2, 3, 4, 5].map((value) => (
        <span
          key={value}
          className={value <= energy ? "filled" : ""}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
export default function JournalEntryCard({
  entry,
  onOpen,
}: {
  entry: MoodEntry;
  onOpen: () => void;
}) {
  const mood = MOOD_PLANTS[entry.mood];
  return (
    <button
      className="journal-entry"
      onClick={onOpen}
      style={
        {
          "--entry-accent": mood.color,
          "--plant-accent": mood.accent,
        } as React.CSSProperties
      }
      aria-label={`Open ${mood.name} feeling, ${dateLabel(entry.createdAt)}${entry.note ? `: ${entry.note.slice(0, 80)}` : ""}`}
    >
      <div className="journal-card-top">
        <span>
          <span className="journal-mood-icon" aria-hidden="true">
            <MoodIllustration mood={entry.mood} size={30}/>
          </span>
          {mood.name}
        </span>
        <time dateTime={entry.createdAt}>{dateLabel(entry.createdAt)}</time>
      </div>
      <p className={`journal-note ${entry.note ? "" : "note-unwritten"}`}>
        {entry.note || "A feeling planted, without words."}
      </p>
      <div className="journal-activities">
        {entry.activities.map((activity) => (
          <span key={activity}>
            {activity === "self-care"
              ? "Self-care"
              : activity[0].toUpperCase() + activity.slice(1)}
          </span>
        ))}
      </div>
      <div className="journal-card-bottom">
        <span>
          Energy <EnergyDots energy={entry.energy} />
        </span>
        <Flower2 size={25} strokeWidth={1.1} aria-hidden="true" />
      </div>
    </button>
  );
}
