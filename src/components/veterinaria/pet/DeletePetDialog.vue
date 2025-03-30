<!-- eslint-disable vue/prop-name-casing -->
<!-- eslint-disable camelcase -->
<script setup>
const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  petSelected: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:isDialogVisible', 'deletePet'])

const dialogVisibleUpdate = val => {
  emit('update:isDialogVisible', val)
}

const warning = ref(null)
const success = ref(null)
const error_exists = ref(null)
const pet_selected = ref(null)

const deleted = async() => {
  try {
    const resp =  await $api('/pets/'+pet_selected.value.id, {
      method: 'DELETE',
      onResponseError({ response }){
        console.log(response)
        error_exists.value = response._data.error
      },
    })

    console.log(resp)
    success.value = "La mascota se ha eliminado correctamente"
    error_exists.value = null
    emit('deletePet', pet_selected.value)
    setTimeout(() => {
      emit('update:isDialogVisible', false)
    }, 3000) 
  } catch (error) {

    if (error.response && error.response.status === 400) {
     
      if (error.response.data && error.response.data.message_text) {
        error_exists.value = error.response.data.message_text
      } else {
        error_exists.value = "No se puede eliminar la mascota debido a registros asociados."
      }
    } else {
      error_exists.value = "Hubo un problema en el servidor al intentar eliminar."
    }
  }
} 

onMounted(() => {
  pet_selected.value = props.petSelected
  console.log(pet_selected.value)
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
            v-if="pet_selected"
            class="text-h4 text-center mb-2"
          >
            Eliminar Mascota : {{ pet_selected.id }}
          </h4>
        </div>
        <p 
          v-if="pet_selected"
          class="text-center"
        >
          ¿Estas seguro de eliminar la MASCOTA "{{ pet_selected.name }}"?
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
