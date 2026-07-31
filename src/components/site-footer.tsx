import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 mt-32">
      <div className="mx-auto max-w-6xl px-6 py-14 grid gap-10 md:grid-cols-3">
        <div>
          <div className="font-display text-3xl gold-text">DineDesk</div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            Modern fine dining, crafted with intention. Reservations and menu, always in season.
          </p>
        </div>
        <div className="text-sm">
          <div className="uppercase tracking-widest text-xs text-muted-foreground mb-3">Visit</div>
          <p>12 Marble Row, Downtown</p>
          <p>Tue–Sun · 18:00 – 23:30</p>
          <p className="mt-2 text-muted-foreground">+1 (555) 018-2400</p>
        </div>
        <div className="text-sm">
          <div className="uppercase tracking-widest text-xs text-muted-foreground mb-3">Explore</div>
          <ul className="space-y-2">
            <li><Link to="/menu" className="hover:text-primary transition-colors">Menu</Link></li>
            <li><Link to="/book" className="hover:text-primary transition-colors">Book a table</Link></li>
            <li><Link to="/about" className="hover:text-primary transition-colors">About</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} DineDesk. All rights reserved.
      </div>
    </footer>
  );
}
