import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  ApiError,
  getInsights,
  type InsightData,
  type InsightPeriod,
} from "../services/api";
export default function useInsights(period: InsightPeriod) {
  const { user, logout } = useAuth();
  const owner = user?.id;
  const [data, setData] = useState<{
      owner: string | undefined;
      value: InsightData;
    } | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  const load = useCallback(async () => {
    controller.current?.abort();
    const pending = new AbortController();
    controller.current = pending;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const result = await getInsights(period, pending.signal);
      if (!pending.signal.aborted) setData({ owner, value: result });
    } catch (err) {
      if (pending.signal.aborted) return;
      if (err instanceof ApiError && err.status === 401) logout();
      else setError("Your garden notes couldn’t reconnect. Please try again.");
    } finally {
      if (!pending.signal.aborted) setLoading(false);
    }
  }, [owner, period, logout]);
  useEffect(() => {
    void load();
    return () => controller.current?.abort();
  }, [load]);
  useEffect(() => {
    const focus = () => void load();
    const sync = (event: StorageEvent) => {
      if (
        ["moodgarden.history-change", "moodgarden.ritual-change"].includes(
          event.key || "",
        )
      )
        void load();
    };
    window.addEventListener("focus", focus);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("focus", focus);
      window.removeEventListener("storage", sync);
    };
  }, [load]);
  return {
    data: data && data.owner === owner ? data.value : null,
    loading,
    error,
    load,
  };
}
