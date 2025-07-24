import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// IMPORTANT: Ensure these imports are correct from your updated types/index.ts or specific type files
import { BlogPost } from '../types'; // Common BlogPost type
import { CreateConvexaiBlogPayload, ConvexaiRawCategory } from '../types/convexai'; // ConvexAI specific types

// Import ShadCN UI Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Import Lucide Icons
import { Save, XCircle, Calendar, Type, FileText, Info, Image, Tag, Hash, ClipboardList, User, Folder, Link2, ArrowLeft } from 'lucide-react';

// Import ConvexAI API functions
import { createConvexaiBlog, fetchConvexaiCategories } from '@/api/convexaiApi';

export default function AddConvexaiBlogForm(): JSX.Element {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State for form data
  const [blogData, setBlogData] = useState<Partial<CreateConvexaiBlogPayload>>({
    title: '',
    description: '',
    author: '',
    image: '', // This will store the Base64 string of the image
    categoryId: '', // Will store the selected category _id
    readTime: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: [], // Array of strings for payload
  });

  // State for file input specific data
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);


  // State for category dropdown
  const [categories, setCategories] = useState<ConvexaiRawCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // State for metaKeywords input (as a string for user input)
  const [metaKeywordsInput, setMetaKeywordsInput] = useState<string>('');

  // --- Fetch Categories on Component Mount ---
  useEffect(() => {
    const getCategories = async () => {
      setLoadingCategories(true);
      setCategoryError(null);
      try {
        const fetchedCategories = await fetchConvexaiCategories();
        setCategories(fetchedCategories);
        if (fetchedCategories.length > 0) {
          // Optionally pre-select the first category if desired
          // setBlogData(prev => ({ ...prev, categoryId: fetchedCategories[0]._id }));
        }
      } catch (err: any) {
        console.error("Error fetching categories:", err);
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
  }, [toast]); // Depend on toast to avoid lint warning, or remove if not needed

  // --- Handlers for Form Inputs ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBlogData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handler for image file input
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setSelectedImageFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // reader.result contains the Base64 string
        const base64String = reader.result as string;
        setBlogData(prev => ({
          ...prev,
          image: base64String, // Store Base64 string in blogData
        }));
        setImagePreviewUrl(base64String); // Set for preview
      };
      reader.readAsDataURL(file); // Read the file as a Data URL (Base64)
    } else {
      setBlogData(prev => ({
        ...prev,
        image: '',
      }));
      setImagePreviewUrl(null);
    }
  };

  // Handler for metaKeywords input (string to array conversion)
  const handleMetaKeywordsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMetaKeywordsInput(value);
    setBlogData(prev => ({
      ...prev,
      metaKeywords: value.split(',').map(keyword => keyword.trim()).filter(keyword => keyword.length > 0),
    }));
  };

  // Handler for category selection
  const handleCategoryChange = (value: string) => {
    setBlogData(prev => ({
      ...prev,
      categoryId: value,
    }));
  };

  // --- Form Submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!blogData.title || !blogData.description || !blogData.author || !blogData.categoryId) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields (Title, Description, Author, Category).",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    // Construct the payload for the ConvexAI API
    const payload: CreateConvexaiBlogPayload = {
      title: blogData.title,
      description: blogData.description,
      author: blogData.author,
      image: blogData.image || undefined, // Send undefined if empty string (no image selected)
      categoryId: blogData.categoryId,
      readTime: blogData.readTime || undefined,
      metaTitle: blogData.metaTitle || undefined,
      metaDescription: blogData.metaDescription || undefined,
      metaKeywords: blogData.metaKeywords && blogData.metaKeywords.length > 0 ? blogData.metaKeywords : undefined,
    };

    toast({
      title: "Submitting Blog",
      description: "Creating blog post on ConvexAI...",
    });

    try {
      const response = await createConvexaiBlog(payload);
      console.log('ConvexAI Blog Creation Response:', response);

      toast({
        title: "Blog Added Successfully",
        description: `Blog "${blogData.title}" has been added to ConvexAI.`,
        variant: "default",
        duration: 3000,
      });

      navigate('/blog'); // Redirect back to the blog list
    } catch (error: any) {
      console.error('Error creating ConvexAI blog:', error);
      toast({
        title: "Blog Creation Failed",
        description: `Failed to add blog: ${error.message}`,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between gap-4 mb-6 w-full">
        
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Add New Blog Post to convexai.io
          </h1>
          <p className="text-gray-600 mt-1">
            Fill in the details for a new blog entry on convexai.io.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 p-8 bg-white shadow-lg rounded-xl border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-1">
              <Type className="h-4 w-4 text-blue-500" /> Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={blogData.title}
              onChange={handleChange}
              required
              placeholder="Enter blog title"
            />
          </div>

          {/* Author */}
          <div className="space-y-2">
            <Label htmlFor="author" className="flex items-center gap-1">
              <User className="h-4 w-4 text-gray-500" /> Author <span className="text-red-500">*</span>
            </Label>
            <Input
              id="author"
              name="author"
              value={blogData.author || ''}
              onChange={handleChange}
              required
              placeholder="Enter author name"
            />
          </div>

          {/* Category Dropdown */}
          <div className="space-y-2 col-span-1">
            <Label htmlFor="categoryId" className="flex items-center gap-1">
              <Folder className="h-4 w-4 text-gray-500" /> Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={blogData.categoryId || ''}
              onValueChange={handleCategoryChange}
              disabled={loadingCategories} // Disable while loading
            >
              <SelectTrigger id="categoryId" className="w-full h-10 px-3 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500">
                <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select Category"} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {categoryError && <SelectItem value="" disabled>{categoryError}</SelectItem>}
                {!loadingCategories && categories.length === 0 && !categoryError && (
                  <SelectItem value="" disabled>No categories found</SelectItem>
                )}
                {/* FIX: Changed category.name to category.categoryName */}
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.categoryName} 
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Read Time */}
          <div className="space-y-2">
            <Label htmlFor="readTime" className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-blue-500" /> Read Time (e.g., 5 min read)
            </Label>
            <Input
              id="readTime"
              name="readTime"
              value={blogData.readTime || ''}
              onChange={handleChange}
              placeholder="e.g., 5 min read"
            />
          </div>

          {/* Description (Full Content) */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <Label htmlFor="description" className="flex items-center gap-1">
              <FileText className="h-4 w-4 text-orange-500" /> Full Content <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              value={blogData.description || ''}
              onChange={handleChange}
              required
              rows={8}
              placeholder="The main content of the blog post"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <Label htmlFor="image-upload" className="flex items-center gap-1">
              <Image className="h-4 w-4 text-teal-500" /> Blog Image Upload
            </Label>
            <Input
              id="image-upload"
              name="image-upload" // Use a distinct name for the file input
              type="file"
              accept="image/*" // Accept only image files
              onChange={handleImageFileChange} // Specific handler for file input
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-sm text-gray-500 mt-1">
            </p>
            {imagePreviewUrl && (
              <div className="mt-4">
                <p className="text-sm text-gray-700 mb-2">Image Preview:</p>
                <img src={imagePreviewUrl} alt="Image Preview" className="max-w-xs h-auto rounded-md shadow-md" />
              </div>
            )}
          </div>

          {/* SEO Section */}
          <div className="space-y-4 col-span-1 md:col-span-2 border-t pt-6 mt-6 border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-indigo-600" />
              SEO Information
            </h3>
            <div className="space-y-2">
              <Label htmlFor="metaTitle" className="flex items-center gap-1">
                Meta Title
              </Label>
              <Input
                id="metaTitle"
                name="metaTitle"
                value={blogData.metaTitle || ''}
                onChange={handleChange}
                placeholder="SEO-friendly title for search engines"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaDescription" className="flex items-center gap-1">
                Meta Description
              </Label>
              <Textarea
                id="metaDescription"
                name="metaDescription"
                value={blogData.metaDescription || ''}
                onChange={handleChange}
                rows={3}
                placeholder="Brief summary for search engine results"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaKeywords" className="flex items-center gap-1">
                <Hash className="h-4 w-4 text-pink-500" /> SEO Keywords (comma-separated)
              </Label>
              <Input
                id="metaKeywords"
                name="metaKeywords"
                value={metaKeywordsInput} // Use separate state for input
                onChange={handleMetaKeywordsInputChange} // Use specific handler
                placeholder="e.g., AI, machine learning, data science"
              />
              <p className="text-sm text-gray-500">
              </p>
            </div>
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
            <Save className="h-4 w-4" />
            Add Blog to ConvexAI
          </Button>
        </div>
      </form>
    </div>
  );
}