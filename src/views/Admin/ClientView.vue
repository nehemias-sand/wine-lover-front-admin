<template>
  <div class="p-4">
    <div class="mb-4 flex justify-between items-center">
      <h1 class="text-2xl font-bold">Gestión de Clientes</h1>
    </div>

    <div class="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="identity_number" class="block text-sm font-medium mb-1"
          >Número de Identidad</label
        >
        <IconField class="w-full">
          <InputIcon class="pi pi-id-card" />
          <InputText
            id="identity_number"
            v-model="params.identity_number"
            placeholder="Buscar por número de identidad"
            class="w-full"
          />
        </IconField>
      </div>
      <div>
        <label for="names" class="block text-sm font-medium mb-1">Nombres</label>
        <IconField class="w-full">
          <InputIcon class="pi pi-user" />
          <InputText
            id="names"
            v-model="params.names"
            placeholder="Buscar por nombres"
            class="w-full"
          />
        </IconField>
      </div>
    </div>

    <DataTable
      :value="clients"
      :paginator="true"
      :rows="params.per_page"
      :totalRecords="totalRecords"
      :lazy="true"
      :loading="loading"
      @page="onPage($event)"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} clientes"
      responsiveLayout="scroll"
      class="p-datatable-sm"
      stripedRows
      rowHover
    >
      <Column field="id" header="ID" sortable style="width: 5%"></Column>
      <Column
        field="identity_number"
        header="Número de Identidad"
        sortable
        style="width: 15%"
      ></Column>
      <Column header="Nombre Completo" sortable style="width: 20%">
        <template #body="slotProps">
          {{ slotProps.data.names }} {{ slotProps.data.surnames }}
        </template>
      </Column>
      <Column field="phone" header="Teléfono" style="width: 10%"></Column>
      <Column field="membership" header="Membresía" style="width: 10%">
        <template #body="slotProps">
          <Tag
            :value="slotProps.data.membership"
            :severity="getMembershipSeverity(slotProps.data.membership)"
          />
        </template>
      </Column>
      <Column field="current_cashback" header="Cashback Actual" style="width: 10%">
        <template #body="slotProps">
          <span class="font-bold text-green-600">{{
            formatCurrency(slotProps.data.current_cashback)
          }}</span>
        </template>
      </Column>
      <Column header="Acciones" style="width: 20%">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button
              icon="pi pi-shopping-cart"
              class="p-button-rounded p-button-info p-button-sm"
              @click="viewOrders(slotProps.data)"
              v-tooltip.top="'Ver Órdenes'"
            />
            <Button
              icon="pi pi-wallet"
              class="p-button-rounded p-button-warning p-button-sm"
              @click="viewCashbackHistory(slotProps.data)"
              v-tooltip.top="'Ver Historial de Cashback'"
            />
            <Button
              icon="pi pi-user"
              class="p-button-rounded p-button-success p-button-sm"
              @click="viewClientDetails(slotProps.data)"
              v-tooltip.top="'Ver Detalles del Cliente'"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Diálogo de Detalles del Cliente -->
    <Dialog
      v-model:visible="clientDetailsDialog"
      :header="`Detalles del Cliente: ${selectedClient?.names || ''} ${selectedClient?.surnames || ''}`"
      :modal="true"
      :style="{ width: '50rem' }"
      :maximizable="true"
    >
      <div v-if="selectedClient" class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <div class="col-span-2 bg-blue-50 p-4 rounded-lg">
          <h2 class="text-xl font-bold mb-4 text-blue-800">Información Personal</h2>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">Número de Identidad</p>
              <p class="font-semibold">{{ selectedClient.identity_number }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Teléfono</p>
              <p class="font-semibold">{{ selectedClient.phone }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Fecha de Nacimiento</p>
              <p class="font-semibold">{{ formatDate(selectedClient.birthday_date) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Membresía</p>
              <Tag
                :value="selectedClient.membership"
                :severity="getMembershipSeverity(selectedClient.membership)"
              />
            </div>
          </div>
        </div>

        <div class="col-span-2 bg-green-50 p-4 rounded-lg">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-green-800">Cashback Actual</h2>
            <span class="text-2xl font-bold text-green-600">{{
              formatCurrency(selectedClient.current_cashback)
            }}</span>
          </div>
        </div>
      </div>
    </Dialog>

    <!-- Diálogo de Órdenes -->
    <Dialog
      v-model:visible="ordersDialog"
      :header="`Órdenes de ${selectedClient?.names || ''} ${selectedClient?.surnames || ''}`"
      :modal="true"
      :style="{ width: '80rem' }"
      :maximizable="true"
    >
      <div v-if="selectedClient" class="p-4">
        <DataTable
          :value="selectedClient.orders"
          :paginator="true"
          :rows="5"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 20]"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} órdenes"
          responsiveLayout="scroll"
          class="p-datatable-sm"
          stripedRows
          rowHover
          v-if="selectedClient.orders && selectedClient.orders.length > 0"
        >
          <Column field="id" header="ID" sortable style="width: 5%"></Column>
          <Column field="code" header="Código" sortable style="width: 10%"></Column>
          <Column field="order_status" header="Estado" sortable style="width: 10%">
            <template #body="slotProps">
              <Tag
                :value="slotProps.data.order_status"
                :severity="getOrderStatusSeverity(slotProps.data.order_status)"
              />
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
          <Column field="cashback_generated" header="Cashback Generado" sortable style="width: 15%">
            <template #body="slotProps">
              <span class="text-green-600 font-bold">{{
                formatCurrency(slotProps.data.cashback_generated)
              }}</span>
            </template>
          </Column>
          <Column header="Acciones" style="width: 10%">
            <template #body="slotProps">
              <Button
                icon="pi pi-list"
                class="p-button-rounded p-button-info p-button-sm"
                @click="viewOrderDetails(slotProps.data)"
                v-tooltip.top="'Ver Detalles de la Orden'"
              />
            </template>
          </Column>
        </DataTable>
        <div v-else class="text-center p-4">
          <i class="pi pi-shopping-cart text-4xl text-gray-300 mb-2"></i>
          <p class="text-gray-500">Este cliente no tiene órdenes registradas.</p>
        </div>
      </div>
    </Dialog>

    <!-- Diálogo de Detalles de Orden -->
    <Dialog
      v-model:visible="orderDetailsDialog"
      :header="`Detalles de la Orden: ${selectedOrder?.code || ''}`"
      :modal="true"
      :style="{ width: '70rem' }"
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
                <Tag
                  :value="selectedOrder.order_status"
                  :severity="getOrderStatusSeverity(selectedOrder.order_status)"
                />
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
                <p class="font-bold text-green-600">
                  {{ formatCurrency(selectedOrder.cashback_generated) }}
                </p>
              </div>
            </div>
          </div>

          <div class="bg-yellow-50 p-4 rounded-lg">
            <h3 class="font-bold text-yellow-800 mb-2">Dirección de Entrega</h3>
            <div v-if="selectedOrder.address">
              <p><span class="text-gray-500">Nombre:</span> {{ selectedOrder.address.name }}</p>
              <p>
                <span class="text-gray-500">Distrito:</span> {{ selectedOrder.address.district }}
              </p>
              <p>
                <span class="text-gray-500">Barrio:</span> {{ selectedOrder.address.neighborhood }}
              </p>
              <p>
                <span class="text-gray-500">Calle:</span> {{ selectedOrder.address.street }}
                {{ selectedOrder.address.number }}
              </p>
              <p v-if="selectedOrder.address.reference">
                <span class="text-gray-500">Referencia:</span> {{ selectedOrder.address.reference }}
              </p>
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
          <Column header="Producto" style="width: 30%">
            <template #body="slotProps">
              <div class="flex items-center">
                <div>
                  <p class="font-semibold">{{ slotProps.data.product.name }}</p>
                  <p class="text-sm text-gray-500">
                    {{ slotProps.data.presentation.amount }}
                    {{ slotProps.data.presentation.unit_measurement.abbreviation }}
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

    <!-- Diálogo de Historial de Cashback -->
    <Dialog
      v-model:visible="cashbackHistoryDialog"
      :header="`Historial de Cashback de ${selectedClient?.names || ''} ${selectedClient?.surnames || ''}`"
      :modal="true"
      :style="{ width: '60rem' }"
      :maximizable="true"
    >
      <div v-if="selectedClient" class="p-4">
        <div class="bg-green-50 p-4 rounded-lg mb-4">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold text-green-800">Cashback Actual</h2>
            <span class="text-2xl font-bold text-green-600">{{
              formatCurrency(selectedClient.current_cashback)
            }}</span>
          </div>
        </div>

        <DataTable
          :value="selectedClient.cashback_history"
          :paginator="true"
          :rows="5"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 20]"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} transacciones"
          responsiveLayout="scroll"
          class="p-datatable-sm"
          stripedRows
          rowHover
          v-if="selectedClient.cashback_history && selectedClient.cashback_history.length > 0"
        >
          <Column field="id" header="ID" sortable style="width: 10%"></Column>
          <Column
            field="transaction_code"
            header="Código de Transacción"
            sortable
            style="width: 20%"
          ></Column>
          <Column field="type" header="Tipo" sortable style="width: 15%">
            <template #body="slotProps">
              <Tag
                :value="slotProps.data.type"
                :severity="getCashbackTypeSeverity(slotProps.data.type)"
              />
            </template>
          </Column>
          <Column field="amount" header="Monto" sortable style="width: 15%">
            <template #body="slotProps">
              <span
                :class="{
                  'text-green-600': slotProps.data.type === 'EARNED',
                  'text-red-600': slotProps.data.type === 'USED'
                }"
                class="font-bold"
              >
                {{ slotProps.data.type === 'EARNED' ? '+' : '-' }}
                {{ formatCurrency(slotProps.data.amount) }}
              </span>
            </template>
          </Column>
          <Column field="created_at" header="Fecha" sortable style="width: 20%">
            <template #body="slotProps">
              {{ formatDateTime(slotProps.data.created_at) }}
            </template>
          </Column>
        </DataTable>
        <div v-else class="text-center p-4">
          <i class="pi pi-wallet text-4xl text-gray-300 mb-2"></i>
          <p class="text-gray-500">Este cliente no tiene historial de cashback.</p>
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
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import type { Client } from '@/services/clients/interfaces/client-response.interface'
import type { Order } from '@/services/order/interfaces/order-response.interface'
import * as clientService from '@/services/clients/client.service'
import type { GetClientParams } from '@/services/clients/interfaces/get-client-params.interface'

const toast = useToast()

const clients = ref<Client[]>([])
const totalRecords = ref(0)
const loading = ref(false)

const clientDetailsDialog = ref(false)
const ordersDialog = ref(false)
const orderDetailsDialog = ref(false)
const cashbackHistoryDialog = ref(false)

const selectedClient = ref<Client | null>(null)
const selectedOrder = ref<Order | null>(null)

const params = reactive<GetClientParams>({
  identity_number: '',
  names: '',
  paginate: true,
  page: 1,
  per_page: 5
})

const loadClients = async (page = 1) => {
  loading.value = true
  params.page = page

  try {
    const response = await clientService.getAll(params)

    clients.value = response.data
    totalRecords.value = response.meta.total
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los clientes',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

watch(
  () => [params.identity_number, params.names],
  () => {
    loadClients()
  }
)

const onPage = (event: DataTablePageEvent) => {
  loadClients(event.page + 1)
}

const viewClientDetails = (client: Client) => {
  selectedClient.value = client
  clientDetailsDialog.value = true
}

const viewOrders = (client: Client) => {
  selectedClient.value = client
  ordersDialog.value = true
}

const viewOrderDetails = (order: Order) => {
  selectedOrder.value = order
  orderDetailsDialog.value = true
}

const viewCashbackHistory = (client: Client) => {
  selectedClient.value = client
  cashbackHistoryDialog.value = true
}

const formatCurrency = (value: string | number) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  return numValue.toLocaleString('es-PE', {
    style: 'currency',
    currency: 'PEN'
  })
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-PE')
}

const formatDateTime = (dateString: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return (
    date.toLocaleDateString('es-PE') +
    ' ' +
    date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
  )
}

const getMembershipSeverity = (membership: string) => {
  const map: Record<string, string> = {
    BASIC: 'info',
    SILVER: 'secondary',
    GOLD: 'warning',
    PLATINUM: 'success'
  }
  return map[membership] || 'info'
}

const getOrderStatusSeverity = (status: string) => {
  const map: Record<string, string> = {
    PENDING: 'warning',
    PROCESSING: 'info',
    SHIPPED: 'info',
    DELIVERED: 'success',
    CANCELLED: 'danger'
  }
  return map[status] || 'info'
}

const getCashbackTypeSeverity = (type: string) => {
  return type === 'EARNED' ? 'success' : 'info'
}

onMounted(() => {
  loadClients()
})
</script>

<style scoped></style>
