import {
  createRouter,
  createWebHistory,
  type NavigationGuardNext,
  type RouteLocationNormalized
} from 'vue-router'

import LoginView from '../views/LoginView.vue'
import NotFound from '../views/NotFoundView.vue'
import Forbidden from '../views/ForbiddenView.vue'
import AppLayout from '../components/layout/AppLayout.vue'
import { useAuthStore } from '@/stores/auth.store'
import { computed } from 'vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView
    },
    {
      path: '/cambiar-contrasena',
      name: 'ChangePassword',
      component: () => import('../views/ChangePasswordView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/',
      name: 'Layout',
      component: AppLayout,
      children: [
        {
          path: '/inicio',
          name: 'Inicio',
          component: () => import('../views/DashboardView.vue'),
          meta: { requiresAuth: true, canAccess: ['Admin', 'Social', 'Logistic'] }
        },
        {
          path: '/usuarios',
          name: 'Usuarios',
          component: () => import('../views/Admin/UsuariosView.vue'),
          meta: { requiresAuth: true, canAccess: ['Admin'] }
        },
      ]
    },
    {
      path: '/403',
      name: 'Forbidden',
      component: Forbidden
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound
    }
  ]
})

router.beforeEach(
  (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const authStore = useAuthStore()
    const perfil = computed(() => authStore.user?.profile)    

    if (to.name === 'Login' && authStore.isAuthenticated()) {   
      return next({ name: 'Inicio' })
    }

    if (!to.meta.requiresAuth) {
      return next()
    }

    if (!authStore.isAuthenticated()) {
      return next({ name: 'Login', query: { redirect: to.fullPath } })
    }

    if (
      to.meta.canAccess &&
      Array.isArray(to.meta.canAccess) &&
      !to.meta.canAccess.includes(perfil.value?.name)
    ) {
      return next({ name: 'Forbidden' })
    }

    next()
  }
)

export default router
