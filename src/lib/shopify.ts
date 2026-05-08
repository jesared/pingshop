type Money = {
  amount: string;
  currencyCode: string;
};

type ShopifyImage = {
  url: string;
  altText: string | null;
};

type SelectedOption = {
  name: string;
  value: string;
};

type ProductVariantSummary = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: SelectedOption[];
};

type ShopifyProductReference = {
  handle: string;
  title: string;
  featuredImage: ShopifyImage | null;
};

export type StorefrontCollection = {
  id: string;
  title: string;
  handle: string;
  description: string;
  image: ShopifyImage | null;
};

export type StorefrontProduct = {
  id: string;
  title: string;
  handle: string;
  description: string;
  tags: string[];
  featuredImage: ShopifyImage | null;
  price: Money;
  variantId: string | null;
  availableForSale: boolean;
  variantTitle: string | null;
};

export type StorefrontCartLine = {
  id: string;
  quantity: number;
  cost: {
    totalAmount: Money;
  };
  merchandise: {
    id: string;
    title: string;
    image: ShopifyImage | null;
    selectedOptions: SelectedOption[];
    product: ShopifyProductReference;
  };
};

export type StorefrontCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
  };
  lines: StorefrontCartLine[];
};

type HomePageData = {
  mode: "demo" | "live";
  shop: {
    name: string;
    description: string;
    primaryDomainUrl: string;
  };
  collections: StorefrontCollection[];
  products: StorefrontProduct[];
  error?: string;
};

type ProductPageData = {
  mode: "demo" | "live";
  shopName: string;
  product: StorefrontProduct;
  error?: string;
};

type RawProductNode = {
  id: string;
  title: string;
  handle: string;
  description: string;
  tags: string[];
  featuredImage: ShopifyImage | null;
  availableForSale: boolean;
  priceRange: { minVariantPrice: Money };
  variants: {
    nodes: ProductVariantSummary[];
  };
};

type RawCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
  };
  lines: {
    nodes: Array<{
      id: string;
      quantity: number;
      cost: {
        totalAmount: Money;
      };
      merchandise: {
        id: string;
        title: string;
        image: ShopifyImage | null;
        selectedOptions: SelectedOption[];
        product: ShopifyProductReference;
      };
    }>;
  };
};

type ShopifyResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

type StorefrontFetchOptions = {
  revalidate?: number | false;
};

const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const storefrontPrivateToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;
const storefrontPublicToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION ?? "2025-10";

export const SHOPIFY_CART_COOKIE = "shopify_cart_id";

const sampleCollections: StorefrontCollection[] = [
  {
    id: "demo-collection-bois",
    title: "Bois offensifs",
    handle: "bois-offensifs",
    description: "Une selection nette pour les joueurs qui veulent du dynamisme sans perdre le controle.",
    image: {
      url: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
      altText: "Raquette de sport sur une table sombre",
    },
  },
  {
    id: "demo-collection-revetements",
    title: "Revetements",
    handle: "revetements",
    description: "Des fiches simples pour comparer l'accroche, la vitesse et la tolerance.",
    image: {
      url: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=80",
      altText: "Balles et equipements de sport en gros plan",
    },
  },
  {
    id: "demo-collection-textile",
    title: "Textiles club",
    handle: "textiles-club",
    description: "Vestes, maillots et tenues presentes comme une vraie collection de marque.",
    image: {
      url: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
      altText: "Collection textile sport presentee sur portant",
    },
  },
];

