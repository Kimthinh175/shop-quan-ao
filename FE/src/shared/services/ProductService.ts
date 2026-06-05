import { IProduct } from "../models/IProduct";

export class ProductService {
  private apiUrl: string =
    import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  // Dữ liệu Mock để test giao diện khi không có BE
  private mockProducts: IProduct[] = [
    {
      id: 1,
      name: "Classic Midnight Suit",
      price: 12500000,
      image:
        "https://images.unsplash.com/photo-1594932224011-042041c62fed?w=800",
      category: "Suits",
      isNew: true,
    },
    {
      id: 2,
      name: "Cashmere Overcoat Beige",
      price: 8900000,
      image:
        "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800",
      category: "Outerwear",
      isNew: true,
    },
    {
      id: 3,
      name: "Silk Evening Dress",
      price: 15600000,
      image:
        "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800",
      category: "Dresses",
      isNew: false,
    },
    {
      id: 4,
      name: "Leather Chelsea Boots",
      price: 4500000,
      image:
        "https://images.unsplash.com/photo-1638247025967-b4e38f687b76?w=800",
      category: "Footwear",
      isNew: false,
    },
    {
      id: 5,
      name: "Pure Cotton Minimal Tee",
      price: 850000,
      image:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
      category: "Basics",
      isNew: false,
    },
    {
      id: 6,
      name: "Tailored Linen Trousers",
      price: 2200000,
      image:
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800",
      category: "Trousers",
      isNew: true,
    },
  ];

  async fetchProducts(page: number = 1, limit: number = 12): Promise<any> {
    try {
      const response = await fetch(
        `${this.apiUrl}/products?page=${page}&limit=${limit}`,
      );
      if (!response.ok) return { data: this.mockProducts, pagination: {} };

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Lỗi fetchProducts:", error);
      return this.mockProducts;
    }
  }

  async fetchProductById(id: number): Promise<IProduct | null> {
    try {
      const response = await fetch(`${this.apiUrl}/products/${id}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error("Lỗi fetchProductById:", error);
      return null;
    }
  }
}
