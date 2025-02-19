<!-- eslint-disable vue/no-dupe-keys -->
import { type } from '../../../../auto-imports';
<!-- eslint-disable vue/require-explicit-emits -->
<!-- eslint-disable camelcase -->
<script setup>
import { ref } from 'vue'

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  roles: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:isDialogVisible', 'addUser'])

const dialogVisibleUpdate = val => {
  emit('update:isDialogVisible', val)
}

const form = ref({
  name: null,
  surname: null,
  email: null,
  phone: null,
  type_document: 'DNI',
  n_document: null,
  designation: null,
  gender: null,
  birthday: null,
  role_id: null,
  password: null,
})

const type_documents = [
  'DNI',
  'Pasaporte',
  'carnet de Extranjería',
  'RUC',
]

const isPasswordVisible = ref(false)
const warning = ref(null)
const success = ref(null)
const error_exists = ref(null)
const FILE_AVATAR = ref(null)
const IMAGEN_PREVIZUALIZA = ref(null)
const roles = ref([])

const fieldsClean = () => {
  form.value = {
    name: null,
    surname: null,
    email: null,
    phone: null,
    type_document: 'DNI',
    n_document: null,
    designation: null,
    gender: null,
    birthday: null,
    role_id: null,
    password: null,
  }
  FILE_AVATAR.value = null
  IMAGEN_PREVIZUALIZA.value = null
}

const store = async() => {
  warning.value = null

  if(!form.value.name){
    warning.value = "Se debe llenar el nombre del usuario"

    return
  }
  if(!form.value.surname){
    warning.value = "Se debe llenar el apellido del usuario"

    return
  }
  if(!form.value.email){
    warning.value = "Se debe llenar el email del usuario"

    return
  }
  if(!form.value.phone){
    warning.value = "Se debe llenar el teléfono del usuario"

    return
  }
  if(!form.value.gender){
    warning.value = "Se debe seleccionar el género del usuario"

    return
  }
  if(!form.value.role_id){
    warning.value = "Se debe seleccionar el rol para el usuario"

    return
  }
  if(!form.value.password){
    warning.value = "Se debe digitar una contraseña para el usuario"

    return
  }

  let formdata = new FormData()

  formdata.append("name", form.value.name)
  formdata.append("surname", form.value.surname)
  formdata.append("email", form.value.email)
  if(form.value.type_document){
    formdata.append("type_document", form.value.type_document)
  }
  if(form.value.n_document){
    formdata.append("n_document", form.value.n_document)
  }
  formdata.append("phone", form.value.phone)
  formdata.append("gender", form.value.gender)
  if(form.value.designation){
    formdata.append("designation", form.value.designation)
  }
  formdata.append("password", form.value.password)
  formdata.append("role_id", form.value.role_id)
  if(form.value.birthday){
    formdata.append("birthday", form.value.birthday)
  }
  formdata.append("imagen", FILE_AVATAR.value)


  try {
    const resp =  await $api('/staffs', {
      method: 'POST',
      body: formdata,
      onResponseError({ response }){
        console.log(response)
        error_exists.value = response._data.error
      },
    })

    console.log(resp)
    if(resp.message == 403){
      warning.value = resp.message_text
    }else{
      success.value = "El usuario se ha creado correctamente"
      setTimeout(() => {
        success.value = null
        warning.value = null
        error_exists.value = null
        fieldsClean()
        emit('update:isDialogVisible', false)
      }, 1500)
      emit('addUser', resp.user)
    }
  } catch (error) {
    console.log(error)
    error_exists.value = error
  }
}

const loadFile = $event =>{
  if($event.target.files[0].type.indexOf("image") < 0){
    FILE_AVATAR.value = null
    IMAGEN_PREVIZUALIZA.value = null
    warning.value = "SOLAMENTE PUEDEN SER ARCHIVOS DE TIPO IMAGEN"
    
    return
  }
  warning.value = ''
  FILE_AVATAR.value = $event.target.files[0]
  let reader = new FileReader()
  reader.readAsDataURL(FILE_AVATAR.value)
  reader.onloadend = () => IMAGEN_PREVIZUALIZA.value = reader.result
}

