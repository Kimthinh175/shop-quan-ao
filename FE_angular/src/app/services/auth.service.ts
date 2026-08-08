import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap, catchError, map, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = '/api/auth';

  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private checkAuth$: Observable<any> | null = null;

  constructor() {
    this.checkAuth().subscribe();
  }

  /**
   * Gọi API /api/auth/me kiểm tra phiên đăng nhập từ Cookie HttpOnly.
   * Tất cả Router Guards và Components sẽ chờ kết quả từ API này trước khi cho phép vào trang hay redirect.
   */
  checkAuth(forceRefresh: boolean = false): Observable<any> {
    if (!this.checkAuth$ || forceRefresh) {
      this.checkAuth$ = this.http.get<any>(`${this.apiUrl}/me`, { withCredentials: true }).pipe(
        map(res => res?.user || res?.customer || (res?._id ? res : null)),
        tap(user => this.currentUserSubject.next(user)),
        catchError(() => {
          this.currentUserSubject.next(null);
          return of(null);
        }),
        shareReplay(1)
      );
    }
    return this.checkAuth$;
  }

  login(phone: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/user/login`, { phone, password }).pipe(
      tap(() => {
        this.checkAuth(true).subscribe();
      })
    );
  }

  adminLogin(username: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/admin/login`, { username, password }).pipe(
      tap(() => {
        this.checkAuth(true).subscribe();
      })
    );
  }

  register(name: string, phone: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/user/register`, { name, phone, password }).pipe(
      tap(() => {
        this.checkAuth(true).subscribe();
      })
    );
  }

  googleLogin(idToken: string) {
    return this.http.post<any>(`${this.apiUrl}/google-login`, { idToken }).pipe(
      tap(() => {
        this.checkAuth(true).subscribe();
      })
    );
  }

  logout() {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        this.checkAuth$ = null;
      }),
      catchError(() => {
        this.currentUserSubject.next(null);
        this.checkAuth$ = null;
        return of(null);
      })
    );
  }

  isLoggedIn() {
    return !!this.currentUserSubject.value;
  }

  getUser() {
    return this.currentUserSubject.value;
  }
}
