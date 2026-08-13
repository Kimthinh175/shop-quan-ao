import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { CartService, CartItem } from '../../services/cart.service';
import { PromotionService } from '../../services/promotion.service';
import { AuthService } from '../../services/auth.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, FormsModule, ProductCardComponent],
  templateUrl: './product-detail.component.html'
})
export class ProductDetailComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private cartService = inject(CartService);
  private promoService = inject(PromotionService);
  private auth = inject(AuthService);
  private router = inject(Router);

  product: any = null;
  relatedProducts: any[] = [];
  loading = true;

  colors: string[] = [];
  sizes: string[] = [];
  allImages: string[] = [];
  
  selectedColor = '';
  selectedSize = '';
  currentImageIndex = 0;
  quantity = 1;
  openAccordion = 'desc';
  showSizeGuide = false;
  isFavorite = false;

  promoInfo: any = null;

  get basePrice(): number {
    if (!this.product) return 0;
    return this.product.default_price > 0 ? this.product.default_price : (this.product.variants?.[0]?.price || 0);
  }

  get currentPrice(): number {
    if (!this.product) return 0;
    const base = this.basePrice;
    // Apply promotion discount
    if (this.promoInfo && this.promoInfo.promotion) {
      return this.promoInfo.salePrice;
    }
    if (this.selectedColor && this.selectedSize && this.product.variants) {
      const v = this.product.variants.find((v: any) => v.color === this.selectedColor && v.size === this.selectedSize);
      if (v) return v.price;
    }
    return base;
  }

  get originalPrice(): number {
    if (!this.product) return 0;
    return this.basePrice;
  }

  getColorHex(color: string): string {
    if (!color) return "#d1d5db";
    const trimmed = color.trim().toLowerCase();
    const map: Record<string, string> = {
      black: "#111111", "đen": "#111111",
      white: "#ffffff", "trắng": "#ffffff",
      navy: "#1e3a5f", "xanh navy": "#1e3a5f",
      grey: "#9ca3af", "xám": "#9ca3af",
      red: "#ef4444", "đỏ": "#ef4444",
      blue: "#3b82f6", "xanh dương": "#3b82f6",
      green: "#22c55e", "xanh lá": "#22c55e",
      brown: "#92400e", "nâu": "#92400e",
      camel: "#c4903a", be: "#e8d5b0",
      pink: "#ec4899", "hồng": "#ec4899",
      orange: "#f97316", "cam": "#f97316",
      yellow: "#eab308", "vàng": "#eab308",
      purple: "#a855f7", "tím": "#a855f7"
    };
    return map[trimmed] || (color.startsWith('#') ? color : "#d1d5db");
  }

  selectColor(color: string) {
    this.selectedColor = color;
  }

  selectSize(size: string) {
    this.selectedSize = size;
  }

  prevImage() {
    if (this.allImages.length <= 1) return;
    this.currentImageIndex = (this.currentImageIndex - 1 + this.allImages.length) % this.allImages.length;
  }

  nextImage() {
    if (this.allImages.length <= 1) return;
    this.currentImageIndex = (this.currentImageIndex + 1) % this.allImages.length;
  }

  private touchStartX = 0;

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
  }

  onTouchEnd(event: TouchEvent) {
    const touchEndX = event.changedTouches[0].clientX;
    const diff = touchEndX - this.touchStartX;
    if (Math.abs(diff) > 35) {
      if (diff < 0) {
        this.nextImage();
      } else {
        this.prevImage();
      }
    }
  }

  toggleAccordion(key: string) {
    this.openAccordion = this.openAccordion === key ? '' : key;
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.fetchProductDetail(id);
      }
    });
  }

  fetchProductDetail(id: string) {
    this.loading = true;
    this.currentImageIndex = 0;
    this.api.getProductById(id).subscribe({
      next: (res: any) => {
        this.product = res;
        this.buildImageList();
        this.extractVariants(this.product.variants || []);
        this.fetchRelatedProducts();
        this.fetchProductReviews(id);
        // Apply promotion
        this.promoService.loadActivePromotions().subscribe(() => {
          const base = this.product.default_price > 0 ? this.product.default_price : (this.product.variants?.[0]?.price || 0);
          this.promoInfo = this.promoService.applyPromotion(this.product._id, base);
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi tải chi tiết sản phẩm:', err);
        this.loading = false;
      }
    });
  }

  reviews: any[] = [];
  
  fetchProductReviews(id: string) {
    this.api.getProductReviews(id).subscribe({
      next: (res: any) => {
        this.reviews = res.results || res.data?.results || res.docs || res.data?.docs || res.data || res.reviews || [];
      },
      error: (err) => console.error('Lỗi tải đánh giá sản phẩm:', err)
    });
  }

  fetchRelatedProducts() {
    this.api.getProducts({ page: 1, limit: 6 }).subscribe({
      next: (res: any) => {
        const list = res.results || res.data || [];
        this.relatedProducts = list.filter((p: any) => p._id !== this.product?._id);
      },
      error: (err) => console.error('Lỗi tải sản phẩm tương tự:', err)
    });
  }

  buildImageList() {
    this.allImages = [];
    if (this.product.main_img) this.allImages.push(this.product.main_img);
    if (this.product.images?.length > 0) {
      this.product.images.forEach((img: string) => {
        if (img && img !== this.product.main_img && !this.allImages.includes(img)) {
          this.allImages.push(img);
        }
      });
    }
    if (this.allImages.length === 0) {
      this.allImages.push('https://via.placeholder.com/600x800?text=No+Image');
    }
  }

  extractVariants(variants: any[]) {
    const colorSet = new Set<string>();
    const sizeSet = new Set<string>();

    variants.forEach(v => {
      if (v.color) colorSet.add(v.color);
      if (v.size) sizeSet.add(v.size);
    });

    this.colors = Array.from(colorSet);
    this.sizes = Array.from(sizeSet);
    
    if (this.colors.length > 0) this.selectedColor = this.colors[0];
    if (this.sizes.length > 0) this.selectedSize = this.sizes[0];
  }

  addToCart() {
    if (!this.product) return;
    
    if (this.colors.length > 0 && !this.selectedColor) return alert('Vui lòng chọn màu sắc');
    if (this.sizes.length > 0 && !this.selectedSize) return alert('Vui lòng chọn kích cỡ');

    let variantId = this.product._id; 
    if (this.product.variants?.length > 0) {
      const v = this.product.variants.find((v: any) => v.color === this.selectedColor && v.size === this.selectedSize);
      if (v) variantId = v._id;
    }

    const item: CartItem = {
      id: `${this.product._id}-${this.selectedColor}-${this.selectedSize}`,
      product_id: this.product._id,
      variant_id: variantId,
      name: this.product.name,
      price: this.currentPrice,
      original_price: this.originalPrice,
      quantity: this.quantity,
      image: this.product.main_img,
      color: this.selectedColor,
      size: this.selectedSize
    };

    this.cartService.addToCart(item);
    alert(`Đã thêm ${this.quantity} sản phẩm vào giỏ hàng 🛒`);
  }

  buyNow() {
    if (!this.product) return;
    
    if (this.colors.length > 0 && !this.selectedColor) return alert('Vui lòng chọn màu sắc');
    if (this.sizes.length > 0 && !this.selectedSize) return alert('Vui lòng chọn kích cỡ');

    let variantId = this.product._id; 
    if (this.product.variants?.length > 0) {
      const v = this.product.variants.find((v: any) => v.color === this.selectedColor && v.size === this.selectedSize);
      if (v) variantId = v._id;
    }

    const item: CartItem = {
      id: `${this.product._id}-${this.selectedColor}-${this.selectedSize}`,
      product_id: this.product._id,
      variant_id: variantId,
      name: this.product.name,
      price: this.currentPrice,
      original_price: this.originalPrice,
      quantity: this.quantity,
      image: this.product.main_img,
      color: this.selectedColor,
      size: this.selectedSize
    };

    this.cartService.setBuyNowItem(item);
    if (!this.auth.isLoggedIn()) {
      localStorage.setItem('returnUrl', '/checkout');
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/checkout']);
  }

  goBack() {
    window.history.back();
  }
}
