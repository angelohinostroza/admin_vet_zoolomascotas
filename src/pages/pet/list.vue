<!-- eslint-disable sonarjs/no-redundant-boolean -->
<!-- eslint-disable camelcase -->
<script setup>
import { onMounted, watch } from 'vue'

const router = useRouter()
const searchQuery = ref(null)
const specie = ref(null)
const species = ref(['Perro', 'Gato', 'Hámster', 'Loro', 'Tortuga', 'Vaca', 'Caballo', 'Cuy', 'Toro'])
const pets = ref([])
const loading = ref(true)
const currentPage = ref(1)
const totalPage = ref(1)
const pet_selected_deleted = ref(null)
const isDeletePetDialogVisible = ref(false)

const list = async () => {
  loading.value = true 
  try {
    const resp = await $api(
      '/pets?page=' + currentPage.value + '&search=' + (searchQuery.value ? searchQuery.value : '') +
      '&species=' + (specie.value ? specie.value : ''),
      {
        method: 'GET',
      },
    )

    pets.value = resp.pets?.data || []
    totalPage.value = resp.total_page || 1
  } catch (error) {
    console.error('Error al obtener mascotas:', error)
    pets.value = []
  } finally {
    loading.value = false 
  }
}


const editItem = item => {
  router.push({
    name: 'pet-edit-id',
    params: {
      id: item.id,
    },
  })
}

const deleteItem = item => {
  pet_selected_deleted.value = item
  isDeletePetDialogVisible.value = true
}

const deletePet = item => {
  let INDEX = pets.value.findIndex(pet => pet.id == item.id)
  if(INDEX !=-1){
    pets.value.splice(INDEX, 1)
  }
}

const reset = () => {
  searchQuery.value = null
  specie.value = null
  currentPage.value = 1
  list()
}

const avatarText = value => {
  if (!value)
    return ''
  const nameArray = value.split(' ')

  return nameArray.map(word => word.charAt(0).toUpperCase()).join('')
}

watch(isDeletePetDialogVisible, val => {
  if (val == false) {
    pet_selected_deleted.value = null
    
  }
})

watch(currentPage, val => {
  console.log(val)
  list()
})
onMounted(() => {
  list()
})

definePage({
  meta: {
    permisssion: 'list_pet',
  },
})
</script>

<template>
  <div>
    <VCard title="🐾 Mascotas">
      <VCardText class="d-flex flex-wrap gap-4">
        <div class="d-flex align-center">
          <!-- 👉 Search  -->
          <VTextField
            v-model="searchQuery"
            placeholder="Buscar nombre mascota o responsable"
            style="inline-size: 400px;"
            density="compact"
            class="me-3"
            @keyup.enter="list"
          />
        </div>
        <div>
          <VSelect
            v-model="specie"
            :items="species"
            style="inline-size: 200px;"
            label="Especie"
            item-title="name"
            item-value="id"
            placeholder="Selecione Especie"
            eager
          />
        </div>
        <div>
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
        </div>
    
        <VSpacer />
    
        <div class="d-flex gap-x-4 align-center">
          <VBtn
            v-if="isPermission('register_pet')"
            color="primary"
            prepend-icon="ri-add-line"
            @click="router.push({name: 'pet-add'})"
          >
            Agregar Mascota
          </VBtn>
        </div>
      </VCardText>
      <VCardText class="pa-5">
        <VTable>
          <thead>
            <tr>
              <th class="text-uppercase">
                Nombre
              </th>
              <th class="text-uppercase">
                ESpecie
              </th>
              <th class="text-uppercase">
                Raza
              </th>
              <th class="text-uppercase">
                Género
              </th>
              <th class="text-uppercase">
                Peso
              </th>
              <th class="text-uppercase">
                Color
              </th>
              <th class="text-uppercase">
                Accion
              </th>
            </tr>
          </thead>
  
          <tbody v-if="!loading && pets && pets.length">
            <tr
              v-for="item in pets"
              :key="item.id"
            >
              <td>
                <div class="d-flex align-center">
                  <VAvatar
                    size="32"
                    :color="item.avatar ? '' : 'primary'"
                    :class="item.avatar ? '' : 'v-avatar-light-bg primary--text'"
                    :variant="!item.avatar ? 'tonal' : undefined"
                  >
                    <VImg
                      v-if="item.avatar"
                      :src="item.avatar"
                    />
                    <span
                      v-else
                      class="text-sm"
                    >{{ avatarText(item.name) }}</span>
                  </VAvatar>
                  <div class="d-flex flex-column ms-3">
                    <span class="d-block font-weigth-medium text-high-emphasis text-truncate">{{ item.name }}</span>
                  </div>
                </div>
              </td>
              <td>
                {{ item.specie }}
              </td>
              <td>
                {{ item.breed }}
              </td>
              <td>
                {{ item.gender }}
              </td>
              <td>
                {{ item.weight }} KG
              </td>
              <td>
                {{ item.color }}
              </td>
              <td>
                <div class="d-flex gap-1">
                  <IconBtn
                    v-if="isPermission('edit_pet')"
                    size="small"
                    @click="editItem(item)"
                  >
                    <VIcon icon="ri-pencil-line" />
                  </IconBtn>
                  <IconBtn
                    v-if="isPermission('delete_pet')"
                    size="small"
                    @click="deleteItem(item)"
                  >
                    <VIcon icon="ri-delete-bin-line" />
                  </IconBtn>
                </div>
              </td>
            </tr>
          </tbody>
        </VTable>
    
        <VCardText>
          <VAlert
            v-if="loading"
            class="text-center text-success"
            variant="text"
          >
            Cargando datos...
          </VAlert>
          <VAlert
            v-else-if="pets === null"
            class="text-center text-error"
            variant="text"
          >
            Ocurrió un error en el servidor.
          </VAlert>
          <VAlert
            v-else-if="pets.length === 0"
            class="text-center text-warning"
            variant="text"
          >
            Sin resultados.
          </VAlert>
        </VCardText>
        <VPagination
          v-model="currentPage"
          :length="totalPage"
        />
        <DeletePetDialog
          v-if="pet_selected_deleted"
          v-model:is-dialog-visible="isDeletePetDialogVisible"
          :pet-selected="pet_selected_deleted"
          @delete-pet="deletePet"
        />
      </vcardtext>
    </VCard>
  </div>
</template>

