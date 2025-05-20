<template>
  <div class="p-4">
    <div class="mb-4 flex justify-between items-center">
      <Button label="Agregar Fabricante" icon="pi pi-plus" @click="openNewManufacturerDialog" />
    </div>

    <div class="mb-4">
      <IconField>
        <InputIcon class="pi pi-search" />
        <InputText v-model="params.name" placeholder="Buscar por nombre" />
      </IconField>
    </div>

    <DataTable
      :value="manufacturers"
      :paginator="true"
      :rows="params.per_page"
      :totalRecords="totalRecords"
      :lazy="true"
      :loading="loading"
      @page="onPage($event)"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} fabricantes"
      responsiveLayout="scroll"
      class="p-datatable-sm"
    >
      <Column field="id" header="ID" sortable></Column>
      <Column field="name" header="Nombre" sortable></Column>
      <Column field="city" header="Ciudad" sortable></Column>
      <Column field="country" header="País" sortable></Column>
      <Column field="description" header="Descripción" sortable></Column>
      <Column header="Acciones">
        <template #body="slotProps">
          <Button
            icon="pi pi-pencil"
            class="p-button-rounded p-button-success mr-2"
            @click="openEditManufacturerDialog(slotProps.data)"
          />
          <Button
            icon="pi pi-trash"
            class="p-button-rounded p-button-danger"
            @click="confirmDeleteManufacturer(slotProps.data)"
          />
        </template>
      </Column>
    </DataTable>

    <Dialog
      v-model:visible="manufacturerDialog"
      :header="dialogMode === 'new' ? 'Nuevo Fabricante' : 'Editar Fabricante'"
      :modal="true"
      :style="{ width: '30rem' }"
    >
      <div class="flex items-center gap-4 mb-4">
        <label for="name" class="font-semibold w-24">Nombre</label>
        <InputText
          id="name"
          v-model.trim="manufacturer.name"
          required
          autofocus
          :class="{ 'p-invalid': submitted && !manufacturer.name }"
        />
        <small class="p-error" v-if="submitted && !manufacturer.name"
          >El nombre es requerido.</small
        >
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="city" class="font-semibold w-24">Ciudad</label>
        <InputText
          id="city"
          v-model.trim="manufacturer.city"
          required
          :class="{ 'p-invalid': submitted && !manufacturer.city }"
        />
        <small class="p-error" v-if="submitted && !manufacturer.city"
          >La ciudad es requerida.</small
        >
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="country" class="font-semibold w-24">País</label>
        <InputText
          id="country"
          v-model.trim="manufacturer.country"
          required
          :class="{ 'p-invalid': submitted && !manufacturer.country }"
        />
        <small class="p-error" v-if="submitted && !manufacturer.country"
          >El país es requerido.</small
        >
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="description" class="font-semibold w-24">Descripción</label>
        <Textarea
          id="description"
          v-model.trim="manufacturer.description"
          rows="3"
          :class="{ 'p-invalid': submitted && !manufacturer.description }"
        />
        <small class="p-error" v-if="submitted && !manufacturer.description"
          >La descripción es requerida.</small
        >
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
        <Button
          label="Guardar"
          icon="pi pi-check"
          class="p-button-text"
          @click="saveManufacturer"
        />
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
import Textarea from 'primevue/textarea'
import Dialog from 'primevue/dialog'
import ConfirmDialog from 'primevue/confirmdialog'
import type { Manufacturer } from '@/services/manufacturers/interfaces/manufacturer-response.interface'
import * as manufacturerService from '@/services/manufacturers/manufacturer.service'
import type { GetPresentationParams } from '@/services/manufacturers/interfaces/get-manufacturer-params.interface'
import axios from 'axios'

const toast = useToast()
const confirm = useConfirm()

const manufacturers = ref<Manufacturer[]>([])
const totalRecords = ref(0)
const loading = ref(false)
const manufacturerDialog = ref(false)
const submitted = ref(false)
const dialogMode = ref('new')

const manufacturer = reactive<Manufacturer>({
  id: 0,
  name: '',
  city: '',
  country: '',
  description: ''
})

const params = reactive<GetPresentationParams>({
  name: '',
  paginate: true,
  page: 1,
  per_page: 5
})

const loadManufacturers = async (page = 1) => {
  loading.value = true
  params.page = page

  try {
    const response = await manufacturerService.getAll(params)

    manufacturers.value = response.data
    totalRecords.value = response.meta.total
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los fabricantes',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

watch(
  () => params.name,
  () => {
    loadManufacturers()
  }
)

const onPage = (event: DataTablePageEvent) => {
  loadManufacturers(event.page + 1)
}

const openNewManufacturerDialog = () => {
  manufacturer.id = 0
  manufacturer.name = ''
  manufacturer.city = ''
  manufacturer.country = ''
  manufacturer.description = ''
  submitted.value = false
  manufacturerDialog.value = true
  dialogMode.value = 'new'
}

const openEditManufacturerDialog = (data: Manufacturer) => {
  manufacturer.id = data.id
  manufacturer.name = data.name
  manufacturer.city = data.city
  manufacturer.country = data.country
  manufacturer.description = data.description
  manufacturerDialog.value = true
  dialogMode.value = 'edit'
}

const hideDialog = () => {
  manufacturerDialog.value = false
  submitted.value = false
}

const saveManufacturer = async () => {
  submitted.value = true

  if (manufacturer.name && manufacturer.city && manufacturer.country && manufacturer.description) {
    try {
      if (dialogMode.value === 'new') {
        const { id, ...createManufacturer } = manufacturer
        await manufacturerService.create(createManufacturer)
        toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Fabricante creado',
          life: 3000
        })
      } else {
        const { id, ...updateData } = manufacturer
        await manufacturerService.update(id, updateData)
        toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Fabricante actualizado',
          life: 3000
        })
      }
      manufacturerDialog.value = false
      loadManufacturers()
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
          detail: 'No se pudo guardar el fabricante',
          life: 3000
        })
      }
    }
  }
}

const confirmDeleteManufacturer = (data: Manufacturer) => {
  confirm.require({
    message: '¿Está seguro que desea eliminar este fabricante?',
    header: 'Confirmar',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteManufacturer(data.id)
  })
}

const deleteManufacturer = async (id: number) => {
  try {
    await manufacturerService.destroy(id)
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Fabricante eliminado', life: 3000 })
    loadManufacturers()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar el fabricante',
      life: 3000
    })
  }
}

onMounted(() => {
  loadManufacturers()
})
</script>

<style scoped></style>
