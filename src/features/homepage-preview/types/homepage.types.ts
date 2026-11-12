export type HomepageProduct = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  images: string[];
  savings?: number;
  discountPercentage?: number;
  unitsSold?: number;
};
export type HomepageCategory = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
};
export type HomepageBanner = {
  _id: string;
  image: string;
  language: "ar" | "en";
  view: "desktop" | "mobile";
  title?: string;
  altText?: string;
  linkUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt?: string;
};
export type HomepageResponse = {
  language: "ar" | "en";
  view: "desktop" | "mobile";
  currency: string;
  currencyExponent: number;
  banners: HomepageBanner[];
  categories: HomepageCategory[];
  latestProducts: HomepageProduct[];
  bestOffers: HomepageProduct[];
  bestDeal: HomepageProduct | null;
  bestSellers: HomepageProduct[];
};
