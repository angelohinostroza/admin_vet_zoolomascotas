<!-- eslint-disable camelcase -->
<script setup>
const router = useRouter()
const warning = ref(null)
const success = ref(null)
const error_exists = ref(null)

const event_date = ref(null)
const currentPage = ref(1)

const pet_selected = ref(null)
const historial_records = ref([])

const list = async() => {
  if(!select_pet.value){
    warning.value = "Necesitas seleccionar una mascota para empezar el proceso de búsqueda"
    
    return
  }
  let data = {
    pet_id: select_pet.value.id,
    start_date: event_date.value ? event_date.value.split("to")[0] : null,
    end_date: event_date.value ? event_date.value.split("to")[1] : null,
  }

  const resp =  await $api('/medical-records/pet?page='+currentPage.value
    , {
      method: 'POST',
      body: data,
      onResponseError({ response }){
        error_exists.value = response
        console.log(response)
      },
    })

  warning.value = null
  error_exists.value = null
  console.log(resp)
  pet_selected.value = resp.pet
  historial_records.value = resp.historial_records.data
}

const search_medical_record = () => {
  list()  
}

const reset = () => {
  // pet_selected.value = null
  // historial_records.value = []
  // select_pet.value = []
  event_date.value = null
  list()
}

// onMounted(() => {
//     list();  
// })

// CODIGO PARA LA BUSQUEDA DEL PACIENTE(MASCOTA)
const loading = ref(false)
const search = ref()
const select_pet = ref(null)
const items = ref([])

const querySelections = async query => {
  if (!query || query.length < 2) {
    items.value = []

    return
  }

  loading.value = true

  try {
    const resp = await $api(`/appointments/search-pets/${query}`, {
      method: 'GET',
      onResponseError({ response }) {
        console.log(response)
      },
    })

    console.log(resp)

    items.value = resp.pets.map(pet => ({
      id: pet.id,
      name: pet.name, 
      specie: pet.specie,
      breed: pet.breed,
      owner: pet.owner,
      searchText: `${pet.name} ${pet.owner.names} ${pet.owner.surnames} ${pet.owner.n_document}`,
    }))
  } catch (error) {
    console.error(error)
  }

  loading.value = false
}

watch(search, query => {
  if (query && query.length > 1) {
    querySelections(query)
  } else {
    items.value = []
  }
})

watch(select_pet, newValue => {
  if (newValue) {
    search.value = newValue.name 
  }

})

// FIN DE LA BUSQUEDA DEL PACIENTE
</script>

