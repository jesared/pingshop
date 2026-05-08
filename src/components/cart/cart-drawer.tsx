"use client";

import Image from "next/image";
import { formatPrice } from "@/lib/shopify";
import { useCart } from "@/components/cart/cart-provider";

function shouldBypassImageOptimization(url: string) {
  return url.includes("cdn.shopify.com");
}

export function CartDrawer() {
  const { cart, error, isLoading, isMutating, isOpen, openCart, closeCart, updateItemQuantity, removeItem } = useCart();
  const hasItems = Boolean(cart?.lines.length);

  return (
    <>
      <button
        type="button"
        onClick={openCart}
        className="fixed right-5 bottom-5 z-40 inline-flex items-center gap-3 rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_55px_rgba(16,32,51,0.28)] hover:-translate-y-0.5"
      >
        <span>Panier</span>
        <span className="rounded-full bg-white/12 px-2.5 py-1 text-xs tracking-[0.16em] uppercase">
          {cart?.totalQuantity ?? 0}
        </span>
      </button>

      <div
        className={`fixed inset-0 z-50 transition ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!isOpen}
      >
        <button
          type="button"
          onClick={closeCart}
          className={`absolute inset-0 bg-[rgba(16,32,51,0.45)] backdrop-blur-sm transition-opacity ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Fermer le panier"
        />

        <aside
          className={`absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-[var(--color-cream)] text-[var(--color-ink)] shadow-[-20px_0_60px_rgba(16,32,51,0.18)] transition-transform duration-200 ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-rust)]">Panier Shopify</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Ton selection</h2>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium hover:bg-black/5"
            >
              Fermer
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {isLoading ? (
              <div className="rounded-[1.5rem] bg-white px-5 py-6 text-sm text-[color:rgba(16,32,51,0.7)] shadow-[0_12px_32px_rgba(16,32,51,0.06)]">
                Chargement du panier Shopify...
              </div>
            ) : null}

            {!isLoading && !hasItems ? (
              <div className="rounded-[1.75rem] bg-white p-6 shadow-[0_12px_32px_rgba(16,32,51,0.06)]">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-rust)]">Panier vide</p>
                <p className="mt-3 text-sm leading-7 text-[color:rgba(16,32,51,0.72)]">
                  Ajoute un produit depuis la home ou une fiche produit, puis on te redirigera vers le checkout Shopify.
                </p>
              </div>
            ) : null}

            {hasItems ? (
              <div className="space-y-4">
                {cart?.lines.map((line) => {
                  const lineImage = line.merchandise.image ?? line.merchandise.product.featuredImage;

                  return (
                    <article key={line.id} className="rounded-[1.75rem] bg-white p-4 shadow-[0_12px_32px_rgba(16,32,51,0.06)]">
                      <div className="flex gap-4">
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[1.25rem] bg-[var(--color-mist)]">
                          {lineImage ? (
                            <Image
                              src={lineImage.url}
                              alt={lineImage.altText ?? line.merchandise.product.title}
                              fill
                              sizes="96px"
                              unoptimized={shouldBypassImageOptimization(lineImage.url)}
                              className="object-cover"
                            />
                          ) : null}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-lg font-semibold tracking-[-0.03em]">{line.merchandise.product.title}</p>
                          <p className="mt-1 text-sm text-[color:rgba(16,32,51,0.65)]">{line.merchandise.title}</p>

                          {line.merchandise.selectedOptions.length ? (
                            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[var(--color-rust)]">
                              {line.merchandise.selectedOptions.map((option) => option.value).join(" / ")}
                            </p>
                          ) : null}

                          <div className="mt-4 flex items-center justify-between gap-3">
                            <div className="inline-flex items-center rounded-full border border-black/10 bg-[var(--color-cream)] p-1">
                              <button
                                type="button"
                                onClick={() => void updateItemQuantity(line.id, Math.max(1, line.quantity - 1))}
                                disabled={isMutating}
                                className="rounded-full px-3 py-2 text-sm font-semibold disabled:opacity-40"
                                aria-label={`Diminuer la quantite de ${line.merchandise.product.title}`}
                              >
                                -
                              </button>
                              <span className="min-w-10 text-center text-sm font-semibold">{line.quantity}</span>
                              <button
                                type="button"
                                onClick={() => void updateItemQuantity(line.id, line.quantity + 1)}
                                disabled={isMutating}
                                className="rounded-full px-3 py-2 text-sm font-semibold disabled:opacity-40"
                                aria-label={`Augmenter la quantite de ${line.merchandise.product.title}`}
                              >
                                +
                              </button>
                            </div>

                            <div className="text-right">
                              <p className="text-base font-semibold">{formatPrice(line.cost.totalAmount)}</p>
                              <button
                                type="button"
                                onClick={() => void removeItem(line.id)}
                                disabled={isMutating}
                                className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-rust)] disabled:opacity-40"
                              >
                                Retirer
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}

            {error ? (
              <p className="mt-4 rounded-[1.25rem] border border-[var(--color-rust)]/20 bg-[var(--color-rust)]/8 px-4 py-3 text-sm text-[var(--color-rust)]">
                {error}
              </p>
            ) : null}
          </div>

          <div className="border-t border-black/10 px-6 py-5">
            <div className="flex items-center justify-between text-sm text-[color:rgba(16,32,51,0.72)]">
              <span>Sous-total</span>
              <span className="font-semibold text-[var(--color-ink)]">
                {cart ? formatPrice(cart.cost.subtotalAmount) : formatPrice({ amount: "0", currencyCode: "EUR" })}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{cart ? formatPrice(cart.cost.totalAmount) : formatPrice({ amount: "0", currencyCode: "EUR" })}</span>
            </div>

            <a
              href={cart?.checkoutUrl ?? "#"}
              className={`mt-5 inline-flex w-full items-center justify-center rounded-full px-6 py-3 font-semibold text-white ${
                cart?.checkoutUrl ? "bg-[var(--color-ink)] hover:-translate-y-0.5" : "pointer-events-none bg-black/25"
              }`}
            >
              Aller au checkout Shopify
            </a>
          </div>
        </aside>
      </div>
    </>
  );
}
