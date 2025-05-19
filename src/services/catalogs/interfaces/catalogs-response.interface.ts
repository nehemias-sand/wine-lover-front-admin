export interface ProfileResponse {
  data: Profile[]
}

export interface Profile {
  id: number
  name: string
  description: string
}
