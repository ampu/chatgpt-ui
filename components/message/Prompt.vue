<template>
  <div>
    <VMenu
      v-model="menu"
      :closeOnContentClick="false"
    >
      <template #activator="{ props }">
        <VBtn icon v-bind="props">
          <VIcon icon="speaker_notes"/>
        </VBtn>
      </template>

      <VContainer>
        <VCard :minWidth="300" :maxWidth="500">
          <VCardTitle>
            <span class="headline">{{ $t('frequentlyPrompts') }}</span>
          </VCardTitle>

          <VDivider/>
          <VList>
            <VListItem v-show="loadingPrompts">
              <VListItemTitle class="d-flex justify-center">
                <VProgressCircular indeterminate/>
              </VListItemTitle>
            </VListItem>

            <template
              v-for="(prompt, promptOrder) in prompts"
              :key="prompt.id"
            >
              <VListItem
                active-color="primary"
                v-if="editingPrompt && editingPrompt.id === prompt.id"
              >
                <div class="d-flex flex-row" :style="{ marginTop: '5px' }">
                  <div class="flex-grow-1">
                    <VTextField
                      v-model="editingPrompt.title"
                      :loading="editingPrompt.updating"
                      :label="$t('titlePrompt')"
                      variant="underlined"
                      density="compact"
                      hideDetails
                    />
                    <VTextarea
                      v-model="editingPrompt.prompt"
                      :loading="editingPrompt.updating"
                      rows="2"
                      variant="underlined"
                      density="compact"
                      hideDetails
                    />
                  </div>
                  <div>
                    <div class="d-flex flex-column">
                      <VBtn
                        icon="done"
                        variant="text"
                        :loading="editingPrompt.updating"
                        @click="updatePrompt(promptOrder)"
                      />
                      <VBtn
                        icon="close"
                        variant="text"
                        @click="cancelEditPrompt"
                      />
                    </div>
                  </div>
                </div>
              </VListItem>

              <VListItem
                v-if="!editingPrompt || editingPrompt.id !== prompt.id"
                rounded="xl"
                active-color="primary"
                @click="selectPrompt(prompt)"
              >
                <VListItemTitle>
                  {{ prompt.title || prompt.prompt }}
                </VListItemTitle>

                <template #append>
                  <VBtn
                    icon="edit"
                    size="small"
                    variant="text"
                    @click="editPrompt(promptOrder)"
                  />
                  <VBtn
                    icon="delete"
                    size="small"
                    variant="text"
                    :loading="deletingPromptIndex === promptOrder"
                    @click="deletePrompt(promptOrder)"
                  />
                </template>
              </VListItem>
            </template>

            <VListItem active-color="primary">
              <div class="pt-3">
                <VTextField
                  rows="1"
                  v-model="newTitlePrompt"
                  :label="$t('titlePrompt')"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                />
              </div>
            </VListItem>

            <VListItem active-color="primary">
              <div class="pt-3">
                <VTextarea
                  rows="2"
                  v-model="newPrompt"
                  :label="$t('addNewPrompt')"
                  variant="outlined"
                  density="compact"
                  :error-messages="promptInputErrorMessage"
                  @update:modelValue="promptInputErrorMessage = ''"
                  clearable
                />
              </div>
            </VListItem>

            <VListItem>
              <VBtn
                variant="text"
                block
                :loading="submittingNewPrompt"
                @click="addPrompt"
              >
                <VIcon icon="add"/>
                {{ $t('addPrompt') }}
              </VBtn>
            </VListItem>
          </VList>
        </VCard>
      </VContainer>
    </VMenu>
  </div>
</template>

<script lang="ts" setup>
const menu = ref(false)
const prompts = ref([])
const editingPrompt = ref()
const newTitlePrompt = ref(null)
const newPrompt = ref('')
const submittingNewPrompt = ref(false)
const promptInputErrorMessage = ref('')
const loadingPrompts = ref(false)
const deletingPromptIndex = ref(null)

const props = defineProps({
  usePrompt: {type: Function, required: true},
})

const addPrompt = async () => {
  if (!newPrompt.value) {
    promptInputErrorMessage.value = 'Please enter a prompt'
    return
  }
  submittingNewPrompt.value = true
  const {data, error} = await useAuthFetch(ApiPath.PROMPTS, {
    method: 'POST',
    body: JSON.stringify({
      title: newTitlePrompt.value,
      prompt: newPrompt.value
    }),
  })
  if (!error.value) {
    prompts.value.push(data.value)
    newTitlePrompt.value = null
    newPrompt.value = ''
  }
  submittingNewPrompt.value = false
}

const editPrompt = (index: number) => {
  editingPrompt.value = {...prompts.value[index]}
}

const updatePrompt = async (index: number) => {
  editingPrompt.value.updating = true
  const {data, error} = await useAuthFetch(`/api/chat/prompts/${editingPrompt.value.id}/`, {
    method: 'PUT',
    body: JSON.stringify({
      title: editingPrompt.value.title,
      prompt: editingPrompt.value.prompt
    })
  })
  if (!error.value) {
    prompts.value[index] = editingPrompt.value
  }
  editingPrompt.value.updating = false
  editingPrompt.value = null
}

const cancelEditPrompt = () => {
  editingPrompt.value = null
}

const deletePrompt = async (index: number) => {
  deletingPromptIndex.value = index
  const {data, error} = await useAuthFetch(`/api/chat/prompts/${prompts.value[index].id}/`, {
    method: 'DELETE'
  })
  deletingPromptIndex.value = null
  if (!error.value) {
    prompts.value.splice(index, 1)
  }
}

const loadPrompts = async () => {
  loadingPrompts.value = true
  const {data, error} = await useAuthFetch(ApiPath.PROMPTS)
  if (!error.value) {
    prompts.value = data.value
  }
  loadingPrompts.value = false
}

const selectPrompt = (prompt) => {
  props.usePrompt(prompt.prompt)
  menu.value = false
}

onNuxtReady(() => {
  loadPrompts()
})
</script>

<style scoped>
</style>
