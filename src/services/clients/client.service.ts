import { getAxiosAdapter } from '../common/axios.service'
import type { ApiPaginatedResponse } from '../common/interfaces/api-paginated-response.interface'
import type { Client } from './interfaces/client-response.interface'
import type { GetClientParams } from './interfaces/get-client-params.interface'

const axiosAdapter = getAxiosAdapter()

export const getAll = async (params: GetClientParams) => {
  const config = {
    params
  }

  return await axiosAdapter.get<ApiPaginatedResponse<Client>>(
    `/v1/admin/client`,
    config
  )
}
