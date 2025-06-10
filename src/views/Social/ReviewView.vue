<template>
  <div class="p-4">
    <div class="mb-4 flex justify-between items-center">
      <Button label="Nueva Review" icon="pi pi-plus" @click="openNewReviewDialog" />
    </div>

    <div class="mb-4">
      <div class="flex items-center gap-4">
        <label for="comments_available" class="font-medium">Estado de Comentarios:</label>
        <Dropdown
          id="comments_available"
          v-model="params.comments_available"
          :options="commentStatusOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Seleccione un estado"
          class="w-64"
        />
      </div>
    </div>

    <DataTable
      :value="reviews"
      :paginator="true"
      :rows="params.per_page"
      :totalRecords="totalRecords"
      :lazy="true"
      :loading="loading"
      @page="onPage($event)"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[10, 20, 50]"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} reviews"
      responsiveLayout="scroll"
      class="p-datatable-sm"
      stripedRows
      rowHover
    >
      <Column field="id" header="ID" sortable style="width: 5%"></Column>
      <Column field="title" header="Título" sortable style="width: 20%"></Column>
      <Column field="username" header="Autor" sortable style="width: 15%"></Column>
      <Column field="comments_available" header="Comentarios" sortable style="width: 10%">
        <template #body="slotProps">
          <Tag 
            :value="slotProps.data.comments_available ? 'Habilitados' : 'Deshabilitados'" 
            :severity="slotProps.data.comments_available ? 'success' : 'danger'"
          />
        </template>
      </Column>
      <Column header="Acciones" style="width: 20%">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button
              icon="pi pi-eye"
              class="p-button-rounded p-button-info p-button-sm"
              @click="viewReviewDetails(slotProps.data)"
              v-tooltip.top="'Ver Detalles'"
            />
            <Button
              icon="pi pi-pencil"
              class="p-button-rounded p-button-success p-button-sm"
              @click="openEditReviewDialog(slotProps.data)"
              v-tooltip.top="'Editar Review'"
            />
            <Button
              :icon="slotProps.data.comments_available ? 'pi pi-check' : 'pi pi-ban'"
              :class="[
                'p-button-rounded p-button-sm',
                slotProps.data.comments_available ? 'p-button-warning' : 'p-button-success'
              ]"
              @click="toggleCommentsAvailability(slotProps.data)"
              v-tooltip.top="slotProps.data.comments_available ? 'Deshabilitar Comentarios' : 'Habilitar Comentarios'"
            />
            <Button
              icon="pi pi-comments"
              class="p-button-rounded p-button-help p-button-sm"
              @click="viewComments(slotProps.data)"
              v-tooltip.top="'Ver Comentarios'"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-rounded p-button-danger p-button-sm"
              @click="confirmDeleteReview(slotProps.data)"
              v-tooltip.top="'Eliminar Review'"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Diálogo de Detalles de Review -->
    <Dialog
      v-model:visible="reviewDetailsDialog"
      :header="`Detalles de la Review: ${selectedReview?.title || ''}`"
      :modal="true"
      :style="{ width: '70rem' }"
      :maximizable="true"
    >
      <div v-if="selectedReview" class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <img 
              :src="apiStorage + '/' + selectedReview.cover_image" 
              :alt="selectedReview.title"
              class="w-full h-auto rounded-lg shadow-md"
            />
          </div>
          <div>
            <h2 class="text-2xl font-bold mb-4">{{ selectedReview.title }}</h2>
            <p class="text-sm text-gray-500 mb-4">Autor: <span class="font-semibold">{{ selectedReview.username }}</span></p>
            <div class="flex items-center mb-6">
              <span class="mr-2">Estado de comentarios:</span>
              <Tag 
                :value="selectedReview.comments_available ? 'Habilitados' : 'Deshabilitados'" 
                :severity="selectedReview.comments_available ? 'success' : 'danger'"
              />
            </div>
            <div class="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 class="text-lg font-semibold mb-2">Contenido</h3>
              <p class="whitespace-pre-line">{{ selectedReview.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </Dialog>

    <!-- Diálogo de Comentarios -->
    <Dialog
      v-model:visible="commentsDialog"
      :header="`Comentarios de: ${selectedReview?.title || ''}`"
      :modal="true"
      :style="{ width: '60rem' }"
      :maximizable="true"
    >
      <div v-if="selectedReview" class="p-4">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold">Lista de Comentarios</h3>
          <Tag 
            :value="selectedReview.comments_available ? 'Comentarios Habilitados' : 'Comentarios Deshabilitados'" 
            :severity="selectedReview.comments_available ? 'success' : 'danger'"
          />
        </div>
        
        <DataTable
          :value="comments"
          :paginator="true"
          :rows="5"
          :totalRecords="commentsTotalRecords"
          :lazy="true"
          :loading="commentsLoading"
          @page="onCommentsPage($event)"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 20]"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} comentarios"
          responsiveLayout="scroll"
          class="p-datatable-sm"
          stripedRows
          rowHover
          v-if="comments.length > 0"
        >
          <Column field="id" header="ID" sortable style="width: 5%"></Column>
          <Column field="by" header="Autor" sortable style="width: 15%"></Column>
          <Column field="content" header="Contenido" style="width: 50%"></Column>
          <Column field="banned" header="Estado" sortable style="width: 10%">
            <template #body="slotProps">
              <Tag 
                :value="slotProps.data.banned ? 'Baneado' : 'Activo'" 
                :severity="slotProps.data.banned ? 'danger' : 'success'"
              />
            </template>
          </Column>
          <Column header="Acciones" style="width: 20%">
            <template #body="slotProps">
              <Button
                :icon="slotProps.data.banned ? 'pi pi-ban' : 'pi pi-check'"
                :class="[
                  'p-button-rounded p-button-sm',
                  slotProps.data.banned ? 'p-button-danger' : 'p-button-success'
                ]"
                @click="toggleCommentBan(slotProps.data)"
                v-tooltip.top="slotProps.data.banned ? 'Desbanear Comentario' : 'Banear Comentario'"
              />
            </template>
          </Column>
        </DataTable>
        <div v-else class="text-center p-4">
          <i class="pi pi-comments text-4xl text-gray-300 mb-2"></i>
          <p class="text-gray-500">No hay comentarios para esta review.</p>
        </div>
      </div>
    </Dialog>

    <!-- Diálogo de Agregar/Editar Review -->
    <Dialog
      v-model:visible="reviewDialog"
      :header="dialogMode === 'new' ? 'Nueva Review' : 'Editar Review'"
      :modal="true"
      :style="{ width: '50rem' }"
    >
      <div class="p-4">
        <div class="mb-4">
          <label for="title" class="block text-sm font-medium mb-1">Título</label>
          <InputText
            id="title"
            v-model.trim="reviewForm.title"
            class="w-full"
            :class="{ 'p-invalid': submitted && !reviewForm.title }"
          />
          <small class="p-error" v-if="submitted && !reviewForm.title">El título es requerido.</small>
        </div>
        
        <div class="mb-4">
          <label for="content" class="block text-sm font-medium mb-1">Contenido</label>
          <Textarea
            id="content"
            v-model.trim="reviewForm.content"
            rows="5"
            class="w-full"
            :class="{ 'p-invalid': submitted && !reviewForm.content }"
          />
          <small class="p-error" v-if="submitted && !reviewForm.content">El contenido es requerido.</small>
        </div>
        
        <div class="mb-4">
          <label for="cover_image" class="block text-sm font-medium mb-1">Imagen de Portada</label>
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-4">
              <FileUpload
                mode="basic"
                :auto="true"
                accept="image/*"
                :maxFileSize="5000000"
                @select="onImageSelect"
                @error="onImageError"
                chooseLabel="Seleccionar Imagen"
                class="w-full"
              />
            </div>
            <small class="p-error" v-if="submitted && !reviewForm.cover_image">La imagen es requerida.</small>
            
            <div v-if="imagePreview" class="mt-2">
              <p class="text-sm mb-1">Vista previa:</p>
              <img :src="imagePreview" alt="Vista previa" class="max-w-xs max-h-40 object-cover rounded" />
            </div>
            <div v-else-if="selectedReview && selectedReview.cover_image && dialogMode === 'edit'" class="mt-2">
              <p class="text-sm mb-1">Imagen actual:</p>
              <img :src="apiStorage + '/' + selectedReview.cover_image" alt="Imagen actual" class="max-w-xs max-h-40 object-cover rounded" />
              <p class="text-xs text-gray-500 mt-1">Seleccione una nueva imagen para reemplazar la actual.</p>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end gap-2 mt-6">
          <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
          <Button label="Guardar" icon="pi pi-check" @click="saveReview" />
        </div>
      </div>
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
import Dropdown from 'primevue/dropdown'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import FileUpload from 'primevue/fileupload'
import ConfirmDialog from 'primevue/confirmdialog'
import type { Review, Comment } from '@/services/review/interfaces/review-response.interface'
import type { CreateReview, UpdateReview } from '@/services/review/interfaces/review-request.interface'
import * as reviewService from '@/services/review/review.service'
import type { GetReviewParams, GetCommentParams } from '@/services/review/interfaces/get-review-params.interface'

