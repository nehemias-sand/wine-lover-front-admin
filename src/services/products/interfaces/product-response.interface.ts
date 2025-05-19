import type { Manufacturer } from '@/services/manufacturers/interfaces/manufacturer-response.interface'
import type { Presentation } from '@/services/presentations/interfaces/presentation-response.interface'

export interface ProductResponse {
  data: Product
}

export interface Product {
  id: number
  name: string
  description: string
  state: boolean
  category_product: CategoryProduct
  quality_product: QualityProduct
  presentations: Presentation[]
  images: ProductImage[]
  manufacturer: Manufacturer
}

export interface CategoryProduct {
  id: number
  name: string
  description: string
}

export interface QualityProduct {
  id: number
  name: string
  description: string
}

export interface ProductImage {
  id: number;
  url_image: string;
  state: boolean;
}
