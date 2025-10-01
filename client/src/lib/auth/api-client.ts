import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'
import { apiUrl } from '../env'

// Token storage
const getToken = (): string | null => localStorage.getItem('auth_token')
const setToken = (token: string): void => localStorage.setItem('auth_token', token)
const clearToken = (): void => localStorage.removeItem('auth_token')

class ApiClient {
  private client: AxiosInstance

  constructor() {
    // Mock API client for testing UI
    this.client = axios.create({
      baseURL: apiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 29_000, // 29 seconds
    })

    // Disable interceptors for testing
    // this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error),
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Handle common errors here
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          const { status } = error.response

          if (status === 401) {
            // Handle unauthorized - maybe redirect to login
            console.error('Unauthorized access')
            clearToken()
            window.location.href = '/'
          } else if (status === 404) {
            console.error('Resource not found')
          } else if (status >= 500) {
            console.error('Server error')
          }
        } else if (error.request) {
          // The request was made but no response was received
          console.error('Network error - no response received')
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error setting up request:', error.message)
        }

        return Promise.reject(error)
      },
    )
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    // Mock API response for testing UI
    console.log('Mock API GET:', url)
    
    // Mock game data for testing
    if (url.includes('/chess/game/')) {
      const gameId = url.split('/').pop();
      return Promise.resolve({
        id: gameId,
        status: 'ACTIVE',
        currentFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        moves: [],
        lastMove: null,
        turn: 'white',
        winner: null,
        check: false,
        checkmate: false,
        stalemate: false,
        draw: false,
        timeControl: '5+0',
        isPublic: true,
        isRated: false,
        allowSpectators: true,
        whitePlayerId: 'test-user-1',
        blackPlayerId: 'test-user-2',
        winnerId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        whitePlayer: {
          id: 'test-user-1',
          name: 'White Player',
          avatar: null
        },
        blackPlayer: {
          id: 'test-user-2',
          name: 'Black Player',
          avatar: null
        },
        messages: [],
        players: {
          white: {
            userId: 'test-user-1',
            name: 'White Player',
            avatar: null,
            ai: null
          },
          black: {
            userId: 'test-user-2',
            name: 'Black Player',
            avatar: null,
            ai: null
          }
        },
        role: 'white' // Mock user role
      } as T);
    }
    
    return Promise.resolve({} as T)
    // const response: AxiosResponse<T> = await this.client.get(url, config)
    // return response.data
  }

  public async post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    // Mock API response for testing UI
    console.log('Mock API POST:', url, data)
    return Promise.resolve({} as T)
    // const response: AxiosResponse<T> = await this.client.post(url, data, config)
    // return response.data
  }

  public async put<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    // Mock API response for testing UI
    console.log('Mock API PUT:', url, data)
    return Promise.resolve({} as T)
    // const response: AxiosResponse<T> = await this.client.put(url, data, config)
    // return response.data
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    // Mock API response for testing UI
    console.log('Mock API DELETE:', url)
    return Promise.resolve({} as T)
    // const response: AxiosResponse<T> = await this.client.delete(url, config)
    // return response.data
  }

  public async patch<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    // Mock API response for testing UI
    console.log('Mock API PATCH:', url, data)
    return Promise.resolve({} as T)
    // const response: AxiosResponse<T> = await this.client.patch(url, data, config)
    // return response.data
  }

  // Helper method for auth
  public setAuthToken(token: string): void {
    setToken(token)
  }

  public clearAuthToken(): void {
    clearToken()
  }

  public isAuthenticated(): boolean {
    // Mock authentication for testing UI
    return true
    // return !!getToken()
  }
}

// Export a singleton instance
export const apiClient = new ApiClient()
