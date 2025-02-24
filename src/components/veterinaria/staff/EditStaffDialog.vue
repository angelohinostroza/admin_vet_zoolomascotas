<!-- eslint-disable vue/no-dupe-keys -->
<!-- eslint-disable camelcase -->
<script setup>
const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  roles: {
    type: Object,
    required: true,
  },
  userselected: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:isDialogVisible', 'editUser'])

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

const emailRules = [
  v => /.+@.+\..+/.test(v) || 'Debe ser un correo válido',
]

const passwordRules = [
  v => (v && v.length >= 6) || 'La contraseña debe tener al menos 6 caracteres',
  v => (v && v.length <= 15) || 'La contraseña no puede exceder 15 caracteres',
]

const calculateAge = birthday => {
  if (!birthday) return 0
  const birthDate = new Date(birthday)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}


const update = async() => {
  warning.value = null

  if(!form.value.name){
    warning.value = "Se debe llenar el nombre del usuario"

    return
  }
  if(!form.value.surname){
    warning.value = "Se debe llenar el apellido del usuario"

    return
  }
  if(!form.value.phone){
    warning.value = "Se debe llenar el Nº de teléfono del usuario"

    return
  }
  if(!form.value.n_document){
    warning.value = "Se debe llenar el Nº de documento del usuario"

    return
  }
  if (calculateAge(form.value.birthday) < 18) {
    warning.value = "El usuario debe ser mayor de 18 años"
    
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
  if(!form.value.email){
    warning.value = "Se debe llenar el email del usuario"

    return
  }

  let formData = new FormData()

  formData.append("name", form.value.name)
  formData.append("surname", form.value.surname)
  formData.append("email", form.value.email)
  if(form.value.type_document){
    formData.append("type_document", form.value.type_document)
  }
  if(form.value.n_document){
    formData.append("n_document", form.value.n_document)
  }
  formData.append("phone", form.value.phone)
  formData.append("gender", form.value.gender)
  if(form.value.designation){
    formData.append("designation", form.value.designation)
  }
  if(form.value.password){
    formData.append("password", form.value.password)
  }
  formData.append("role_id", form.value.role_id)
  if(form.value.birthday){
    formData.append("birthday", form.value.birthday)
  }
  if(FILE_AVATAR.value){
    formData.append("imagen", FILE_AVATAR.value)
  }

  try {
    success.value = null

    const resp =  await $api('/staffs/'+props.userselected.id, {
      method: 'POST',
      body: formData,
      onResponseError({ response }){
        console.log(response)
        error_exists.value = response._data.error
      },
    })

    console.log(resp)
    if(resp.message == 403){
      warning.value = resp.message_text
    }else{
      success.value = "El usuario se ha editado correctamente"
      setTimeout(() => {
        emit('update:isDialogVisible', false)
        warning.value = null
        error_exists.value = null
        emit('editUser', resp.user)
      }, 2000)
     
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
  form.value.name = props.userselected.name
  form.value.surname = props.userselected.surname
  form.value.email = props.userselected.email
  form.value.phone = props.userselected.phone
  form.value.type_document = props.userselected.type_document
  form.value.n_document = props.userselected.n_document
  form.value.designation = props.userselected.designation
  form.value.gender = props.userselected.gender
  form.value.birthday = props.userselected.birthday
  form.value.role_id = parseInt(props.userselected.role_id)
  IMAGEN_PREVIZUALIZA.value = props.userselected.avatar
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
            🧑‍🏭 Editar Usuario : {{ props.userselected.id }}
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
              :rules="emailRules"
            />
          </VCol>
          <VCol cols="6">
            <VTextField
              v-model="form.password"
              label="Password"
              placeholder="············"
              :type="isPasswordVisible ? 'text' : 'password'"
              :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
              :rules="passwordRules"
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
          @click="update"
        >
          Editar
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
