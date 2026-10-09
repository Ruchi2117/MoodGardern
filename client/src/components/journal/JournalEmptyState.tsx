import { Link } from "react-router-dom";
export default function JournalEmptyState({
  filtered,
  onClear,
}: {
  filtered: boolean;
  onClear: () => void;
}) {
  return (
    <section className="journal-empty">
      <div className="notebook-art" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <h2>
        {filtered
          ? "Nothing bloomed for that search."
          : "No thoughts planted yet."}
      </h2>
      <p>
        {filtered
          ? "Try a different word or make room for all feelings."
          : "Your first check-in will live here."}
      </p>
      {filtered ? (
        <button className="text-button" onClick={onClear}>
          Clear filters
        </button>
      ) : (
        <Link className="primary-button" to="/dashboard">
          Plant your first feeling
        </Link>
      )}
    </section>
  );
}
