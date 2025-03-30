<!-- eslint-disable camelcase -->
<script setup>
import { onMounted } from 'vue'

const form = ref({
  name: null,
  surname: null,
  email: null,
  phone: null,
  // eslint-disable-next-line camelcase
  type_document: 'DNI',
  // eslint-disable-next-line camelcase
  n_document: null,
  designation: null,
  gender: null,
  birthday: null,
  // eslint-disable-next-line camelcase
  role_id: null,
  password: null,
})

// eslint-disable-next-line camelcase
const type_documents = [
  'DNI',
  'Pasaporte',
  'carnet de Extranjería',
  'RUC',
]

const isPasswordVisible = ref(false)
const warning = ref(null)
const success = ref(null)
// eslint-disable-next-line camelcase
const error_exists = ref(null)
const FILE_AVATAR = ref(null)
const IMAGEN_PREVIZUALIZA = ref(null)
const roles = ref([])
const days = ref(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'])
const hour_days = ref([])
const selected_segment_time = ref([])
const schedule_hour_veterinarie = ref([])
const load_request = ref(null)
const route = useRoute('veterinarie-edit-id')
const veterinarie_selected = ref(null)

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

const config = async () => {
  try {
    const resp = await $api('/veterinaries/config', {
      method: 'GET',
      onResponseError({ response }){
        console.log(response)
        error_exists.value = response._data.error
      },
    })

    console.log(resp)
    roles.value = resp.roles
    hour_days.value = resp.schedule_hours_groups
  } catch (error) {
    console.log(error)
  }
}

const selectSegmentTimeAll = ($event, segment_times, day) => {
  if($event.target.checked){
    // EL CHECKBOX ESTA MARCADO
    segment_times.forEach(segment_time => {
      selectedSegmentTime($event, segment_time, day)
      let INDEX = selected_segment_time.value.findIndex(seg_time => seg_time == segment_time.id+'-'+day)
      if(INDEX == -1){
        selected_segment_time.value.push(segment_time.id+'-'+day)
      }
    })
  }else{
    // EL CHECKBOX ESTA DESMARCADO
    segment_times.forEach(segment_time => {
      selectedSegmentTime($event, segment_time, day)
      let INDEX = selected_segment_time.value.findIndex(seg_time => seg_time == segment_time.id+'-'+day)
      if(INDEX != -1){
        selected_segment_time.value.splice(INDEX, 1)
      }
    })
  }
}

const selectSegmentTimeAllGroups = ($event, segment_times) => {
  if($event.target.checked){
    // EL CHECKBOX ESTA MARCADO
    days.value.forEach(day => {
      segment_times.forEach(segment_time => {
        selectedSegmentTime($event, segment_time, day)
        let INDEX = selected_segment_time.value.findIndex(seg_time => seg_time == segment_time.id+'-'+day)
        if(INDEX == -1){
          selected_segment_time.value.push(segment_time.id+'-'+day)
        }
      })
    })
  }else{
    // EL CHECKBOX ESTA DESMARCADO
    days.value.forEach(day => {
      segment_times.forEach(segment_time => {
        selectedSegmentTime($event, segment_time, day)
        let INDEX = selected_segment_time.value.findIndex(seg_time => seg_time == segment_time.id+'-'+day)
        if(INDEX != -1){
          selected_segment_time.value.splice(INDEX, 1)
        }
      })
    })
  }
}

const selectedSegmentTime = ($event, segment_time, day) => {
  if($event.target.checked){
    // EL CHECKBOX ESTA MARCADO
    let INDEX = schedule_hour_veterinarie.value.findIndex(seg_time => seg_time.id_seg == segment_time.id+'-'+day)
    if(INDEX == -1){
      schedule_hour_veterinarie.value.push({
        id_seg: segment_time.id+'-'+day,
        segment_time_id: segment_time.id,
        day: day,
      })
    }
    
  }else{
    // EL CHECKBOX ESTA DESMARCADO
    let INDEX = schedule_hour_veterinarie.value.findIndex(seg_time => seg_time.id_seg == segment_time.id+'-'+day)
    if(INDEX != -1){
      schedule_hour_veterinarie.value.splice(INDEX, 1)
    } 
  }
}

const store = async() => {
  warning.value = null

  if(!form.value.name){
    warning.value = "Se debe llenar el nombre del veterinario"

    return
  }
  if(!form.value.surname){
    warning.value = "Se debe llenar el apellido del veterinario"

    return
  }
  if(!form.value.phone){
    warning.value = "Se debe llenar el teléfono del veterinario"

    return
  }
  if(!form.value.n_document){
    warning.value = "Se debe llenar el Nº de documento del veterinario"

    return
  }
  if (calculateAge(form.value.birthday) < 18) {
    warning.value = "El usuario debe ser mayor de 18 años"
    
    return
  }
  if(!form.value.gender){
    warning.value = "Se debe seleccionar el género del veterinario"

    return
  }
  if(!form.value.role_id){
    warning.value = "Se debe seleccionar el rol para el veterinario"

    return
  }
  if(!form.value.email){
    warning.value = "Se debe llenar el email del veterinario"

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
  if (form.value.password) {
    formdata.append("password", form.value.password)
  }
  formdata.append("role_id", form.value.role_id)
  if(form.value.birthday){
    formdata.append("birthday", form.value.birthday)
  }
  if (FILE_AVATAR.value) {
    formdata.append("imagen", FILE_AVATAR.value)
  }
  formdata.append("schedule_hour_veterinarie", JSON.stringify (schedule_hour_veterinarie.value))

  try {
    load_request.value = true

    const resp =  await $api('/veterinaries/'+route.params.id, {
      method: 'POST',
      body: formdata,
      onResponseError({ response }){
        console.log(response)
        error_exists.value = response._data.error
      },
    })

    console.log(resp)
    load_request.value = false
    if(resp.message == 403){
      warning.value = resp.message_text
    }else{
      success.value = "El veterinario se ha editado correctamente"
      setTimeout(() => {
        success.value = null
        warning.value = null
        error_exists.value = null
      }, 3500)
    }
  } catch (error) {
    console.log(error)
    error_exists.value = error
  }
}

const show = async() => {
  try {
    const resp = await $api('/veterinaries/'+route.params.id, {
      method: 'GET',
      onResponseError({ response }){
        console.log(response)
        error_exists.value = response._data.error
      },
    })

    console.log(resp)
    veterinarie_selected.value = resp.veterinarie
    form.value.name = veterinarie_selected.value.name
    form.value.surname = veterinarie_selected.value.surname
    form.value.email = veterinarie_selected.value.email
    form.value.phone = veterinarie_selected.value.phone
    form.value.type_document = veterinarie_selected.value.type_document
    form.value.n_document = veterinarie_selected.value.n_document
    form.value.designation = veterinarie_selected.value.designation
    form.value.gender = veterinarie_selected.value.gender
    form.value.birthday = veterinarie_selected.value.birthday
    form.value.role_id = veterinarie_selected.value.role_id
    IMAGEN_PREVIZUALIZA.value = veterinarie_selected.value.avatar
    selected_segment_time.value = veterinarie_selected.value.selected_segment_times
    schedule_hour_veterinarie.value = veterinarie_selected.value.schedule_hour_veterinarie
    
  } catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  config()
  show()
})

definePage({
  meta: {
    permisssion: 'edit_veterinary',
  },
})
</script>


<template>
  <div>
    <VCard class="refer-and-earn-dialog pa-3 pa-sm-11">
      <VCardText class="pa-5">
        <div class="mb-6">
          <h4 class="text-h4 text-center mb-2">
            🧑‍⚕️ Editar Veterinario: {{ route.params.id }}
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
      <VCardText class="pa-5 py-0">
        <VBtn
          color="primary"
          class="mb-4"
          @click="store"
        >
          Editar
        </VBtn>
      </VCardText>
      <VCardText class="pa-5">
        <VTable>
          <thead>
            <tr>
              <th class="text-uppercase">
                DIAS/HORAS
              </th>
              <th
                v-for="(day, index) in days"
                :key="index"
                class="text-uppercase"
              >
                {{ day }}
              </th>
            </tr>
          </thead>
  
          <tbody>
            <tr
              v-for="item in hour_days"
              :key="item.hour"
            >
              <td>
                {{ item.hour_format }}
                <VCheckbox
                  v-if="!load_request"
                  label="Todos"
                  @click="selectSegmentTimeAllGroups($event, item.segments_time)"
                />
              </td>
              <td
                v-for="(day, index) in days"
                :key="index"
              >
                <div class="demo-space-x my-2">
                  <VCheckbox
                    v-if="!load_request"
                    label="Todos"
                    @click="selectSegmentTimeAll($event, item.segments_time, day)"
                  />
                  <template
                    v-for="(segment_time, segmentIndex) in item.segments_time"
                    :key="segmentIndex"
                  >
                    <VCheckbox
                      v-model="selected_segment_time"
                      :label="segment_time.hour_start_format+' '+segment_time.hour_end_format"
                      :value="segment_time.id+'-'+day"
                      @click="selectedSegmentTime($event, segment_time, day)"
                    />
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </VTable>
      </VCardText>
    </VCard>
  </div>
</template>

<style>
.v-selection-control .v-label {
  font-size: small;
}
.v-checkbox.v-input {
  margin: 0;
}
</style>

