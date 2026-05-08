import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  SHOPIFY_CART_COOKIE,
  addCartLines,
  createCart,
  getCart,
} from "@/lib/shopify";

const cartCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(SHOPIFY_CART_COOKIE)?.value;

  if (!cartId) {
    return NextResponse.json({ cart: null });
  }

  try {
    const cart = await getCart(cartId);
    const response = NextResponse.json({ cart });

    if (!cart) {
      response.cookies.delete(SHOPIFY_CART_COOKIE);
    }

    return response;
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to load the Shopify cart.",
      500,
    );
  }
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid cart payload.");
  }

  const merchandiseId =
    typeof payload === "object" &&
    payload !== null &&
    "merchandiseId" in payload &&
    typeof payload.merchandiseId === "string"
      ? payload.merchandiseId
      : null;
  const quantity =
    typeof payload === "object" &&
    payload !== null &&
    "quantity" in payload &&
    typeof payload.quantity === "number"
      ? Math.max(1, Math.floor(payload.quantity))
      : 1;

  if (!merchandiseId) {
    return jsonError("A Shopify variant id is required.");
  }

  const cookieStore = await cookies();
  const existingCartId = cookieStore.get(SHOPIFY_CART_COOKIE)?.value;

  try {
    let cart = null;

    if (existingCartId) {
      const existingCart = await getCart(existingCartId);

      cart = existingCart
        ? await addCartLines(existingCart.id, [{ merchandiseId, quantity }])
        : await createCart([{ merchandiseId, quantity }]);
    } else {
      cart = await createCart([{ merchandiseId, quantity }]);
    }

    const response = NextResponse.json({ cart });
    response.cookies.set(SHOPIFY_CART_COOKIE, cart.id, cartCookieOptions);
    return response;
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to add item to the Shopify cart.",
      500,
    );
  }
}
