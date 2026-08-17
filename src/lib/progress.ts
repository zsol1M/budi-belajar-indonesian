import { useCallback, useSyncExternalStore } from "react";
import { CURRICULUM, LEVEL_ORDER, type Level } from "./curriculum";
import { supabase } from "@/integrations/supabase/client";

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
  hearts: number;
  lastDay: string | null;
  completed: string[];
  scores: Record<string, number>;
  srs: SrsItem[];
  lastContext: string | null;
};

const STORAGE_KEY = "belajar-progress-v2";
export const MAX_HEARTS = 5;

const EMPTY: ProgressState = {
  xp: 0,
  streak: 0,
  hearts: MAX_HEARTS,
  lastDay: null,
  completed: [],
  scores: {},
  srs: [],
  lastContext: null,
};

let state: ProgressState = EMPTY;
let loaded = false;
let cloudUserId: string | null = null;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
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

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  emit();
  schedulePush();
}

function schedulePush() {
  if (!cloudUserId) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => void pushCloud(), 800);
}

async function pushCloud() {
  if (!cloudUserId) return;
  await supabase.from("learning_progress").upsert(
    {
      user_id: cloudUserId,
      xp: state.xp,
      streak: state.streak,
      hearts: state.hearts,
      last_day: state.lastDay,
      completed: state.completed,
      scores: state.scores,
      srs: state.srs as unknown as never,
      last_context: state.lastContext,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
}

/** Pobiera postęp z chmury i scala go z lokalnym (wygrywa większy postęp). */
export async function syncFromCloud(userId: string) {
  cloudUserId = userId;
  ensureLoaded();
  const { data } = await supabase
    .from("learning_progress")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (data) {
    const remote: ProgressState = {
      xp: data.xp ?? 0,
      streak: data.streak ?? 0,
      hearts: data.hearts ?? MAX_HEARTS,
      lastDay: data.last_day ?? null,
      completed: data.completed ?? [],
      scores: (data.scores as Record<string, number>) ?? {},
      srs: (data.srs as unknown as SrsItem[]) ?? [],
      lastContext: data.last_context ?? null,
    };
    const mergedCompleted = Array.from(new Set([...state.completed, ...remote.completed]));
    const srsMap = new Map<string, SrsItem>();
    [...remote.srs, ...state.srs].forEach((s) => srsMap.set(s.key, s));
    state = {
      xp: Math.max(state.xp, remote.xp),
      streak: Math.max(state.streak, remote.streak),
      hearts: state.lastDay === today() ? Math.min(state.hearts, remote.hearts) : MAX_HEARTS,
      lastDay: state.lastDay && state.lastDay > (remote.lastDay ?? "") ? state.lastDay : remote.lastDay,
      completed: mergedCompleted,
      scores: { ...remote.scores, ...state.scores },
      srs: [...srsMap.values()],
      lastContext: state.lastContext ?? remote.lastContext,
    };
  }
  persist();
}

export function detachCloud() {
  cloudUserId = null;
  state = EMPTY;
  if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
  emit();
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
    let hearts = state.hearts;
    if (state.lastDay !== day) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      streak = state.lastDay === yesterday ? state.streak + 1 : 1;
      hearts = MAX_HEARTS;
    }
    state = { ...state, xp: state.xp + amount, streak, hearts, lastDay: day };
    persist();
  }, []);

  const loseHeart = useCallback(() => {
    ensureLoaded();
    state = { ...state, hearts: Math.max(0, state.hearts - 1) };
    persist();
  }, []);

  const refillHearts = useCallback(() => {
    ensureLoaded();
    state = { ...state, hearts: MAX_HEARTS };
    persist();
  }, []);

  const completeLesson = useCallback((lessonId: string, score: number, context?: string | null) => {
    ensureLoaded();
    const completed = state.completed.includes(lessonId)
      ? state.completed
      : [...state.completed, lessonId];
    state = {
      ...state,
      completed,
      scores: { ...state.scores, [lessonId]: Math.max(score, state.scores[lessonId] ?? 0) },
      lastContext: context ?? state.lastContext,
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

  return {
    ...snapshot,
    addXp,
    loseHeart,
    refillHearts,
    completeLesson,
    scheduleReview,
    reviewDone,
    reset,
  };
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
