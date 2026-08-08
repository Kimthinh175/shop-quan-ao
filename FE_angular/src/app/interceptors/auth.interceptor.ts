import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Pure Cookie Authentication: Tự động đính kèm withCredentials để gửi và nhận Cookie HttpOnly
  const authReq = req.clone({
    withCredentials: true
  });
  
  return next(authReq);
};
