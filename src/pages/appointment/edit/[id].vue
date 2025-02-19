<!-- eslint-disable sonarjs/no-collapsible-if -->
<!-- eslint-disable sonarjs/no-identical-functions -->
<!-- eslint-disable camelcase -->
<script setup>
const route = useRoute('appointment-edit-id')

const form = ref({
  date_appointment: null,
  time: null,
  amount: null,
  method_payment: 'EFECTIVO',
  amount_add: null,
  state: 1,
})

const warning = ref(null)
const success = ref(null)
const error_exists = ref(null)

const method_payments = ref([
  "EFECTIVO",
  "DEPOSITO",
  "YAPE",
  "PLIN",
])

const veterinarie_time_availability = ref([])
const segment_time_veterinaries = ref([])
const selected_segment_times = ref([])
const veterinarie_id = ref(null)
const reason = ref(null)
const appointment_selected = ref(null)

const filter = async () => {
  try {
    if(!form.value.date_appointment){
      warning.value = "Es necesario ingresar un fecha"
      
      return 
    }
    let data = {
      date_appointment: form.value.date_appointment,
      hour: form.value.time,
    }

    const resp =  await $api('/appointments/filter-availability', {
      method: 'POST',
      body: data,
      onResponseError({ response }){
        console.log(response)
        error_exists.value = response._data.error
      },
    })

    console.log(resp)
    warning.value = null
    veterinarie_time_availability.value = resp.veterinarie_time_availability
  } catch (error) {
    console.log(error)
  }

}

const selectedSegmentHour = (veterinarie_time, segment_time_group) => {
  veterinarie_time.segment_times = segment_time_group.segment_times
  selected_segment_times.value = []
  segment_time_veterinaries.value = []
  console.log(selected_segment_times.value)
}

const reset = () => {
  form.value.date_appointment = null
  form.value.time = null
  veterinarie_time_availability.value = []
  segment_time_veterinaries.value = []
  selected_segment_times.value = []
}

const addSelectedSegmentTime = (veterinarie_time, segment_time) => {

  let INDEX = selected_segment_times.value.findIndex(item => item.veterinarie_id == veterinarie_time.id && item.segment_time_id == segment_time.veterinarie_schedule_hour_id)
  if(INDEX != -1){
    selected_segment_times.value.splice(INDEX, 1)
  }else{
    selected_segment_times.value.push({
      veterinarie_id: veterinarie_time.id,
      segment_time_id: segment_time.veterinarie_schedule_hour_id,
    })
  }
  veterinarie_id.value = veterinarie_time.id
  selected_segment_times.value = selected_segment_times.value.filter(item => {
    return item.veterinarie_id == veterinarie_time.id
  })
  segment_time_veterinaries.value = segment_time_veterinaries.value.filter(item => {
    return item.indexOf(veterinarie_time.id+"-") != -1
  })
  console.log(selected_segment_times.value)
}

const fieldsClean = () => {
  form.value.date_appointment = null
  form.value.time = null
  veterinarie_time_availability.value = []
  segment_time_veterinaries.value = []
  selected_segment_times.value = []
}

const update = async() => {
  try {
    warning.value = null;error_exists.value = null;success.value = null
    if(form.value.date_appointment){
      if(selected_segment_times.value.length == 0){
        warning.value = "Es necesario asignarle un horario a la cita medica"
        
        return
      }
    }
    if(!reason.value){
      warning.value = "Es requerido digitar una razon para la atención de la mascota"
      
      return
    }
    if(!select_pet.value){
      warning.value = "Es requerido seleccionar una mascota"
      
      return
    }
    if(!form.value.amount){
      warning.value = "Es requerido ingresar el costo de la cita medica"
      
      return
    }

    let data = {
      veterinarie_id: veterinarie_id.value,
      pet_id: select_pet.value.id,
      reason: reason.value,
      amount: form.value.amount,
      selected_segment_times: selected_segment_times.value,
      state: form.value.state,
    }
    if(form.value.date_appointment){
      data.date_appointment = form.value.date_appointment
    }

    const resp =  await $api('/appointments/'+route.params.id, {
      method: 'PATCH',
      body: data,
      onResponseError({ response }){
        console.log(response)
        error_exists.value = response._data.error
      },
    })

    console.log(resp)
    if(resp.message == 403) {
      warning.value = resp.message_text
    }else{
      success.value = "La cita medica se ha editado correctamente"
      show()
    }
    fieldsClean()
  } catch (error) {
    console.log(error)
  }
}

