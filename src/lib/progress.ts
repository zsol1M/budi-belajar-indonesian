import { useCallback, useSyncExternalStore } from "react";
import { CURRICULUM, LEVEL_ORDER, type Level } from "./curriculum";

export type SrsItem = {
  key: string;
  id: string;
  pl: string;
  lessonId: string;
  due: number;
  stage: number;
};

export type ProgressState = {
  xp: number;
  streak: number;
  lastDay: string | null;
  completed: string[];
  scores: Record<string, number>;
  srs: SrsItem[];
};

const STORAGE_KEY = "belajar-progress-v1";

const EMPTY: ProgressState = {
  xp: 0,
  streak: 0,
  lastDay: null,
  completed: [],
  scores: {},
  srs: [],
};

let state: ProgressState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function today() {
  return new Date().toISOString().slice(0, 10);
}

function load(): ProgressState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...(JSON.parse(raw) as ProgressState) };
  } catch {
    return EMPTY;
  }
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

function ensureLoaded() {
  if (!loaded && typeof window !== "undefined") {
    state = load();
    loaded = true;
  }
  return state;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useProgress() {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => ensureLoaded(),
    () => EMPTY,
  );

  const addXp = useCallback((amount: number) => {
    ensureLoaded();
    const day = today();
    let streak = state.streak;
    if (state.lastDay !== day) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      streak = state.lastDay === yesterday ? state.streak + 1 : 1;
    }
    state = { ...state, xp: state.xp + amount, streak, lastDay: day };
    persist();
  }, []);

  const completeLesson = useCallback((lessonId: string, score: number) => {
    ensureLoaded();
    const completed = state.completed.includes(lessonId)
      ? state.completed
      : [...state.completed, lessonId];
    state = {
      ...state,
      completed,
      scores: { ...state.scores, [lessonId]: Math.max(score, state.scores[lessonId] ?? 0) },
    };
    persist();
  }, []);

  const scheduleReview = useCallback(
    (item: { id: string; pl: string; lessonId: string }, performance: "hard" | "fail") => {
      ensureLoaded();
      const key = `${item.lessonId}:${item.id}`;
      const existing = state.srs.find((s) => s.key === key);
      const stage = performance === "fail" ? 0 : Math.min((existing?.stage ?? 0) + 1, 4);
      const intervals = [10 * 60_000, 60 * 60_000, 86_400_000, 3 * 86_400_000, 7 * 86_400_000];
      const next: SrsItem = {
        key,
        id: item.id,
        pl: item.pl,
        lessonId: item.lessonId,
        stage,
        due: Date.now() + (intervals[stage] ?? 600_000),
      };
      state = { ...state, srs: [...state.srs.filter((s) => s.key !== key), next] };
      persist();
    },
    [],
  );

  const reviewDone = useCallback((key: string, ok: boolean) => {
    ensureLoaded();
    const item = state.srs.find((s) => s.key === key);
    if (!item) return;
    if (ok && item.stage >= 4) {
      state = { ...state, srs: state.srs.filter((s) => s.key !== key) };
    } else {
      const stage = ok ? Math.min(item.stage + 1, 4) : 0;
      const intervals = [10 * 60_000, 60 * 60_000, 86_400_000, 3 * 86_400_000, 7 * 86_400_000];
      state = {
        ...state,
        srs: state.srs.map((s) =>
          s.key === key ? { ...s, stage, due: Date.now() + (intervals[stage] ?? 600_000) } : s,
        ),
      };
    }
    persist();
  }, []);

  const reset = useCallback(() => {
    state = EMPTY;
    persist();
  }, []);

  return { ...snapshot, addXp, completeLesson, scheduleReview, reviewDone, reset };
}

export function isLessonUnlocked(lessonId: string, completed: string[]) {
  const index = CURRICULUM.findIndex((l) => l.id === lessonId);
  if (index <= 0) return true;
  const prev = CURRICULUM[index - 1];
  return prev ? completed.includes(prev.id) : true;
}

export function levelProgress(level: Level, completed: string[]) {
  const lessons = CURRICULUM.filter((l) => l.level === level);
  const done = lessons.filter((l) => completed.includes(l.id)).length;
  return { done, total: lessons.length, pct: Math.round((done / lessons.length) * 100) };
}

export function currentLevel(completed: string[]): Level {
  for (const level of LEVEL_ORDER) {
    const { done, total } = levelProgress(level, completed);
    if (done < total) return level;
  }
  return "B2";
}

export function dueReviews(srs: SrsItem[]) {
  return srs.filter((s) => s.due <= Date.now());
}
