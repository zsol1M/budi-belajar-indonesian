import { Link } from "@tanstack/react-router";
import { Flame, Heart, Home, MessageCircle, Repeat, Sparkles, Star, User } from "lucide-react";
import type { ReactNode } from "react";
import { useProgress, dueReviews, MAX_HEARTS } from "@/lib/progress";

const NAV = [
  { to: "/", label: "Nauka", icon: Home },
  { to: "/rozmowa", label: "Budi", icon: MessageCircle },
  { to: "/przygoda", label: "Przygoda", icon: Sparkles },
  { to: "/powtorki", label: "Powtórki", icon: Repeat },
  { to: "/profil", label: "Profil", icon: User },
] as const;

export function StatsBar() {
  const { xp, streak, hearts } = useProgress();
  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1 rounded-full bg-xp px-2.5 py-1.5 text-xs font-bold text-xp-foreground">
        <Star className="size-4" /> {xp} XP
      </span>
      <span className="flex items-center gap-1 rounded-full bg-streak px-2.5 py-1.5 text-xs font-bold text-streak-foreground">
        <Flame className="size-4" /> {streak}
      </span>
      <span
        title={`Serca: ${hearts}/${MAX_HEARTS}`}
        className="flex items-center gap-1 rounded-full bg-destructive px-2.5 py-1.5 text-xs font-bold text-destructive-foreground"
      >
        <Heart className="size-4" /> {hearts}
      </span>
    </div>
  );
}

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const { srs } = useProgress();
  const due = dueReviews(srs).length;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur">
        <Link to="/" className="font-display text-lg font-extrabold text-gradient-brand">
          {title ?? "Belajar!"}
        </Link>
        <StatsBar />
      </header>

      <main className="flex-1 px-4 pb-28 pt-4">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-3xl border-t-2 border-border bg-card/95 px-2 py-2 backdrop-blur">
        <ul className="flex items-center justify-around">
          {NAV.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                activeOptions={{ exact: to === "/" }}
                activeProps={{ className: "bg-primary/12 text-primary" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="relative flex w-16 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-xs font-bold transition-colors"
              >
                <Icon className="size-5" />
                {label}
                {to === "/powtorki" && due > 0 && (
                  <span className="absolute right-2 top-0 rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-foreground">
                    {due}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
