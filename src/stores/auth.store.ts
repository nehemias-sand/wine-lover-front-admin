import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'
import { DateTime } from 'luxon'

import {
  type LoginResponse,
  type User
} from '@/services/auth/interfaces/login-response.interface'

interface DecodedToken {
  exp?: number
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '' as string | undefined,
    user: null as User | null
  }),

  actions: {
    setLoginData(loginData: LoginResponse) {
      this.token = loginData.data.token
      this.user = loginData.data
    },

    checkAuthentication(): boolean {
      if (!this.token) return false
      const decoded = jwtDecode<DecodedToken>(this.token)
      const now = DateTime.now().toUnixInteger()
      return decoded.exp ? now <= decoded.exp : false
    },

    isAuthenticated(): boolean {
      return this.checkAuthentication()
    },

    logout() {
      this.token = ''
      this.user = null
      localStorage.removeItem('auth')
    }
  },

  getters: {
    getUser: (state) => state.user
  },

  persist: {
    key: 'auth',
    storage: localStorage
  }
})
