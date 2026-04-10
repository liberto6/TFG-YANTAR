export type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "PREPARING"
  | "READY"
  | "DELIVERED"
  | "CANCELLED";

export type DeliveryMode = "PICKUP" | "DELIVERY";

export interface OrderItemModifier {
  name: string;
  price: number;
}

export interface OrderItem {
  id: string;
  dishId: string;
  dishName: string;
  quantity: number;
  unitPrice: number;
  selectedVariant: string | null;
  selectedModifiers: OrderItemModifier[];
  notes: string | null;
  lineTotal: number;
}

export interface Order {
  id: string;
  companyId: string;
  branchId: string;
  customerId: string;
  status: OrderStatus;
  deliveryMode: DeliveryMode;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  notes: string | null;
  deliveryAddress: string | null;
  scheduledTime: string | null;
  rejectionReason: string | null;
  estimatedMinutes: number | null;
  paymentMethod: string | null;
  createdAt: string;
  confirmedAt: string | null;
  completedAt: string | null;
  updatedAt: string;
}
