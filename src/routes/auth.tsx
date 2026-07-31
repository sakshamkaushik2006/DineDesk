import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useEffect } from "react";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Sign in · DineDesk" }] }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();
  const { redirect } = useSearch({ from: "/auth" });
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate({ to: (redirect as "/book") || "/", replace: true });
  }, [user, redirect, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: name || email.split("@")[0] }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Welcome to DineDesk");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteNav />
      <div className="pt-40 mx-auto max-w-md px-6 pb-24">
        <div className="glass rounded-3xl p-8">
          <h1 className="font-display text-4xl text-center">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to manage your reservations." : "Book tables and save favorites."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === "signup" && (
              <div>
                <Label className="mb-2 block">Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-card/60" />
              </div>
            )}
            <div>
              <Label className="mb-2 block">Email</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-card/60" />
            </div>
            <div>
              <Label className="mb-2 block">Password</Label>
              <Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="bg-card/60" />
            </div>
            <Button type="submit" disabled={busy} className="w-full rounded-full h-11">
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <button
            className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-primary"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
