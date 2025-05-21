<template>
  <div class="p-4">
    <div class="mb-4 flex justify-between items-center">
      <Button label="Nuevo Producto" icon="pi pi-plus" @click="openNewProductDialog" />
    </div>

    <!-- Filtros -->
    <div class="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm">
      <h2 class="text-lg font-semibold mb-3">Filtros</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <div>
          <label for="name" class="block text-sm font-medium mb-1">Nombre</label>
          <InputText id="name" v-model="params.name" class="w-full" placeholder="Buscar por nombre" />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Rango de Precio</label>
          <div class="flex gap-3">
            <InputNumber 
              v-model="params.min_price" 
              placeholder="Mínimo" 
              class="w-full" 
              :min="0"
              mode="currency"
              currency="USD"
              locale="es-SV"
            />
            <InputNumber 
              v-model="params.max_price" 
              placeholder="Máximo" 
              class="w-full" 
              :min="0"
              mode="currency"
              currency="USD"
              locale="es-SV"
            />
          </div>
        </div>
        
        <div>
          <label for="category" class="block text-sm font-medium mb-1">Categoría</label>
          <Dropdown
            id="category"
            v-model="params.category_product_id"
            :options="categories"
            optionLabel="name"
            optionValue="id"
            placeholder="Seleccione una categoría"
            class="w-full"
          />
        </div>
        
        <div>
          <label for="quality" class="block text-sm font-medium mb-1">Calidad</label>
          <Dropdown
            id="quality"
            v-model="params.quality_product_id"
            :options="qualities"
            optionLabel="name"
            optionValue="id"
            placeholder="Seleccione una calidad"
            class="w-full"
          />
        </div>
        
        <div class="flex items-end">
          <Button label="Aplicar Filtros" icon="pi pi-filter" @click="applyFilters" class="mr-2" />
          <Button label="Limpiar" icon="pi pi-times" @click="clearFilters" class="p-button-outlined" />
        </div>
      </div>
    </div>

    <!-- Tabla de Productos -->
    <DataTable
      :value="products"
      :paginator="true"
      :rows="params.per_page"
      :totalRecords="totalRecords"
      :lazy="true"
      :loading="loading"
      @page="onPage($event)"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} productos"
      responsiveLayout="scroll"
      class="p-datatable-sm"
      stripedRows
      rowHover
    >
      <Column field="id" header="ID" sortable style="width: 5%"></Column>
      <Column header="Imagen" style="width: 10%">
        <template #body="slotProps">
          <div 
            v-if="slotProps.data.images && slotProps.data.images.length > 0"
            class="w-16 h-16 relative cursor-pointer"
            @click="openImagePreview(slotProps.data.images[0])"
          >
            <img 
              :src="apiStorage + '/' + slotProps.data.images[0].url_image" 
              :alt="slotProps.data.name"
              class="w-full h-full object-contain rounded"
            />
          </div>
          <div v-else class="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
            <i class="pi pi-image text-gray-400 text-xl"></i>
          </div>
        </template>
      </Column>
      <Column field="name" header="Nombre" sortable style="width: 20%"></Column>
      <Column field="category_product.name" header="Categoría" sortable style="width: 15%"></Column>
      <Column field="quality_product.name" header="Calidad" sortable style="width: 15%"></Column>
      <Column field="manufacturer.name" header="Fabricante" sortable style="width: 15%"></Column>
      <Column field="state" header="Estado" sortable style="width: 10%">
        <template #body="slotProps">
          <Tag 
            :value="slotProps.data.state ? 'Activo' : 'Inactivo'" 
            :severity="slotProps.data.state ? 'success' : 'danger'"
          />
        </template>
      </Column>
      <Column header="Acciones" style="width: 15%">
        <template #body="slotProps">
          <div class="flex gap-1">
            <Button
              icon="pi pi-eye"
              class="p-button-rounded p-button-info p-button-sm"
              @click="viewProductDetails(slotProps.data)"
              v-tooltip.top="'Ver Detalles'"
            />
            <Button
              icon="pi pi-pencil"
              class="p-button-rounded p-button-success p-button-sm"
              @click="openEditProductDialog(slotProps.data)"
              v-tooltip.top="'Editar Producto'"
            />
            <Button
              icon="pi pi-images"
              class="p-button-rounded p-button-warning p-button-sm"
              @click="openManageImagesDialog(slotProps.data)"
              v-tooltip.top="'Gestionar Imágenes'"
            />
            <Button
              icon="pi pi-list"
              class="p-button-rounded p-button-help p-button-sm"
              @click="openManagePresentationsDialog(slotProps.data)"
              v-tooltip.top="'Gestionar Presentaciones'"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-rounded p-button-danger p-button-sm"
              @click="confirmDeleteProduct(slotProps.data)"
              v-tooltip.top="'Eliminar Producto'"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Diálogo de Detalles del Producto -->
    <Dialog
      v-model:visible="productDetailsDialog"
      :header="`Detalles del Producto: ${selectedProduct?.name || ''}`"
      :modal="true"
      :style="{ width: '80rem' }"
      :maximizable="true"
    >
      <div v-if="selectedProduct" class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Galería de imágenes -->
          <div>
            <h3 class="text-lg font-semibold mb-3">Imágenes</h3>
            <div v-if="selectedProduct.images && selectedProduct.images.length > 0" class="grid grid-cols-2 gap-2">
              <div 
                v-for="image in selectedProduct.images" 
                :key="image.id" 
                class="relative cursor-pointer"
                @click="openImagePreview(image)"
              >
                <div class="aspect-square overflow-hidden rounded-lg shadow-sm">
                  <img 
                    :src="apiStorage + '/' + image.url_image" 
                    :alt="selectedProduct.name"
                    class="w-full h-full object-contain"
                  />
                </div>
                <Tag 
                  :value="image.state ? 'Activa' : 'Inactiva'" 
                  :severity="image.state ? 'success' : 'danger'"
                  class="absolute top-2 right-2"
                />
              </div>
            </div>
            <div v-else class="bg-gray-100 rounded-lg p-8 text-center">
              <i class="pi pi-image text-gray-400 text-4xl mb-2"></i>
              <p class="text-gray-500">No hay imágenes disponibles</p>
            </div>
          </div>
          
          <!-- Información del producto -->
          <div>
            <h3 class="text-lg font-semibold mb-3">Información General</h3>
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500">Categoría</p>
                  <p class="font-semibold">{{ selectedProduct.category_product.name }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Calidad</p>
                  <p class="font-semibold">{{ selectedProduct.quality_product.name }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Fabricante</p>
                  <p class="font-semibold">{{ selectedProduct.manufacturer.name }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Estado</p>
                  <Tag 
                    :value="selectedProduct.state ? 'Activo' : 'Inactivo'" 
                    :severity="selectedProduct.state ? 'success' : 'danger'"
                  />
                </div>
              </div>
            </div>
            
            <div class="mt-4">
              <h4 class="font-medium mb-2">Descripción</h4>
              <p class="bg-white p-3 rounded-lg border border-gray-200 whitespace-pre-line">
                {{ selectedProduct.description }}
              </p>
            </div>
          </div>
        </div>
        
        <!-- Presentaciones -->
        <div>
          <h3 class="text-lg font-semibold mb-3">Presentaciones</h3>
          <DataTable
            :value="selectedProduct.presentations"
            responsiveLayout="scroll"
            class="p-datatable-sm"
            stripedRows
          >
            <Column field="id" header="ID" style="width: 5%"></Column>
            <Column header="Presentación" style="width: 30%">
              <template #body="slotProps">
                <div>
                  <p class="font-semibold">{{ slotProps.data.amount }} {{ slotProps.data.unit_measurement.abbreviation }}</p>
                  <p class="text-sm text-gray-500">{{ slotProps.data.unit_measurement.name }}</p>
                </div>
              </template>
            </Column>
            <Column header="Stock" style="width: 15%">
              <template #body="slotProps">
                {{ slotProps.data.stock }}
              </template>
            </Column>
            <Column header="Precio Unitario" style="width: 15%">
              <template #body="slotProps">
                {{ formatCurrency(Number.parseFloat(slotProps.data.unit_price)) }}
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </Dialog>

    <!-- Diálogo de Agregar/Editar Producto -->
    <Dialog
      v-model:visible="productDialog"
      :header="dialogMode === 'new' ? 'Nuevo Producto' : 'Editar Producto'"
      :modal="true"
      :style="{ width: '70rem' }"
    >
      <div class="p-4">
        <TabView>
          <!-- Información Básica -->
          <TabPanel header="Información Básica">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label for="product_name" class="block text-sm font-medium mb-1">Nombre</label>
                <InputText
                  id="product_name"
                  v-model.trim="productForm.name"
                  class="w-full"
                  :class="{ 'p-invalid': submitted && !productForm.name }"
                />
                <small class="p-error" v-if="submitted && !productForm.name">El nombre es requerido.</small>
              </div>
              
              <div>
                <label for="product_state" class="block text-sm font-medium mb-1">Estado</label>
                <Dropdown
                  id="product_state"
                  v-model="productForm.state"
                  :options="stateOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Seleccione un estado"
                  class="w-full"
                  :class="{ 'p-invalid': submitted && productForm.state === undefined }"
                />
                <small class="p-error" v-if="submitted && productForm.state === undefined">El estado es requerido.</small>
              </div>
              
              <div>
                <label for="product_category" class="block text-sm font-medium mb-1">Categoría</label>
                <Dropdown
                  id="product_category"
                  v-model="productForm.category_product_id"
                  :options="categories"
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Seleccione una categoría"
                  class="w-full"
                  :class="{ 'p-invalid': submitted && !productForm.category_product_id }"
                />
                <small class="p-error" v-if="submitted && !productForm.category_product_id">La categoría es requerida.</small>
              </div>
              
              <div>
                <label for="product_quality" class="block text-sm font-medium mb-1">Calidad</label>
                <Dropdown
                  id="product_quality"
                  v-model="productForm.quality_product_id"
                  :options="qualities"
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Seleccione una calidad"
                  class="w-full"
                  :class="{ 'p-invalid': submitted && !productForm.quality_product_id }"
                />
                <small class="p-error" v-if="submitted && !productForm.quality_product_id">La calidad es requerida.</small>
              </div>
              
              <div>
                <label for="product_manufacturer" class="block text-sm font-medium mb-1">Fabricante</label>
                <Dropdown
                  id="product_manufacturer"
                  v-model="productForm.manufacturer_id"
                  :options="manufacturers"
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Seleccione un fabricante"
                  class="w-full"
                  :class="{ 'p-invalid': submitted && !productForm.manufacturer_id }"
                />
                <small class="p-error" v-if="submitted && !productForm.manufacturer_id">El fabricante es requerido.</small>
              </div>
            </div>
            
            <div class="mb-4">
              <label for="product_description" class="block text-sm font-medium mb-1">Descripción</label>
              <Textarea
                id="product_description"
                v-model.trim="productForm.description"
                rows="5"
                class="w-full"
                :class="{ 'p-invalid': submitted && !productForm.description }"
              />
              <small class="p-error" v-if="submitted && !productForm.description">La descripción es requerida.</small>
            </div>
          </TabPanel>
          
          <!-- Presentaciones (solo para nuevo producto) -->
          <TabPanel header="Presentaciones" :disabled="dialogMode !== 'new'">
            <div v-if="dialogMode === 'new'">
              <div class="mb-4 flex justify-between items-center">
                <h3 class="text-lg font-semibold">Presentaciones del Producto</h3>
                <Button label="Agregar Presentación" icon="pi pi-plus" @click="addPresentationRow" />
              </div>
              
              <div v-if="productForm.presentations.length > 0">
                <div class="grid grid-cols-12 gap-2 font-semibold mb-2 bg-gray-100 p-2 rounded">
                  <div class="col-span-5">Presentación</div>
                  <div class="col-span-3">Stock</div>
                  <div class="col-span-3">Precio Unitario</div>
                  <div class="col-span-1">Acciones</div>
                </div>
                
                <div 
                  v-for="(presentation, index) in productForm.presentations" 
                  :key="index"
                  class="grid grid-cols-12 gap-2 items-center mb-2 p-2 border-b"
                >
                  <div class="col-span-5">
                    <Dropdown
                      v-model="presentation.id"
                      :options="availablePresentations"
                      optionLabel="label"
                      optionValue="id"
                      placeholder="Seleccione una presentación"
                      class="w-full"
                      :class="{ 'p-invalid': submitted && !presentation.id }"
                    />
                  </div>
                  <div class="col-span-3">
                    <InputNumber
                      v-model="presentation.stock"
                      placeholder="Stock"
                      class="w-full"
                      :min="0"
                      :class="{ 'p-invalid': submitted && presentation.stock === null }"
                    />
                  </div>
                  <div class="col-span-3">
                    <InputNumber
                      v-model="presentation.unit_price"
                      placeholder="Precio"
                      class="w-full"
                      :min="0"
                      mode="currency"
                      currency="USD"
                      locale="es-SV"
                      :class="{ 'p-invalid': submitted && presentation.unit_price === null }"
                    />
                  </div>
                  <div class="col-span-1">
                    <Button
                      icon="pi pi-trash"
                      class="p-button-danger p-button-sm"
                      @click="removePresentationRow(index)"
                    />
                  </div>
                </div>
              </div>
              <div v-else class="text-center p-4 bg-gray-50 rounded">
                <p class="text-gray-500">No hay presentaciones agregadas. Haga clic en "Agregar Presentación" para comenzar.</p>
              </div>
              
              <small class="p-error block mt-2" v-if="submitted && productForm.presentations.length === 0">
                Debe agregar al menos una presentación.
              </small>
            </div>
          </TabPanel>
          
          <!-- Imágenes (solo para nuevo producto) -->
          <TabPanel header="Imágenes" :disabled="dialogMode !== 'new'">
            <div v-if="dialogMode === 'new'">
              <div class="mb-4">
                <label class="block text-sm font-medium mb-2">Imágenes del Producto</label>
                <FileUpload
                  mode="advanced"
                  multiple
                  accept="image/*"
                  :maxFileSize="1000000"
                  @select="onImagesSelect"
                  @remove="onImageRemove"
                  @clear="onImagesClear"
                  :auto="true"
                  chooseLabel="Seleccionar Imágenes"
                  class="w-full"
                />
                <small class="p-error" v-if="submitted && productForm.images.length === 0">
                  Debe agregar al menos una imagen.
                </small>
              </div>
              
              <div v-if="imagesPreviews.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div 
                  v-for="(preview, index) in imagesPreviews" 
                  :key="index" 
                  class="relative cursor-pointer"
                  @click="openPreviewImageDialog(preview)"
                >
                  <div class="aspect-square overflow-hidden rounded">
                    <img :src="preview" alt="Vista previa" class="w-full h-full object-contain" />
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
        </TabView>
        
        <div class="flex justify-end gap-2 mt-6">
          <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="hideProductDialog" />
          <Button label="Guardar" icon="pi pi-check" @click="saveProduct" />
        </div>
      </div>
    </Dialog>

    <!-- Diálogo de Gestión de Imágenes -->
    <Dialog
      v-model:visible="imagesDialog"
      :header="`Gestionar Imágenes: ${selectedProduct?.name || ''}`"
      :modal="true"
      :style="{ width: '60rem' }"
    >
      <div v-if="selectedProduct" class="p-4">
        <div class="mb-4 flex justify-between items-center">
          <h3 class="text-lg font-semibold">Imágenes Actuales</h3>
          <Button label="Agregar Imágenes" icon="pi pi-plus" @click="openAddImagesDialog" />
        </div>
        
        <div v-if="selectedProduct.images && selectedProduct.images.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            v-for="image in selectedProduct.images" 
            :key="image.id" 
            class="border rounded-lg overflow-hidden bg-white shadow-sm"
          >
            <div 
              class="aspect-square cursor-pointer"
              @click="openImagePreview(image)"
            >
              <img 
                :src="apiStorage + '/' + image.url_image" 
                :alt="selectedProduct.name"
                class="w-full h-full object-contain"
              />
            </div>
            <div class="p-3 flex justify-between items-center">
              <Tag 
                :value="image.state ? 'Activa' : 'Inactiva'" 
                :severity="image.state ? 'success' : 'danger'"
              />
              <div class="flex gap-1">
                <Button
                  :icon="image.state ? 'pi pi-eye-slash' : 'pi pi-eye'"
                  :class="[
                    'p-button-rounded p-button-sm',
                    image.state ? 'p-button-warning' : 'p-button-success'
                  ]"
                  @click="toggleImageState(image)"
                  v-tooltip.top="image.state ? 'Desactivar Imagen' : 'Activar Imagen'"
                />
                <Button
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-danger p-button-sm"
                  @click="confirmDeleteImage(image)"
                  v-tooltip.top="'Eliminar Imagen'"
                />
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center p-8 bg-gray-50 rounded">
          <i class="pi pi-image text-gray-400 text-4xl mb-2"></i>
          <p class="text-gray-500">No hay imágenes disponibles para este producto.</p>
        </div>
      </div>
    </Dialog>

    <!-- Diálogo de Agregar Imágenes -->
    <Dialog
      v-model:visible="addImagesDialog"
      header="Agregar Imágenes"
      :modal="true"
      :style="{ width: '40rem' }"
    >
      <div class="p-4">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Seleccione Imágenes</label>
          <FileUpload
            mode="advanced"
            multiple
            accept="image/*"
            :maxFileSize="1000000"
            @select="onNewImagesSelect"
            @remove="onNewImageRemove"
            @clear="onNewImagesClear"
            :auto="true"
            chooseLabel="Seleccionar Imágenes"
            class="w-full"
          />
          <small class="p-error" v-if="newImagesSubmitted && newImages.length === 0">
            Debe seleccionar al menos una imagen.
          </small>
        </div>
        
        <div v-if="newImagesPreviews.length > 0" class="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          <div 
            v-for="(preview, index) in newImagesPreviews" 
            :key="index" 
            class="relative cursor-pointer"
            @click="openPreviewImageDialog(preview)"
          >
            <div class="aspect-square overflow-hidden rounded">
              <img :src="preview" alt="Vista previa" class="w-full h-full object-contain" />
            </div>
          </div>
        </div>
        
        <div class="flex justify-end gap-2 mt-6">
          <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="hideAddImagesDialog" />
          <Button label="Guardar Imágenes" icon="pi pi-check" @click="saveImages" />
        </div>
      </div>
    </Dialog>

    <!-- Diálogo de Gestión de Presentaciones -->
    <Dialog
      v-model:visible="presentationsDialog"
      :header="`Gestionar Presentaciones: ${selectedProduct?.name || ''}`"
      :modal="true"
      :style="{ width: '70rem' }"
    >
      <div v-if="selectedProduct" class="p-4">
        <div class="mb-4 flex justify-between items-center">
          <h3 class="text-lg font-semibold">Presentaciones Actuales</h3>
          <Button label="Agregar Presentación" icon="pi pi-plus" @click="openAddPresentationDialog" />
        </div>
        
        <DataTable
          :value="selectedProduct.presentations"
          responsiveLayout="scroll"
          class="p-datatable-sm"
          stripedRows
        >
          <Column field="id" header="ID" style="width: 5%"></Column>
          <Column header="Presentación" style="width: 30%">
            <template #body="slotProps">
              <div>
                <p class="font-semibold">{{ slotProps.data.amount }} {{ slotProps.data.unit_measurement.abbreviation ?? slotProps.data.unit_measurement }}</p>
              </div>
            </template>
          </Column>
          <Column header="Stock" style="width: 15%">
            <template #body="slotProps">
              {{ slotProps.data.stock }}
            </template>
          </Column>
          <Column header="Precio Unitario" style="width: 15%">
            <template #body="slotProps">
              {{ formatCurrency(Number.parseFloat(slotProps.data.unit_price)) }}
            </template>
          </Column>
          <Column header="Acciones" style="width: 15%">
            <template #body="slotProps">
              <div class="flex gap-1">
                <Button
                  icon="pi pi-pencil"
                  class="p-button-rounded p-button-success p-button-sm"
                  @click="openEditPresentationDialog(slotProps.data)"
                  v-tooltip.top="'Editar Presentación'"
                />
                <Button
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-danger p-button-sm"
                  @click="confirmDeletePresentation(slotProps.data)"
                  v-tooltip.top="'Eliminar Presentación'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </Dialog>

    <!-- Diálogo de Agregar/Editar Presentación -->
    <Dialog
      v-model:visible="presentationDialog"
      :header="presentationDialogMode === 'new' ? 'Agregar Presentación' : 'Editar Presentación'"
      :modal="true"
      :style="{ width: '40rem' }"
    >
      <div class="p-4">
        <div class="grid grid-cols-1 gap-4 mb-4">
          <div v-if="presentationDialogMode === 'new'">
            <label for="presentation_id" class="block text-sm font-medium mb-1">Presentación</label>
            <Dropdown
              id="presentation_id"
              v-model="presentationForm.presentation_id"
              :options="availablePresentationsForProduct"
              optionLabel="label"
              optionValue="id"
              placeholder="Seleccione una presentación"
              class="w-full"
              :class="{ 'p-invalid': presentationSubmitted && !presentationForm.presentation_id }"
            />
            <small class="p-error" v-if="presentationSubmitted && !presentationForm.presentation_id">
              La presentación es requerida.
            </small>
          </div>
          
          <div>
            <label for="presentation_stock" class="block text-sm font-medium mb-1">Stock</label>
            <InputNumber
              id="presentation_stock"
              v-model="presentationForm.stock"
              placeholder="Stock"
              class="w-full"
              :min="0"
              :class="{ 'p-invalid': presentationSubmitted && presentationForm.stock === null }"
            />
            <small class="p-error" v-if="presentationSubmitted && presentationForm.stock === null">
              El stock es requerido.
            </small>
          </div>
          
          <div>
            <label for="presentation_price" class="block text-sm font-medium mb-1">Precio Unitario</label>
            <InputNumber
              id="presentation_price"
              v-model="presentationForm.unit_price"
              placeholder="Precio"
              class="w-full"
              :min="0"
              mode="currency"
              currency="USD"
              locale="es-SV"
              :class="{ 'p-invalid': presentationSubmitted && presentationForm.unit_price === null }"
            />
            <small class="p-error" v-if="presentationSubmitted && presentationForm.unit_price === null">
              El precio es requerido.
            </small>
          </div>
        </div>
        
        <div class="flex justify-end gap-2 mt-6">
          <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="hidePresentationDialog" />
          <Button label="Guardar" icon="pi pi-check" @click="savePresentation" />
        </div>
      </div>
    </Dialog>

    <!-- Diálogo de Vista Previa de Imagen -->
    <Dialog
      v-model:visible="imagePreviewDialog"
      :header="imagePreviewTitle"
      :modal="true"
      :style="{ width: '80vw', maxWidth: '90rem' }"
      :maximizable="true"
      class="image-preview-dialog"
    >
      <div class="flex justify-center items-center p-4">
        <img 
          :src="previewImageSrc" 
          :alt="imagePreviewTitle"
          class="max-w-full max-h-[70vh] object-contain"
        />
      </div>
    </Dialog>

    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import DataTable, { type DataTablePageEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import FileUpload from 'primevue/fileupload'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import ConfirmDialog from 'primevue/confirmdialog'
import type { Product, ProductImage } from '@/services/products/interfaces/product-response.interface'
import type { CreateProduct, UpdateProduct, PresentationInput } from '@/services/products/interfaces/product-request.interface'
import type { CreateProductImage } from '@/services/products/interfaces/product-image-request.interface'
import type { CreateProductPresentation, UpdateProductPresentation } from '@/services/products/product-presentation-request.interface'
import type { Presentation } from '@/services/presentations/interfaces/presentation-response.interface'
import type { CategoryProduct, QualityProduct } from '@/services/catalogs/interfaces/catalogs-response.interface'
import type { Manufacturer } from '@/services/manufacturers/interfaces/manufacturer-response.interface'
import * as productService from '@/services/products/product.service'
import * as productImageService from '@/services/products/product-image.service'
import * as productPresentationService from '@/services/products/product-presentation.service'
import * as catalogService from '@/services/catalogs/catalog.service'
import * as presentationService from '@/services/presentations/presentation.service'
import * as manufacturerService from '@/services/manufacturers/manufacturer.service'
import type { GetProductParams } from '@/services/products/interfaces/get-product-params.interface'

const toast = useToast()
const confirm = useConfirm()

const products = ref<Product[]>([])
const categories = ref<CategoryProduct[]>([])
const qualities = ref<QualityProduct[]>([])
const manufacturers = ref<Manufacturer[]>([])
const allPresentations = ref<Presentation[]>([])
const totalRecords = ref(0)
const loading = ref(false)

const productDetailsDialog = ref(false)
const productDialog = ref(false)
const imagesDialog = ref(false)
const addImagesDialog = ref(false)
const presentationsDialog = ref(false)
const presentationDialog = ref(false)
const imagePreviewDialog = ref(false)
const submitted = ref(false)
const newImagesSubmitted = ref(false)
const presentationSubmitted = ref(false)
const dialogMode = ref<'new' | 'edit'>('new')
const presentationDialogMode = ref<'new' | 'edit'>('new')

const selectedProduct = ref<Product | null>(null)
const selectedPresentation = ref<Presentation | null>(null)
const imagesPreviews = ref<string[]>([])
const newImages = ref<File[]>([])
const newImagesPreviews = ref<string[]>([])
const previewImageSrc = ref<string>('')
const imagePreviewTitle = ref<string>('Vista previa de imagen')

const stateOptions = [
  { label: 'Activo', value: true },
  { label: 'Inactivo', value: false }
]

const apiStorage = import.meta.env.VITE_VUE_APP_API_STORAGE

const params = reactive<GetProductParams>({
  name: '',
  min_price: undefined,
  max_price: undefined,
  category_product_id: undefined,
  quality_product_id: undefined,
  paginate: true,
  page: 1,
  per_page: 5
})

const productForm = reactive<{
  name: string
  description: string
  state: boolean | undefined
  presentations: PresentationInput[]
  images: File[]
  category_product_id: number | null
  quality_product_id: number | null
  manufacturer_id: number | null
}>({
  name: '',
  description: '',
  state: undefined,
  presentations: [],
  images: [],
  category_product_id: null,
  quality_product_id: null,
  manufacturer_id: null
})

const presentationForm = reactive<{
  product_id: number | null
  presentation_id: number | null
  stock: number | null
  unit_price: number | null
}>({
  product_id: null,
  presentation_id: null,
  stock: null,
  unit_price: null
})

const loadCategories = async () => {
  try {
    const response = await catalogService.getCategoryProducts()
    categories.value = response.data
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las categorías',
      life: 3000
    })
  }
}

const loadQualities = async () => {
  try {
    const response = await catalogService.getQualityProducts()
    qualities.value = response.data
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las calidades',
      life: 3000
    })
  }
}

