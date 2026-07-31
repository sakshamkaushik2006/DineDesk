import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About · DineDesk" },
      { name: "description", content: "DineDesk is a twelve-seat kitchen serving a nightly changing menu of modern fine dining." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <div className="pt-32 mx-auto max-w-3xl px-6 pb-24">
        <div className="text-xs uppercase tracking-[0.3em] text-primary">Our story</div>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">Small kitchen, restless hands</h1>
        <div className="mt-10 space-y-6 text-lg text-muted-foreground leading-relaxed">
          <p>
            DineDesk began as a supper club run out of a converted textile loft. Twelve seats,
            one long walnut table, a menu written on the back of the day's produce list.
          </p>
          <p>
            Today, we're a proper restaurant — still twelve seats, still one menu per evening,
            still writing it by hand. What we serve depends on what the docks brought in that
            morning, what the farms could spare, and what our sommelier felt like opening.
          </p>
          <p>
            Come hungry. Stay late.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          <Stat kicker="Est." value="2024" />
          <Stat kicker="Seats" value="12" />
          <Stat kicker="Courses" value="7–12" />
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

function Stat({ kicker, value }: { kicker: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-6 text-center">
      <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{kicker}</div>
      <div className="mt-2 font-display text-4xl gold-text">{value}</div>
    </div>
  );
}
