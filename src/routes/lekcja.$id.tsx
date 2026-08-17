import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, BookOpen, Loader2, PartyPopper, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ExerciseCard, SpeakButton, type ExerciseResult } from "@/components/exercises";
import { lessonById } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";
import { lessonReward } from "@/lib/ai.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lekcja/$id")({
  head: () => ({
    meta: [
      { title: "Lekcja gramatyki — Belajar! Indonezyjski" },
      {
        name: "description",
        content:
          "Interaktywna lekcja bahasa Indonesia po polsku: wyjaśnienie gramatyki, fiszki, budowanie zdań i klocki afiksów.",
      },
      { property: "og:title", content: "Lekcja gramatyki — Belajar!" },
      { property: "og:description", content: "Ucz się indonezyjskiej gramatyki krok po kroku." },
    ],
  }),
  component: LessonPage,
});

const primaryBtn =
  "btn-3d w-full rounded-2xl bg-primary px-5 py-3.5 font-display text-base font-extrabold text-primary-foreground active:btn-3d-press disabled:opacity-50";

function LessonPage() {
  const { id } = Route.useParams();
  const lesson = lessonById(id);
  const navigate = useNavigate();
  const { addXp, completeLesson, scheduleReview, loseHeart } = useProgress();

  const [stage, setStage] = useState<"grammar" | "quiz" | "result">("grammar");
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<ExerciseResult[]>([]);

  const reward = useMutation({
    mutationFn: () =>
      lessonReward({
        data: {
          lesson: lesson!.title,
          grammar: lesson!.grammar.body.join(" "),
          words: lesson!.vocab.map((v) => v.id),
        },
      }),
  });

  if (!lesson) {
    return (
      <AppShell>
        <p className="text-center font-bold">Nie znaleziono lekcji.</p>
      </AppShell>
    );
  }

  const total = lesson.exercises.length;
  const correct = results.filter((r) => r.ok).length;
  const score = results.length ? Math.round((correct / results.length) * 100) : 0;
  const passed = lesson.checkpoint ? score >= 80 : score >= 50;

  function handleDone(r: ExerciseResult) {
    const slow = r.ms > 12000;
    const ex = lesson!.exercises[index];
    setResults((prev) => [...prev, r]);

    if (!r.ok || slow) {
      const pair = lesson!.vocab[index % lesson!.vocab.length];
      scheduleReview(
        {
          id: ex && ex.kind === "flashcard" ? ex.front : (pair?.id ?? lesson!.title),
          pl: ex && ex.kind === "flashcard" ? ex.back : (pair?.pl ?? lesson!.subtitle),
          lessonId: lesson!.id,
        },
        r.ok ? "hard" : "fail",
      );
      if (!r.ok) loseHeart();
    } else {
      addXp(10);
    }

    if (index + 1 < total) {
      setIndex(index + 1);
    } else {
      const finalScore = Math.round(
        ((correct + (r.ok ? 1 : 0)) / (results.length + 1)) * 100,
      );
      const didPass = lesson!.checkpoint ? finalScore >= 80 : finalScore >= 50;
      if (didPass) {
        addXp(lesson!.checkpoint ? 60 : 30);
        completeLesson(lesson!.id, finalScore, lesson!.context?.label ?? lesson!.title);
        reward.mutate();
      }
      setStage("result");
    }
  }

  return (
    <AppShell title={lesson.title}>
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-muted-foreground"
      >
        <ArrowLeft className="size-4" /> Ścieżka nauki
      </Link>

      {stage === "grammar" && (
        <div className="animate-pop-in">
          <div className="card-pop p-5">
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-secondary">
              <BookOpen className="size-4" /> {lesson.level} · gramatyka
            </p>
            <h1 className="mt-2 font-display text-2xl font-extrabold">{lesson.grammar.title}</h1>
            <ul className="mt-4 space-y-3">
              {lesson.grammar.body.map((b) => (
                <li key={b} className="rounded-2xl bg-muted/70 p-3 text-sm leading-relaxed">
                  {b}
                </li>
              ))}
            </ul>

            <p className="mt-5 text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Przykłady
            </p>
            <ul className="mt-2 space-y-2">
              {lesson.grammar.examples.map((e) => (
                <li key={e.id} className="flex items-center gap-3 rounded-2xl bg-primary/8 p-3">
                  <SpeakButton text={e.id} />
                  <div>
                    <p className="font-display font-extrabold">{e.id}</p>
                    <p className="text-sm text-muted-foreground">{e.pl}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {lesson.checkpoint && (
            <p className="mt-4 flex items-start gap-2 rounded-2xl bg-accent/12 p-3 text-sm font-semibold text-accent">
              <ShieldAlert className="mt-0.5 size-4 shrink-0" />
              To sprawdzian poziomu — potrzebujesz min. 80% poprawnych odpowiedzi, żeby odblokować
              kolejny poziom.
            </p>
          )}

          <button className={cn(primaryBtn, "mt-6")} onClick={() => setStage("quiz")}>
            Zaczynamy ćwiczenia
          </button>
        </div>
      )}

      {stage === "quiz" && (
        <div>
          <div className="mb-5 flex items-center gap-3">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(index / total) * 100}%` }}
              />
            </div>
            <span className="text-sm font-bold text-muted-foreground">
              {index + 1}/{total}
            </span>
          </div>
          <div className="card-pop p-5">
            <ExerciseCard exercise={lesson.exercises[index]!} onDone={handleDone} />
          </div>
        </div>
      )}

      {stage === "result" && (
        <div className="animate-pop-in space-y-4">
          <div className="card-pop p-6 text-center">
            <p className="text-5xl">{passed ? "🎉" : "😥"}</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold">
              {passed ? "Lekcja zaliczona!" : "Jeszcze nie tym razem"}
            </h2>
            <p className="mt-1 text-muted-foreground">
              Wynik: {score}% ({correct}/{results.length})
            </p>
            {!passed && (
              <p className="mt-3 rounded-2xl bg-destructive/10 p-3 text-sm font-semibold text-destructive">
                {lesson.checkpoint
                  ? "Sprawdzian wymaga 80%. Powtórz gramatykę i spróbuj ponownie — kolejny poziom pozostaje zablokowany."
                  : "Potrzebujesz min. 50%. Spróbuj jeszcze raz!"}
              </p>
            )}
          </div>

          {passed && (
            <div className="card-pop p-5">
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-accent">
                <PartyPopper className="size-4" /> Nagroda AI: mem i historyjka
              </p>
              {reward.isPending && (
                <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> AI tworzy mem z Twoich nowych słów…
                </p>
              )}
              {reward.isError && (
                <p className="mt-3 text-sm font-semibold text-destructive">
                  {(reward.error as Error).message}
                </p>
              )}
              {reward.data && (
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl bg-foreground p-5 text-center">
                    <p className="font-display text-lg font-extrabold uppercase text-background">
                      {reward.data.memeTop}
                    </p>
                    <p className="my-3 text-5xl">{reward.data.emoji}</p>
                    <p className="font-display text-lg font-extrabold uppercase text-background">
                      {reward.data.memeBottom}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{reward.data.memePl}</p>
                  <div className="rounded-2xl bg-secondary/10 p-4">
                    <div className="flex items-start gap-3">
                      <SpeakButton text={reward.data.story} />
                      <div>
                        <p className="font-display font-extrabold">{reward.data.story}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{reward.data.storyPl}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              className="btn-3d flex-1 rounded-2xl bg-muted px-4 py-3.5 font-display font-extrabold active:btn-3d-press"
              onClick={() => {
                setResults([]);
                setIndex(0);
                setStage("grammar");
              }}
            >
              Powtórz lekcję
            </button>
            <button className={primaryBtn} onClick={() => navigate({ to: "/" })}>
              Wróć na ścieżkę
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