const loadManufacturers = async () => {
  try {
    const response = await manufacturerService.getAll({ paginate: false })
    manufacturers.value = response.data
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los fabricantes',
      life: 3000
    })
  }
}

const loadPresentations = async () => {
  try {
    const response = await presentationService.getAll({ paginate: false })
    allPresentations.value = response.data
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las presentaciones',
      life: 3000
    })
  }
}

const loadProducts = async (page = 1) => {
  loading.value = true
  params.page = page

  try {
    const response = await productService.getAll(params)
    products.value = response.data
    totalRecords.value = response.meta.total
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los productos',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const availablePresentations = computed(() => {
  return allPresentations.value.map(p => ({
    id: p.id,
    label: `${p.amount} ${p.unit_measurement.abbreviation} (${p.unit_measurement.name})`
  }))
})

const availablePresentationsForProduct = computed(() => {
  if (!selectedProduct.value) return []
  
  const existingPresentationIds = selectedProduct.value.presentations.map(p => p.id)
  return allPresentations.value
    .filter(p => !existingPresentationIds.includes(p.id))
    .map(p => ({
      id: p.id,
      label: `${p.amount} ${p.unit_measurement.abbreviation} (${p.unit_measurement.name})`
    }))
})

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'N/A'
  return value.toLocaleString('es-SV', {
    style: 'currency',
    currency: 'USD'
  })
}

