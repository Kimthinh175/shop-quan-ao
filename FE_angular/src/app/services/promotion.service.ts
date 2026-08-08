import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

export interface ActivePromotion {
  _id: number;
  name: string;
  code: string;
  campaign_type: string;
  applicable_product_ids: number[];
  rewards: { reward_type: string; discount_percent?: number; discount_amount?: number }[];
  end_time: string;
  usage_limit: number;
  used_count: number;
}

@Injectable({ providedIn: 'root' })
export class PromotionService {
  private http = inject(HttpClient);
  private activePromos$ = new BehaviorSubject<ActivePromotion[]>([]);
  private loaded = false;

  /** Lấy danh sách promotion đang active (cache lại) */
  loadActivePromotions(): Observable<ActivePromotion[]> {
    if (this.loaded) return of(this.activePromos$.value);
    return this.http.get<any>('/api/promotions/active').pipe(
      map(res => res.data || res || []),
      tap(promos => {
        this.activePromos$.next(promos);
        this.loaded = true;
      }),
      catchError(() => of([]))
    );
  }

  get activePromotions(): ActivePromotion[] {
    return this.activePromos$.value;
  }

  /** Tính giá sau khuyến mãi cho 1 sản phẩm */
  applyPromotion(productId: number, originalPrice: number): {
    salePrice: number;
    originalPrice: number;
    discountPercent: number;
    discountAmount: number;
    promotion: ActivePromotion | null;
  } {
    const promos = this.activePromos$.value;
    // Tìm promotion áp dụng cho sản phẩm này (applicable_product_ids rỗng = áp dụng tất cả)
    const promo = promos.find(p =>
      p.campaign_type === 'DISCOUNT' &&
      (p.applicable_product_ids.length === 0 || p.applicable_product_ids.includes(productId))
    );

    if (!promo || !promo.rewards?.length) {
      return { salePrice: originalPrice, originalPrice, discountPercent: 0, discountAmount: 0, promotion: null };
    }

    const reward = promo.rewards[0];
    let salePrice = originalPrice;
    let discountPercent = 0;
    let discountAmount = 0;

    if (reward.reward_type === 'DISCOUNT_PERCENT' && reward.discount_percent) {
      discountPercent = reward.discount_percent;
      discountAmount = Math.round(originalPrice * discountPercent / 100);
      salePrice = originalPrice - discountAmount;
    } else if (reward.reward_type === 'DISCOUNT_AMOUNT' && reward.discount_amount) {
      discountAmount = reward.discount_amount;
      salePrice = Math.max(0, originalPrice - discountAmount);
      discountPercent = Math.round((discountAmount / originalPrice) * 100);
    }

    return { salePrice, originalPrice, discountPercent, discountAmount, promotion: promo };
  }

  /** Kiểm tra sản phẩm có đang trong flash sale không */
  isFlashSale(productId: number): boolean {
    return this.activePromos$.value.some(p =>
      p.campaign_type === 'DISCOUNT' &&
      (p.applicable_product_ids.length === 0 || p.applicable_product_ids.includes(productId))
    );
  }
}
