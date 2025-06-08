<template>
  <aside 
    class="sidebar-container bg-white shadow-lg flex flex-col transition-all duration-300 ease-in-out"
    :class="{
      'sidebar-collapsed': !isOpen && !isIconMode,
      'sidebar-icon-only': !isOpen && isIconMode
    }"
  >
    <!-- Header con logo y botón de toggle -->
    <div class="pl-9 pr-10 border-b border-gray-200 flex items-center justify-between">
      <img
        src="/wine-lovers.png"
        alt="Logo Universidad"
        class="h-[120px] object-contain transition-all duration-300"
        :class="{ 
          'w-full': isOpen, 
          'w-12 mx-auto': !isOpen && isIconMode,
          'hidden': !isOpen && !isIconMode 
        }"
      />
      <button 
        @click="toggleSidebar"
        class="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
        aria-label="Toggle sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Navegación -->
    <nav class="flex-1 overflow-y-auto py-4">
      <ul class="space-y-2 px-3">
        <li v-for="item in menuItems" :key="item.path">
          <router-link
            :to="item.path"
            class="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 hover:text-[#bb976d] shadow-sm hover:shadow-md"
            :class="{ 'bg-[#bb976d] text-white hover:bg-[#bb976d] hover:text-white shadow-md': isCurrentRoute(item.path) }"
          >
            <span :class="{ 'hidden': !isOpen }">{{ item.name }}</span>
            <!-- Mostrar solo la primera letra cuando está en modo icono -->
            <span v-if="!isOpen && isIconMode" class="text-center w-full font-bold">{{ item.name.charAt(0) }}</span>
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
            class="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 hover:bg-gray-100 hover:text-[#bb976d] shadow-sm hover:shadow-md"
            :class="{ 'bg-[#bb976d] text-white hover:bg-[#bb976d] hover:text-white shadow-md': isCurrentRoute('/cambiar-contrasena') }"
          >
            <span :class="{ 'hidden': !isOpen }">Cambiar contraseña</span>
            <span v-if="!isOpen && isIconMode" class="text-center w-full font-bold">C</span>
          </router-link>
        </li>
        <li>
          <button
            @click="handleLogout"
            class="w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 hover:bg-gray-100 hover:text-[#bb976d] text-gray-700 shadow-sm hover:shadow-md"
          >
            <span :class="{ 'hidden': !isOpen }">Cerrar sesión</span>
            <span v-if="!isOpen && isIconMode" class="text-center w-full font-bold">S</span>
          </button>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store';
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Estado para controlar si el sidebar está abierto o cerrado
const isOpen = ref(true)
// Estado para controlar si estamos en modo icono (PC) o modo oculto completo
const isIconMode = ref(false)
// Estado para detectar si estamos en móvil
const isMobile = ref(false)

// Función para alternar el estado del sidebar
const toggleSidebar = () => {
  isOpen.value = !isOpen.value
}

// Función para cambiar entre modo icono y modo oculto completo (solo para PC)
const toggleIconMode = () => {
  if (!isMobile.value) {
    isIconMode.value = !isIconMode.value
  }
}

// Detectar si estamos en móvil
const checkIfMobile = () => {
  isMobile.value = window.innerWidth < 1024
  // En móvil siempre usamos el modo de ocultar completamente
  if (isMobile.value) {
    isIconMode.value = false
  } else {
    // En PC usamos el modo de iconos por defecto
    isIconMode.value = true
  }
}

onMounted(() => {
  checkIfMobile()
  window.addEventListener('resize', checkIfMobile)
})

// Exponer el estado y las funciones para que el componente padre pueda usarlos
defineExpose({
  isOpen,
  isIconMode,
  toggleSidebar,
  toggleIconMode
})

const perfil = computed(() => authStore.user?.profile)

const isCurrentRoute = (path: string) => {
  return route.path === path
}

const commonItems = [{ name: 'Inicio', path: '/inicio' }]

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

const menuItems = computed(() => {
  if (perfil.value?.name === 'Admin') {
    return [...commonItems, ...adminItems]
  } else if (perfil.value?.name === 'Social') {
    return [...commonItems, ...socialItems]
  } else if (perfil.value?.name === 'Logistic') {
    return [...commonItems, ...logisticItems]
  } else {
    return []
  }
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// Call checkIfMobile at the top level
checkIfMobile()
</script>

<style scoped>
.router-link-active {
  @apply bg-[#bb976d] text-white shadow-md;
}

.sidebar-container {
  width: 16rem; /* w-64 */
  height: 100vh;
}

.sidebar-collapsed {
  width: 0;
  min-width: 0;
  overflow: hidden;
}

.sidebar-icon-only {
  width: auto;
  min-width: 4rem; /* Ajusta según sea necesario */
  overflow: hidden;
}

/* Responsive para móviles */
@media (max-width: 1024px) {
  .sidebar-container {
    position: fixed;
    z-index: 50;
    height: 100vh;
    left: 0;
    top: 0;
  }
  
  .sidebar-collapsed {
    left: -16rem;
    width: 16rem; /* Mantener el ancho en móviles pero oculto */
  }
}
</style>
