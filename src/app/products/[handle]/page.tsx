import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { formatPrice, getProductPageData } from "@/lib/shopify";

function shouldBypassImageOptimization(url: string) {
  return url.includes("cdn.shopify.com");
}

type ProductPageProps = {
  params: Promise<{
    handle: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const data = await getProductPageData(handle);
  const { product } = data;

  return (
    <main className="min-h-screen bg-[var(--color-cream)] px-6 py-8 text-[var(--color-ink)]">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="inline-flex rounded-full border border-black/10 px-4 py-2 text-sm font-medium hover:bg-black/5">
          Retour a l&apos;accueil
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_48px_rgba(16,32,51,0.08)]">
            {product.featuredImage ? (
              <div className="relative aspect-[4/4.6]">
                <Image
                  src={product.featuredImage.url}
                  alt={product.featuredImage.altText ?? product.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  unoptimized={shouldBypassImageOptimization(product.featuredImage.url)}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-[4/4.6] items-center justify-center bg-[var(--color-mist)] text-sm text-[color:rgba(16,32,51,0.6)]">
                Pas d&apos;image Shopify pour ce produit.
              </div>
            )}
          </div>

          <section className="rounded-[2rem] bg-white p-8 shadow-[0_18px_48px_rgba(16,32,51,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-rust)]">
              {data.mode === "live" ? data.shopName : "Demo storefront"}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">{product.title}</h1>
            <p className="mt-5 text-2xl font-semibold">{formatPrice(product.price)}</p>
            <p className="mt-5 text-base leading-8 text-[color:rgba(16,32,51,0.74)]">{product.description}</p>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[color:rgba(16,32,51,0.66)]">
              <span className="rounded-full bg-[var(--color-mist)] px-3 py-1 font-semibold uppercase tracking-[0.16em] text-[var(--color-rust)]">
                {product.availableForSale ? "En stock" : "Indisponible"}
              </span>
              {product.variantTitle && product.variantTitle !== "Default Title" ? <span>{product.variantTitle}</span> : null}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[var(--color-mist)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-rust)]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-8 grid gap-4 rounded-[1.5rem] bg-[var(--color-mist)] p-5 text-sm leading-7 text-[color:rgba(16,32,51,0.72)]">
              <p>Front produit React, sans compromis sur le layout ni sur la hierarchie visuelle.</p>
              <p>Le panier headless dialogue deja avec Shopify et garde le checkout natif pour la conversion.</p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <AddToCartButton
                merchandiseId={data.mode === "live" ? product.variantId : null}
                availableForSale={data.mode === "live" && product.availableForSale}
                className="rounded-full bg-[var(--color-ink)] px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
              />
              <Link
                href="/"
                className="rounded-full border border-black/10 px-6 py-3 font-semibold transition hover:bg-black/5"
              >
                Continuer a explorer
              </Link>
            </div>

            {data.error ? (
              <p className="mt-6 rounded-[1.25rem] border border-[var(--color-rust)]/20 bg-[var(--color-rust)]/8 px-4 py-3 text-sm text-[var(--color-rust)]">
                Message Shopify : {data.error}
              </p>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
