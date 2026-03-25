import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { AdminGuard } from './auth/admin.guard';
import { SupplierGuard } from './auth/supplier.guard';

import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProductsComponent } from './components/products/products.component';
import { SuppliersComponent } from './components/suppliers/suppliers.component';
import { OrdersComponent } from './components/orders/orders.component';
import { StocksComponent } from './components/stocks/stocks.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { SupplierOrdersComponent } from './components/supplier-orders/supplier-orders.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'products', component: ProductsComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'suppliers', component: SuppliersComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'orders', component: OrdersComponent, canActivate: [AuthGuard] },
  { path: 'supplier-orders', component: SupplierOrdersComponent, canActivate: [AuthGuard, SupplierGuard] },
  { path: 'stocks', component: StocksComponent, canActivate: [AuthGuard] },
  { path: 'notifications', component: NotificationsComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
