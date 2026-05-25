export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      anime_requests: {
        Row: {
          admin_note: string | null
          anime_title: string
          created_at: string | null
          description: string | null
          id: string
          myanimelist_url: string | null
          status: Database["public"]["Enums"]["request_status"] | null
          user_id: string | null
          vote_count: number | null
        }
        Insert: {
          admin_note?: string | null
          anime_title: string
          created_at?: string | null
          description?: string | null
          id?: string
          myanimelist_url?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          user_id?: string | null
          vote_count?: number | null
        }
        Update: {
          admin_note?: string | null
          anime_title?: string
          created_at?: string | null
          description?: string | null
          id?: string
          myanimelist_url?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          user_id?: string | null
          vote_count?: number | null
        }
        Relationships: []
      }
      animes: {
        Row: {
          anime_nev: string
          average_rating: number | null
          boritokep: string | null
          created_at: string | null
          epizod_szam: number | null
          ev: number | null
          id: string
          is_featured: boolean | null
          leiras: string | null
          mufajok: string | null
          myanimelist_id: number | null
          rating_count: number | null
          status: Database["public"]["Enums"]["anime_status"] | null
          video_link: string | null
        }
        Insert: {
          anime_nev: string
          average_rating?: number | null
          boritokep?: string | null
          created_at?: string | null
          epizod_szam?: number | null
          ev?: number | null
          id?: string
          is_featured?: boolean | null
          leiras?: string | null
          mufajok?: string | null
          myanimelist_id?: number | null
          rating_count?: number | null
          status?: Database["public"]["Enums"]["anime_status"] | null
          video_link?: string | null
        }
        Update: {
          anime_nev?: string
          average_rating?: number | null
          boritokep?: string | null
          created_at?: string | null
          epizod_szam?: number | null
          ev?: number | null
          id?: string
          is_featured?: boolean | null
          leiras?: string | null
          mufajok?: string | null
          myanimelist_id?: number | null
          rating_count?: number | null
          status?: Database["public"]["Enums"]["anime_status"] | null
          video_link?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          anime_id: string | null
          content: string
          created_at: string | null
          episode_id: string | null
          id: string
          is_spoiler: boolean | null
          parent_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          anime_id?: string | null
          content: string
          created_at?: string | null
          episode_id?: string | null
          id?: string
          is_spoiler?: boolean | null
          parent_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          anime_id?: string | null
          content?: string
          created_at?: string | null
          episode_id?: string | null
          id?: string
          is_spoiler?: boolean | null
          parent_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_anime_id_fkey"
            columns: ["anime_id"]
            isOneToOne: false
            referencedRelation: "animes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      episode_subscriptions: {
        Row: {
          anime_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          anime_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          anime_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "episode_subscriptions_anime_id_fkey"
            columns: ["anime_id"]
            isOneToOne: false
            referencedRelation: "animes"
            referencedColumns: ["id"]
          },
        ]
      }
      episodes: {
        Row: {
          anime_id: string
          backup_url: string | null
          created_at: string | null
          discord_notified: boolean | null
          duration: number | null
          ending_end: number | null
          ending_start: number | null
          episode_number: number
          id: string
          opening_end: number | null
          opening_start: number | null
          subtitle_type: Database["public"]["Enums"]["subtitle_type"] | null
          subtitle_url: string | null
          thumbnail_url: string | null
          title: string | null
          url_1080p: string | null
          url_360p: string | null
          url_480p: string | null
          url_720p: string | null
          video_url: string | null
        }
        Insert: {
          anime_id: string
          backup_url?: string | null
          created_at?: string | null
          discord_notified?: boolean | null
          duration?: number | null
          ending_end?: number | null
          ending_start?: number | null
          episode_number: number
          id?: string
          opening_end?: number | null
          opening_start?: number | null
          subtitle_type?: Database["public"]["Enums"]["subtitle_type"] | null
          subtitle_url?: string | null
          thumbnail_url?: string | null
          title?: string | null
          url_1080p?: string | null
          url_360p?: string | null
          url_480p?: string | null
          url_720p?: string | null
          video_url?: string | null
        }
        Update: {
          anime_id?: string
          backup_url?: string | null
          created_at?: string | null
          discord_notified?: boolean | null
          duration?: number | null
          ending_end?: number | null
          ending_start?: number | null
          episode_number?: number
          id?: string
          opening_end?: number | null
          opening_start?: number | null
          subtitle_type?: Database["public"]["Enums"]["subtitle_type"] | null
          subtitle_url?: string | null
          thumbnail_url?: string | null
          title?: string | null
          url_1080p?: string | null
          url_360p?: string | null
          url_480p?: string | null
          url_720p?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "episodes_anime_id_fkey"
            columns: ["anime_id"]
            isOneToOne: false
            referencedRelation: "animes"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          anime_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          anime_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          anime_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_anime_id_fkey"
            columns: ["anime_id"]
            isOneToOne: false
            referencedRelation: "animes"
            referencedColumns: ["id"]
          },
        ]
      }
      manga_chapters: {
        Row: {
          chapter_number: number
          created_at: string | null
          id: string
          manga_id: string
          pages: Json | null
          title: string | null
        }
        Insert: {
          chapter_number: number
          created_at?: string | null
          id?: string
          manga_id: string
          pages?: Json | null
          title?: string | null
        }
        Update: {
          chapter_number?: number
          created_at?: string | null
          id?: string
          manga_id?: string
          pages?: Json | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manga_chapters_manga_id_fkey"
            columns: ["manga_id"]
            isOneToOne: false
            referencedRelation: "mangas"
            referencedColumns: ["id"]
          },
        ]
      }
      mangas: {
        Row: {
          author: string | null
          chapter_count: number | null
          cover_image: string | null
          created_at: string | null
          description: string | null
          genres: string | null
          id: string
          status: string | null
          title: string
        }
        Insert: {
          author?: string | null
          chapter_count?: number | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          genres?: string | null
          id?: string
          status?: string | null
          title: string
        }
        Update: {
          author?: string | null
          chapter_count?: number | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          genres?: string | null
          id?: string
          status?: string | null
          title?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          author_id: string | null
          category: Database["public"]["Enums"]["news_category"] | null
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          is_pinned: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          category?: Database["public"]["Enums"]["news_category"] | null
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_pinned?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          category?: Database["public"]["Enums"]["news_category"] | null
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_pinned?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          related_id: string | null
          related_url: string | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          related_id?: string | null
          related_url?: string | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          related_id?: string | null
          related_url?: string | null
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accent_color: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          id: string
          notify_new_episodes: boolean | null
          username: string
          wallpaper_url: string | null
        }
        Insert: {
          accent_color?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id: string
          notify_new_episodes?: boolean | null
          username: string
          wallpaper_url?: string | null
        }
        Update: {
          accent_color?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          notify_new_episodes?: boolean | null
          username?: string
          wallpaper_url?: string | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          anime_id: string
          created_at: string | null
          id: string
          score: number
          user_id: string
        }
        Insert: {
          anime_id: string
          created_at?: string | null
          id?: string
          score: number
          user_id: string
        }
        Update: {
          anime_id?: string
          created_at?: string | null
          id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_anime_id_fkey"
            columns: ["anime_id"]
            isOneToOne: false
            referencedRelation: "animes"
            referencedColumns: ["id"]
          },
        ]
      }
      request_votes: {
        Row: {
          created_at: string | null
          id: string
          request_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          request_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          request_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_votes_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "anime_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_orders: {
        Row: {
          admin_note: string | null
          created_at: string | null
          customer_email: string
          customer_name: string
          id: string
          items: Json
          payment_method: string | null
          shipping_address: string | null
          shipping_type: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          total_price: number
          tracking_number: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_note?: string | null
          created_at?: string | null
          customer_email: string
          customer_name: string
          id?: string
          items: Json
          payment_method?: string | null
          shipping_address?: string | null
          shipping_type?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_price: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_note?: string | null
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          id?: string
          items?: Json
          payment_method?: string | null
          shipping_address?: string | null
          shipping_type?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_price?: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      shop_products: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          images: Json | null
          is_visible: boolean | null
          name: string
          price: number
          stock: number | null
          variants: Json | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          is_visible?: boolean | null
          name: string
          price: number
          stock?: number | null
          variants?: Json | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          is_visible?: boolean | null
          name?: string
          price?: number
          stock?: number | null
          variants?: Json | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      watch_progress: {
        Row: {
          anime_id: string
          completed: boolean | null
          episode_id: string
          id: string
          progress_seconds: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          anime_id: string
          completed?: boolean | null
          episode_id: string
          id?: string
          progress_seconds?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          anime_id?: string
          completed?: boolean | null
          episode_id?: string
          id?: string
          progress_seconds?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_progress_anime_id_fkey"
            columns: ["anime_id"]
            isOneToOne: false
            referencedRelation: "animes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watch_progress_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlist: {
        Row: {
          anime_id: string
          created_at: string | null
          id: string
          status: Database["public"]["Enums"]["watchlist_status"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          anime_id: string
          created_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["watchlist_status"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          anime_id?: string
          created_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["watchlist_status"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_anime_id_fkey"
            columns: ["anime_id"]
            isOneToOne: false
            referencedRelation: "animes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      anime_status: "ongoing" | "completed" | "upcoming"
      app_role: "user" | "moderator" | "admin" | "shop_manager"
      news_category: "announcement" | "update" | "event"
      notification_type:
        | "new_episode"
        | "comment_reply"
        | "system"
        | "request_update"
      order_status:
        | "pending"
        | "confirmed"
        | "shipped"
        | "completed"
        | "cancelled"
      request_status: "pending" | "accepted" | "rejected"
      subtitle_type: "embedded" | "external" | "none"
      watchlist_status: "watching" | "planned" | "completed" | "dropped"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      anime_status: ["ongoing", "completed", "upcoming"],
      app_role: ["user", "moderator", "admin", "shop_manager"],
      news_category: ["announcement", "update", "event"],
      notification_type: [
        "new_episode",
        "comment_reply",
        "system",
        "request_update",
      ],
      order_status: [
        "pending",
        "confirmed",
        "shipped",
        "completed",
        "cancelled",
      ],
      request_status: ["pending", "accepted", "rejected"],
      subtitle_type: ["embedded", "external", "none"],
      watchlist_status: ["watching", "planned", "completed", "dropped"],
    },
  },
} as const
