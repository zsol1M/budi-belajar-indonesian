import { useEffect } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { detachCloud, syncFromCloud } from "@/lib/progress";

const PUBLIC_PATHS = ["/auth"];

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useLocation({ select: (l) => l.pathname });
  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublic) void navigate({ to: "/auth" });
  }, [user, loading, isPublic, navigate]);

  useEffect(() => {
    if (user) void syncFromCloud(user.id);
    else if (!loading) detachCloud();
  }, [user, loading]);

  if (loading || (!user && !isPublic)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
