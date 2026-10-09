import { useEffect, useRef, useState } from "react";
import { ApiError, type MoodInput } from "../services/api";
import { useMoodHistory } from "../context/MoodHistoryContext";
export default function useGardenMoods() {
  const history = useMoodHistory();
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [plantedId, setPlantedId] = useState<string | null>(null);
  const lock = useRef(false);
  const intent = useRef<{ fingerprint: string; id: string } | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  async function submit(input: MoodInput) {
    if (lock.current) return false;
    lock.current = true;
    setSubmitting(true);
    setSubmitError("");
    setPlantedId(null);
    const fingerprint = JSON.stringify(input);
    if (!intent.current || intent.current.fingerprint !== fingerprint)
      intent.current = { fingerprint, id: crypto.randomUUID() };
    try {
      const entry = await history.create(input, intent.current.id);
      intent.current = null;
      if (!mounted.current) return false;
      setPlantedId(entry._id);
      return true;
    } catch (err) {
      if (mounted.current)
        setSubmitError(
          `We couldn't plant that feeling. Try again?${err instanceof ApiError && [400, 409].includes(err.status) ? ` ${err.message}` : ""}`,
        );
      return false;
    } finally {
      lock.current = false;
      if (mounted.current) setSubmitting(false);
    }
  }
  return {
    entries: history.entries,
    loading: history.loading,
    loadError: history.error,
    load: history.reload,
    submitError,
    submitting,
    plantedId,
    submit,
  };
}
