import {Conversation} from '~/utils/conversation-utils'
import {User} from '~/utils/user-utils'
import {Model} from '~/utils/model-utils'

export const useCurrentModel = () => useState<Model>('currentModel', () => getCurrentModel())

export const useApiKey = () => useState<string | null | undefined>('apiKey', () => getApiKey())

export const useConversations = () => useState<Conversation[]>('conversations', () => [])

export const useUser = () => useState<User | null>('user', () => null)

export const useDrawer = () => useState<boolean>('drawer', () => false)
