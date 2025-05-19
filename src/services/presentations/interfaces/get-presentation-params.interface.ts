import type { PaginationParams } from '@/services/common/interfaces/pagination-params.interface'

export interface GetManufacturerParams extends PaginationParams {
  name?: string
}
