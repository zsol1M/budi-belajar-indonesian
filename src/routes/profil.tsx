import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Flame, Heart, LogOut, RefreshCw, Star, Trophy } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { CURRICULUM } from "@/lib/curriculum";
import { currentLevel, detachCloud, dueReviews, MAX_HEARTS, useProgress } from "@/lib/progress";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Profil i statystyki — Belajar! Indonezyjski" },
      {
        name: "description",
        content:
          "Twoje statystyki nauki indonezyjskiego: XP, streak, serca, ukończone węzły i lista powtórek SRS.",
      },
      { property: "og:title", content: "Twój profil — Belajar!" },
      { property: "og:description", content: "Statystyki nauki bahasa Indonesia i synchronizacja w chmurze." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { xp, streak, hearts, completed, srs, lastContext } = useProgress();
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (!user) return;
    void supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setDisplayName(data?.display_name ?? user.email?.split("@")[0] ?? ""));
  }, [user]);

  const level = currentLevel(completed);
  const due = dueReviews(srs).length;

  async function logout() {
    await signOut();
    detachCloud();
    void navigate({ to: "/auth" });
  }

  const stats = [
    { icon: Star, label: "XP", value: xp, cls: "bg-xp text-xp-foreground" },
    { icon: Flame, label: "Streak", value: `${streak} dni`, cls: "bg-streak text-streak-foreground" },
    { icon: Heart, label: "Serca", value: `${hearts}/${MAX_HEARTS}`, cls: "bg-destructive text-destructive-foreground" },
    {
      icon: Trophy,
      label: "Węzły",
      value: `${completed.length}/${CURRICULUM.length}`,
      cls: "bg-primary text-primary-foreground",
    },
  ];

  return (
    <AppShell title="Profil">
      <section className="card-pop mb-5 p-5">
        <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Zalogowany jako</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold">{displayName || "Uczeń"}</h1>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
        <p className="mt-3 text-sm">
          Aktualny poziom: <span className="font-bold">{level}</span>
          {lastContext && (
            <>
              {" · "}kontekst Budiego: <span className="font-bold">{lastContext}</span>
            </>
          )}
        </p>
      </section>

      <div className="mb-5 grid grid-cols-2 gap-3">
        {stats.map(({ icon: Icon, label, value, cls }) => (
          <div key={label} className="card-pop flex items-center gap-3 p-4">
            <span className={`flex size-10 items-center justify-center rounded-xl ${cls}`}>
              <Icon className="size-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">{label}</p>
              <p className="font-display text-lg font-extrabold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="card-pop mb-5 p-5">
        <h2 className="font-display text-lg font-extrabold">Powtórki SRS</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          W kolejce: {srs.length} pozycji, gotowych teraz: {due}.
        </p>
        <div className="mt-3 flex items-center gap-2 text-sm font-bold text-muted-foreground">
          <RefreshCw className="size-4" /> Postęp synchronizuje się automatycznie między urządzeniami.
        </div>
      </section>

      <button
        onClick={logout}
        className="btn-3d flex w-full items-center justify-center gap-2 rounded-2xl bg-card px-5 py-3.5 font-display text-base font-extrabold ring-2 ring-border active:btn-3d-press"
      >
        <LogOut className="size-5" /> Wyloguj się
      </button>
    </AppShell>
  );
}
