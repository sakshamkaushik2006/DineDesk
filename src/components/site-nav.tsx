import { Link } from "@tanstack/react-router";
import { ShoppingBag, CalendarDays, User, LogOut, Menu as MenuIcon, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function SiteNav() {
  const { count } = useCart();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: "Home" },
    { to: "/menu", label: "Menu" },
    { to: "/book", label: "Reservations" },
    { to: "/about", label: "About" },
  ] as const;

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="glass mx-auto mt-4 flex max-w-6xl items-center justify-between gap-4 rounded-full px-5 py-3 sm:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl tracking-wide gold-text">DineDesk</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative rounded-full p-2 hover:bg-accent transition-colors" aria-label="Cart">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold h-4 min-w-4 px-1 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <>
              <Link to="/bookings" className="hidden sm:inline-flex" aria-label="My bookings">
                <Button variant="ghost" size="sm" className="rounded-full">
                  <CalendarDays className="h-4 w-4 mr-1" /> Bookings
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => signOut()} aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link to="/auth" className="hidden sm:inline-flex">
              <Button size="sm" className="rounded-full">
                <User className="h-4 w-4 mr-1" /> Sign in
              </Button>
            </Link>
          )}
          <button className="md:hidden rounded-full p-2 hover:bg-accent" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="glass mx-4 mt-2 rounded-2xl p-4 md:hidden animate-fade-up">
          <div className="flex flex-col gap-2">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 hover:bg-accent transition-colors">
                {l.label}
              </Link>
            ))}
            {user ? (
              <Link to="/bookings" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 hover:bg-accent">
                My bookings
              </Link>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 hover:bg-accent">
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