const onPage = (event: DataTablePageEvent) => {
  loadProducts(event.page + 1)
}

const applyFilters = () => {
  if ((params.min_price !== undefined && params.max_price === undefined) || 
      (params.min_price === undefined && params.max_price !== undefined)) {
    toast.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'Debe especificar ambos valores del rango de precio',
      life: 3000
    })
    return
  }
  
  if (params.min_price !== undefined && params.max_price !== undefined && params.min_price > params.max_price) {
    toast.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'El precio mínimo no puede ser mayor que el precio máximo',
      life: 3000
    })
    return
  }
  
  loadProducts()
}

const clearFilters = () => {
  params.name = ''
  params.min_price = undefined
  params.max_price = undefined
  params.category_product_id = undefined
  params.quality_product_id = undefined
  loadProducts()
}

const openImagePreview = (image: ProductImage) => {
  previewImageSrc.value = apiStorage + '/' + image.url_image
  imagePreviewTitle.value = 'Vista previa de imagen'
  imagePreviewDialog.value = true
}

const openPreviewImageDialog = (imageSrc: string) => {
  previewImageSrc.value = imageSrc
  imagePreviewTitle.value = 'Vista previa de imagen'
  imagePreviewDialog.value = true
}

const viewProductDetails = (product: Product) => {
  selectedProduct.value = product
  productDetailsDialog.value = true
}

