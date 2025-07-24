// src/api/firmsfinderApi.ts

import { BlogPost } from '../types'; // Common BlogPost interface
import {
  FirmsfinderRawBlog,
  FirmsfinderBlogsApiResponse,
  FirmsfinderRawCategory, // Correctly defined
  FirmsfinderCategoriesApiResponse, // Correctly defined (object with 'data')
  CreateFirmsfinderBlogPayload,
  FirmsfinderRawUser,
  FirmsfinderRawCategoryObject,
  FirmsfinderUsersApiResponse
} from '../types/firmsfinder'; // Firmsfinder specific types

const FIRMSFINDER_API_BASE_URL = 'https://api.firmsfinder.co';

// --- Transformation Function ---
function transformFirmsfinderBlogToBlogPost(rawBlog: FirmsfinderRawBlog): BlogPost {
  console.log("--- Inside transformFirmsfinderBlogToBlogPost ---");
  console.log("Raw Blog Received:", rawBlog);

  const transformedBlog: BlogPost = {
    id: rawBlog._id,
    title: rawBlog.name,
    slug: rawBlog.name.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'),
    briefDescription: rawBlog.description.substring(0, 150) + '...',
    description: rawBlog.description,
    technology: 'General Tech',
    featuredImage: rawBlog.image || '',
    backgroundImage: rawBlog.image || '',
    date: rawBlog.createdAt || new Date().toISOString(),
    author: rawBlog.user?.name || 'Unknown User',
    category: Array.isArray(rawBlog.category) && rawBlog.category.length > 0
                ? rawBlog.category.map(catObj => catObj.name)
                : ['Uncategorized'],
    tags: rawBlog.tags ? rawBlog.tags.split(',').map(tag => tag.trim()) : [],
    isFeatured: 'No',
    website: 'firmsfinder.co',
    keywords: rawBlog.tags ? rawBlog.tags.split(',').map(tag => tag.trim()).join(',') : '',

    metaTitle: rawBlog.name || '',
    metaDescription: rawBlog.description.substring(0, 160) + '...',
    metaKeywords: rawBlog.tags ? rawBlog.tags.split(',').map(tag => tag.trim()).join(',') : '',
    metaImageurl: rawBlog.image || '',
    metaImagealt: rawBlog.name || '',
    metaImagetitle: rawBlog.name || '',

    url: `/blog/${rawBlog.name.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')}`,
    faq: [],
    readTime: rawBlog.readTime || '',
  };
  console.log("Transformed Blog Output:", transformedBlog);
  return transformedBlog;
}

// --- Fetch Blogs Function (GET all) ---
export async function fetchFirmsfinderBlogs(
    page: number = 1,
    limit: number = 10,
    searchTerm: string = ''
): Promise<{ blogs: BlogPost[], totalBlogs: number }> {
  console.log(`Fetching blogs from Firmsfinder: page=${page}, limit=${limit}, search=${searchTerm}`);
  
  const url = `${FIRMSFINDER_API_BASE_URL}/api/getBlogs/admin?page=${page}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Firmsfinder API Error: ${response.status} ${response.statusText}`);
    }

    const apiResponse: FirmsfinderBlogsApiResponse = await response.json(); 

    // This check is already correct because apiResponse is an object
    if (!apiResponse || !Array.isArray(apiResponse.data)) { 
      throw new Error("Firmsfinder blogs API response is not a valid object with a 'data' array.");
    }

    const transformedBlogs = apiResponse.data.map(transformFirmsfinderBlogToBlogPost);
    
    // apiResponse.totalBlogs is now correctly accessed from the object
    const totalBlogs = apiResponse.totalBlogs || transformedBlogs.length; 

    return { blogs: transformedBlogs, totalBlogs: totalBlogs };

  } catch (error) {
    console.error('Error fetching Firmsfinder blogs:', error);
    throw new Error(`Error fetching Firmsfinder blogs: ${error.message}`);
  }
}