onMounted(() => {
  roles.value = props.roles
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
          <h4 class="text-h4 text-center mb-2">
            🧑‍🏭 Agregar Usuario
          </h4>
          <!--
            <p class="text-sm-body-1 text-center">
            Supported payment methods
            </p> 
          -->
        </div>
        <VRow>
          <VCol cols="6">
            <VTextField
              v-model="form.name"
              label="Nombres:"
            />
          </VCol>
          <VCol cols="6">
            <VTextField
              v-model="form.surname"
              label="Apelidos:"
            />
          </VCol>
          <VCol cols="4">
            <VTextField
              v-model="form.phone"
              label="Teléfono:"
              type="number"
            />
          </VCol>
          <VCol cols="4">
            <VSelect
              v-model="form.type_document"
              :items="type_documents"
              label="Tipo de documento"
              placeholder="Selecione"
              eager
            />
          </VCol>
          <VCol cols="4">
            <VTextField
              v-model="form.n_document"
              label="Nº de documento:"
              type="number"
            />
          </VCol>
          <VCol cols="4">
            <!--
              <AppDateTimePicker
              v-model="form.birthday"
              label="Fecha nacimiento"
              placeholder="Selecione fecha"
              />
            -->
            <label for="">Fecha de nacimiento</label>
            <div class="app-picker-field">
              <div class="v-input v-input--horizontal v-input--center-affix v-input--density-comfortable v-locale--is-ltr position-relative v-text-field">
                <div class="v-input__control">
                  <div class="v-field v-field--center-affix v-field--variant-outlined v-theme--light v-locale--is-ltr">
                    <div class="v-field__field">
                      <div class="v-field__input">
                        <input
                          id=""
                          v-model="form.birthday"
                          type="date"
                          class="flat-picker-custom-style flatpickr-input"
                          style="opacity: 1;"
                        >
                      </div>
                    </div>
                    <div class="v-field__outline text-primary">
                      <div class="v-field__outline__start" /><div class="v-field__outline__notch">
                        <label
                          class="v-label v-field-			label v-field-label--floating"
                          aria-hidden="true"
                          for="input-8"
                          style=""
                        >Nombre</label>
                      </div><div class="v-field__outline__end" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </VCol>
          <VCol cols="4">
            <VRadioGroup
              v-model="form.gender"
              inline
            >
              <VRadio
                label="Masculino"
                value="M"
              />
              <VRadio
                label="Femenino"
                value="F"
              />
            </VRadioGroup>
          </VCol>
          <VCol cols="4">
            <VTextarea
              v-model="form.designation"
              label="Designación"
            />
          </VCol>
          <VCol cols="6">
            <VRow>
              <VCol cols="12">
                <VFileInput
                  label="Seleccione Avatar"
                  @change="loadFile($event)"
                />
                <VCol
                  v-if="IMAGEN_PREVIZUALIZA"
                  cols="12"
                >
                  <VImg
                    width="137"
                    heigth="176"
                    :src="IMAGEN_PREVIZUALIZA"
                  />
                </VCol>
              </vcol>
            </VRow>  
          </VCol>
          <VCol cols="6">
            <VSelect
              v-model="form.role_id"
              :items="roles"
              label="Rol"
              item-title="name"
              item-value="id"
              placeholder="Selecione Rol"
              eager
            />
          </vcol>
          <VCol cols="6">
            <VTextField
              v-model="form.email"
              label="Email"
              type="email"
              placeholder="john@email.com"
            />
          </VCol>
          <VCol cols="6">
            <VTextField
              v-model="form.password"
              label="Password"
              placeholder="············"
              :type="isPasswordVisible ? 'text' : 'password'"
              :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
              @click:append-inner="isPasswordVisible = !isPasswordVisible"
            />
          </VCol>
        </VRow>

        <VAlert
          v-if="warning"
          type="warning"
          class="mt-3"
        >
          <strong>{{ warning }}</strong>
        </VAlert>
        <VAlert
          v-if="error_exists"
          type="error"
          class="mt-3"
        >
          <strong>En el servidor hubo un error al guardar</strong>
        </VAlert>
        <VAlert
          v-if="success"
          type="success"
          class="mt-3"
        >
          <strong>{{ success }}</strong>
        </VAlert>
      </VCardText>
      <VCardText class="pa-5">
        <VBtn
          color="primary"
          class="mb-4"
          @click="store"
        >
          Crear
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
