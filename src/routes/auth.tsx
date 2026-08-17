import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Logowanie — Belajar! Indonezyjski dla Polaków" },
      {
        name: "description",
        content:
          "Zaloguj się lub załóż konto, aby synchronizować XP, streak, serca i powtórki na wszystkich urządzeniach.",
      },
      { property: "og:title", content: "Zaloguj się do Belajar!" },
      {
        property: "og:description",
        content: "Twój postęp w nauce indonezyjskiego w chmurze — na każdym urządzeniu.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && session) void navigate({ to: "/" });
  }, [session, loading, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === "up") {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (err) throw err;
        setInfo("Konto utworzone! Jeśli wymagane, potwierdź e-mail i zaloguj się.");
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Coś poszło nie tak.");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Nie udało się zalogować przez Google.");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/" });
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-8 text-center">
        <p className="text-5xl">🇮🇩</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-gradient-brand">Belajar!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Indonezyjski dla Polaków — XP, serca i powtórki zapisane w chmurze.
        </p>
      </div>

      <div className="card-pop p-5">
        <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
          {(["in", "up"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-xl py-2 font-display text-sm font-extrabold transition-colors ${
                mode === m ? "bg-card text-foreground shadow" : "text-muted-foreground"
              }`}
            >
              {m === "in" ? "Logowanie" : "Rejestracja"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "up" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Twoje imię"
              className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-sm font-medium outline-none focus:border-primary"
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-sm font-medium outline-none focus:border-primary"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Hasło (min. 6 znaków)"
            className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-sm font-medium outline-none focus:border-primary"
          />
          {error && <p className="text-sm font-bold text-destructive">{error}</p>}
          {info && <p className="text-sm font-bold text-success">{info}</p>}
          <button
            type="submit"
            disabled={busy}
            className="btn-3d w-full rounded-2xl bg-primary px-5 py-3.5 font-display text-base font-extrabold text-primary-foreground active:btn-3d-press disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="mx-auto size-5 animate-spin" />
            ) : mode === "in" ? (
              "Zaloguj się"
            ) : (
              "Załóż konto"
            )}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs font-bold text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> LUB <span className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          onClick={google}
          className="btn-3d flex w-full items-center justify-center gap-2 rounded-2xl bg-card px-5 py-3.5 font-display text-base font-extrabold ring-2 ring-border active:btn-3d-press"
        >
          <span className="text-lg">G</span> Kontynuuj z Google
        </button>
      </div>
    </div>
  );
}
