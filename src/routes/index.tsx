import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, UtensilsCrossed, CalendarCheck } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { getMenuImage } from "@/lib/menu-images";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DineDesk · Modern Fine Dining & Reservations" },
      { name: "description", content: "Reserve a table or explore the seasonal menu at DineDesk. Modern fine dining, crafted with intention." },
      { property: "og:title", content: "DineDesk · Modern Fine Dining" },
      { property: "og:description", content: "Reserve a table or explore our seasonal menu." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: signatures } = useQuery({
    queryKey: ["signature-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("id, name, description, price, tags")
        .contains("tags", ["signature"])
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen">
      <SiteNav />

      {/* HERO */}
      <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
        <img
          src={heroImg}
          alt="DineDesk signature dish plated with gold leaf on dark ceramic"
          className="absolute inset-0 h-full w-full object-cover"
          width={1920}
          height={1280}
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-center justify-end px-6 pb-24 text-center">
          <div className="animate-fade-up flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-primary/90">
            <Sparkles className="h-3.5 w-3.5" /> Est. 2024 · Modern Fine Dining
          </div>
          <h1 className="animate-fade-up mt-6 font-display text-5xl leading-[1.05] sm:text-7xl md:text-8xl">
            <span className="block">A quiet obsession</span>
            <span className="block gold-text">with the perfect bite.</span>
          </h1>
          <p className="animate-fade-up mt-6 max-w-xl text-base sm:text-lg text-muted-foreground">
            Twelve seats, twelve courses, one restless kitchen. Book your evening at DineDesk.
          </p>
          <div className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link to="/book">
              <Button size="lg" className="rounded-full px-8 h-12 text-base">
                Reserve a table <CalendarCheck className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/menu">
              <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base gold-border bg-transparent">
                Explore the menu <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SIGNATURE */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-14 flex items-end justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-primary">Chef's signatures</div>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl">The dishes that define us</h2>
          </div>
          <Link to="/menu" className="hidden sm:inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            Full menu <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(signatures ?? []).map((item) => {
            const img = getMenuImage(item.name);
            return (
              <Link
                key={item.id}
                to="/menu/$itemId"
                params={{ itemId: item.id }}
                className="group glass overflow-hidden rounded-2xl transition-transform hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {img && (
                    <img
                      src={img}
                      alt={item.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-2xl">{item.name}</h3>
                    <span className="text-primary font-semibold">${Number(item.price).toFixed(0)}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                </div>
              </Link>
            );
          })}
          {!signatures && Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl overflow-hidden">
              <div className="skeleton aspect-[4/3]" />
              <div className="p-6 space-y-3">
                <div className="skeleton h-6 w-2/3" />
                <div className="skeleton h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SPLIT */}
      <section className="mx-auto max-w-6xl px-6 py-24 grid gap-12 md:grid-cols-2 items-center">
        <div className="glass rounded-3xl p-10">
          <UtensilsCrossed className="h-8 w-8 text-primary" />
          <h3 className="mt-4 font-display text-3xl">A tasting menu that changes with the season</h3>
          <p className="mt-4 text-muted-foreground">
            We build the menu around what arrives that morning — from divers, foragers, and a small
            network of farms we've worked with for years. Nothing sits still for long.
          </p>
          <Link to="/menu" className="mt-6 inline-flex items-center gap-2 text-primary hover:underline">
            See what's on tonight <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="glass rounded-3xl p-10">
          <CalendarCheck className="h-8 w-8 text-primary" />
          <h3 className="mt-4 font-display text-3xl">Reserve in seconds</h3>
          <p className="mt-4 text-muted-foreground">
            Choose your evening, pick a time, and we'll hold your table. You'll get a confirmation
            with a QR code you can show at the door.
          </p>
          <Link to="/book" className="mt-6 inline-flex items-center gap-2 text-primary hover:underline">
            Book a table <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
