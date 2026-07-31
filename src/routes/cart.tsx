import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your cart · DineDesk" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, setQuantity, remove, subtotal, clear } = useCart();
  const tax = subtotal * 0.09;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen">
      <SiteNav />
      <div className="pt-32 mx-auto max-w-5xl px-6 pb-24">
        <h1 className="font-display text-5xl">Your order</h1>
        <p className="mt-2 text-muted-foreground">Review your selections before checkout.</p>

        {items.length === 0 ? (
          <div className="mt-16 glass rounded-3xl p-16 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-primary" />
            <p className="mt-4 font-display text-2xl">Your cart is empty</p>
            <p className="mt-2 text-muted-foreground">Add a few dishes from our menu.</p>
            <Link to="/menu" className="mt-6 inline-block">
              <Button className="rounded-full">Browse the menu</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr,380px]">
            <div className="space-y-4">
              {items.map((it) => (
                <div key={it.id} className="glass rounded-2xl p-4 flex gap-4 items-center">
                  <div className="h-20 w-20 rounded-xl overflow-hidden bg-muted shrink-0">
                    {it.image ? (
                      <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-primary/40 font-display text-xs">DineDesk</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-lg truncate">{it.name}</div>
                    <div className="text-sm text-muted-foreground">${it.price.toFixed(2)}</div>
                  </div>
                  <div className="flex items-center gap-1 glass rounded-full p-1">
                    <button className="rounded-full p-1.5 hover:bg-accent" onClick={() => setQuantity(it.id, it.quantity - 1)} aria-label="Decrease">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-6 text-center text-sm font-medium">{it.quantity}</span>
                    <button className="rounded-full p-1.5 hover:bg-accent" onClick={() => setQuantity(it.id, it.quantity + 1)} aria-label="Increase">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="w-20 text-right font-semibold">${(it.price * it.quantity).toFixed(2)}</div>
                  <button className="text-muted-foreground hover:text-destructive p-2" onClick={() => remove(it.id)} aria-label="Remove">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button onClick={() => clear()} className="text-sm text-muted-foreground hover:text-destructive">Clear cart</button>
            </div>

            <div className="glass rounded-2xl p-6 h-fit lg:sticky lg:top-28">
              <h3 className="font-display text-2xl">Order summary</h3>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>${subtotal.toFixed(2)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Estimated tax</dt><dd>${tax.toFixed(2)}</dd></div>
                <div className="flex justify-between border-t border-border/50 pt-3 text-base font-semibold">
                  <dt>Total</dt><dd className="gold-text font-display text-xl">${total.toFixed(2)}</dd>
                </div>
              </dl>
              <Button
                className="mt-6 rounded-full w-full h-12"
                onClick={() => toast.info("Checkout & payments arrive in the next slice.")}
              >
                Checkout
              </Button>
              <Link to="/book" className="mt-3 block text-center text-sm text-muted-foreground hover:text-primary">
                Or reserve a table instead
              </Link>
            </div>
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
