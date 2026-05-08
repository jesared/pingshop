import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { formatPrice, getHomePageData, getStorefrontSetup } from "@/lib/shopify";

function shouldBypassImageOptimization(url: string) {
  return url.includes("cdn.shopify.com");
}

export default async function Home() {
  const [data, setup] = await Promise.all([getHomePageData(), Promise.resolve(getStorefrontSetup())]);

  return (
    <main className="min-h-screen bg-[var(--color-cream)] text-[var(--color-ink)]">
      <section className="border-b border-black/10 bg-[var(--color-ink)] text-[var(--color-cream)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium uppercase tracking-[0.18em]">
            {data.mode === "live" ? "Shopify connected" : "Demo mode headless"}
          </p>
          <p className="text-[var(--color-sand)]">
            {data.mode === "live"
              ? `Storefront API active sur ${setup.storeDomain}.`
              : "Le front tourne deja en Next.js + Tailwind, meme sans token Shopify."}
          </p>
        </div>
      </section>

      <section className="hero-grid mx-auto max-w-7xl px-6 py-8 lg:py-10">
        <div className="rounded-[2rem] bg-white/80 p-8 shadow-[0_24px_80px_rgba(16,32,51,0.08)] backdrop-blur md:p-12">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-rust)]">
            Next.js 16 + Tailwind 4 + Shopify
          </p>
          <h1 className="max-w-4xl text-5xl leading-none font-semibold tracking-[-0.06em] sm:text-6xl lg:text-7xl">
            Une storefront headless que tu peux enfin aimer coder.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[color:rgba(16,32,51,0.72)]">
            On garde Shopify pour le catalogue et le checkout, mais on reprend la main sur l&apos;experience front avec
            App Router, composants propres et une vraie liberte de design.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="#produits"
              className="rounded-full bg-[var(--color-ink)] px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5"
            >
              Voir les produits
            </Link>
            <Link
              href="#onboarding"
              className="rounded-full border border-black/10 px-6 py-3 font-semibold transition hover:bg-black/5"
            >
              Configurer Shopify
            </Link>
          </div>

          <dl className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] bg-[var(--color-mist)] p-5">
              <dt className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-rust)]">Stack</dt>
              <dd className="mt-2 text-base font-medium">Server Components, TypeScript, Tailwind</dd>
            </div>
            <div className="rounded-[1.5rem] bg-[var(--color-mist)] p-5">
              <dt className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-rust)]">Back office</dt>
              <dd className="mt-2 text-base font-medium">Produits, collections, stocks et checkout Shopify</dd>
            </div>
            <div className="rounded-[1.5rem] bg-[var(--color-mist)] p-5">
              <dt className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-rust)]">Etat</dt>
              <dd className="mt-2 text-base font-medium">{data.mode === "live" ? "Connecte au store" : "Pret a brancher"}</dd>
            </div>
          </dl>
        </div>

        <aside className="rounded-[2rem] bg-[var(--color-ink)] p-8 text-[var(--color-cream)] shadow-[0_24px_80px_rgba(16,32,51,0.12)] md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-sand)]">Direction produit</p>
          <div className="mt-6 space-y-4">
            <div className="rounded-[1.5rem] bg-white/6 p-5">
              <h2 className="text-2xl font-semibold tracking-[-0.04em]">Catalogue sport, lecture premium</h2>
              <p className="mt-2 text-sm leading-7 text-[var(--color-sand)]">
                On s&apos;inspire d&apos;une energie e-commerce dense et promo, mais avec une composition plus nette et plus
                editoriale.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-[var(--color-rust)]/22 p-5">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--color-sand)]">Store Shopify</p>
              <p className="mt-3 text-lg font-semibold">{data.shop.name}</p>
              <p className="mt-2 text-sm leading-7 text-[var(--color-sand)]">
                {data.shop.description || "Ajoute une vraie description de marque dans Shopify pour enrichir le hero."}
              </p>
            </div>
          </div>
        </aside>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-rust)]">Collections</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Les univers a pousser en premier</h2>
          </div>
          <p className="hidden max-w-md text-sm leading-7 text-[color:rgba(16,32,51,0.66)] md:block">
            Une homepage headless n&apos;est pas obligee d&apos;etre une simple grille de cards. On peut vraiment raconter la
            boutique.
          </p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {data.collections.map((collection, index) => (
            <article key={collection.id} className="overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_42px_rgba(16,32,51,0.07)]">
              {collection.image ? (
                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-mist)]">
                  <Image
                    src={collection.image.url}
                    alt={collection.image.altText ?? collection.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    unoptimized={shouldBypassImageOptimization(collection.image.url)}
                    loading={index === 0 ? "eager" : "lazy"}
                    priority={index === 0}
                    className="object-cover transition duration-500 hover:scale-[1.03]"
                  />
                </div>
              ) : null}
              <div className="space-y-3 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-rust)]">Collection</p>
                <h3 className="text-2xl font-semibold tracking-[-0.04em]">{collection.title}</h3>
                <p className="text-sm leading-7 text-[color:rgba(16,32,51,0.7)]">
                  {collection.description || "Ajoute une description de collection dans Shopify pour nourrir cette carte."}
                </p>
                <div className="pt-2">
                  <Link
                    href={`/collections/${collection.handle}`}
                    className="inline-flex rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                  >
                    Explorer la collection
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="produits" className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-[2.25rem] bg-[var(--color-ink)] px-6 py-8 text-[var(--color-cream)] md:px-10 md:py-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-sand)]">Nouveautes</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Des fiches produit dignes d&apos;un vrai front React</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[var(--color-sand)]">
              Cette base te permet de brancher les vrais produits Shopify, puis d&apos;ajouter search, cart drawer, filters
              et checkout sans revenir a Liquid.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {data.products.map((product, index) => (
              <article key={product.id} className="flex h-full flex-col rounded-[1.75rem] bg-white text-[var(--color-ink)] shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
                {product.featuredImage ? (
                  <div className="relative aspect-[4/3] overflow-hidden rounded-t-[1.75rem] bg-[var(--color-mist)]">
                    <Image
                      src={product.featuredImage.url}
                      alt={product.featuredImage.altText ?? product.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      unoptimized={shouldBypassImageOptimization(product.featuredImage.url)}
                      loading={index < 2 ? "eager" : "lazy"}
                      priority={index < 2}
                      className="object-cover transition duration-500 hover:scale-[1.04]"
                    />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex flex-wrap gap-2">
                    {product.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[var(--color-mist)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-rust)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em]">{product.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-7 text-[color:rgba(16,32,51,0.72)]">{product.description}</p>
                  <div className="mt-6 flex items-center justify-between gap-4">
                    <p className="text-xl font-semibold">{formatPrice(product.price)}</p>
                    <div className="flex flex-wrap justify-end gap-3">
                      <AddToCartButton
                        merchandiseId={data.mode === "live" ? product.variantId : null}
                        availableForSale={data.mode === "live" && product.availableForSale}
                        label="Ajouter"
                        className="rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
                      />
                      <Link
                        href={`/products/${product.handle}`}
                        className="rounded-full bg-[var(--color-rust)] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                      >
                        Voir la fiche
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="onboarding" className="mx-auto max-w-7xl px-6 pb-14 pt-2">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[2rem] bg-white p-8 shadow-[0_16px_42px_rgba(16,32,51,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-rust)]">Onboarding Shopify</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">Les variables a brancher pour sortir du mode demo</h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-[color:rgba(16,32,51,0.72)]">
              <p>1. Cree un token Storefront API dans Shopify.</p>
              <p>2. Renseigne le domaine du store et le token dans <code>.env.local</code>.</p>
              <p>3. Redemarre <code>npm run dev</code> et la home passera automatiquement en mode live.</p>
            </div>

            <div className="mt-6 overflow-x-auto rounded-[1.5rem] bg-[var(--color-ink)] p-5 text-sm text-[var(--color-cream)]">
              <pre>{`NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=misterping.myshopify.com
SHOPIFY_STOREFRONT_PRIVATE_TOKEN=shpss_xxxxx
SHOPIFY_STOREFRONT_API_VERSION=${setup.apiVersion}`}</pre>
            </div>

            {data.error ? (
              <p className="mt-5 rounded-[1.25rem] border border-[var(--color-rust)]/20 bg-[var(--color-rust)]/8 px-4 py-3 text-sm text-[var(--color-rust)]">
                Dernier message Shopify : {data.error}
              </p>
            ) : null}
          </article>

          <article className="rounded-[2rem] bg-[var(--color-mist)] p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-rust)]">Suite logique</p>
            <ul className="mt-5 space-y-4 text-sm leading-7 text-[color:rgba(16,32,51,0.78)]">
              <li>Ajouter une vraie page collection avec filtres et tri.</li>
              <li>Enrichir le panier headless avec codes promo et estimations de livraison.</li>
              <li>Pointer le checkout vers Shopify pendant la phase 1, puis enrichir l&apos;apres-achat.</li>
              <li>Reprendre ton inspiration visuelle et la transformer en systeme de composants React.</li>
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
