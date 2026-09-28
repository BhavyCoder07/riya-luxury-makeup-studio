export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'RESCHEDULED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'
export type PaymentStatus = 'ADVANCE_PENDING' | 'ADVANCE_PAID' | 'PARTIALLY_PAID' | 'FULLY_PAID' | 'REFUND_PENDING' | 'REFUNDED'
export type AvailabilityState = 'AVAILABLE' | 'LIMITED' | 'FULL' | 'CLOSED'

export type Service = {
  id: string
  name: string
  category: string
  price: number
  description: string
  inclusions: string[]
  exclusions?: string[]
  featured?: boolean
  durationHours?: number
}

export type PortfolioItem = {
  id: string
  title: string
  category: string
  image: string
  featured?: boolean
  caption?: string
}

export type JewelleryItem = {
  id: string
  name: string
  category: string
  image: string
  rental: number
  deposit: number
  available: boolean
}

export type Review = {
  id: string
  name: string
  rating: number
  text: string
  service: string
  approved: boolean
  featured?: boolean
}

export type User = {
  id: string
  name: string
  email: string
  phone: string
  password?: string
  createdAt: string
}

export type Booking = {
  id: string
  userId: string
  serviceId: string
  serviceName: string
  customerName: string
  email: string
  phone: string
  date: string
  time: string
  status: BookingStatus
  paymentStatus: PaymentStatus
  total: number
  advance: number
  remaining: number
  notes?: string
  adminNote?: string
  createdAt: string
  updatedAt: string
  history: BookingHistory[]
}

export type BookingHistory = {
  id: string
  status: BookingStatus
  note?: string
  oldDate?: string
  newDate?: string
  oldTime?: string
  newTime?: string
  createdAt: string
}

export type Notification = {
  id: string
  userId: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export type ContactMessage = {
  id: string
  name: string
  email: string
  phone: string
  message: string
  status: 'NEW' | 'CONTACTED' | 'ARCHIVED'
  createdAt: string
}

export type BridalEnquiry = {
  id: string
  name: string
  phone: string
  email: string
  eventDate: string
  functionType: string
  preferredService: string
  preferredTime: string
  functions: number
  message: string
  status: 'NEW' | 'CONTACTED' | 'CLOSED'
  createdAt: string
}

export type SiteSettings = {
  businessName: string
  founder: string
  email: string
  phone: string
  address: string
  whatsapp: string
  instagram: string
  googleMapsUrl: string
  workingStart: string
  workingEnd: string
  maxBookingsPerSlot: number
  slotMinutes: number
}

export type AppData = {
  users: User[]
  bookings: Booking[]
  notifications: Notification[]
  services: Service[]
  portfolio: PortfolioItem[]
  jewellery: JewelleryItem[]
  reviews: Review[]
  contacts: ContactMessage[]
  enquiries: BridalEnquiry[]
  settings: SiteSettings
  unavailableDates: string[]
  unavailableSlots: string[]
  admin: { username: string; passwordHash: string; initialized: boolean }
}
