import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { getMenuImage } from "@/lib/menu-images";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/menu/$itemId")({
  component: ItemPage,
});

function ItemPage() {
  const { itemId } = Route.useParams();
  const navigate = useNavigate();
  const { add } = useCart();

  const { data: item, isLoading } = useQuery({
    queryKey: ["item", itemId],
    queryFn: async () => {
      const { data, error } = await supabase.from("menu_items").select("*").eq("id", itemId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const img = item ? getMenuImage(item.name) : undefined;

  return (
    <div className="min-h-screen">
      <SiteNav />
      <div className="pt-32 mx-auto max-w-5xl px-6 pb-24">
        <Link to="/menu" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to menu
        </Link>

        {isLoading ? (
          <div className="mt-8 grid gap-10 md:grid-cols-2">
            <div className="skeleton aspect-square rounded-2xl" />
            <div className="space-y-4">
              <div className="skeleton h-10 w-2/3" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-3/4" />
            </div>
          </div>
        ) : !item ? (
          <div className="mt-16 glass p-12 rounded-2xl text-center">
            <p className="text-muted-foreground">Dish not found.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-10 md:grid-cols-2">
            <div className="glass rounded-3xl overflow-hidden aspect-square bg-muted">
              {img ? (
                <img src={img} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center font-display text-6xl text-primary/40">
                  DineDesk
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex flex-wrap gap-2">
                {item.tags?.map((t) => (
                  <span key={t} className="rounded-full glass px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>
              <h1 className="mt-4 font-display text-5xl">{item.name}</h1>
              <div className="mt-2 text-3xl gold-text font-display">${Number(item.price).toFixed(2)}</div>
              <p className="mt-6 text-muted-foreground leading-relaxed">{item.description}</p>

              <div className="mt-auto pt-10 flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="rounded-full flex-1 h-12"
                  onClick={() => {
                    add({ id: item.id, name: item.name, price: Number(item.price), image: img });
                    toast.success(`Added ${item.name} to cart`);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add to cart
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full flex-1 h-12 gold-border bg-transparent"
                  onClick={() => {
                    add({ id: item.id, name: item.name, price: Number(item.price), image: img });
                    navigate({ to: "/cart" });
                  }}
                >
                  Order now
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
