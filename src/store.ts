import { initialData } from './data'
import type { AppData, Booking, BookingHistory, Notification, User } from './types'

const KEY = 'riya-luxury-data-v1'
const SESSION_KEY = 'riya-luxury-session-v1'
const ADMIN_SESSION_KEY = 'riya-luxury-admin-session-v1'

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

export function loadData(): AppData {
  const saved = localStorage.getItem(KEY)
  if (!saved) {
    const fresh = clone(initialData)
    saveData(fresh)
    return fresh
  }
  try {
    return { ...clone(initialData), ...JSON.parse(saved) }
  } catch {
    const fresh = clone(initialData)
    saveData(fresh)
    return fresh
  }
}

export function saveData(data: AppData) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function resetData() {
  const fresh = clone(initialData)
  saveData(fresh)
  clearSessions()
  return fresh
}

export function getUser(): User | null {
  const id = localStorage.getItem(SESSION_KEY)
  if (!id) return null
  return loadData().users.find(u => u.id === id) ?? null
}

export function setUser(userId: string | null) {
  if (!userId) localStorage.removeItem(SESSION_KEY)
  else localStorage.setItem(SESSION_KEY, userId)
}

export function isAdmin(): boolean {
  return localStorage.getItem(ADMIN_SESSION_KEY) === 'true'
}

export function setAdmin(value: boolean) {
  if (value) localStorage.setItem(ADMIN_SESSION_KEY, 'true')
  else localStorage.removeItem(ADMIN_SESSION_KEY)
}

export function clearSessions() {
  setUser(null)
  setAdmin(false)
}

export function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`
}

export async function sha256(input: string) {
  const bytes = new TextEncoder().encode(input)
  const hash = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export function bookingId(date: string) {
  const compact = date.replaceAll('-', '').slice(2)
  return `RLS-${compact}-${Math.floor(Math.random() * 9000 + 1000)}`
}

export function confirmedCount(data: AppData, date: string, time: string) {
  return data.bookings.filter(b => b.date === date && b.time === time && (b.status === 'CONFIRMED' || b.status === 'RESCHEDULED')).length
}

export function addHistory(booking: Booking, status: BookingHistory['status'], note?: string, changes?: Partial<BookingHistory>) {
  booking.history.push({ id: id('hist'), status, note, createdAt: new Date().toISOString(), ...changes })
  booking.updatedAt = new Date().toISOString()
}

export function pushNotification(data: AppData, userId: string, title: string, message: string) {
  const item: Notification = { id: id('notif'), userId, title, message, read: false, createdAt: new Date().toISOString() }
  data.notifications.unshift(item)
}
