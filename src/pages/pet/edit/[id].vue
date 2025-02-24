import { type } from '../../../auto-imports';
<!-- eslint-disable camelcase -->

<script setup>
import { onMounted } from 'vue'

const warning = ref(null)
const success = ref(null)
// eslint-disable-next-line camelcase
const error_exists = ref(null)
const fileInputRef = ref(null)
const route = useRoute('pet-edit-id')
const router = useRouter() 

const form = ref({
  //Datos Mascota
  name: null,
  specie: null,
  breed: null,
  birth_date: null,
  gender: null,
  color: null,
  weight: null,
  medical_notes: null,

  //Datos Responsable
  names: null,
  surnames: null,
  type_document: "DNI",
  n_document: null,
  email: null,
  phone: null,
  address: null,
  city: null,
  emergency_contact: null,
})

// eslint-disable-next-line camelcase
const type_documents = [
  'DNI',
  'Pasaporte',
  'carnet de Extranjería',
  'RUC',
]

const species = ref(['Perro', 'Gato', 'Hámster', 'Loro', 'Tortuga', 'Vaca', 'Caballo', 'Cuy', 'Toro'])
const FILE_AVATAR = ref(null)
const IMAGEN_PREVIZUALIZA = ref(null)

const pet_selected = ref({
  name: '',
})

const emailRules = [
  v => /.+@.+\..+/.test(v) || 'Debe ser un correo válido',
]

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

const edit = async() => {
  try {
    warning.value = null

    //Datos obligatorios de la mascota
    if (!form.value.name) {
      warning.value = "El nombre de la mascota es obligatorio"
      
      return
    }
    if (!form.value.specie) {
      warning.value = "La especie de la mascota es obligatorio"
      
      return
    }
    if (!form.value.breed) {
      warning.value = "La raza de la mascota es obligatorio"
      
      return
    }
    if (!form.value.birth_date) {
      warning.value = "La fecha de nacimiento de la mascota es obligatorio"
      
      return
    }
    if (!form.value.gender) {
      warning.value = "El género de la mascota es obligatorio"
      
      return
    }
    if (!form.value.color) {
      warning.value = "El color de la mascota es obligatorio"
      
      return
    }
    if (!form.value.weight) {
      warning.value = "El peso de la mascota es obligatorio"
      
      return
    }

    //Datos obligatorios del responsable
    if (!form.value.names) {
      warning.value = "El nombre del responsable es obligatorio"
      
      return
    }
    if (!form.value.surnames) {
      warning.value = "El apellido del responsable es obligatorio"
      
      return
    }
    if (!form.value.n_document) {
      warning.value = "El número de documento del responsable es obligatorio"
      
      return
    }
    if (!form.value.email) {
      warning.value = "El correo electrónico del responsable es obligatorio"
      
      return
    }
    if (!form.value.address) {
      warning.value = "La dirección del responsable es obligatorio"
      
      return
    }
    if (!form.value.city) {
      warning.value = "El cuidad del responsable es obligatorio"
      
      return
    }
    if (!form.value.phone) {
      warning.value = "El teléfono del responsable es obligatorio"
      
      return
    }
    if (!form.value.emergency_contact) {
      warning.value = "El contacto de emergencia es obligatorio"
      
      return
    }

    let formData = new FormData()
    formData.append("name", form.value.name)
    formData.append("specie", form.value.specie)
    formData.append("breed", form.value.breed)
    formData.append("birth_date", form.value.birth_date)
    formData.append("gender", form.value.gender)
    formData.append("color", form.value.color)
    formData.append("weight", form.value.weight)
    if (form.value.medical_notes) {
      formData.append("medical_notes", form.value.medical_notes)
    }
    if (FILE_AVATAR.value) {
      formData.append("imagen", FILE_AVATAR.value)
    }
    formData.append("names", form.value.names)
    formData.append("surnames", form.value.surnames)
    formData.append("type_document", form.value.type_document)
    formData.append("n_document", form.value.n_document)
    formData.append("email", form.value.email)
    formData.append("phone", form.value.phone)
    formData.append("address", form.value.address)
    formData.append("city", form.value.city)
    formData.append("emergency_contact", form.value.emergency_contact)

    const resp =  await $api('/pets/'+route.params.id, {
      method: 'POST',
      body: formData,
      onResponseError({ response }){
        console.log(response)
        error_exists.value = response._data.error
      },
    })

    console.log(resp)
    success.value = "La mascota y el responsable se han creado correctamente"
    setTimeout(() => {
      success.value = null
      warning.value = null
      error_exists.value = null
      router.push('/pet/list')
    }, 3000)

  } catch (error) {
    console.log(error)
  }
}

