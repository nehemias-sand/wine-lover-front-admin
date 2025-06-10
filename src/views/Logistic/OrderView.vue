<template>
  <div class="p-4">
    <div class="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="order_status_id" class="block text-sm font-medium mb-1">Estado de la Orden</label>
        <Dropdown
          id="order_status_id"
          v-model="params.order_status_id"
          :options="orderStatuses"
          optionLabel="name"
          optionValue="id"
          placeholder="Seleccione un estado"
          class="w-full"
        />
      </div>
      <div>
        <label for="created_at" class="block text-sm font-medium mb-1">Fecha de Creación</label>
        <Calendar
          id="created_at"
          v-model="params.created_at"
          dateFormat="dd/mm/yy"
          placeholder="Seleccione una fecha"
          class="w-full"
        />
      </div>
    </div>

    <DataTable
      :value="orders"
      :paginator="true"
      :rows="params.per_page"
      :totalRecords="totalRecords"
      :lazy="true"
      :loading="loading"
      @page="onPage($event)"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} órdenes"
      responsiveLayout="scroll"
      class="p-datatable-sm"
      stripedRows
      rowHover
    >
      <Column field="id" header="ID" sortable style="width: 5%"></Column>
      <Column field="code" header="Código" sortable style="width: 10%"></Column>
      <Column field="order_status" header="Estado" sortable style="width: 10%">
        <template #body="slotProps">
          <Tag :value="slotProps.data.order_status" :severity="getOrderStatusSeverity(slotProps.data.order_status)" />
        </template>
      </Column>
      <Column field="subtotal" header="Subtotal" sortable style="width: 10%">
        <template #body="slotProps">
          {{ formatCurrency(slotProps.data.subtotal) }}
        </template>
      </Column>
      <Column field="total_discount" header="Descuento" sortable style="width: 10%">
        <template #body="slotProps">
          {{ formatCurrency(slotProps.data.total_discount) }}
        </template>
      </Column>
      <Column field="total" header="Total" sortable style="width: 10%">
        <template #body="slotProps">
          <span class="font-bold">{{ formatCurrency(slotProps.data.total) }}</span>
        </template>
      </Column>
      <Column field="cashback_generated" header="Cashback" sortable style="width: 10%">
        <template #body="slotProps">
          <span class="text-green-600 font-bold">{{ formatCurrency(slotProps.data.cashback_generated) }}</span>
        </template>
      </Column>
      <Column header="Acciones" style="width: 15%">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button
              icon="pi pi-eye"
              class="p-button-rounded p-button-info p-button-sm"
              @click="viewOrderDetails(slotProps.data)"
              v-tooltip.top="'Ver Detalles'"
            />
            <Button
              icon="pi pi-pencil"
              class="p-button-rounded p-button-success p-button-sm"
              @click="openUpdateStatusDialog(slotProps.data)"
              v-tooltip.top="'Actualizar Estado'"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog
      v-model:visible="orderDetailsDialog"
      :header="`Detalles de la Orden: ${selectedOrder?.code || ''}`"
      :modal="true"
      :style="{ width: '80rem' }"
      :maximizable="true"
    >
      <div v-if="selectedOrder" class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="bg-blue-50 p-4 rounded-lg">
            <h3 class="font-bold text-blue-800 mb-2">Información de la Orden</h3>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <p class="text-sm text-gray-500">Código</p>
                <p class="font-semibold">{{ selectedOrder.code }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Estado</p>
                <Tag :value="selectedOrder.order_status" :severity="getOrderStatusSeverity(selectedOrder.order_status)" />
              </div>
              <div>
                <p class="text-sm text-gray-500">ID de Transacción</p>
                <p class="font-semibold">{{ selectedOrder.transaction_id || 'N/A' }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-green-50 p-4 rounded-lg">
            <h3 class="font-bold text-green-800 mb-2">Resumen Financiero</h3>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <p class="text-sm text-gray-500">Subtotal</p>
                <p class="font-semibold">{{ formatCurrency(selectedOrder.subtotal) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Descuento</p>
                <p class="font-semibold">{{ formatCurrency(selectedOrder.total_discount) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Total</p>
                <p class="font-bold">{{ formatCurrency(selectedOrder.total) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Cashback Generado</p>
                <p class="font-bold text-green-600">{{ formatCurrency(selectedOrder.cashback_generated) }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-yellow-50 p-4 rounded-lg">
            <h3 class="font-bold text-yellow-800 mb-2">Dirección de Entrega</h3>
            <div v-if="selectedOrder.address">
              <p><span class="text-gray-500">Nombre:</span> {{ selectedOrder.address.name }}</p>
              <p><span class="text-gray-500">Distrito:</span> {{ selectedOrder.address.district }}</p>
              <p><span class="text-gray-500">Barrio:</span> {{ selectedOrder.address.neighborhood }}</p>
              <p><span class="text-gray-500">Calle:</span> {{ selectedOrder.address.street }} {{ selectedOrder.address.number }}</p>
              <p v-if="selectedOrder.address.reference"><span class="text-gray-500">Referencia:</span> {{ selectedOrder.address.reference }}</p>
            </div>
            <p v-else class="text-gray-500">No hay información de dirección disponible.</p>
          </div>
        </div>
        
        <h3 class="font-bold text-lg mb-3">Productos</h3>
        <DataTable
          :value="selectedOrder.items"
          responsiveLayout="scroll"
          class="p-datatable-sm"
          stripedRows
        >
          <Column header="Producto" style="width: 40%">
            <template #body="slotProps">
              <div class="flex items-center gap-3">
                <img 
                  v-if="slotProps.data.product.images && slotProps.data.product.images.length > 0" 
                  :src="apiStorage + '/' + slotProps.data.product.images[0].url_image" 
                  :alt="slotProps.data.product.name"
                  class="w-12 h-12 object-cover rounded"
                />
                <div>
                  <p class="font-semibold">{{ slotProps.data.product.name }}</p>
                  <p class="text-sm text-gray-500">
                    {{ slotProps.data.presentation.amount }} {{ slotProps.data.presentation.unit_measurement.abbreviation }}
                  </p>
                  <p class="text-xs text-gray-400">
                    {{ slotProps.data.product.manufacturer.name }}
                  </p>
                </div>
              </div>
            </template>
          </Column>
          <Column field="amount" header="Cantidad" style="width: 10%"></Column>
          <Column field="unit_price" header="Precio Unitario" style="width: 15%">
            <template #body="slotProps">
              {{ formatCurrency(slotProps.data.unit_price) }}
            </template>
          </Column>
          <Column field="discount" header="Descuento" style="width: 15%">
            <template #body="slotProps">
              {{ formatCurrency(slotProps.data.discount) }}
            </template>
          </Column>
          <Column field="subtotal_item" header="Subtotal" style="width: 15%">
            <template #body="slotProps">
              <span class="font-bold">{{ formatCurrency(slotProps.data.subtotal_item) }}</span>
            </template>
          </Column>
        </DataTable>
      </div>
    </Dialog>

    <Dialog
      v-model:visible="updateStatusDialog"
      header="Actualizar Estado de la Orden"
      :modal="true"
      :style="{ width: '30rem' }"
    >
      <div v-if="selectedOrder" class="p-4">
        <div class="mb-4">
          <p class="mb-2">Orden: <span class="font-bold">{{ selectedOrder.code }}</span></p>
          <p class="mb-4">Estado actual: 
            <Tag :value="selectedOrder.order_status" :severity="getOrderStatusSeverity(selectedOrder.order_status)" />
          </p>
        </div>
        
        <div class="mb-4">
          <label for="new_status" class="block text-sm font-medium mb-1">Nuevo Estado</label>
          <Dropdown
            id="new_status"
            v-model="newOrderStatusId"
            :options="orderStatuses"
            optionLabel="name"
            optionValue="id"
            placeholder="Seleccione un nuevo estado"
            class="w-full"
          />
        </div>
        
        <div class="flex justify-end gap-2 mt-4">
          <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="updateStatusDialog = false" />
          <Button label="Actualizar" icon="pi pi-check" @click="updateStatus" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import DataTable, { type DataTablePageEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import type { Order } from '@/services/order/interfaces/order-response.interface'
import * as orderService from '@/services/order/order.service'
import * as catalogService from '@/services/catalogs/catalog.service'
import type { GetOrderParams } from '@/services/order/interfaces/get-order-params.interface'
import type { UpdateOrderStatus } from '@/services/order/interfaces/order-request.interface'
import type { OrderStatus } from '@/services/catalogs/interfaces/catalogs-response.interface'

const toast = useToast()

const orders = ref<Order[]>([])
const totalRecords = ref(0)
const loading = ref(false)

const orderDetailsDialog = ref(false)
const updateStatusDialog = ref(false)

const selectedOrder = ref<Order | null>(null)
const newOrderStatusId = ref<number | null>(null)

const orderStatuses = ref<OrderStatus[]>([])

const apiStorage = import.meta.env.VITE_VUE_APP_API_STORAGE

const params = reactive<GetOrderParams>({
  order_status_id: undefined,
  created_at: '',
  paginate: true,
  page: 1,
  per_page: 5
})

const loadOrderStatuses = async () => {
  try {
    const response = await catalogService.getOrderStatuses()
    orderStatuses.value = response.data
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los estados de órdenes',
      life: 3000
    })
  }
}

const loadOrders = async (page = 1) => {
  loading.value = true
  params.page = page

  try {
    const response = await orderService.getAll(params)

    orders.value = response.data
    totalRecords.value = response.meta.total
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las órdenes',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

watch(
  () => [params.order_status_id, params.created_at],
  () => {
    loadOrders()
  }
)

const onPage = (event: DataTablePageEvent) => {
  loadOrders(event.page + 1)
}

const viewOrderDetails = (order: Order) => {
  selectedOrder.value = order
  orderDetailsDialog.value = true
}

const openUpdateStatusDialog = (order: Order) => {
  selectedOrder.value = order
  const currentStatus = orderStatuses.value.find(status => status.name === order.order_status)
  newOrderStatusId.value = currentStatus?.id || null
  updateStatusDialog.value = true
}

const updateStatus = async () => {
  if (!selectedOrder.value || !newOrderStatusId.value) return

  try {
    const updateData: UpdateOrderStatus = {
      order_status_id: newOrderStatusId.value
    }
    
    await orderService.updateOrderStatus(selectedOrder.value.id, updateData)
    
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Estado de la orden actualizado correctamente',
      life: 3000
    })
    
    const index = orders.value.findIndex(o => o.id === selectedOrder.value?.id)
    if (index !== -1) {
      const newStatus = orderStatuses.value.find(s => s.id === newOrderStatusId.value)
      if (newStatus) {
        orders.value[index].order_status = newStatus.name
      }
    }
    
    updateStatusDialog.value = false
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo actualizar el estado de la orden',
      life: 3000
    })
  }
}

const formatCurrency = (value: string | number) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  return numValue.toLocaleString('es-SV', {
    style: 'currency',
    currency: 'USD'
  })
}

const getOrderStatusSeverity = (status: string) => {
  const map: Record<string, string> = {
    'PENDING': 'warning',
    'PROCESSING': 'info',
    'SHIPPED': 'info',
    'DELIVERED': 'success',
    'CANCELLED': 'danger'
  }
  return map[status] || 'info'
}

onMounted(() => {
  loadOrderStatuses()
  loadOrders()
})
</script>

<style scoped></style>