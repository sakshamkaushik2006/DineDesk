import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { format, addDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CalendarCheck, Users, Clock } from "lucide-react";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Reserve a table · DineDesk" },
      { name: "description", content: "Reserve your table at DineDesk. Choose your date, time, and party size." },
    ],
  }),
  component: BookPage,
});

const TIMES = ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"];

const schema = z.object({
  guest_name: z.string().trim().min(2, "Please enter your full name").max(80),
  guest_phone: z.string().trim().min(6, "Please enter a phone number").max(30),
  party_size: z.number().int().min(1).max(20),
  booking_date: z.string(),
  booking_time: z.string(),
  special_requests: z.string().max(500).optional(),
});

function BookPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = new Date();
  const [date, setDate] = useState(format(addDays(today, 1), "yyyy-MM-dd"));
  const [time, setTime] = useState("19:30");
  const [party, setParty] = useState(2);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: tables } = useQuery({
    queryKey: ["tables"],
    queryFn: async () => (await supabase.from("restaurant_tables").select("*").order("capacity")).data ?? [],
  });

  const { data: load } = useQuery({
    queryKey: ["slot-load", date],
    queryFn: async () => (await supabase.from("booking_slot_load").select("*").eq("booking_date", date)).data ?? [],
  });

  const totalCapacity = (tables ?? []).reduce((n, t) => n + t.capacity, 0);
  const usedAtTime = (load ?? []).find((l) => l.booking_time?.startsWith(time))?.booked_seats ?? 0;
  const remaining = Math.max(0, totalCapacity - usedAtTime);
  const canFit = remaining >= party;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.info("Please sign in to complete your reservation.");
      navigate({ to: "/auth", search: { redirect: "/book" } });
      return;
    }
    const parsed = schema.safeParse({
      guest_name: name, guest_phone: phone, party_size: party,
      booking_date: date, booking_time: time, special_requests: notes || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    if (!canFit) {
      toast.error("Not enough seats at that time. Try another slot.");
      return;
    }
    setSubmitting(true);
    // Pick smallest table that fits
    const table = (tables ?? []).filter((t) => t.capacity >= party).sort((a, b) => a.capacity - b.capacity)[0];
    const { data, error } = await supabase.from("bookings").insert({
      user_id: user.id,
      table_id: table?.id ?? null,
      guest_name: parsed.data.guest_name,
      guest_phone: parsed.data.guest_phone,
      party_size: parsed.data.party_size,
      booking_date: parsed.data.booking_date,
      booking_time: parsed.data.booking_time,
      special_requests: parsed.data.special_requests ?? null,
      status: "confirmed",
    }).select("id").single();
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Reservation confirmed");
    navigate({ to: "/bookings/$bookingId", params: { bookingId: data.id } });
  }

  return (
    <div className="min-h-screen">
      <SiteNav />
      <div className="pt-32 mx-auto max-w-6xl px-6 pb-24">
        <div className="text-xs uppercase tracking-[0.3em] text-primary">Reservations</div>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">Book your evening</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          We seat between 18:00 and 22:00. Larger parties, message us and we'll make room.
        </p>

        <form onSubmit={handleSubmit} className="mt-12 grid gap-8 lg:grid-cols-[1fr,380px]">
          <div className="glass rounded-3xl p-8 space-y-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label className="flex items-center gap-2 mb-2"><CalendarCheck className="h-4 w-4 text-primary" /> Date</Label>
                <Input
                  type="date"
                  value={date}
                  min={format(today, "yyyy-MM-dd")}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-card/60"
                />
              </div>
              <div>
                <Label className="flex items-center gap-2 mb-2"><Users className="h-4 w-4 text-primary" /> Party size</Label>
                <div className="flex items-center gap-2 glass rounded-full p-1 w-fit">
                  <button type="button" className="rounded-full px-3 py-1.5 hover:bg-accent" onClick={() => setParty(Math.max(1, party - 1))}>−</button>
                  <span className="min-w-8 text-center font-medium">{party}</span>
                  <button type="button" className="rounded-full px-3 py-1.5 hover:bg-accent" onClick={() => setParty(Math.min(20, party + 1))}>+</button>
                </div>
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-3"><Clock className="h-4 w-4 text-primary" /> Time</Label>
              <div className="flex flex-wrap gap-2">
                {TIMES.map((t) => {
                  const used = (load ?? []).find((l) => l.booking_time?.startsWith(t))?.booked_seats ?? 0;
                  const left = Math.max(0, totalCapacity - used);
                  const disabled = left < party;
                  const active = time === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      disabled={disabled}
                      onClick={() => setTime(t)}
                      className={`rounded-full px-4 py-2 text-sm transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : disabled
                          ? "opacity-40 cursor-not-allowed glass"
                          : "glass hover:text-primary"
                      }`}
                      title={disabled ? "Full" : `${left} seats left`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {canFit ? `${remaining} of ${totalCapacity} seats available at ${time}` : "That time is full — try another slot."}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label className="mb-2 block">Full name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className="bg-card/60" required />
              </div>
              <div>
                <Label className="mb-2 block">Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="bg-card/60" required />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Special requests (optional)</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Dietary needs, celebration, seating preferences…" className="bg-card/60" />
            </div>
          </div>

          <div className="glass rounded-3xl p-6 h-fit lg:sticky lg:top-28">
            <h3 className="font-display text-2xl">Your reservation</h3>
            <dl className="mt-6 space-y-3 text-sm">
              <Row label="Date" value={format(new Date(date), "EEEE, MMM d")} />
              <Row label="Time" value={time} />
              <Row label="Party" value={`${party} guest${party > 1 ? "s" : ""}`} />
            </dl>
            <Button type="submit" className="mt-8 w-full rounded-full h-12" disabled={submitting || !canFit}>
              {submitting ? "Reserving…" : user ? "Confirm reservation" : "Sign in to reserve"}
            </Button>
            <p className="mt-3 text-xs text-muted-foreground text-center">
              No card required. Cancel any time.
            </p>
          </div>
        </form>
      </div>
      <SiteFooter />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
