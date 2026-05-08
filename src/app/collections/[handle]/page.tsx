import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { CollectionToolbar } from "@/components/collection/collection-toolbar";
import { formatPrice, getCollectionPageData, type StorefrontProduct } from "@/lib/shopify";

const PRODUCTS_PER_PAGE = 6;

function shouldBypassImageOptimization(url: string) {
  return url.includes("cdn.shopify.com");
}

type CollectionPageProps = {
  params: Promise<{
    handle: string;
  }>;
  searchParams: Promise<{
    tag?: string;
    sort?: string;
    stock?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  }>;
};

function sortProducts(products: StorefrontProduct[], sort: string) {
  const nextProducts = [...products];

  switch (sort) {
    case "price-asc":
      return nextProducts.sort((left, right) => Number(left.price.amount) - Number(right.price.amount));
    case "price-desc":
      return nextProducts.sort((left, right) => Number(right.price.amount) - Number(left.price.amount));
    case "title":
      return nextProducts.sort((left, right) => left.title.localeCompare(right.title, "fr"));
    case "newest":
      return nextProducts.reverse();
    default:
      return nextProducts;
  }
}

function parsePositiveNumber(value?: string) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
}

function buildPageHref(
  handle: string,
  filters: {
    tag?: string;
    sort?: string;
    stock?: string;
    minPrice?: number;
    maxPrice?: number;
  },
  page: number,
) {
  const params = new URLSearchParams();

  if (filters.tag) {
    params.set("tag", filters.tag);
  }

  if (filters.sort && filters.sort !== "featured") {
    params.set("sort", filters.sort);
  }

  if (filters.stock === "1") {
    params.set("stock", "1");
  }

  if (typeof filters.minPrice === "number") {
    params.set("minPrice", String(filters.minPrice));
  }

  if (typeof filters.maxPrice === "number") {
    params.set("maxPrice", String(filters.maxPrice));
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/collections/${handle}?${query}` : `/collections/${handle}`;
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const { handle } = await params;
  const filters = await searchParams;
  const data = await getCollectionPageData(handle);

  const activeTag = filters.tag && data.availableTags.includes(filters.tag) ? filters.tag : undefined;
  const activeSort = filters.sort ?? "featured";
  const inStockOnly = filters.stock === "1";
  const minPrice = parsePositiveNumber(filters.minPrice);
  const maxPrice = parsePositiveNumber(filters.maxPrice);
  const priceValues = data.products.map((product) => Number(product.price.amount));
  const availablePriceRange = {
    min: priceValues.length ? Math.floor(Math.min(...priceValues)) : 0,
    max: priceValues.length ? Math.ceil(Math.max(...priceValues)) : 0,
  };

  const filteredProducts = sortProducts(
    data.products.filter((product) => {
      if (activeTag && !product.tags.includes(activeTag)) {
        return false;
      }

      if (inStockOnly && !product.availableForSale) {
        return false;
      }

      const price = Number(product.price.amount);

      if (typeof minPrice === "number" && price < minPrice) {
        return false;
      }

      if (typeof maxPrice === "number" && price > maxPrice) {
        return false;
      }

      return true;
    }),
    activeSort,
  );
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const currentPage = Math.min(
    Math.max(1, Number.parseInt(filters.page ?? "1", 10) || 1),
    totalPages,
  );
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE,
  );

  return (
    <main className="min-h-screen bg-[var(--color-cream)] px-6 py-8 text-[var(--color-ink)]">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/" className="rounded-full border border-black/10 px-4 py-2 font-medium hover:bg-black/5">
            Retour a l&apos;accueil
          </Link>
          <span className="text-[color:rgba(16,32,51,0.45)]">/</span>
          <span className="font-medium text-[color:rgba(16,32,51,0.7)]">Collection</span>
        </div>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] bg-white p-8 shadow-[0_18px_48px_rgba(16,32,51,0.08)] md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-rust)]">
              {data.mode === "live" ? data.shopName : "Demo storefront"}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">{data.collection.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[color:rgba(16,32,51,0.74)]">
              {data.collection.description ||
                "Ajoute une description de collection dans Shopify pour donner plus de densite editoriale a cette page."}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <div className="rounded-[1.5rem] bg-[var(--color-mist)] px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-rust)]">Produits visibles</p>
                <p className="mt-2 text-2xl font-semibold">{filteredProducts.length}</p>
              </div>
              <div className="rounded-[1.5rem] bg-[var(--color-mist)] px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-rust)]">Tags</p>
                <p className="mt-2 text-2xl font-semibold">{data.availableTags.length}</p>
              </div>
              <div className="rounded-[1.5rem] bg-[var(--color-mist)] px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-rust)]">Pages</p>
                <p className="mt-2 text-2xl font-semibold">{totalPages}</p>
              </div>
            </div>
          </div>

          <aside className="overflow-hidden rounded-[2rem] bg-[var(--color-ink)] text-[var(--color-cream)] shadow-[0_18px_48px_rgba(16,32,51,0.12)]">
            {data.collection.image ? (
              <div className="relative aspect-[4/3]">
                <Image
                  src={data.collection.image.url}
                  alt={data.collection.image.altText ?? data.collection.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 35vw"
                  unoptimized={shouldBypassImageOptimization(data.collection.image.url)}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center bg-white/8 text-sm text-[var(--color-sand)]">
                Pas d&apos;image Shopify pour cette collection.
              </div>
            )}

            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-sand)]">Vue headless</p>
              <p className="mt-3 text-sm leading-7 text-[var(--color-sand)]">
                Ici, tu controles le merchandising, les filtres et la mise en avant produit sans retomber dans les
                limites d&apos;un theme classique.
              </p>
            </div>
          </aside>
        </section>

        <section className="mt-6">
          <CollectionToolbar
            tags={data.availableTags}
            activeTag={activeTag}
            activeSort={activeSort}
            inStockOnly={inStockOnly}
            minPrice={minPrice}
            maxPrice={maxPrice}
            availablePriceRange={availablePriceRange}
          />
        </section>

        {data.error ? (
          <p className="mt-6 rounded-[1.25rem] border border-[var(--color-rust)]/20 bg-[var(--color-rust)]/8 px-4 py-3 text-sm text-[var(--color-rust)]">
            Message Shopify : {data.error}
          </p>
        ) : null}

        <section className="mt-6 grid gap-5 lg:grid-cols-3">
          {paginatedProducts.map((product) => (
            <article
              key={product.id}
              className="flex h-full flex-col overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_42px_rgba(16,32,51,0.07)]"
            >
              {product.featuredImage ? (
                <div className="relative aspect-[4/3] bg-[var(--color-mist)]">
                  <Image
                    src={product.featuredImage.url}
                    alt={product.featuredImage.altText ?? product.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    unoptimized={shouldBypassImageOptimization(product.featuredImage.url)}
                    className="object-cover transition duration-500 hover:scale-[1.03]"
                  />
                </div>
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center bg-[var(--color-mist)] text-sm text-[color:rgba(16,32,51,0.6)]">
                  Pas d&apos;image
                </div>
              )}

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

                <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em]">{product.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-7 text-[color:rgba(16,32,51,0.72)]">{product.description}</p>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xl font-semibold">{formatPrice(product.price)}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-rust)]">
                      {product.availableForSale ? "En stock" : "Indisponible"}
                    </p>
                  </div>
                  <Link
                    href={`/products/${product.handle}`}
                    className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold hover:bg-black/5"
                  >
                    Voir
                  </Link>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <AddToCartButton
                    merchandiseId={data.mode === "live" ? product.variantId : null}
                    availableForSale={data.mode === "live" && product.availableForSale}
                    className="rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
                  />
                </div>
              </div>
            </article>
          ))}
        </section>

        {filteredProducts.length ? (
          <section className="mt-8 flex flex-col items-center justify-between gap-4 rounded-[2rem] bg-white px-6 py-5 shadow-[0_16px_42px_rgba(16,32,51,0.06)] md:flex-row">
            <p className="text-sm leading-7 text-[color:rgba(16,32,51,0.68)]">
              Page <span className="font-semibold text-[var(--color-ink)]">{currentPage}</span> sur{" "}
              <span className="font-semibold text-[var(--color-ink)]">{totalPages}</span>
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={buildPageHref(
                  handle,
                  {
                    tag: activeTag,
                    sort: activeSort,
                    stock: inStockOnly ? "1" : undefined,
                    minPrice,
                    maxPrice,
                  },
                  Math.max(1, currentPage - 1),
                )}
                aria-disabled={currentPage === 1}
                className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                  currentPage === 1
                    ? "pointer-events-none bg-black/8 text-[color:rgba(16,32,51,0.35)]"
                    : "border border-black/10 hover:bg-black/5"
                }`}
              >
                Precedent
              </Link>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <Link
                  key={pageNumber}
                  href={buildPageHref(
                    handle,
                    {
                      tag: activeTag,
                      sort: activeSort,
                      stock: inStockOnly ? "1" : undefined,
                      minPrice,
                      maxPrice,
                    },
                    pageNumber,
                  )}
                  className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                    pageNumber === currentPage
                      ? "bg-[var(--color-ink)] text-white"
                      : "border border-black/10 hover:bg-black/5"
                  }`}
                >
                  {pageNumber}
                </Link>
              ))}

              <Link
                href={buildPageHref(
                  handle,
                  {
                    tag: activeTag,
                    sort: activeSort,
                    stock: inStockOnly ? "1" : undefined,
                    minPrice,
                    maxPrice,
                  },
                  Math.min(totalPages, currentPage + 1),
                )}
                aria-disabled={currentPage === totalPages}
                className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                  currentPage === totalPages
                    ? "pointer-events-none bg-black/8 text-[color:rgba(16,32,51,0.35)]"
                    : "border border-black/10 hover:bg-black/5"
                }`}
              >
                Suivant
              </Link>
            </div>
          </section>
        ) : null}

        {!filteredProducts.length ? (
          <section className="mt-6 rounded-[2rem] bg-white p-8 text-center shadow-[0_16px_42px_rgba(16,32,51,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-rust)]">Aucun resultat</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Aucun produit ne correspond a ces filtres</h2>
            <p className="mt-3 text-sm leading-7 text-[color:rgba(16,32,51,0.72)]">
              Essaie un autre tag, retire le filtre stock, ou reviens a la selection complete.
            </p>
          </section>
        ) : null}
      </div>
    </main>
  );
}
