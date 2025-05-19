import type { Presentation } from "@/services/presentations/interfaces/presentation-response.interface";
import type { Product } from "@/services/products/interfaces/product-response.interface";

export interface OrderResponse {
  data: Order
}

export interface Order {
    id: number;
    code: string;
    subtotal: number;
    total_discount: number;
    total: number;
    cashback_generated: number;
    address: Address;
    order_status: string;
    transaction_id: string;
    items: OrderItem[]
}

export interface OrderItem {
    product: Product,
    presentation: Presentation;
    amount: number;
    unit_price: number;
    discount: number;
    subtotal_item: number;
}

export interface Address {
    id: number;
    name: string;
    neighborhood: string;
    street: string;
    number: string;
    reference: string;
    district: string;
}
