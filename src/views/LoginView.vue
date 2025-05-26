<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
    <div class="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
      <div>
        <img
          class="mx-auto h-40 w-auto"
          src="/wine-lovers.png"
          alt="Logo"
        />
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Iniciar sesión</h2>
        <p class="mt-2 text-center text-sm text-gray-600">Accede a tu cuenta</p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="rounded-md shadow-sm -space-y-px">
          <div class="mb-4">
            <label
              for="email"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >Correo electrónico</label
            >
            <InputText
              id="email"
              v-model="loginRequest.email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700"
              placeholder="Ingresa tu correo electrónico"
            />
          </div>
          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >Contraseña</label
            >
            <Password
              v-model="loginRequest.password"
              :feedback="false"
              toggleMask
              class="w-full"
              inputClass="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700"
              placeholder="Ingresa tu contraseña"
              :inputProps="{ autocomplete: 'current-password' }"
            />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="text-sm">
            <a href="#" class="font-medium text-gray-900 dark:text-white">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="!isFormValid"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#b1291d] hover:bg-[#8f1f16] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b1291d]"
            :class="{ 'opacity-50 cursor-not-allowed': !isFormValid }"
          >
            Iniciar sesión
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import type { LoginRequest } from '@/services/auth/interfaces/login-request.interface'
import { login } from '@/services/auth/auth.service'
import { useAuthStore } from '@/stores/auth.store'
import axios from 'axios'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const loginRequest = ref<LoginRequest>({ email: '', password: '' })

const isFormValid = computed(() => {
  return loginRequest.value.email.length > 0 && loginRequest.value.password.length >= 8
})

const handleSubmit = async () => {
  if (isFormValid.value) {
    try {
      const response = await login(loginRequest.value)

      authStore.setLoginData(response)

      toast.add({
        severity: 'success',
        summary: 'Inicio de sesión exitoso',
        detail: 'Bienvenido de vuelta!',
        life: 3000
      })

      router.push('/inicio')
    } catch (error) {
      let errorMessage: string = 'Ocurrió un error inesperado';

      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || 'Error en la solicitud'
      }

      toast.add({
        severity: 'error',
        summary: 'Error de inicio de sesión',
        detail: errorMessage,
        life: 5000
      })

      loginRequest.value.password = ''
    }
  } else {
    toast.add({
      severity: 'warn',
      summary: 'Formulario inválido',
      detail: 'Por favor, complete todos los campos',
      life: 3000
    })
  }
}
</script>

<style scoped>
:deep(.p-password input) {
  width: 100%;
}
</style>
