import type { PaginationParams } from '@/services/common/interfaces/pagination-params.interface'

export interface GetOrderParams extends PaginationParams {
  order_status_id?: number
}
