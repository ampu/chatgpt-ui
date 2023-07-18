<template>
  <VAppBar>
    <VAppBarNavIcon @click="drawer = !drawer"/>

    <VToolbarTitle>{{ navTitle }}</VToolbarTitle>

    <VSpacer/>

    <VBtn
      :title="$t('newConversation')"
      icon="add"
      @click="createNewConversation"
      class="d-md-none ma-3"
    />

    <VBtn
      variant="outlined"
      class="text-none d-none d-md-block"
      @click="createNewConversation"
    >
      {{ $t('newConversation') }}
    </VBtn>
  </VAppBar>

  <VMain>
    <WelcomeSection v-if="!route.params.id && conversation.messages.length === 0"/>
    <MessageConversation :conversation="conversation"/>
  </VMain>
</template>

<script lang="ts" setup>
import {Message} from '~/utils/conversation-utils'

definePageMeta({
  layout: `drawer`,
  middleware: ['auth'],
  path: '/:id?',
})

const {$i18n} = useNuxtApp()
const runtimeConfig = useRuntimeConfig()
const drawer = useDrawer()
const route = useRoute()
const conversation = ref({...DEFAULT_CONVERSATION})
const conversationId = computed(() => String(route.params.id))

const loadConversation = async () => {
  const {data, error} = await useAuthFetch('/api/chat/conversations/' + conversationId.value)
  if (!error.value) {
    Object.assign(conversation.value, data.value)
  }
}

const loadMessage = async () => {
  const {data, error} = await useAuthFetch('/api/chat/messages/?conversationId=' + conversationId.value)
  if (!error.value) {
    conversation.value.id = conversationId.value
    conversation.value.messages = data.value as Message[]
  }
}

const createNewConversation = () => {
  conversation.value = {
    ...DEFAULT_CONVERSATION,
    topic: $i18n.t('newConversation')
  }
}


onMounted(async () => {
  if (route.params.id) {
    conversation.value.loadingMessages = true
    await loadConversation()
    await loadMessage()
    conversation.value.loadingMessages = false
  }
})


const navTitle = computed(() => {
  if (conversation.value?.topic != null) {
    return conversation.value.topic || $i18n.t('defaultConversationTitle')
  }
  return runtimeConfig.public.appName
})
</script>
