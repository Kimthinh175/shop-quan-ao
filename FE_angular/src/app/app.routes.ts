import { Routes } from '@angular/router';
import { ClientLayoutComponent } from './layouts/client-layout/client-layout.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: '',
    component: ClientLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'catalog',
        loadComponent: () => import('./pages/catalog/catalog.component').then(m => m.CatalogComponent)
      },
      {
        path: 'product/:id',
        loadComponent: () => import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
      },
      {
        path: 'cart',
        loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent)
      },
      {
        path: 'checkout',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent)
      },
      {
        path: 'order-complete',
        loadComponent: () => import('./pages/order-complete/order-complete.component').then(m => m.OrderCompleteComponent)
      },
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'profile/addresses',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/profile/addresses/addresses.component').then(m => m.AddressesComponent)
      },
      {
        path: 'blog',
        loadComponent: () => import('./pages/blog/blog.component').then(m => m.BlogComponent)
      },
      {
        path: 'post/:id',
        loadComponent: () => import('./pages/post-detail/post-detail.component').then(m => m.PostDetailComponent)
      },
      {
        path: 'lookbook',
        loadComponent: () => import('./pages/lookbook/lookbook.component').then(m => m.LookbookComponent)
      },
      {
        path: 'brand',
        loadComponent: () => import('./pages/brand/brand.component').then(m => m.BrandComponent)
      },
      {
        path: 'orders',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/order-history/order-history.component').then(m => m.OrderHistoryComponent)
      }
    ]
  }
];
