export type Model = {
  name: string
  frequency_penalty: number
  presence_penalty: number
  total_tokens: number
  max_tokens: number
  temperature: number
  top_p: number
}

const GPT_3_5_TURBO: Model = {
  name: 'gpt-3.5-turbo',
  frequency_penalty: 0.0,
  presence_penalty: 0.0,
  total_tokens: 4096,
  max_tokens: 1000,
  temperature: 0.7,
  top_p: 1.0,
}

const GPT_3_5_16K: Model = {
  name: 'gpt-3.5-16k',
  frequency_penalty: 0.0,
  presence_penalty: 0.0,
  total_tokens: 16384,
  max_tokens: 4000,
  temperature: 0.7,
  top_p: 1.0,
}

const GPT_4_32K: Model = {
  name: 'gpt-4-32k',
  frequency_penalty: 0.0,
  presence_penalty: 0.0,
  total_tokens: 32768,
  max_tokens: 8000,
  temperature: 0.7,
  top_p: 1.0,
}

const GPT_4: Model = {
  name: 'gpt-4',
  frequency_penalty: 0.0,
  presence_penalty: 0.0,
  total_tokens: 8192,
  max_tokens: 2000,
  temperature: 0.7,
  top_p: 1.0,
}

export const MODELS = {
  [GPT_3_5_TURBO.name]: GPT_3_5_TURBO,
  [GPT_3_5_16K.name]: GPT_3_5_16K,
  [GPT_4_32K.name]: GPT_4_32K,
  [GPT_4.name]: GPT_4,
}

export const DEFAULT_MODEL_NAME = GPT_3_5_TURBO.name

export const AVAILABLE_MODEL_NAMES = [
  GPT_3_5_TURBO.name,
  GPT_4.name,
  GPT_3_5_16K.name,
  GPT_4_32K.name,
]
