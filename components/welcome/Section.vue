<template>
  <VContainer>
    <VRow>
      <VCol cols="12">
        <div class="text-center">
          <h2 class="text-h2">
            {{ $t('welcomeTo') }}
            <span class="text-primary">{{ runtimeConfig.public.appName }}</span>
          </h2>
          <p class="text-caption my-5">
            {{ runtimeConfig.public.appName }} {{ $t('welcomeScreen.introduction1') }}
          </p>
        </div>
      </VCol>
    </VRow>

    <VRow>
      <VCol cols="12" md="10" offset-md="1">
        <VRow>
          <VCol cols="12" md="4">
            <div class="d-flex flex-column align-center mb-6">
              <VIcon icon="sunny"/>
              <h3 class="text-h6">{{ $t('welcomeScreen.examples.title') }}</h3>
            </div>

            <WelcomeCard
              v-for="(item, order) in examples"
              :key="order"
            >
              {{ item }}
            </WelcomeCard>
          </VCol>

          <VCol cols="12" md="4">
            <div class="d-flex flex-column align-center mb-6">
              <VIcon icon="bolt"/>
              <h3 class="text-h6">{{ $t('welcomeScreen.capabilities.title') }}</h3>
            </div>

            <WelcomeCard
              v-for="(item, order) in capabilities"
              :key="order"
            >
              {{ item }}
            </WelcomeCard>
          </VCol>

          <VCol cols="12" md="4">
            <div class="d-flex flex-column align-center mb-6">
              <VIcon icon="warning_amber"/>
              <h3 class="text-h6">{{ $t('welcomeScreen.limitations.title') }}</h3>
            </div>

            <WelcomeCard
              v-for="(item, order) in limitations"
              :key="order"
            >
              {{ item }}
            </WelcomeCard>
          </VCol>
        </VRow>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup>
const runtimeConfig = useRuntimeConfig()
const {$i18n} = useNuxtApp()

const examples = [
  $i18n.t('welcomeScreen.examples.item1'),
  $i18n.t('welcomeScreen.examples.item2'),
  $i18n.t('welcomeScreen.examples.item3'),
]

const capabilities = [
  $i18n.t('welcomeScreen.capabilities.item1'),
  $i18n.t('welcomeScreen.capabilities.item2'),
  $i18n.t('welcomeScreen.capabilities.item3'),
]

const limitations = [
  $i18n.t('welcomeScreen.limitations.item1'),
  $i18n.t('welcomeScreen.limitations.item2'),
  $i18n.t('welcomeScreen.limitations.item3'),
]
</script>
