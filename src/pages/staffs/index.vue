<!-- eslint-disable arrow-parens -->
<!-- eslint-disable sonarjs/no-redundant-boolean -->
<!-- eslint-disable camelcase -->
<script setup>
const data = ref([])

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

const roles = ref([])

const avatarText = value => {
  if (!value)
    return ''
  const nameArray = value.split(' ')

  return nameArray.map(word => word.charAt(0).toUpperCase()).join('')
}

const searchQuery = ref(null)
const staff_selected = ref(null)
const staff_selected_deleted = ref(null)
const isAddStaffDialogVisible = ref(false)
const isEditStaffDialogVisible = ref(false)
const isDeleteStaffDialogVisible = ref(false)
const loading = ref(true) 
const error = ref(null)

const list = async () => {
  loading.value = true
  error.value = null 
  try {
    const resp = await $api('/staffs?search=' + (searchQuery.value ? searchQuery.value : ''), {
      method: 'GET',
      onResponseError({ response }) {
        console.log(response)
      },
    })
    
    console.log(resp)

    data.value = resp.users.data
    roles.value = resp.roles

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

const addUser = newUser => {
  data.value.unshift(newUser)
}

const editUser = (editUser) => {
  let INDEX = data.value.findIndex((user) => user.id == editUser.id)
  if(INDEX != -1){
    data.value[INDEX] = editUser
  }
}

const deleteUser =User => {
  let INDEX = data.value.findIndex(user => user.id == User.id)
  if(INDEX != -1){
    data.value.splice(INDEX, 1)
  }
}

const editItem = (item) => {
  isEditStaffDialogVisible.value = true
  staff_selected.value = item
}

const deleteItem = item => {
  isDeleteStaffDialogVisible.value = true
  staff_selected_deleted.value = item
}

onMounted(() => {
  list()
})
watch(isEditStaffDialogVisible, (event) => {
  console.log(event)
  if(event == false){
    staff_selected.value = null
  }
})
watch(isDeleteStaffDialogVisible, event => {
  console.log(event)
  if(event == false){
    staff_selected_deleted.value = null
  }
})

definePage({
  meta: {
    permisssion: 'list_staff',
  },
})
</script>

<template>
  <div>
    <VCard title="🧑‍🏭 Staff">
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
            v-if="isPermission('register_staff')"
            color="primary"
            prepend-icon="ri-add-line"
            @click="isAddStaffDialogVisible = !isAddStaffDialogVisible"
          >
            Agregar Staff
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
              v-if="isPermission('edit_staff')"
              size="small"
              @click="editItem(item)"
            >
              <VIcon icon="ri-pencil-line" />
            </IconBtn>
            <IconBtn
              v-if="isPermission('delete_staff')"
              size="small"
              @click="deleteItem(item)"
            >
              <VIcon icon="ri-delete-bin-line" />
            </IconBtn>
          </div>
        </template>
      </VDataTable>
     
      <AddStaffDialog
        v-if="roles.length > 0"
        v-model:is-dialog-visible="isAddStaffDialogVisible"
        :roles="roles"
        @add-user="addUser"
      />
         
  
      <EditStaffDialog
        v-if="staff_selected"
        v-model:is-dialog-visible="isEditStaffDialogVisible"
        :roles="roles"
        :userselected="staff_selected"
        @edit-user="editUser"
      />

      <DeleteStaffDialog
        v-if="staff_selected_deleted"
        v-model:is-dialog-visible="isDeleteStaffDialogVisible"
        :user-selected="staff_selected_deleted"
        @delete-user="deleteUser"
      />
    </VCard>
  </div>
</template>

