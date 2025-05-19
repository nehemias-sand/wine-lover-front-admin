import type { PaginationParams } from '@/services/common/interfaces/pagination-params.interface'

export interface GetUserParams extends PaginationParams {
  email?: string
}
