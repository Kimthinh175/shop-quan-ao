import { IProduct } from "./IProduct";

export class ProductModel {
  // Trạng thái lưu trữ dữ liệu sản phẩm trong bộ nhớ của Model
  private products: IProduct[] = [];

  // Lưu danh sách sản phẩm vào Model
  setProducts(data: IProduct[]): void {
    this.products = data;
  }

  // Lấy danh sách sản phẩm từ Model
  getProducts(): IProduct[] {
    return this.products;
  }

  // Tìm kiếm một sản phẩm theo ID trong Model
  getProductById(id: number): IProduct | undefined {
    return this.products.find((product) => product.id === id);
  }
}
