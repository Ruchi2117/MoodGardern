import { useState, type FormEvent } from "react";
import { Sprout } from "lucide-react";
import {
  ACTIVITIES,
  NOTE_MAX_LENGTH,
  type Activity,
  type Mood,
} from "../../../shared/moods.js";
import type { MoodInput } from "../services/api";
export default function MoodCheckIn({
  mood,
  disabled,
  submitting,
  error,
  onSubmit,
}: {
  mood: Mood | null;
  disabled: boolean;
  submitting: boolean;
  error: string;
  onSubmit: (input: MoodInput) => Promise<boolean>;
}) {
  const [note, setNote] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [energy, setEnergy] = useState(3);
  function toggleActivity(activity: Activity) {
    setActivities((current) =>
      current.includes(activity)
        ? current.filter((value) => value !== activity)
        : [...current, activity],
    );
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!mood || submitting || disabled) return;
    if (await onSubmit({ mood, note, activities, energy })) {
      setNote("");
      setActivities([]);
      setEnergy(3);
    }
  }
  return (
    <form
      className={`mood-check-in ${mood ? "check-in-open" : ""}`}
      onSubmit={submit}
      aria-busy={submitting}
    >
      {mood && (
        <fieldset disabled={submitting || disabled} className="check-in-fields">
          <div className="thought-field">
            <label htmlFor="feeling-note">What’s on your mind?</label>
            <textarea
              id="feeling-note"
              aria-describedby="feeling-note-hint"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={NOTE_MAX_LENGTH}
              rows={3}
              placeholder="Anything you want to leave here..."
            />
            <span className="note-count" id="feeling-note-hint">
              {note.length} / {NOTE_MAX_LENGTH} · optional
            </span>
          </div>
          <div className="check-in-details">
            <fieldset>
              <legend>What’s been part of your day?</legend>
              <div className="activity-options">
                {ACTIVITIES.map((activity) => (
                  <button
                    type="button"
                    key={activity}
                    aria-pressed={activities.includes(activity)}
                    onClick={() => toggleActivity(activity)}
                  >
                    {activity === "self-care"
                      ? "Self-care"
                      : activity[0].toUpperCase() + activity.slice(1)}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>How much energy do you have today?</legend>
              <div
                className="energy-options"
                role="group"
                aria-label="Energy level"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    type="button"
                    key={value}
                    aria-label={`Energy ${value} of 5`}
                    aria-pressed={energy === value}
                    onClick={() => setEnergy(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <span className="energy-caption">
                low &nbsp; — &nbsp; full of energy
              </span>
            </fieldset>
          </div>
        </fieldset>
      )}
      {error && (
        <p className="check-in-error" role="alert">
          {error}
        </p>
      )}
      <button
        className="primary-button plant-feeling"
        type="submit"
        disabled={!mood || submitting || disabled}
      >
        <Sprout size={17} />
        {submitting ? "Planting..." : "Plant today's feeling 🌱"}
      </button>
    </form>
  );
}
