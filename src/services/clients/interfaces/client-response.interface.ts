import type { Order } from "@/services/order/interfaces/order-response.interface";

export interface ClientResponse {
    data: Client;
}

export interface Client {
    id: number,
    names: string;
    surnames: string;
    identity_number: string;
    birthday_date: string;
    phone: string;
    membership: string;
    current_cashback: string;
    orders: Order[],
    cashback_history: Cashback[]
}

export interface Cashback{
    id: number;
    amount: string;
    transaction_code: string;
    type: string;
    created_at: string;
}
