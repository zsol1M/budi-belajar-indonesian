import { useMemo, useState } from "react";
import { Check, RotateCcw, Volume2, X } from "lucide-react";
import type { Exercise } from "@/lib/curriculum";
import { cn } from "@/lib/utils";
import { speakIndonesian } from "@/lib/ai.functions";

export type ExerciseResult = { ok: boolean; ms: number; prompt: string; answer: string };

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export async function playIndonesian(text: string) {
  try {
    const { audio } = await speakIndonesian({ data: { text } });
    const el = new Audio(`data:audio/mpeg;base64,${audio}`);
    await el.play();
  } catch {
    /* audio jest opcjonalne */
  }
}

export function SpeakButton({ text }: { text: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      aria-label="Odsłuchaj po indonezyjsku"
      onClick={async () => {
        setBusy(true);
        await playIndonesian(text);
        setBusy(false);
      }}
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary transition-transform",
        busy && "animate-pulse",
      )}
    >
      <Volume2 className="size-5" />
    </button>
  );
}

function Feedback({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div
      className={cn(
        "animate-pop-in mt-4 flex items-start gap-2 rounded-2xl p-3 text-sm font-semibold",
        ok ? "bg-success/15 text-success" : "bg-destructive/12 text-destructive",
      )}
    >
      {ok ? <Check className="mt-0.5 size-4 shrink-0" /> : <X className="mt-0.5 size-4 shrink-0" />}
      <span>{text}</span>
    </div>
  );
}

const primaryBtn =
  "btn-3d w-full rounded-2xl bg-primary px-5 py-3.5 font-display text-base font-extrabold text-primary-foreground active:btn-3d-press disabled:opacity-50";

export function ExerciseCard({
  exercise,
  onDone,
}: {
  exercise: Exercise;
  onDone: (r: ExerciseResult) => void;
}) {
  const started = useMemo(() => Date.now(), [exercise]);
  const finish = (ok: boolean, prompt: string, answer: string) =>
    onDone({ ok, ms: Date.now() - started, prompt, answer });

  switch (exercise.kind) {
    case "flashcard":
      return <Flashcard key={exercise.id} ex={exercise} finish={finish} />;
    case "match":
      return <MatchGrid key={exercise.id} ex={exercise} finish={finish} />;
    case "builder":
      return <SentenceBuilder key={exercise.id} ex={exercise} finish={finish} />;
    case "blocks":
      return <AffixBuilder key={exercise.id} ex={exercise} finish={finish} />;
    case "choice":
      return <ChoiceQuiz key={exercise.id} ex={exercise} finish={finish} />;
  }
}

type Finish = (ok: boolean, prompt: string, answer: string) => void;

function Flashcard({ ex, finish }: { ex: Extract<Exercise, { kind: "flashcard" }>; finish: Finish }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div>
      <p className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
        Fiszka — czy znasz to słowo?
      </p>
      <button
        type="button"
        onClick={() => setFlipped(true)}
        className="card-pop flex min-h-40 w-full flex-col items-center justify-center gap-2 p-6"
      >
        <span className="font-display text-3xl font-extrabold">{ex.front}</span>
        {flipped ? (
          <span className="text-lg text-muted-foreground">{ex.back}</span>
        ) : (
          <span className="text-sm text-muted-foreground">Dotknij, aby odkryć</span>
        )}
      </button>
      <div className="mt-3 flex justify-center">
        <SpeakButton text={ex.front} />
      </div>
      {flipped && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            className="btn-3d rounded-2xl bg-muted px-4 py-3 font-display font-extrabold text-foreground active:btn-3d-press"
            onClick={() => finish(false, ex.front, ex.back)}
          >
            Nie znałem
          </button>
          <button className={primaryBtn} onClick={() => finish(true, ex.front, ex.back)}>
            Znam!
          </button>
        </div>
      )}
    </div>
  );
}

