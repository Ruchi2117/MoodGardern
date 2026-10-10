export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};
export type AuthResult = { user: User; token: string };
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
const apiBase = (import.meta.env.VITE_API_URL?.trim() || "/api").replace(
  /\/$/,
  "",
);
async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBase}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new ApiError(
      "The garden service is unavailable. Please try again.",
      0,
    );
  }
  const body = await response.json().catch(() => null);
  if (!response.ok)
    throw new ApiError(
      body?.error?.message ||
        (response.status >= 500
          ? "We couldn’t reconnect to your garden. Please try again."
          : "Something went wrong. Please try again."),
      response.status,
    );
  if (!body?.data)
    throw new ApiError(
      "The garden service returned an unexpected response.",
      0,
    );
  return body.data;
}
export const getHealth = (signal?: AbortSignal) =>
  request<{ status: string; service: string }>("/health", { signal });
export const companionStatus = (signal?: AbortSignal) =>
  request<{ available: boolean }>("/companion/status", { signal }, sessionToken());
export const askCompanion = (messages: {role:"user"|"assistant";content:string}[], signal?: AbortSignal) =>
  request<{reply:string;source:"ai"}>("/companion/chat", {method:"POST",body:JSON.stringify({messages}),signal}, sessionToken());
export const getCurrentUser = (token: string, signal?: AbortSignal) =>
  request<{ user: User }>("/auth/me", { signal }, token);
export const registerUser = (data: {
  name: string;
  email: string;
  password: string;
}) =>
  request<AuthResult>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const loginUser = (data: { email: string; password: string }) =>
  request<AuthResult>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

export type { Mood, Activity } from "../../../shared/moods.js";
import type { Mood, Activity, PlantType } from "../../../shared/moods.js";
export type MoodEntry = {
  _id: string;
  userId: string;
  mood: Mood;
  note: string;
  activities: Activity[];
  energy: number;
  createdAt: string;
  updatedAt: string;
};
export type MoodInput = {
  mood: Mood;
  note: string;
  activities: Activity[];
  energy: number;
};
export type PlantedFeeling = {
  entry: MoodEntry;
  gardenUpdate: { plantType: PlantType; mood: Mood; growthPoints: number };
};
function sessionToken() {
  const token = localStorage.getItem("moodgarden.token");
  if (!token) throw new ApiError("Please log in to continue.", 401);
  return token;
}
export const getMoods = (signal?: AbortSignal) =>
  request<{ entries: MoodEntry[]; growthPoints: number }>(
    "/moods",
    { signal },
    sessionToken(),
  );
export const plantMood = (data: MoodInput & { clientRequestId: string }) =>
  request<PlantedFeeling>(
    "/moods",
    { method: "POST", body: JSON.stringify(data) },
    sessionToken(),
  );
export const getMood = (id: string) =>
  request<{ entry: MoodEntry }>(
    `/moods/${encodeURIComponent(id)}`,
    {},
    sessionToken(),
  );
export const updateMood = (id: string, data: MoodInput) =>
  request<PlantedFeeling>(
    `/moods/${encodeURIComponent(id)}`,
    { method: "PUT", body: JSON.stringify(data) },
    sessionToken(),
  );
export const deleteMood = (id: string) =>
  request<{ deletedId: string }>(
    `/moods/${encodeURIComponent(id)}`,
    { method: "DELETE" },
    sessionToken(),
  );

export type RitualTask = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt: string | null;
};
export type Ritual = {
  _id: string;
  userId: string;
  date: string;
  tasks: RitualTask[];
  growthAwarded: number;
  createdAt: string;
  updatedAt: string;
};
export type RitualResult = { ritual: Ritual; ritualGrowthPoints: number };
function zoneQuery() {
  return `timeZone=${encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone)}`;
}
export const getRituals = (signal?: AbortSignal) =>
  request<RitualResult>(
    `/rituals/today?${zoneQuery()}`,
    { signal },
    sessionToken(),
  );
export const completeRitual = (id: string) =>
  request<RitualResult>(
    `/rituals/today/tasks/${encodeURIComponent(id)}?${zoneQuery()}`,
    { method: "PUT", body: JSON.stringify({ completed: true }) },
    sessionToken(),
  );

export type InsightPeriod = "7" | "30" | "all";
export type InsightData = {
  period: InsightPeriod;
  timeZone: string;
  today: string;
  start: string | null;
  timelineStart: string;
  timelineSevenStart: string;
  summary: {
    totalCheckIns: number;
    mostCommonMood: Mood | null;
    mostCommonMoods: Mood[];
    averageEnergy: number | null;
    energySampleCount: number;
    currentStreak: number;
  };
  moodDistribution: { mood: Mood; count: number }[];
  timeline: {
    date: string;
    recordedAt: string;
    mood: Mood;
    energy: number | null;
  }[];
  rituals: { completedCount: number };
  garden: { totalPlanted: number };
  observations: string[];
};
export const getInsights = (period: InsightPeriod, signal?: AbortSignal) =>
  request<InsightData>(
    `/insights?${zoneQuery()}&period=${period}`,
    { signal },
    sessionToken(),
  );
