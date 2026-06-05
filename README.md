# BizKit AI

BizKit AI e una piattaforma SaaS AI verticale per business locali. Include marketing site, login utenti, dashboard, generatori AI, AI Business Coach, CRM, billing Stripe, lead magnet, analytics, admin dashboard e download protetti.

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
GA_API_SECRET=
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
- senza `GA_API_SECRET`, GA4 continua a tracciare dal browser ma gli eventi server-side Stripe restano solo nei log interni admin

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
- `assistant_conversations`
- `assistant_messages`
- `feedback_items`
- `email_logs`
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
- `STRIPE_WEBHOOK_SECRET`

Per tracciare anche gli eventi server-side del webhook Stripe in GA4 serve inoltre:

- `GA_API_SECRET`

### AI Business Coach

La dashboard include una nuova area:

```bash
/dashboard/assistant
```

Funzioni MVP:

- chat AI persistente
- quick actions per analisi business, calendario, CRM e promo
- contesto automatico da `business_profiles`, `generated_contents`, `saved_contents`, `content_calendars`, `clients`, `subscriptions`, `ai_usage_daily`
- suggerimenti proattivi nella dashboard overview

Limiti per piano:

- Free: `10` messaggi Coach / mese
- Starter: `100` messaggi Coach / mese
- Pro: `500` messaggi Coach / mese
- Agency: `2000` messaggi Coach / mese

### Feedback beta tester

La dashboard include una nuova sezione:

```bash
/dashboard/feedback
```

Funzioni incluse:

- invio feedback con categoria, priorita e descrizione
- allegato automatico della pagina corrente
- storico personale dei feedback con stato aggiornato
- ticket code leggibile tipo `FB-XXXXXXX`
- cronologia cambi stato visibile all'utente
- pulsante rapido `Invia feedback` fisso in basso a destra nella dashboard
- gestione admin completa in:

```bash
/admin/feedback
```

Se `RESEND_API_KEY` e configurata:

- l'admin riceve una mail quando arriva un nuovo feedback
- l'utente riceve una mail quando il team cambia stato al ticket

### Email transazionali fondamentali

Con `RESEND_API_KEY` attiva, BizKit AI invia anche:

- welcome email al primo accesso dashboard dopo la registrazione
- email attivazione subscription quando Stripe sincronizza un piano `starter`, `pro` o `agency`
- email conferma acquisto kit quando il download viene collegato all'account

I log vengono salvati in:

```bash
public.email_logs
```

In:

```bash
/admin/setup
```

trovi anche:

- stato Resend
- numero template attivi
- bottoni test per welcome, subscription e kit

### Stripe Customer Portal

Gli utenti possono gestire autonomamente:

- piano attuale
- upgrade e downgrade
- metodo di pagamento
- fatture
- cancellazione

Il pulsante `Gestisci abbonamento` e disponibile in:

```bash
/dashboard/billing
```

Il portal usa il customer Stripe sincronizzato in `public.subscriptions` e torna sempre a:

```bash
/dashboard/billing
```

### Webhook Stripe subscriptions

Endpoint da configurare in Stripe:

```bash
/api/stripe/webhook
```

Eventi supportati:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

Quando `GA_API_SECRET` e configurata, il webhook registra anche in GA4:

- `subscription_started`
- `subscription_upgraded`
- `subscription_cancelled`

### Analytics GA4

Il progetto integra GA4 con:

- page view automatiche compatibili con Next.js App Router
- helper centralizzato in `lib/analytics.ts`
- eventi SaaS per signup, login, business profile, generazioni, contenuti salvati, calendari, CRM, feedback, Coach, subscription e download
- log interni in:

```bash
public.analytics_event_logs
```

In:

```bash
/admin/analytics
```

puoi verificare:

- GA configurato
- Measurement ID
- ultimo evento registrato

In locale puoi inoltrare i webhook con Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

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

Nota tecnica: questo repository include configurazione pronta per deploy continuo su Vercel.
