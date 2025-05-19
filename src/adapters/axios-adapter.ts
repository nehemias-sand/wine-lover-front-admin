import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'

import type { HttpAdapter } from './interfaces/http-adapter.interface'
import { useAuthStore } from '@/stores/auth.store'

export class AxiosAdapter implements HttpAdapter<AxiosRequestConfig> {
  private axios: AxiosInstance

  constructor() {
    this.axios = axios.create({
      baseURL: import.meta.env.VITE_VUE_APP_API_URL || 'http://127.0.0.1:8000/api',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      timeout: 10000
    })

    this.axios.interceptors.request.use((config) => {
      const authStore = useAuthStore()
      if (authStore.token) {
        config.headers.Authorization = `Bearer ${authStore.token}`
      }

      return config
    })
  }

  async get<TResponse>(url: string, config?: AxiosRequestConfig): Promise<TResponse> {
    return this.handleRequest<TResponse>(this.axios.get<TResponse>(url, config))
  }

  async post<TRequest, TResponse>(
    url: string,
    data?: TRequest,
    config?: AxiosRequestConfig
  ): Promise<TResponse> {
    return this.handleRequest<TResponse>(this.axios.post<TResponse>(url, data, config))
  }

  async put<TRequest, TResponse>(
    url: string,
    data?: TRequest,
    config?: AxiosRequestConfig
  ): Promise<TResponse> {
    return this.handleRequest<TResponse>(this.axios.put<TResponse>(url, data, config))
  }

  async delete<TResponse>(url: string, config?: AxiosRequestConfig): Promise<TResponse> {
    return this.handleRequest<TResponse>(this.axios.delete<TResponse>(url, config))
  }

  async request<TResponse>(
    method: string,
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<TResponse> {
    return this.handleRequest<TResponse>(
      this.axios.request<TResponse>({ method, url, data, ...config })
    )
  }

  async setHeaders(headers: Record<string, string>): Promise<void> {
    this.axios.defaults.headers = {
      ...this.axios.defaults.headers,
      ...headers
    }
  }

  private async handleRequest<TResponse>(
    request: Promise<AxiosResponse<TResponse>>
  ): Promise<TResponse> {
    try {
      const { data } = await request
      return data
    } catch (error) {
      this.handleError(error)
      throw new Error('Error en la solicitud HTTP.')
    }
  }

  private handleError(error: any): void {
    if (error.response) {
      throw error
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor', error.request)
    } else {
      console.error('Error al configurar la solicitud', error.message)
    }

    console.error('Configuración completa del error:', JSON.stringify(error.config))
  }
}
