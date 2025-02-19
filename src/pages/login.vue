<!-- eslint-disable camelcase -->
<script setup>
import { useGenerateImageVariant } from '@/@core/composable/useGenerateImageVariant'
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue'
import authV2LoginIllustrationBorderedDark from '@images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2LoginIllustrationDark from '@images/pages/foto-portada-login-dark.jpg'
import authV2LoginIllustrationLight from '@images/pages/foto-portada-login-light.jpg'
import authV2LoginMaskDark from '@images/pages/auth-v2-login-mask-dark.png'
import authV2LoginMaskLight from '@images/pages/auth-v2-login-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

const form = ref({
  email: 'hmoralesangelof@gmail.com',
  password: '12345678',
  remember: false,
})

const route = useRoute()
const router = useRouter()

const error_exists = ref(null)
const success_exists = ref(null)

definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})

const login = async () => {
  try {
    error_exists.value = null;success_exists.value = null

    const resp =  await $api('/auth/login', {
      method: 'POST',
      body: {
        email: form.value.email,
        password: form.value.password,
      },
      onResponseError({ response }){
        console.log(response._data.error)
        error_exists.value = response._data.error
      },
    })

    console.log(resp)

    localStorage.setItem('token', resp.access_token)
    localStorage.setItem('user', JSON.stringify(resp.user))
    success_exists.value = true
    setTimeout(async () => {
      await nextTick(() => {
        //router.replace(route.query.to ? String(route.query.to) : '/')
        
        document.location.reload()
      })
    }, 1500)
  } catch (error) {
    console.log(error)
  }
}

const isPasswordVisible = ref(false)
const authV2LoginMask = useGenerateImageVariant(authV2LoginMaskLight, authV2LoginMaskDark)
const authV2LoginIllustration = useGenerateImageVariant(authV2LoginIllustrationLight, authV2LoginIllustrationDark, authV2LoginIllustrationBorderedLight, authV2LoginIllustrationBorderedDark, true)
</script>

<template>
  <!--
    <RouterLink to="/">
    <div class="app-logo auth-logo">
    <VNodeRenderer :nodes="themeConfig.app.logo" />
    </div>
    </RouterLink>
  -->

  <VRow
    no-gutters
    class="auth-wrapper"
  >
    <VCol
      md="7"
      class="d-none d-md-flex align-center justify-center position-relative"
      style="height: 100vh; padding: 0;"
    >
      <div
        class="d-flex align-center justify-center"
        style="width: 100%; height: 100%;"
      >
        <img
          :src="authV2LoginIllustration"
          class="auth-illustration"
          alt="auth-illustration"
        >
      </div>
    </VCol>
    <VCol
      cols="12"
      md="5"
      class="auth-card-v2 d-flex align-center justify-center"
      style="background-color: rgb(var(--v-theme-surface));"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-5 pa-lg-7"
      >
        <VCardText>
          <div class="logo-container">
            <VNodeRenderer :nodes="themeConfig.app.logo" />
          </div>
         

          <p class="mb-0">
            Bienvenido por favor, inicia sesión con tu cuenta.
          </p>
        </VCardText>

        <VCardText>
          <VForm @submit.prevent="login">
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <VTextField
                  v-model="form.email"
                  autofocus
                  label="Email"
                  type="email"
                  placeholder="johndoe@email.com"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <VTextField
                  v-model="form.password"
                  label="Password"
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <VAlert
                  v-if="success_exists"
                  type="success"
                  class="my-2"
                >
                  Inicio de sesión exitoso
                </VAlert>

                <VAlert
                  v-if="error_exists"
                  type="error"
                  class="my-2"
                >
                  Error presentado: <strong>{{ error_exists }}</strong>
                </VAlert>

                <!-- login button -->
                <VBtn
                  class="my-2"
                  block
                  type="submit"
                >
                  Iniciar Sesión
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style scoped>
.auth-wrapper {
  height: 50vh;
}

.auth-illustration {
  width: 100%;
  height: 100%;
  object-position: center center; 
}
@media (min-width: 768px) {
  .auth-illustration {
    object-fit: cover; 
    object-position: center center;
  }
}
</style>
