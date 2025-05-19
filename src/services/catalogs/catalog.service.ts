import { getAxiosAdapter } from '../common/axios.service'
import type { ProfileResponse } from './interfaces/catalogs-response.interface'

const axiosAdapter = getAxiosAdapter()

export const getProfiles = async () => {
  return await axiosAdapter.get<ProfileResponse>(`/v1/public/catalogs/profile`)
}
