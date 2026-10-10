import MoodIllustration from "../MoodIllustration";
import { useState, type FormEvent } from "react";
import {
  MOODS,
  MOOD_PLANTS,
  ACTIVITIES,
  NOTE_MAX_LENGTH,
  type Activity,
} from "../../../../shared/moods.js";
import type { MoodEntry, MoodInput } from "../../services/api";
export default function JournalEntryEditor({
  entry,
  busy,
  error,
  onSave,
  onCancel,
}: {
  entry: MoodEntry;
  busy: boolean;
  error: string;
  onSave: (input: MoodInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [mood, setMood] = useState(entry.mood);
  const [note, setNote] = useState(entry.note);
  const [activities, setActivities] = useState<Activity[]>(entry.activities);
  const [energy, setEnergy] = useState(entry.energy);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!busy) await onSave({ mood, note, activities, energy });
  }
  return (
    <>
      <span className="small-label">MAKE A LITTLE ROOM FOR CHANGE</span>
      <h2 id="entry-dialog-title">Revisit this feeling.</h2>
      <form className="journal-editor" onSubmit={submit}>
        <fieldset disabled={busy}>
          <legend>Your feeling</legend>
          <div className="editor-moods" role="group" aria-label="Edit mood">
            {MOODS.map((value) => (
              <button
                type="button"
                key={value}
                aria-pressed={mood === value}
                onClick={() => setMood(value)}
                title={MOOD_PLANTS[value].name}
              >
                <MoodIllustration mood={value} size={26}/>
                {MOOD_PLANTS[value].name}
              </button>
            ))}
          </div>
          <label htmlFor="edit-note">Your thought</label>
          <textarea
            id="edit-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={NOTE_MAX_LENGTH}
            rows={5}
          />
          <span className="note-count">
            {note.length} / {NOTE_MAX_LENGTH} · optional
          </span>
          <fieldset>
            <legend>Parts of your day</legend>
            <div className="activity-options">
              {ACTIVITIES.map((activity) => (
                <button
                  type="button"
                  key={activity}
                  aria-pressed={activities.includes(activity)}
                  onClick={() =>
                    setActivities((current) =>
                      current.includes(activity)
                        ? current.filter((value) => value !== activity)
                        : [...current, activity],
                    )
                  }
                >
                  {activity === "self-care"
                    ? "Self-care"
                    : activity[0].toUpperCase() + activity.slice(1)}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Energy</legend>
            <div
              className="energy-options"
              role="group"
              aria-label="Edit energy"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-label={`Energy ${value} of 5`}
                  aria-pressed={energy === value}
                  onClick={() => setEnergy(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </fieldset>
        </fieldset>
        {error && (
          <p className="check-in-error" role="alert">
            {error}
          </p>
        )}
        <div className="entry-actions">
          <button className="primary-button" disabled={busy} type="submit">
            {busy ? "Saving..." : "Save changes"}
          </button>
          <button
            className="text-button"
            type="button"
            disabled={busy}
            onClick={onCancel}
          >
            Keep it as it was
          </button>
        </div>
      </form>
    </>
  );
}
