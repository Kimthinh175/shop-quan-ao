import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { adminGuard } from '../guards/admin.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.AdminLoginComponent)
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/orders/orders.component').then(m => m.AdminOrdersComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./pages/products/products.component').then(m => m.AdminProductsComponent)
      },
      {
        path: 'inventory',
        loadComponent: () => import('./pages/inventory/inventory.component').then(m => m.AdminInventoryComponent)
      },
      {
        path: 'pos',
        loadComponent: () => import('./pages/pos/pos.component').then(m => m.AdminPosComponent)
      },
      {
        path: 'posts',
        loadComponent: () => import('./pages/posts/posts.component').then(m => m.AdminPostsComponent)
      },
      {
        path: 'promotions',
        loadComponent: () => import('./pages/promotions/promotions.component').then(m => m.AdminPromotionsComponent)
      }
    ]
  }
];
