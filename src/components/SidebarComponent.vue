<template>
  <aside class="w-64 h-screen bg-white shadow-lg flex flex-col transition-all duration-300 ease-in-out">
    <!-- Header con logo -->
    <div class="pl-9 pr-10 border-b border-gray-200">
      <img
        src="/wine-lovers.png"
        alt="Logo Universidad"
        class="w-full h-[120px] object-contain"
      />
    </div>

    <!-- Navegación -->
    <nav class="flex-1 overflow-y-auto py-4">
      <ul class="space-y-2 px-3">
        <li v-for="item in menuItems" :key="item.path">
          <router-link
            :to="item.path"
            class="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 hover:text-[#b1291d] shadow-sm hover:shadow-md"
            :class="{ 'bg-[#b1291d] text-white hover:bg-[#9e2219] hover:text-white shadow-md': isCurrentRoute(item.path) }"
          >
            {{ item.name }}
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- Footer con opciones de usuario -->
    <div class="p-4 border-t border-gray-200">
      <ul class="space-y-2">
        <li>
          <router-link
            to="/cambiar-contrasena"
            class="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 hover:bg-gray-100 hover:text-[#b1291d] shadow-sm hover:shadow-md"
            :class="{ 'bg-[#b1291d] text-white hover:bg-[#9e2219] hover:text-white shadow-md': isCurrentRoute('/cambiar-contrasena') }"
          >
            Cambiar contraseña
          </router-link>
        </li>
        <li>
          <button
            @click="handleLogout"
            class="w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 hover:bg-gray-100 hover:text-[#b1291d] text-gray-700 shadow-sm hover:shadow-md"
          >
            Cerrar sesión
          </button>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store';
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const perfil = computed(() => authStore.user?.profile)

const isCurrentRoute = (path: string) => {
  return route.path === path
}

const commonItems = [{ name: 'Inicio', path: '/inicio' }]

const menuItems = computed(() => {
  const adminItems = [
    { name: 'Gestión de Usuarios', path: '/usuarios' },
    { name: 'Gestión de Clientes', path: '/clientes' },
    { name: 'Gestión de Productos', path: '/productos' },
    { name: 'Gestión de Presentaciones', path: '/presentaciones' },
    { name: 'Gestión de Fabricantes', path: '/fabricantes' },
  ]

  const socialItems = [
    { name: 'Reviews', path: '/reviews' },
  ]

  const logisticItems = [
    { name: 'Gestión de Ordenes', path: '/ordenes' },
  ]

  if (perfil.value?.name === 'Admin') {
    return [...commonItems, ...adminItems]
  } else if (perfil.value?.name === 'Social') {
    return [...commonItems, ...socialItems]
  } else if (perfil.value?.name === 'Logistic') {
    return [...commonItems, ...logisticItems]
  }else {
    return []
  }
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.router-link-active {
  @apply bg-[#b1291d] text-white shadow-md;
}
</style>
