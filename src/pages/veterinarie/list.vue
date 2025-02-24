<!-- eslint-disable arrow-parens -->
<!-- eslint-disable sonarjs/no-redundant-boolean -->
<!-- eslint-disable camelcase -->
<script setup>
const data = ref([])
const router = useRouter()

const headers = [
  {
    title: 'Foto',
    key: 'imagen',
  },
  {
    title: 'Nombre y Apellido',
    key: 'full_name',
  },
  {
    title: 'Rol',
    key: 'role_name',
  },
  {
    title: 'Correo',
    key: 'email',
  },
  {
    title: 'Teléfono',
    key: 'phone',
  },
  {
    title: 'Documento',
    key: 'document_full',
  },
  {
    title: 'Acciones',
    key: 'action',
  },
]

const avatarText = value => {
  if (!value)
    return ''
  const nameArray = value.split(' ')

  return nameArray.map(word => word.charAt(0).toUpperCase()).join('')
}

const searchQuery = ref(null)
const staff_selected_deleted = ref(null)
const isDeleteStaffDialogVisible = ref(false)
const loading = ref(true) 
const error = ref(null)

const list = async () => {
  loading.value = true
  error.value = null 
  try {
    const resp =  await $api('/veterinaries?search='+(searchQuery.value ? searchQuery.value : ''), {
      method: 'GET',
      onResponseError({ response }){
        console.log(response)
      },
    })

    console.log(resp)

    data.value = resp.veterinaries.data
    if (data.value.length === 0) {
      error.value = 'Sin resultados.'
    }
  } catch (err) {
    console.error(err)
    error.value = 'Ocurrió un error en el servidor.'
  } finally {
    loading.value = false  
  }
}

const deleteUser =User => {
  let INDEX = data.value.findIndex(user => user.id == User.id)
  if(INDEX != -1){
    data.value.splice(INDEX, 1)
  }
}

const editItem = (item) =>{
  router.push({ name: 'veterinarie-edit-id', params: { id: item.id } })
}

const deleteItem = item => {
  isDeleteStaffDialogVisible.value = true
  staff_selected_deleted.value = item
}

onMounted(() => {
  list()
})

watch(isDeleteStaffDialogVisible, event => {
  console.log(event)
  if(event == false){
    staff_selected_deleted.value = null
  }
})

definePage({
  meta: {
    permisssion: 'list_veterinary',
  },
})
</script>

<template>
  <div>
    <VCard title="🧑‍⚕️ Veterinarios">
      <VCardText class="d-flex flex-wrap gap-4">
        <div class="d-flex align-center">
          <!-- 👉 Search  -->
          <VTextField
            v-model="searchQuery"
            placeholder="Buscar Staff por nombre, apellido o correo"
            style="inline-size: 400px;"
            density="compact"
            class="me-3"
            @keyup.enter="list"
          />
        </div>
    
        <VSpacer />
    
        <div class="d-flex gap-x-4 align-center">
          <VBtn
            v-if="isPermission('register_veterinary')"
            color="primary"
            prepend-icon="ri-add-line"
            @click="router.push({name: 'veterinarie-add'})"
          >
            Agregar Veterinario
          </VBtn>
        </div>
      </VCardText>

      <VDataTable
        :headers="headers"
        :items="data"
        :items-per-page="5"
        class="text-no-wrap"
      >
        <template
          v-if="loading"
          #body
        >
          <tr>
            <td
              colspan="7"
              class="text-center text-success"
            >
              Cargando datos...
            </td>
          </tr>
        </template>
        <template
          v-else-if="error"
          #body
        >
          <tr>
            <td
              colspan="7"
              class="text-center"
              :class="{'text-error': error === 'Ocurrió un error en el servidor.', 'text-warning': error === 'Sin resultados.'}"
            >
              {{ error }}
            </td>
          </tr>
        </template>
        <template #item.id="{ item }">
          <span class="text-h6">{{ item.id }}</span>
        </template>
        
        <template #item.imagen="{ item }">
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
              >{{ avatarText(item.full_name) }}</span>
            </VAvatar>
          </div>
        </template>
        <template #item.document_full="{ item }">
          <div class="d-flex align-center">
            <div class="d-flex flex-column ms-3">
              <span class="d-block font-weight-medium text-high-emphasis text-truncate">{{ item.type_document }}</span>
              <small>{{ item.n_document }}</small>
            </div>
          </div>
        </template>
        <template #item.action="{ item }">
          <div class="d-flex gap-1">
            <IconBtn
              v-if="isPermission('edit_veterinary')"
              size="small"
              @click="editItem(item)"
            >
              <VIcon icon="ri-pencil-line" />
            </IconBtn>
            <IconBtn
              v-if="isPermission('delete_veterinary')"
              size="small"
              @click="deleteItem(item)"
            >
              <VIcon icon="ri-delete-bin-line" />
            </IconBtn>
          </div>
        </template>
      </VDataTable>

      <DeleteVeterinarioDialog
        v-if="staff_selected_deleted"
        v-model:is-dialog-visible="isDeleteStaffDialogVisible"
        :user-selected="staff_selected_deleted"
        @delete-user="deleteUser"
      />
    </VCard>
  </div>
</template>