// --- Fetch Blog by ID Function (GET single) ---
export async function fetchFirmsfinderBlogById(id: string): Promise<FirmsfinderRawBlog> {
    console.log(`Fetching Firmsfinder blog by ID: ${id}`);
    const url = `${FIRMSFINDER_API_BASE_URL}/api/getBlogById/${id}`; 
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Firmsfinder API Error: ${response.status} ${response.statusText}`);
        }
        const rawBlog: FirmsfinderRawBlog = await response.json();
        if (!rawBlog || !rawBlog._id) {
            throw new Error("Firmsfinder blog not found or invalid response.");
        }
        return rawBlog;
    } catch (error) {
        console.error(`Error fetching Firmsfinder blog by ID ${id}:`, error);
        throw new Error(`Error fetching Firmsfinder blog by ID: ${error.message}`);
    }
}

// --- Fetch Categories Function (GET) ---
// Now correctly parses the new API response structure
export async function fetchFirmsfinderCategories(): Promise<FirmsfinderCategoriesApiResponse> { // Returns the object {data: [], total: N}
    console.log("Fetching categories from Firmsfinder...");
    const url = `${FIRMSFINDER_API_BASE_URL}/api/getAllBlogCategories/admin`; 

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Firmsfinder Category API Error: ${response.status} ${response.statusText}`);
        }
        const apiResponse: FirmsfinderCategoriesApiResponse = await response.json(); // Correctly typed as object
        
        // This check is now correct because apiResponse is an object
        if (!apiResponse || !Array.isArray(apiResponse.data)) { 
            throw new Error("Firmsfinder categories API response is not a valid object with a 'data' array.");
        }
        
        return apiResponse; // Return the entire API response object (which includes data and total)
    } catch (error) {
        console.error('Error fetching Firmsfinder categories:', error);
        throw new Error(`Error fetching Firmsfinder categories: ${error.message}`);
    }
}

// --- NEW: Fetch Users Function (GET) ---
export async function fetchFirmsfinderUsers(): Promise<FirmsfinderUsersApiResponse> {
    console.log("Fetching users from Firmsfinder...");
    const url = `${FIRMSFINDER_API_BASE_URL}/api/getAllUser/admin`; // New API endpoint for users

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Firmsfinder User API Error: ${response.status} ${response.statusText}`);
        }
        const apiResponse: FirmsfinderUsersApiResponse = await response.json();

        if (!apiResponse || !Array.isArray(apiResponse.alluser)) {
            throw new Error("Firmsfinder users API response is not a valid object with an 'alluser' array.");
        }

        return apiResponse; // Return the entire API response object (which includes alluser and pagination)
    } catch (error) {
        console.error('Error fetching Firmsfinder users:', error);
        throw new Error(`Error fetching Firmsfinder users: ${error.message}`);
    }
}

// --- Create Blog Function (POST) ---
export async function createFirmsfinderBlog(blogData: CreateFirmsfinderBlogPayload): Promise<any> {
    console.log("Creating new blog for Firmsfinder:", blogData);
    const url = `${FIRMSFINDER_API_BASE_URL}/api/createBlog`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(blogData),
        });
        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.message || `Firmsfinder API Error: ${response.status} ${response.statusText}`);
        }
        return responseData;
    } catch (error) {
        console.error("Error creating Firmsfinder blog:", error);
        throw new Error(`Error creating Firmsfinder blog: ${error.message}`);
    }
}

// --- Update Blog Function (PUT/PATCH) ---
export async function updateFirmsfinderBlog(id: string, blogData: Partial<CreateFirmsfinderBlogPayload>): Promise<any> {
    console.log(`Updating Firmsfinder blog ID: ${id}`, blogData);
    const url = `${FIRMSFINDER_API_BASE_URL}/api/updateBlog/${id}`;
    try {
        const response = await fetch(url, {
            method: 'PUT', // Or 'PATCH' depending on the API
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(blogData),
        });
        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.message || `Firmsfinder API Error: ${response.status} ${response.statusText}`);
        }
        return responseData;
    } catch (error) {
        console.error(`Error updating Firmsfinder blog ID ${id}:`, error);
        throw new Error(`Error updating Firmsfinder blog: ${error.message}`);
    }
}

// --- Delete Blog Function (DELETE) ---
export async function deleteFirmsfinderBlog(id: string): Promise<any> {
    console.log(`Deleting Firmsfinder blog ID: ${id}`);
    const url = `${FIRMSFINDER_API_BASE_URL}/api/deleteBlog/${id}`;
    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.message || `Firmsfinder API Error: ${response.status} ${response.statusText}`);
        }
        return responseData;
    } catch (error) {
        console.error(`Error deleting Firmsfinder blog ID ${id}:`, error);
        throw new Error(`Error deleting Firmsfinder blog: ${error.message}`);
    }
}
