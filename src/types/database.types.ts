export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type TableRelationships = {
  foreignKeyName: string
  columns: string[]
  isOneToOne?: boolean
  referencedRelation: string
  referencedColumns: string[]
}[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
        Relationships: TableRelationships
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          discount_price: number | null
          category_id: string
          images: string[]
          stock: number
          is_featured: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          discount_price?: number | null
          category_id: string
          images?: string[]
          stock?: number
          is_featured?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          discount_price?: number | null
          category_id?: string
          images?: string[]
          stock?: number
          is_featured?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'products_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          address: string | null
          role: 'client' | 'admin'
          created_at?: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          address?: string | null
          role?: 'client' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          address?: string | null
          role?: 'client' | 'admin'
          created_at?: string
        }
        Relationships: TableRelationships
      }
      orders: {
        Row: {
          id: string
          user_id: string
          total_amount: number
          status: string
          shipping_address: string | null
          phone: string | null
          attachments: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_amount: number
          status?: string
          shipping_address?: string | null
          phone?: string | null
          attachments?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_amount?: number
          status?: string
          shipping_address?: string | null
          phone?: string | null
          attachments?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'orders_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at?: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'order_items_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      site_content: {
        Row: {
          id: string
          content: Json
          updated_at: string
        }
        Insert: {
          id?: string
          content?: Json
          updated_at?: string
        }
        Update: {
          id?: string
          content?: Json
          updated_at?: string
        }
        Relationships: TableRelationships
      }
      evaluation_requests: {
        Row: {
          id: string
          user_id: string
          product_id: string
          estimated_price: number
          status: string
          phone: string
          address: string | null
          notes: string | null
          attachments: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          estimated_price: number
          status?: string
          phone: string
          address?: string | null
          notes?: string | null
          attachments?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          estimated_price?: number
          status?: string
          phone?: string
          address?: string | null
          notes?: string | null
          attachments?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'evaluation_requests_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'evaluation_requests_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      contact_messages: {
        Row: {
          id: string
          name: string
          phone: string
          message: string
          status: 'new' | 'read' | 'archived'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          message: string
          status?: 'new' | 'read' | 'archived'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          message?: string
          status?: 'new' | 'read' | 'archived'
          created_at?: string
        }
        Relationships: TableRelationships
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Product = Database['public']['Tables']['products']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type ContactMessage = Database['public']['Tables']['contact_messages']['Row']
export type EvaluationRequest = Database['public']['Tables']['evaluation_requests']['Row']

/** Profile fields commonly selected in admin auth checks */
export type ProfileRoleRow = Pick<Profile, 'role' | 'full_name'>
