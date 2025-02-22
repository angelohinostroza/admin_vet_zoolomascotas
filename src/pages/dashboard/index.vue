<!-- eslint-disable camelcase -->
<script setup>
import illustration1 from '@images/cards/illustration-1.png'
import illustration2 from '@images/cards/illustration-2.png'

const statisticsWithImages = ref([])

definePage({
  meta: {
    permisssion: 'all',
  },
})

const veterinarieNetIncome = async() => {
  try {
    const resp =  await $api('/kpi_veterinarie_net_income', {
      method: 'POST',
      body: {},
      onResponseError({ response }){
        console.log(response)
        error_exists.value = response._data.error
      },
    })

    console.log(resp)
    statisticsWithImages.value.push({
      title: 'V. + Ingresos netos',
      subtitle: resp.veterinarie_most_net_income.full_name,
      stats: resp.veterinarie_most_net_income.net_income_total+" PEN",
      change: resp.variation_percentage,
      image: resp.veterinarie_most_net_income.gender == 'M' ? illustration1 : illustration2,
      imgWidth: 99,
      color: 'primary',
    })
    veterinarieServicesAsigned()

  } catch (error) {
    console.log(error)
  }
}

const veterinarieServicesAsigned = async() => {
  try {
    const resp =  await $api('/kpi_veterinarie_most_asigned', {
      method: 'POST',
      body: {},
      onResponseError({ response }){
        console.log(response)
        error_exists.value = response._data.error
      },
    })

    console.log(resp)
    statisticsWithImages.value.push({
      title: 'V. + Servicios asignados',
      subtitle: resp.veterinarie_most_asigned.full_name,
      stats: resp.veterinarie_most_asigned.n_asigned+"",
      change: resp.variation_percentage,
      image: resp.veterinarie_most_asigned.gender == 'M' ? illustration1 : illustration2,
      imgWidth: 99,
      color: 'primary',
    })
  } catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  veterinarieNetIncome()
})
</script>

<template>
  <div>
    <VRow
      v-if="isPermission('show_report_grafics')"
      class="match-height"
    >
      <!-- 👉 Sales Overview -->
      <VCol
        cols="12"
        md="6"
      >
        <EcommerceSalesOverview />
      </VCol>

      <!-- 👉 Images Cards -->
      <VCol
        v-for="statistics in statisticsWithImages"
        :key="statistics.title"
        cols="12"
        sm="6"
        md="3"
      >
        <CardStatisticsWithImages v-bind="statistics" />
      </VCol>
            
      <!-- 👉 Total Visits -->
      <VCol
        cols="12"
        md="3"
        sm="6"
      >
        <EcommerceTotalVisits />
      </VCol>

      <!-- 👉 Weekly Sales -->
      <VCol
        cols="12"
        md="6"
      >
        <EcommerceWeeklySalesBg />
      </VCol>
      <VCol
        cols="12"
        md="3"
        sm="6"
      >
        <CrmCongratulationsNorris />
      </VCol>
      <VCol
        cols="12"
        md="6"
      >
        <LogisticsShipmentStatistics />
      </VCol>

      <!-- 👉 Weekly Sales -->
      <VCol
        cols="12"
        md="6"
      >
        <AnalyticsWeeklySales />
      </VCol>
    </VRow>
    <VRow
      v-if="!isPermission('show_report_grafics')"
      class="match-height d-flex justify-center"
    >
      <VCol
        cols="10"
        class="d-flex justify-center"
      >
        <img
          src="/src/assets/images/pages/dashboard.jpg"
          class="dashboard-image"
        >  
      </VCol>
    </VRow>
  </div>
</template>

<style lang="scss">
.card-statistics-image {
  display: flex;
  justify-content: flex-end; 
  align-items: center; 
  max-width: 190px; 
}
.dashboard-image {
  max-width: 100%;  /* Para que no sea más grande que su contenedor */
  height: auto;  /* Mantiene la proporción */
  display: block;  /* Evita márgenes no deseados */
  margin: 0 auto;  /* Centra la imagen */
  min-width: 300px;  /* Establece un tamaño mínimo */
  max-height: 77vh;  /* Evita que sea demasiado alta en pantallas grandes */
  object-fit: contain;  /* Ajusta la imagen sin recortarla */
}
@media (max-width: 600px) {
  .dashboard-image {
    min-width: 200px;  /* En móviles aún más pequeño si es necesario */
  }
}
</style>