const openNewProductDialog = () => {
  productForm.name = ''
  productForm.description = ''
  productForm.state = undefined
  productForm.presentations = []
  productForm.images = []
  productForm.category_product_id = null
  productForm.quality_product_id = null
  productForm.manufacturer_id = null
  imagesPreviews.value = []
  submitted.value = false
  dialogMode.value = 'new'
  productDialog.value = true
}

const openEditProductDialog = (product: Product) => {
  selectedProduct.value = product
  productForm.name = product.name
  productForm.description = product.description
  productForm.state = product.state
  productForm.category_product_id = product.category_product.id
  productForm.quality_product_id = product.quality_product.id
  productForm.manufacturer_id = product.manufacturer.id
  productForm.presentations = []
  productForm.images = []
  imagesPreviews.value = []
  submitted.value = false
  dialogMode.value = 'edit'
  productDialog.value = true
}

const hideProductDialog = () => {
  productDialog.value = false
  submitted.value = false
}

const onImagesSelect = (event: any) => {
  const files = event.files
  if (files) {
    for (let file of files) {
      productForm.images.push(file)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        imagesPreviews.value.push(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
}

const onImageRemove = (event: any) => {
  const file = event.file
  const index = productForm.images.findIndex(f => f.name === file.name && f.size === file.size)
  if (index !== -1) {
    productForm.images.splice(index, 1)
    imagesPreviews.value.splice(index, 1)
  }
}

const onImagesClear = () => {
  productForm.images = []
  imagesPreviews.value = []
}

const addPresentationRow = () => {
  productForm.presentations.push({
    id: 0,
    stock: 0,
    unit_price: 0
  })
}

const removePresentationRow = (index: number) => {
  productForm.presentations.splice(index, 1)
}

const saveProduct = async () => {
  submitted.value = true

  if (!productForm.name || !productForm.description || productForm.state === undefined ||
      !productForm.category_product_id || !productForm.quality_product_id || !productForm.manufacturer_id) {
    return
  }
  
  if (dialogMode.value === 'new') {
    if (productForm.presentations.length === 0) {
      return
    }
    
    if (productForm.images.length === 0) {
      return
    }
    
    for (const presentation of productForm.presentations) {
      if (!presentation.id || presentation.stock === null || presentation.unit_price === null) {
        return
      }
    }
  }

  try {
    if (dialogMode.value === 'new') {
      const requestData: CreateProduct = {
        name: productForm.name,
        description: productForm.description,
        state: productForm.state,
        presentations: productForm.presentations,
        images: productForm.images,
        category_product_id: productForm.category_product_id!,
        quality_product_id: productForm.quality_product_id!,
        manufacturer_id: productForm.manufacturer_id!
      }
      
      await productService.create(requestData)
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Producto creado', life: 3000 })
    } else if (selectedProduct.value) {
      const requestData: UpdateProduct = {
        name: productForm.name,
        description: productForm.description,
        state: productForm.state,
        category_product_id: productForm.category_product_id!,
        quality_product_id: productForm.quality_product_id!,
        manufacturer_id: productForm.manufacturer_id!
      }
      
      await productService.update(selectedProduct.value.id, requestData)
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Producto actualizado', life: 3000 })
    }
    
    productDialog.value = false
    loadProducts()
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'No se pudo guardar el producto',
      life: 3000
    })
  }
}

const confirmDeleteProduct = (product: Product) => {
  confirm.require({
    message: '¿Está seguro que desea eliminar este producto?',
    header: 'Confirmar',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteProduct(product.id)
  })
}

const deleteProduct = async (id: number) => {
  try {
    await productService.destroy(id)
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Producto eliminado', life: 3000 })
    loadProducts()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar el producto',
      life: 3000
    })
  }
}

