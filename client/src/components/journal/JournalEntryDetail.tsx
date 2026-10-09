import { MOOD_PLANTS } from "../../../../shared/moods.js";
import type { MoodEntry } from "../../services/api";
import GardenPlant from "../garden/GardenPlant";
import { fullDate } from "../../utils/dates";
import { EnergyDots } from "./JournalEntryCard";
export default function JournalEntryDetail({
  entry,
  onEdit,
  onDelete,
}: {
  entry: MoodEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const mood = MOOD_PLANTS[entry.mood];
  return (
    <>
      <span className="small-label">A FEELING YOU PLANTED</span>
      <h2 id="entry-dialog-title">
        {mood.emoji} {mood.name}
      </h2>
      <time dateTime={entry.createdAt} className="entry-full-date">
        {fullDate(entry.createdAt)}
      </time>
      <p className="entry-full-note">
        {entry.note || "A feeling planted, without words."}
      </p>
      {entry.activities.length > 0 && (
        <div className="detail-activities">
          {entry.activities.map((activity) => (
            <span key={activity}>
              {activity === "self-care"
                ? "Self-care"
                : activity[0].toUpperCase() + activity.slice(1)}
            </span>
          ))}
        </div>
      )}
      <div className="detail-energy">
        Energy <EnergyDots energy={entry.energy} />
      </div>
      <div className="detail-plant">
        <svg viewBox="-45 -95 90 100" role="img" aria-label={mood.displayName}>
          <GardenPlant mood={entry.mood} x={0} y={0} newlyPlanted={false} />
        </svg>
        <div>
          <span className="small-label">{mood.displayName}</span>
          <p>{mood.message}</p>
        </div>
      </div>
      <div className="entry-actions">
        <button className="primary-button" onClick={onEdit}>
          Edit this feeling
        </button>
        <button className="text-button release-button" onClick={onDelete}>
          Let this thought go
        </button>
      </div>
    </>
  );
}
