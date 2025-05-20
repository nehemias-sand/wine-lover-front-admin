import { getAxiosAdapter } from '../common/axios.service'
import type { CreateProductImage } from './interfaces/product-image-request.interface'
import type { ProductImageResponse } from './interfaces/product-image-response.interface'

const axiosAdapter = getAxiosAdapter()

const toFormData = (data: CreateProductImage): FormData => {
  const formData = new FormData()

  formData.append('product_id', String(data.product_id))

  data.images.forEach((image, index) => {
    formData.append(`images[${index}]`, image)
  })

  return formData
}

export const create = async (createProductImageRequest: CreateProductImage) => {
  const formData = toFormData(createProductImageRequest)

  return await axiosAdapter.post<FormData, ProductImageResponse>(
    `/v1/admin/product/image`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
}

export const changeState = async (id: number) => {
  return await axiosAdapter.request<ProductImageResponse>(
    'patch',
    `/v1/admin/product/image/${id}/change-state`
  )
}

export const destroy = async (id: number) => {
  return await axiosAdapter.delete<ProductImageResponse>(`/v1/admin/product/image/${id}`)
}
