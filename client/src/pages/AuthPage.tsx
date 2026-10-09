import { useRef, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Flower2, Sprout } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ProductHeader from "../components/ProductHeader";
import GardenScene from "../components/garden/GardenScene";
export default function AuthPage({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";
  const { user, loading, login, register } = useAuth();
  const navigate = useNavigate();
  const lock = useRef(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  if (loading)
    return (
      <div id="main-content" role="main" tabIndex={-1} className="session-state">
        <p role="status">Opening your garden…</p>
      </div>
    );
  if (user) return <Navigate to="/dashboard" replace />;
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (lock.current) return;
    setError("");
    if (isRegister && !name.trim()) return setError("Please enter your name.");
    if (new TextEncoder().encode(password).length > 72)
      return setError("Please keep your password within 72 UTF-8 bytes.");
    if (isRegister && password !== confirmPassword)
      return setError("Your passwords do not match.");
    lock.current = true;
    setSubmitting(true);
    try {
      if (isRegister) await register(name.trim(), email, password);
      else await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please try again.");
    } finally {
      lock.current = false;
      setSubmitting(false);
    }
  }
  return (
    <div className="shell">
      <ProductHeader />
      <main id="main-content" className="auth-layout" tabIndex={-1}>
        <section className="intro">
          <div className="eyebrow">
            <span /> A SMALL STEP, JUST FOR YOU
          </div>
          <h1>
            {isRegister ? (
              <>
                Your next <br />
                chapter starts <br />
                with <em>you.</em>
              </>
            ) : (
              <>
                Welcome <br />
                back to your <br />
                <em>little garden.</em>
              </>
            )}
          </h1>
          <p>
            {isRegister
              ? "Make room for every feeling. Begin with a little space of your own."
              : "Take a breath. Your cozy corner is right here."}
          </p>
          <GardenScene variant="botanical" />
          <div className="auth-reminder">
            <Flower2 size={42} strokeWidth={1.2} />
            <span>
              You don’t have to bloom every day.
              <br />
              Showing up is enough.
            </span>
          </div>
        </section>
        <section className="auth-card">
          <Sprout className="auth-sprout" size={32} strokeWidth={1.3} />
          <h2>
            {isRegister
              ? "Let’s plant your first seed."
              : "Let’s see what grew."}
          </h2>
          <p>
            {isRegister
              ? "Create your MoodGarden account."
              : "Log in to your MoodGarden account."}
          </p>
          <form onSubmit={submit} aria-busy={submitting}>
            <fieldset
              disabled={submitting}
              className="auth-fields"
              aria-label="Account details"
            >
              {isRegister && (
                <label>
                  Your name
                  <input
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={80}
                    placeholder="What should we call you?"
                  />
                </label>
              )}
              <label>
                Email address
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={254}
                  placeholder="you@example.com"
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  autoComplete={
                    isRegister ? "new-password" : "current-password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                />
              </label>
              {isRegister && (
                <label>
                  Confirm password
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="One more time"
                  />
                </label>
              )}
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <button
                className="primary-button"
                disabled={submitting}
                type="submit"
              >
                {submitting
                  ? "Just a moment…"
                  : isRegister
                    ? "Start growing"
                    : "Return to my garden"}
              </button>
            </fieldset>
          </form>
          <p className="auth-switch">
            {isRegister ? "Already have a little garden?" : "New here?"}{" "}
            <Link
              to={isRegister ? "/login" : "/register"}
              onClick={() => {
                setError("");
                setPassword("");
                setConfirmPassword("");
              }}
            >
              {isRegister ? "Log in" : "Start growing"}
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
