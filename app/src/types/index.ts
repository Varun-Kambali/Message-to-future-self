// src/types/index.ts

export type CapsuleType   = 'text' | 'audio' | 'video'
export type CapsuleStatus = 'sealed' | 'delivered' | 'failed'

export interface Profile {
  id:          string
  email:       string
  name:        string | null
  bio:         string | null
  cover_color: string
  cover_title: string
  cover_image: string | null
  created_at:  string
  updated_at:  string
}

export interface Capsule {
  id:           string
  user_id:      string
  type:         CapsuleType
  content:      string | null
  media_path:   string | null
  transcript:   string | null
  prompt:       string | null
  delivery_at:  string
  recipient_email: string | null
  seal_color:   string
  seal_emoji:   string
  seal_image:   string | null
  status:       CapsuleStatus
  delivered_at: string | null
  email_sent:   boolean
  created_at:   string
  updated_at:   string
  // hydrated at read time
  media_url?:      string | null
  seal_image_url?: string | null
}

export interface CreateCapsulePayload {
  type:        CapsuleType
  content?:    string
  transcript?: string
  prompt?:     string
  delivery_at: string
  recipient_email?: string
  seal_color?: string
  seal_emoji?: string
}

export interface UpdateProfilePayload {
  name?:        string
  bio?:         string
  cover_color?: string
  cover_title?: string
}
