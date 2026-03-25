import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Pages
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

// Components
import { ProductsComponent } from './components/products/products.component';
import { ProductDialogComponent } from './components/products/product-dialog/product-dialog.component';
import { SuppliersComponent } from './components/suppliers/suppliers.component';
import { SupplierDialogComponent } from './components/suppliers/supplier-dialog/supplier-dialog.component';
import { OrdersComponent } from './components/orders/orders.component';
import { OrderDialogComponent } from './components/orders/order-dialog/order-dialog.component';
import { SupplyRequestDialogComponent } from './components/orders/supply-request-dialog/supply-request-dialog.component';
import { StocksComponent } from './components/stocks/stocks.component';
import { StockDialogComponent } from './components/stocks/stock-dialog/stock-dialog.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { SupplierOrdersComponent } from './components/supplier-orders/supplier-orders.component';

// Shared
import { NavbarComponent } from './shared/navbar/navbar.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { RoleHeaderInterceptor } from './auth/role-header.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    ProductsComponent,
    ProductDialogComponent,
    SuppliersComponent,
    SupplierDialogComponent,
    OrdersComponent,
    OrderDialogComponent,
    SupplyRequestDialogComponent,
    StocksComponent,
    StockDialogComponent,
    NotificationsComponent,
    SupplierOrdersComponent,
    NavbarComponent,
    SidebarComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RoleHeaderInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
