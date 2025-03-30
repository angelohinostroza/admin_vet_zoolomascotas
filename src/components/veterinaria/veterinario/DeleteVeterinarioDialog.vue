<!-- eslint-disable vue/prop-name-casing -->
<!-- eslint-disable camelcase -->
<script setup>
const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  userSelected: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:isDialogVisible', 'deleteUser'])

const dialogVisibleUpdate = val => {
  emit('update:isDialogVisible', val)
}

const warning = ref(null)
const success = ref(null)
const error_exists = ref(null)
const user_selected = ref(null)

const deleted = async() => {
  try {
    const resp =  await $api('/veterinaries/'+user_selected.value.id, {
      method: 'DELETE',
      onResponseError({ response }){
        console.log(response)
        error_exists.value = response._data.error
      },
    })

    console.log(resp)
    success.value = "El veterinario se ha eliminado correctamente"
    error_exists.value = null
    emit('deleteUser', user_selected.value)
    setTimeout(() => {
      emit('update:isDialogVisible', false)
    }, 3000) 
  }  catch (error) {

    if (error.response && error.response.status === 403) {
     
      if (error.response.data && error.response.data.message_text) {
        error_exists.value = error.response.data.message_text
      } else {
        error_exists.value = "No se puede eliminar el veterinario debido a registros asociados."
      }
    } else {
      error_exists.value = "Hubo un problema en el servidor al intentar eliminar."
    }
  }
} 

onMounted(() => {
  user_selected.value = props.userSelected
  console.log(user_selected.value)
})
</script>

<template>
  <VDialog
    :model-value="props.isDialogVisible"
    max-width="750"
    @update:model-value="dialogVisibleUpdate"
  >
    <VCard class="refer-and-earn-dialog pa-3 pa-sm-11">
      <!-- 👉 dialog close btn -->
      <DialogCloseBtn
        variant="text"
        size="default"
        @click="emit('update:isDialogVisible', false)"
      />

      <VCardText class="pa-5">
        <div class="mb-6">
          <h4
            v-if="user_selected"
            class="text-h4 text-center mb-2"
          >
            Eliminar Veterinario : {{ user_selected.id }}
          </h4>
        </div>
        <p
          v-if="user_selected"
          class="text-center"
        >
          ¿Estas seguro de eliminar el VETERINARIO "{{ user_selected.full_name }}"?
        </p>
        <!-- Mensaje de error -->
        <VAlert
          v-if="error_exists"
          type="error"
          class="mt-3"
        >
          <strong>{{ error_exists }}</strong>
        </VAlert>

        <!-- Mensaje de éxito -->
        <VAlert
          v-if="success"
          type="success"
          class="mt-3"
        >
          <strong>{{ success }}</strong>
        </VAlert>
      </VCardText>
      <VCardText class="pa-5 text-center">
        <VBtn
          color="error"
          class="mb-4"
          @click="deleted"
        >
          Eliminar
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.refer-link-input {
  .v-field--appended {
    padding-inline-end: 0;
  }

  .v-field__append-inner {
    padding-block-start: 0.125rem;
  }
}
</style>
