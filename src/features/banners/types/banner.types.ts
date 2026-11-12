export type BannerLanguage = "ar" | "en";
export type BannerView = "desktop" | "mobile";
export type Banner = {
  _id: string;
  image: string;
  language: BannerLanguage;
  view: BannerView;
  title?: string;
  altText?: string;
  linkUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt: string;
  updatedAt: string;
};
export type BannerFilters = {
  page: number;
  limit: number;
  language?: BannerLanguage;
  view?: BannerView;
  isActive?: boolean;
};
export type BannerListResponse = {
  banners: Banner[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};
export type BannerPayload = {
  language: BannerLanguage;
  view: BannerView;
  title?: string;
  altText?: string;
  linkUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  imageFile?: File | null;
};
