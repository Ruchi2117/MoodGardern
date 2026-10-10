import { MOOD_PLANTS, MOODS, type Mood } from "../../../shared/moods.js";
import MoodIllustration from "./MoodIllustration";
export default function MoodPicker({
  value,
  onChange,
  disabled = false,
}: {
  value: Mood | null;
  onChange: (mood: Mood) => void;
  disabled?: boolean;
}) {
  const selected = value ? MOOD_PLANTS[value] : null;
  return (
    <section className="feeling-picker" aria-labelledby="feeling-title">
      <h2 id="feeling-title">How are you feeling today?</h2>
      <div
        className={`feeling-options ${selected ? "has-selection" : ""}`}
        role="group"
        aria-label="Today's feeling"
      >
        {MOODS.map((key) => {
          const mood = MOOD_PLANTS[key];
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              className="feeling-option"
              style={{ "--mood-color": mood.color } as React.CSSProperties}
              aria-pressed={value === key}
              onClick={() => onChange(key)}
            >
              <span className="feeling-orb">
                <MoodIllustration mood={key} size={52} />
              </span>
              <span>{mood.name}</span>
            </button>
          );
        })}
      </div>
      <p className="feeling-caption" role="status">
        {selected
          ? `${selected.name} — ${selected.label}.`
          : "Whatever you're feeling, there's room for it here."}
      </p>
    </section>
  );
}
