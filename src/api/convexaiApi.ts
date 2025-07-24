// src/api/convexaiApi.ts

import { BlogPost } from '../types'; // Your common BlogPost interface
import {
  ConvexaiRawBlog,
  ConvexaiBlogsApiResponse,
  ConvexaiRawCategory,
  ConvexaiCategoriesApiResponse,
  CreateConvexaiBlogPayload,
} from '../types/convexai';

// Base URL for ConvexAI APIs
const CONVEXAI_BASE_URL = 'https://api.convexai.io';

// --- Transformation Function ---
// This function converts a ConvexaiRawBlog into your common BlogPost format
function transformConvexaiBlogToBlogPost(rawBlog: ConvexaiRawBlog): BlogPost {
  // Console logs for debugging (can remove later)
  console.log("--- Inside transformConvexaiBlogToBlogPost ---");
  console.log("Raw Blog Received:", rawBlog);

  const transformedBlog: BlogPost = {
    id: rawBlog._id,
    title: rawBlog.title,
    // Assuming slug might not be directly provided, generate from title or use a default
    slug: rawBlog.title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'),
    briefDescription: rawBlog.description.substring(0, 150) + '...', // Using description for brief, adjust as needed
    description: rawBlog.description,
    technology: 'AI/ML', // Assuming a default technology for ConvexAI blogs
    featuredImage: rawBlog.image || '',
    backgroundImage: rawBlog.image || '', // Using same image for background, adjust if needed
    date: rawBlog.date,
    author: rawBlog.author,
    // For category, you'll likely want to map categoryId to a category name later
    // For now, we'll just use the ID or a placeholder.
    category: rawBlog.categoryId || 'Uncategorized', // This will be the category ID string
    tags: rawBlog.metaKeywords || [], // Using metaKeywords as tags
    isFeatured: 'No', // Assuming no 'isFeatured' field in raw data, default to 'No'
    website: 'convexai.io',
    keywords: rawBlog.metaKeywords ? rawBlog.metaKeywords.join(', ') : '',

    metaTitle: rawBlog.metaTitle || rawBlog.title,
    metaDescription: rawBlog.metaDescription || rawBlog.description.substring(0, 160) + '...',
    metaKeywords: rawBlog.metaKeywords ? rawBlog.metaKeywords.join(', ') : '',
    metaImageurl: rawBlog.image || '',
    metaImagealt: rawBlog.title,
    metaImagetitle: rawBlog.title,

    url: `/blog/${rawBlog.title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')}`, // Example URL
    faq: [], // Assuming no FAQ field, default empty
  };

  console.log("Transformed Blog Output:", transformedBlog);
  return transformedBlog;
}

// --- Fetch Blogs Function (GET) ---
export async function fetchConvexaiBlogs(): Promise<BlogPost[]> {
  console.log("Fetching blogs from ConvexAI...");
  const API_URL = `${CONVEXAI_BASE_URL}/blogs/getAllBlogs`;

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to fetch ConvexAI blogs: ${response.status} ${response.statusText}`);
    }

    // Assuming the API returns an array directly
    const rawBlogs: ConvexaiBlogsApiResponse = await response.json();

    if (!Array.isArray(rawBlogs)) {
      throw new Error("ConvexAI blogs API response is not an array.");
    }

    return rawBlogs.map(transformConvexaiBlogToBlogPost);
  } catch (error) {
    console.error('Error fetching ConvexAI blogs:', error);
    throw error;
  }
}

// --- Fetch Categories Function (GET) ---
export async function fetchConvexaiCategories(): Promise<ConvexaiRawCategory[]> {
  console.log("Fetching categories from ConvexAI...");
  const API_URL = `${CONVEXAI_BASE_URL}/blogcategory/getCategories`;

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to fetch ConvexAI categories: ${response.status} ${response.statusText}`);
    }

    // Assuming the API returns an array of categories directly
    const categories: ConvexaiCategoriesApiResponse = await response.json();

    if (!Array.isArray(categories)) {
      throw new Error("ConvexAI categories API response is not an array.");
    }

    return categories; // Return raw categories, transformation to a simpler {id, name} can happen where used
  } catch (error) {
    console.error('Error fetching ConvexAI categories:', error);
    throw error;
  }
}

// --- Create Blog Function (POST) ---
export async function createConvexaiBlog(blogData: CreateConvexaiBlogPayload): Promise<any> { // Adjust return type as needed
  console.log("Creating new blog for ConvexAI:", blogData);
  const API_URL = `${CONVEXAI_BASE_URL}/blogs/createblog`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any authorization headers here if required by ConvexAI (e.g., 'Authorization': 'Bearer YOUR_TOKEN')
      },
      body: JSON.stringify(blogData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to create ConvexAI blog: ${response.status} ${response.statusText}`);
    }

    return await response.json(); // Return the response from the server (e.g., created blog object)
  } catch (error) {
    console.error('Error creating ConvexAI blog:', error);
    throw error;
  }
}