<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Cambiar contraseña</h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Actualiza tu contraseña para mantener tu cuenta segura
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="rounded-md shadow-sm space-y-6">
          <div>
            <label for="current-password" class="block text-sm font-medium text-gray-700">
              Contraseña Actual
            </label>
            <Password
              id="current-password"
              name="current-password"
              toggleMask
              v-model="passwordToChange.current_password"
              inputClass="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700"
              placeholder="Ingrese su contraseña actual"
              :inputProps="{ autocomplete: 'current-password' }"
              class="w-full"
            />
          </div>
          <div>
            <label for="new-password" class="block text-sm font-medium text-gray-700">
              Nueva Contraseña
            </label>
            <Password
              id="new-password"
              name="new-password"
              toggleMask
              v-model="passwordToChange.new_password"
              inputClass="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700"
              placeholder="Ingrese su nueva contraseña"
              :inputProps="{ autocomplete: 'current-password' }"
              class="w-full"
            />
          </div>
          <div>
            <label for="confirm-password" class="block text-sm font-medium text-gray-700">
              Confirmar Nueva Contraseña
            </label>
            <Password
              id="confirm-password"
              name="confirm-password"
              toggleMask
              v-model="passwordToChange.new_password_confirmation"
              inputClass="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700"
              placeholder="Confirme su nueva contraseña"
              :inputProps="{ autocomplete: 'current-password' }"
              class="w-full"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="!isFormValid"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md mb-2 text-white bg-[#b1291d] hover:bg-[#8f1f16] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b1291d]"
            :class="{ 'opacity-50 cursor-not-allowed': !isFormValid }"
          >
            Cambiar contraseña
          </button>
          <Button
            label="Regresar"
            severity="secondary"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white"
            @click="goToDashboard"
          >
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { changePassword } from '@/services/auth/auth.service'
import type { ChangePasswordRequest } from '@/services/auth/interfaces/change-password-request.interface'
import axios from 'axios'

const router = useRouter()
const toast = useToast()

const passwordToChange = ref<ChangePasswordRequest>({
  current_password: '',
  new_password: '',
  new_password_confirmation: ''
})

const isFormValid = computed(() => {
  return (
    passwordToChange.value.current_password.length > 0 &&
    passwordToChange.value.new_password.length >= 8 &&
    passwordToChange.value.new_password === passwordToChange.value.new_password_confirmation
  )
})

const handleSubmit = async () => {
  if (isFormValid.value) {
    try {
      await changePassword(passwordToChange.value)

      toast.add({
        severity: 'success',
        summary: 'Contraseña actualizada',
        detail: 'Tu contraseña ha sido cambiada exitosamente',
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
        summary: 'Error',
        detail: errorMessage,
        life: 5000
      })
    }
  } else {
    toast.add({
      severity: 'warn',
      summary: 'Formulario inválido',
      detail: 'La contraseña debe tener al menos 8 caracteres',
      life: 3000
    })
  }
}

const goToDashboard = () => {
  router.push('/inicio')
}
</script>

<style scoped>
:deep(.p-password input) {
  width: 100%;
}
</style>
