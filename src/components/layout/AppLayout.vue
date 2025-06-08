<template>
  <div class="flex h-screen flex-col">
    <div class="flex flex-1 overflow-hidden">
      <Sidebar ref="sidebarRef" />
      <main class="flex-1 flex flex-col overflow-hidden bg-gray-50">
        <header class="bg-gray-50 shadow-sm">
          <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex items-center">
            <!-- Botón de hamburguesa para mostrar/ocultar sidebar -->
            <button 
              @click="toggleSidebar"
              class="mr-4 p-2 rounded-md hover:bg-gray-200 transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
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
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '../SidebarComponent.vue'

const route = useRoute()
const sidebarRef = ref<InstanceType<typeof Sidebar> | null>(null)
const isMobile = ref(false)

const checkIfMobile = () => {
  isMobile.value = window.innerWidth < 1024
}

const currentRouteName = computed(() => {
  const routeNames = {
    Inicio: 'Inicio',
    Usuarios: 'Gestión de Usuarios',
    Clientes: 'Gestión de Clientes',
    Presentaciones: 'Gestión de Pesentaciones',
    Fabricantes: 'Gestión de Fabricantes',
    Productos: 'Gestión de Productos',
    Ordenes: 'Gestión de Órdenes',
    Reviews: 'Gestión de Reviews',
  }

  return routeNames[route.name as keyof typeof routeNames] || 'Inicio'
})

const currentYear = computed(() => new Date().getFullYear())

const toggleSidebar = () => {
  if (sidebarRef.value) {
    sidebarRef.value.toggleSidebar()
  }
}

onMounted(() => {
  checkIfMobile()
  window.addEventListener('resize', checkIfMobile)
  
  if (sidebarRef.value && !isMobile.value) {
    sidebarRef.value.toggleIconMode()
  }
})
</script>

<style scoped>
main {
  transition: margin-left 0.3s ease-in-out;
}
</style>