const toast = useToast()
const confirm = useConfirm()

const reviews = ref<Review[]>([])
const comments = ref<Comment[]>([])
const totalRecords = ref(0)
const commentsTotalRecords = ref(0)
const loading = ref(false)
const commentsLoading = ref(false)

const reviewDetailsDialog = ref(false)
const commentsDialog = ref(false)
const reviewDialog = ref(false)
const submitted = ref(false)
const dialogMode = ref<'new' | 'edit'>('new')

const selectedReview = ref<Review | null>(null)
const imagePreview = ref<string | null>(null)

const apiStorage = import.meta.env.VITE_VUE_APP_API_STORAGE

const commentStatusOptions = [
  { label: 'Todos', value: undefined },
  { label: 'Habilitados', value: true },
  { label: 'Deshabilitados', value: false }
]

const params = reactive<GetReviewParams>({
  comments_available: undefined,
  paginate: true,
  page: 1,
  per_page: 10
})

const commentsParams = reactive<GetCommentParams>({
  paginate: true,
  page: 1,
  per_page: 5
})

const reviewForm = reactive<{
  title: string
  content: string
  cover_image: File | null
}>({
  title: '',
  content: '',
  cover_image: null
})

const loadReviews = async (page = 1) => {
  loading.value = true
  params.page = page

  try {
    const response = await reviewService.getAll(params)
    reviews.value = response.data
    totalRecords.value = response.meta.total
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las reviews',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const loadComments = async (reviewId: number, page = 1) => {
  if (!reviewId) return
  
  commentsLoading.value = true
  commentsParams.page = page

  try {
    const response = await reviewService.getComments(reviewId, commentsParams)
    comments.value = response.data
    commentsTotalRecords.value = response.meta.total
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los comentarios',
      life: 3000
    })
  } finally {
    commentsLoading.value = false
  }
}

