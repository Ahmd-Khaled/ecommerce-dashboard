
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: string | { _id: string; name: string };
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  totalProductCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryPayload {
  name: string;
  slug: string;
  description?: string;
  parent?: string | null;
  isActive: boolean;
  sortOrder: number;
  imageFile?: File | null;
}

export interface CategoryFilters {
  search?: string;
  status: "all" | "active" | "inactive";
  parent: "all" | "root" | string;
  sortBy: "name" | "sortOrder" | "createdAt";
  sortOrder: "asc" | "desc";
}

export interface CategoryApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