const sampleProducts: StorefrontProduct[] = [
  {
    id: "demo-product-1",
    title: "Raquette Carbon Strike",
    handle: "raquette-carbon-strike",
    description:
      "Un produit hero pour montrer comment ton front headless peut vendre avec une narration plus premium.",
    tags: ["Nouveaute", "Competition", "Top vente"],
    featuredImage: {
      url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80",
      altText: "Raquette moderne posee sur une surface claire",
    },
    price: {
      amount: "119.00",
      currencyCode: "EUR",
    },
    variantId: "gid://shopify/ProductVariant/demo-1",
    availableForSale: true,
    variantTitle: "Default Title",
  },
  {
    id: "demo-product-2",
    title: "Revetement Spin Control",
    handle: "revetement-spin-control",
    description:
      "Un exemple de fiche plus lisible qu'un theme Shopify brut, avec place pour les arguments produit.",
    tags: ["Spin", "Controle"],
    featuredImage: {
      url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80",
      altText: "Equipement de sport sur fond creme",
    },
    price: {
      amount: "42.00",
      currencyCode: "EUR",
    },
    variantId: "gid://shopify/ProductVariant/demo-2",
    availableForSale: true,
    variantTitle: "Default Title",
  },
  {
    id: "demo-product-3",
    title: "Maillot Team Edition",
    handle: "maillot-team-edition",
    description: "Une carte produit plus editoriale pour les lignes textile et les collections club.",
    tags: ["Club", "Textile"],
    featuredImage: {
      url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
      altText: "Veste de sport sur mannequin",
    },
    price: {
      amount: "54.00",
      currencyCode: "EUR",
    },
    variantId: "gid://shopify/ProductVariant/demo-3",
    availableForSale: true,
    variantTitle: "Default Title",
  },
];

const CART_FIELDS_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 50) {
      nodes {
        id
        quantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            image {
              url
              altText
            }
            selectedOptions {
              name
              value
            }
            product {
              handle
              title
              featuredImage {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

const HOME_PAGE_QUERY = /* GraphQL */ `
  query StorefrontHomePage {
    shop {
      name
      description
      primaryDomain {
        url
      }
    }
    collections(first: 3, sortKey: UPDATED_AT) {
      nodes {
        id
        title
        handle
        description
        image {
          url
          altText
        }
      }
    }
    products(first: 12, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        id
        title
        handle
        description
        tags
        availableForSale
        featuredImage {
          url
          altText
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first: 1) {
          nodes {
            id
            title
            availableForSale
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
  }
`;

const PRODUCT_PAGE_QUERY = /* GraphQL */ `
  query StorefrontProductPage($handle: String!) {
    shop {
      name
    }
    product(handle: $handle) {
      id
      title
      handle
      description
      tags
      availableForSale
      featuredImage {
        url
        altText
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      variants(first: 1) {
        nodes {
          id
          title
          availableForSale
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }
`;

const CART_QUERY = /* GraphQL */ `
  query StorefrontCart($id: ID!) {
    cart(id: $id) {
      ...CartFields
    }
  }
  ${CART_FIELDS_FRAGMENT}
`;

const CART_CREATE_MUTATION = /* GraphQL */ `
  mutation StorefrontCartCreate($input: CartInput) {
    cartCreate(input: $input) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
      warnings {
        message
      }
    }
  }
  ${CART_FIELDS_FRAGMENT}
`;

const CART_LINES_ADD_MUTATION = /* GraphQL */ `
  mutation StorefrontCartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
      warnings {
        message
      }
    }
  }
  ${CART_FIELDS_FRAGMENT}
`;

const CART_LINES_UPDATE_MUTATION = /* GraphQL */ `
  mutation StorefrontCartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
      warnings {
        message
      }
    }
  }
  ${CART_FIELDS_FRAGMENT}
`;

const CART_LINES_REMOVE_MUTATION = /* GraphQL */ `
  mutation StorefrontCartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
      warnings {
        message
      }
    }
  }
  ${CART_FIELDS_FRAGMENT}
`;

function isConfigured() {
  return Boolean(storeDomain && (storefrontPrivateToken || storefrontPublicToken));
}

async function storefrontFetch<TData>(
  query: string,
  variables?: Record<string, unknown>,
  options?: StorefrontFetchOptions,
): Promise<TData> {
  if (!storeDomain || (!storefrontPrivateToken && !storefrontPublicToken)) {
    throw new Error("Shopify Storefront API is not configured.");
  }

  const authHeaderName = storefrontPrivateToken
    ? "Shopify-Storefront-Private-Token"
    : "X-Shopify-Storefront-Access-Token";
  const authHeaderValue = (storefrontPrivateToken ?? storefrontPublicToken) as string;
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    [authHeaderName]: authHeaderValue,
  };

  const response = await fetch(`https://${storeDomain}/api/${apiVersion}/graphql.json`, {
    method: "POST",
    headers: requestHeaders,
    body: JSON.stringify({ query, variables }),
    ...(options?.revalidate === false
      ? { cache: "no-store" as const }
      : { next: { revalidate: options?.revalidate ?? 300 } }),
  });

  if (!response.ok) {
    throw new Error(`Shopify request failed with status ${response.status}.`);
  }

  const json = (await response.json()) as ShopifyResponse<TData>;

  if (json.errors?.length) {
    throw new Error(json.errors.map((error) => error.message).join(" | "));
  }

  if (!json.data) {
    throw new Error("Shopify returned an empty payload.");
  }

  return json.data;
}

function mapProduct(node: RawProductNode): StorefrontProduct {
  const firstVariant = node.variants.nodes[0] ?? null;

  return {
    id: node.id,
    title: node.title,
    handle: node.handle,
    description: node.description,
    tags: node.tags,
    featuredImage: node.featuredImage,
    price: node.priceRange.minVariantPrice,
    variantId: firstVariant?.id ?? null,
    availableForSale: Boolean(node.availableForSale && firstVariant?.availableForSale),
    variantTitle: firstVariant?.title ?? null,
  };
}

function mapCart(rawCart: RawCart): StorefrontCart {
  return {
    id: rawCart.id,
    checkoutUrl: rawCart.checkoutUrl,
    totalQuantity: rawCart.totalQuantity,
    cost: rawCart.cost,
    lines: rawCart.lines.nodes,
  };
}

function extractCartError(
  payload:
    | {
        userErrors?: Array<{ message: string }>;
        warnings?: Array<{ message: string }>;
      }
    | undefined,
  fallback: string,
) {
  const userErrorMessage = payload?.userErrors?.map((error) => error.message).join(" | ");

  if (userErrorMessage) {
    return userErrorMessage;
  }

  const warningMessage = payload?.warnings?.map((warning) => warning.message).join(" | ");

  if (warningMessage) {
    return warningMessage;
  }

  return fallback;
}

export function formatPrice(price: Money) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: price.currencyCode,
  }).format(Number(price.amount));
}

