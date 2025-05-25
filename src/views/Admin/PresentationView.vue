<template>
  <div class="p-4">
    <div class="mb-4 flex justify-between items-center">
      <Button label="Agregar Presentación" icon="pi pi-plus" @click="openNewPresentationDialog" />
    </div>

    <div class="mb-4">
      <IconField>
        <InputIcon class="pi pi-search" />
        <InputText v-model="params.name" placeholder="Buscar por nombre" />
      </IconField>
    </div>

    <DataTable
      :value="presentations"
      :paginator="true"
      :rows="params.per_page"
      :totalRecords="totalRecords"
      :lazy="true"
      :loading="loading"
      @page="onPage($event)"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} presentaciones"
      responsiveLayout="scroll"
      class="p-datatable-sm"
    >
      <Column field="id" header="ID" sortable></Column>
      <Column field="amount" header="Cantidad" sortable></Column>
      <Column field="unit_measurement.name" header="Unidad de Medida" sortable>
        <template #body="slotProps">
          {{ slotProps.data.unit_measurement.name }} ({{
            slotProps.data.unit_measurement.abbreviation
          }})
        </template>
      </Column>
      <Column header="Acciones">
        <template #body="slotProps">
          <Button
            icon="pi pi-pencil"
            class="p-button-rounded p-button-success mr-2"
            @click="openEditPresentationDialog(slotProps.data)"
          />
          <Button
            icon="pi pi-trash"
            class="p-button-rounded p-button-danger"
            @click="confirmDeletePresentation(slotProps.data)"
          />
        </template>
      </Column>
    </DataTable>

    <Dialog
      v-model:visible="presentationDialog"
      :header="dialogMode === 'new' ? 'Nueva Presentación' : 'Editar Presentación'"
      :modal="true"
      :style="{ width: '30rem' }"
    >
      <div class="flex items-center gap-4 mb-4">
        <label for="amount" class="font-semibold w-32">Cantidad</label>
        <InputNumber
          id="amount"
          v-model="presentationForm.amount"
          required
          autofocus
          :min="0"
          :class="{ 'p-invalid': submitted && !presentationForm.amount }"
        />
        <small class="p-error" v-if="submitted && !presentationForm.amount"
          >La cantidad es requerida.</small
        >
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="unit_measurement_id" class="font-semibold w-32">Unidad de Medida</label>
        <Dropdown
          id="unit_measurement_id"
          v-model="presentationForm.unit_measurement_id"
          :options="unitMeasurements"
          optionLabel="name"
          optionValue="id"
          placeholder="Seleccione una unidad"
          :class="{ 'p-invalid': submitted && !presentationForm.unit_measurement_id }"
        >
          <template #option="slotProps">
            {{ slotProps.option.name }} ({{ slotProps.option.abbreviation }})
          </template>
        </Dropdown>
        <small class="p-error" v-if="submitted && !presentationForm.unit_measurement_id"
          >La unidad de medida es requerida.</small
        >
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
        <Button
          label="Guardar"
          icon="pi pi-check"
          class="p-button-text"
          @click="savePresentation"
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
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Dialog from 'primevue/dialog'
import ConfirmDialog from 'primevue/confirmdialog'
import type { Presentation } from '@/services/presentations/interfaces/presentation-response.interface'
import type { CreatePresentation } from '@/services/presentations/interfaces/presentation-request.interface'
import * as presentationService from '@/services/presentations/presentation.service'
import type { GetPresentationParams } from '@/services/manufacturers/interfaces/get-manufacturer-params.interface'
import axios from 'axios'

const toast = useToast()
const confirm = useConfirm()

const presentations = ref<Presentation[]>([])
const unitMeasurements = ref<{ id: number; name: string; abbreviation: string }[]>([])
const totalRecords = ref(0)
const loading = ref(false)
const presentationDialog = ref(false)
const submitted = ref(false)
const dialogMode = ref('new')

const presentation = reactive<Presentation>({
  id: 0,
  amount: 0,
  unit_measurement: {
    id: 0,
    name: '',
    abbreviation: ''
  }
})

const presentationForm = reactive<{
  id: number
  amount: number
  unit_measurement_id: number
}>({
  id: 0,
  amount: 0,
  unit_measurement_id: 0
})

const params = reactive<GetPresentationParams>({
  name: '',
  paginate: true,
  page: 1,
  per_page: 5
})

const loadPresentations = async (page = 1) => {
  loading.value = true
  params.page = page

  try {
    const response = await presentationService.getAll(params)

    presentations.value = response.data
    totalRecords.value = response.meta.total

    const uniqueUnitMeasurements = new Map()
    presentations.value.forEach((p) => {
      if (p.unit_measurement && !uniqueUnitMeasurements.has(p.unit_measurement.id)) {
        uniqueUnitMeasurements.set(p.unit_measurement.id, p.unit_measurement)
      }
    })
    unitMeasurements.value = Array.from(uniqueUnitMeasurements.values())
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las presentaciones',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

watch(
  () => params.name,
  () => {
    loadPresentations()
  }
)

const onPage = (event: DataTablePageEvent) => {
  loadPresentations(event.page + 1)
}

const openNewPresentationDialog = () => {
  presentation.id = 0
  presentation.amount = 0
  presentation.unit_measurement = {
    id: 0,
    name: '',
    abbreviation: ''
  }

  presentationForm.id = 0
  presentationForm.amount = 0
  presentationForm.unit_measurement_id = 0

  submitted.value = false
  presentationDialog.value = true
  dialogMode.value = 'new'
}

const openEditPresentationDialog = (data: Presentation) => {
  presentation.id = data.id
  presentation.amount = data.amount
  presentation.unit_measurement = { ...data.unit_measurement }

  presentationForm.id = data.id
  presentationForm.amount = data.amount
  presentationForm.unit_measurement_id = data.unit_measurement.id

  presentationDialog.value = true
  dialogMode.value = 'edit'
}

const hideDialog = () => {
  presentationDialog.value = false
  submitted.value = false
}

const savePresentation = async () => {
  submitted.value = true

  if (presentationForm.amount && presentationForm.unit_measurement_id) {
    try {
      const requestData: CreatePresentation = {
        amount: presentationForm.amount,
        unit_measurement_id: presentationForm.unit_measurement_id
      }

      if (dialogMode.value === 'new') {
        await presentationService.create(requestData)
        toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Presentación creada',
          life: 3000
        })
      } else {
        await presentationService.update(presentationForm.id, requestData)
        toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Presentación actualizada',
          life: 3000
        })
      }
      presentationDialog.value = false
      loadPresentations()
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
          detail: 'No se pudo guardar la presentación',
          life: 3000
        })
      }
    }
  }
}

const confirmDeletePresentation = (data: Presentation) => {
  confirm.require({
    message: '¿Está seguro que desea eliminar esta presentación?',
    header: 'Confirmar',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deletePresentation(data.id)
  })
}

const deletePresentation = async (id: number) => {
  try {
    await presentationService.destroy(id)
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Presentación eliminada',
      life: 3000
    })
    loadPresentations()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar la presentación',
      life: 3000
    })
  }
}

onMounted(() => {
  loadPresentations()
})
</script>

<style scoped></style>
