<!-- eslint-disable sonarjs/no-redundant-boolean -->
<!-- eslint-disable camelcase -->
<script setup>
const router = useRouter()
const searchPets = ref(null)
const searchVets = ref(null)
const specie = ref(null)
const species = ref(['Perro', 'Gato', 'Hámster', 'Loro', 'Tortuga', 'Vaca', 'Caballo', 'Cuy', 'Toro'])
const vaccinations = ref([])
const currentPage = ref(1)
const totalPage = ref(1)
const vaccination_selected_deleted = ref(null)
const isDeleteVaccinationDialogVisible = ref(false)
const loading = ref(false) 
const errorMessage = ref(null)

const dateRange = ref(null)
const type_date = ref(1)
const state_pay = ref(null)
const state_vaccination = ref(null)

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
  }

  try{
    const resp =  await $api('/vaccinations/index?page='+currentPage.value, {
      method: 'POST',
      body: data,
    })

    totalPage.value = resp.total_page
    vaccinations.value = resp.vaccinations.data
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
  window.open(import.meta.env.VITE_API_BASE_URL+"/vaccination-excel?k=1"+LINK, "_blank")
}

const editItem = item => {
  router.push({
    name: 'vaccination-edit-id',
    params: {
      id: item.id,
    },
  })
}

const deleteItem = item => {
  vaccination_selected_deleted.value = item
  isDeleteVaccinationDialogVisible.value = true
}

const deleteVaccination = item => {
  let INDEX = vaccinations.value.findIndex(vaccination => vaccination.id == item.id)
  if(INDEX != -1){
    vaccinations.value.splice(INDEX, 1)
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
  list()
}

const avatarText = value => {
  if (!value)
    return ''
  const nameArray = value.split(' ')
        
  return nameArray.map(word => word.charAt(0).toUpperCase()).join('')
}

watch(currentPage, val => {
  console.log(val)
  list()
})
watch(isDeleteVaccinationDialogVisible, val => {
  if(val == false){
    vaccination_selected_deleted.value = null
  }
})
onMounted(() => {
  list()
})
definePage({
  meta: {
    permisssion: 'list_vaccionation',
  },
})
</script>

<template>
  <div>
    <VCard title="💉 Vacunaciones ">
      <VCardText class="d-flex flex-wrap gap-4">
        <VRow>
          <VCol cols="3">
            <VSelect
              v-model="type_date"
              :items="[
                {
                  name: 'Fecha de la vacuna',
                  id: 1,
                },
                {
                  name: 'Fecha de registro',
                  id: 2,
                },
              ]"
              item-title="name"
              item-value="id"
              eager
            />
          </VCol>
          <VCol cols="3">
            <AppDateTimePicker
              v-model="dateRange"
              label="Fecha de la vacuna"
              placeholder="Selecione fecha"
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
                    
          <VCol cols="4">
            <div class="d-flex gap-2">
              <VBtn
                color="info"
                prepend-icon="ri-search-2-line"
                @click="list"
              />
              <VBtn
                color="secondary"
                prepend-icon="ri-restart-line"
                @click="reset"
              />
              <VBtn
                color="success"
                prepend-icon="ri-file-excel-2-line"
                @click="downloadExcel"
              />
              <VBtn
                v-if="isPermission('register_vaccionation')"
                color="primary"
                prepend-icon="ri-add-line"
                @click="router.push({name: 'vaccination-add'})"
              >
                Agregar
              </VBtn>
            </div>
          </VCol>

          <VCol cols="3 ">
            <VSelect
              v-model="state_vaccination"
              :items="[
                {
                  name: 'Pendiente',
                  id: 1,
                },
                {
                  name: 'Cancelado',
                  id: 2,
                },
                {
                  name: 'Atendido',
                  id: 3,
                }
              ]"
              label="Estado de la vacunación"
              item-title="name"
              item-value="id"
              placeholder="Seleccione Estado"
              eager
            />
          </VCol>
          <VCol cols="3">
            <VSelect
              v-model="state_pay"
              :items="[
                {
                  name: 'Pendiente',
                  id: 1,
                },
                {
                  name: 'Parcial',
                  id: 2,
                },
                {
                  name: 'Completo',
                  id: 3,
                }
              ]"
              label="Estado de pago"
              item-title="name"
              item-value="id"
              placeholder="Selecione Estado"
              eager
            />
          </VCol>
          <VCol cols="3">
            <VTextField
              v-model="searchPets"
              placeholder="Buscar Mascota"
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
                Fecha de la vacuna
              </th>
              <th class="text-uppercase">
                Veterinario
              </th>
              <th class="text-uppercase">
                Estado
              </th>
              <th class="text-uppercase">
                Costo
              </th>
              <th class="text-uppercase">
                Acción
              </th>
            </tr>
          </thead>
    
          <tbody>
            <tr
              v-for="item in vaccinations"
              :key="item.id"
            >
              <td>
                <div class="d-flex align-center">
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
                {{ item.date_appointment }}
              </td>
              <td>
                {{ item.veterinarie.full_name }}
              </td>
              <td>
                <VChip
                  v-if="item.state == 1"
                  color="warning"
                >
                  Pendiente
                </VChip>   
                <VChip
                  v-if="item.state == 2"
                  color="danger"
                >
                  Cancelado
                </VChip> 
                <VChip
                  v-if="item.state == 3"
                  color="primary"
                >
                  Atendido
                </VChip>   
              </td>
              <td>
                {{ item.amount }} PEN
              </td>
              <td>
                <div class="d-flex gap-1">
                  <IconBtn
                    v-if="isPermission('edit_vaccionation')"
                    size="small"
                    @click="editItem(item)"
                  >
                    <VIcon icon="ri-pencil-line" />
                  </IconBtn>
                  <IconBtn
                    v-if="isPermission('delete_vaccionation')"
                    size="small"
                    @click="deleteItem(item)"
                  >
                    <VIcon icon="ri-delete-bin-line" />
                  </IconBtn>
                </div>
              </td>
            </tr>
            <tr v-if="loading">
              <td
                colspan="7"
                class="text-center text-success"
              >
                Cargando datos...
              </td> 
            </tr>
            <tr v-else-if="errorMessage">
              <td
                colspan="7"
                class="text-center text-danger"
              >
                {{ errorMessage }}
              </td> 
            </tr>
            <tr v-else-if="vaccinations.length === 0">
              <td
                colspan="7"
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

      <DeleteVaccinationDialog
        v-if="vaccination_selected_deleted"
        v-model:is-dialog-visible="isDeleteVaccinationDialogVisible"
        :vaccination-selected="vaccination_selected_deleted"
        @delete-vaccination="deleteVaccination"
      />
    </VCard>
  </div>
</template>

<style>
    .v-btn__prepend {
      margin-inline: 0 !important;
}
</style>
