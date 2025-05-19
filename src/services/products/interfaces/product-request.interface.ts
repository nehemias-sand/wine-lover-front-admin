export interface PresentationInput {
  id: number;
  stock: number;
  unit_price: number;
}

export interface CreateProduct {
  name: string;
  description: string;
  state: boolean;
  presentations: PresentationInput[];
  images: File[];
  category_product_id: number;
  quality_product_id: number;
  manufacturer_id: number;
}

export type UpdateProduct = Partial<Omit<
  CreateProduct,
  'presentations' | 'images'
>>