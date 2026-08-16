import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Clock, Repeat } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SpeakButton } from "@/components/exercises";
import { dueReviews, useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/powtorki")({
  head: () => ({
    meta: [
      { title: "Powtórki SRS — indonezyjskie słowa i gramatyka" },
      {
        name: "description",
        content:
          "Inteligentne powtórki: słowa i zasady, przy których się wahasz, wracają w optymalnych odstępach (10 min, godzina, dzień).",
      },
      { property: "og:title", content: "Powtórki SRS — Belajar!" },
      {
        property: "og:description",
        content: "Mikro-quizy dopasowane do Twoich błędów i czasu reakcji.",
      },
    ],
  }),
  component: Reviews,
});

function fmt(due: number) {
  const diff = due - Date.now();
  if (diff <= 0) return "teraz";
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `za ${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `za ${hours} h`;
  return `za ${Math.round(hours / 24)} dni`;
}

function Reviews() {
  const { srs, reviewDone, addXp } = useProgress();
  const due = useMemo(() => dueReviews(srs), [srs]);
  const [revealed, setRevealed] = useState(false);
  const item = due[0];

  return (
    <AppShell title="Powtórki">
      <div className="card-pop mb-5 p-5">
        <p className="flex items-center gap-2 font-display text-xl font-extrabold">
          <Repeat className="size-5 text-primary" /> System powtórek SRS
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Słowa i zasady, przy których się wahasz lub mylisz, wracają automatycznie: po 10 minutach,
          godzinie, dniu, 3 dniach i tygodniu.
        </p>
      </div>

      {item ? (
        <div className="card-pop p-6 text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Do powtórki teraz · {due.length}
          </p>
          <p className="mt-3 font-display text-3xl font-extrabold">{item.id}</p>
          <div className="mt-3 flex justify-center">
            <SpeakButton text={item.id} />
          </div>
          {revealed ? (
            <p className="mt-4 text-lg font-semibold text-muted-foreground">{item.pl}</p>
          ) : (
            <button
              className="btn-3d mt-6 w-full rounded-2xl bg-muted px-5 py-3.5 font-display font-extrabold active:btn-3d-press"
              onClick={() => setRevealed(true)}
            >
              Pokaż tłumaczenie
            </button>
          )}

          {revealed && (
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                className="btn-3d rounded-2xl bg-destructive px-4 py-3 font-display font-extrabold text-destructive-foreground active:btn-3d-press"
                onClick={() => {
                  reviewDone(item.key, false);
                  setRevealed(false);
                }}
              >
                Nie pamiętam
              </button>
              <button
                className="btn-3d rounded-2xl bg-primary px-4 py-3 font-display font-extrabold text-primary-foreground active:btn-3d-press"
                onClick={() => {
                  reviewDone(item.key, true);
                  addXp(5);
                  setRevealed(false);
                }}
              >
                Pamiętam!
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="card-pop p-8 text-center">
          <p className="text-4xl">🌴</p>
          <p className="mt-2 font-display text-xl font-extrabold">Brak powtórek na teraz</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Wróć później albo zrób nową lekcję — trudne słowa same tu trafią.
          </p>
        </div>
      )}

      {srs.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 font-display text-lg font-extrabold">Harmonogram</h2>
          <ul className="space-y-2">
            {[...srs]
              .sort((a, b) => a.due - b.due)
              .map((s) => (
                <li
                  key={s.key}
                  className={cn(
                    "flex items-center justify-between rounded-2xl bg-card p-3 text-sm",
                    s.due <= Date.now() && "border-2 border-primary",
                  )}
                >
                  <span className="font-bold">
                    {s.id} <span className="font-normal text-muted-foreground">— {s.pl}</span>
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="size-3.5" /> {fmt(s.due)}
                  </span>
                </li>
              ))}
          </ul>
        </section>
      )}
    </AppShell>
  );
}
