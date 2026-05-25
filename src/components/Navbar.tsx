import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 glass-card border-0 border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-glow text-primary">AxelSub</span>
        </Link>
        <nav className="hidden gap-6 md:flex">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Kezdőlap</Link>
          <Link to="/browse" className="text-sm text-muted-foreground hover:text-foreground">Böngészés</Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>
              Kijelentkezés
            </Button>
          ) : (
            <Link to="/auth">
              <Button size="sm">Bejelentkezés</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}