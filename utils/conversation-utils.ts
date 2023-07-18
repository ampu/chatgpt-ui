export type Message = {
  id: string | null,
  is_bot: boolean,
  message: string,
  is_disabled: boolean,
  message_type: number,
}

export type Conversation = {
  id: string | null,
  topic: string | null,
  messages: Message[],
  loadingMessages: boolean,
}

export const DEFAULT_CONVERSATION: Conversation = {
  id: null,
  topic: null,
  messages: [],
  loadingMessages: false,
}

export const getConversations = async () => {
  const {data, error} = await useAuthFetch(ApiPath.CONVERSATIONS)
  if (!error.value) {
    return data.value
  }
  return []
}

export const addConversation = (conversation: Conversation) => {
  const conversations = useConversations()
  conversations.value = [conversation, ...conversations.value]
}

export const genTitle = async (conversationId: string | null): Promise<string | null> => {
  const {$i18n} = useNuxtApp()
  const apiKey = useApiKey()
  const {data, error} = await useAuthFetch(ApiPath.GENERATE_TITLE, {
    method: 'POST',
    body: {
      conversationId,
      prompt: $i18n.t('genTitlePrompt'),
      openaiApiKey: apiKey.value,
    }
  })
  if (error.value) {
    return null
  }
  return (data.value as any).title
}
