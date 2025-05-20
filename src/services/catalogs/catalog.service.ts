import { getAxiosAdapter } from '../common/axios.service'
import type { CategoryProductResponse, OrderStatusResponse, ProfileResponse, QualityProductResponse } from './interfaces/catalogs-response.interface'

const axiosAdapter = getAxiosAdapter()

export const getProfiles = async () => {
  return await axiosAdapter.get<ProfileResponse>(`/v1/public/catalogs/profile`)
}

export const getOrderStatuses = async () => {
  return await axiosAdapter.get<OrderStatusResponse>(`/v1/public/catalogs/order-status`)
}

export const getCategoryProducts = async () => {
  return await axiosAdapter.get<CategoryProductResponse>(`/v1/public/catalogs/category-product`)
}

export const getQualityProducts = async () => {
  return await axiosAdapter.get<QualityProductResponse>(`/v1/public/catalogs/quality-product`)
}
