<template>
  <div class="p-4">
    <div class="mb-4 flex justify-between items-center">
      <Button label="Agregar Usuario" icon="pi pi-plus" @click="openNewUserDialog" />
    </div>

    <div class="mb-4">
      <IconField>
        <InputIcon class="pi pi-search" />
        <InputText v-model="params.email" placeholder="Buscar por email" />
      </IconField>
    </div>

    <DataTable
      :value="users"
      :paginator="true"
      :rows="params.per_page"
      :totalRecords="totalRecords"
      :lazy="true"
      :loading="loading"
      @page="onPage($event)"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
      responsiveLayout="scroll"
      class="p-datatable-sm"
    >
      <Column field="id" header="ID" sortable></Column>
      <Column field="username" header="Usuario" sortable></Column>
      <Column field="email" header="Email" sortable></Column>
      <Column field="profile.name" header="Perfil" sortable></Column>
      <Column field="state" header="Activo" sortable></Column>
      <Column header="Acciones">
        <template #body="slotProps">
          <Button
            icon="pi pi-pencil"
            class="p-button-rounded p-button-success mr-2"
            @click="openEditUserDialog(slotProps.data)"
          />
          <Button
            icon="pi pi-trash"
            class="p-button-rounded p-button-danger"
            @click="confirmDeactivateUser(slotProps.data)"
          />
        </template>
      </Column>
    </DataTable>

    <Dialog
      v-model:visible="userDialog"
      :header="dialogMode === 'new' ? 'Nuevo Usuario' : 'Editar Usuario'"
      :modal="true"
      :style="{ width: '25rem' }"
    >
      <div class="flex items-center gap-4 mb-4">
        <label for="username" class="font-semibold w-24">Usuario</label>
        <InputText
          id="username"
          v-model.trim="user.username"
          required
          autofocus
          :class="{ 'p-invalid': submitted && !user.username }"
        />
        <small class="p-error" v-if="submitted && !user.username">El usuario es requerido.</small>
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="email" class="font-semibold w-24">Email</label>
        <InputText
          id="email"
          v-model.trim="user.email"
          required
          :class="{ 'p-invalid': submitted && !user.email }"
        />
        <small class="p-error" v-if="submitted && !user.email">El email es requerido.</small>
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="profile" class="font-semibold w-24">Perfil</label>
        <Dropdown
          id="profile"
          v-model="user.profile_id"
          :options="profiles"
          optionLabel="name"
          optionValue="id"
          placeholder="Seleccione un perfil"
          :class="{ 'p-invalid': submitted && !user.profile_id }"
        />
        <small class="p-error" v-if="submitted && !user.profile_id">El perfil es requerido.</small>
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
        <Button label="Guardar" icon="pi pi-check" class="p-button-text" @click="saveUser" />
      </template>
    </Dialog>

    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import DataTable, { type DataTablePageEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import ConfirmDialog from 'primevue/confirmdialog'
import Dropdown from 'primevue/dropdown'
import type { User } from '@/services/auth/interfaces/login-response.interface'
import * as userService from '@/services/user/user.service'
import * as catalogsService from '@/services/catalogs/catalog.service'
import type { GetUserParams } from '@/services/user/interfaces/get-user-params.interface'
import type { Profile } from '@/services/catalogs/interfaces/catalogs-response.interface'
import axios from 'axios'

const toast = useToast()
const confirm = useConfirm()

const users = ref<User[]>([])
const profiles = ref<Profile[]>([])
const totalRecords = ref(0)
const loading = ref(false)
const userDialog = ref(false)
const submitted = ref(false)
const dialogMode = ref('new')

const user = reactive<User>({
  id: 0,
  username: '',
  email: '',
  email_verified_at: '',
  profile: {
    id: 0,
    name: '',
    description: '',
  },
  profile_id: 0,
  state: false
})

const params = reactive<GetUserParams>({
  email: '',
  paginate: true,
  page: 1,
  per_page: 5
})

const loadUsers = async (page = 1) => {
  loading.value = true
  params.page = page

  try {
    const response = await userService.getAll(params)

    users.value = response.data
    totalRecords.value = response.meta.total
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los usuarios',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const loadProfiles = async () => {
  try {
    const response = await catalogsService.getProfiles()
    profiles.value = response.data.filter(profile => profile.id !== 2)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los perfiles',
      life: 3000
    })
  }
}

watch(
  () => params.email,
  () => {
    loadUsers()
  }
)

const onPage = (event: DataTablePageEvent) => {
  loadUsers(event.page + 1)
}

const openNewUserDialog = () => {
  user.id = 0
  user.username = ''
  user.email = ''
  user.profile_id = 0
  submitted.value = false
  userDialog.value = true
  dialogMode.value = 'new'
}

const openEditUserDialog = (data: User) => {
  user.id = data.id
  user.username = data.username
  user.email = data.email
  user.profile_id = data.profile.id
  userDialog.value = true
  dialogMode.value = 'edit'
}

const hideDialog = () => {
  userDialog.value = false
  submitted.value = false
}

const saveUser = async () => {
  submitted.value = true

  if (user.username && user.email && user.profile_id) {
    try {
      if (dialogMode.value === 'new') {
        await userService.registerAdmin(user)
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario creado', life: 3000 })
      } else {
        await userService.update(user.id, { 
          username: user.username, 
          email: user.email,
          profile_id: user.profile_id 
        })
        toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Usuario actualizado',
          life: 3000
        })
      }
      userDialog.value = false
      loadUsers()
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        const errors = error.response.data.data

        for (const [field, messages] of Object.entries(errors) as [string, string[]][]) {
          messages.forEach((message: string) => {
            toast.add({
              severity: 'error',
              summary: `Error en ${field}`,
              detail: message,
              life: 3000
            })
          })
        }
      } else {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo guardar el usuario',
          life: 3000
        })
      }
    }
  }
}

const confirmDeactivateUser = (data: User) => {
  confirm.require({
    message: '¿Está seguro que desea cambiar de estado este usuario?',
    header: 'Confirmar',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deactivateUser(data.id)
  })
}

const deactivateUser = async (id: number) => {
  try {
    await userService.changeEstado(id)
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado', life: 3000 })
    loadUsers()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo desactivar el usuario',
      life: 3000
    })
  }
}

onMounted(() => {
  loadUsers()
  loadProfiles()
})
</script>

<style scoped></style>