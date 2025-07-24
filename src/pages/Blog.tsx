// src/pages/Blog.tsx
import React, { useState, useEffect } from 'react';
import { BlogPost } from '../types';
import { SolarStationApiResponse } from '../types/solarstation'; // <--- CORRECTED IMPORT
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";
import { Search, ChevronLeft, ChevronRight, Star, Info, Hash, Tag, Globe } from 'lucide-react';

export default function Blog(): JSX.Element {
  const { toast } = useToast();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentLimit, setCurrentLimit] = useState<number>(10);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchBlogs();
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, currentLimit]);

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `https://api.solarstation.in/blogs/getAllBlogs?page=${currentPage}&limit=${currentLimit}&search=${encodeURIComponent(searchQuery)}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
      }

      const result: SolarStationApiResponse = await response.json();
      console.log("SolarStation API Raw Result:", result); // <--- ADD THIS LINE
console.log("SolarStation API Pagination Object:", result.pagination); // <--- ADD THIS LINE
console.log("SolarStation API Data Array Length:", result.data ? result.data.length : 0); 

      if (!result.data || !Array.isArray(result.data)) {
        throw new Error("API response does not contain a valid 'data' array.");
      }

      const transformedBlogs: BlogPost[] = result.data.map((blog: any) => ({
        // It's often safer to explicitly map properties rather than just spreading 'blog'
        // especially if rawBlog property names differ from BlogPost (e.g., "brief description" vs briefDescription)
        id: blog._id,
        title: blog.title,
        slug: blog.slug || blog.title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'), // Use actual slug if present
        briefDescription: blog.briefDescription || blog["brief description"], // Handle both cases if API is inconsistent
        description: blog.description || blog["detail description"], // Handle both cases
        featuredImage: blog.images?.[0] || blog["blog image"] || '', // Use images array first, then old "blog image"
        backgroundImage: '', // SolarStation API doesn't seem to have this directly
        date: blog.date,
        author: 'SolarStation Team', // Assuming default author
        category: blog.blogcategory?.[0] || 'Uncategorized', // Use first category if available
        tags: Array.isArray(blog.tags) ? blog.tags : (typeof blog.tags === 'string' ? blog.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0) : []),
        isFeatured: blog.isFeatured === true ? 'Yes' : 'No', // Map boolean to 'Yes'/'No'
        website: 'solarstation.in', // This is fixed for this component
        metaTitle: blog.metaTitle || blog.title,
        metaDescription: blog.metaDescription || blog["meta description"] || '',
        metaKeywords: blog.keywords || '', // Map rawBlog.keywords to metaKeywords
        keywords: blog.keywords || '', // Map rawBlog.keywords to keywords
        metaImageurl: blog.images?.[0] || blog["blog image"] || '', // Use first image for meta as well
        metaImagealt: blog.title,
        metaImagetitle: blog.title,
        faq: [], // SolarStation API does not seem to have FAQ in this response
        technology: undefined, // SolarStation API does not seem to have technology in this response
        url: blog.slug ? `/blog/${blog.slug}` : undefined, // Construct URL if slug exists
      }));


      setBlogs(transformedBlogs);

      // --- START OF ROBUST PAGINATION LOGIC FOR SOLARSTATION.IN IN BLOG.TSX ---
      let calculatedTotalPages = 1;
      // Prioritize API's pagination data if available and valid
      if (result.pagination && typeof result.pagination.totalPages === 'number') {
          calculatedTotalPages = result.pagination.totalPages;
          console.log("SolarStation API Pagination Response (from object in Blog.tsx):", result.pagination);
      } else {
          // Client-side heuristic if API doesn't provide totalPages or if the object is missing/malformed
          if (transformedBlogs.length === currentLimit) {
              calculatedTotalPages = currentPage + 1;
          } else {
              calculatedTotalPages = currentPage;
          }
          if (currentPage === 1 && transformedBlogs.length === 0) {
              calculatedTotalPages = 1; // If first page is empty, there's only 1 page
          }
          console.log("SolarStation Client-Side Total Pages Calculation (fallback in Blog.tsx):", calculatedTotalPages);
      }
      setTotalPages(calculatedTotalPages);
      // --- END OF ROBUST PAGINATION LOGIC FOR SOLARSTATION.IN IN BLOG.TSX ---

      toast({
        title: "Blogs Fetched",
        description: `Successfully loaded ${transformedBlogs.length} blogs.`,
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
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentLimit(Number(e.target.value));
    setCurrentPage(1);
  };

  const getPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow + 2) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      items.push(1);

      if (currentPage > 2 + Math.floor(maxPagesToShow / 2)) {
        items.push('...');
      }

      let startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(totalPages - 1, currentPage + Math.floor(maxPagesToShow / 2));

      if (currentPage <= Math.floor(maxPagesToShow / 2) + 1) {
        endPage = maxPagesToShow;
      } else if (currentPage >= totalPages - Math.floor(maxPagesToShow / 2)) {
        startPage = totalPages - maxPagesToShow + 1;
      }

      for (let i = startPage; i <= endPage; i++) {
        items.push(i);
      }

      if (currentPage < totalPages - 1 - Math.floor(maxPagesToShow / 2)) {
        items.push('...');
      }

      if (totalPages > 1) {
        items.push(totalPages);
      }
    }
    return [...new Set(items)];
  };


  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center mb-8">
        Our Blog Posts
      </h1>

      {/* Search and Pagination Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 p-4 bg-white shadow-md rounded-lg border border-gray-200">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={handleSearchInputChange}
            className="pl-10 pr-4 py-2 border rounded-md w-full"
          />
        </div>

        <div className="flex items-center gap-4">
          <Label htmlFor="limit-select">Items per page:</Label>
          <select
            id="limit-select"
            value={currentLimit}
            onChange={handleLimitChange}
            className="border rounded-md px-3 py-2"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        {totalPages > 1 && (
          <Pagination className="mt-4 md:mt-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  // REMOVE 'disabled' PROP AND REPLACE WITH ARIA AND TABINDEX
                  aria-disabled={currentPage === 1} // <--- CORRECTED
                  tabIndex={currentPage === 1 ? -1 : undefined} // <--- CORRECTED
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {getPaginationItems().map((item, index) => (
                <PaginationItem key={index}>
                  {typeof item === 'number' ? (
                    <PaginationLink
                      isActive={currentPage === item}
                      onClick={() => handlePageChange(item)}
                      // If you want the current page number link to also be "disabled" (not clickable/focusable)
                      // You can apply similar logic here:
                      aria-disabled={currentPage === item}
                      tabIndex={currentPage === item ? -1 : undefined}
                      className={currentPage === item ? 'pointer-events-none' : ''} // No opacity change needed for active link typically
                    >
                      {item}
                    </PaginationLink>
                  ) : (
                    <PaginationEllipsis />
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  // REMOVE 'disabled' PROP AND REPLACE WITH ARIA AND TABINDEX
                  aria-disabled={currentPage === totalPages} // <--- CORRECTED
                  tabIndex={currentPage === totalPages ? -1 : undefined} // <--- CORRECTED
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

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
        <div className="text-center py-8">
          <p className="text-xl text-gray-700">No blog posts found.</p>
          {searchQuery && <p className="text-gray-500">Try a different search term or clear your search.</p>}
        </div>
      )}

      {!loading && !error && blogs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col"
            >
              {blog.featuredImage && (
                <div className="w-full h-48 overflow-hidden">
                  <img
                    src={blog.featuredImage}
                    alt={blog.title}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6 flex flex-col flex-grow">
                {/* Featured Tag */}
                {blog.isFeatured === 'Yes' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 mb-2">
                    <Star className="h-4 w-4 mr-1" /> Featured
                  </span>
                )}
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  {blog.title}
                </h2>
                <p className="text-gray-600 text-sm mb-3">
                  {new Date(blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-gray-700 mb-4 flex-grow">
                  {blog.briefDescription}
                </p>

                {/* Displaying Tags */}
                {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        <Tag className="h-4 w-4 text-gray-500 mt-1" />
                        {blog.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Displaying Meta Title (Optional, for debugging/admin view) */}
                {blog.metaTitle && (
                    <p className="text-gray-500 text-xs mb-1 flex items-center gap-1">
                        <Info className="h-3 w-3" /> Meta Title: {blog.metaTitle}
                    </p>
                )}

                {/* Displaying Meta Description (Optional) */}
                {blog.metaDescription && (
                    <p className="text-gray-500 text-xs mb-1 flex items-center gap-1">
                        <Info className="h-3 w-3" /> Meta Desc: {blog.metaDescription.substring(0, 70)}...
                    </p>
                )}

                {/* Displaying Keywords (Optional) */}
                {blog.keywords && (
                    <p className="text-gray-500 text-xs mb-4 flex items-center gap-1">
                        <Hash className="h-3 w-3" /> Keywords: {blog.keywords.substring(0, 70)}...
                    </p>
                )}

                <Button
                  variant="link"
                  className="text-blue-600 hover:text-blue-800 self-start p-0 h-auto"
                  onClick={() => {
                      console.log('View blog:', blog.slug);
                      toast({
                        title: "Read More Clicked",
                        description: `You clicked to read more about "${blog.title}".`,
                        duration: 2000,
                      });
                  }}
                >
                  Read More &rarr;
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}