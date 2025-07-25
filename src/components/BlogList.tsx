import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// IMPORTS: Corrected paths for specific raw types and common BlogPost
import { BlogPost } from '../types'; // Common BlogPost from index.ts
import { VidhemaRawBlog, VidhemaApiResponse } from '../types/vidhema'; // Vidhema specific types
import { SolarStationRawBlog, SolarStationApiResponse } from '../types/solarstation'; // SolarStation specific types
import { fetchConvexaiBlogs } from '@/api/convexaiApi'; // <--- ADD THIS LINE


// Import ShadCN UI Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Import Lucide Icons
import { Eye, Pencil, Trash2, Search, Plus, Star, Info, Hash, Tag, Globe } from 'lucide-react';

// Import the new ViewBlogModal component (assuming it works with BlogPost type)
import ViewBlogModal from './ViewBlogModal';

// --- Helper functions to fetch blogs from individual sources ---
// These functions are outside the component to avoid re-creation on every render
// and to be reusable for the 'all' filter.
const fetchSolarStationBlogs = async (page: number, limit: number, term: string, transform: (raw: any) => BlogPost): Promise<BlogPost[]> => {
    const solarstationUrlParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });
    if (term) {
        solarstationUrlParams.append('search', term);
    }
    const url = `https://api.solarstation.in/blogs/getAllBlogs?${solarstationUrlParams.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `SolarStation API Error: ${response.status} ${response.statusText}`);
    }
    const apiResponse: SolarStationApiResponse = await response.json();
    if (!apiResponse.data || !Array.isArray(apiResponse.data)) {
        throw new Error("SolarStation API response does not contain a valid 'data' array.");
    }
    return apiResponse.data.map(transform);
};

const fetchVidhemaBlogs = async (page: number, limit: number, term: string, accessToken: string, transform: (raw: any) => BlogPost): Promise<BlogPost[]> => {
    const vidhemaFilterObj: any = {
        order: { createdAt: -1 },
        skip: (page - 1) * limit,
        limit: limit,
    };
    if (term) {
        vidhemaFilterObj.where = { title: { like: `.*${term}.*`, options: 'i' } };
    }
    const encodedFilter = encodeURIComponent(JSON.stringify(vidhemaFilterObj));
    const url = `https://api.vidhema.com/blogs?filter=${encodedFilter}`;
    const response = await fetch(url, {
        headers: {
            'access_token': accessToken,
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Vidhema API Error: ${response.status} ${response.statusText}`);
    }
    const rawVidhemaBlogs: VidhemaApiResponse = await response.json();
    if (!Array.isArray(rawVidhemaBlogs)) {
        throw new Error("Vidhema API response is not a valid array of blogs.");
    }
    return rawVidhemaBlogs.map(transform);
};


export default function BlogList(): JSX.Element {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const currentLimit: number = 10; // Fixed to 10 blogs per page

  const [websiteFilter, setWebsiteFilter] = useState<string>('solarstation.in');

  const availableWebsites = [
    { value: 'all', label: 'All Blogs' }, // ADDED: 'All Blogs' option
    { value: 'solarstation.in', label: 'solarstation.in' },
    { value: 'vidhema.com', label: 'vidhema.com' },
    { value: 'convexai.io', label: 'convexai.io' }, // ADDED: ConvexAI option
  ];

  // IMPORTANT: For production, this token should be fetched securely (e.g., after login)
  // and not hardcoded. This is for demonstration purposes.
  // This token will expire. You will need a new one or a dynamic way to get it.
  const vidhemaAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmMGMxMDY1NGM1ZDUwMGY2NDM3YmQzMSIsImVtYWlsIjoic2FsZXNAdmlkaGVtYS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTI2NDQyNjIsImV4cCI6MTc1MjczMDY2Mn0.mpg--uAlcSkTXMWTZShBgq-p58gnlgPDv9bs8zniY8E";

  // Corrected state name for consistency
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

  // --- Helper to transform SolarStation.in API response to common BlogPost type ---
  const transformSolarStationBlog = (rawBlog: SolarStationRawBlog): BlogPost => {
    return {
      id: rawBlog._id,
      title: rawBlog.title,
      slug: rawBlog.title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'),
      briefDescription: rawBlog.briefDescription, 
      description: rawBlog.description,         
      featuredImage: rawBlog["blog image"] || '',
      backgroundImage: '',
      date: rawBlog.date,
      author: 'SolarStation Team',
      category: 'General',
      tags: Array.isArray(rawBlog.tags) ? rawBlog.tags : [],
      isFeatured: rawBlog.isFeatured ? 'Yes' : 'No',
      website: 'solarstation.in',
      keywords: rawBlog.keywords || '',
      metaTitle: rawBlog.metaTitle || rawBlog.title,
      metaDescription: rawBlog["meta description"] || '',
      metaKeywords: rawBlog.keywords || '',
      metaImageurl: rawBlog["blog image"] || '',
      metaImagealt: rawBlog.title,
      metaImagetitle: rawBlog.title,
      faq: [],
      technology: undefined,
      url: undefined,
    };
  };

  // --- Helper to transform Vidhema API response to common BlogPost type ---
  const transformVidhemaBlog = (rawBlog: VidhemaRawBlog): BlogPost => {
    return {
      id: rawBlog._id,
      title: rawBlog.title,
      slug: rawBlog.url.split('/').pop() || rawBlog._id,
      briefDescription: rawBlog.shortDescription,
      description: rawBlog.description,
      featuredImage: rawBlog.featured_image || '',
      backgroundImage: rawBlog.background_image || '',
      date: rawBlog.date,
      author: rawBlog.select_author || 'Unknown Author',
      category: rawBlog.select_category || 'Uncategorized',
      tags: Array.isArray(rawBlog.meta_titlemetatags) ? rawBlog.meta_titlemetatags : [],
      isFeatured: rawBlog.is_featured ? 'Yes' : 'No',
      website: 'vidhema.com',
      keywords: rawBlog.meta_keywords || '',
      

      metaTitle: rawBlog.meta_title || rawBlog.title,
      metaDescription: rawBlog.meta_description || rawBlog.shortDescription,
      metaKeywords: rawBlog.meta_keywords || '',
      metaImageurl: rawBlog.meta_imageurl || rawBlog.featured_image || '',
      metaImagealt: rawBlog.meta_imagealt || rawBlog.title,
      metaImagetitle: rawBlog.meta_imagetitle || rawBlog.title,
      faq: Array.isArray(rawBlog.faq) ? rawBlog.faq : [],
      technology: rawBlog.technology,
      url: rawBlog.url,
    };
  };

  
  // new ---Api fetching logic without useCallback so that easily call the function on the fitler change etc.
  const fetchBlogs=async()=>{
     // --- DEBUG LOG 1: What is fetchBlogs called with? ---
     console.log("Fetching blogs for page:", currentPage, "limit:", currentLimit, "website:", websiteFilter, "searchTerm:", searchTerm);

     setLoading(true);
     setError(null);
     try {
       let transformedBlogs: BlogPost[] = [];
       let totalItemsCount = 0; // To calculate total pages for client-side pagination
       let totalPagesFromApi = 1; // Default to 1 total page, updated by specific API responses

       if (websiteFilter === 'vidhema.com') {
         // Existing Vidhema logic
         const vidhemaFilterObj: any = {
           order: { createdAt: -1 },
           skip: (currentPage - 1) * currentLimit,
           limit: currentLimit,
         };
         if (searchTerm) {
           vidhemaFilterObj.where = { title: { like: `.*${searchTerm}.*`, options: 'i' } };
         }
 
         const encodedFilter = encodeURIComponent(JSON.stringify(vidhemaFilterObj));
         const url = `https://api.vidhema.com/blogs?filter=${encodedFilter}`;
 
         const response = await fetch(url, {
           headers: {
             'access_token': vidhemaAccessToken,
             'Content-Type': 'application/json',
           },
         });
         if (!response.ok) {
           const errorData = await response.json();
           throw new Error(errorData.message || `Vidhema API Error: ${response.status} ${response.statusText}`);
         }
         
         const rawVidhemaBlogs: VidhemaApiResponse = await response.json();
         console.log(
           `this is conosole rdt in vidm is ${currentPage}!`,rawVidhemaBlogs)
 
         if (!Array.isArray(rawVidhemaBlogs)) {
           throw new Error("Vidhema API response is not a valid array of blogs.");
         }  
         transformedBlogs = rawVidhemaBlogs.map(transformVidhemaBlog);
         

         if (rawVidhemaBlogs.length < currentLimit) {
             totalPagesFromApi = currentPage;
         } else {
             totalPagesFromApi = currentPage + 1; // Assume there's more if we got a full page
         }
         if (currentPage === 1 && rawVidhemaBlogs.length === 0) {
             totalPagesFromApi = 1; // If first page is empty, there's only 1 page
         }
 
 
       } else if (websiteFilter === 'solarstation.in') { // Changed 'else' to 'else if' for clarity
         // Existing SolarStation logic
         const solarstationUrlParams = new URLSearchParams({
           page: currentPage.toString(),
           limit: currentLimit.toString(),
         });
         if (searchTerm) {
           solarstationUrlParams.append('search', searchTerm);
         }
 
         const url = `https://api.solarstation.in/blogs/getAllBlogs?${solarstationUrlParams.toString()}`;
 
         const response = await fetch(url);
         if (!response.ok) {
           const errorData = await response.json();
           throw new Error(errorData.message || `SolarStation API Error: ${response.status} ${response.statusText}`);
         }
         const apiResponse: SolarStationApiResponse = await response.json();
 
         if (!apiResponse.data || !Array.isArray(apiResponse.data)) {
           throw new Error("SolarStation API response does not contain a valid 'data' array.");
         }
 
         transformedBlogs = apiResponse.data.map(transformSolarStationBlog);
 
         // --- START OF ROBUST LOGIC FOR SOLARSTATION.IN ---
         // Prioritize API's pagination data if available and valid
         if (apiResponse.pagination && typeof apiResponse.pagination.totalPages === 'number') {
             totalPagesFromApi = apiResponse.pagination.totalPages;
             console.log("SolarStation API Pagination Response (from object):", apiResponse.pagination); // Log API's pagination
         } else {
             // Client-side heuristic if API doesn't provide totalPages or if the object is missing/malformed
             if (transformedBlogs.length === currentLimit) {
                 totalPagesFromApi = currentPage + 1;
             } else {
                 totalPagesFromApi = currentPage;
             }
             if (currentPage === 1 && transformedBlogs.length === 0) {
                 totalPagesFromApi = 1; // If first page is empty, there's only 1 page
             }
             console.log("SolarStation Client-Side Total Pages Calculation (fallback):", totalPagesFromApi); // Log client-side calculation
         }
         // --- END OF ROBUST LOGIC FOR SOLARSTATION.IN ---
 
         console.log("SolarStation API Raw Response Data Length:", apiResponse.data.length);
 
         console.log("SolarStation API Raw Response Data Length:", apiResponse.data);
 
       } else if (websiteFilter === 'convexai.io') { // NEW: Logic for ConvexAI blogs
         console.log("Fetching blogs from ConvexAI...");
         // fetchConvexaiBlogs is assumed to return already transformed BlogPost[] and fetch all available blogs
         let allConvexaiBlogs = await fetchConvexaiBlogs(); 

         // Apply client-side search filter
         if (searchTerm) {
             allConvexaiBlogs = allConvexaiBlogs.filter(blog =>
                 blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 (blog.briefDescription && blog.briefDescription.toLowerCase().includes(searchTerm.toLowerCase())) ||
                 (blog.description && blog.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                 blog.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 blog.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 (Array.isArray(blog.tags) && blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
             );
         }
         
         totalItemsCount = allConvexaiBlogs.length; // Get count of all filtered items
         totalPagesFromApi = Math.ceil(totalItemsCount / currentLimit) || 1; // Calculate total pages

         // Apply client-side pagination (slicing)
         const startIndex = (currentPage - 1) * currentLimit;
         const endIndex = startIndex + currentLimit;
         transformedBlogs = allConvexaiBlogs.slice(startIndex, endIndex);

         console.log("ConvexAI blogs fetched and paginated:", transformedBlogs);

       } else if (websiteFilter === 'all') { // NEW: Logic for 'all' blogs
         console.log("Fetching all blogs from all sources...");
         // Fetch all blogs from each source to enable client-side search/pagination
         const [solarBlogsAll, vidhemaBlogsAll, convexaiBlogsAll] = await Promise.all([
           fetchSolarStationBlogs(1, 100000, '', transformSolarStationBlog), // Fetch all (high limit)
           fetchVidhemaBlogs(1, 100000, '', vidhemaAccessToken, transformVidhemaBlog), // Fetch all (high limit)
           fetchConvexaiBlogs(), // Assuming this already fetches all ConvexAI blogs
         ]);

         let combinedBlogs = [...solarBlogsAll, ...vidhemaBlogsAll, ...convexaiBlogsAll];

         // Apply client-side search filter for combined blogs
         if (searchTerm) {
             combinedBlogs = combinedBlogs.filter(blog =>
                 blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 (blog.briefDescription && blog.briefDescription.toLowerCase().includes(searchTerm.toLowerCase())) ||
                 (blog.description && blog.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                 blog.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 blog.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 (Array.isArray(blog.tags) && blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
             );
         }

         totalItemsCount = combinedBlogs.length;
         totalPagesFromApi = Math.ceil(totalItemsCount / currentLimit) || 1;

         // Apply client-side pagination
         const startIndex = (currentPage - 1) * currentLimit;
         const endIndex = startIndex + currentLimit;
         transformedBlogs = combinedBlogs.slice(startIndex, endIndex);
       }
 
       setBlogs(transformedBlogs);
       setTotalPages(totalPagesFromApi);
 
       toast({
         title: "Blogs Fetched",
         description: `Successfully loaded ${transformedBlogs.length} blogs from ${websiteFilter}.`,
         variant: "default",
         duration: 1500,
       });
 
     } catch (err: any) {
       console.error("Error fetching blogs:", err);
       setError(err.message || "Failed to load blogs.");
       toast({
         title: "Error",
         description: `Failed to load blogs: ${err.message}`,
         variant: "destructive",
         duration: 3000,
       });
       setBlogs([]);
       setTotalPages(1); // Reset total pages on error
     } finally {
       setLoading(false);
     }
  }
    // currentLimit is now a constant, no need to include in dependency array.
    useEffect(() => {
      console.log("[useEffect] current page change to:", currentPage)
     
      fetchBlogs();
    }, [currentPage, searchTerm, websiteFilter, vidhemaAccessToken, toast]);
  

  // --- Pagination Handlers ---
  const handlePageChange = (page: number) => {
    // --- DEBUG LOG 2: Page change requested ---
    //setCurrentPage(page)
    console.log("handlePageChange called. Attempting to set page to:", page, "Current totalPages:", totalPages);
    if (page >= 1 && page <= totalPages ) {
      setCurrentPage(page);
      console.log('this is handlechange page',currentPage)
      fetchBlogs() // Keeping this call as per "do not change existing logic"
    } else {
      console.warn(`Attempted to navigate to invalid page ${page}. Total pages: ${totalPages}`);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleWebsiteFilterChange = (value: string) => {
    setWebsiteFilter(value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Helper to generate pagination items (logic remains the same)
  const getPaginationItems = useCallback(() => {
    const items = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow + 2) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      items.push(1);

      let startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(totalPages - 1, currentPage + Math.floor(maxPagesToShow / 2));

      if (currentPage <= Math.floor(maxPagesToShow / 2) + 1) {
        endPage = maxPagesToShow;
      } else if (currentPage >= totalPages - Math.floor(maxPagesToShow / 2)) {
        startPage = totalPages - maxPagesToShow + 1;
      }

      if (startPage > 2) {
        items.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        items.push(i);
      }

      if (endPage < totalPages - 1) {
        items.push('...');
      }

      if (totalPages > 1 && !items.includes(totalPages)) {
        items.push(totalPages);
      }
    }
    return [...new Set(items)];
  }, [currentPage, totalPages]);


  // --- Action Handlers (View, Edit, Delete) ---
  const handleDelete = async (id: string): Promise<void> => {
    const blogToDelete = blogs.find(blog => blog.id === id);

    if (!blogToDelete) {
      toast({
        title: "Error",
        description: "Blog not found for deletion.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${blogToDelete.title}"? This blog is from ${blogToDelete.website}.`)) {
      try {
        let response;
        if (blogToDelete.website === 'solarstation.in') {
          response = await fetch(`https://api.solarstation.in/blogs/deleteBlog/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
          });
        } else if (blogToDelete.website === 'vidhema.com') {
          response = await fetch(`https://api.vidhema.com/blogs/${id}?access_token=${vidhemaAccessToken}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
          });
        } else if (blogToDelete.website === 'convexai.io') { // NEW: Handle ConvexAI deletion
          toast({
            title: "Deletion Not Supported Yet",
            description: `Deletion of blogs from ConvexAI is not currently supported via this interface.`,
            variant: "destructive",
            duration: 3000,
          });
          return; // Exit as deletion is not performed
        } else {
          toast({
            title: "Deletion Not Supported",
            description: `Deletion of blogs from ${blogToDelete.website} is not currently supported.`,
            variant: "destructive",
            duration: 3000,
          });
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
        }

        toast({
          title: "Blog Deleted",
          description: `Blog "${blogToDelete.title}" deleted successfully.`,
          variant: "default",
          duration: 1500,
        });

        await fetchBlogs(); // Refetch to update the list after deletion

      } catch (deleteError: any) {
        console.error("Error deleting blog:", deleteError);
        toast({
          title: "Deletion Error",
          description: `Failed to delete blog: ${deleteError.message}`,
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  };

  const openViewModal = (blog: BlogPost) => {
    setSelectedBlog(blog);
    setIsViewModalOpen(true); // Corrected state setter
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false); // Corrected state setter
    setSelectedBlog(null);
  };

  // --- DEBUG LOG 4: Pagination rendering conditions ---
  // Moved console.log OUTSIDE of the JSX render tree
  console.log("Pagination conditions:", { totalPages, loading, error, blogsLength: blogs.length, website: websiteFilter });

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Blogs List
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={handleSearchInputChange}
              className="pl-9 w-full md:w-[250px] lg:w-[300px]"
            />
          </div>

          {/* Website Filter Select */}
          <div className="w-full md:w-auto">
            <Select
              value={websiteFilter}
              onValueChange={handleWebsiteFilterChange}
            >
              <SelectTrigger className="w-full md:w-[180px] h-10 px-3 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500">
                <SelectValue placeholder="Filter by Website" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {availableWebsites.map((site) => (
                  <SelectItem key={site.value} value={site.value}>
                    {site.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Add Blog Button */}
          <Link to="/blog/add" className="w-full md:w-auto">
            <Button
              className="
                bg-gradient-to-r from-blue-600 to-purple-600
                hover:from-blue-700 hover:to-purple-700
                text-white font-semibold
                px-5 py-2 rounded-md
                shadow-md hover:shadow-lg
                transition-all duration-200
                flex items-center gap-1
                w-full justify-center md:w-auto
              "
            >
              <Plus className="h-4 w-4" />
              Add Blog
            </Button>
          </Link>
        </div>
      </div>

      {/* Loading, Error, No Blogs Found Messages */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-xl text-gray-600">Loading blogs...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8 text-red-600">
          <p className="text-xl">Error: {error}</p>
          <p>Please try again later.</p>
        </div>
      )}

      {!loading && !error && blogs.length === 0 && (
        <div className="text-center p-8 bg-white rounded-xl shadow-lg text-gray-600">
          <p className="text-xl">No blogs found.</p>
          {searchTerm && <p className="text-gray-500">Try a different search term or clear your search.</p>}
          {!searchTerm && <p className="text-gray-500">Add a new blog to get started!</p>}
        </div>
      )}

      {/* Blog List Cards */}
      {!loading && !error && blogs.length > 0 && (
        <div className="space-y-4">
          {blogs.map((blog: BlogPost) => (
            <div
              key={blog.id}
              className="border-0 rounded-xl p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-200 border-l-4 border-l-blue-500"
            >
              <div className="flex items-start justify-between flex-wrap md:flex-nowrap gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 break-words max-w-full">
                      {blog.title}
                    </h3>
                    {blog.isFeatured === 'Yes' && (
                      <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200 px-3 py-1 font-medium flex-shrink-0">
                        <Star className="h-4 w-4 mr-1" /> Featured
                      </Badge>
                    )}
                    {/* Display source website badge */}
                    <Badge className="bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1 font-medium flex-shrink-0">
                        <Globe className="h-3 w-3 mr-1" /> {blog.website}
                    </Badge>
                  </div>

                  {/* Blog Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-2">
                      <span className="font-semibold text-gray-900 shrink-0">Date:</span>
                      <p>{new Date(blog.date).toLocaleDateString()}</p>
                    </div>
                       
                    <div className="bg-gray-50 p-3 rounded-lg col-span-1 md:col-span-2 lg:col-span-1">
                      <p className="font-semibold text-gray-900">Brief Description:</p>
                      <p className="line-clamp-2">{blog.briefDescription}</p>
                    </div>
                    
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 ml-auto self-start flex-shrink-0">
                  <Button
                    size="icon"
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={() => openViewModal(blog)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {/* Edit button: Only enable if it's from a known editable source (e.g., solarstation.in) */}
                  {blog.website === 'solarstation.in' && blog.slug && (
                    <Button
                      size="icon"
                      variant="outline"
                      className="border-green-200 text-green-700 hover:bg-green-50"
                      onClick={() => navigate(`/blog/edit/${blog.slug}`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {/* Delete button: Only enable if delete is supported for this source */}
                  {(blog.website === 'solarstation.in' || blog.website === 'vidhema.com' || blog.website === 'convexai.io') && blog.id && ( // ADDED: ConvexAI to deletion condition
                    <Button
                      size="icon"
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(blog.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- Pagination Controls --- */}
      {!loading && !error && blogs.length > 0 && totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  aria-disabled={currentPage === 1}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>

              {/* Using Array.from for simpler pagination display for now */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={page === currentPage}
                    onClick={() => handlePageChange(page)}
                    className={page === currentPage ? 'pointer-events-none' : ''}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  aria-disabled={currentPage === totalPages}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Render the View Blog Modal */}
      {selectedBlog && (
        <ViewBlogModal
          blog={selectedBlog}
          isOpen={isViewModalOpen}
          onClose={closeViewModal}
        />
      )}
    </div>
  );
}