
export type ProductSortBy = "createdAt" | "price" | "name";
export type SortOrder = "asc" | "desc";

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  images: string[];
  category:
  | string
  | {
    _id: string;
    name: string;
  };
  isActive: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ProductListResponse {
  products: Product[];
  pagination: ProductPagination;
}

export interface ProductFilters {
  page: number;
  limit: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: ProductSortBy;
  sortOrder?: SortOrder;
}

export interface CreateProductPayload {
  name: string;
  slug: string;
  description: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  images: string[];
  category: string;
}

export interface UpdateProductPayload
  extends Omit<Partial<CreateProductPayload>, "compareAtPrice"> {
  compareAtPrice?: number | null;
  isActive?: boolean;
}
