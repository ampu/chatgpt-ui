<template>
  <VNavigationDrawer
    v-model="drawer"
    :permanent="mdAndUp"
    width="300"
  >
    <template #prepend v-if="user">
      <v-list>
        <v-list-item
          :title="user.username"
          :subtitle="user.email"
        >
          <template #prepend>
            <v-icon
              icon="face"
              size="x-large"
            />
          </template>

          <template #append>
            <VMenu>
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  size="small"
                  variant="text"
                  icon="expand_more"
                />
              </template>
              <v-list>
                <v-list-item
                  :title="$t('resetPassword')"
                  to="/account/resetPassword"
                />
                <v-list-item
                  :title="$t('signOut')"
                  @click="signOut"
                />
              </v-list>
            </VMenu>

          </template>
        </v-list-item>
      </v-list>

      <VDivider/>
    </template>

    <div class="px-2">
      <v-list>
        <v-list-item v-show="loadingConversations">
          <v-list-item-title class="d-flex justify-center">
            <v-progress-circular indeterminate/>
          </v-list-item-title>
        </v-list-item>
      </v-list>

      <v-list>
        <template
          v-for="(conversation, conversationOrder) in conversations"
          :key="conversation.id"
        >
          <v-list-item
            active-color="primary"
            rounded="xl"
            v-if="editingConversation && editingConversation.id === conversation.id"
          >
            <v-text-field
              v-model="editingConversation.topic"
              :loading="editingConversation.updating"
              variant="underlined"
              append-icon="done"
              hide-details
              density="compact"
              autofocus
              @keyup.enter="updateConversation(conversationOrder)"
              @click:append="updateConversation(conversationOrder)"
            />
          </v-list-item>

          <v-hover
            v-if="!editingConversation || editingConversation.id !== conversation.id"
            v-slot="{ isHovering, props }"
          >
            <v-list-item
              rounded="xl"
              active-color="primary"
              :to="conversation.id ? `/${conversation.id}` : '/'"
              v-bind="props"
            >
              <v-list-item-title>
                {{ (conversation.topic && conversation.topic !== '') ? conversation.topic : $t('defaultConversationTitle') }}
              </v-list-item-title>

              <template #append>
                <div v-show="isHovering && conversation.id">
                  <VBtn
                    icon="edit"
                    size="small"
                    variant="text"
                    @click.prevent="editConversation(conversationOrder)"
                  />
                  <VBtn
                    icon="delete"
                    size="small"
                    variant="text"
                    :loading="deletingConversationIndex === conversationOrder"
                    @click.prevent="deleteConversation(conversationOrder)"
                  />
                  <VBtn
                    icon="download"
                    size="small"
                    variant="text"
                    @click.prevent="exportConversation(conversationOrder)"
                  />
                </div>
              </template>
            </v-list-item>
          </v-hover>
        </template>
      </v-list>
    </div>

    <template #append>
      <VDivider/>
      <VExpansionPanels class="flex-column">
        <VExpansionPanel rounded="rounded-pill">
          <VExpansionPanelTitle expand-icon="add" collapse-icon="close">
            <VIcon icon="settings" class="mr-4"/>
            {{ $t('settingDraw') }}
          </VExpansionPanelTitle>

          <VExpansionPanelText>
            <div class="px-1">
              <VList density="compact">

                <VDialog v-model="clearConfirmDialog">
                  <template #activator="{ props }">
                    <VListItem
                      v-bind="props"
                      rounded="xl"
                      prepend-icon="delete_forever"
                      :title="$t('clearConversations')"
                    />
                  </template>

                  <VCard>
                    <VCardTitle class="text-h5">
                      Are you sure you want to delete all conversations?
                    </VCardTitle>

                    <VCardText>This will be a permanent deletion and cannot be retrieved once deleted. Please proceed with caution.</VCardText>

                    <VCardActions>
                      <VSpacer/>
                      <VBtn
                        color="green-darken-1"
                        variant="text"
                        @click="clearConfirmDialog = false"
                        class="text-none"
                      >
                        Cancel deletion
                      </VBtn>
                      <VBtn
                        color="green-darken-1"
                        variant="text"
                        @click="clearConversations"
                        class="text-none"
                        :loading="deletingConversations"
                      >
                        Confirm deletion
                      </VBtn>
                    </VCardActions>
                  </VCard>
                </VDialog>

                <VListItem
                  rounded="xl"
                  prepend-icon="input"
                  :title="$t('importConversation')"
                  @click="openImportFileChooser"
                />

                <SettingsApiKeyDialog/>

                <SettingsModelParameters/>

                <VMenu>
                  <template #activator="{ props }">
                    <VListItem
                      v-bind="props"
                      rounded="xl"
                      :title="$t('themeMode')"
                    >
                      <template #prepend>
                        <VIcon :icon="$colorMode.value === 'light' ? `light_mode` : `dark_mode`"/>
                      </template>
                    </VListItem>
                  </template>

                  <VList bg-color="white">
                    <VListItem
                      v-for="(theme, themeOrder) in themes"
                      :key="themeOrder"
                      @click="colorMode.preference = theme.value"
                    >
                      <VListItemTitle>{{ theme.title }}</VListItemTitle>
                    </VListItem>
                  </VList>
                </VMenu>

                <SettingsLanguages/>

                <VListItem
                  rounded="xl"
                  prepend-icon="help_outline"
                  :title="$t('feedback')"
                  @click="openFeedback"
                />
              </VList>
            </div>
          </VExpansionPanelText>
        </VExpansionPanel>
      </VExpansionPanels>
    </template>
  </VNavigationDrawer>

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
        density="compact"
        size="default"
        @click="snackbar = false"
      >
        Close
      </VBtn>
    </template>
  </VSnackbar>

  <input
    class="d-none"
    type="file"
    id="import_conversation_input"
    accept="text/plain, text/json"
    multiple
    @change="importConversation"
  >
