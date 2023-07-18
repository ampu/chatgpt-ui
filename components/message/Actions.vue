<template>
  <VMenu>
    <template #activator="{ props }">
      <VBtn
        v-if="messageIcon"
        v-bind="props"
        variant="text"
        class="ma-2"
      >
        <VIcon :icon="messageIcon"/>
      </VBtn>
    </template>

    <VList>
      <VListItem
        title="toggle"
        :prepend-icon="message.is_disabled ? 'toggle_off' : 'toggle_on'"
        @click="toggleMessage"
      />
    </VList>
  </VMenu>

  <VMenu>
    <template #activator="{ props }">
      <VBtn
        v-bind="props"
        icon
        variant="text"
        class="ma-2"
      >
        <VIcon icon="more_horiz"/>
      </VBtn>
    </template>

    <VList>
      <VListItem
        @click="copyMessage"
        :title="$t('copy')"
        prepend-icon="content_copy"
      />
      <VListItem
        @click="editMessage"
        :title="$t('edit')"
        prepend-icon="edit"
      />
      <VListItem
        @click="deleteMessage"
        :title="$t('delete')"
        prepend-icon="delete"
      />
    </VList>
  </VMenu>

  <VSnackbar
    v-model="snackbar"
    location="top"
    timeout="2000"
  >
    {{ snackbarText }}
  </VSnackbar>
</template>

<script lang="ts" setup>
import copy from 'copy-to-clipboard'

import {Message} from '~/utils/conversation-utils'

const props = defineProps<{
  message: Message,
  messageIndex: number,
  usePrompt: (message: string) => void,
  deleteMessage: (messageIndex: number) => void,
  toggleMessage: (messageIndex: number) => void,
}>()

const snackbar = ref(false)
const snackbarText = ref('')

const showSnackbar = (text: string) => {
  snackbarText.value = text
  snackbar.value = true
}

const copyMessage = () => {
  copy(props.message.message)
  showSnackbar('Copied!')
}

const editMessage = () => {
  props.usePrompt(props.message.message)
}

const deleteMessage = async () => {
  const {data, error} = await useAuthFetch(`/api/chat/messages/${props.message.id}/`, {
    method: 'DELETE'
  })
  if (!error.value) {
    props.deleteMessage(props.messageIndex)
    showSnackbar('Deleted!')
  }
  showSnackbar('Delete failed')
}

const toggleMessage = async () => {
  const message = {...props.message}
  message.is_disabled = !message.is_disabled
  const {data, error} = await useAuthFetch(`/api/chat/messages/${props.message.id}/`, {
    method: 'PUT',
    body: JSON.stringify(message),
  })
  if (!error.value) {
    props.toggleMessage(props.messageIndex)
  }
}

function getMessageIcon(message: Message) {
  if (message.is_bot) {
    return undefined
  }
  return {
    100: 'travel_explore',
    110: 'local_library',
    120: 'article',
  }[message.message_type]
}

const messageIcon = getMessageIcon(props.message)
</script>
