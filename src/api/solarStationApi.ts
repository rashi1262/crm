// src/api/solarStationApi.ts

import { SolarStationRawBlog, SolarStationApiResponse } from '../types/solarstation';
import { BlogPost } from '../types';

export async function fetchSolarStationBlogs(): Promise<BlogPost[]> {
  // Add log here to confirm function is being called
  console.log("--- Calling fetchSolarStationBlogs function ---");

  const SOLARSTATION_API_URL = 'https://api.solarstation.in/blogs/allBlogs';

  try {
    const response = await fetch(SOLARSTATION_API_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch SolarStation blogs: ${response.statusText}`);
    }
    const result: SolarStationApiResponse = await response.json();

    if (!result || !Array.isArray(result.data)) {
        throw new Error("SolarStation API response structure is unexpected or 'data' array is missing.");
    }

    return result.data.map((rawBlog: SolarStationRawBlog) => {
      // --- ADD THESE CONSOLE LOGS ---
      console.log("--- Inside SolarStation Transformation ---");
      console.log("SolarStation Raw Blog Item:", rawBlog);
      console.log("Raw briefDescription (from API):", rawBlog.briefDescription); // <--- Use dot notation now
      console.log("Raw description (from API):", rawBlog.description);         // <--- Use dot notation now
      // --- END CONSOLE LOGS ---

      const transformedBlog: BlogPost = {
        id: rawBlog._id,
        title: rawBlog.title,
        // Use rawBlog.slug directly as it's provided by the API
        slug: rawBlog.slug || rawBlog.title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'),
        briefDescription: rawBlog.briefDescription, // <--- CORRECTED: dot notation
        description: rawBlog.description,           // <--- CORRECTED: dot notation
        featuredImage: Array.isArray(rawBlog.images) && rawBlog.images.length > 0 ? rawBlog.images[0] : '', // Use the first image if available
        backgroundImage: '', // Not provided by SolarStation, default empty
        date: rawBlog.date,
        author: 'SolarStation Team', // Default author if API doesn't provide
        category: Array.isArray(rawBlog.blogcategory) && rawBlog.blogcategory.length > 0 ? rawBlog.blogcategory[0] : 'General', // Use first category or default
        tags: rawBlog.tags ? rawBlog.tags.split(',').map(tag => tag.trim()) : [], // <--- CORRECTED: Split string tags into array
        isFeatured: rawBlog.isFeatured ? 'Yes' : 'No',
        website: 'solarstation.in',
        keywords: rawBlog.keywords || '',

        metaTitle: rawBlog.metaTitle || rawBlog.title,
        metaDescription: rawBlog.metaDescription || rawBlog.briefDescription || '', // Use metaDescription from API
        metaKeywords: rawBlog.keywords || '',
        metaImageurl: Array.isArray(rawBlog.images) && rawBlog.images.length > 0 ? rawBlog.images[0] : '',
        metaImagealt: rawBlog.metaTitle || rawBlog.title,
        metaImagetitle: rawBlog.metaTitle || rawBlog.title,

        url: rawBlog.slug ? `/blog/${rawBlog.slug}` : '', // Construct URL using slug
        technology: '', // Not provided by SolarStation, default empty
        faq: [], // Not provided by SolarStation, default empty
      };

      // --- ADD THIS CONSOLE LOG ---
      console.log("SolarStation Transformed Blog Item:", transformedBlog);
      // --- END CONSOLE LOG ---

      return transformedBlog;
    });
  } catch (error) {
    console.error('Error fetching SolarStation blogs:', error);
    throw error;
  }
}