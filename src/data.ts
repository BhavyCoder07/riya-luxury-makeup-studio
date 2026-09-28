import type { AppData, JewelleryItem, PortfolioItem, Review, Service, SiteSettings } from './types'

export const settings: SiteSettings = {
  businessName: 'RIYA LUXURY MAKEUP STUDIO',
  founder: 'Riya Sengar',
  email: 'Riyasengar337@gmail.com',
  phone: '8192068191',
  address: 'RS Luxury Makeup Studio, Near Flyover, Hathras Junction',
  whatsapp: '918192068191',
  instagram: 'https://www.instagram.com/rs_luxury_makeup_studio_5321/',
  googleMapsUrl: '',
  workingStart: '09:00',
  workingEnd: '21:00',
  maxBookingsPerSlot: 2,
  slotMinutes: 60,
}

export const services: Service[] = [
  {
    id: 'bridal-signature',
    name: 'Signature Bridal Makeup',
    category: 'Bridal',
    price: 10000,
    description: 'HD / Signature bridal makeover personally crafted by Riya Sengar.',
    inclusions: ['Bridal Makeup', 'Hairstyling', 'Contact Lenses', 'Press-On Nails', 'Mink Eyelashes'],
    exclusions: ['Hair Flowers / Gajra'],
    featured: true,
    durationHours: 2,
  },
  {
    id: 'pre-gold',
    name: 'Gold Bridal Pre-Package',
    category: 'Pre-Bridal',
    price: 5000,
    description: 'A complete pre-bridal refresh for a naturally polished glow.',
    inclusions: ['Lotus Facial', 'Full Hand Wax', 'Full Leg Wax', 'Full Body Polishing', 'Manicure', 'Pedicure'],
    durationHours: 3,
  },
  {
    id: 'pre-premium',
    name: 'Premium Bridal Pre-Package',
    category: 'Pre-Bridal',
    price: 10000,
    description: 'A luxury multi-session pre-bridal ritual designed for wedding week.',
    inclusions: ['O3+ Facial — 3 Sessions', 'Rica Wax — Full Hands & Legs', 'Hair Spa', 'Luxury Manicure', 'Luxury Pedicure', 'Full Body Polishing'],
    durationHours: 4,
  },
  {
    id: 'normal',
    name: 'Normal Makeup',
    category: 'Makeup',
    price: 1000,
    description: 'Simple, elegant makeup for occasions and everyday celebrations.',
    inclusions: [],
    durationHours: 1,
  },
  {
    id: 'hd',
    name: 'HD Makeup',
    category: 'Makeup',
    price: 1500,
    description: 'A flawless, camera-ready finish for your special occasion.',
    inclusions: [],
    durationHours: 1,
  },
  {
    id: 'signature',
    name: 'Signature Makeup',
    category: 'Makeup',
    price: 2000,
    description: 'Our premium makeup experience for a glamorous and elegant look.',
    inclusions: [],
    durationHours: 1,
  },
]

export const portfolio: PortfolioItem[] = [
  { id: 'p1', title: 'Golden Bridal Glow', category: 'Bridal', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=85', featured: true, caption: 'Warm bronze tones, luminous skin and soft bridal definition.' },
  { id: 'p2', title: 'Editorial Soft Glam', category: 'HD Makeup', image: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=1200&q=85', featured: true, caption: 'Crisp eye definition with an editorial, camera-ready finish.' },
  { id: 'p3', title: 'Rose Gold Signature', category: 'Signature', image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1200&q=85', caption: 'A soft rose-gold palette with polished highlights.' },
  { id: 'p4', title: 'Bridal Hair Detail', category: 'Hairstyling', image: 'https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?auto=format&fit=crop&w=1200&q=85', caption: 'Romantic texture and refined bridal styling.' },
  { id: 'p5', title: 'Statement Jewellery', category: 'Bridal Jewellery', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=85', caption: 'Elegant jewellery styling for the final bridal look.' },
  { id: 'p6', title: 'Before / After Beauty', category: 'Before & After', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=85', caption: 'A polished transformation focused on luminous skin and balance.' },
  { id: 'p7', title: 'Classic Bridal Eyes', category: 'Beauty Looks', image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&q=85', caption: 'Defined eyes and glowing skin with a timeless silhouette.' },
  { id: 'p8', title: 'Makeup Detail', category: 'Makeup Details', image: 'https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=1200&q=85', caption: 'Close-up beauty details and soft texture.' },
]

export const jewellery: JewelleryItem[] = [
  { id: 'j1', name: 'Royal Kundan Set', category: 'Bridal Set', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=85', rental: 3000, deposit: 5000, available: true },
  { id: 'j2', name: 'Gold Temple Set', category: 'Bridal Set', image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1000&q=85', rental: 2500, deposit: 4000, available: true },
  { id: 'j3', name: 'Pearl Bridal Choker', category: 'Choker', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=85', rental: 2000, deposit: 3000, available: true },
]

export const reviews: Review[] = [
  { id: 'r1', name: 'Aditi', rating: 5, text: 'The look felt elegant, comfortable and beautifully detailed. The whole experience was calm and premium.', service: 'Signature Makeup', approved: true, featured: true },
  { id: 'r2', name: 'Neha', rating: 5, text: 'Loved the finishing and the way the look was personalized. Everything felt very organized.', service: 'Bridal Makeup', approved: true, featured: true },
  { id: 'r3', name: 'Simran', rating: 5, text: 'The HD finish photographed beautifully and stayed fresh through the event.', service: 'HD Makeup', approved: true },
]

export const initialData: AppData = {
  users: [],
  bookings: [],
  notifications: [],
  services,
  portfolio,
  jewellery,
  reviews,
  contacts: [],
  enquiries: [],
  settings,
  unavailableDates: [],
  unavailableSlots: [],
  admin: { username: '', passwordHash: '', initialized: false },
}
