import { CollegeEvent, Registration, NotificationItem, CertificateItem, User } from '../types'

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.location.port === '5173' ? 'http://localhost:5000/api' : '/api')

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('eventhub_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errMsg = `Request failed with status ${res.status}`
    try {
      const errData = await res.json()
      if (errData && errData.error) {
        errMsg = errData.error
      }
    } catch {
      // ignore
    }
    throw new Error(errMsg)
  }
  return res.json()
}

export const api = {
  auth: {
    async register(data: {
      name: string
      email: string
      password: string
      role: 'student' | 'organizer'
      rollNumber?: string
      department?: string
      semester?: string
    }): Promise<{ token: string; user: User }> {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await handleResponse<{ token: string; user: User }>(res)
      if (result.token) {
        localStorage.setItem('eventhub_token', result.token)
        localStorage.setItem('eventhub_user', JSON.stringify(result.user))
      }
      return result
    },

    async login(data: { email: string; password: string }): Promise<{ token: string; user: User }> {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await handleResponse<{ token: string; user: User }>(res)
      if (result.token) {
        localStorage.setItem('eventhub_token', result.token)
        localStorage.setItem('eventhub_user', JSON.stringify(result.user))
      }
      return result
    },

    async me(): Promise<{ user: User }> {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { ...getAuthHeader() },
      })
      return handleResponse<{ user: User }>(res)
    },

    async updateProfile(data: Partial<User>): Promise<{ user: User }> {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      })
      const result = await handleResponse<{ user: User }>(res)
      if (result.user) {
        localStorage.setItem('eventhub_user', JSON.stringify(result.user))
      }
      return result
    },

    logout() {
      localStorage.removeItem('eventhub_token')
      localStorage.removeItem('eventhub_user')
    },
  },

  events: {
    async getAll(params?: { category?: string; search?: string; status?: string }): Promise<{ events: CollegeEvent[] }> {
      const url = new URL(`${API_BASE_URL}/events`)
      if (params?.category) url.searchParams.set('category', params.category)
      if (params?.search) url.searchParams.set('search', params.search)
      if (params?.status) url.searchParams.set('status', params.status)

      const res = await fetch(url.toString(), {
        headers: { ...getAuthHeader() },
      })
      return handleResponse<{ events: CollegeEvent[] }>(res)
    },

    async getById(id: string): Promise<{ event: CollegeEvent }> {
      const res = await fetch(`${API_BASE_URL}/events/${id}`, {
        headers: { ...getAuthHeader() },
      })
      return handleResponse<{ event: CollegeEvent }>(res)
    },

    async create(event: Partial<CollegeEvent>): Promise<{ event: CollegeEvent }> {
      const res = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(event),
      })
      return handleResponse<{ event: CollegeEvent }>(res)
    },

    async update(id: string, event: Partial<CollegeEvent>): Promise<{ event: CollegeEvent }> {
      const res = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(event),
      })
      return handleResponse<{ event: CollegeEvent }>(res)
    },

    async delete(id: string): Promise<{ message: string }> {
      const res = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      })
      return handleResponse<{ message: string }>(res)
    },
  },

  registrations: {
    async register(eventId: string): Promise<{ registration: Registration; message: string }> {
      const res = await fetch(`${API_BASE_URL}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ eventId }),
      })
      return handleResponse<{ registration: Registration; message: string }>(res)
    },

    async getMy(): Promise<{ registrations: Registration[] }> {
      const res = await fetch(`${API_BASE_URL}/registrations/my`, {
        headers: { ...getAuthHeader() },
      })
      return handleResponse<{ registrations: Registration[] }>(res)
    },

    async getEventRoster(
      eventId: string,
      params?: { search?: string; department?: string; status?: string }
    ): Promise<{ registrations: Registration[] }> {
      const url = new URL(`${API_BASE_URL}/registrations/event/${eventId}`)
      if (params?.search) url.searchParams.set('search', params.search)
      if (params?.department) url.searchParams.set('department', params.department)
      if (params?.status) url.searchParams.set('status', params.status)

      const res = await fetch(url.toString(), {
        headers: { ...getAuthHeader() },
      })
      return handleResponse<{ registrations: Registration[] }>(res)
    },

    async updateStatus(id: string, status: string): Promise<{ message: string }> {
      const res = await fetch(`${API_BASE_URL}/registrations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ status }),
      })
      return handleResponse<{ message: string }>(res)
    },

    async cancel(id: string): Promise<{ message: string }> {
      const res = await fetch(`${API_BASE_URL}/registrations/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      })
      return handleResponse<{ message: string }>(res)
    },
  },

  attendance: {
    async getDesk(eventId: string): Promise<{
      event: { id: string; title: string; category: string; date: string; time: string; venue: string }
      total: number
      checkedInCount: number
      pendingCount: number
      turnoutRate: number
      attendees: Registration[]
    }> {
      const res = await fetch(`${API_BASE_URL}/attendance/${eventId}`, {
        headers: { ...getAuthHeader() },
      })
      return handleResponse<any>(res)
    },

    async checkIn(data: {
      registrationId?: string
      eventId?: string
      rollNumber?: string
    }): Promise<{
      message: string
      registrationId: string
      checkInTime: string
      certificateId?: string
      certificateNumber?: string
    }> {
      const res = await fetch(`${API_BASE_URL}/attendance/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      })
      return handleResponse<any>(res)
    },

    async revoke(registrationId: string): Promise<{ message: string }> {
      const res = await fetch(`${API_BASE_URL}/attendance/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ registrationId }),
      })
      return handleResponse<{ message: string }>(res)
    },
  },

  notifications: {
    async getAll(): Promise<{ notifications: NotificationItem[] }> {
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { ...getAuthHeader() },
      })
      return handleResponse<{ notifications: NotificationItem[] }>(res)
    },

    async markRead(id: string): Promise<{ message: string }> {
      const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { ...getAuthHeader() },
      })
      return handleResponse<{ message: string }>(res)
    },

    async markAllRead(): Promise<{ message: string }> {
      const res = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: { ...getAuthHeader() },
      })
      return handleResponse<{ message: string }>(res)
    },

    async broadcast(data: {
      targetEventId?: string
      title: string
      message: string
      category?: string
    }): Promise<{ notification: NotificationItem; message: string }> {
      const res = await fetch(`${API_BASE_URL}/notifications/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      })
      return handleResponse<{ notification: NotificationItem; message: string }>(res)
    },
  },

  certificates: {
    async getMy(): Promise<{ certificates: CertificateItem[] }> {
      const res = await fetch(`${API_BASE_URL}/certificates/my`, {
        headers: { ...getAuthHeader() },
      })
      return handleResponse<{ certificates: CertificateItem[] }>(res)
    },

    async getById(id: string): Promise<{ certificate: CertificateItem }> {
      const res = await fetch(`${API_BASE_URL}/certificates/${id}`, {
        headers: { ...getAuthHeader() },
      })
      return handleResponse<{ certificate: CertificateItem }>(res)
    },

    async verify(code: string): Promise<{ verified: boolean; certificate?: CertificateItem; error?: string }> {
      const res = await fetch(`${API_BASE_URL}/certificates/verify/${encodeURIComponent(code)}`)
      return handleResponse<{ verified: boolean; certificate?: CertificateItem; error?: string }>(res)
    },
  },

  reports: {
    async getAnalytics(): Promise<{
      totalEvents: number
      totalRegistrations: number
      totalAttended: number
      totalCertificates: number
      attendanceRate: number
      departmentCounts: Record<string, number>
      categoryStats: { category: string; eventCount: number; totalCapacity: number; totalRegistered: number }[]
    }> {
      const res = await fetch(`${API_BASE_URL}/reports/analytics`, {
        headers: { ...getAuthHeader() },
      })
      return handleResponse<any>(res)
    },

    getSummaryCsvUrl(): string {
      return `${API_BASE_URL}/reports/export/summary`
    },

    getAttendanceCsvUrl(): string {
      return `${API_BASE_URL}/reports/export/attendance`
    },
  },
}