function MatchGrid({ ex, finish }: { ex: Extract<Exercise, { kind: "match" }>; finish: Finish }) {
  const left = useMemo(() => shuffle(ex.pairs), [ex]);
  const right = useMemo(() => shuffle(ex.pairs), [ex]);
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);

  const done = matched.length === ex.pairs.length;

  return (
    <div>
      <p className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
        Połącz pary
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          {left.map((p) => (
            <button
              key={p.id}
              disabled={matched.includes(p.id)}
              onClick={() => setSelected(p.id)}
              className={cn(
                "card-pop px-3 py-3 text-left font-bold",
                selected === p.id && "border-secondary bg-secondary/10",
                matched.includes(p.id) && "border-success bg-success/12 opacity-60",
              )}
            >
              {p.id}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {right.map((p) => (
            <button
              key={p.pl}
              disabled={matched.includes(p.id)}
              onClick={() => {
                if (!selected) return;
                if (selected === p.id) {
                  setMatched((m) => [...m, p.id]);
                  setSelected(null);
                } else {
                  setMistakes((m) => m + 1);
                  setWrong(p.pl);
                  setTimeout(() => setWrong(null), 500);
                }
              }}
              className={cn(
                "card-pop px-3 py-3 text-left font-bold",
                wrong === p.pl && "border-destructive bg-destructive/12",
                matched.includes(p.id) && "border-success bg-success/12 opacity-60",
              )}
            >
              {p.pl}
            </button>
          ))}
        </div>
      </div>
      {done && (
        <>
          <Feedback
            ok={mistakes === 0}
            text={mistakes === 0 ? "Perfekcyjnie! Wszystkie pary trafione." : `Pomyłki: ${mistakes}. Powtórzymy te słowa później.`}
          />
          <button
            className={cn(primaryBtn, "mt-4")}
            onClick={() =>
              finish(mistakes === 0, ex.pairs.map((p) => p.id).join(", "), "pary")
            }
          >
            Dalej
          </button>
        </>
      )}
    </div>
  );
}

function SentenceBuilder({
  ex,
  finish,
}: {
  ex: Extract<Exercise, { kind: "builder" }>;
  finish: Finish;
}) {
  const pool = useMemo(() => shuffle(ex.words), [ex]);
  const [picked, setPicked] = useState<string[]>([]);
  const [checked, setChecked] = useState<boolean | null>(null);
  const ok = picked.join(" ") === ex.solution;

  return (
    <div>
      <p className="mb-1 text-sm font-bold uppercase tracking-wide text-muted-foreground">
        Ułóż zdanie
      </p>
      <p className="mb-4 font-display text-xl font-extrabold">{ex.pl}</p>

      <div className="card-pop flex min-h-16 flex-wrap items-start gap-2 p-3">
        {picked.map((w, i) => (
          <button
            key={`${w}-${i}`}
            onClick={() => setPicked((p) => p.filter((_, idx) => idx !== i))}
            className="rounded-xl bg-secondary/15 px-3 py-2 font-bold text-secondary"
          >
            {w}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {pool.map((w, i) => {
          const used = picked.filter((p) => p === w).length;
          const total = pool.filter((p) => p === w).length;
          const disabled = used >= total;
          return (
            <button
              key={`${w}-${i}`}
              disabled={disabled}
              onClick={() => setPicked((p) => [...p, w])}
              className={cn(
                "card-pop px-3 py-2 font-bold",
                disabled && "opacity-30",
              )}
            >
              {w}
            </button>
          );
        })}
      </div>

      {checked === null ? (
        <button
          disabled={picked.length !== ex.words.length}
          className={cn(primaryBtn, "mt-6")}
          onClick={() => setChecked(true)}
        >
          Sprawdź
        </button>
      ) : (
        <>
          <Feedback
            ok={ok}
            text={ok ? `Świetnie! ${ex.solution}.` : `Poprawnie: ${ex.solution}.`}
          />
          <div className="mt-4 flex gap-3">
            <button
              className="btn-3d rounded-2xl bg-muted px-4 py-3 font-display font-extrabold active:btn-3d-press"
              onClick={() => {
                setPicked([]);
                setChecked(null);
              }}
            >
              <RotateCcw className="size-4" />
            </button>
            <button className={primaryBtn} onClick={() => finish(ok, ex.pl, ex.solution)}>
              Dalej
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function AffixBuilder({ ex, finish }: { ex: Extract<Exercise, { kind: "blocks" }>; finish: Finish }) {
  const options = useMemo(() => shuffle(ex.affixes), [ex]);
  const [chosen, setChosen] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const ok = chosen ? `${chosen}${ex.root}` === ex.answer.replace("-" + ex.root, ex.root) ||
    ex.answer === `${chosen}${ex.root}` : false;

  return (
    <div>
      <p className="mb-1 text-sm font-bold uppercase tracking-wide text-muted-foreground">
        Klocki gramatyczne
      </p>
      <p className="mb-4 font-display text-xl font-extrabold">{ex.prompt}</p>

      <div className="card-pop flex items-center justify-center gap-2 p-5">
        <span
          className={cn(
            "min-w-24 rounded-xl border-2 border-dashed border-border px-3 py-2 text-center font-bold text-muted-foreground",
            chosen && "border-solid border-accent bg-accent/12 text-accent",
          )}
        >
          {chosen ?? "afiks"}
        </span>
        <span className="font-display text-2xl font-extrabold">+</span>
        <span className="rounded-xl bg-primary/12 px-4 py-2 font-display text-xl font-extrabold text-primary">
          {ex.root}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {options.map((a) => (
          <button
            key={a}
            onClick={() => setChosen(a)}
            className={cn("card-pop px-3 py-3 font-bold", chosen === a && "border-accent")}
          >
            {a}
          </button>
        ))}
      </div>

      {!checked ? (
        <button disabled={!chosen} className={cn(primaryBtn, "mt-6")} onClick={() => setChecked(true)}>
          Sprawdź
        </button>
      ) : (
        <>
          <Feedback ok={ok} text={ok ? `Tak! ${ex.pl}` : `Poprawna forma: ${ex.pl}`} />
          <button
            className={cn(primaryBtn, "mt-4")}
            onClick={() => finish(ok, ex.prompt, ex.pl)}
          >
            Dalej
          </button>
        </>
      )}
    </div>
  );
}

function ChoiceQuiz({ ex, finish }: { ex: Extract<Exercise, { kind: "choice" }>; finish: Finish }) {
  const options = useMemo(() => shuffle(ex.options), [ex]);
  const [chosen, setChosen] = useState<string | null>(null);
  const ok = chosen === ex.answer;

  return (
    <div>
      <p className="mb-1 text-sm font-bold uppercase tracking-wide text-muted-foreground">
        Wybierz poprawną odpowiedź
      </p>
      <p className="mb-4 font-display text-xl font-extrabold">{ex.question}</p>

      <div className="flex flex-col gap-2">
        {options.map((o) => (
          <button
            key={o}
            disabled={chosen !== null}
            onClick={() => setChosen(o)}
            className={cn(
              "card-pop px-4 py-3 text-left font-bold",
              chosen !== null && o === ex.answer && "border-success bg-success/12",
              chosen === o && o !== ex.answer && "border-destructive bg-destructive/12",
            )}
          >
            {o}
          </button>
        ))}
      </div>

      {chosen !== null && (
        <>
          <Feedback ok={ok} text={ex.explain} />
          <button
            className={cn(primaryBtn, "mt-4")}
            onClick={() => finish(ok, ex.question, ex.answer)}
          >
            Dalej
          </button>
        </>
      )}
    </div>
  );
}
