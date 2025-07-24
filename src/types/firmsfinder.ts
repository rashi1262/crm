// src/types/firmsfinder.ts

// Interface for the 'user' object nested within a FirmsfinderRawBlog (from GET API)
export interface FirmsfinderRawUser {
  _id: string;
  name: string; // The user's name (for display)
  email?: string;
  role?: string;
  username?: string;
  password?: string;
  imageUrl?: string;
  googleId?: string;
  companyName?: string;
  companyWebsite?: string;
  country?: string;
  linkedinUrl?: string;
  title?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

// Interface for the 'category' object nested within a FirmsfinderRawBlog (from GET API)
export interface FirmsfinderRawCategoryObject {
  _id: string;
  name: string; // The category name
  postCount?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}


// Interface for a single raw blog object from Firmsfinder's GET /api/getBlogs/admin API
export interface FirmsfinderRawBlog {
  _id: string;
  name: string; // Maps to title
  image?: string; // Maps to featuredImage
  description: string; // Maps to briefDescription / detailDescription
  tags: string; // Maps to tags (comma-separated string)
  user: FirmsfinderRawUser; // 'user' is an object
  category: FirmsfinderRawCategoryObject[]; // 'category' is an array of objects
  readTime?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  keywords?: string; // Add this just in case your API also sends this field directly
}

// Interface for the full response from Firmsfinder's GET /api/getBlogs/admin API
export interface FirmsfinderBlogsApiResponse {
  success: boolean;
  message?: string;
  data: FirmsfinderRawBlog[];
  totalBlogs?: number;
}

// --- FIX START: Corrected type for fetching category list ---
// Interface for a single raw category object (from the /api/getAllBlogCategories/admin data array)
export interface FirmsfinderRawCategory {
  _id: string;
  name: string; // Assuming category name is 'name' in this API response
  postCount?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  description?: string; // Make optional if not always present
}

// CORRECTED: Type definition for the full response from /api/getAllBlogCategories/admin
// It's an object with 'success', 'data', 'total', etc.
export interface FirmsfinderCategoriesApiResponse {
  success: boolean;
  data: FirmsfinderRawCategory[]; // <--- THIS IS THE KEY 'data' PROPERTY
  total: number;
  page?: number;
  totalPages?: number;
  // Add other pagination fields (e.g., limit, pagingCounter, hasNextPage) if API provides them
}
// --- FIX END ---


// NEW: Interface for the full response from Firmsfinder's GET /api/getAllUser/admin API
export interface FirmsfinderUsersApiResponse {
  success: boolean;
  message: string;
  alluser: FirmsfinderRawUser[]; // The array of user objects is under 'alluser'
  total?: number;
  page?: number;
  totalPages?: number;
  currentPage?: number;
}

// Interface for the payload when creating/updating a blog for Firmsfinder
export interface CreateFirmsfinderBlogPayload {
  name: string;
  image?: string;
  description: string;
  tags?: string;
  user: string; // For payload, you'll send the user _id as a string
  category: string[]; // For payload, you'll send array of category _ids
  readTime?: string;
}