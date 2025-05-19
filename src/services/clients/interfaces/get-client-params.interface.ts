import type { PaginationParams } from '@/services/common/interfaces/pagination-params.interface'

export interface GetClientParams extends PaginationParams {
  identity_number?: string
  names?: string
}
