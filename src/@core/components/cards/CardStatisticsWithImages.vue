<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  stats: {
    type: String,
    required: true,
  },
  change: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: false,
    default: 'primary',
  },
})

const isPositive = computed(() => Math.sign(props.change) === 1)
</script>

<template>
  <VCard class="position-relative">
    <VCardText>
      <h6 class="text-h6 mb-2">
        {{ props.title }}
      </h6>
      <VChip
        v-if="props.subtitle"
        size="small"
        :color="props.color"
        class="mb-5"
      >
        {{ props.subtitle }}
      </VChip>

      <div class="d-flex align-center flex-wrap">
        <h4 class="text-h4 me-2">
          {{ props.stats }}
        </h4>

        <div
          class="text-body-1"
          :class="isPositive ? 'text-success' : 'text-error'"
        >
          {{ isPositive ? `+${props.change}` : props.change }}%
        </div>
      </div>
    </VCardText>

    <VSpacer />

    <div class="illustrator-img">
      <img
        v-if="props.image"
        :src="props.image"
        class="card-statistics-image"
      >
    </div>
  </VCard>
</template>

<style lang="scss">
.illustrator-img {
  position: absolute;
  right: -20px; /* Mueve la imagen más a la derecha */
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
}

.card-statistics-image {
  width: 130px; /* Agranda la imagen */
  max-width: 200px; /* Máximo tamaño permitido */
  height: auto;
}
</style>
