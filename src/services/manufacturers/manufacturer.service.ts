import { getAxiosAdapter } from '../common/axios.service'
import type { ApiPaginatedResponse } from '../common/interfaces/api-paginated-response.interface'
import type { GetPresentationParams } from './interfaces/get-manufacturer-params.interface'
import type {
  CreateManufacturer,
  UpdateManufacturer
} from './interfaces/manufacturer-request.interface'
import type {
  Manufacturer,
  ManufacturerResponse
} from './interfaces/manufacturer-response.interface'

const axiosAdapter = getAxiosAdapter()

export const getAll = async (params: GetPresentationParams) => {
  const config = {
    params
  }

  return await axiosAdapter.get<ApiPaginatedResponse<Manufacturer>>(
    `/v1/admin/product/manufacturer`,
    config
  )
}

export const create = async (createManufacturerRequest: CreateManufacturer) => {
  return await axiosAdapter.post<CreateManufacturer, ManufacturerResponse>(
    `/v1/admin/product/manufacturer`,
    createManufacturerRequest
  )
}

export const update = async (id: number, updateManufacturer: UpdateManufacturer) => {
  return await axiosAdapter.put<UpdateManufacturer, ManufacturerResponse>(
    `/v1/admin/product/manufacturer/${id}`,
    updateManufacturer
  )
}

export const destroy = async (id: number) => {
  return await axiosAdapter.delete<ManufacturerResponse>(`/v1/admin/product/manufacturer/${id}`)
}
