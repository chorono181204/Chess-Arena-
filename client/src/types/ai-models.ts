export type AiModelProvider = 'openai' | 'claude' | 'gemini' | 'llama' | 'grok'

export interface AiModel {
  id: string
  name: string
  provider: AiModelProvider
  description?: string
  maxTokens?: number
  temperature?: number
}

export interface AiModels {
  [key: string]: AiModel[]
}

