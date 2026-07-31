import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";

export const Route = createFileRoute("/bookings/")({
  head: () => ({ meta: [{ title: "My reservations · DineDesk" }] }),
  component: BookingsPage,
});

function BookingsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/bookings" }, replace: true });
  }, [user, loading, navigate]);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["my-bookings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, restaurant_tables(label, capacity)")
        .order("booking_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen">
      <SiteNav />
      <div className="pt-32 mx-auto max-w-4xl px-6 pb-24">
        <div className="text-xs uppercase tracking-[0.3em] text-primary">Reservations</div>
        <h1 className="mt-3 font-display text-5xl">Your bookings</h1>

        {isLoading ? (
          <div className="mt-10 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
          </div>
        ) : !bookings?.length ? (
          <div className="mt-16 glass rounded-3xl p-16 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-primary" />
            <p className="mt-4 font-display text-2xl">No reservations yet</p>
            <p className="mt-2 text-muted-foreground">Book your first evening with us.</p>
            <Link to="/book" className="mt-6 inline-block">
              <Button className="rounded-full">Reserve a table</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-10 space-y-4">
            {bookings.map((b) => (
              <Link
                key={b.id}
                to="/bookings/$bookingId"
                params={{ bookingId: b.id }}
                className="glass rounded-2xl p-5 flex items-center justify-between gap-4 hover:-translate-y-0.5 transition-transform"
              >
                <div>
                  <div className="font-display text-2xl">
                    {format(new Date(b.booking_date + "T" + b.booking_time), "EEE, MMM d · HH:mm")}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {b.party_size} guest{b.party_size > 1 ? "s" : ""} · Table {b.restaurant_tables?.label ?? "TBD"} · {b.guest_name}
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-widest ${
                  b.status === "confirmed" ? "bg-primary/20 text-primary" :
                  b.status === "cancelled" ? "bg-destructive/20 text-destructive" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {b.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
