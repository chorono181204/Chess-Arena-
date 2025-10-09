import type { User } from '@/types/user'
import { apiClient } from './api-client'

type RawSigninResponse = {
  status: boolean
  message: string
  data: {
    refreshToken: string
    accessToken: string
  }
}

export type SigninResponse = {
  accessToken: string
  refreshToken: string
}

export const authApi = {
  signin: async (email: string, password: string): Promise<SigninResponse> => {
    const resp = await apiClient.post<RawSigninResponse, { email: string; password: string }>(
      `/api/v1/auth/signin`,
      { email, password },
    )
    const { accessToken, refreshToken } = resp.data
    apiClient.setAuthToken(accessToken)
    return { accessToken, refreshToken }
  },
}
