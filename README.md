# TestBoutique Headless

Base storefront `Next.js 16 + Tailwind 4 + Shopify Storefront API`.

## Demarrage

```bash
npm install
npm run dev
```

Le site fonctionne deja en mode demo sans variables Shopify.

## Brancher Shopify

1. Duplique `.env.example` en `.env.local`
2. Remplis :

```bash
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=misterping.myshopify.com
SHOPIFY_STOREFRONT_PRIVATE_TOKEN=shpss_xxxxxxxxxxxxxxxxxxxxx
SHOPIFY_STOREFRONT_API_VERSION=2025-10
```

3. Redemarre `npm run dev`

La homepage et la page produit utiliseront alors les vraies donnees Shopify.

## Structure

- `src/app/page.tsx` : homepage storefront
- `src/app/products/[handle]/page.tsx` : fiche produit
- `src/lib/shopify.ts` : requetes Storefront API et fallback demo

## Etapes suivantes conseillees

- page collection avec filtres
- panier headless via Cart API Shopify
- search autocomplete
- compte client
- checkout redirige vers Shopify
