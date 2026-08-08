export interface ICartItem {
  id: number; // Product ID
  variant_id: number;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
}

export class CartService {
  private static CART_KEY = "closet_cart";

  public static getCart(): ICartItem[] {
    const data = localStorage.getItem(this.CART_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public static saveCart(cart: ICartItem[]): void {
    localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
    this.updateHeaderBadge();
  }

  public static addToCart(item: ICartItem): void {
    const cart = this.getCart();
    const existing = cart.find(x => x.id === item.id && x.variant_id === item.variant_id && x.size === item.size && x.color === item.color);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      cart.push(item);
    }
    this.saveCart(cart);
  }

  public static updateQuantity(index: number, quantity: number): void {
    const cart = this.getCart();
    if (cart[index]) {
      cart[index].quantity = quantity;
      if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
      }
      this.saveCart(cart);
    }
  }

  public static removeItem(index: number): void {
    const cart = this.getCart();
    cart.splice(index, 1);
    this.saveCart(cart);
  }

  public static clearCart(): void {
    localStorage.removeItem(this.CART_KEY);
    this.updateHeaderBadge();
  }

  public static getTotalPrice(): number {
    return this.getCart().reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
  }

  public static updateHeaderBadge(): void {
    const cart = this.getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badges = document.querySelectorAll('.fa-cart-shopping + span + span'); // target the badge in header
    badges.forEach(b => {
      b.textContent = count.toString();
      if (count === 0) {
        b.classList.add('hidden');
      } else {
        b.classList.remove('hidden');
      }
    });
  }
}
