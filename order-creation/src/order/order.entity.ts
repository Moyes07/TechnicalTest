export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface OrderItem {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  studentId: string;
  parentId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}