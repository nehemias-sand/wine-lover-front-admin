export interface HttpAdapter<TConfig> {
  get<TResponse>(url: string, config?: TConfig): Promise<TResponse>

  post<TRequest, TResponse>(
    url: string,
    data?: TRequest,
    config?: TConfig
  ): Promise<TResponse>

  put<TRequest, TResponse>(
    url: string,
    data?: TRequest,
    config?: TConfig
  ): Promise<TResponse>

  delete<TResponse>(url: string, config?: TConfig): Promise<TResponse>

  request<TRequest, TResponse>(
    method: string,
    url: string,
    data?: TRequest,
    config?: TConfig
  ): Promise<TResponse>

  setHeaders(headers: Record<string, string>): Promise<void>
}
