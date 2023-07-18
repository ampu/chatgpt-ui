<template>
  <div>
    <div
      v-if="conversation.loadingMessages"
      class="text-center"
    >
      <VProgressCircular
        indeterminate
        color="primary"
      />
    </div>

    <div v-else>
      <div
        v-if="conversation.messages"
        ref="chatWindow"
      >
        <VContainer>
          <VRow>
            <VCol
              v-for="(message, index) in conversation.messages"
              :key="index"
              cols="12"
            >
              <div
                class="d-flex align-center"
                :class="message.is_bot ? 'justify-start' : 'justify-end'"
              >
                <MessageContent
                  :class="!message.is_bot && 'order-1'"
                  :message="message"
                  :index="index"
                  :usePrompt="usePrompt"
                  :deleteMessage="deleteMessage"
                />
                <MessageActions
                  :message="message"
                  :messageIndex="index"
                  :usePrompt="usePrompt"
                  :deleteMessage="deleteMessage"
                  :toggleMessage="toggleMessage"
                />
              </div>
            </VCol>
          </VRow>
        </VContainer>

        <div ref="grab" class="w-100" style="height: 200px;"/>
      </div>
    </div>
  </div>

  <VFooter
    app
    class="footer"
  >
    <div class="px-md-16 w-100 d-flex flex-column">
      <div class="d-flex align-center">
        <VBtn
          v-show="fetchingResponse"
          icon="close"
          title="stop"
          class="mr-3"
          @click="stop"
        />
        <MessageEditor
          ref="editor"
          :sendMessage="send"
          :disabled="fetchingResponse"
          :loading="fetchingResponse"
        />
      </div>

      <VToolbar
        density="comfortable"
        color="transparent"
      >
        <MessagePrompt
          v-show="!fetchingResponse"
          :use-prompt="usePrompt"
        />
        <VSwitch
          inline
          hide-details
          color="primary"
          :label="$t('webSearch')"
          v-model="enableWebSearch"
        />

        <VSpacer/>
        <div class="d-flex align-center">
          <VSwitch
            inline
            hide-details
            color="primary"
            :label="$t('frugalMode')"
            v-model="frugalMode"
          />

          <VDialog
            transition="dialog-bottom-transition"
            width="auto"
          >
            <template #activator="{ props }">
              <VIcon
                color="grey"
                v-bind="props"
                icon="help_outline"
                class="ml-3"
              />
            </template>

            <template #default="{ isActive }">
              <VCard>
                <VToolbar
                  color="primary"
                  :title="$t('frugalMode')"
                />
                <VCardText>
                  {{ $t('frugalModeTip') }}
                </VCardText>
              </VCard>
            </template>
          </VDialog>
        </div>

      </VToolbar>
    </div>
  </VFooter>

  <VSnackbar
    v-model="snackbar"
    multi-line
    location="top"
  >
    {{ snackbarText }}

    <template #actions>
      <VBtn
        color="red"
        variant="text"
        @click="snackbar = false"
      >
        Close
      </VBtn>
    </template>
  </VSnackbar>
</template>

<script lang="ts" setup>
import {EventStreamContentType, fetchEventSource} from '@microsoft/fetch-event-source'

import {Conversation, Message} from '~/utils/conversation-utils'

const {$i18n} = useNuxtApp()
const runtimeConfig = useRuntimeConfig()
const currentModel = useCurrentModel()
const openaiApiKey = useApiKey()
const fetchingResponse = ref(false)
const messageQueue: string[] = []
const frugalMode = ref(true)
const enableWebSearch = ref(false)
let isProcessingQueue = false

const props = defineProps<{
  conversation: Conversation,
}>()

const processMessageQueue = () => {
  if (isProcessingQueue || messageQueue.length === 0) {
    return
  }
  if (!props.conversation.messages[props.conversation.messages.length - 1].is_bot) {
    props.conversation.messages.push({id: null, is_bot: true, message: ''})
  }
  isProcessingQueue = true
  const nextMessage = messageQueue.shift()!
  if (runtimeConfig.public.typewriter && nextMessage.length > 0) {
    let wordIndex = 0
    const intervalId = setInterval(() => {
      props.conversation.messages[props.conversation.messages.length - 1].message += nextMessage[wordIndex]
      wordIndex++
      if (wordIndex === nextMessage.length) {
        clearInterval(intervalId)
        isProcessingQueue = false
        processMessageQueue()
      }
    }, runtimeConfig.public.typewriterDelay)
  }
  else {
    props.conversation.messages[props.conversation.messages.length - 1].message += nextMessage
    isProcessingQueue = false
    processMessageQueue()
  }
}

