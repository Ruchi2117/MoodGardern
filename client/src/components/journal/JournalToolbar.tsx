import { Search } from "lucide-react";
import { MOODS, MOOD_PLANTS, type Mood } from "../../../../shared/moods.js";
export default function JournalToolbar({
  search,
  mood,
  sort,
  onSearch,
  onMood,
  onSort,
}: {
  search: string;
  mood: Mood | "";
  sort: "newest" | "oldest";
  onSearch: (value: string) => void;
  onMood: (value: Mood | "") => void;
  onSort: (value: "newest" | "oldest") => void;
}) {
  return (
    <section className="journal-toolbar" aria-label="Find your thoughts">
      <label className="journal-search">
        <Search size={17} />
        <span className="sr-only">Search your thoughts</span>
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search your thoughts..."
          type="search"
        />
      </label>
      <div className="journal-selects">
        <label>
          <span className="sr-only">Filter by mood</span>
          <select
            value={mood}
            onChange={(event) => onMood(event.target.value as Mood | "")}
          >
            <option value="">All feelings</option>
            {MOODS.map((value) => (
              <option key={value} value={value}>
                {MOOD_PLANTS[value].name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Sort thoughts</span>
          <select
            value={sort}
            onChange={(event) =>
              onSort(event.target.value as "newest" | "oldest")
            }
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>
      </div>
    </section>
  );
}
