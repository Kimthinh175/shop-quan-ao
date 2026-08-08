import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const adminGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.checkAuth().pipe(
    map(user => {
      if (user && (user.role === 'admin' || user.role == 0 || user.is_admin == 1)) {
        return true;
      } else {
        return router.createUrlTree(['/admin/login'], { queryParams: { returnUrl: state.url } });
      }
    })
  );
};
