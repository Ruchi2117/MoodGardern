import { useState } from "react";
import { Link } from "react-router-dom";
import { Flower2, Sprout } from "lucide-react";
import ProductHeader from "../components/ProductHeader";
import GardenScene from "../components/garden/GardenScene";
import InsightSummary from "../components/insights/InsightSummary";
import MoodDistribution from "../components/insights/MoodDistribution";
import MoodTimeline from "../components/insights/MoodTimeline";
import GentleObservations from "../components/insights/GentleObservations";
import useInsights from "../hooks/useInsights";
import type { InsightPeriod } from "../services/api";
export default function InsightsPage() {
  const [period, setPeriod] = useState<InsightPeriod>("30");
  const { data, loading, error, load } = useInsights(period);
  return (
    <div className="shell insights-shell">
      <ProductHeader />
      <main id="main-content" className="page-main" tabIndex={-1}>
        <section className="insights-heading">
          <span className="eyebrow">
            <span /> A LITTLE LOOK BACK
          </span>
          <h1>
            Your <em>garden notes.</em>
            <Flower2 size={40} strokeWidth={1.1} aria-hidden="true" />
          </h1>
          <p>A little look at what you’ve been planting lately.</p>
        </section>
        <div className="insight-period-row">
          <span>Make a little space to reflect.</span>
          <div
            className="insight-switch"
            role="group"
            aria-label="Insight period"
          >
            {(["7", "30", "all"] as const).map((value) => (
              <button
                key={value}
                aria-pressed={period === value}
                onClick={() => setPeriod(value)}
              >
                {value === "all" ? "All time" : `${value} days`}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <section className="insight-empty" role="status">
            <Flower2 size={32} />
            <h2>Gathering your garden notes...</h2>
          </section>
        ) : error ? (
          <section className="insight-empty">
            <h2>Your notes are still here.</h2>
            <p role="alert">{error}</p>
            <button className="primary-button" onClick={() => void load()}>
              Try again
            </button>
          </section>
        ) : (
          data &&
          (data.garden.totalPlanted === 0 ? (
            <section className="insight-empty">
              <div className="insight-young-garden">
                <GardenScene />
              </div>
              <h2>Your garden is still very young.</h2>
              <p>
                Plant a few feelings and your patterns will start to bloom here.
              </p>
              <Link className="primary-button" to="/dashboard">
                Plant today’s feeling
              </Link>
            </section>
          ) : data.summary.totalCheckIns === 0 ? (
            <section className="insight-empty">
              <Sprout size={35} />
              <h2>A quiet little window.</h2>
              <p>
                No feelings were recorded in this period. Your{" "}
                {data.garden.totalPlanted} planted feelings are still here.
              </p>
              {data.rituals.completedCount > 0 && (
                <p>
                  You’ve completed {data.rituals.completedCount} little rituals
                  in this period.
                </p>
              )}
              <button
                className="primary-button"
                onClick={() => setPeriod("all")}
              >
                Look at all time
              </button>
            </section>
          ) : (
            <>
              <InsightSummary data={data} />
              <p className="insight-caption">
                Statistics reflect the selected period. The current streak uses
                all recorded days and stays active through yesterday. There’s
                nothing to catch up on.
              </p>
              {data.summary.totalCheckIns < 7 && (
                <p className="insight-soft-note">
                  You’ve planted your first few feelings in this period. Keep
                  checking in and you’ll start seeing patterns.
                </p>
              )}
              <div className="insight-garden-story">
                <div>
                  <span className="small-label">
                    THE STORY OF YOUR LITTLE GARDEN
                  </span>
                  <h2>
                    {data.garden.totalPlanted} planted{" "}
                    {data.garden.totalPlanted === 1 ? "feeling" : "feelings"}.
                  </h2>
                  <p>
                    Every feeling has found a home. These notes simply reflect
                    what you recorded.
                  </p>
                  <Link to="/dashboard">Spend a moment in your garden →</Link>
                </div>
                <div className="insight-botanical" aria-hidden="true">
                  <GardenScene variant="botanical" />
                </div>
              </div>
              <MoodDistribution data={data} />
              {data.summary.totalCheckIns > 2 ? (
                <MoodTimeline data={data} />
              ) : (
                <p className="insight-soft-note">
                  A timeline will bloom here after a few more recorded feelings.
                  For now, your first little traces live in your Journal.
                </p>
              )}
              <GentleObservations data={data} />
            </>
          ))
        )}
      </main>
      <footer>
        <span>Every feeling leaves a little trace.</span>
        <span>
          ONE LITTLE GARDEN AT A TIME <Flower2 size={14} />
        </span>
      </footer>
    </div>
  );
}
