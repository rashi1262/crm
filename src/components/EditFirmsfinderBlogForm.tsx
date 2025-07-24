import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
// Re-added Select imports for the category and user dropdowns
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 

// Import Lucide Icons
import { Save, XCircle, Calendar, Type, FileText, Info, Image, Tag, User, Folder, Link2, ArrowLeft, Loader2 } from 'lucide-react'; 

// Import Firmsfinder API functions (fetchFirmsfinderCategories and fetchFirmsfinderUsers are back)
import { fetchFirmsfinderBlogById, updateFirmsfinderBlog, fetchFirmsfinderCategories, fetchFirmsfinderUsers } from '@/api/firmsfinderApi';
// Ensure these types are correctly imported from your /types/firmsfinder.ts file
import { CreateFirmsfinderBlogPayload, FirmsfinderRawBlog, FirmsfinderRawUser, FirmsfinderRawCategoryObject, FirmsfinderRawCategory, FirmsfinderUsersApiResponse, FirmsfinderCategoriesApiResponse } from '../types/firmsfinder'; 

export default function EditFirmsfinderBlogForm(): JSX.Element {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); 
  const { toast } = useToast();

  const [blogData, setBlogData] = useState<Partial<CreateFirmsfinderBlogPayload>>({
    name: '',
    image: '',
    description: '',
    tags: '',
    user: '', // This will hold the selected user's _id (string)
    category: [], // This will hold the selected category _id (array of string IDs)
    readTime: '',
  });

  // State for image file handling (if still needed, removed for simplicity in last few updates)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // --- FIX START: Re-enabled states for User and Category dropdowns ---
  const [categories, setCategories] = useState<FirmsfinderRawCategory[]>([]); // State for categories dropdown
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true); // Set to true for fetching
  const [categoryError, setCategoryError] = useState<string | null>(null); 

  const [users, setUsers] = useState<FirmsfinderRawUser[]>([]); // State for users dropdown
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true); // Set to true for fetching
  const [userError, setUserError] = useState<string | null>(null); 
  // --- FIX END ---

  const [loadingBlog, setLoadingBlog] = useState<boolean>(true); 
  const [blogError, setBlogError] = useState<string | null>(null); 
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); 

  // --- Fetch Blog Data and Dropdown Data on Component Mount ---
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        toast({ title: "Error", description: "Blog ID is missing.", variant: "destructive" });
        navigate('/blog');
        return;
      }

      setLoadingBlog(true);
      setBlogError(null);
      setLoadingCategories(true); // Enable loading for categories
      setCategoryError(null);     
      setLoadingUsers(true);     // Enable loading for users
      setUserError(null);        

      try {
        // Fetch blog details
        const fetchedBlog: FirmsfinderRawBlog = await fetchFirmsfinderBlogById(id);

        setBlogData({
          name: fetchedBlog.name,
          image: fetchedBlog.image || '', // Image URL string
          description: fetchedBlog.description,
          tags: fetchedBlog.tags || '',
          user: fetchedBlog.user?._id || '', // Populate user with ID for dropdown selection
          category: fetchedBlog.category?.map(catObj => catObj._id) || [], // Populate category with IDs for dropdown selection
          readTime: fetchedBlog.readTime || '',
        });

        // Set image preview if an image URL exists (from fetched blog)
        if (fetchedBlog.image) {
            setImagePreviewUrl(fetchedBlog.image);
        }

        toast({ title: "Blog Loaded", description: `Blog "${fetchedBlog.name}" loaded for editing.`, duration: 1500 });
      } catch (err: any) {
        console.error("Error fetching blog for edit:", err);
        setBlogError(err.message || "Failed to load blog for editing.");
        toast({ title: "Error", description: `Failed to load blog: ${err.message}`, variant: "destructive", duration: 5000 });
        navigate('/blog'); 
      } finally {
        setLoadingBlog(false);
      }

      // Fetch categories for dropdown
      try {
        const apiResponseCategories = await fetchFirmsfinderCategories();
        setCategories(apiResponseCategories.data); 
      } catch (err: any) {
        console.error("Error fetching categories:", err);
        setCategoryError(err.message || "Failed to load categories.");
        toast({ title: "Category Load Error", description: `Failed to load categories: ${err.message}`, variant: "destructive", duration: 5000 });
      } finally {
        setLoadingCategories(false); 
      }

      // Fetch users for dropdown
      try {
        const apiResponseUsers = await fetchFirmsfinderUsers();
        setUsers(apiResponseUsers.alluser); // Access 'alluser' array
      } catch (err: any) {
        console.error("Error fetching users:", err);
        setUserError(err.message || "Failed to load users.");
        toast({ title: "User Load Error", description: `Failed to load users: ${err.message}`, variant: "destructive", duration: 5000 });
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchData();
  }, [id, navigate, toast]); 

  // --- Handlers for Form Inputs ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setBlogData(prev => ({ ...prev, [id]: value }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBlogData(prev => ({ ...prev, tags: e.target.value }));
  };

  // Handler for category selection (from dropdown)
  const handleCategoryChange = (value: string) => { 
    setBlogData(prev => ({
      ...prev,
      category: value ? [value] : [], // Store the selected category ID wrapped in an array for payload
    }));
  };

  // NEW: Handler for user selection (from dropdown)
  const handleUserChange = (value: string) => {
    setBlogData(prev => ({ ...prev, user: value })); // Store the selected user's _id
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!id) {
        toast({ title: "Error", description: "Blog ID is missing for update.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    // Basic validation
    // Category check now expects an array of IDs for the payload
    if (!blogData.name || !blogData.description || !blogData.user || !blogData.category || blogData.category.length === 0) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields (Name, Description, User, Category).",
        variant: "destructive",
        duration: 5000,
      });
      setIsSubmitting(false);
      return;
    }
 
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (blogData.user && !objectIdRegex.test(blogData.user)) {
        toast({
            title: "Invalid User ID Format",
            description: "Please enter a valid 24-character MongoDB ObjectId for the User ID (Author).",
            variant: "destructive",
            duration: 5000,
        });
        setIsSubmitting(false);
        return;
    }

    try {
      const payload: Partial<CreateFirmsfinderBlogPayload> = {
        name: blogData.name,
        image: blogData.image || undefined,
        description: blogData.description,
        tags: blogData.tags || undefined,
        user: blogData.user, // User ID (string) from the dropdown
        category: blogData.category, // This is now an array of IDs from the dropdown
        readTime: blogData.readTime || undefined,
      };

      toast({
        title: "Submitting Update",
        description: "Updating blog post on Firmsfinder.co...",
      });

      const response = await updateFirmsfinderBlog(id, payload); 
      console.log('Firmsfinder Blog Update Response:', response);

      toast({
        title: "Blog Updated Successfully",
        description: `Blog "${blogData.name}" has been updated on Firmsfinder.co.`,
        variant: "default",
        duration: 3000,
      });

      navigate('/blog'); 
    } catch (error: any) {
      console.error('Error updating Firmsfinder blog:', error);
      toast({
        title: "Blog Update Failed",
        description: `Failed to update blog: ${error.message}`,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingBlog) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
        <span className="text-lg text-gray-600">Loading blog details...</span>
      </div>
    );
  }

  if (blogError) {
    return (
      <div className="text-center text-red-600 p-8 border border-red-300 bg-red-50 rounded-md">
        <p className="text-xl mb-4">Error: {blogError}</p>
        <Button onClick={() => navigate('/blog')}>Go to Blog List</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between gap-4 mb-6 w-full">
        
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Edit Blog Post (Firmsfinder.co)
          </h1>
          <p className="text-gray-600 mt-1">
            Modify the details of your blog entry on firmsfinder.co.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 p-8 bg-white shadow-lg rounded-xl border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Blog Name (Title) */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-1">
              <Type className="h-4 w-4 text-blue-500" /> Name <span className="text-red-500">*</span>
            </Label>
            <Input id="name" name="name" value={blogData.name || ''} onChange={handleChange} required placeholder="Enter blog name/title" />
          </div>

          {/* User (Author) Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="user" className="flex items-center gap-1">
              <User className="h-4 w-4 text-gray-500" /> User (Author) <span className="text-red-500">*</span>
            </Label>
            <Select
              value={blogData.user || ''} // Bind to formData.user (the ID)
              onValueChange={handleUserChange} // Use the new handler
              disabled={loadingUsers} // Disable while users are loading
              required
            >
              <SelectTrigger id="user" className="w-full h-10 px-3 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500">
                <SelectValue placeholder={loadingUsers ? "Loading users..." : "Select Author"} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {userError && <SelectItem value="__error_placeholder__" disabled>{userError}</SelectItem>}
                {!loadingUsers && users.length === 0 && !userError && (
                  <SelectItem value="__no_users_found__" disabled>No users found</SelectItem>
                )}
                {users.map((user) => (
                  <SelectItem key={user._id} value={user._id}>
                    {user.name || user.username || user.email} {/* Display user's name, fallback to username or email */}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">Select the MongoDB ObjectId of the author/user.</p>
          </div>

          {/* Description (Full Content) */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <Label htmlFor="description" className="flex items-center gap-1">
              <FileText className="h-4 w-4 text-orange-500" /> Description <span className="text-red-500">*</span>
            </Label>
            <Textarea id="description" name="description" value={blogData.description || ''} onChange={handleChange} required rows={8} placeholder="The detailed content of the blog post" />
          </div>

          {/* Category Dropdown (based on provided schema for category: [ObjectId]) */}
          <div className="space-y-2 col-span-1">
            <Label htmlFor="category" className="flex items-center gap-1">
              <Folder className="h-4 w-4 text-gray-500" /> Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={blogData.category && blogData.category.length > 0 ? blogData.category[0] : ''} // Selects the first ID if available
              onValueChange={handleCategoryChange}
              disabled={loadingCategories} // Disable while loading
              required // Category is a required field
            >
              <SelectTrigger id="category" className="w-full h-10 px-3 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500">
                <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select Category"} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {categoryError && <SelectItem value="__error_placeholder__" disabled>{categoryError}</SelectItem>}
                {!loadingCategories && categories.length === 0 && !categoryError && (
                  <SelectItem value="__no_categories_found__" disabled>No categories found</SelectItem>
                )}
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name} {/* Assuming category object has a 'name' property */}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">This should be the MongoDB ObjectId of the category.</p>
          </div>

          {/* Image URL */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <Label htmlFor="image" className="flex items-center gap-1">
              <Image className="h-4 w-4 text-teal-500" /> Blog Image URL
            </Label>
            <Input id="image" name="image" type="text" value={blogData.image || ''} onChange={handleChange} placeholder="Enter URL for blog image (e.g., https://example.com/image.jpg)" />
            <p className="text-sm text-gray-500 mt-1">
              Provide a direct URL to your blog's image.
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <Label htmlFor="tags" className="flex items-center gap-1">
              <Tag className="h-4 w-4 text-orange-500" /> Tags (comma-separated)
            </Label>
            <Input id="tags" name="tags" value={blogData.tags || ''} onChange={handleChange} placeholder="e.g., web-dev, cms, react" />
             <p className="text-sm text-gray-500">
               Categorization tags for your blog.
            </p>
          </div>

          {/* Read Time */}
          <div className="space-y-2">
            <Label htmlFor="readTime" className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-blue-500" /> Read Time (e.g., 5 min read)
            </Label>
            <Input id="readTime" name="readTime" value={blogData.readTime || ''} onChange={handleChange} placeholder="e.g., 5 min read" />
          </div>
        </div>

        {/* Submit Button */}
                        <div className="flex justify-end pt-4 border-t border-gray-200">
                          <Button
                            type="submit"
                            className="
                              bg-gradient-to-r from-blue-600 to-purple-600
                              hover:from-blue-700 hover:to-purple-700
                              text-white font-semibold
                              px-6 py-2 rounded-lg
                              shadow-md hover:shadow-lg
                              transition-all duration-200
                              flex items-center gap-2
                            "
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Edit Blog to FirmsFinder
                          </Button>
                        </div>
      </form>
    </div>
  );
}