const openManageImagesDialog = (product: Product) => {
  selectedProduct.value = product
  imagesDialog.value = true
}

const openAddImagesDialog = () => {
  newImages.value = []
  newImagesPreviews.value = []
  newImagesSubmitted.value = false
  addImagesDialog.value = true
}

const hideAddImagesDialog = () => {
  addImagesDialog.value = false
  newImagesSubmitted.value = false
}

const onNewImagesSelect = (event: any) => {
  const files = event.files
  if (files) {
    for (let file of files) {
      newImages.value.push(file)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        newImagesPreviews.value.push(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
}

const onNewImageRemove = (event: any) => {
  const file = event.file
  const index = newImages.value.findIndex(f => f.name === file.name && f.size === file.size)
  if (index !== -1) {
    newImages.value.splice(index, 1)
    newImagesPreviews.value.splice(index, 1)
  }
}

const onNewImagesClear = () => {
  newImages.value = []
  newImagesPreviews.value = []
}

const saveImages = async () => {
  newImagesSubmitted.value = true
  
  if (newImages.value.length === 0 || !selectedProduct.value) {
    return
  }
  
  try {
    const requestData: CreateProductImage = {
      product_id: selectedProduct.value.id,
      images: newImages.value
    }
    
    await productImageService.create(requestData)
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Imágenes agregadas', life: 3000 })
    
    const updatedProducts = await productService.getAll({ 
      paginate: false,
      page: 1,
      per_page: 1,
      name: selectedProduct.value.name
    })
    const updatedProduct = updatedProducts.data.find(p => p.id === selectedProduct.value?.id)
    if (updatedProduct) {
      selectedProduct.value = updatedProduct
      
      const index = products.value.findIndex(p => p.id === updatedProduct.id)
      if (index !== -1) {
        products.value[index] = updatedProduct
      }
    }
    
    addImagesDialog.value = false
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron guardar las imágenes',
      life: 3000
    })
  }
}

const toggleImageState = async (image: ProductImage) => {
  try {
    await productImageService.changeState(image.id)
    
    if (selectedProduct.value) {
      const index = selectedProduct.value.images.findIndex(i => i.id === image.id)
      if (index !== -1) {
        selectedProduct.value.images[index].state = !selectedProduct.value.images[index].state
      }
    }
    
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `Imagen ${image.state ? 'desactivada' : 'activada'}`,
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo cambiar el estado de la imagen',
      life: 3000
    })
  }
}

