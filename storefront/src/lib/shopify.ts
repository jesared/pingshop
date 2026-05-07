type Money = {
  amount: string;
  currencyCode: string;
};

type ShopifyImage = {
  url: string;
  altText: string | null;
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

const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const storefrontPrivateToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;
const storefrontPublicToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION ?? "2025-10";

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
  },
];

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
    }
  }
`;

type ShopifyResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

function isConfigured() {
  return Boolean(storeDomain && (storefrontPrivateToken || storefrontPublicToken));
}

async function storefrontFetch<TData>(
  query: string,
  variables?: Record<string, unknown>,
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
    next: { revalidate: 300 },
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

function mapProduct(node: {
  id: string;
  title: string;
  handle: string;
  description: string;
  tags: string[];
  featuredImage: ShopifyImage | null;
  priceRange: { minVariantPrice: Money };
}): StorefrontProduct {
  return {
    id: node.id,
    title: node.title,
    handle: node.handle,
    description: node.description,
    tags: node.tags,
    featuredImage: node.featuredImage,
    price: node.priceRange.minVariantPrice,
  };
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
        nodes: Array<{
          id: string;
          title: string;
          handle: string;
          description: string;
          tags: string[];
          featuredImage: ShopifyImage | null;
          priceRange: { minVariantPrice: Money };
        }>;
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
      product: {
        id: string;
        title: string;
        handle: string;
        description: string;
        tags: string[];
        featuredImage: ShopifyImage | null;
        priceRange: { minVariantPrice: Money };
      } | null;
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