watch(
  () => params.comments_available,
  () => {
    loadReviews()
  }
)

const onPage = (event: DataTablePageEvent) => {
  loadReviews(event.page + 1)
}

const onCommentsPage = (event: DataTablePageEvent) => {
  if (selectedReview.value) {
    loadComments(selectedReview.value.id, event.page + 1)
  }
}

const viewReviewDetails = (review: Review) => {
  selectedReview.value = review
  reviewDetailsDialog.value = true
}

const openNewReviewDialog = () => {
  reviewForm.title = ''
  reviewForm.content = ''
  reviewForm.cover_image = null
  imagePreview.value = null
  submitted.value = false
  dialogMode.value = 'new'
  reviewDialog.value = true
}

const openEditReviewDialog = (review: Review) => {
  selectedReview.value = review
  reviewForm.title = review.title
  reviewForm.content = review.content
  reviewForm.cover_image = null
  imagePreview.value = null
  submitted.value = false
  dialogMode.value = 'edit'
  reviewDialog.value = true
}

const hideDialog = () => {
  reviewDialog.value = false
  submitted.value = false
}

const onImageSelect = (event: any) => {
  const file = event.files[0]
  if (file) {
    reviewForm.cover_image = file
    
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const onImageError = (event: any) => {
  toast.add({
    severity: 'error',
    summary: 'Error',
    detail: event.message,
    life: 3000
  })
}

const saveReview = async () => {
  submitted.value = true

  if (reviewForm.title && reviewForm.content && (reviewForm.cover_image || (dialogMode.value === 'edit' && selectedReview.value))) {
    try {
      if (dialogMode.value === 'edit' && !reviewForm.cover_image && selectedReview.value) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Por favor seleccione una nueva imagen para actualizar la review',
          life: 3000
        })
        return
      }

      const requestData: CreateReview | UpdateReview = {
        title: reviewForm.title,
        content: reviewForm.content,
        cover_image: reviewForm.cover_image as File
      }
      
      if (dialogMode.value === 'new') {
        await reviewService.create(requestData as CreateReview)
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Review creada', life: 3000 })
      } else if (selectedReview.value) {
        await reviewService.update(selectedReview.value.id, requestData as UpdateReview)
        toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Review actualizada',
          life: 3000
        })
      }
      
      reviewDialog.value = false
      loadReviews()
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'No se pudo guardar la review',
        life: 3000
      })
    }
  }
}

const confirmDeleteReview = (review: Review) => {
  confirm.require({
    message: '¿Está seguro que desea eliminar esta review?',
    header: 'Confirmar',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteReview(review.id)
  })
}

const deleteReview = async (id: number) => {
  try {
    await reviewService.destroy(id)
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Review eliminada', life: 3000 })
    loadReviews()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar la review',
      life: 3000
    })
  }
}

const toggleCommentsAvailability = async (review: Review) => {
  try {
    await reviewService.changeState(review.id)
    
    const index = reviews.value.findIndex(r => r.id === review.id)
    if (index !== -1) {
      reviews.value[index].comments_available = !reviews.value[index].comments_available
    }
    
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `Comentarios ${review.comments_available ? 'deshabilitados' : 'habilitados'}`,
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo cambiar el estado de los comentarios',
      life: 3000
    })
  }
}

const viewComments = (review: Review) => {
  selectedReview.value = review
  commentsDialog.value = true
  loadComments(review.id)
}

const toggleCommentBan = async (comment: Comment) => {
  try {
    await reviewService.changeCommentState(comment.id)
    
    // Actualizar el estado en la lista local
    const index = comments.value.findIndex(c => c.id === comment.id)
    if (index !== -1) {
      comments.value[index].banned = !comments.value[index].banned
    }
    
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `Comentario ${comment.banned ? 'baneado' : 'desbaneado'}`,
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo cambiar el estado del comentario',
      life: 3000
    })
  }
}

onMounted(() => {
  loadReviews()
})
</script>

<style scoped>
/* Estilos para el contenido de la review (preservar saltos de línea) */
.whitespace-pre-line {
  white-space: pre-line;
}

/* Asegurar que las imágenes de vista previa no sean demasiado grandes */
img.max-w-xs {
  max-width: 20rem;
}
</style>