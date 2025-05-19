import { getAxiosAdapter } from '../common/axios.service'
import type { ApiPaginatedResponse } from '../common/interfaces/api-paginated-response.interface'
import type { GetCommentParams, GetReviewParams } from './interfaces/get-review-params.interface'
import type { CreateReview, UpdateReview } from './interfaces/review-request.interface'
import type {
  Comment,
  CommentResponse,
  Review,
  ReviewResponse
} from './interfaces/review-response.interface'

const axiosAdapter = getAxiosAdapter()

export const getAll = async (params: GetReviewParams) => {
  const config = {
    params
  }

  return await axiosAdapter.get<ApiPaginatedResponse<Review>>(`/v1/social/review`, config)
}

export const create = async (createReviewRequest: CreateReview) => {
  return await axiosAdapter.post<CreateReview, ReviewResponse>(
    `/v1/social/review`,
    createReviewRequest
  )
}

export const update = async (id: number, updateReview: UpdateReview) => {
  return await axiosAdapter.post<UpdateReview, ReviewResponse>(
    `/v1/social/review/${id}`,
    updateReview
  )
}

export const changeState = async (id: number) => {
  return await axiosAdapter.request<ReviewResponse>('patch', `/v1/social/review/${id}`)
}

export const destroy = async (id: number) => {
  return await axiosAdapter.delete<ReviewResponse>(`/v1/social/review/${id}`)
}

export const getComments = async (reviewId: number, params: GetCommentParams) => {
  const config = {
    params
  }

  return await axiosAdapter.get<ApiPaginatedResponse<Comment>>(
    `/v1/social/review/${reviewId}/comment`,
    config
  )
}

export const changeCommentState = async (id: number) => {
  return await axiosAdapter.request<CommentResponse>('patch', `/v1/social/review/comment/${id}`)
}
