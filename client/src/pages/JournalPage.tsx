import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Flower2 } from "lucide-react";
import type { Mood } from "../../../shared/moods.js";
import ProductHeader from "../components/ProductHeader";
import JournalToolbar from "../components/journal/JournalToolbar";
import JournalEntryCard from "../components/journal/JournalEntryCard";
import JournalEmptyState from "../components/journal/JournalEmptyState";
import EntryDialog from "../components/journal/EntryDialog";
import { useMoodHistory } from "../context/MoodHistoryContext";
export default function JournalPage() {
  const history = useMoodHistory();
  const [search, setSearch] = useState(""),
    [mood, setMood] = useState<Mood | "">(""),
    [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [notice, setNotice] = useState("");
  const [params, setParams] = useSearchParams();
  const selected = params.get("entry");
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const entries = history.entries.filter(
      (entry) =>
        (!mood || entry.mood === mood) &&
        entry.note.toLocaleLowerCase().includes(query),
    );
    return sort === "newest" ? entries.reverse() : entries;
  }, [history.entries, search, mood, sort]);
  function clear() {
    setSearch("");
    setMood("");
  }
  function close() {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete("entry");
        return next;
      },
      { replace: true },
    );
  }
  return (
    <div className="shell journal-shell">
      <ProductHeader />
      <main id="main-content" className="page-main" tabIndex={-1}>
        <section className="journal-heading">
          <span className="eyebrow">
            <span /> LITTLE THOUGHTS, GENTLY KEPT
          </span>
          <h1 id="journal-title" tabIndex={-1}>
            Your little <em>journal.</em>
            <Flower2 size={40} strokeWidth={1.1} />
          </h1>
          <p>Every feeling leaves a little trace.</p>
        </section>
        <JournalToolbar
          search={search}
          mood={mood}
          sort={sort}
          onSearch={setSearch}
          onMood={setMood}
          onSort={setSort}
        />
        {notice && (
          <p className="journal-notice" role="status">
            {notice}
          </p>
        )}
        {history.loading ? (
          <section className="journal-empty" role="status">
            <Flower2
              className="journal-loading-flower"
              size={34}
              strokeWidth={1.2}
            />
            <h2>Gathering your thoughts...</h2>
          </section>
        ) : history.error ? (
          <section className="journal-empty">
            <h2>We couldn't open your journal.</h2>
            <p role="alert">Your thoughts are waiting. Try connecting again.</p>
            <button
              className="primary-button"
              onClick={() => void history.reload()}
            >
              Retry
            </button>
          </section>
        ) : filtered.length ? (
          <>
            <p className="journal-count">
              {filtered.length} little{" "}
              {filtered.length === 1 ? "thought" : "thoughts"}
              {search || mood ? " found" : " planted"}
            </p>
            <section
              className="journal-entries"
              aria-label="Your saved feelings"
            >
              {filtered.map((entry) => (
                <JournalEntryCard
                  key={entry._id}
                  entry={entry}
                  onOpen={() => {
                    setNotice("");
                    setParams({ entry: entry._id });
                  }}
                />
              ))}
            </section>
          </>
        ) : (
          <JournalEmptyState
            filtered={history.entries.length > 0}
            onClear={clear}
          />
        )}
      </main>
      <footer>
        <span>A little trace of where you’ve been.</span>
        <span>
          ONE LITTLE GARDEN AT A TIME <Flower2 size={14} />
        </span>
      </footer>
      {selected && (
        <EntryDialog
          key={selected}
          id={selected}
          onClose={close}
          onNotice={setNotice}
        />
      )}
    </div>
  );
}
