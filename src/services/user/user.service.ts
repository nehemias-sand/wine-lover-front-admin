import { getAxiosAdapter } from '../common/axios.service'
import { type User } from '../auth/interfaces/login-response.interface'
import type { RegisterAdmin, UpdateUser } from './interfaces/users-request.interface'
import type { GetUsersParams } from './interfaces/get-users-params.interface'
import type { ChangeEstadoResponse } from './interfaces/change-estado-response.interface'
import type { ApiPaginatedResponse } from '../common/interfaces/api-paginated-response.interface'
import type { RegisterAdminResponse, UpdateUserResponse } from './interfaces/users-response.interface'

const axiosAdapter = getAxiosAdapter()

export const getAll = async (params: GetUsersParams) => {
  const config = {
    params
  }

  return await axiosAdapter.get<ApiPaginatedResponse<User>>(`/v1/admin/user`, config)
}

export const registerAdmin = async (
  registerAdminRequest: RegisterAdmin
) => {
  return await axiosAdapter.post<RegisterAdmin, RegisterAdminResponse>(`/v1/admin/user/register`, registerAdminRequest)
}

export const update = async (id: number, updateUser: UpdateUser) => {
  return await axiosAdapter.put<UpdateUser, UpdateUserResponse>(`/v1/admin/user/${id}`, updateUser)
}

export const changeEstado = async (id: number) => {
  return await axiosAdapter.put<{}, ChangeEstadoResponse>(`/v1/admin/user/change-estado/${id}`)
}
