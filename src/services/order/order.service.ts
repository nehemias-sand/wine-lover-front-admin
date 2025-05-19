import { getAxiosAdapter } from '../common/axios.service'
import type { ApiPaginatedResponse } from '../common/interfaces/api-paginated-response.interface'
import type { GetOrderParams } from './interfaces/get-order-params.interface'
import type { UpdateOrderStatus } from './interfaces/order-request.interface'
import type { Order, OrderResponse } from './interfaces/order-response.interface'

const axiosAdapter = getAxiosAdapter()

export const getAll = async (params: GetOrderParams) => {
  const config = {
    params
  }

  return await axiosAdapter.get<ApiPaginatedResponse<Order>>(
    `/v1/admin/order`,
    config
  )
}

export const updateOrderStatus = async (id: number, updateOrderStatus: UpdateOrderStatus) => {
  return await axiosAdapter.put<UpdateOrderStatus, OrderResponse>(
    `/v1/admin/order/${id}`,
    updateOrderStatus
  )
}
