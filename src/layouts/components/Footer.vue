<template>
  <div class="h-100 d-flex align-center justify-space-between text-medium-emphasis">
    <!-- 👉 Footer: left content -->
    <div class="d-flex align-center text-base">
      &copy;
      {{ new Date().getFullYear() }},
      Zoolomascotas
      <VIcon
        icon="ri-heart-fill"
        color="error"
        size="1.25rem"
        class="mx-1"
      />
    </div>
  </div>
</template>
