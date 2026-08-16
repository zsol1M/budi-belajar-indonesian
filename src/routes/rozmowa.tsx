import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Languages, Loader2, Mic, MicOff, PhoneCall, Send, Volume2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { playIndonesian } from "@/components/exercises";
import { budiChat, translateToPolish } from "@/lib/ai.functions";
import { currentLevel, useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/rozmowa")({
  head: () => ({
    meta: [
      { title: "Rozmowa z Budim — indonezyjski tutor AI" },
      {
        name: "description",
        content:
          "Rozmawiaj po indonezyjsku z tutorem AI Budim: mowa na głos, transkrypcja, tłumaczenie na polski i podpowiedzi.",
      },
      { property: "og:title", content: "Rozmowa z Budim — tutor AI" },
      {
        property: "og:description",
        content: "Ćwicz mówienie po indonezyjsku z AI: TTS, mikrofon i tłumaczenia po polsku.",
      },
    ],
  }),
  component: VoiceChat,
});

type Bubble = {
  role: "user" | "assistant";
  content: string;
  translation?: string;
  correction?: string;
};

function VoiceChat() {
  const { completed, addXp } = useProgress();
  const level = currentLevel(completed);
  const [bubbles, setBubbles] = useState<Bubble[]>([
    {
      role: "assistant",
      content: "Halo! Saya Budi. Apa kabar hari ini?",
      translation: "Cześć! Jestem Budi. Jak się dzisiaj masz?",
    },
  ]);
  const [input, setInput] = useState("");
  const [showTranscript, setShowTranscript] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "Apa kabar?",
    "Saya dari Polandia.",
    "Nama saya Miłosz.",
  ]);
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [bubbles]);

  const send = useMutation({
    mutationFn: async (text: string) => {
      const history = [...bubbles, { role: "user" as const, content: text }].map((b) => ({
        role: b.role,
        content: b.content,
      }));
      return budiChat({ data: { messages: history.slice(-16), level } });
    },
    onSuccess: async (res) => {
      setBubbles((b) => [
        ...b,
        {
          role: "assistant",
          content: res.reply,
          translation: res.translation,
          correction: res.correction,
        },
      ]);
      setSuggestions(res.suggestions?.slice(0, 3) ?? []);
      addXp(5);
      void playIndonesian(res.reply);
    },
  });

  function submit(text: string) {
    const value = text.trim();
    if (!value || send.isPending) return;
    setBubbles((b) => [...b, { role: "user", content: value }]);
    setInput("");
    send.mutate(value);
  }

  function toggleMic() {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const w = window as any;
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) {
      setMicError("Twoja przeglądarka nie obsługuje rozpoznawania mowy. Użyj Chrome lub wpisz tekst.");
      return;
    }
    const rec = new SR();
    rec.lang = "id-ID";
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript as string;
      submit(text);
    };
    rec.onerror = () => setMicError("Nie udało się nagrać. Spróbuj ponownie.");
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setMicError(null);
    rec.start();
    setListening(true);
  }

  return (
    <AppShell title="Budi · rozmowa">
      <div className="card-pop mb-4 flex items-center gap-3 p-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/15 text-3xl">
          🧑🏽‍🏫
        </div>
        <div className="flex-1">
          <p className="font-display text-lg font-extrabold">Budi</p>
          <p className="text-sm text-muted-foreground">
            {send.isPending ? "pisze…" : `połączony · poziom ${level}`}
          </p>
        </div>
        <PhoneCall className="size-5 text-success" />
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <button
          onClick={() => setShowTranscript((v) => !v)}
          className={cn(
            "rounded-full px-3 py-1.5 text-sm font-bold",
            showTranscript ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          Live Transcript
        </button>
        <button
          onClick={() => setShowTranslation((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold",
            showTranslation ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          <Languages className="size-4" /> Tłumaczenie
        </button>
      </div>

      {showTranscript && (
        <div className="space-y-3">
          {bubbles.map((b, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[85%] rounded-3xl p-3.5",
                b.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "card-pop mr-auto",
              )}
            >
              <div className="flex items-start gap-2">
                <p className="font-semibold">{b.content}</p>
                {b.role === "assistant" && (
                  <button
                    aria-label="Odsłuchaj"
                    onClick={() => void playIndonesian(b.content)}
                    className="shrink-0 text-secondary"
                  >
                    <Volume2 className="size-4" />
                  </button>
                )}
              </div>
              {showTranslation && b.translation && (
                <p className="mt-1.5 text-sm opacity-80">{b.translation}</p>
              )}
              {b.correction && (
                <p className="mt-2 rounded-xl bg-accent/15 p-2 text-xs font-semibold text-accent">
                  {b.correction}
                </p>
              )}
              {b.role === "user" && showTranslation && <UserTranslation text={b.content} />}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {send.isError && (
        <p className="mt-3 text-sm font-semibold text-destructive">
          {(send.error as Error).message}
        </p>
      )}
      {micError && <p className="mt-3 text-sm font-semibold text-destructive">{micError}</p>}

      <div className="mt-5 flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => submit(s)}
            className="rounded-full border-2 border-secondary/40 bg-secondary/10 px-3 py-1.5 text-sm font-bold text-secondary"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={toggleMic}
          aria-label="Mów po indonezyjsku"
          className={cn(
            "btn-3d flex size-12 shrink-0 items-center justify-center rounded-full active:btn-3d-press",
            listening ? "animate-pulse bg-destructive text-destructive-foreground" : "bg-accent text-accent-foreground",
          )}
        >
          {listening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit(input)}
          placeholder="Napisz po indonezyjsku…"
          className="h-12 flex-1 rounded-2xl border-2 border-border bg-card px-4 font-semibold outline-none focus:border-primary"
        />
        <button
          onClick={() => submit(input)}
          disabled={send.isPending}
          aria-label="Wyślij"
          className="btn-3d flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground active:btn-3d-press disabled:opacity-50"
        >
          {send.isPending ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
        </button>
      </div>
    </AppShell>
  );
}

function UserTranslation({ text }: { text: string }) {
  const t = useMutation({ mutationFn: () => translateToPolish({ data: { text } }) });
  useEffect(() => {
    t.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  if (!t.data) return null;
  return <p className="mt-1.5 text-sm opacity-80">{t.data.translation}</p>;
}