const confirmDeleteImage = (image: ProductImage) => {
  confirm.require({
    message: '¿Está seguro que desea eliminar esta imagen?',
    header: 'Confirmar',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteImage(image.id)
  })
}

const deleteImage = async (id: number) => {
  try {
    await productImageService.destroy(id)
    
    if (selectedProduct.value) {
      selectedProduct.value.images = selectedProduct.value.images.filter(i => i.id !== id)
      
      const index = products.value.findIndex(p => p.id === selectedProduct.value?.id)
      if (index !== -1) {
        products.value[index].images = products.value[index].images.filter(i => i.id !== id)
      }
    }
    
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Imagen eliminada', life: 3000 })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar la imagen',
      life: 3000
    })
  }
}

const openManagePresentationsDialog = (product: Product) => {
  selectedProduct.value = product
  presentationsDialog.value = true
}

const openAddPresentationDialog = () => {
  if (!selectedProduct.value) return
  
  presentationForm.product_id = selectedProduct.value.id
  presentationForm.presentation_id = null
  presentationForm.stock = null
  presentationForm.unit_price = null
  presentationSubmitted.value = false
  presentationDialogMode.value = 'new'
  presentationDialog.value = true
}

const openEditPresentationDialog = (presentation: Presentation) => {
  if (!selectedProduct.value) return
  
  selectedPresentation.value = presentation
  presentationForm.product_id = selectedProduct.value.id
  presentationForm.presentation_id = presentation.id
  
  presentationForm.stock = presentation.stock ? Number(presentation.stock) : null
  presentationForm.unit_price = presentation.unit_price ? Number(presentation.unit_price) : null
  
  presentationSubmitted.value = false
  presentationDialogMode.value = 'edit'
  presentationDialog.value = true
}

