<!-- eslint-disable sonarjs/no-identical-functions -->
<!-- eslint-disable sonarjs/no-redundant-boolean -->
<!-- eslint-disable camelcase -->
<script setup>
const router = useRouter()
const searchPets = ref(null)
const searchVets = ref(null)
const specie = ref(null)
const species = ref(['Perro', 'Gato', 'Hámster', 'Loro', 'Tortuga', 'Vaca', 'Caballo', 'Cuy', 'Toro'])

const type_services = ref([
  {
    id: 1,
    name: 'Citas medicas',
  },
  {
    id: 2,
    name: 'Vacunas',
  },
  {
    id: 3,
    name: 'Cirugías',
  },
])

const payments = ref([])
const currentPage = ref(1)
const totalPage = ref(1)
const medical_record_selected_deleted = ref(null)
const isDeletePaymentDialogVisible = ref(false)
const isAddPaymentDialogVisible = ref(false)
const isEditPaymentDialogVisible = ref(false)
const loading = ref(false) 
const errorMessage = ref(null)

const dateRange = ref(null)
const type_date = ref(1)
const state_pay = ref(null)
const state_vaccination = ref(null)
const type_service = ref(null)

const medical_record_selected = ref(null)
const payment_edit_selected = ref(null)
const payment_delete_selected = ref(null)

const list = async() => {
  loading.value = true 
  errorMessage.value = null

  let data = {
    type_date: type_date.value,
    start_date: dateRange.value ? dateRange.value.split("to")[0] : null,
    end_date: dateRange.value ? dateRange.value.split("to")[1] : null,
    state_pay: state_pay.value,
    state: state_vaccination.value,
    specie: specie.value,
    search_pets: searchPets.value,
    search_vets: searchVets.value,
    type_service: type_service.value,
  }

  try{
    const resp =  await $api('/payments/index?page='+currentPage.value
      , {
        method: 'POST',
        body: data,
      })

    totalPage.value = resp.total_page
    payments.value = resp.medical_records.data
  } catch (error) {
    errorMessage.value = "Ocurrió un error en el servidor." 
  } finally {
    loading.value = false
  }
}

const downloadExcel = () => {
  let LINK = ""
  if(dateRange.value){
    LINK += "&type_date="+type_date.value
    LINK += "&start_date="+dateRange.value.split("to")[0] 
    LINK += "&end_date="+dateRange.value.split("to")[1] 
  }
  if(state_pay.value){
    LINK += "&state_pay="+state_pay.value
  }
  if(state_vaccination.value){
    LINK += "&state="+state_vaccination.value
  }
  if(specie.value){
    LINK += "&specie="+specie.value
  }
  if(searchPets.value){
    LINK += "&search_pets="+searchPets.value
  }
  if(searchVets.value){
    LINK += "&search_vets="+searchVets.value
  }
  if(type_service.value){
    LINK += "&type_service="+type_service.value
  }
  window.open(import.meta.env.VITE_API_BASE_URL+"/payments-excel?k=1"+LINK, "_blank")
}

const deleteItem = (item, payment) => {
  medical_record_selected_deleted.value = item
  isDeletePaymentDialogVisible.value = true
  payment_delete_selected.value = payment
}

const deletePayment = updatedMedicalRecord => {
  let INDEX = payments.value.findIndex(payment => payment.id == updatedMedicalRecord.id)
  if(INDEX != -1){
    updatedMedicalRecord.is_view = true
    payments.value[INDEX]=updatedMedicalRecord
  }
}

const reset = () => {
  searchPets.value = null
  searchVets.value = null
  specie.value = null
  dateRange.value = null
  state_pay.value = null
  state_vaccination.value = null
  type_date.value = 1
  currentPage.value = 1
  type_service.value = null
  list()
}

const avatarText = value => {
  if (!value)
    return ''
  const nameArray = value.split(' ')
        
  return nameArray.map(word => word.charAt(0).toUpperCase()).join('')
}

const addPayment = updatedMedicalRecord => {
  console.log(updatedMedicalRecord)
  let INDEX = payments.value.findIndex(item => item.id == updatedMedicalRecord.id)
  if(INDEX != -1){
    updatedMedicalRecord.is_view = true
    payments.value[INDEX] = updatedMedicalRecord
  }
}

const createPayment = item => {
  isAddPaymentDialogVisible.value = true
  medical_record_selected.value = item
}

const editPayment = (item, payment) => {
  isEditPaymentDialogVisible.value = true
  payment_edit_selected.value = payment
  medical_record_selected.value = item
}

