import { apiClient } from './client'
import type { Notification } from '@/types'

export const notificationsApi = {
  // Get all notifications
  getAll: () =>
    apiClient.get<Notification[]>('/Notifications'),

  // Get unread notifications
  getUnread: () =>
    apiClient.get<Notification[]>('/Notifications', { params: { read: false } }),

  // Mark notification as read
  markAsRead: (id: number) =>
    apiClient.patch<Notification>(`/Notifications/${id}`, { read: true }),

  // Mark all as read
  markAllAsRead: async () => {
    const { data: notifications } = await notificationsApi.getUnread()
    return Promise.all(
      notifications.map(n => notificationsApi.markAsRead(n.id))
    )
  },

  // Long polling for new notifications
  poll: async (lastId?: number, timeout: number = 30000): Promise<Notification[]> => {
    const startTime = Date.now()

    const checkForNew = async (): Promise<Notification[]> => {
      try {
        const { data: notifications } = await apiClient.get<Notification[]>('/Notifications', {
          params: lastId ? { id_gt: lastId } : {},
        })

        if (notifications.length > 0) {
          return notifications
        }

        // Check if we've exceeded the timeout
        if (Date.now() - startTime >= timeout) {
          return []
        }

        // Wait 2 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 2000))
        return checkForNew()
      } catch {
        return []
      }
    }

    return checkForNew()
  },
}
