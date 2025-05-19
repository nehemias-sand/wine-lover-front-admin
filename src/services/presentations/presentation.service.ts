import { getAxiosAdapter } from '../common/axios.service'
import type { ApiPaginatedResponse } from '../common/interfaces/api-paginated-response.interface'
import type { GetPresentationParams } from '../manufacturers/interfaces/get-manufacturer-params.interface'
import type { CreatePresentation, UpdatePresentation } from './interfaces/presentation-request.interface'
import type { Presentation, PresentationResponse } from './interfaces/presentation-response.interface'

const axiosAdapter = getAxiosAdapter()

export const getAll = async (params: GetPresentationParams) => {
  const config = {
    params
  }

  return await axiosAdapter.get<ApiPaginatedResponse<Presentation>>(
    `/v1/public/presentation`,
    config
  )
}

export const create = async (createPresentationRequest: CreatePresentation) => {
  return await axiosAdapter.post<CreatePresentation, PresentationResponse>(
    `/v1/admin/presentation`,
    createPresentationRequest
  )
}

export const update = async (id: number, updateManufacturer: UpdatePresentation) => {
  return await axiosAdapter.put<UpdatePresentation, PresentationResponse>(
    `/v1/admin/presentation/${id}`,
    updateManufacturer
  )
}

export const destroy = async (id: number) => {
  return await axiosAdapter.delete<PresentationResponse>(`/v1/admin/presentation/${id}`)
}