const hidePresentationDialog = () => {
  presentationDialog.value = false
  presentationSubmitted.value = false
}

const savePresentation = async () => {
  presentationSubmitted.value = true
  
  if (!presentationForm.product_id || 
      (presentationDialogMode.value === 'new' && !presentationForm.presentation_id) ||
      presentationForm.stock === null || 
      presentationForm.unit_price === null) {
    return
  }
  
  try {
    if (presentationDialogMode.value === 'new') {
      const requestData: CreateProductPresentation = {
        product_id: presentationForm.product_id,
        presentation_id: presentationForm.presentation_id!,
        stock: presentationForm.stock,
        unit_price: presentationForm.unit_price
      }
      
      await productPresentationService.create(requestData)
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Presentación agregada', life: 3000 })
      
      if (selectedProduct.value) {
        const presentation = allPresentations.value.find(p => p.id === presentationForm.presentation_id)
        if (presentation) {
          const newPresentation = { 
            ...presentation,
            stock: presentationForm.stock,
            unit_price: presentationForm.unit_price
          }
          
          selectedProduct.value.presentations.push(newPresentation)
        }
      }
    } else if (selectedPresentation.value && selectedProduct.value) {
      const requestData: UpdateProductPresentation = {
        stock: presentationForm.stock,
        unit_price: presentationForm.unit_price
      }
      
      await productPresentationService.update(
        presentationForm.product_id,
        selectedPresentation.value.id,
        requestData
      )
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Presentación actualizada', life: 3000 })
      
      const index = selectedProduct.value.presentations.findIndex(p => p.id === selectedPresentation.value?.id)
      if (index !== -1) {
        selectedProduct.value.presentations[index].stock = presentationForm.stock
        selectedProduct.value.presentations[index].unit_price = presentationForm.unit_price
      }
    }
    
    presentationDialog.value = false
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo guardar la presentación',
      life: 3000
    })
  }
}

const confirmDeletePresentation = (presentation: Presentation) => {
  if (!selectedProduct.value) return
  
  confirm.require({
    message: '¿Está seguro que desea eliminar esta presentación?',
    header: 'Confirmar',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deletePresentation(selectedProduct.value!.id, presentation.id)
  })
}

const deletePresentation = async (productId: number, presentationId: number) => {
  try {
    await productPresentationService.destroy(productId, presentationId)
    
    if (selectedProduct.value) {
      selectedProduct.value.presentations = selectedProduct.value.presentations.filter(p => p.id !== presentationId)
    }
    
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Presentación eliminada', life: 3000 })
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
  loadCategories()
  loadQualities()
  loadManufacturers()
  loadPresentations()
  loadProducts()
})
</script>

<style scoped>
.whitespace-pre-line {
  white-space: pre-line;
}

img.max-w-xs {
  max-width: 20rem;
}

:deep(.p-inputnumber) {
  width: 100%;
}

:deep(.p-button-sm .pi) {
  font-size: 0.875rem;
}

:deep(.image-preview-dialog .p-dialog-content) {
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
}

.aspect-square {
  aspect-ratio: 1 / 1;
}
</style>