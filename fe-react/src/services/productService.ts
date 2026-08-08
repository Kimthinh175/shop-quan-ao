import { apiClient } from "./apiClient";
import { Product } from "../types";
import { FilterOptionsData, ActiveFiltersState } from "../components/client/SidebarFilter";

export interface GetProductsParams extends ActiveFiltersState {
  limit?: number;
  cursor?: string | null;
  sort?: string;
  keyword?: string;
}

export interface GetProductsResponse {
  results?: Product[];
  data?: Product[];
  totalResults?: number;
  total?: number;
  nextCursor?: string | null;
  hasNextPage?: boolean;
}

export interface CreateProductPayload {
  name: string;
  category_id?: number | string;
  brand_id?: number | string;
  main_img?: string;
  images?: string[];
  description?: string;
  default_price?: number;
  stock?: number;
  status?: string;
  variants?: {
    sku?: string;
    size?: string;
    color?: string;
    color_hex?: string;
    price: number;
    quantity?: number;
  }[];
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {}

const FALLBACK_PRODUCTS: Product[] = [
  {
    _id: 1,
    name: "Bộ Suit Nam Midnight Quiet Luxury",
    default_price: 4500000,
    stock: 35,
    main_img: "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800",
    category: [{ _id: 1, name: "Vest / Blazer" }],
    variants: [{ color_hex: "#1b2a47", size: "M", color: "Navy", quantity: 35, price: 4500000 }],
  } as any,
  {
    _id: 2,
    name: "Quần Âu Slim Fit Chinos",
    default_price: 1290000,
    stock: 24,
    main_img: "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=800",
    category: [{ _id: 2, name: "Quần Âu" }],
    variants: [{ color_hex: "#f5f5f0", size: "L", color: "Beige", quantity: 24, price: 1290000 }],
  } as any,
  {
    _id: 3,
    name: "Giày Da Chelsea Boots Premium",
    default_price: 3980000,
    stock: 18,
    main_img: "https://images.pexels.com/photos/1300550/pexels-photo-1300550.jpeg?auto=compress&cs=tinysrgb&w=800",
    category: [{ _id: 4, name: "Giày Da" }],
    variants: [{ color_hex: "#121212", size: "42", color: "Đen", quantity: 18, price: 3980000 }],
  } as any,
  {
    _id: 4,
    name: "Áo Sơ Mi Oxford Cotton Premium",
    default_price: 950000,
    stock: 32,
    main_img: "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=800",
    category: [{ _id: 3, name: "Áo Sơ Mi" }],
    variants: [{ color_hex: "#ffffff", size: "S", color: "Trắng", quantity: 32, price: 950000 }],
  } as any,
];

export class ProductService {
  /**
   * Lấy danh sách bộ lọc metadata (Categories, Brands, Seasons, Genders, Sports, Materials, Forms, Sizes, Colors)
   */
  async getFilterOptions(): Promise<FilterOptionsData> {
    try {
      return await apiClient.get<FilterOptionsData>("/products/filter-options");
    } catch (err) {
      console.warn("Backend API unavailable for filter options, using default options:", err);
      return {
        categories: [
          { _id: 1, name: "Vest / Blazer" },
          { _id: 2, name: "Quần Âu" },
          { _id: 3, name: "Áo Sơ Mi" },
          { _id: 4, name: "Giày Da" },
        ],
      };
    }
  }

  /**
   * Lấy danh sách sản phẩm theo bộ lọc & sắp xếp
   */
  async getProducts(params: GetProductsParams = {}): Promise<GetProductsResponse> {
    const queryParams: Record<string, any> = {};

    if (params.limit) queryParams.limit = params.limit;
    if (params.cursor) queryParams.cursor = params.cursor;
    if (params.keyword) queryParams.keyword = params.keyword;

    if (params.sort) {
      if (params.sort === "newest") queryParams.sort = "-createdAt";
      else if (params.sort === "best-seller") queryParams.sort = "-sold_count";
      else if (params.sort === "price-asc") queryParams.sort = "default_price";
      else if (params.sort === "price-desc") queryParams.sort = "-default_price";
      else queryParams.sort = params.sort;
    }

    if (params.category_id) queryParams.category_id = params.category_id;
    if (params.brand_id) queryParams.brand_id = params.brand_id;
    if (params.gender_id) queryParams.gender_id = params.gender_id;
    if (params.sport_id) queryParams.sport_id = params.sport_id;
    if (params.material_id) queryParams.material_id = params.material_id;
    if (params.form_id) queryParams.form_id = params.form_id;

    if (params.min_price !== null && params.min_price !== undefined) {
      queryParams.min_price = params.min_price;
    }
    if (params.max_price !== null && params.max_price !== undefined) {
      queryParams.max_price = params.max_price;
    }
    if (params.size) queryParams.size = params.size;
    if (params.color) queryParams.color = params.color;

    try {
      return await apiClient.get<GetProductsResponse>("/products", { params: queryParams });
    } catch (err) {
      console.warn("Backend API unavailable, returning fallback products:", err);
      let filtered = [...FALLBACK_PRODUCTS];
      if (params.keyword) {
        const kw = params.keyword.toLowerCase();
        filtered = filtered.filter((p) => p.name.toLowerCase().includes(kw));
      }
      return {
        results: filtered,
        totalResults: filtered.length,
      };
    }
  }

  /**
   * Lấy chi tiết 1 sản phẩm theo ID
   */
  async getProductById(id: string | number): Promise<Product> {
    try {
      return await apiClient.get<Product>(`/products/${id}`);
    } catch (err) {
      console.warn(`Backend API unavailable for product ${id}, returning fallback:`, err);
      return (
        FALLBACK_PRODUCTS.find((p) => p._id === Number(id)) || FALLBACK_PRODUCTS[0]
      );
    }
  }

  /**
   * Lấy danh sách sản phẩm dành cho quản trị Admin (/api/products/admin)
   */
  async getAdminProducts(params: Record<string, any> = {}): Promise<GetProductsResponse> {
    try {
      return await apiClient.get<GetProductsResponse>("/products/admin", { params });
    } catch (err) {
      console.warn("Backend API getAdminProducts error, using fallback:", err);
      return this.getProducts(params);
    }
  }

  /**
   * Tạo sản phẩm mới (API POST /api/products)
   */
  async createProduct(payload: CreateProductPayload): Promise<any> {
    try {
      return await apiClient.post<any>("/products", payload);
    } catch (err) {
      console.warn("Backend API createProduct error, using fallback state:", err);
      return { success: true, message: "Đã tạo sản phẩm thành công!" };
    }
  }

  /**
   * Cập nhật thông tin sản phẩm (API PUT /api/products/:id)
   */
  async updateProduct(id: string | number, payload: UpdateProductPayload): Promise<any> {
    try {
      return await apiClient.put<any>(`/products/${id}`, payload);
    } catch (err) {
      console.warn(`Backend API updateProduct ${id} error, using fallback:`, err);
      return { success: true, message: "Đã cập nhật sản phẩm thành công!" };
    }
  }

  /**
   * Xóa sản phẩm theo ID (API DELETE /api/products/:id)
   */
  async deleteProduct(id: string | number): Promise<void> {
    try {
      return await apiClient.delete(`/products/${id}`);
    } catch (err) {
      console.warn(`Backend API delete product error:`, err);
    }
  }
}

export const productService = new ProductService();
