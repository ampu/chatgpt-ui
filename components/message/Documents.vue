<template>
  <VDialog
    scrollable
    v-model="control.dialog"
  >
    <VCard class="pa-3">
      <VCardTitle>Add Documents</VCardTitle>
      <v-row align="center" justify="center">
        <v-col cols="10">
          <v-file-input
            id="file_upload_input"
            label="New Documents"
            :disabled="loadingDoc"
            :loading="loadingDoc"
            :messages="fileInputMessage"
            density="compact"
            variant="solo"
            show-size
            :rules="fileUploadRules"
            accept="text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            class="ma-2 pa-2"
            @change="onFileChange"
            append-icon="upload"
            @click:append="uploadFile"
          />
        </v-col>
      </v-row>

      <VDivider/>
      <v-card-text style="height: 480px;">
        <v-item-group v-model="selectedEmbeddingDocs" multiple>
          <v-row v-for="(item, i) in embeddingDocs" :key="i" justify="center">
            <v-col>
              <v-item v-slot="{ isSelected, toggle }">
                <v-list-item @click="toggle" :prepend-icon="isSelected ? 'check_box' : 'check_box_outline_blank'">
                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                  <v-list-item-subtitle>{{ item.created_at }}</v-list-item-subtitle>
                </v-list-item>
              </v-item>
            </v-col>
          </v-row>
        </v-item-group>
      </v-card-text>

      <VDivider/>
      <v-row justify="center" class="pa-2">
        <v-card-actions>
          <v-btn elevation="2" class="ma-2" @click="insertSelectedDocs">Insert</v-btn>
          <v-btn elevation="2" class="ma-2" @click="deleteSelectedDocs">Delete</v-btn>
          <v-btn elevation="2" class="ma-2" @click="control.dialog = false">Close</v-btn>
        </v-card-actions>
      </v-row>
    </VCard>
  </VDialog>

  <VSnackbar
    multi-line
    location="top"
    v-model="snackbar"
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
</template>

<script lang="ts" setup>
const {$i18n} = useNuxtApp()

const props = defineProps({
  sendMessage: {type: Function, required: false},
  control: {type: Object, required: true},
})

const loadingDoc = ref(false)
const deletingDocumentIndex = ref()
const embeddingDocs = ref([])
const selectedEmbeddingDocs = ref([])
const fileInputMessage = ref('')

const uploadDocObject = ref({
  title: '',
  file: null,
})

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

const snackbar = ref(false)
const snackbarText = ref('')
const showSnackbar = (text) => {
  snackbarText.value = text
  snackbar.value = true
}

const fileUploadRules = [
  (value) => {
    let fileSizeLimit = 8
    return !value || !value.length || value[0].size < fileSizeLimit * 1024 * 1024 || `size no more than ${fileSizeLimit} MB`
  },
]
function onFileChange() {
  let newFile = document.getElementById('file_upload_input').files[0]
  if (fileUploadRules[0]([newFile])) {
    uploadDocObject.value.file = newFile
  }
}

async function uploadFile() {
  const file = uploadDocObject.value.file
  if (!file) return
  loadingDoc.value = true
  const base64Data = await fileToBase64(file)
  try {
    const {data, error} = await useAuthFetch('/api/chat/embedding_document/', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: file.name,
        file: base64Data,
      }),
    })
    if (!error.value) {
      embeddingDocs.value.splice(0, 0, data.value)
    }
    else {
      console.log(error.value)
      showSnackbar(error.value)
    }
  }
  catch (err) {
    console.log(err)
    showSnackbar(err.message)
  }
  uploadDocObject.value.file = null
  loadingDoc.value = false
}

async function loadDocs() {
  loadingDoc.value = true
  const {data, error} = await useAuthFetch('/api/chat/embedding_document/')
  if (!error.value) {
    embeddingDocs.value = data.value
  }
  loadingDoc.value = false
}

async function deleteDocs(index_list) {
  let survival = []
  for (let i = 0; i < index_list.length; i++) {
    let index = index_list[i]
    deletingDocumentIndex.value = index
    const {data, error} = await useAuthFetch(`/api/chat/embedding_document/${embeddingDocs.value[index].id}/`, {
      method: 'DELETE'
    })
    deletingDocumentIndex.value = null
    if (!error.value) {
      embeddingDocs.value[index] = 0
    }
    else {
      console.log(`${index}: ${error.value}`)
    }
  }
  let l = embeddingDocs.value.length
  for (let i = 0; i < l; i++) {
    if (embeddingDocs.value[i] != 0) {
      survival.push(embeddingDocs.value[i])
    }
  }
  embeddingDocs.value.splice(0, l)
  embeddingDocs.value.push(...survival)
}

async function insertSelectedDocs() {
  props.control.dialog = false
  let messages = selectedEmbeddingDocs.value.map((i) => {
    let doc = embeddingDocs.value[i]
    return {
      content: `${doc.title}\n${doc.created_at}`,
      message_type: 120,
      embedding_message_doc: doc.id,
    }
  })
  props.sendMessage(messages)
  let l = selectedEmbeddingDocs.value.length
  selectedEmbeddingDocs.value.splice(0, l)
}

async function deleteSelectedDocs() {
  await deleteDocs(selectedEmbeddingDocs.value)
  let l = selectedEmbeddingDocs.value.length
  selectedEmbeddingDocs.value.splice(0, l)
}

defineExpose({
  loadDocs
})

onNuxtReady(() => {
  loadDocs()
})
</script>