const show = async() => {
  try {
    const resp = await $api('/pets/'+route.params.id, {
      method: 'GET',
      onResponseError({ response }){
        console.log(response)
        error_exists.value = response._data.error
      },
    })

    console.log(resp)
    pet_selected.value = resp.pet

    //Datos de la mascota
    form.value.name = pet_selected.value.name
    form.value.specie = pet_selected.value.specie
    form.value.breed = pet_selected.value.breed
    form.value.birth_date = pet_selected.value.birth_date
    form.value.gender = pet_selected.value.gender
    form.value.color = pet_selected.value.color
    form.value.weight = pet_selected.value.weight
    form.value.medical_notes = pet_selected.value.medical_notes

    //Datos del responsable
    form.value.names = pet_selected.value.owner.names
    form.value.surnames = pet_selected.value.owner.surnames
    form.value.type_document = pet_selected.value.owner.type_document
    form.value.n_document = pet_selected.value.owner.n_document
    form.value.email = pet_selected.value.owner.email
    form.value.phone = pet_selected.value.owner.phone
    form.value.address = pet_selected.value.owner.address
    form.value.city = pet_selected.value.owner.city
    form.value.emergency_contact = pet_selected.value.owner.emergency_contact
    IMAGEN_PREVIZUALIZA.value = pet_selected.value.avatar
  } catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  show()
})
definePage({
  meta: {
    permisssion: 'edit_pet',
  },
})
</script>

<template>
  <div>
    <VCardText class="pa-5">
      <div class="mb-1">
        <h4 class="text-h4 text-center mb-1">
          🐾 Editar Mascota: {{ pet_selected.name }}
        </h4>
      </div>
    </VCardText>

    <VCard
      title="Mascota:"
      class="pa-4"
    >
      <VRow>
        <VCol cols="6">
          <VTextField
            v-model="form.name"
            label="Nombre:"
          />
        </VCol>
        <VCol cols="3">
          <VSelect
            v-model="form.specie"
            :items="species"
            label="Especie"
            item-title="name"
            item-value="id"
            placeholder="Selecione Especie"
            eager
          />
        </VCol>
        <VCol cols="3">
          <VTextField
            v-model="form.breed"
            label="Raza:"
          />
        </VCol>
        <VCol cols="3">
          <!--
            <AppDateTimePicker
            v-model="form.birth_date"
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
                        v-model="form.birth_date"
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
        <VCol cols="3">
          <VRadioGroup
            v-model="form.gender"
            inline
          >
            <VRadio
              label="Macho"
              value="M"
            />
            <VRadio
              label="Hembra"
              value="H"
            />
          </VRadioGroup>
        </VCol>
        <VCol cols="3">
          <VTextarea
            v-model="form.color"
            label="Color"
          />
        </VCol>
        <VCol cols="3">
          <VTextField
            v-model="form.weight"
            type="number"
            label="Peso:"
          />
        </VCol>
        <VCol cols="6">
          <VFileInput
            ref="fileInputRef"
            label="Seleccione Foto"
            @change="loadFile($event)"
          />
          <VCol
            v-if="IMAGEN_PREVIZUALIZA"
            cols="3"
          >
            <VImg
              width="137"
              heigth="176"
              :src="IMAGEN_PREVIZUALIZA"
            />
          </VCol>
        </vcol>
        <VCol cols="6">
          <VTextarea
            v-model="form.medical_notes"
            label="Notas Medicas"
          />
        </VCol>
      </VRow>
    </VCard>

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
    
    <VCard
      title="Responsable:"
      class="my-2 pa-4"
    >
      <VRow>
        <VCol cols="6">
          <VTextField
            v-model="form.names"
            label="Nombres:"
          />
        </VCol>
        <VCol cols="6">
          <VTextField
            v-model="form.surnames"
            label="Apelidos:"
          />
        </VCol>
        <VCol cols="3">
          <VSelect
            v-model="form.type_document"
            :items="type_documents"
            label="Tipo de documento"
            placeholder="Selecione"
            eager
          />
        </VCol>
        <VCol cols="3">
          <VTextField
            v-model="form.n_document"
            label="Nº de documento:"
            type="number"
          />
        </VCol>
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
            v-model="form.address"
            label="Dirección:"
          />
        </VCol>
        <VCol cols="3">
          <VTextField
            v-model="form.city"
            label="Ciudad:"
          />
        </VCol>
        <VCol cols="3">
          <VTextField
            v-model="form.phone"
            label="Teléfono:"
            type="number"
          />
        </VCol>
        <VCol cols="5">
          <VTextarea
            v-model="form.emergency_contact"
            label="Contacto de Emergencia"
          />
        </VCol>
      </VRow>
      <VCardText class="pa-5 py-0 text-end">
        <VBtn
          color="primary"
          class="mb-4"
          @click="edit"
        >
          Editar
        </VBtn>
      </VCardText>
    </VCard>
  </div>
</template>
