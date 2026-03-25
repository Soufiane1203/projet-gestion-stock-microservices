export interface Order {
  id?: number;
  productId: number;
  supplierId: number;
  quantity: number;
  status?: string;
}