const updatedPayment = updatedMedicalRecord => {
  console.log(updatedMedicalRecord)
  let INDEX = payments.value.findIndex(item => item.id == updatedMedicalRecord.id)
  if(INDEX != -1){
    updatedMedicalRecord.is_view = true
    payments.value[INDEX] = updatedMedicalRecord
  }
}

watch(currentPage, val => {
  console.log(val)
  list()
})
watch(isDeletePaymentDialogVisible, val => {
  if(val == false){
    medical_record_selected_deleted.value = null
    payment_delete_selected.value = null
  }
})
watch(isAddPaymentDialogVisible, val => {
  if(val == false){
    medical_record_selected.value = null
  }
})
watch(isEditPaymentDialogVisible, val => {
  if(val == false){
    medical_record_selected.value = null
  }
})
onMounted(() => {
  list()
})
definePage({
  meta: {
    permisssion: 'show_payment',
  },
})
</script>

<template>
  <div>
    <VCard title="💵 Pagos">
      <VCardText class="d-flex flex-wrap gap-4">
        <VRow>
          <VCol cols="3">
            <VSelect
              v-model="type_service"
              :items="type_services"
              label="Tipo de servicio"
              item-title="name"
              item-value="id"
              placeholder="Selecione tipo"
              eager
            />
          </VCol>
          <VCol cols="2">
            <VSelect
              v-model="type_date"
              :items="[
                {
                  name: 'Fecha del servicio',
                  id: 1,
                },
                {
                  name: 'Fecha de registro',
                  id: 2,
                },
              ]"
              label="Tipo de Fecha"
              item-title="name"
              item-value="id"
              eager
            />
          </VCol>
          <VCol cols="2">
            <AppDateTimePicker
              v-model="dateRange"
              label="Fecha del servicio o registro"
              placeholder="Seleccione fecha"
              :config="{ mode: 'range' }"
            />
          </VCol>
          <VCol cols="2">
            <VSelect
              v-model="specie"
              :items="species"
              label="Especie"
              item-title="name"
              item-value="id"
              placeholder="Selecione Especie"
              eager
            />
          </VCol>
                    
          <VCol cols="2">
            <div class="d-flex">
              <VBtn
                color="info"
                class="mx-1"
                prepend-icon="ri-search-2-line"
                @click="list"
              />
              <VBtn
                color="secondary"
                class="mx-1"
                prepend-icon="ri-restart-line"
                @click="reset"
              />
              <VBtn
                color="success"
                class="mx-1"
                prepend-icon="ri-file-excel-2-line"
                @click="downloadExcel"
              />
            </div>
          </VCol>

          <VCol cols="3">
            <VSelect
              v-model="state_vaccination"
              :items="[
                { name: 'Pendiente', id: 1 },
                { name: 'Cancelado', id: 2 },
                { name: 'Atendido', id: 3 },
              ]"
              label="Estado del servicio"
              item-title="name"
              item-value="id"
              placeholder="Seleccione estado"
              eager
            />
          </VCol>
          <VCol cols="2">
            <VSelect
              v-model="state_pay"
              :items="[
                { name: 'Pendiente', id: 1 },
                { name: 'Parcial', id: 2 },
                { name: 'Completo', id: 3 },
              ]"
              label="Estado de pago"
              item-title="name"
              item-value="id"
              placeholder="Seleccione estado"
              eager
            />
          </VCol>

          
          <VCol cols="3">
            <VTextField
              v-model="searchPets"
              placeholder="Burcar mascota"
              density="compact"
              class="me-3"
              @keyup.enter="list"
            />
          </VCol>
          <VCol cols="3">
            <VTextField
              v-model="searchVets"
              placeholder="Buscar Veterinario"
              density="compact"
              class="me-3"
              @keyup.enter="list"
            />
          </VCol>
        </VRow>
      </VCardText>

      <VCardText class="pa-5">
        <VTable>
          <thead>
            <tr>
              <th class="text-uppercase">
                Mascota
              </th>
              <th class="text-uppercase">
                Especie
              </th>
              <th class="text-uppercase">
                Fecha del servicio
              </th>
              <th class="text-uppercase">
                Tipo de servicio
              </th>
              <th class="text-uppercase">
                Veterinario
              </th>
              <th class="text-uppercase">
                Costo
              </th>
              <th class="text-uppercase">
                Monto cancelado
              </th>
              <th class="text-uppercase">
                Estado de pago
              </th>
              <th class="text-uppercase">
                Acción
              </th>
            </tr>
          </thead>
    
          <tbody>
            <template
              v-for="item in payments"
              :key="item.id"
            >
              <tr>
                <td>
                  <div class="d-flex align-center">
                    <VBtn
                      color="success"
                      variant="text"
                      prepend-icon="ri-add-line"
                      @click="item.is_view = !item.is_view"
                    />
                    <VAvatar
                      size="32"
                      :color="item.pet.avatar ? '' : 'primary'"
                      :class="item.pet.avatar ? '' : 'v-avatar-light-bg primary--text'"
                      :variant="!item.pet.avatar ? 'tonal' : undefined"
                    >
                      <VImg
                        v-if="item.pet.avatar"
                        :src="item.pet.avatar"
                      />
                      <span
                        v-else
                        class="text-sm"
                      >{{ avatarText(item.pet.name) }}</span>
                    </VAvatar> 
                    <div class="d-flex flex-column ms-3">
                      <span class="d-block font-weight-medium text-high-emphasis text-truncate">{{ item.pet.name }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  {{ item.pet.specie }}
                </td>
                <td>
                  {{ item.event_date }}
                </td>
                <td>
                  <VChip
                    v-if="item.event_type == 1"
                    color="primary"
                  >
                    Cita Medica
                  </VChip>   
                  <VChip
                    v-if="item.event_type == 2"
                    color="warning"
                  >
                    Vacuna
                  </VChip> 
                  <VChip
                    v-if="item.event_type == 3"
                    color="success"
                  >
                    Cirugía
                  </VChip>  
                </td>
                <td>
                  {{ item.veterinarie.full_name }}
                </td>
                <td style="text-wrap-mode: nowrap;">
                  {{ item.amount }} PEN
                </td>
                <td style="text-wrap-mode: nowrap;">
                  {{ item.payment_total }} PEN
                </td>
                <td>
                  <VChip
                    v-if="item.state_pay == 1"
                    color="danger"
                  >
                    Pendiente
                  </VChip>   
                  <VChip
                    v-if="item.state_pay == 2"
                    color="warning"
                  >
                    Parcial
                  </VChip> 
                  <VChip
                    v-if="item.state_pay == 3"
                    color="success"
                  >
                    Completo
                  </VChip>   
                </td>
                <td>
                  <VBtn
                    color="primary"
                    variant="text"
                    prepend-icon="ri-add-line"
                    @click="createPayment(item)"
                  />
                </td>
              </tr>
              <template
                v-for="(payment, index2) in item.payments"
                :key="index2"
              >
                <tr v-if="item.is_view">
                  <td />
                  <td />
                  <td />
                  <td />
                  <td />
                  <td>{{ payment.method_payment }}</td>
                  <td>{{ payment.amount }} PEN</td>
                  <td />
                  <td>
                    <div class="d-flex gap-1">
                      <IconBtn
                        size="small"
                        @click="editPayment(item,payment)"
                      >
                        <VIcon icon="ri-pencil-line" />
                      </IconBtn>
                      <IconBtn
                        size="small"
                        @click="deleteItem(item,payment)"
                      >
                        <VIcon icon="ri-delete-bin-line" />
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              </template>
            </template>
            <tr v-if="loading">
              <td
                colspan="9"
                class="text-center text-success"
              >
                Cargando datos...
              </td> 
            </tr>
            <tr v-else-if="errorMessage">
              <td
                colspan="9"
                class="text-center text-error"
              >
                {{ errorMessage }}
              </td> 
            </tr>
            <tr v-else-if="payments.length === 0">
              <td
                colspan="9"
                class="text-center text-warning"
              >
                Sin resultados.
              </td> 
            </tr>
          </tbody>
        </VTable>

        <VPagination
          v-model="currentPage"
          :length="totalPage"
        />
      </VCardText>

      <AddPaymentDialog
        v-if="medical_record_selected"
        v-model:is-dialog-visible="isAddPaymentDialogVisible"
        :medical-record="medical_record_selected"
        @add-payment="addPayment"
      />
      <EditPaymentDialog
        v-if="medical_record_selected && payment_edit_selected"
        v-model:is-dialog-visible="isEditPaymentDialogVisible"
        :medical-record="medical_record_selected"
        :payment-selected="payment_edit_selected"
        @edit-payment="updatedPayment"
      />

      <DeletePaymentDialog
        v-if="medical_record_selected_deleted"
        v-model:is-dialog-visible="isDeletePaymentDialogVisible"
        :medical-record="medical_record_selected_deleted"
        :payment-selected="payment_delete_selected"
        @delete-payment="deletePayment"
      />
    </VCard>
  </div>
</template>

<style>
    .v-btn__prepend {
        margin-inline: 0 !important;
    }
</style>