// CODIGO PARA LA BUSQUEDA DEL PACIENTE(MASCOTA)
const loading = ref(false)
const search = ref()
const select_pet = ref(null)
const items = ref([])

const querySelections = async query => {
  loading.value = true

  // Simulated ajax query
  setTimeout(async () => {
   
    const resp = await $api("/appointments/search-pets/"+query, {
      method: 'GET',
      onResponseError({ response }){
        console.log(response)
        error_exists.value = response._data.error
      },
    })

    console.log(resp)
    items.value = resp.pets
    loading.value = false
  }, 500)
}

watch(search, query => {
  if(query &&  query.length > 1){
    querySelections(query)
  }else{
    items.value = []
  }

})

// FIN DE LA BUSQUEDA DEL PACIENTE
definePage({
  meta: {
    permisssion: 'edit_appointment',
  },
})

const show = async() => {
  try {
    const resp = await $api("/appointments/"+route.params.id, {
      method: 'GET',
      onResponseError({ response }){
        console.log(response)
        error_exists.value = response._data.error
      },
    })

    console.log(resp)
    appointment_selected.value = resp.appointment
    reason.value = appointment_selected.value.reason
    form.value.amount = appointment_selected.value.amount
    form.value.state = appointment_selected.value.state
    select_pet.value = appointment_selected.value.pet
    veterinarie_id.value = appointment_selected.value.veterinarie_id
  } catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  show()
})
</script>