export function getStorefrontSetup() {
  return {
    configured: isConfigured(),
    storeDomain,
    apiVersion,
    tokenMode: storefrontPrivateToken ? "private" : storefrontPublicToken ? "public" : "missing",
  };
}

export async function getHomePageData(): Promise<HomePageData> {
  if (!isConfigured()) {
    return {
      mode: "demo",
      shop: {
        name: "TestBoutique Sport",
        description: "Mode demo. Branche tes variables Shopify pour charger les vraies collections et les vrais produits.",
        primaryDomainUrl: "https://misterping.myshopify.com",
      },
      collections: sampleCollections,
      products: sampleProducts,
    };
  }

  try {
    const data = await storefrontFetch<{
      shop: {
        name: string;
        description: string;
        primaryDomain: { url: string };
      };
      collections: {
        nodes: StorefrontCollection[];
      };
      products: {
        nodes: RawProductNode[];
      };
    }>(HOME_PAGE_QUERY);

    return {
      mode: "live",
      shop: {
        name: data.shop.name,
        description: data.shop.description,
        primaryDomainUrl: data.shop.primaryDomain.url,
      },
      collections: data.collections.nodes,
      products: data.products.nodes.map(mapProduct),
    };
  } catch (error) {
    return {
      mode: "demo",
      shop: {
        name: "TestBoutique Sport",
        description: "Mode demo. Le front reste visible meme si la connexion Shopify n'est pas encore finalisee.",
        primaryDomainUrl: "https://misterping.myshopify.com",
      },
      collections: sampleCollections,
      products: sampleProducts,
      error: error instanceof Error ? error.message : "Unknown Shopify error.",
    };
  }
}

