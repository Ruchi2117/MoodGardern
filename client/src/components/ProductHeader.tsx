import { Sprout, BookOpen, Sparkles } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MoodIllustration from "./MoodIllustration";
export default function ProductHeader() {
  const { user, logout } = useAuth();
  return (
    <header className="product-header">
      <Link className="brand" to="/">
        <MoodIllustration size={32} /> moodgarden<span>®</span>
      </Link>
      {user ? (
        <>
          <nav aria-label="Your sanctuary">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => (isActive ? "nav-garden" : "")}
            >
              <Sprout size={15} />
              Garden
            </NavLink>
            <NavLink
              to="/journal"
              className={({ isActive }) => (isActive ? "nav-garden" : "")}
            >
              <BookOpen size={15} />
              Journal
            </NavLink>
            <NavLink
              to="/insights"
              className={({ isActive }) => (isActive ? "nav-garden" : "")}
            >
              <Sparkles size={15} />
              Insights
            </NavLink>
          </nav>
          <div className="garden-user">
            <span>{user.name}'s garden</span>
            <button className="text-button" onClick={logout}>
              Log out
            </button>
          </div>
        </>
      ) : (
        <>
          <span className="header-note">A little space to bloom</span>
          <Link className="text-button" to="/login">
            Log in
          </Link>
        </>
      )}
    </header>
  );
}
