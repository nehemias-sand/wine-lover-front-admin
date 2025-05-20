<template>
  <div class="flex h-screen flex-col">
    <div class="flex flex-1 overflow-hidden">
      <Sidebar />
      <main class="flex-1 flex flex-col overflow-hidden bg-gray-50">
        <header class="bg-gray-50 shadow-sm">
          <div class="max-w-7xl mx-auto py-11 px-4 sm:px-6 lg:px-8">
            <h1 class="text-2xl font-bold text-gray-900">
              {{ currentRouteName }}
            </h1>
          </div>
        </header>
        <div class="flex-1 overflow-y-auto">
          <div class="max-w-7xl mx-auto py-2 sm:px-0 lg:px-0">
            <router-view></router-view>
          </div>
        </div>
        <footer class="bg-white shadow-md">
          <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center">
              <p class="text-sm text-gray-500">
                © {{ currentYear }} Club Amantes del Vino y Licores. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './SidebarLayout.vue'

const route = useRoute()

const currentRouteName = computed(() => {
  const routeNames = {
    Inicio: 'Inicio',
    Usuarios: 'Gestión de Usuarios',
    Clientes: 'Gestión de Clientes',
    Presentaciones: 'Gestión de Pesentaciones',
    Fabricantes: 'Gestión de Fabricantes',
    Ordenes: 'Gestión de Órdenes',
    Reviews: 'Gestión de Reviews',
  }

  return routeNames[route.name as keyof typeof routeNames] || 'Inicio'
})

const currentYear = computed(() => new Date().getFullYear())
</script>