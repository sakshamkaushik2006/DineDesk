import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/bookings/$bookingId")({
  head: () => ({ meta: [{ title: "Reservation · DineDesk" }] }),
  component: BookingDetail,
});

function BookingDetail() {
  const { bookingId } = Route.useParams();
  const { user, loading } = useAuth();

  const { data: booking, isLoading, refetch } = useQuery({
    queryKey: ["booking", bookingId],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, restaurant_tables(label, capacity)")
        .eq("id", bookingId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  async function cancel() {
    if (!confirm("Cancel this reservation?")) return;
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
    if (error) { toast.error(error.message); return; }
    toast.success("Reservation cancelled");
    refetch();
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen">
        <SiteNav />
        <div className="pt-40 mx-auto max-w-2xl px-6"><div className="skeleton h-96 rounded-3xl" /></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen">
        <SiteNav />
        <div className="pt-40 mx-auto max-w-2xl px-6 text-center">
          <p className="text-muted-foreground">Reservation not found.</p>
          <Link to="/bookings"><Button className="mt-6 rounded-full">Back to bookings</Button></Link>
        </div>
      </div>
    );
  }

  const dt = new Date(booking.booking_date + "T" + booking.booking_time);
  const qrPayload = JSON.stringify({ b: booking.id, n: booking.guest_name, p: booking.party_size, d: booking.booking_date, t: booking.booking_time });

  return (
    <div className="min-h-screen">
      <SiteNav />
      <div className="pt-32 mx-auto max-w-2xl px-6 pb-24">
        <Link to="/bookings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> My bookings
        </Link>

        <div className="mt-6 glass rounded-3xl p-8 text-center animate-fade-up">
          <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 font-display text-4xl">You're booked in</h1>
          <p className="mt-2 text-muted-foreground">Show this QR at the door.</p>

          <div className="mx-auto mt-8 inline-block rounded-2xl bg-white p-6">
            <QRCodeSVG value={qrPayload} size={200} bgColor="#ffffff" fgColor="#111111" />
          </div>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2 text-left">
            <Row label="Guest" value={booking.guest_name} />
            <Row label="Phone" value={booking.guest_phone ?? "—"} />
            <Row label="Date" value={format(dt, "EEEE, MMM d, yyyy")} />
            <Row label="Time" value={format(dt, "HH:mm")} />
            <Row label="Party size" value={`${booking.party_size} guest${booking.party_size > 1 ? "s" : ""}`} />
            <Row label="Table" value={booking.restaurant_tables?.label ? `Table ${booking.restaurant_tables.label}` : "Assigned at door"} />
          </dl>

          {booking.special_requests && (
            <div className="mt-6 text-left">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Special requests</div>
              <p className="mt-2 text-sm">{booking.special_requests}</p>
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <span className={`rounded-full px-4 py-2 text-xs uppercase tracking-widest ${
              booking.status === "confirmed" ? "bg-primary/20 text-primary" :
              booking.status === "cancelled" ? "bg-destructive/20 text-destructive" :
              "bg-muted text-muted-foreground"
            }`}>{booking.status}</span>
            {booking.status !== "cancelled" && (
              <Button variant="outline" className="rounded-full gold-border bg-transparent" onClick={cancel}>
                Cancel reservation
              </Button>
            )}
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}
