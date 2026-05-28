# Setup BizKit AI

Questa guida ti accompagna nella configurazione completa del progetto in locale e su Vercel.

## 1. Stripe

### Dove creare l'account

Vai su [Stripe](https://dashboard.stripe.com/register) e crea un account.

### Dove prendere le chiavi

Nel dashboard Stripe:

1. apri `Developers`
2. entra in `API keys`
3. copia:
   - `Publishable key`
   - `Secret key`

Inseriscile in:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
```

### Dove prendere il webhook secret

1. apri `Developers > Webhooks`
2. crea un endpoint oppure usa Stripe CLI in locale
3. copia il `Signing secret`

Inseriscilo in:

```bash
STRIPE_WEBHOOK_SECRET=
```

### Dove creare i prezzi subscription

1. crea tre prezzi ricorrenti in Stripe
2. salva i Price ID in:

```bash
STRIPE_PRICE_STARTER=
STRIPE_PRICE_PRO=
STRIPE_PRICE_AGENCY=
```

## 2. Supabase

### Dove creare il progetto

Vai su [Supabase](https://supabase.com/) e crea un nuovo progetto.

### Dove prendere URL e chiavi

Nel dashboard Supabase:

1. apri `Project Settings`
2. entra in `API`
3. copia:
   - `Project URL`
   - `anon public key`
   - `service_role key`

Inseriscile in:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### Come applicare lo schema

1. apri `SQL Editor`
2. incolla il contenuto di `supabase/schema.sql`
3. esegui lo script

## 3. OpenAI

### Dove creare la chiave

Vai su [OpenAI Platform](https://platform.openai.com/api-keys) e crea una nuova API key.

Inseriscila in:

```bash
OPENAI_API_KEY=
```

Facoltativo:

```bash
OPENAI_MODEL=gpt-5.2
```

## 4. Resend

### Dove creare la chiave

Vai su [Resend](https://resend.com/) e crea un account.

Nel dashboard:

1. apri `API Keys`
2. crea una chiave
3. copiala in:

```bash
RESEND_API_KEY=
```

Se la chiave manca, il progetto continua a funzionare ma non invia email.

## 5. Admin password

Imposta una password semplice per la dashboard admin:

```bash
ADMIN_PASSWORD=
```

Accesso:

```bash
/admin/login
```

## 6. Analytics

### Google Analytics 4

Vai su [Google Analytics](https://analytics.google.com/) e crea una property GA4. Copia il Measurement ID:

```bash
NEXT_PUBLIC_GA_ID=
```

### Meta Pixel

Vai su [Meta Events Manager](https://business.facebook.com/events_manager2/) e crea o recupera il Pixel ID:

```bash
NEXT_PUBLIC_META_PIXEL_ID=
```

## 7. Configurazione Vercel

### Dove configurare

Vai su [Vercel](https://vercel.com/), importa il repository e poi apri:

`Project Settings > Environment Variables`

Inserisci tutte le variabili usate in `.env.local`.

### Consiglio pratico

Configura le variabili almeno in:

- `Preview`
- `Production`

Per produzione imposta:

```bash
NEXT_PUBLIC_APP_URL=https://tuo-dominio.it
```

## 8. Avvio locale

1. Installa dipendenze:

```bash
npm install
```

2. Crea `.env.local` partendo da `.env.example`

3. Controlla le env:

```bash
npm run check:env
```

4. Genera il kit se ti serve:

```bash
npm run build:kit
```

5. Avvia il progetto:

```bash
npm run dev
```

6. Apri:

```bash
http://localhost:3000
```

## 9. Pagina diagnostica

Per verificare rapidamente cosa e configurato:

```bash
/admin/setup
```

La pagina mostra:

- stato Stripe
- stato Supabase
- stato OpenAI
- stato Resend
- stato Analytics
- stato Admin password

## 10. Controlli finali

Prima del deploy:

```bash
npm run lint
npm run typecheck
npm run build
```

Se vuoi una verifica completa dell'ambiente:

```bash
npm run check:env
```
