// src/types/index.ts

import { VidhemaRawBlog, VidhemaApiResponse } from './vidhema';
import { SolarStationRawBlog, SolarStationApiResponse } from './solarstation'; // NEW IMPORT
import { ConvexaiRawBlog, ConvexaiBlogsApiResponse } from './convexai'; // Corrected import for ConvexAI types
import { FirmsfinderRawBlog, FirmsfinderBlogsApiResponse, FirmsfinderRawCategory, FirmsfinderCategoriesApiResponse, CreateFirmsfinderBlogPayload } from './firmsfinder';


// --- COMMON BLOG POST INTERFACE (NORMALIZED) ---
// This interface represents the unified structure after transformation from either API.
export interface BlogPost {
  id: string; // CHANGED: Using string for _id from MongoDB, as it's common across many APIs
  title: string;
  slug: string; // A unique, URL-friendly identifier
  briefDescription: string;
  description: string;
  featuredImage: string; // URL to the featured image
  backgroundImage?: string; // Optional URL
  date: string; // ISO date string or similar, for consistent sorting
  author?: string; // Optional, as SolarStation might not provide it directly
  category?: string[]; // Optional, as SolarStation might not provide it directly
  tags: string[]; // Normalized as an array of strings
  isFeatured: 'Yes' | 'No'; // Normalized frontend display string (e.g., for badges)
  website: string; // Crucial: Identifies the source ('solarstation.in' or 'vidhema.com')
  keywords: string;

  // SEO fields - common names
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string; // Normalized as a string (could be comma-separated or derived from array)
  metaImageurl?: string;
  metaImagealt?: string;
  metaImagetitle?: string;

  // Source-specific fields, made optional in the common interface
  url?: string; // Original URL from Vidhema, if applicable
  technology?: string; // Specific to Vidhema blogs
  faq?: { question: string; answer: string; }[];
  readTime?: string; // <--- ADD THIS LINE! (Make it optional as not all blogs might have it)

}

// --- API PAYLOADS ---
export interface BlogPostApiPayload {
  title: string;
  slug: string;
  briefDescription: string;
  description: string;
  featuredImage: string;
  backgroundImage?: string;
  date: string;
  author: string;
  category: string;
  tags: string; // <-- API often expects comma-separated string
  isFeatured: boolean; // <-- API often expects boolean
  website: string; // Should be 'solarstation.in' or 'vidhema.com' for this payload

  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;

  keywords: string; // <--- ADD THIS LINE TO BlogPostApiPayload

  metaImageurl?: string;
  metaImagealt?: string;
  metaImagetitle?: string;

  readTime?: string; // <--- ADD THIS LINE to payload type as well

  id?: string; // For update operations, might need the ID
}


export interface GenericApiResponse<T> {
  data?: T[];
  blogs?: T[];
  totalBlogs?: number;
  totalPages?: number;
  currentPage?: number;
  limit?: number;
  message?: string;
  success?: boolean;
}

export type { VidhemaRawBlog, VidhemaApiResponse };
export type { SolarStationRawBlog, SolarStationApiResponse };
export type { ConvexaiRawBlog, ConvexaiBlogsApiResponse };
export type { FirmsfinderRawBlog, FirmsfinderBlogsApiResponse, FirmsfinderRawCategory, FirmsfinderCategoriesApiResponse, CreateFirmsfinderBlogPayload }; // NEW EXPORT
