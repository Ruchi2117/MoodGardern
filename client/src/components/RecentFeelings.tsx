import { Link } from "react-router-dom";
import { MOOD_PLANTS } from "../../../shared/moods.js";
import type { MoodEntry } from "../services/api";
import { dateLabel } from "../utils/dates";
export default function RecentFeelings({
  entries,
  loading,
  failed,
}: {
  entries: MoodEntry[];
  loading: boolean;
  failed: boolean;
}) {
  return (
    <div id="thoughts" className="recent-feelings">
      <span className="small-label">RECENTLY PLANTED</span>
      {loading ? (
        <p role="status">Looking through your little garden...</p>
      ) : failed ? (
        <p>
          Your recently planted feelings will return when your garden
          reconnects.
        </p>
      ) : entries.length ? (
        <ul>
          {entries
            .slice(-3)
            .reverse()
            .map((entry) => (
              <li key={entry._id}>
                <span aria-hidden="true">{MOOD_PLANTS[entry.mood].emoji}</span>
                <Link
                  className="recent-entry-link"
                  to={`/journal?entry=${entry._id}`}
                >
                  <strong>{MOOD_PLANTS[entry.mood].name}</strong>
                  <time dateTime={entry.createdAt}>
                    {dateLabel(entry.createdAt)}
                  </time>
                  <p>{entry.note || MOOD_PLANTS[entry.mood].message}</p>
                </Link>
              </li>
            ))}
        </ul>
      ) : (
        <div className="thoughts-preview">
          <div className="notebook-art" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div>
            <h3>No thoughts planted yet.</h3>
            <p>Your first check-in will live here.</p>
          </div>
        </div>
      )}
      <Link className="all-thoughts-link" to="/journal">
        See all thoughts →
      </Link>
    </div>
  );
}
