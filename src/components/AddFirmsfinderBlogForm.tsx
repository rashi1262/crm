import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// IMPORTANT: Ensure these imports are correct from your updated types/index.ts or specific type files
import { BlogPost } from '../types'; // Common BlogPost type
// FirmsfinderRawCategory is now used for dropdown
import { CreateFirmsfinderBlogPayload, FirmsfinderRawCategory, FirmsfinderRawUser, FirmsfinderRawCategoryObject } from '../types/firmsfinder'; 

// Import ShadCN UI Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
// Re-added Select imports for the category dropdown
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 

// Import Lucide Icons
import { Save, XCircle, Calendar, Type, FileText, Info, Image, Tag, User, Folder, Link2, ArrowLeft, Loader2 } from 'lucide-react'; 

// Import Firmsfinder API functions (fetchFirmsfinderCategories is back)
import { createFirmsfinderBlog, fetchFirmsfinderCategories, fetchFirmsfinderUsers } from '@/api/firmsfinderApi';

export default function AddFirmsfinderBlogForm(): JSX.Element {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false); // For form submission loading

  // State for form data, matching CreateFirmsfinderBlogPayload structure
  const [formData, setFormData] = useState<Partial<CreateFirmsfinderBlogPayload>>({
    name: '', // Maps to title
    image: '', // Maps to featuredImage
    description: '', // Maps to full content
    tags: '', // Comma-separated string
    user: '', // User ID (author)
    category: [], // FIX: Category is an array of IDs for payload
    readTime: '',
  });

  // State for file input specific data (for 'image' field)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // --- FIX START: Re-enabled states for category dropdown ---
  const [categories, setCategories] = useState<FirmsfinderRawCategory[]>([]); // State for categories dropdown
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true); // Set to true for fetching
  const [categoryError, setCategoryError] = useState<string | null>(null); 

  // NEW: States for Users dropdown
  const [users, setUsers] = useState<FirmsfinderRawUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [userError, setUserError] = useState<string | null>(null);

  // --- FIX START: Re-enabled useEffect for Fetching Categories ---
  useEffect(() => {
    const getCategories = async () => {
      setLoadingCategories(true);
      setCategoryError(null);
      try {
        const apiResponse = await fetchFirmsfinderCategories(); // Call the API
        setCategories(apiResponse.data); // Access the 'data' array from the response
        if (apiResponse.data.length > 0) {
          // Optionally pre-select the first category if desired
          // setFormData(prev => ({ ...prev, category: [apiResponse.data[0]._id] }));
        }
      } catch (err: any) {
        console.error("Error fetching categories for Firmsfinder:", err);
        setCategoryError(err.message || "Failed to load categories.");
        toast({
          title: "Category Load Error",
          description: `Failed to load blog categories: ${err.message}`,
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setLoadingCategories(false);
      }
    };

    getCategories();
  }, [toast]);
  
  // NEW: Fetch Users on Component Mount ---
  useEffect(() => {
    const getUsers = async () => {
      setLoadingUsers(true);
      setUserError(null);
      try {
        const apiResponse = await fetchFirmsfinderUsers(); // Call the API
        setUsers(apiResponse.alluser); // Access the 'alluser' array from the response
        if (apiResponse.alluser.length > 0) {
          // Optionally pre-select a default user, e.g., if editing and need to match existing user
        }
      } catch (err: any) {
        console.error("Error fetching users for Firmsfinder:", err);
        setUserError(err.message || "Failed to load users.");
        toast({
          title: "User Load Error",
          description: `Failed to load users: ${err.message}`,
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setLoadingUsers(false);
      }
    };
    getUsers();
  }, [toast]);

  // --- Handlers for Form Inputs ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setSelectedImageFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({
          ...prev,
          image: base64String, // Store Base64 string in formData.image
        }));
        setImagePreviewUrl(base64String); // Set for preview
      };
      reader.readAsDataURL(file); // Read the file as a Data URL (Base64)
    } else {
      setFormData(prev => ({
        ...prev,
        image: '',
      }));
      setImagePreviewUrl(null);
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, tags: e.target.value }));
  };

  // FIX: Handler for category selection (from dropdown)
  const handleCategoryChange = (value: string) => { 
    // Firmsfinder backend expects an array of category IDs, so wrap single selection in array
    setFormData(prev => ({
      ...prev,
      category: value ? [value] : [], // Store the selected category ID wrapped in an array
    }));
  };

  const handleUserChange = (value: string) => { // Value is the selected user's _id
    setFormData(prev => ({ ...prev, user: value })); // Store the selected user's _id
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    // Category check now expects an array of IDs
    if (!formData.name || !formData.description || !formData.user || !formData.category || formData.category.length === 0) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields (Name, Description, User, Category).",
        variant: "destructive",
        duration: 5000,
      });
      setLoading(false);
      return;
    }

    try {
      const payload: CreateFirmsfinderBlogPayload = {
        name: formData.name, // Required
        image: formData.image || undefined,
        description: formData.description,
        tags: formData.tags || undefined,
        user: formData.user,
        category: formData.category, // This is now an array of IDs
        readTime: formData.readTime || undefined,
      };

      toast({
        title: "Submitting Blog",
        description: "Creating blog post on Firmsfinder.co...",
      });

      const response = await createFirmsfinderBlog(payload);
      console.log('Firmsfinder Blog Creation Response:', response);

      toast({
        title: "Blog Added Successfully",
        description: `Blog "${formData.name}" has been added to Firmsfinder.co.`,
        variant: "default",
        duration: 2000,
      });

      navigate('/blog');
    } catch (error: any) {
      console.error('Error creating Firmsfinder blog:', error);
      toast({
        title: "Blog Creation Failed",
        description: `Failed to add blog: ${error.message}`,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between gap-4 mb-6 w-full">
        
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Add New Blog Post to Firmsfinder.co
          </h1>
          <p className="text-gray-600 mt-1">
            Fill in the details for a new blog entry on firmsfinder.co.
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
            <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} required placeholder="Enter blog name/title" />
          </div>

          {/* User (Author) */}
          <div className="space-y-2">
            <Label htmlFor="user" className="flex items-center gap-1">
              <User className="h-4 w-4 text-gray-500" /> User (Author) <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.user || ''} // Bind to formData.user (the ID)
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
            <p className="text-sm text-gray-500 mt-1"></p>
          </div>

          {/* Description (Full Content) */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <Label htmlFor="description" className="flex items-center gap-1">
              <FileText className="h-4 w-4 text-orange-500" /> Description <span className="text-red-500">*</span>
            </Label>
            <Textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} required rows={8} placeholder="The detailed content of the blog post" />
          </div>

          {/* Category Dropdown (based on provided schema for category: [ObjectId]) */}
          <div className="space-y-2 col-span-1">
            <Label htmlFor="category" className="flex items-center gap-1">
              <Folder className="h-4 w-4 text-gray-500" /> Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.category && formData.category.length > 0 ? formData.category[0] : ''} // Selects the first ID if available
              onValueChange={handleCategoryChange}
              disabled={loadingCategories} // Disable while loading
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
            <p className="text-sm text-gray-500 mt-1"></p>
          </div>

          {/* Image Upload (Local File) --- Maps to 'image' field --- */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <Label htmlFor="image-upload" className="flex items-center gap-1">
              <Image className="h-4 w-4 text-teal-500" /> Blog Image Upload
            </Label>
            <Input
              id="image-upload"
              name="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-sm text-gray-500 mt-1">
            </p>
            {imagePreviewUrl && ( // Display image preview if a file is selected
              <div className="mt-4">
                <p className="text-sm text-gray-700 mb-2">Image Preview:</p>
                <img src={imagePreviewUrl} alt="Image Preview" className="max-w-xs h-auto rounded-md shadow-md" />
              </div>
            )}
             <p className="text-sm text-gray-500 mt-1">

            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <Label htmlFor="tags" className="flex items-center gap-1">
              <Tag className="h-4 w-4 text-orange-500" /> Tags (comma-separated)
            </Label>
            <Input id="tags" name="tags" value={formData.tags || ''} onChange={handleChange} placeholder="e.g., web-dev, cms, react" />
             <p className="text-sm text-gray-500">
            </p>
          </div>

          {/* Read Time */}
          <div className="space-y-2">
            <Label htmlFor="readTime" className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-blue-500" /> Read Time (e.g., 5 min read)
            </Label>
            <Input id="readTime" name="readTime" value={formData.readTime || ''} onChange={handleChange} placeholder="e.g., 5 min read" />
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
                            Add Blog to FirmsFinder
                          </Button>
                        </div>
      </form>
    </div>
  );
}