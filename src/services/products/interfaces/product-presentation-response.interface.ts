import type { Presentation } from '@/services/presentations/interfaces/presentation-response.interface'
import type { Product } from './product-response.interface'

export interface ProductPresentationResponse {
  data: ProductPresentation
}

export interface ProductPresentation {
  product: Omit<
    Product,
    | 'description'
    | 'state'
    | 'category_product'
    | 'quality_product'
    | 'presentations'
    | 'images'
    | 'manufacturer'
  >,
  presentation: Presentation,
  stock: number;
  unit_price: number;
}
