export interface Lead {
  id: string
  user_id: string
  name: string
  email: string | null
  phone: string | null
  source: string
  status: 'new' | 'contacted' | 'qualified' | 'negotiating' | 'closed' | 'lost'
  type: 'buyer' | 'seller' | 'both'
  notes: string | null
  property_interest: string | null
  budget_min: number | null
  budget_max: number | null
  timeline: string | null
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  user_id: string
  lead_id: string | null
  title: string
  date: string
  time: string
  location: string | null
  type: 'showing' | 'listing' | 'meeting' | 'open-house' | 'closing' | 'other'
  notes: string | null
  reminder: boolean
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  lead_id: string | null
  property_address: string
  sale_price: number
  commission_rate: number
  status: 'pending' | 'under-contract' | 'closed' | 'cancelled'
  closing_date: string | null
  milestone: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  due_date: string | null
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'completed'
  category: string | null
  lead_id: string | null
  transaction_id: string | null
  created_at: string
}

export interface Expense {
  id: string
  user_id: string
  amount: number
  category: string
  description: string | null
  date: string
  receipt_url: string | null
  created_at: string
}

export interface MileageTrip {
  id: string
  user_id: string
  date: string
  start_location: string
  end_location: string
  miles: number
  purpose: string
  lead_id: string | null
  created_at: string
}

export interface CoachProgress {
  id: string
  user_id: string
  category: string
  item_id: string
  completed_date: string
  created_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  full_name: string | null
  brokerage: string | null
  license_number: string | null
  phone: string | null
  email: string | null
  photo_url: string | null
  signature_url: string | null
  created_at: string
  updated_at: string
}

export interface DripCampaign {
  id: string
  user_id: string
  name: string
  trigger: string
  messages: DripMessage[]
  active: boolean
  created_at: string
}

export interface DripMessage {
  id: string
  day: number
  subject: string
  content: string
  type: 'email' | 'sms'
}

export interface QuickReplyTemplate {
  id: string
  user_id: string
  name: string
  category: string
  message: string
  created_at: string
}
