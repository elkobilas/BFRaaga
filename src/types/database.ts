export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: string;
          location: string | null;
          city: string | null;
          country: string | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: string;
          location?: string | null;
          city?: string | null;
          country?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: string;
          location?: string | null;
          city?: string | null;
          country?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      sellers: {
        Row: {
          id: string;
          user_id: string;
          business_name: string;
          slug: string;
          description: string | null;
          logo_url: string | null;
          cover_image_url: string | null;
          address: string | null;
          city: string | null;
          country: string | null;
          phone: string | null;
          email: string | null;
          whatsapp: string | null;
          business_hours: string | null;
          is_verified: boolean;
          is_active: boolean;
          commission_rate: number;
          total_sales: number;
          rating: number;
          review_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_name: string;
          slug: string;
          description?: string | null;
          logo_url?: string | null;
          cover_image_url?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          phone?: string | null;
          email?: string | null;
          whatsapp?: string | null;
          business_hours?: string | null;
          is_verified?: boolean;
          is_active?: boolean;
          commission_rate?: number;
          total_sales?: number;
          rating?: number;
          review_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_name?: string;
          slug?: string;
          description?: string | null;
          logo_url?: string | null;
          cover_image_url?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          phone?: string | null;
          email?: string | null;
          whatsapp?: string | null;
          business_hours?: string | null;
          is_verified?: boolean;
          is_active?: boolean;
          commission_rate?: number;
          total_sales?: number;
          rating?: number;
          review_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          image_url: string | null;
          parent_id: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
          image_url?: string | null;
          parent_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          icon?: string | null;
          image_url?: string | null;
          parent_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          seller_id: string;
          category_id: string | null;
          title: string;
          slug: string;
          description: string;
          price: number;
          compare_price: number | null;
          currency: string;
          stock: number;
          condition: string;
          sku: string | null;
          weight_kg: number | null;
          tags: string[] | null;
          location: string | null;
          city: string | null;
          is_active: boolean;
          is_featured: boolean;
          total_sales: number;
          rating: number;
          review_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          category_id?: string | null;
          title: string;
          slug: string;
          description: string;
          price: number;
          compare_price?: number | null;
          currency?: string;
          stock?: number;
          condition?: string;
          sku?: string | null;
          weight_kg?: number | null;
          tags?: string[] | null;
          location?: string | null;
          city?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          total_sales?: number;
          rating?: number;
          review_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          seller_id?: string;
          category_id?: string | null;
          title?: string;
          slug?: string;
          description?: string;
          price?: number;
          compare_price?: number | null;
          currency?: string;
          stock?: number;
          condition?: string;
          sku?: string | null;
          weight_kg?: number | null;
          tags?: string[] | null;
          location?: string | null;
          city?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          total_sales?: number;
          rating?: number;
          review_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          alt_text: string | null;
          sort_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          url: string;
          alt_text?: string | null;
          sort_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          url?: string;
          alt_text?: string | null;
          sort_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          order_number: string;
          status: string;
          payment_status: string;
          payment_method: string | null;
          subtotal: number;
          shipping_cost: number;
          platform_fee: number;
          total: number;
          currency: string;
          delivery_mode: string;
          delivery_address: string | null;
          delivery_city: string | null;
          delivery_phone: string | null;
          delivery_notes: string | null;
          tracking_number: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_number?: string;
          status?: string;
          payment_status?: string;
          payment_method?: string | null;
          subtotal?: number;
          shipping_cost?: number;
          platform_fee?: number;
          total?: number;
          currency?: string;
          delivery_mode?: string;
          delivery_address?: string | null;
          delivery_city?: string | null;
          delivery_phone?: string | null;
          delivery_notes?: string | null;
          tracking_number?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          order_number?: string;
          status?: string;
          payment_status?: string;
          payment_method?: string | null;
          subtotal?: number;
          shipping_cost?: number;
          platform_fee?: number;
          total?: number;
          currency?: string;
          delivery_mode?: string;
          delivery_address?: string | null;
          delivery_city?: string | null;
          delivery_phone?: string | null;
          delivery_notes?: string | null;
          tracking_number?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          seller_id: string;
          title: string;
          price: number;
          quantity: number;
          subtotal: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          seller_id: string;
          title: string;
          price: number;
          quantity?: number;
          subtotal: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          seller_id?: string;
          title?: string;
          price?: number;
          quantity?: number;
          subtotal?: number;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          order_id: string | null;
          rating: number;
          title: string | null;
          comment: string | null;
          is_approved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          order_id?: string | null;
          rating: number;
          title?: string | null;
          comment?: string | null;
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          order_id?: string | null;
          rating?: number;
          title?: string | null;
          comment?: string | null;
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
