"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";

type AddToCartButtonProps = {
  merchandiseId: string | null;
  availableForSale: boolean;
  label?: string;
  className?: string;
};

export function AddToCartButton({
  merchandiseId,
  availableForSale,
  label = "Ajouter au panier",
  className,
}: AddToCartButtonProps) {
  const { addItem, isMutating } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const isDisabled = !merchandiseId || !availableForSale || isAdding || isMutating;

  async function handleClick() {
    if (!merchandiseId || !availableForSale) {
      return;
    }

    setIsAdding(true);

    try {
      await addItem(merchandiseId, 1);
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={isDisabled}
      className={className}
    >
      {availableForSale ? (isAdding ? "Ajout..." : label) : "Indisponible"}
    </button>
  );
}
