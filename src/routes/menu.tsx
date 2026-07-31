import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart";
import { getMenuImage } from "@/lib/menu-images";
import { toast } from "sonner";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu · DineDesk" },
      { name: "description", content: "Browse the seasonal menu at DineDesk — starters, mains, pasta, desserts, cocktails and wine." },
      { property: "og:title", content: "Menu · DineDesk" },
      { property: "og:description", content: "Seasonal fine-dining menu." },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const [category, setCategory] = useState<string>("all");
  const [q, setQ] = useState("");
  const { add } = useCart();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await supabase.from("menu_categories").select("*").order("sort_order")).data ?? [],
  });

  const { data: items, isLoading } = useQuery({
    queryKey: ["items"],
    queryFn: async () =>
      (await supabase.from("menu_items").select("*").eq("is_available", true)).data ?? [],
  });

  const filtered = useMemo(() => {
    return (items ?? []).filter((i) => {
      if (category !== "all" && i.category_id !== category) return false;
      if (q && !i.name.toLowerCase().includes(q.toLowerCase()) && !(i.description ?? "").toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [items, category, q]);

  return (
    <div className="min-h-screen">
      <SiteNav />

      <section className="pt-32 pb-8 mx-auto max-w-6xl px-6">
        <div className="text-xs uppercase tracking-[0.3em] text-primary">The menu</div>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">Tonight's kitchen</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Priced à la carte. Ask your server about wine pairings and tasting flights.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search dishes…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 rounded-full bg-card/60"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <CategoryPill active={category === "all"} onClick={() => setCategory("all")}>All</CategoryPill>
            {(categories ?? []).map((c) => (
              <CategoryPill key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
                {c.name}
              </CategoryPill>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden">
                <div className="skeleton aspect-[4/3]" />
                <div className="p-6 space-y-3">
                  <div className="skeleton h-6 w-2/3" />
                  <div className="skeleton h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
            No dishes match your search.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => {
              const img = getMenuImage(item.name);
              return (
                <div key={item.id} className="glass overflow-hidden rounded-2xl group flex flex-col">
                  <Link to="/menu/$itemId" params={{ itemId: item.id }} className="relative aspect-[4/3] overflow-hidden bg-muted block">
                    {img ? (
                      <img src={img} alt={item.name} loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center font-display text-4xl text-primary/40">
                        DineDesk
                      </div>
                    )}
                    {item.tags?.includes("signature") && (
                      <span className="absolute top-3 left-3 rounded-full bg-primary text-primary-foreground text-[10px] uppercase tracking-widest px-2.5 py-1 font-semibold">
                        Signature
                      </span>
                    )}
                  </Link>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <Link to="/menu/$itemId" params={{ itemId: item.id }}>
                        <h3 className="font-display text-2xl hover:text-primary transition-colors">{item.name}</h3>
                      </Link>
                      <span className="text-primary font-semibold shrink-0">${Number(item.price).toFixed(0)}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                    <div className="mt-auto pt-5">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="rounded-full w-full"
                        onClick={() => {
                          add({ id: item.id, name: item.name, price: Number(item.price), image: img });
                          toast.success(`Added ${item.name} to cart`);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add to cart
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}

function CategoryPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "glass text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