</template>

<script lang="ts" setup>
import {useDisplay} from 'vuetify'

import {Conversation} from '~/utils/conversation-utils'

const route = useRoute()
const {$i18n} = useNuxtApp()
const colorMode = useColorMode()
const {mdAndUp} = useDisplay()
const user = useUser()

const themes = ref([
  {title: $i18n.t('lightMode'), value: 'light'},
  {title: $i18n.t('darkMode'), value: 'dark'},
  {title: $i18n.t('followSystem'), value: 'system'}
])

const openFeedback = () => {
  window.open('https://github.com/WongSaang/chatgpt-ui/issues', '_blank')
}

const conversations = useConversations()

const editingConversation = ref<Conversation>()
const deletingConversationIndex = ref(-1)

const editConversation = (index) => {
  editingConversation.value = conversations.value[index]
}

const updateConversation = async (index) => {
  editingConversation.value.updating = true
  const {data, error} = await useAuthFetch(`/api/chat/conversations/${editingConversation.value.id}/`, {
    method: 'PUT',
    body: JSON.stringify({
      topic: editingConversation.value.topic
    })
  })
  if (!error.value) {
    editingConversation.value.updating = false
    conversations.value[index] = editingConversation.value
  }
  conversations.value[index].updating = false
  editingConversation.value = undefined
}

const deleteConversation = async (index: number) => {
  deletingConversationIndex.value = index
  const {data, error} = await useAuthFetch(`/api/chat/conversations/${conversations.value[index].id}/`, {
    method: 'DELETE'
  })
  deletingConversationIndex.value = -1
  if (!error.value) {
    const deletingConversation = conversations.value[index]
    conversations.value.splice(index, 1)
    if (route.params.id && parseInt(route.params.id) === deletingConversation.id) {
      await navigateTo('/')
    }
  }
}

const snackbar = ref(false)
const snackbarText = ref('')
const showSnackbar = (text: string) => {
  snackbarText.value = text
  snackbar.value = true
}

const loadMessage = async (conversation_id) => {
  const {data, error} = await useAuthFetch(`/api/chat/messages/?conversationId=${conversation_id}`)
  if (!error.value) {
    return data.value
  }
  return error.value
}

const exportConversation = async (index) => {
  let conversation = conversations.value[index]
  let data = {}
  data.conversation_topic = conversation.topic
  data.messages = []
  let messages = await loadMessage(conversation.id)
  for (let message of messages) {
    let msg = {}
    msg.role = message.is_bot ? 'assistant' : 'user'
    msg.content = message.message
    data.messages.push(msg)
  }
  let file_content = JSON.stringify(data)
  let file_name = `${conversation.topic}_${new Date()}`.replace(/[\/\\:*?"<>]/g, '_')
  const element = document.createElement('a')
  element.setAttribute(
    'href',
    'data:text/plain;charset=utf-8,' + encodeURIComponent(file_content),
  )
  element.setAttribute('download', file_name)
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

const openImportFileChooser = async () => {
  let input_element = document.getElementById('import_conversation_input')
  input_element.click()
}

const importConversation = async () => {
  let input_element = document.getElementById('import_conversation_input')
  let fileHandles = input_element.files
  let imports = []
  const reader = new FileReader()
  for (let handle of fileHandles) {
    let content = await new Promise((resolve, reject) => {
      reader.readAsText(handle)
      reader.onload = () => resolve(reader.result)
      reader.onerror = eror => reject(error)
    })
    let json = JSON.parse(content)
    imports.push(json)
  }
  let new_conversation_ids = []
  try {
    const {data, error} = await useAuthFetch('/api/upload_conversations/', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imports: imports,
      }),
    })
    if (!error.value) {
      new_conversation_ids = data.value
      loadConversations()
    }
    else {
      console.log(error)
      showSnackbar(error.message)
    }
  }
  catch (err) {
    console.log(err.message)
    showSnackbar(err.message)
  }
}

const clearConversations = async () => {
  deletingConversations.value = true
  const {data, error} = await useAuthFetch(`/api/chat/conversations/delete_all`, {
    method: 'DELETE'
  })
  if (!error.value) {
    loadConversations()
    clearConfirmDialog.value = false
  }
  deletingConversations.value = false
}

const clearConfirmDialog = ref(false)
const deletingConversations = ref(false)
const loadingConversations = ref(false)

const loadConversations = async () => {
  loadingConversations.value = true
  conversations.value = await getConversations()
  loadingConversations.value = false
}

const signOut = async () => {
  const {data, error} = await useFetch('/api/account/logout/', {
    method: 'POST'
  })
  if (!error.value) {
    await logout()
  }
}

onNuxtReady(async () => {
  await loadConversations()
})

const drawer = useDrawer()
</script>

<style lang="scss">
.v-navigation-drawer__content {
  &::-webkit-scrollbar {
    width: 0;
  }

  &:hover {
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #999;
      border-radius: 3px;
    }
  }
}
</style>
