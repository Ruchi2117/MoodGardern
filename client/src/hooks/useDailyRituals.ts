import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  getRituals,
  completeRitual,
  type RitualResult,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
export default function useDailyRituals() {
  const { user, logout } = useAuth();
  const owner = user?.id;
  const current = useRef(owner);
  current.current = owner;
  const [data, setData] = useState<RitualResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [care, setCare] = useState(0);
  const lock = useRef(false);
  const revision = useRef(0);
  const abort = useRef<AbortController | null>(null);
  const load = useCallback(async () => {
    abort.current?.abort();
    if (!owner) return;
    const controller = new AbortController();
    abort.current = controller;
    const version = revision.current;
    setLoading(true);
    setError("");
    try {
      const result = await getRituals(controller.signal);
      if (
        !controller.signal.aborted &&
        current.current === owner &&
        version === revision.current
      )
        setData(result);
    } catch (err) {
      if (!controller.signal.aborted && current.current === owner) {
        if (err instanceof ApiError && err.status === 401) logout();
        else setError("We couldn’t load today’s rituals.");
      }
    } finally {
      if (!controller.signal.aborted && current.current === owner)
        setLoading(false);
    }
  }, [owner, logout]);
  useEffect(() => {
    setData(null);
    setCare(0);
    revision.current++;
    void load();
    return () => abort.current?.abort();
  }, [load]);
  useEffect(() => {
    // Recheck after local midnight, waking a sleeping tab, or a cross-tab completion.
    let day = new Date().toDateString();
    const check = () => {
      const next = new Date().toDateString();
      if (next !== day) {
        day = next;
        void load();
      }
    };
    const focus = () => void load();
    const sync = (e: StorageEvent) => {
      if (e.key === "moodgarden.ritual-change") void load();
    };
    const timer = window.setInterval(check, 30000);
    window.addEventListener("focus", focus);
    window.addEventListener("storage", sync);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", focus);
      window.removeEventListener("storage", sync);
    };
  }, [load]);
  async function complete(id: string) {
    if (lock.current) return;
    lock.current = true;
    setBusy(id);
    setError("");
    const wasDone = data?.ritual.tasks.find((t) => t.id === id)?.completed;
    try {
      const result = await completeRitual(id);
      if (current.current !== owner) return;
      revision.current++;
      setData(result);
      if (!wasDone) setCare((n) => n + 1);
      try {
        localStorage.setItem("moodgarden.ritual-change", crypto.randomUUID());
      } catch {
        /* Optional cross-tab sync. */
      }
    } catch (err) {
      if (current.current === owner) {
        if (err instanceof ApiError && err.status === 401) logout();
        else
          setError(
            "That little moment couldn’t save. Try again when you’re ready.",
          );
      }
    } finally {
      lock.current = false;
      if (current.current === owner) setBusy(null);
    }
  }
  return {
    data: data?.ritual.userId === owner ? data : null,
    loading,
    error,
    busy,
    care,
    load,
    complete,
  };
}
