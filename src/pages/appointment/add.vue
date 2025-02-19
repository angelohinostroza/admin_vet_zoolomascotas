<!-- eslint-disable camelcase -->
<!-- eslint-disable indent -->
<script setup>
const form = ref({
    date_appointment: null,
    time: null,
    amount: null,
    method_payment: 'EFECTIVO',
    amount_add: null,
})

const warning = ref(null)
const success = ref(null)
const error_exists = ref(null)
const searched = ref(false)

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

const filter = async () => {
    try {
      searched.value = false 
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
        searched.value = true
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
    reason.value = null
    searched.value = false 
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
    form.value.amount = null
    form.value.method_payment = 'EFECTIVO'
    form.value.amount_add = null
    veterinarie_time_availability.value = []
    segment_time_veterinaries.value = []
    selected_segment_times.value = []
    select_pet.value = null
    reason.value = null 
}

const store = async() => {
    try {
        warning.value = null
        if(!form.value.date_appointment){
            warning.value = "El campo de fecha es requerido"

            return
        }
        if(selected_segment_times.value.length == 0){
            warning.value = "Es necesario asignarle un horario a la cita medica"

            return
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
        if(!form.value.amount_add){
            warning.value = "Es requerido ingresar un adelanto del costo de la cita medica"

            return
        }
        if(parseInt(form.value.amount_add) > parseInt(form.value.amount)){
            warning.value = "El monto de adelanto no puede ser mayor al costo de la cita"

            return
        }
        let STATE_PAY = 1//PENDIENTE
        if(form.value.amount > form.value.amount_add){
            STATE_PAY = 2//PARCIAL
        }
        if(form.value.amount == form.value.amount_add){
            STATE_PAY = 3//COMPLETO
        }
        let data = {
            veterinarie_id: veterinarie_id.value,
            pet_id: select_pet.value.id,
            date_appointment: form.value.date_appointment,
            reason: reason.value,
            amount: form.value.amount,
            state_pay: STATE_PAY,
            method_payment: form.value.method_payment,
            adelanto: form.value.amount_add,
            selected_segment_times: selected_segment_times.value,
        }

        const resp =  await $api('/appointments', {
            method: 'POST',
            body: data,
            onResponseError({ response }){
                console.log(response)
                error_exists.value = response._data.error
            },
        })

        console.log(resp)
        success.value = "La cita medica se ha programado correctamente"
        setTimeout(() => {
            success.value = null
            warning.value = null
            error_exists.value = null
            fieldsClean()
        }, 1500)
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

//    query && query !== select.value && querySelections(query)
})

// FIN DE LA BUSQUEDA DEL PACIENTE
definePage({
    meta: {
        permisssion: 'register_appointment',
    },
})
</script>

<template>
  <div>
    <VCardText class="pa-5">
      <div class="mb-1">
        <h4 class="text-h4 text-center mb-1">
          Agregar Cita 👩‍💻
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
            class="mx-1"
            color="secondary"
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
                  Disponibilidad
                </th>
                <th class="text-uppercase">
                  Horas
                </th>
              </tr>
            </thead>

            <tbody>
              <!-- {{ segment_time_veterinaries }} -->
              <template v-if="veterinarie_time_availability.length > 0">
                <template
                  v-for="(veterinarie_time, indexA) in veterinarie_time_availability"
                  :key="indexA"
                >
                  <tr>
                    <td>
                      {{ veterinarie_time.full_name }}
                    </td>
                    <td>
                      <ul>
                        <li
                          v-for="(segment_time_group, index) in veterinarie_time.segment_time_groups"
                          :key="index"
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
                          v-for="(segment_time, index) in veterinarie_time.segment_times"
                          :key="index"
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
              </template>
              <tr v-if="searched && veterinarie_time_availability.length === 0">
                <td
                  colspan="3"
                  class="text-center text-danger"
                >
                  No hay horarios disponibles para la fecha seleccionada.
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCol>
        <VCol cols="5">
          <VTextarea
            v-model="reason"
            label="Razon de la cita:"
          />
        </VCol>
      </VRow>
    </VCard>
    <VCard
      title="🐾 Paciente:"
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
            label="¿Quién es la mascota?"
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
          <label for="">Documento: {{ select_pet.owner.n_document }}</label>
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
      <VRow>
        <VCol cols="4">
          <VSelect
            v-model="form.method_payment"
            :items="method_payments"
            label="Metodos de pago"
            item-title="name"
            item-value="id"
            eager
          />
        </VCol>
        <VCol cols="4">
          <VTextField
            v-model="form.amount_add"
            label="Adelanto:"
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
        @click="store"
      >
        Crear
      </VBtn>
    </VCardText>
  </div>
</template>
