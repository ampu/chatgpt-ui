<template>
  <VDialog v-model="dialog">
    <template #activator="{ props }">
      <VListItem
        v-bind="props"
        rounded="xl"
        prepend-icon="tune"
        :title="$t('modelParameters')"
      />
    </template>

    <VCard>
      <VToolbar density="compact">
        <VToolbarTitle>{{ $t('modelParameters') }}</VToolbarTitle>

        <VSpacer/>

        <VBtn
          icon="close"
          @click="dialog = false"
        />
      </VToolbar>

      <VCardText>
        <VSelect
          v-model="currentModel.name"
          :label="$t('model')"
          :items="AVAILABLE_MODEL_NAMES"
          variant="underlined"
        />

        <VRow no-gutters>
          <VCol cols="12">
            <div class="d-flex justify-space-between align-center">
              <v-list-subheader>{{ $t('temperature') }}</v-list-subheader>
              <v-text-field
                v-model.number="currentModel.temperature"
                hide-details
                single-line
                density="compact"
                type="number"
                max="1"
                step="0.01"
                style="width: 100px"
                class="flex-grow-0"
              ></v-text-field>
            </div>
          </VCol>

          <VCol cols="12">
            <VSlider
              v-model="currentModel.temperature"
              :max="1"
              :step="0.01"
              hide-details
            />
          </VCol>
        </VRow>

        <VRow no-gutters>
          <VCol cols="12">
            <div class="d-flex justify-space-between align-center">
              <v-list-subheader>{{ $t('maxTokens') }}</v-list-subheader>
              <v-text-field
                v-model.number="currentModel.max_tokens"
                hide-details
                single-line
                density="compact"
                type="number"
                :max="currentModelDefault.total_tokens"
                step="1"
                style="width: 100px"
                class="flex-grow-0"
              />
            </div>
            <div class="text-caption">
              {{ $t('maxTokenTips1') }}
              <b>{{ currentModelDefault.total_tokens }}</b>
              {{ $t('maxTokenTips2') }}
            </div>
          </VCol>

          <VCol cols="12">
            <VSlider
              v-model="currentModel.max_tokens"
              :max="currentModelDefault.total_tokens"
              :step="1"
              hide-details
            />
          </VCol>
        </VRow>

        <VRow no-gutters>
          <VCol cols="12">
            <div class="d-flex justify-space-between align-center">
              <v-list-subheader>{{ $t('topP') }}</v-list-subheader>
              <v-text-field
                v-model.number="currentModel.top_p"
                hide-details
                single-line
                density="compact"
                type="number"
                max="1"
                step="0.01"
                style="width: 100px"
                class="flex-grow-0"
              />
            </div>
          </VCol>

          <VCol cols="12">
            <VSlider
              v-model="currentModel.top_p"
              :max="1"
              :step="0.01"
              hide-details
            />
          </VCol>
        </VRow>

        <VRow no-gutters>
          <VCol cols="12">
            <div class="d-flex justify-space-between align-center">
              <v-list-subheader>{{ $t('frequencyPenalty') }}</v-list-subheader>
              <v-text-field
                v-model.number="currentModel.frequency_penalty"
                hide-details
                single-line
                density="compact"
                type="number"
                max="2"
                step="0.01"
                style="width: 100px"
                class="flex-grow-0"
              />
            </div>
          </VCol>

          <VCol cols="12">
            <VSlider
              v-model="currentModel.frequency_penalty"
              :max="2"
              :step="0.01"
              hide-details
            />
          </VCol>
        </VRow>

        <VRow no-gutters>
          <VCol cols="12">
            <div class="d-flex justify-space-between align-center">
              <v-list-subheader>{{ $t('presencePenalty') }}</v-list-subheader>
              <v-text-field
                v-model.number="currentModel.presence_penalty"
                hide-details
                single-line
                density="compact"
                type="number"
                max="2"
                step="0.01"
                style="width: 100px"
                class="flex-grow-0"
              />
            </div>
          </VCol>

          <VCol cols="12">
            <VSlider
              v-model="currentModel.presence_penalty"
              :max="2"
              :step="0.01"
              hide-details
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<script lang="ts" setup>
const dialog = ref(false)
const currentModel = useCurrentModel()
const currentModelDefault = computed(() => MODELS[currentModel.value?.name])
</script>
