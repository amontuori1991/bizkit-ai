import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="container-shell grid gap-10 py-12 md:grid-cols-[1fr_0.7fr_0.7fr]">
        <div className="space-y-4">
          <p className="text-xl font-bold text-white">BizKit AI</p>
          <p className="max-w-md leading-7 text-slate-400">
            Kit digitali pronti con prompt, template e strumenti operativi per aiutare le
            piccole attivita a usare l&apos;AI in modo concreto.
          </p>
        </div>
        <div>
          <p className="font-semibold text-white">Navigazione</p>
          <div className="mt-4 grid gap-3 text-sm">
            <Link href="/">Home</Link>
            <Link href="/dashboard">Piattaforma</Link>
            <Link href="/catalogo">Catalogo</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/contatti">Contatti</Link>
          </div>
        </div>
        <div>
          <p className="font-semibold text-white">SaaS</p>
          <div className="mt-4 grid gap-3 text-sm">
            <Link href="/signup">Crea account</Link>
            <Link href="/login">Accedi</Link>
            <Link href="/pricing">Piani</Link>
            <Link href="/demo">Demo gratuita</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