let ctrl: AbortController
const abortFetch = () => {
  if (ctrl) {
    ctrl.abort()
  }
  fetchingResponse.value = false
}

const fetchReply = async (messages: Message | Message[]) => {
  let message = messages
  if (Array.isArray(messages)) {
    message = messages[messages.length - 1]
  }
  else {
    messages = [messages]
  }

  let webSearchParams: Record<string, unknown> = {}
  if (enableWebSearch.value || message.tool == 'web_search') {
    webSearchParams['web_search'] = {
      ua: navigator.userAgent,
      default_prompt: $i18n.t('webSearchDefaultPrompt')
    }
  }

  if (message.tool == 'web_search') {
    message.tool_args = webSearchParams['web_search']
    message.type = 100
  }
  else if (message.tool == 'arxiv') {
    message.tool_args = null
    message.type = 110
  }

  const data = Object.assign({}, currentModel.value, {
    openaiApiKey: openaiApiKey.value,
    message: messages,
    conversationId: props.conversation.id,
    frugalMode: frugalMode.value
  }, webSearchParams)

  try {
    ctrl = new AbortController()
    await fetchEventSource('/api/conversation/', {
      signal: ctrl.signal,
      method: 'POST',
      headers: {
        [`Accept`]: `application/json`,
        [`Content-Type`]: `application/json`,
      },
      body: JSON.stringify(data),
      openWhenHidden: true,
      async onopen(response) {
        if (response.ok && response.headers.get('content-type') === EventStreamContentType) {
          return
        }
        throw new Error(`Failed to send message. HTTP ${response.status} - ${response.statusText}`)
      },
      onclose() {
        if (ctrl.signal.aborted) {
          return
        }
        throw new Error(`Failed to send message. Server closed the connection unexpectedly.`)
      },
      onerror(err) {
        throw err
      },
      async onmessage(message) {
        const event = message.event
        const data = JSON.parse(message.data)

        if (event === 'error') {
          abortFetch()
          showSnackbar(data.error)
          return
        }

        if (event === 'userMessageId') {
          props.conversation.messages[props.conversation.messages.length - 1].id = data.userMessageId
          return
        }

        if (event === 'done') {
          abortFetch()
          props.conversation.messages[props.conversation.messages.length - 1].id = data.messageId
          if (!props.conversation.id) {
            props.conversation.id = data.conversationId
            props.conversation.topic = await genTitle(props.conversation.id)
          }
          if (data.newDocId) {
            editor.value.refreshDocList()
          }
          return
        }

        messageQueue.push(data.content)
        processMessageQueue()

        scrollChatWindow()
      },
    })
  }
  catch (err) {
    console.log(err)
    abortFetch()
    showSnackbar((err as Error).message)
  }
}

const grab = ref()
const scrollChatWindow = () => {
  grab.value?.scrollIntoView({behavior: 'smooth'})
}

const send = (message) => {
  fetchingResponse.value = true
  if (props.conversation.messages.length === 0) {
    addConversation(props.conversation)
  }
  if (Array.isArray(message)) {
    props.conversation.messages.push(...message.map(i => ({message: i.content, message_type: i.message_type})))
  }
  else {
    props.conversation.messages.push({message: message.content, message_type: message.message_type})
  }
  fetchReply(message)
  scrollChatWindow()
}
const stop = () => {
  abortFetch()
}

const snackbar = ref(false)
const snackbarText = ref('')
const showSnackbar = (text: string) => {
  snackbarText.value = text
  snackbar.value = true
}

const editor = ref()

const usePrompt = (prompt: string) => {
  editor.value.usePrompt(prompt)
}

const deleteMessage = (index: number) => {
  props.conversation.messages.splice(index, 1)
}

const toggleMessage = (index: number) => {
  props.conversation.messages[index].is_disabled = !props.conversation.messages[index].is_disabled
}
</script>
