import type { PaginationParams } from '@/services/common/interfaces/pagination-params.interface'

export interface GetProductParams extends PaginationParams {
  name?: string
  min_price?: number
  max_price?: number
  category_product_id?: number
  quality_product_id?: number
}
