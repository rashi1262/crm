// src/api/vidhemaApi.ts

// Import the specific raw types for Vidhema from their dedicated file
import { VidhemaRawBlog, VidhemaApiResponse } from '../types/vidhema';
// Import the common/normalized BlogPost interface from the main types file
import { BlogPost } from '../types';

// This function transforms a single VidhemaRawBlog into a BlogPost
function transformVidhemaBlogToBlogPost(rawBlog: VidhemaRawBlog): BlogPost {
  // --- ADD THESE CONSOLE LOGS ---
  console.log("--- Inside transformVidhemaBlogToBlogPost ---");
  console.log("Raw Blog Received:", rawBlog);
  console.log("Raw Blog shortDescription:", rawBlog.shortDescription);
  console.log("Raw Blog description:", rawBlog.description);
  // --- END CONSOLE LOGS ---

  const transformedBlog: BlogPost = { // Assign to a variable to log it
    id: rawBlog._id, // Use actual _id as string
    title: rawBlog.title,
    slug: rawBlog.url.split('/').pop() || rawBlog.url, // Extract slug from URL, fallback to full URL
    briefDescription: rawBlog.shortDescription,
    description: rawBlog.description,
    technology: rawBlog.technology || '',
    featuredImage: rawBlog.featured_image || '',
    backgroundImage: rawBlog.background_image || '',
    date: rawBlog.date,
    author: rawBlog.select_author || 'Unknown Author',
    category: rawBlog.select_category || 'Uncategorized',
    tags: Array.isArray(rawBlog.meta_titlemetatags) ? rawBlog.meta_titlemetatags : [],
    isFeatured: rawBlog.is_featured ? 'Yes' : 'No', // Map boolean from API to 'Yes'/'No'
    website: 'vidhema.com', // Explicitly set for filtering
    keywords: rawBlog.meta_keywords || '',

    metaTitle: rawBlog.meta_title || rawBlog.title, // Fallback to title
    metaDescription: rawBlog.meta_description || rawBlog.shortDescription, // Fallback to short description
    metaKeywords: rawBlog.meta_keywords || '',
    metaImageurl: rawBlog.meta_imageurl || rawBlog.featured_image || '', // Fallback to featured image
    metaImagealt: rawBlog.meta_imagealt || rawBlog.title, // Fallback to title
    metaImagetitle: rawBlog.meta_imagetitle || rawBlog.title, // Fallback to title

    url: rawBlog.url, // Keep the original URL from Vidhema
    faq: Array.isArray(rawBlog.faq) ? rawBlog.faq : [],
  };

  // --- ADD THIS LOG ---
  console.log("Transformed Blog Output:", transformedBlog);
  // --- END LOG ---

  return transformedBlog;
}

const baseURL = import.meta.env.VITE_API_URL;
export async function fetchVidhemaBlogs(): Promise<BlogPost[]> {

  console.log("--- Calling fetchVidhemaBlogs function ---");

  const VIDHEMA_API_URL = `${baseURL}/blogs?filter=%7B%22order%22%3A%7B%22createdAt%22%3A-1%7D%2C%22skip%22%3A0%2C%22limit%22%3A10%7D`;
  const VIDHEMA_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmMGMxMDY1NGM1ZDUwMGY2NDM3YmQzMSIsImVtYWlsIjoic2FsZXNAdmlkaGVtYS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTI2NDQyNjIsImV4cCI6MTc1MjczMDY2Mn0.mpg--uAlcSkTXMWTZShBgq-p58gnlgPDv9bs8zniY8E";

  try {
    const response = await fetch(VIDHEMA_API_URL, {
      headers: {
        'access_token': VIDHEMA_ACCESS_TOKEN,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to fetch Vidhema blogs: ${response.status} ${response.statusText}`);
    }

    const result: VidhemaApiResponse = await response.json();

    if (!Array.isArray(result)) {
        throw new Error("Vidhema API response structure is unexpected (expected a direct array).");
    }
    return result.map(transformVidhemaBlogToBlogPost);
  } catch (error) {
    console.error('Error fetching Vidhema blogs:', error);
    throw error;
  }
}