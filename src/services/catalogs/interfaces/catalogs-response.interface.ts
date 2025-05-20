export interface ProfileResponse {
  data: Profile[]
}

export interface OrderStatusResponse {
  data: OrderStatus[]
}

export interface CategoryProductResponse {
  data: CategoryProduct[]
}

export interface QualityProductResponse {
  data: QualityProduct[]
}

export interface Profile {
  id: number
  name: string
  description: string
}

export interface OrderStatus {
  id: number
  name: string
}

export interface CategoryProduct {
  id: number
  name: string
  description: string
}

export interface QualityProduct {
  id: number
  name: string
  description: string
}