export async function getProductPageData(handle: string): Promise<ProductPageData> {
  const fallbackProduct =
    sampleProducts.find((product) => product.handle === handle) ?? sampleProducts[0];

  if (!isConfigured()) {
    return {
      mode: "demo",
      shopName: "TestBoutique Sport",
      product: fallbackProduct,
    };
  }

  try {
    const data = await storefrontFetch<{
      shop: {
        name: string;
      };
      product: RawProductNode | null;
    }>(PRODUCT_PAGE_QUERY, { handle });

    if (!data.product) {
      return {
        mode: "demo",
        shopName: data.shop.name,
        product: fallbackProduct,
        error: `Product "${handle}" not found in Shopify.`,
      };
    }

    return {
      mode: "live",
      shopName: data.shop.name,
      product: mapProduct(data.product),
    };
  } catch (error) {
    return {
      mode: "demo",
      shopName: "TestBoutique Sport",
      product: fallbackProduct,
      error: error instanceof Error ? error.message : "Unknown Shopify error.",
    };
  }
}

export async function getCart(cartId: string): Promise<StorefrontCart | null> {
  const data = await storefrontFetch<{ cart: RawCart | null }>(
    CART_QUERY,
    { id: cartId },
    { revalidate: false },
  );

  return data.cart ? mapCart(data.cart) : null;
}

export async function createCart(
  lines?: Array<{ merchandiseId: string; quantity: number }>,
): Promise<StorefrontCart> {
  const data = await storefrontFetch<{
    cartCreate: {
      cart: RawCart | null;
      userErrors: Array<{ message: string }>;
      warnings: Array<{ message: string }>;
    };
  }>(
    CART_CREATE_MUTATION,
    {
      input: lines?.length ? { lines } : {},
    },
    { revalidate: false },
  );

  if (!data.cartCreate.cart) {
    throw new Error(extractCartError(data.cartCreate, "Unable to create Shopify cart."));
  }

  return mapCart(data.cartCreate.cart);
}

export async function addCartLines(
  cartId: string,
  lines: Array<{ merchandiseId: string; quantity: number }>,
): Promise<StorefrontCart> {
  const data = await storefrontFetch<{
    cartLinesAdd: {
      cart: RawCart | null;
      userErrors: Array<{ message: string }>;
      warnings: Array<{ message: string }>;
    };
  }>(
    CART_LINES_ADD_MUTATION,
    { cartId, lines },
    { revalidate: false },
  );

  if (!data.cartLinesAdd.cart) {
    throw new Error(extractCartError(data.cartLinesAdd, "Unable to add line to Shopify cart."));
  }

  return mapCart(data.cartLinesAdd.cart);
}

export async function updateCartLines(
  cartId: string,
  lines: Array<{ id: string; quantity: number }>,
): Promise<StorefrontCart> {
  const data = await storefrontFetch<{
    cartLinesUpdate: {
      cart: RawCart | null;
      userErrors: Array<{ message: string }>;
      warnings: Array<{ message: string }>;
    };
  }>(
    CART_LINES_UPDATE_MUTATION,
    { cartId, lines },
    { revalidate: false },
  );

  if (!data.cartLinesUpdate.cart) {
    throw new Error(extractCartError(data.cartLinesUpdate, "Unable to update Shopify cart line."));
  }

  return mapCart(data.cartLinesUpdate.cart);
}

export async function removeCartLines(
  cartId: string,
  lineIds: string[],
): Promise<StorefrontCart> {
  const data = await storefrontFetch<{
    cartLinesRemove: {
      cart: RawCart | null;
      userErrors: Array<{ message: string }>;
      warnings: Array<{ message: string }>;
    };
  }>(
    CART_LINES_REMOVE_MUTATION,
    { cartId, lineIds },
    { revalidate: false },
  );

  if (!data.cartLinesRemove.cart) {
    throw new Error(extractCartError(data.cartLinesRemove, "Unable to remove Shopify cart line."));
  }

  return mapCart(data.cartLinesRemove.cart);
}
