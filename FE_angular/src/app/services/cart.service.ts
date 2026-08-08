import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  id: string; // ProductVariant ID or Product ID + attributes
  product_id: string;
  variant_id?: string;
  name: string;
  price: number;
  original_price?: number;
  quantity: number;
  image: string;
  color?: string;
  size?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart = new BehaviorSubject<CartItem[]>(this.loadCart());
  
  cart$ = this.cart.asObservable();

  constructor() { }

  private loadCart(): CartItem[] {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  }

  private saveCart(items: CartItem[]) {
    localStorage.setItem('cart', JSON.stringify(items));
    this.cart.next(items);
  }

  addToCart(item: CartItem) {
    const items = this.cart.getValue();
    const existing = items.find(i => i.id === item.id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      items.push(item);
    }
    this.saveCart(items);
  }

  updateQuantity(id: string, qty: number) {
    const items = this.cart.getValue();
    const existing = items.find(i => i.id === id);
    if (existing) {
      existing.quantity = qty;
      if (existing.quantity <= 0) {
        this.removeFromCart(id);
        return;
      }
      this.saveCart(items);
    }
  }

  removeFromCart(id: string) {
    let items = this.cart.getValue();
    items = items.filter(i => i.id !== id);
    this.saveCart(items);
  }

  clearCart() {
    this.saveCart([]);
  }

  setBuyNowItem(item: CartItem) {
    sessionStorage.setItem('buy_now_item', JSON.stringify(item));
  }

  getBuyNowItem(): CartItem | null {
    const saved = sessionStorage.getItem('buy_now_item');
    return saved ? JSON.parse(saved) : null;
  }

  clearBuyNowItem() {
    sessionStorage.removeItem('buy_now_item');
  }

  getTotalCount(): number {
    return this.cart.getValue().reduce((acc, item) => acc + item.quantity, 0);
  }

  getTotalPrice(): number {
    return this.cart.getValue().reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }
}
