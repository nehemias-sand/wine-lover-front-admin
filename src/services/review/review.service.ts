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

const toFormData = (data: CreateReview | UpdateReview): FormData => {
  const formData = new FormData()

  formData.append('title', String(data.title))
  formData.append('content', String(data.content))
  formData.append('cover_image', data.cover_image)

  return formData
}

export const create = async (createReviewRequest: CreateReview) => {
  const formData = toFormData(createReviewRequest)

  return await axiosAdapter.post<FormData, ReviewResponse>(`/v1/social/review`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const update = async (id: number, updateReviewRequest: UpdateReview) => {
  const formData = toFormData(updateReviewRequest)

  return await axiosAdapter.post<FormData, ReviewResponse>(`/v1/social/review/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
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
