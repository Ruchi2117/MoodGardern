import { Check, Leaf } from "lucide-react";
import { RITUAL_DEFINITIONS } from "../../../shared/rituals.js";
import type useDailyRituals from "../hooks/useDailyRituals";
type Props = { rituals: ReturnType<typeof useDailyRituals> };
export default function DailyRituals({ rituals: r }: Props) {
  const all = r.data?.ritual.tasks.every((task) => task.completed);
  return (
    <section
      className="daily-rituals"
      aria-labelledby="ritual-title"
      aria-busy={r.loading || !!r.busy}
    >
      <div className="ritual-heading">
        <div>
          <span className="small-label">A LITTLE CARE, AT YOUR PACE</span>
          <h2 id="ritual-title">Today’s little rituals</h2>
          <p>Just a few tiny things for you. One tiny thing is enough.</p>
        </div>
        <Leaf aria-hidden="true" size={26} />
      </div>
      {r.loading && !r.data && (
        <p role="status">Preparing today’s little rituals...</p>
      )}
      {r.error && (
        <p className="ritual-error" role="alert">
          {r.error} <button onClick={() => void r.load()}>Try again</button>
        </p>
      )}
      <div className="ritual-list">
        {r.data?.ritual.tasks.map((task) => {
          const icon =
            RITUAL_DEFINITIONS.find((d) => d.title === task.title)?.icon ||
            "🌿";
          return (
            <button
              key={task.id}
              className={`ritual-task ${task.completed ? "is-done" : ""}`}
              disabled={!!r.busy || task.completed}
              onClick={() => void r.complete(task.id)}
              aria-label={`${task.title}. ${task.completed ? "Done for today" : r.busy === task.id ? "Saving" : "Mark done for today"}`}
            >
              <span className="ritual-icon" aria-hidden="true">
                {icon}
              </span>
              <span className="ritual-text">
                <strong>{task.title}</strong>
                <span>{task.description}</span>
                {task.completed && <small>Done for today 🌷</small>}
              </span>
              <span className="ritual-check" aria-hidden="true">
                {task.completed ? (
                  <Check size={17} />
                ) : r.busy === task.id ? (
                  "…"
                ) : (
                  ""
                )}
              </span>
            </button>
          );
        })}
      </div>
      <p className="ritual-message" role="status">
        {all
          ? "All three done 🌷 You gave your garden a little extra care today."
          : r.care
            ? "Your garden feels a little more cared for."
            : "A gentle invitation. There’s nothing to catch up on."}
      </p>
    </section>
  );
}
