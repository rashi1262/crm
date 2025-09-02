// src/types/solarstation.ts

export interface SolarStationRawBlog {
  _id: string;
  title: string;
  briefDescription: string; // <--- CORRECTED: no space, camelCase
  description: string;       // <--- CORRECTED: no space, camelCase
  date: string;
  isFeatured: boolean;
  images: string[];          // <--- CORRECTED: 'images' (plural) and an array of strings
  keywords: string;
  tags: string;              // <--- CORRECTED: 'tags' is a string, not string[] in the raw JSON
  metaTitle: string;         // <--- CORRECTED: 'metaTitle' (camelCase)
  metaDescription: string;   // <--- CORRECTED: 'metaDescription' (camelCase)
  slug: string;              // <--- CORRECTED: 'slug' (camelCase)
  blogcategory?: string[];   // <--- Added 'blogcategory' as it's in the raw JSON
  productcategory?: string[]; // <--- Added 'productcategory' as it's in the raw JSON
  readtime?: string;          // <--- Added 'readtime'
  createdAt?: string;         // <--- Added 'createdAt'
  updatedAt?: string;         // <--- Added 'updatedAt'
  __v?: number;               // <--- Added '__v'
  website?: string;
}
  
  export interface SolarStationApiResponse {
    success: boolean;
    message?: string;
    data: SolarStationRawBlog[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      limit: number;
    };
  }