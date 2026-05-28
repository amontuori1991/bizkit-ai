# BizKit AI

BizKit AI e una piattaforma SaaS AI verticale per palestre e business fitness. Include marketing site, login utenti, dashboard, generatori AI, CRM, billing Stripe, lead magnet, analytics, admin dashboard e download protetti.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
- OpenAI API
- Stripe Checkout e Subscriptions
- Resend
- Vercel

## Installazione

1. Installa le dipendenze:

```bash
npm install
```

2. Copia `.env.example` in `.env.local`.

3. Controlla la configurazione:

```bash
npm run check:env
```

4. Se vuoi generare kit premium e freebie:

```bash
npm run build:kit
```

5. Avvia in locale:

```bash
npm run dev
```

Apri `http://localhost:3000`.

## Configurazione `.env.local`

Compila le variabili principali:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
RESEND_API_KEY=
ADMIN_PASSWORD=
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_META_PIXEL_ID=
```

Variabili aggiuntive utili:

```bash
OPENAI_MODEL=gpt-5.2
STRIPE_PRICE_STARTER=
STRIPE_PRICE_PRO=
STRIPE_PRICE_AGENCY=
```

## Cosa succede se mancano le variabili

Il progetto non deve andare in crash:

- senza Supabase, login e dashboard mostrano messaggi chiari e restano disattivati
- senza OpenAI, i generatori AI vengono mostrati ma non sono utilizzabili
- senza Stripe, checkout one-time e subscription risultano disattivati
- senza Resend, il lead viene salvato ma l'invio email resta spento
- senza admin password, il login admin segnala la configurazione mancante

Per vedere tutto in un unico posto:

```bash
/admin/setup
```

## Setup Supabase

1. Crea un progetto su Supabase.
2. Copia URL e anon key nelle env.
3. Applica lo schema in `supabase/schema.sql` oppure la migration esistente.
4. Verifica che auth email/password sia attiva.

Tabelle principali incluse:

- `profiles`
- `products`
- `orders`
- `downloads`
- `leads`
- `generated_contents`
- `customers`
- `subscriptions`

Sono incluse anche tabelle di compatibilita per il CRM e i contenuti salvati.

## Test pagamento Stripe

### Kit digitale

Usa la pagina:

```bash
/checkout?product=ai-kit-per-palestre
```

Il flusso:

1. crea una Checkout Session server-side
2. apre Stripe Checkout
3. reindirizza a `/success?session_id=...`
4. verifica il pagamento
5. abilita il download protetto tramite `/api/download`

### Subscription SaaS

Usa la pagina:

```bash
/dashboard/billing
```

Per attivarla servono:

- `STRIPE_PRICE_STARTER`
- `STRIPE_PRICE_PRO`
- `STRIPE_PRICE_AGENCY`

## Deploy Vercel

1. Collega il repository a Vercel.
2. Inserisci le stesse variabili in `Preview` e `Production`.
3. Imposta `NEXT_PUBLIC_APP_URL` con il dominio finale.
4. Fai un deploy preview.
5. Verifica:
   - login/signup
   - generatori AI
   - billing
   - checkout
   - lead magnet
   - admin setup
   - robots e sitemap

## Script utili

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run check:env
npm run build:kit
```

## File importanti

- `lib/env.ts`: validazione e fallback delle env
- `lib/supabase/client.ts`: client browser Supabase
- `lib/supabase/server.ts`: client server Supabase
- `lib/openai.ts`: helper OpenAI
- `lib/resend.ts`: helper email Resend
- `supabase/schema.sql`: schema SQL completo
- `scripts/check-env.ts`: verifica guidata dell'ambiente
- `app/admin/setup/page.tsx`: dashboard stato configurazione

## Verifica finale

Prima di fare deploy:

```bash
npm run check:env
npm run lint
npm run typecheck
npm run build
```

## Guida dettagliata

Per la configurazione step-by-step dei servizi esterni, leggi [SETUP.md](C:/Users/Alex/Documents/BizKit%20AI/SETUP.md).
