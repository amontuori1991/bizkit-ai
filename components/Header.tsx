import Link from "next/link";
import { BrandLockup } from "@/components/BrandLogo";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/demo", label: "Demo" },
  { href: "/pricing", label: "Pricing" },
  { href: "/dashboard", label: "Piattaforma" },
  { href: "/catalogo", label: "Catalogo" },
  { href: "/faq", label: "FAQ" },
  { href: "/contatti", label: "Contatti" },
];

export async function Header() {
  const supabase = await createSupabaseServerClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="container-shell flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <BrandLockup size="md" tagline="AI Marketing Platform for Local Businesses" />
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-600">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-blue-700">
              {item.label}
            </Link>
          ))}
          {user ? (
            <>
              <form action="/auth/logout" method="post">
                <button type="submit" className="button-secondary">
                  Esci
                </button>
              </form>
              <Link href="/dashboard" className="button-primary">
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="button-secondary">
                Accedi
              </Link>
              <Link href="/signup" className="button-primary">
                Inizia gratis
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
