<template>
  <v-card class="h-screen">
    <v-container>
      <v-row>
        <v-col sm="9" offset-sm="1" md="8" offset-md="2">
          <v-card
            class="mt-20vh"
            elevation="0"
          >
            <div class="text-center">
              <div v-if="route.query.email_verification_required && route.query.email_verification_required === 'none'">
                <h2 class="text-h4">{{ $t('Your registration is successful') }}</h2>
                <p class="mt-5">
                  {{ $t('You can now') }}
                  <NuxtLink :to="LocalPath.SIGN_IN">{{ $t('signIn') }}</NuxtLink>
                  {{ $t('to your account.') }}
                </p>
              </div>
              <div v-else>
                <h2 class="text-h4">Verify your email</h2>
                <p class="mt-5">
                  We've sent a verification email to <strong>{{ user.email }}</strong>. <br>
                  Please check your inbox and click the link to verify your email address.
                </p>
                <p
                  v-if="errorMsg"
                  class="text-red"
                >
                  {{ errorMsg }}
                </p>
                <v-btn
                  variant="text"
                  class="mt-5"
                  color="primary"
                  :loading="sending"
                  :disabled="resent"
                  @click="resendEmail"
                >
                  {{ resent ? 'Resent' : 'Resend email' }}
                </v-btn>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: ['auth']
})

const route = useRoute()
const sending = ref(false)
const resent = ref(false)
const errorMsg = ref()
const user = useUser()

const resendEmail = async () => {
  errorMsg.value = undefined
  sending.value = true
  const {data, error} = await useFetch('/api/account/registration/resend-email/', {
    method: 'POST',
  })
  if (error.value) {
    errorMsg.value = 'Something went wrong. Please try again later.'
  }
  else {
    resent.value = true
  }
  sending.value = false
}

onNuxtReady(() => {
  if (route.query.resend) {
    resendEmail()
  }
})
</script>

<style lang="scss" scoped>
.mt-20vh {
  margin-top: 20vh;
}
</style>
