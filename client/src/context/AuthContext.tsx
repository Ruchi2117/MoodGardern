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
  getCurrentUser,
  loginUser,
  registerUser,
  type AuthResult,
  type User,
} from "../services/api";
type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
};
const AuthContext = createContext<AuthState | null>(null);
const tokenKey = "moodgarden.token";
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState<string | null>(null);
  const version = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const logout = useCallback(() => {
    version.current++;
    controller.current?.abort();
    localStorage.removeItem(tokenKey);
    setUser(null);
    setError(null);
    setLoading(false);
  }, []);
  const refresh = useCallback(async () => {
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    const started = ++version.current;
    const token = localStorage.getItem(tokenKey);
    setError(null);
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await getCurrentUser(token, request.signal);
      if (
        started === version.current &&
        localStorage.getItem(tokenKey) === token
      )
        setUser(result.user);
    } catch (err) {
      if (request.signal.aborted || started !== version.current) return;
      if (err instanceof ApiError && err.status === 401) logout();
      else {
        setUser(null);
        setError(
          err instanceof Error ? err.message : "We couldn’t open your account.",
        );
      }
    } finally {
      if (started === version.current) setLoading(false);
    }
  }, [logout]);
  useEffect(() => {
    void refresh();
    const sync = (event: StorageEvent) => {
      if (event.key === tokenKey) void refresh();
    };
    window.addEventListener("storage", sync);
    return () => {
      controller.current?.abort();
      window.removeEventListener("storage", sync);
    };
  }, [refresh]);
  async function authenticate(action: () => Promise<AuthResult>) {
    controller.current?.abort();
    const started = ++version.current;
    const result = await action();
    const current = await getCurrentUser(result.token);
    if (started !== version.current)
      throw new Error("This sign-in was interrupted. Please try again.");
    localStorage.setItem(tokenKey, result.token);
    setUser(current.user);
    setError(null);
    setLoading(false);
  }
  const login = (email: string, password: string) =>
    authenticate(() => loginUser({ email, password }));
  const register = (name: string, email: string, password: string) =>
    authenticate(() => registerUser({ name, email, password }));
  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, register, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth requires AuthProvider");
  return value;
}
