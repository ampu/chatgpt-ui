import {Model} from '~/utils/model-utils'

export const StorageKey = {
  CURRENT_MODEL: 'current_model',
  OPENAI_API_KEY: 'openai_api_key',
}

const get = <T>(key: string): T | undefined => {
  if (process.server) {
    return
  }
  let val = localStorage.getItem(key)
  if (val === null) {
    return
  }
  return JSON.parse(val)
}

const set = (key: string, val: unknown) => {
  if (process.server) {
    return
  }
  localStorage.setItem(key, JSON.stringify(val))
}

export const setCurrentModel = (value: Model) => {
  set(StorageKey.CURRENT_MODEL, value)
}

export const getCurrentModel = () => {
  return get<Model>(StorageKey.CURRENT_MODEL) ?? MODELS[DEFAULT_MODEL_NAME]
}

export const setApiKey = (value: string) => {
  set(StorageKey.OPENAI_API_KEY, value)
  useApiKey().value = value
}

export const getApiKey = () => {
  return get<string>(StorageKey.OPENAI_API_KEY)
}
