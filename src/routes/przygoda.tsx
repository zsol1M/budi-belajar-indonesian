import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { playIndonesian, SpeakButton } from "@/components/exercises";
import { adventureTurn } from "@/lib/ai.functions";
import { currentLevel, useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/przygoda")({
  head: () => ({
    meta: [
      { title: "Przygody RPG po indonezyjsku — Belajar!" },
      {
        name: "description",
        content:
          "Tekstowe przygody RPG generowane przez AI: lotnisko w Dżakarcie, nasi goreng na Bali. Każdy Twój wybór zmienia fabułę.",
      },
      { property: "og:title", content: "Przygody RPG po indonezyjsku" },
      {
        property: "og:description",
        content: "Graj po indonezyjsku — AI prowadzi historię i poprawia Twój język.",
      },
    ],
  }),
  component: Adventure,
});

const SCENARIOS = [
  { id: "Przylot na lotnisko w Dżakarcie", emoji: "✈️", pl: "Lotnisko Soekarno-Hatta" },
  { id: "Zamawianie nasi goreng w warungu na Bali", emoji: "🍜", pl: "Warung na Bali" },
  { id: "Targowanie się o cenę na pasar w Yogyakarcie", emoji: "🛍️", pl: "Targ w Yogyi" },
  { id: "Zgubiony motocykl i wizyta na posterunku policji", emoji: "🛵", pl: "Zaginiony motor" },
];

type Turn = { role: "user" | "assistant"; content: string; translation?: string };

function Adventure() {
  const { completed, addXp } = useProgress();
  const level = currentLevel(completed);
  const [scenario, setScenario] = useState<string | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [hints, setHints] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [input, setInput] = useState("");
  const [showPl, setShowPl] = useState(true);

  const play = useMutation({
    mutationFn: async ({ text, sc }: { text: string; sc: string }) => {
      const history = [...turns, { role: "user" as const, content: text }].map((t) => ({
        role: t.role,
        content: t.content,
      }));
      return adventureTurn({ data: { scenario: sc, level, history: history.slice(-16) } });
    },
    onSuccess: (res) => {
      setTurns((t) => [...t, { role: "assistant", content: res.scene, translation: res.translation }]);
      setHints(res.hints?.slice(0, 3) ?? []);
      setFeedback(res.feedback ?? "");
      addXp(8);
      void playIndonesian(res.scene);
    },
  });

  function start(sc: string) {
    setScenario(sc);
    setTurns([]);
    play.mutate({ text: "Mulai petualangan.", sc });
  }

  function send(text: string) {
    const value = text.trim();
    if (!value || !scenario || play.isPending) return;
    setTurns((t) => [...t, { role: "user", content: value }]);
    setInput("");
    play.mutate({ text: value, sc: scenario });
  }

  if (!scenario) {
    return (
      <AppShell title="Przygody RPG">
        <h1 className="font-display text-2xl font-extrabold">Wybierz przygodę</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI poprowadzi historię po indonezyjsku. Piszesz, co robisz — fabuła zmienia się na bieżąco.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => start(s.id)}
              className="card-pop flex items-center gap-3 p-4 text-left"
            >
              <span className="text-3xl">{s.emoji}</span>
              <span>
                <span className="block font-display font-extrabold">{s.pl}</span>
                <span className="block text-sm text-muted-foreground">{s.id}</span>
              </span>
            </button>
          ))}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Przygoda">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-display font-extrabold">
          <Sparkles className="size-4 text-accent" /> {scenario}
        </p>
        <button
          onClick={() => setScenario(null)}
          className="rounded-full bg-muted px-3 py-1.5 text-sm font-bold text-muted-foreground"
        >
          Zmień
        </button>
      </div>

      <button
        onClick={() => setShowPl((v) => !v)}
        className={cn(
          "mb-3 rounded-full px-3 py-1.5 text-sm font-bold",
          showPl ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground",
        )}
      >
        Tłumaczenie
      </button>

      <div className="space-y-3">
        {turns.map((t, i) =>
          t.role === "assistant" ? (
            <div key={i} className="card-pop flex items-start gap-3 p-4">
              <SpeakButton text={t.content} />
              <div>
                <p className="font-semibold leading-relaxed">{t.content}</p>
                {showPl && t.translation && (
                  <p className="mt-1.5 text-sm text-muted-foreground">{t.translation}</p>
                )}
              </div>
            </div>
          ) : (
            <p
              key={i}
              className="ml-auto max-w-[85%] rounded-3xl bg-primary p-3.5 font-semibold text-primary-foreground"
            >
              {t.content}
            </p>
          ),
        )}
        {play.isPending && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> AI pisze dalszy ciąg…
          </p>
        )}
      </div>

      {feedback && (
        <p className="mt-4 rounded-2xl bg-secondary/12 p-3 text-sm font-semibold text-secondary">
          {feedback}
        </p>
      )}
      {play.isError && (
        <p className="mt-3 text-sm font-semibold text-destructive">
          {(play.error as Error).message}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {hints.map((h) => (
          <button
            key={h}
            onClick={() => send(h)}
            className="rounded-full border-2 border-accent/40 bg-accent/10 px-3 py-1.5 text-sm font-bold text-accent"
          >
            {h}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Co robisz? Napisz po indonezyjsku…"
          className="h-12 flex-1 rounded-2xl border-2 border-border bg-card px-4 font-semibold outline-none focus:border-accent"
        />
        <button
          onClick={() => send(input)}
          disabled={play.isPending}
          aria-label="Wyślij"
          className="btn-3d flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground active:btn-3d-press disabled:opacity-50"
        >
          <Send className="size-5" />
        </button>
      </div>
    </AppShell>
  );
}