<template>
  <div>
    <VCardText class="pa-5">
      <div class="mb-1">
        <h4 class="text-h4 text-center mb-1">
          Editar Cita 👩‍💻 : #{{ route.params.id }}
        </h4>
      </div>
    </VCardText>

    <VCard
      title="🔎 Busqueda:"
      class="pa-4"
    >
      <VRow>
        <VCol cols="4">
          <AppDateTimePicker
            v-model="form.date_appointment"
            label="Fecha de la cita"
            :config="{ minDate: 'today',disable: [
              (date) => {
                // Deshabilita sábados (6) y domingos (0)
                return date.getDay() === 0 || date.getDay() === 6;
              },
            ]}"
          />
        </VCol>
        <VCol cols="3">
          <AppDateTimePicker
            v-model="form.time"
            label="Hora de la cita"
            :config="{ enableTime: true, noCalendar: true, dateFormat: 'H:i' }"
          />
        </VCol>
        <VCol cols="3">
          <VBtn
            color="info"
            class="mx-1"
            prepend-icon="ri-search-2-line"
            @click="filter"
          />
          <VBtn
            color="secondary"
            class="mx-1"
            prepend-icon="ri-restart-line"
            @click="reset"
          />
        </VCol>
      </VRow>
    </VCard>

    <VCard
      title="📅 Disponibilidad:"
      class="pa-4 mt-4"
    >
      <VRow>
        <VCol cols="8">
          <VTable>
            <thead>
              <tr>
                <th class="text-uppercase">
                  Veterinario
                </th>
                <th class="text-uppercase">
                  Tiempos activos
                </th>
                <th class="text-uppercase">
                  Segmentos de tiempos
                </th>
              </tr>
            </thead>

            <tbody>
              <template
                v-for="(veterinarie_time, index) in veterinarie_time_availability"
                :key="index"
              >
                <tr>
                  <td>
                    {{ veterinarie_time.full_name }}
                  </td>
                  <td>
                    <ul>
                      <li
                        v-for="(segment_time_group, indexA) in veterinarie_time.segment_time_groups"
                        :key="indexA"
                        style="list-style: none;"
                      >
                        <VBtn
                          color="success"
                          class="mx-1"
                          prepend-icon="ri-file-add-line"
                          variant="text"
                          @click="selectedSegmentHour(veterinarie_time,segment_time_group)"
                        />
                        {{ segment_time_group.hour_format }}({{ segment_time_group.count_availability }})
                      </li>
                    </ul>
                  </td>
                  <td>
                    <ul>
                      <li
                        v-for="(segment_time, indexB) in veterinarie_time.segment_times"
                        :key="indexB"
                        style="list-style: none;"
                      >
                        <VCheckbox
                          v-if="!segment_time.check"
                          v-model="segment_time_veterinaries"
                          :label="segment_time.schedule_hour.hour_start_format+' '+segment_time.schedule_hour.hour_end_format"
                          :value="veterinarie_time.id+'-'+segment_time.veterinarie_schedule_hour_id"
                          @click="addSelectedSegmentTime(veterinarie_time,segment_time)"
                        />
                        <label
                          v-if="segment_time.check"
                          for=""
                          style="font-weight: bold;"
                        >{{ segment_time.schedule_hour.hour_start_format+' '+segment_time.schedule_hour.hour_end_format }}</label>
                      </li>
                    </ul>
                  </td>
                </tr>
              </template>
            </tbody>
          </VTable>
        </VCol>
        <VCol cols="5">
          <VTextarea
            v-model="reason"
            label="Razon de la cita:"
            placeholder="Text"
          />
        </VCol>
      </VRow>
    </VCard>
    <VCard
      v-if="appointment_selected"
      title="⏱️ Horario de la Cita:"
      class="pa-4 mt-4"
    >
      <VRow>
        <VCol cols="3">
          <VSelect
            v-model="form.state"
            :items="[
              {
                name: 'Pendiente',
                id: 1,
              },
              {
                name: 'Cancelado',
                id: 2,
              },
              {
                name: 'Atendido',
                id: 3,
              }
            ]"
            label="Estado de la cita"
            item-title="name"
            item-value="id"
            :disabled="appointment_selected.state == 2 || appointment_selected.state == 3 ? true : false"
            placeholder="Select Estado"
            eager
          />
        </VCol>
        <VCol cols="8">
          <VTable>
            <thead>
              <tr>
                <th class="text-uppercase">
                  Veterinario
                </th>
                <th class="text-uppercase">
                  Dia de la cita
                </th>
                <th class="text-uppercase">
                  Horario de atención
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>
                  {{ appointment_selected.veterinarie.full_name }}
                </td>
                <td>
                  {{ appointment_selected.date_appointment }}
                </td>
                <td>
                  <ul>
                    <template
                      v-for="(schedule, index) in appointment_selected.schedules"
                      :key="index"
                    >
                      <li>
                        <label
                          for=""
                          style="font-weight: bold;"
                        >{{ schedule.schedule_hour.hour_start_format+' '+schedule.schedule_hour.hour_end_format }}</label>
                      </li>
                    </template>
                  </ul>
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCol>
      </VRow>
    </VCard>
    <VCard
      title="🐶 Paciente:"
      class="pa-4 mt-4"
    >
      <VRow>
        <VCol cols="4">
          <VAutocomplete
            v-model="select_pet"
            v-model:search="search"
            :loading="loading"
            :items="items"
            item-title="name"
            item-value="id"
            return-object
            placeholder="Ingresa información de la mascota"
            label="¿Quien es la mascotita?"
            variant="underlined"
            :menu-props="{ maxHeight: '200px' }"
          />
        </VCol>
        <VCol
          v-if="select_pet"
          cols="2"
        >
          <label for="">Especie: {{ select_pet.specie }}</label>
          <br>
          <label for="">Raza: {{ select_pet.breed }}</label>
        </VCol>
        <VCol
          v-if="select_pet"
          cols="3"
        >
          <label for="">Nombre y Apellido: {{ select_pet.owner.names+ ' ' + select_pet.owner.surnames }}</label>
          <br>
          <label for="">Telefono: {{ select_pet.owner.phone }}</label>
          <br>
          <label for="">Documento: {{ select_pet.owner.type_document }} - {{ select_pet.owner.n_document }}</label>
        </VCol>
      </VRow>
    </VCard>
    <VCard
      title="💵 Pagos:"
      class="pa-4 mt-4"
    >
      <VRow>
        <VCol cols="4">
          <VTextField
            v-model="form.amount"
            label="Costo de la cita:"
            type="number"
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

    <VCardText class="pa-0 py-3 text-end">
      <VBtn
        color="primary"
        class="mb-4"
        @click="update"
      >
        Editar
      </VBtn>
    </VCardText>
  </div>
</template>
