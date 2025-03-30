<!-- eslint-disable vue/custom-event-name-casing -->
<!-- eslint-disable camelcase -->
<script setup>
const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  surgerieSelected: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:isDialogVisible', 'delete-surgerie'])

const dialogVisibleUpdate = val => {
  emit('update:isDialogVisible', val)
}

const warning = ref(null)
const success = ref(null)
const error_exists = ref(null)
const surgerie_selected = ref(null)

const deleted = async() => {
  try {
    const resp =  await $api('/surgeries/'+surgerie_selected.value.id, {
      method: 'DELETE',
      onResponseError({ response }){
        console.log(response)
        error_exists.value = response._data.error
      },
    })

    console.log(resp)
    if(resp.message == 403){
      error_exists.value = "La cirujía no se pudo eliminar porque ya ha sido atendida"
    }else{
      success.value = "La cirujía se ha eliminado correctamente"
      error_exists.value = null
      emit('delete-surgerie', surgerie_selected.value)
      setTimeout(() => {
        emit('update:isDialogVisible', false)
      }, 3000)
    }
  } catch (error) {
    console.log(error)
    error_exists.value = error
  }
}

onMounted(() => {
  surgerie_selected.value = props.surgerieSelected
  console.log(surgerie_selected.value)
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
            v-if="surgerie_selected"
            class="text-h4 text-center mb-2"
          >
            Eliminar cirujía Nº {{ surgerie_selected.id }}
          </h4>
          <!--
            <p class="text-sm-body-1 text-center">
            Supported payment methods
            </p> 
          -->
        </div>
        <p 
          v-if="surgerie_selected"
          class="text-center"
        >
          ¿Estas seguro de eliminar esta cirujía del registro la mascota "{{ surgerie_selected.pet.name }}"?
        </p>
        <VAlert
          v-if="error_exists"
          type="error"
          class="mt-3"
        >
          <strong>{{ error_exists }}</strong>
        </VAlert>
        <VAlert
          v-if="success"
          type="warning"
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
