import type { User } from '@/services/auth/interfaces/login-response.interface'

export type RegisterAdmin = Omit<
  User,
  'id' | 'email_verified_at' | 'profile' | 'active' | 'token' | 'state' | 'permissions'
>

export type UpdateUser = Partial<RegisterAdmin>
