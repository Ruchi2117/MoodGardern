import { useEffect, useState } from "react";
import { Flower2, Sprout, ArrowUpRight, Check, Heart } from "lucide-react";
import { getHealth } from "./services/api";
import { Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user } = useAuth();
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    getHealth(controller.signal)
      .then(() => setStatus("ready"))
      .catch(() => {
        if (!controller.signal.aborted) setStatus("error");
      });
    return () => controller.abort();
  }, [retry]);

  return (
    <div className="shell">
      <header>
        <a className="brand" href="/" aria-label="MoodGarden home">
          <Flower2 size={27} /> moodgarden<span>®</span>
        </a>
        <span className="header-note">A little space to bloom</span>
        <span className="phase">
          FEELINGS <span>·</span> GROWTH
        </span>
      </header>
      <main id="main-content" tabIndex={-1}>
        <section className="intro">
          <div className="eyebrow">
            <span /> SLOW DOWN. CHECK IN. GROW.
          </div>
          <h1>
            Every feeling
            <br />
            has a place
            <br />
            to <em>bloom.</em>
            <Flower2 className="title-flower" />
          </h1>
          <p>
            A cozy corner for your thoughts, your feelings,
            <br className="desktop-break" /> and the little things that help you
            grow.
          </p>
          <Link
            className="foundation-label"
            to={user ? "/dashboard" : "/register"}
          >
            <Sprout size={19} /> Your garden is taking root{" "}
            <ArrowUpRight size={18} />
          </Link>
          <div className="api-status" role="status">
            <span className={status} />
            {status === "ready"
              ? "Connected to the garden service"
              : status === "loading"
                ? "Connecting to the garden service…"
                : "Garden service is offline."}
            {status === "error" && (
              <button onClick={() => setRetry((v) => v + 1)}>Retry</button>
            )}
          </div>
        </section>
        <section className="garden-card" aria-label="Decorative garden preview">
          <div className="garden-top">
            <span>
              <span className="tiny-dot" /> YOUR LITTLE SANCTUARY
            </span>
            <span>01 / 12</span>
          </div>
          <div className="garden-art">
            <div className="sun" />
            <span className="landing-butterfly" aria-hidden="true">
              ʚɞ
            </span>
            <div className="landing-particles" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <span className="sparkle s1">✦</span>
            <span className="sparkle s2">✧</span>
            <div className="garden-bed">
              <div className="bed-soil" />
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} className={`plant plant-${i}`}>
                  <span className="stem" />
                  <span className="leaf left" />
                  <span className="leaf right" />
                  <span className="blossom">
                    <span />
                  </span>
                </div>
              ))}
              <div className="garden-sign">let it grow</div>
            </div>
            <div className="floating-note">
              <Heart size={14} /> All feelings are welcome here.
            </div>
          </div>
          <div className="garden-bottom">
            <div>
              <span className="small-label">A GENTLE REMINDER</span>
              <p>Growth looks different every day.</p>
            </div>
            <Sprout size={30} strokeWidth={1.3} />
          </div>
        </section>
      </main>
      <section className="milestones" aria-label="A little place to grow">
        <div>
          <span className="step complete">
            <Check size={17} />
          </span>
          <div>
            <b>A place to begin</b>
            <p>A gentle mood check-in</p>
          </div>
          <span className="badge">BEGIN HERE</span>
        </div>
        <div>
          <span className="step">02</span>
          <div>
            <b>Put down roots</b>
            <p>Small daily acts of care</p>
          </div>
        </div>
        <div>
          <span className="step">03</span>
          <div>
            <b>Make it yours</b>
            <p>Your thoughts, gently kept</p>
          </div>
        </div>
      </section>
      <footer>
        <span>Made for your softer, slower moments.</span>
        <span>
          ONE LITTLE GARDEN AT A TIME <Flower2 size={14} />
        </span>
      </footer>
    </div>
  );
}
