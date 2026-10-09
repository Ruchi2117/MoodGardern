import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ApiError,
  deleteMood,
  getMood,
  getMoods,
  plantMood,
  updateMood,
  type MoodEntry,
  type MoodInput,
} from "../services/api";
import { useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

type MoodHistory = {
  entries: MoodEntry[];
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
  create: (input: MoodInput, requestId: string) => Promise<MoodEntry>;
  update: (id: string, input: MoodInput) => Promise<MoodEntry>;
  remove: (id: string) => Promise<void>;
  refreshEntry: (id: string) => Promise<void>;
};
const MoodHistoryContext = createContext<MoodHistory | null>(null);
function chronological(entries: MoodEntry[]) {
  return entries.sort(
    (a, b) =>
      a.createdAt.localeCompare(b.createdAt) || a._id.localeCompare(b._id),
  );
}
export function MoodHistoryProvider({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const userId = user?.id;
  const { pathname } = useLocation();
  const usesHistory = pathname === "/dashboard" || pathname === "/journal";
  const currentUser = useRef(userId);
  currentUser.current = userId;
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  // A late read must not overwrite a more recent successful mutation.
  const revision = useRef(0);
  const reload = useCallback(async () => {
    controller.current?.abort();
    if (!userId) {
      setEntries([]);
      setLoading(false);
      setError("");
      return;
    }
    const request = new AbortController();
    controller.current = request;
    const startedRevision = revision.current;
    setLoading(true);
    setError("");
    try {
      const data = await getMoods(request.signal);
      if (
        !request.signal.aborted &&
        currentUser.current === userId &&
        revision.current === startedRevision
      )
        setEntries(data.entries);
    } catch (err) {
      if (request.signal.aborted || currentUser.current !== userId) return;
      if (err instanceof ApiError && err.status === 401) logout();
      else setError("Your garden couldn’t reconnect. Please try again.");
    } finally {
      if (!request.signal.aborted && currentUser.current === userId)
        setLoading(false);
    }
  }, [userId, logout]);
  useEffect(() => {
    setEntries([]);
    revision.current += 1;
    if (usesHistory) void reload();
    else {
      controller.current?.abort();
      setLoading(false);
    }
    return () => controller.current?.abort();
  }, [reload, usesHistory]);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (usesHistory && event.key === "moodgarden.history-change")
        void reload();
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [reload, usesHistory]);
  function notify() {
    try {
      localStorage.setItem("moodgarden.history-change", crypto.randomUUID());
    } catch {
      /* Cross-tab notification is optional; the database save already succeeded. */
    }
  }
  function merge(entry: MoodEntry, mutation = true) {
    if (entry.userId !== currentUser.current) return;
    if (mutation) revision.current += 1;
    setEntries((current) =>
      chronological([
        ...current.filter((value) => value._id !== entry._id),
        entry,
      ]),
    );
  }
  async function authenticated<T>(action: () => Promise<T>) {
    const owner = currentUser.current;
    try {
      return await action();
    } catch (err) {
      if (
        owner === currentUser.current &&
        err instanceof ApiError &&
        err.status === 401
      )
        logout();
      throw err;
    }
  }
  async function create(input: MoodInput, requestId: string) {
    const result = await authenticated(() =>
      plantMood({ ...input, clientRequestId: requestId }),
    );
    merge(result.entry);
    notify();
    return result.entry;
  }
  async function update(id: string, input: MoodInput) {
    const result = await authenticated(() => updateMood(id, input));
    merge(result.entry);
    notify();
    return result.entry;
  }
  async function remove(id: string) {
    const owner = currentUser.current;
    await authenticated(() => deleteMood(id));
    if (owner === currentUser.current) {
      revision.current += 1;
      setEntries((current) => current.filter((entry) => entry._id !== id));
      notify();
    }
  }
  const refreshEntry = useCallback(
    async (id: string) => {
      const startedRevision = revision.current;
      const owner = currentUser.current;
      try {
        const result = await getMood(id);
        if (revision.current === startedRevision) merge(result.entry, false);
      } catch (err) {
        if (
          owner === currentUser.current &&
          err instanceof ApiError &&
          err.status === 401
        )
          logout();
        throw err;
      }
    },
    [logout],
  );
  return (
    <MoodHistoryContext.Provider
      value={{
        entries: entries.filter((entry) => entry.userId === userId),
        loading,
        error,
        reload,
        create,
        update,
        remove,
        refreshEntry,
      }}
    >
      {children}
    </MoodHistoryContext.Provider>
  );
}
export function useMoodHistory() {
  const value = useContext(MoodHistoryContext);
  if (!value) throw new Error("useMoodHistory requires MoodHistoryProvider");
  return value;
}
