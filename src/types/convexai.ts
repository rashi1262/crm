// src/types/convexai.ts

// Interface for a single raw blog object from ConvexAI's GET /getAllBlogs API
export interface ConvexaiRawBlog {
    _id: string; // MongoDB ID
    title: string;
    description: string;
    author: string;
    date: string; // API might return this as an ISO string
    image?: string; // Optional image URL
    categoryId: string; // This will be the ID string, not the full category object
    readTime?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[]; // Array of strings
    // Add any other fields that the actual GET response might include (e.g., createdAt, updatedAt, __v)
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
  }
  
  // Interface for the full response from ConvexAI's GET /getAllBlogs API
  // Assuming the API returns an array of blogs directly at the top level
  export type ConvexaiBlogsApiResponse = ConvexaiRawBlog[];
  
  
  // Interface for a single raw category object from ConvexAI's GET /getCategories API
  export interface ConvexaiRawCategory {
    _id: string;
    categoryName: string;
    // Add any other fields your BlogCategory model might have (e.g., description, createdAt)
    description?: string;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
  }
  
  // Interface for the full response from ConvexAI's GET /getCategories API
  // Assuming the API returns an array of categories directly at the top level
  export type ConvexaiCategoriesApiResponse = ConvexaiRawCategory[];
  
  
  // Interface for the payload when creating a new blog via POST /createblog
  export interface CreateConvexaiBlogPayload {
    title: string;
    description: string;
    author: string;
    // date is optional as it defaults to Date.now on the server
    image?: string;
    categoryId: string; // The ID of the selected category
    readTime?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
  }