import type { PaginationParams } from '@/services/common/interfaces/pagination-params.interface'

export interface GetReviewParams extends PaginationParams {
  comments_available?: boolean
}

export interface GetCommentParams extends PaginationParams {}
