import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  beforeLoad: async ({ context }) => {
    const user = (context as { user?: { id: string } }).user;
    if (!user) throw redirect({ to: "/auth" });
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (error || !data) throw redirect({ to: "/auth", search: { error: "not_admin" } as never });
  },
  component: AdminLayout,
});

const LINKS: Array<{ to: string; label: string }> = [
  { to: "/admin", label: "Tableau de bord" },
  { to: "/admin/books", label: "Livres" },
  { to: "/admin/articles", label: "Chroniques" },
  { to: "/admin/events", label: "Agenda" },
  { to: "/admin/gallery", label: "Galerie" },
  { to: "/admin/resources", label: "Ressources" },
  { to: "/admin/reviews", label: "Avis" },
  { to: "/admin/messages", label: "Messages" },
  { to: "/admin/subscribers", label: "Abonnés" },
];

function AdminLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[220px_1fr]">
      <aside className="space-y-1">
        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin</p>
        {LINKS.map((l) => {
          const active = l.to === "/admin" ? pathname === "/admin" : pathname.startsWith(l.to);
          return (
            <Link
              key={l.to}
              to={l.to}
              className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                active ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
        <Button onClick={signOut} variant="ghost" className="mt-4 w-full justify-start text-sm">
          <LogOut className="mr-2 h-4 w-4" /> Déconnexion
        </Button>
      </aside>
      <section className="min-w-0">
        <Outlet />
      </section>
    </div>
  );
}
