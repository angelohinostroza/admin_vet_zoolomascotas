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
    <VRow class="match-height">
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
  </div>
</template>

<style lang="scss">
.card-statistics-image {
  display: flex;
  justify-content: flex-end; /* Alinea la imagen a la derecha */
  align-items: center; /* Asegura que esté alineada verticalmente */
  max-width: 190px; /* Ajusta el tamaño */
}
</style>
