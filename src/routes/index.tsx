import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Lock, Play, Repeat, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CURRICULUM, LEVEL_LABELS, LEVEL_ORDER } from "@/lib/curriculum";
import { cn } from "@/lib/utils";
import { currentLevel, dueReviews, isLessonUnlocked, levelProgress, useProgress } from "@/lib/progress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Belajar! Indonezyjski dla Polaków — kurs A1–B2" },
      {
        name: "description",
        content:
          "Grywalizowany kurs bahasa Indonesia po polsku: ścieżka A1–B2, gramatyka krok po kroku, rozmowy z AI i powtórki SRS.",
      },
      { property: "og:title", content: "Belajar! Indonezyjski dla Polaków" },
      {
        property: "og:description",
        content: "Ucz się indonezyjskiego po polsku: XP, streaki, gramatyka i tutor AI Budi.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { completed, srs, xp } = useProgress();
  const due = dueReviews(srs).length;
  const level = currentLevel(completed);

  return (
    <AppShell>
      <section className="card-pop mb-6 overflow-hidden p-5">
        <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Twój poziom
        </p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-gradient-brand">
          {LEVEL_LABELS[level]}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Zebrałeś {xp} XP. Gramatyka odblokowuje się krok po kroku — nie przejdziesz dalej bez
          zdanego sprawdzianu.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/rozmowa"
            className="btn-3d rounded-2xl bg-secondary px-4 py-2.5 font-display text-sm font-extrabold text-secondary-foreground active:btn-3d-press"
          >
            Zadzwoń do Budiego
          </Link>
          <Link
            to="/przygoda"
            className="btn-3d inline-flex items-center gap-1.5 rounded-2xl bg-accent px-4 py-2.5 font-display text-sm font-extrabold text-accent-foreground active:btn-3d-press"
          >
            <Sparkles className="size-4" /> Przygoda RPG
          </Link>
          {due > 0 && (
            <Link
              to="/powtorki"
              className="btn-3d inline-flex items-center gap-1.5 rounded-2xl bg-xp px-4 py-2.5 font-display text-sm font-extrabold text-xp-foreground active:btn-3d-press"
            >
              <Repeat className="size-4" /> {due} powtórek
            </Link>
          )}
        </div>
      </section>

      <div className="space-y-8">
        {LEVEL_ORDER.map((lvl) => {
          const { done, total, pct } = levelProgress(lvl, completed);
          const lessons = CURRICULUM.filter((l) => l.level === lvl);
          return (
            <section key={lvl}>
              <div className="mb-3 flex items-end justify-between">
                <h2 className="font-display text-xl font-extrabold">{LEVEL_LABELS[lvl]}</h2>
                <span className="text-sm font-bold text-muted-foreground">
                  {done}/{total}
                </span>
              </div>
              <div className="mb-5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
              </div>

              <ol className="relative space-y-4 pl-2">
                {lessons.map((lesson, i) => {
                  const unlocked = isLessonUnlocked(lesson.id, completed);
                  const isDone = completed.includes(lesson.id);
                  return (
                    <li
                      key={lesson.id}
                      className={cn("flex items-center gap-4", i % 2 === 1 && "ml-8")}
                    >
                      <div className="relative">
                        <div
                          className={cn(
                            "flex size-16 items-center justify-center rounded-full border-4 text-2xl",
                            isDone
                              ? "border-success bg-success/15"
                              : unlocked
                                ? "border-primary bg-card shadow-[0_6px_0_0_oklch(0.63_0.19_155_/_0.35)]"
                                : "border-border bg-muted",
                          )}
                        >
                          {isDone ? (
                            <Check className="size-7 text-success" />
                          ) : unlocked ? (
                            <span>{lesson.icon}</span>
                          ) : (
                            <Lock className="size-6 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-1.5">
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[11px] font-bold",
                              lesson.kind === "vocab"
                                ? "bg-secondary/15 text-secondary"
                                : "bg-primary/15 text-primary",
                            )}
                          >
                            {lesson.kind === "vocab" ? "Słownictwo" : "Gramatyka"}
                          </span>
                          {lesson.checkpoint && (
                            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-bold text-accent">
                              sprawdzian
                            </span>
                          )}
                          {lesson.context && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                              Budi: {lesson.context.label}
                            </span>
                          )}
                        </div>
                        <p className="truncate font-display text-base font-extrabold">
                          {lesson.title}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">{lesson.subtitle}</p>
                      </div>

                      {unlocked ? (
                        <Link
                          to="/lekcja/$id"
                          params={{ id: lesson.id }}
                          className="btn-3d inline-flex items-center gap-1 rounded-2xl bg-primary px-3.5 py-2 font-display text-sm font-extrabold text-primary-foreground active:btn-3d-press"
                        >
                          <Play className="size-4" /> {isDone ? "Powtórz" : "Start"}
                        </Link>
                      ) : (
                        <span className="rounded-2xl bg-muted px-3.5 py-2 text-sm font-bold text-muted-foreground">
                          Zablokowane
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}