<template>
  <div>
    <VCardText class="pa-5">
      <div class="mb-1">
        <h4 class="text-h4 text-center mb-1">
          Historial Médico 🐕
        </h4>
      </div>
    </VCardText>

    <VCard
      title="🔎 Busqueda:"
      class="pa-4"
    >
      <VRow>
        <VCol cols="4">
          <VAutocomplete
            v-model="select_pet"
            v-model:search="search"
            :loading="loading"
            :items="items"
            item-title="searchText"
            item-value="id"
            return-object
            placeholder="Ingresa información de la mascota o del dueño"
            label="¿Quién es la mascota?"
            variant="underlined"
            :menu-props="{ maxHeight: '200px' }"
          >
            <template #no-data>
              <div
                v-if="search && search.length > 1 && !loading"
                class="text-center pa-0"
              >
                <p>Sin resultados</p>
                <VBtn
                  color="primary"
                  @click="router.push({name: 'pet-add'})"
                >
                  Crear Mascota
                </VBtn>
              </div>
            </template>
          </VAutocomplete>
        </VCol>
        <VCol cols="4">
          <AppDateTimePicker
            v-model="event_date"
            label="Fecha del servicio"
            :config="{ mode: 'range' }"
          />
        </VCol>
                
        <VCol cols="3">
          <VBtn
            color="info"
            class="mx-1"
            prepend-icon="ri-search-2-line"
            @click="search_medical_record"
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
      <strong>En el servidor hubo un error al consultar</strong>
    </VAlert>
    <VAlert
      v-if="success"
      type="success"
      class="mt-3"
    >
      <strong>{{ success }}</strong>
    </VAlert>

    <VRow
      v-if="pet_selected"
      class="my-4"
    >
      <VCol cols="4">
        <VCard>
          <VCardText class="text-center pt-12 pb-6">
            <!-- 👉 Avatar -->
            <VAvatar
              rounded="lg"
              :size="120"
              color="primary"
              variant="tonal"
            >
              <VImg :src="pet_selected.avatar" />
              <!--
                <span
                v-else
                class="text-5xl font-weight-medium"
                >
                {{ avatarText(props.userData.fullName) }}
                </span> 
              -->
            </VAvatar>

            <h5 class="text-h5 mt-4">
              {{ pet_selected.name }}
            </h5>

            <VChip
              color="primary"
              size="small"
              class="text-capitalize mt-4"
            >
              {{ pet_selected.breed }}
            </VChip>
          </VCardText>

          <VCardText class="pb-6">
            <VRow
              justify="center"
              align="center"
              class="gap-4"
            >
              <!-- 👉 N° de Citas -->
              <VCol
                cols="auto"
                class="d-flex align-center"
              >
                <VAvatar
                  :size="40"
                  rounded
                  color="primary"
                  variant="tonal"
                  class="me-2"
                >
                  <VIcon
                    size="24"
                    icon="ri-list-check-3"
                  />
                </VAvatar>
                <div class="text-center">
                  <h5 class="text-h5">
                    {{ pet_selected.n_appointment }}
                  </h5>
                  <span>N° de Citas</span>
                </div>
              </VCol>

              <!-- 👉 N° de Vacunas -->
              <VCol
                cols="auto"
                class="d-flex align-center"
              >
                <VAvatar
                  :size="40"
                  rounded
                  color="primary"
                  variant="tonal"
                  class="me-2"
                >
                  <VIcon
                    size="24"
                    icon="ri-syringe-line"
                  />
                </VAvatar>
                <div class="text-center">
                  <h5 class="text-h5">
                    {{ pet_selected.n_vaccination }}
                  </h5>
                  <span>N° de Vacunas</span>
                </div>
              </VCol>

              <!-- 👉 N° de Cirugías -->
              <VCol
                cols="auto"
                class="d-flex align-center"
              >
                <VAvatar
                  :size="40"
                  rounded
                  color="primary"
                  variant="tonal"
                  class="me-2"
                >
                  <VIcon
                    size="24"
                    icon="ri-microscope-line"
                  />
                </VAvatar>
                <div class="text-center">
                  <h5 class="text-h5">
                    {{ pet_selected.n_surgerie }}
                  </h5>
                  <span>N° de Cirugías</span>
                </div>
              </VCol>
            </VRow>
          </VCardText>



          <!-- 👉 Details -->
          <VCardText class="pb-6">
            <div class="text-body-2 mb-4 text-disabled">
              Datos Generales
            </div>
            <div class="d-flex flex-column gap-y-4">
              <div class="d-flex align-center gap-x-2">
                <VIcon
                  icon="ri-star-smile-line"
                  size="24"
                />
                <div class="font-weight-medium">
                  Nombre:
                </div>
                <div>
                  {{ pet_selected.name }}
                </div>
              </div>

              <div class="d-flex align-center gap-x-2">
                <VIcon
                  icon="ri-check-line"
                  size="24"
                />
                <div class="font-weight-medium">
                  Sexo:
                </div>
                <div>
                  {{ pet_selected.gender == 'M' ? 'Macho' : 'Hembra' }}
                </div>
              </div>

              <div class="d-flex align-center gap-x-2">
                <VIcon
                  icon="ri-skull-2-line"
                  size="24"
                />
                <div class="font-weight-medium">
                  Especie:
                </div>
                <div>
                  {{ pet_selected.specie }}
                </div>
              </div>

              <div class="d-flex align-center gap-x-2">
                <VIcon
                  icon="ri-pulse-line"
                  size="24"
                />
                <div class="font-weight-medium">
                  Raza:
                </div>
                <div>
                  {{ pet_selected.breed }}
                </div>
              </div>

              <div class="d-flex align-center gap-x-2">
                <VIcon
                  icon="ri-calendar-2-fill"
                  size="24"
                />
                <div class="font-weight-medium">
                  F. Nacimiento:
                </div>
                <div>
                  {{ pet_selected.dirth_date }}
                </div>
              </div>
              <div class="d-flex align-center gap-x-2">
                <VIcon
                  icon="ri-medicine-bottle-line"
                  size="24"
                />
                <div class="font-weight-medium">
                  Peso:
                </div>
                <div>
                  {{ pet_selected.weight }} KG
                </div>
              </div>
            </div>

            <div class="text-body-2 text-disabled mt-6 mb-4">
              Responsable
            </div>
            <div class="d-flex flex-column gap-y-4">
              <div class="d-flex align-center gap-x-2">
                <VIcon
                  icon="ri-user-line"
                  size="24"
                />
                <div class="font-weight-medium">
                  Nombre Completo:
                </div>
                <div class="text-truncate">
                  {{ pet_selected.owner.names+' '+pet_selected.owner.surnames }}
                </div>
              </div>

              <div class="d-flex align-center gap-x-2">
                <VIcon
                  icon="ri-smartphone-line"
                  size="24"
                />
                <div class="font-weight-medium">
                  Telefono:
                </div>
                <div class="text-truncate">
                  {{ pet_selected.owner.phone }}
                </div>
              </div>

              <div class="d-flex align-center gap-x-2">
                <VIcon
                  icon="ri-dual-sim-1-line"
                  size="24"
                />
                <div class="font-weight-medium">
                  Tipo de Documento:
                </div>
                <div class="text-truncate">
                  {{ pet_selected.owner.type_document }}
                </div>
              </div>

              <div class="d-flex align-center gap-x-2">
                <VIcon
                  icon="ri-id-card-line"
                  size="24"
                />
                <div class="font-weight-medium">
                  N° de Documento:
                </div>
                <div class="text-truncate">
                  {{ pet_selected.owner.n_document }}
                </div>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="8">
        <VCard title="Historial de servicios">
          <VCardText>
            <VTimeline
              side="end"
              align="start"
              line-inset="9"
              truncate-line="start"
              density="compact"
            >
              <template
                v-for="(historial_record, index) in historial_records"
                :key="index"
              >
                <!-- SECTION Timeline Item: Appointment -->
                <VTimelineItem
                  v-if="historial_record.event_type == 1"
                  size="x-small"
                  dot-color="primary"
                >
                  <!-- 👉 Header -->
                  <div class="d-flex justify-space-between align-center flex-wrap mb-2">
                    <div class="app-timeline-title">
                      Cita Medica - {{ historial_record.event_date }} <VChip
                        v-if="historial_record.state == 1"
                        class="mx-2"
                        color="warning"
                      >
                        Pendiente
                      </VChip>
                      <VChip
                        v-if="historial_record.state == 2"
                        class="mx-2"
                        color="error"
                      >
                        Cancelado
                      </VChip>
                      <VChip
                        v-if="historial_record.state == 3"
                        class="mx-2"
                        color="success"
                      >
                        Atendido
                      </VChip>   
                    </div>
                    <span class="app-timeline-meta">{{ historial_record.created_at }}</span>
                  </div>
    
                  <div class="app-timeline-text mt-3">
                    La atención inicia @{{ historial_record.hour_start }} hasta @{{ historial_record.hour_end }}
                    <br>
                    Costo : {{ historial_record.amount }} PEN
                  </div>
    
                  <!-- 👉 Person -->
                  <div class="d-flex justify-space-between align-center flex-wrap">
                    <!-- 👉 Avatar & Personal Info -->
                    <div class="d-flex align-center my-2">
                      <VAvatar
                        size="32"
                        class="me-2"
                        :image="historial_record.veterinarie.imagen"
                      />
                      <div class="d-flex flex-column">
                        <p class="text-sm font-weight-medium text-medium-emphasis mb-0">
                          {{ historial_record.veterinarie.full_name }} (Veterinario)
                        </p>
                        <span class="text-sm">{{ historial_record.veterinarie.designation }}</span>
                      </div>
                    </div>
                  </div>
                </VTimelineItem>
                <!-- !SECTION -->
    
                <!-- SECTION Timeline Item: Vaccination -->
                <VTimelineItem
                  v-if="historial_record.event_type == 2"
                  size="x-small"
                  dot-color="warning"
                >
                  <!-- 👉 Header -->
                  <div class="d-flex justify-space-between align-center flex-wrap mb-2">
                    <div class="app-timeline-title">
                      Vacuna - {{ historial_record.event_date }} <VChip
                        v-if="historial_record.state == 1"
                        class="mx-2"
                        color="warning"
                      >
                        Pendiente
                      </VChip>
                      <VChip
                        v-if="historial_record.state == 2"
                        class="mx-2"
                        color="error"
                      >
                        Cancelado
                      </VChip>
                      <VChip
                        v-if="historial_record.state == 3"
                        class="mx-2"
                        color="success"
                      >
                        Atendido
                      </VChip>    
                    </div>
                    <span class="app-timeline-meta">{{ historial_record.created_at }}</span>
                  </div>
    
                  <div class="app-timeline-text mt-3">
                    La hora de la vacunación inicia @{{ historial_record.hour_start }} y termina @{{ historial_record.hour_end }}
                    <br>
                    Costo : {{ historial_record.amount }} PEN
                    <br>
                    Lugar: {{ historial_record.outside == 0 ? 'Dentro de la veterinaria' : 'Fuera de la veterinaria' }}
                    <br>
                    Próxima fecha: {{ historial_record.nex_due_date }}
                  </div>
    
                  <!-- 👉 Person -->
                  <div class="d-flex justify-space-between align-center flex-wrap">
                    <!-- 👉 Avatar & Personal Info -->
                    <div class="d-flex align-center my-2">
                      <VAvatar
                        size="32"
                        class="me-2"
                        :image="historial_record.veterinarie.imagen"
                      />
                      <div class="d-flex flex-column">
                        <p class="text-sm font-weight-medium text-medium-emphasis mb-0">
                          {{ historial_record.veterinarie.full_name }} (Vaterinario)
                        </p>
                        <span class="text-sm">{{ historial_record.veterinarie.designation }}</span>
                      </div>
                    </div>
                  </div>
                </VTimelineItem>
                <!-- !SECTION -->
    
                <!-- SECTION Timeline Item: Surgerie -->
                <VTimelineItem
                  v-if="historial_record.event_type == 3"
                  size="x-small"
                  dot-color="success"
                >
                  <!-- 👉 Header -->
                  <div class="d-flex justify-space-between align-center flex-wrap mb-2">
                    <div class="app-timeline-title">
                      Cirujía - {{ historial_record.event_date }} <VChip
                        v-if="historial_record.state == 1"
                        class="mx-2"
                        color="warning"
                      >
                        Pendiente
                      </VChip>
                      <VChip
                        v-if="historial_record.state == 2"
                        class="mx-2"
                        color="error"
                      >
                        Cancelado
                      </VChip>
                      <VChip
                        v-if="historial_record.state == 3"
                        class="mx-2"
                        color="success"
                      >
                        Atendido
                      </VChip>     
                    </div>
                    <span class="app-timeline-meta">{{ historial_record.created_at }}</span>
                  </div>
    
                  <div class="app-timeline-text mt-3">
                    La hora de la cirujía inicia @{{ historial_record.hour_start }} y termina @{{ historial_record.hour_end }}
                    <br>
                    Costo : {{ historial_record.amount }} PEN
                    <br>
                    Lugar: {{ historial_record.outside == 0 ? 'Dentro de la veterinaria' : 'Fuera de la veterinaria' }}
                    <br>
                    Tipo de Cirujía: {{ historial_record.surgerie_type }}
                  </div>
    
                  <!-- 👉 Person -->
                  <div class="d-flex justify-space-between align-center flex-wrap">
                    <!-- 👉 Avatar & Personal Info -->
                    <div class="d-flex align-center my-2">
                      <VAvatar
                        size="32"
                        class="me-2"
                        :image="historial_record.veterinarie.imagen"
                      />
                      <div class="d-flex flex-column">
                        <p class="text-sm font-weight-medium text-medium-emphasis mb-0">
                          {{ historial_record.veterinarie.full_name }} (Vaterinario)
                        </p>
                        <span class="text-sm">{{ historial_record.veterinarie.designation }}</span>
                      </div>
                    </div>
                  </div>
                </VTimelineItem>
                <!-- !SECTION -->
              </template>
            </VTimeline>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
