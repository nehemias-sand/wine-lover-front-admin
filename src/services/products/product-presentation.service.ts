import { getAxiosAdapter } from '../common/axios.service'
import type { CreateProductPresentation, UpdateProductPresentation } from './interfaces/product-presentation-request.interface'
import type { ProductPresentationResponse } from './interfaces/product-presentation-response.interface'

const axiosAdapter = getAxiosAdapter()

export const create = async (createProductPresentationRequest: CreateProductPresentation) => {
  return await axiosAdapter.post<CreateProductPresentation, ProductPresentationResponse>(
    `/v1/admin/product/presentation`,
    createProductPresentationRequest
  )
}

export const update = async (
  productId: number,
  presentationId: number,
  updateProductPresentation: UpdateProductPresentation
) => {
  return await axiosAdapter.put<UpdateProductPresentation, ProductPresentationResponse>(
    `/v1/admin/product/${productId}/presentation/${presentationId}`,
    updateProductPresentation
  )
}

export const destroy = async (productId: number, presentationId: number) => {
  return await axiosAdapter.delete<ProductPresentationResponse>(
    `/v1/admin/product/${productId}/presentation/${presentationId}`
  )
}
