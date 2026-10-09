import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Flower2 } from "lucide-react";
import ProductHeader from "../components/ProductHeader";
import GardenScene from "../components/garden/GardenScene";
import DailyRituals from "../components/DailyRituals";
import useDailyRituals from "../hooks/useDailyRituals";
import MoodPicker from "../components/MoodPicker";
import MoodCheckIn from "../components/MoodCheckIn";
import RecentFeelings from "../components/RecentFeelings";
import useGardenMoods from "../hooks/useGardenMoods";
import { useAuth } from "../context/AuthContext";
import {
  MOOD_PLANTS,
  VISIBLE_PLANT_LIMIT,
  GROWTH_PER_ENTRY,
  type Mood,
} from "../../../shared/moods.js";
import type { MoodInput } from "../services/api";
export default function Dashboard() {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const garden = useGardenMoods();
  const rituals = useDailyRituals();
  const growth =
    garden.entries.length * GROWTH_PER_ENTRY +
    (rituals.data?.ritualGrowthPoints || 0);
  const gardenRef = useRef<HTMLElement>(null);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const latest = garden.entries.find((entry) => entry._id === garden.plantedId);
  useEffect(() => {
    if (garden.plantedId)
      gardenRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "center",
      });
  }, [garden.plantedId]);
  async function plant(input: MoodInput) {
    const succeeded = await garden.submit(input);
    if (succeeded) setSelectedMood(null);
    return succeeded;
  }
  return (
    <div className="shell sanctuary-shell">
      <ProductHeader />
      <main id="main-content" className="page-main" tabIndex={-1}>
        <div className="garden-welcome">
          <div>
            <span className="eyebrow">
              <span /> A LITTLE SPACE, ALL YOURS
            </span>
            <h1>
              Good {greeting}, <em>{user?.name}.</em>
              <span className="welcome-flower">🌷</span>
            </h1>
          </div>
          <p>
            Leave the busy world at the gate.
            <br />
            You can take your time here.
          </p>
        </div>
        <MoodPicker
          value={selectedMood}
          onChange={setSelectedMood}
          disabled={garden.submitting}
        />
        <MoodCheckIn
          mood={selectedMood}
          disabled={garden.loading || !!garden.loadError}
          submitting={garden.submitting}
          error={garden.submitError}
          onSubmit={plant}
        />
        <section
          ref={gardenRef}
          className={`personal-garden ${rituals.care ? "garden-cared" : ""}`}
          aria-labelledby="garden-title"
        >
          <div className="garden-scene-heading">
            <span className="eyebrow" id="garden-title">
              <span /> YOUR LITTLE SANCTUARY
            </span>
            <span className="garden-season">
              {garden.entries.length
                ? `${garden.entries.length} little ${garden.entries.length === 1 ? "thing" : "things"} planted`
                : "a season of beginnings"}
            </span>
          </div>
          {garden.loading && (
            <p className="garden-status" role="status">
              Growing your garden...
            </p>
          )}
          {garden.loadError && (
            <p className="garden-status garden-error" role="alert">
              {garden.loadError}{" "}
              <button type="button" onClick={() => void garden.load()}>
                Try again
              </button>
            </p>
          )}
          {rituals.care > 0 && (
            <span
              key={rituals.care}
              className="care-sparkle"
              aria-hidden="true"
            >
              ✧ · ✧
            </span>
          )}
          <GardenScene entries={garden.entries} plantedId={garden.plantedId} />
          <div className="garden-story">
            <span className="small-label">
              {growth
                ? `GARDEN GROWTH · ${growth}`
                : "EVERY GARDEN STARTS SOMEWHERE"}
            </span>
            <h2>
              {garden.entries.length
                ? "A little care goes a long way."
                : "Every garden starts somewhere."}
            </h2>
            <p className={latest ? "planting-success" : ""} role="status">
              {latest
                ? "Your feeling has found a home."
                : garden.entries.length
                  ? "Whatever you bring, there’s room for it here."
                  : "Plant your first feeling."}
            </p>
            <span className="preview-copy">
              {latest
                ? MOOD_PLANTS[latest.mood].message
                : garden.entries.length > VISIBLE_PLANT_LIMIT
                  ? `Your latest ${VISIBLE_PLANT_LIMIT} feelings are blooming here. Every planted feeling counts.`
                  : "One feeling, one little beginning."}
            </span>
          </div>
        </section>
        <DailyRituals rituals={rituals} />
        <section className="garden-understory" aria-label="Around your garden">
          <RecentFeelings
            entries={garden.entries}
            loading={garden.loading}
            failed={!!garden.loadError}
          />
          <div id="garden-notes">
            <span className="small-label">GARDEN NOTES</span>
            <h3>Room to grow.</h3>
            <p>
              Give your garden a few days.
              <br />
              Patterns will start to bloom.
            </p>
            <Link className="preview-copy" to="/insights">
              A little look at your garden notes →
            </Link>
          </div>
        </section>
      </main>
      <footer>
        <span>Made for your softer, slower moments.</span>
        <span>
          ONE LITTLE GARDEN AT A TIME <Flower2 size={14} />
        </span>
      </footer>
    </div>
  );
}
