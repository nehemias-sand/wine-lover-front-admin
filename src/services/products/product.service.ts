import { getAxiosAdapter } from '../common/axios.service'
import type { ApiPaginatedResponse } from '../common/interfaces/api-paginated-response.interface'
import type { GetProductParams } from './interfaces/get-product-params.interface'
import type { CreateProduct, UpdateProduct } from './interfaces/product-request.interface'
import type { Product, ProductResponse } from './interfaces/product-response.interface'

const axiosAdapter = getAxiosAdapter()

export const getAll = async (params: GetProductParams) => {
  const config = {
    params
  }

  return await axiosAdapter.get<ApiPaginatedResponse<Product>>(`/v1/public/product`, config)
}

const toFormData = (data: CreateProduct): FormData => {
  const formData = new FormData()

  formData.append('name', data.name)
  formData.append('description', data.description)
  formData.append('state', String(data.state))
  formData.append('category_product_id', String(data.category_product_id))
  formData.append('quality_product_id', String(data.quality_product_id))
  formData.append('manufacturer_id', String(data.manufacturer_id))

  data.presentations.forEach((presentation, index) => {
    formData.append(`presentations[${index}][id]`, String(presentation.id))
    formData.append(`presentations[${index}][stock]`, String(presentation.stock))
    formData.append(`presentations[${index}][unit_price]`, String(presentation.unit_price))
  })

  data.images.forEach((image, index) => {
    formData.append(`images[${index}]`, image)
  })

  return formData
}

export const create = async (createProductRequest: CreateProduct) => {
  const formData = toFormData(createProductRequest)

  return await axiosAdapter.post<FormData, ProductResponse>('/v1/admin/product', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const update = async (id: number, updateProduct: UpdateProduct) => {
  return await axiosAdapter.put<UpdateProduct, ProductResponse>(
    `/v1/admin/product/${id}`,
    updateProduct
  )
}

export const destroy = async (id: number) => {
  return await axiosAdapter.delete<ProductResponse>(`/v1/admin/product/${id}`)
}
