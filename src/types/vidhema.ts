// src/types/vidhema.ts

export interface VidhemaRawBlog {
    _id: string; // MongoDB ID
    title: string;
    url: string; // Vidhema uses 'url' as its unique identifier/slug
    shortDescription: string;
    description: string;
    technology?: string;
    featured_image: string;
    background_image?: string;
    date: string;
    select_author: string; // Author field
    select_category: string; // Category field
    meta_titlemetatags?: string[]; // Tags field
    is_featured?: boolean; // Assuming this field exists now
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    meta_imageurl?: string;
    meta_imagealt?: string;
    meta_imagetitle?: string;
    faq?: any[];
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
}

// --- CHANGE THIS INTERFACE ---
// It should be a direct array of VidhemaRawBlog, as per the actual API response
export type VidhemaApiResponse = VidhemaRawBlog[];