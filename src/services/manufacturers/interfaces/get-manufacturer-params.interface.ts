import type { PaginationParams } from '@/services/common/interfaces/pagination-params.interface'

export interface GetPresentationParams extends PaginationParams {
  name?: string
}
