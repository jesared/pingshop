import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  SHOPIFY_CART_COOKIE,
  getCart,
  removeCartLines,
  updateCartLines,
} from "@/lib/shopify";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function resolveCartId() {
  const cookieStore = await cookies();
  return cookieStore.get(SHOPIFY_CART_COOKIE)?.value ?? null;
}

export async function PATCH(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid cart line payload.");
  }

  const lineId =
    typeof payload === "object" &&
    payload !== null &&
    "lineId" in payload &&
    typeof payload.lineId === "string"
      ? payload.lineId
      : null;
  const quantity =
    typeof payload === "object" &&
    payload !== null &&
    "quantity" in payload &&
    typeof payload.quantity === "number"
      ? Math.max(1, Math.floor(payload.quantity))
      : null;

  if (!lineId || quantity === null) {
    return jsonError("A valid line id and quantity are required.");
  }

  const cartId = await resolveCartId();

  if (!cartId) {
    return jsonError("No Shopify cart found.", 404);
  }

  try {
    const currentCart = await getCart(cartId);

    if (!currentCart) {
      const response = jsonError("Shopify cart not found.", 404);
      response.cookies.delete(SHOPIFY_CART_COOKIE);
      return response;
    }

    const cart = await updateCartLines(currentCart.id, [{ id: lineId, quantity }]);
    return NextResponse.json({ cart });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to update the Shopify cart line.",
      500,
    );
  }
}

export async function DELETE(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid cart line payload.");
  }

  const lineId =
    typeof payload === "object" &&
    payload !== null &&
    "lineId" in payload &&
    typeof payload.lineId === "string"
      ? payload.lineId
      : null;

  if (!lineId) {
    return jsonError("A cart line id is required.");
  }

  const cartId = await resolveCartId();

  if (!cartId) {
    return jsonError("No Shopify cart found.", 404);
  }

  try {
    const currentCart = await getCart(cartId);

    if (!currentCart) {
      const response = jsonError("Shopify cart not found.", 404);
      response.cookies.delete(SHOPIFY_CART_COOKIE);
      return response;
    }

    const cart = await removeCartLines(currentCart.id, [lineId]);
    return NextResponse.json({ cart });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to remove the Shopify cart line.",
      500,
    );
  }
}
