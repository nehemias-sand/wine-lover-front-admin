export interface CreateProductPresentation {
    product_id: number;
    presentation_id: number;
    stock: number;
    unit_price: number;
}

export type UpdateProductPresentation = Partial<CreateProductPresentation>
