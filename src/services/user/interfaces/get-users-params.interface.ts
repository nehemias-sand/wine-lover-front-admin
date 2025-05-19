import type { PaginationParams } from '@/services/common/interfaces/pagination-params.interface'

export interface GetUsersParams extends PaginationParams {
  email?: string
}
