"use client";

import { startTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type CollectionToolbarProps = {
  tags: string[];
  activeTag?: string;
  activeSort: string;
  inStockOnly: boolean;
  minPrice?: number;
  maxPrice?: number;
  availablePriceRange: {
    min: number;
    max: number;
  };
};

export function CollectionToolbar({
  tags,
  activeTag,
  activeSort,
  inStockOnly,
  minPrice,
  maxPrice,
  availablePriceRange,
}: CollectionToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function applyParams(updater: (params: URLSearchParams) => void) {
    const nextParams = new URLSearchParams(searchParams.toString());
    updater(nextParams);
    const query = nextParams.toString();

    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  function normalizePriceValue(value: string) {
    const parsed = Number(value.replace(",", "."));

    if (!Number.isFinite(parsed) || parsed < 0) {
      return null;
    }

    return Math.round(parsed);
  }

  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-[0_16px_42px_rgba(16,32,51,0.06)]">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-rust)]">
              Filtres collection
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  applyParams((params) => {
                    params.delete("tag");
                    params.set("page", "1");
                  })
                }
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  !activeTag
                    ? "bg-[var(--color-ink)] text-white"
                    : "border border-black/10 bg-[var(--color-cream)] text-[var(--color-ink)] hover:bg-black/5"
                }`}
              >
                Tous
              </button>

              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    applyParams((params) => {
                      if (activeTag === tag) {
                        params.delete("tag");
                      } else {
                        params.set("tag", tag);
                      }

                      params.set("page", "1");
                    })
                  }
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeTag === tag
                      ? "bg-[var(--color-rust)] text-white"
                      : "border border-black/10 bg-[var(--color-cream)] text-[var(--color-ink)] hover:bg-black/5"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-3 rounded-full border border-black/10 bg-[var(--color-cream)] px-4 py-3 text-sm font-medium text-[var(--color-ink)]">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(event) =>
                  applyParams((params) => {
                    if (event.currentTarget.checked) {
                      params.set("stock", "1");
                    } else {
                      params.delete("stock");
                    }

                    params.set("page", "1");
                  })
                }
                className="h-4 w-4 accent-[var(--color-rust)]"
              />
              En stock uniquement
            </label>

            <label className="flex items-center gap-3 rounded-full border border-black/10 bg-[var(--color-cream)] px-4 py-3 text-sm font-medium text-[var(--color-ink)]">
              <span>Trier</span>
              <select
                value={activeSort}
                onChange={(event) =>
                  applyParams((params) => {
                    params.set("sort", event.currentTarget.value);
                    params.set("page", "1");
                  })
                }
                className="bg-transparent font-semibold outline-none"
              >
                <option value="featured">Selection</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix decroissant</option>
                <option value="title">Nom A-Z</option>
                <option value="newest">Nouveautes</option>
              </select>
            </label>
          </div>
        </div>

        <div className="flex-1">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const submittedMinPrice = String(formData.get("minPrice") ?? "");
              const submittedMaxPrice = String(formData.get("maxPrice") ?? "");

              applyParams((params) => {
                const normalizedMin = normalizePriceValue(submittedMinPrice);
                const normalizedMax = normalizePriceValue(submittedMaxPrice);

                if (normalizedMin !== null) {
                  params.set("minPrice", String(normalizedMin));
                } else {
                  params.delete("minPrice");
                }

                if (normalizedMax !== null) {
                  params.set("maxPrice", String(normalizedMax));
                } else {
                  params.delete("maxPrice");
                }

                params.set("page", "1");
              });
            }}
            className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]"
          >
            <label className="rounded-[1.5rem] border border-black/10 bg-[var(--color-cream)] px-4 py-3">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-rust)]">Prix min</span>
              <input
                type="number"
                name="minPrice"
                min={availablePriceRange.min}
                max={availablePriceRange.max}
                inputMode="numeric"
                defaultValue={minPrice?.toString() ?? ""}
                placeholder={String(availablePriceRange.min)}
                className="mt-2 block w-full bg-transparent text-sm font-semibold outline-none"
              />
            </label>

            <label className="rounded-[1.5rem] border border-black/10 bg-[var(--color-cream)] px-4 py-3">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-rust)]">Prix max</span>
              <input
                type="number"
                name="maxPrice"
                min={availablePriceRange.min}
                max={availablePriceRange.max}
                inputMode="numeric"
                defaultValue={maxPrice?.toString() ?? ""}
                placeholder={String(availablePriceRange.max)}
                className="mt-2 block w-full bg-transparent text-sm font-semibold outline-none"
              />
            </label>

            <button
              type="submit"
              className="rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              Appliquer
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.currentTarget.form?.reset();
                applyParams((params) => {
                  params.delete("tag");
                  params.delete("stock");
                  params.delete("sort");
                  params.delete("minPrice");
                  params.delete("maxPrice");
                  params.delete("page");
                });
              }}
              className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-black/5"
            >
              Reinitialiser
            </button>
          </form>

          <p className="mt-3 text-sm leading-7 text-[color:rgba(16,32,51,0.66)]">
            Fourchette disponible : {availablePriceRange.min} EUR a {availablePriceRange.max} EUR
          </p>
        </div>
      </div>
    </div>
  );
}
