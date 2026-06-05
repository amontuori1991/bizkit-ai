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
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/88 backdrop-blur-xl">
      <div className="container-shell py-3">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="shrink-0">
            <BrandLockup
              size="sm"
              tagline={null}
              className="justify-center"
              imageClassName="max-h-14 w-auto"
            />
          </Link>

          <div className="hidden items-center gap-3 lg:flex">
            <nav className="flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 px-3 py-2 shadow-sm shadow-slate-200/70">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <form action="/auth/logout" method="post">
                    <button type="submit" className="button-secondary px-4 py-2.5">
                      Esci
                    </button>
                  </form>
                  <Link href="/dashboard" className="button-primary px-5 py-2.5">
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="button-secondary px-4 py-2.5">
                    Accedi
                  </Link>
                  <Link href="/signup" className="button-primary px-5 py-2.5">
                    Inizia gratis
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            {user ? (
              <>
                <form action="/auth/logout" method="post">
                  <button type="submit" className="button-secondary px-4 py-2.5">
                    Esci
                  </button>
                </form>
                <Link href="/dashboard" className="button-primary px-4 py-2.5">
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="button-secondary px-4 py-2.5">
                  Accedi
                </Link>
                <Link href="/signup" className="button-primary px-4 py-2.5">
                  Inizia gratis
                </Link>
              </>
            )}
          </div>
        </div>

        <nav className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 lg:hidden">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
