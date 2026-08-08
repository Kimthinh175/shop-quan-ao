import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  
  getHomeData(): Observable<any> {
    return this.http.get('/api/home');
  }

  getProducts(params?: any): Observable<any> {
    return this.http.get('/api/products', { params });
  }

  getProductById(id: string): Observable<any> {
    return this.http.get(`/api/products/${id}`);
  }

  getCategories(): Observable<any> {
    return this.http.get('/api/categories');
  }

  getFilterOptions(): Observable<any> {
    return this.http.get('/api/products/filter-options');
  }

  createOrder(payload: any): Observable<any> {
    return this.http.post('/api/orders', payload);
  }

  getMyOrders(): Observable<any> {
    return this.http.get('/api/orders/my-orders');
  }

  // --- Reviews ---
  createReview(payload: any): Observable<any> {
    return this.http.post('/api/reviews', payload);
  }

  getProductReviews(productId: string | number): Observable<any> {
    return this.http.get(`/api/reviews/product/${productId}`);
  }

  getMyReviews(): Observable<any> {
    return this.http.get('/api/reviews/me');
  }

  // --- Upload ---
  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post('/api/upload', formData);
  }
}
