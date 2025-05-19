import { getAxiosAdapter } from '../common/axios.service'
import type { ChangePasswordRequest } from './interfaces/change-password-request.interface'
import type { LoginRequest } from './interfaces/login-request.interface'
import { type LoginResponse, type User } from './interfaces/login-response.interface'

const axiosAdapter = getAxiosAdapter()

export const login = async (loginRequest: LoginRequest) => {
  return await axiosAdapter.post<LoginRequest, LoginResponse>(`/v1/auth/login`, loginRequest)
}

export const changePassword = async (changePasswordRequest: ChangePasswordRequest) => {
  return await axiosAdapter.post<ChangePasswordRequest, User>(`/v1/user/change-password`, changePasswordRequest)
}
