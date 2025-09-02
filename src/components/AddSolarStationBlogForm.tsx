import React, { useState } from 'react';
import { useNavigate , Link } from 'react-router-dom';
// IMPORTANT: Ensure these imports are correct from your updated types/index.ts or specific type files
import { BlogPost, BlogPostApiPayload } from '../types';

// Import ShadCN UI Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

// Import Lucide Icons
import { Save, XCircle, Calendar, Type, FileText, Info, Image, Tag, Star, Hash, ClipboardList, User, Folder, Link2 } from 'lucide-react';

// This component is specifically for adding blogs to solarstation.in
export default function AddSolarStationBlogForm(): JSX.Element {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [blogData, setBlogData] = useState<Partial<BlogPost>>({
    title: '',
    briefDescription: '',
    description: '', // <--- CHANGED FROM detailDescription to description
    date: new Date().toISOString().split('T')[0], // Current date (YYYY-MM-DD)
    website: 'solarstation.in', // This form is specifically for SolarStation
    slug: '',
    isFeatured: 'No',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '', // Corrected: This maps to BlogPost's metaKeywords
    tags: [],     // Blog tags (array)
    featuredImage: '', // Initialize featuredImage for BlogPost (URL)
    author: '', // ADDED: Initialize author
    category: '', // ADDED: Initialize category
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const [tagsInput, setTagsInput] = useState<string>(''); // For raw string input of blog tags

  // Helper to generate a URL-friendly slug
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric chars (except space and hyphen)
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with single hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Special handling for the main content field
    if (name === 'description') { // <--- Check for 'description' name
        setBlogData(prev => ({
            ...prev,
            description: value, // <--- Update 'description' field
        }));
    } else {
        setBlogData(prev => ({
            ...prev,
            [name]: value,
            // Auto-generate slug when title changes
            ...(name === 'title' && { slug: generateSlug(value) }),
        }));
    }
  };

  // Renamed from handleKeywordsChange to handleMetaKeywordsChange for clarity and correct mapping
  const handleMetaKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBlogData(prev => ({
        ...prev,
        metaKeywords: e.target.value, // Map to metaKeywords in BlogPost
    }));
  };

  const handleTagsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagsInput(value);
    setBlogData(prev => ({
        ...prev,
        tags: value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setBlogData(prev => ({
      ...prev,
      isFeatured: checked ? 'Yes' : 'No',
    }));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setBlogData(prev => ({ ...prev, featuredImage: '' })); // Clear any existing URL if file selected
    } else {
      setImageFile(null);
      setImagePreviewUrl(null);
      setBlogData(prev => ({ ...prev, featuredImage: '' })); // Clear if no file
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation before forming payload
    // <--- CHANGED FROM blogData.detailDescription to blogData.description
    if (!blogData.title || !blogData.briefDescription || !blogData.description || !blogData.author || !blogData.category) {
        toast({
            title: "Missing Required Fields",
            description: "Please fill in all required fields (Title, Brief Description, Full Content, Author, Category).",
            variant: "destructive",
            duration: 5000,
        });
        return;
    }

    const blogDataForApi: BlogPostApiPayload = {
      title: blogData.title,
      slug: blogData.slug || generateSlug(blogData.title),
      briefDescription: blogData.briefDescription,
      description: blogData.description, // <--- CHANGED FROM detailDescription to description
      featuredImage: blogData.featuredImage || imagePreviewUrl || '', // Use uploaded URL if available, else preview, else empty
      backgroundImage: blogData.backgroundImage || '', // Provide empty string if not set
      date: blogData.date || new Date().toISOString().split('T')[0], // Ensure date is set
      author: blogData.author, // Now correctly included
      category: blogData.category, // Now correctly included
      tags: blogData.tags ? blogData.tags.join(',') : '', // Convert string[] to comma-separated string
      isFeatured: blogData.isFeatured === 'Yes', // Convert 'Yes'/'No' to boolean
      website: 'solarstation.in', // Ensure it's explicitly set for this form
    

      metaTitle: blogData.metaTitle || blogData.title, // Fallback to title
      metaDescription: blogData.metaDescription || blogData.briefDescription, // Fallback to briefDescription
      metaKeywords: blogData.metaKeywords || (blogData.tags ? blogData.tags.join(',') : ''), // Fallback to tags
      
      keywords: blogData.metaKeywords || (blogData.tags ? blogData.tags.join(',') : ''), // Map metaKeywords or tags to keywords
      
      metaImageurl: blogData.metaImageurl || blogData.featuredImage || '', // Fallback
      metaImagealt: blogData.metaImagealt || blogData.title, // Fallback
      metaImagetitle: blogData.metaImagetitle || blogData.title, // Fallback

      // id is optional for ADD operations in BlogPostApiPayload
    };


    if (imageFile) {
        toast({
            title: "Image Upload Note",
            description: "An image file was selected. For permanent storage, a separate backend API for image uploads is needed. The blog will be submitted with the provided image URL or empty if not handled.",
            variant: "default", // Changed to default, as it's a note, not an error
            duration: 8000
        });
        // In a real scenario, you'd upload `imageFile` here and get a URL to assign to `blogDataForApi.featuredImage`
        // Example (conceptual):
        // const imageUrl = await uploadImage(imageFile);
        // blogDataForApi.featuredImage = imageUrl;
    }

    let apiSuccess = false;

    // --- API Integration Logic for SolarStation ---
    toast({
        title: "Attempting API Call",
        description: "Sending blog data to SolarStation API...",
    });
    try {
        const response = await fetch('https://api.solarstation.in/blogs/addBlog', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add any required authentication headers for SolarStation if needed
                // 'Authorization': `Bearer YOUR_TOKEN_HERE`,
            },
            body: JSON.stringify(blogDataForApi),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `SolarStation API Error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Blog added to SolarStation API:', result);
        toast({
            title: "API Success",
            description: "Blog successfully added to SolarStation API.",
            variant: "default",
            duration: 3000,
        });
        apiSuccess = true;
    } catch (error: any) {
        console.error('Error adding blog to SolarStation API:', error);
        toast({
            title: "API Error",
            description: `Failed to add blog to SolarStation API: ${error.message}`,
            variant: "destructive",
            duration: 5000,
        });
    }


    // Save to localStorage regardless of API call outcome
    try {
        // Ensure the ID for local storage is consistent with BlogPost (string)
        const blogToSaveLocally: BlogPost = {
            ...blogDataForApi, // Use the API payload data
            id: blogDataForApi.id || `local-${Date.now()}`, // Generate a local ID if API didn't return one
            tags: blogDataForApi.tags.split(',').filter(tag => tag.length > 0), // Convert tags back to array for local storage
            isFeatured: blogDataForApi.isFeatured ? 'Yes' : 'No', // Convert boolean back to 'Yes'/'No' for local storage
            // Ensure any other BlogPost specific fields are correctly set if BlogPostApiPayload has differences
        };

        const storedBlogs = localStorage.getItem('blogPosts');
        const blogs = storedBlogs ? JSON.parse(storedBlogs) : [];
        blogs.push(blogToSaveLocally);
        localStorage.setItem('blogPosts', JSON.stringify(blogs));

        toast({
            title: "Blog Added Locally",
            description: `Blog "${blogToSaveLocally.title}" has been saved to local storage.`,
            variant: apiSuccess ? "default" : "default",
            duration: 3000,
        });

        navigate('/blog'); // Redirect back to blog list
    } catch (localStorageError: any) {
        console.error('Error saving to localStorage:', localStorageError);
        toast({
            title: "Local Storage Error",
            description: "Failed to save blog to local storage.",
            variant: "destructive",
        });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 mb-6 w-full">
    <div> {/* Wrap title and description in a div */}
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Add New Blog Post to solarstation.in
        </h1>
        <p className="text-gray-600 mt-1">
            Fill in the details for a new blog entry on solarstation.in.
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

          {/* Slug (auto-generated, read-only) */}
          <div className="space-y-2">
            <Label htmlFor="slug" className="flex items-center gap-1">
              {/* Corrected: Using Link2 icon from lucide-react */}
              <Link2 className="h-4 w-4 text-gray-500" /> Slug
            </Label>
            <Input
              id="slug"
              name="slug"
              value={blogData.slug || ''}
              readOnly
              disabled // Disable direct editing
              placeholder="Slug will be generated from title"
              className="bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* Brief Description */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <Label htmlFor="briefDescription" className="flex items-center gap-1">
              <Info className="h-4 w-4 text-purple-500" /> Brief Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="briefDescription"
              name="briefDescription"
              value={blogData.briefDescription}
              onChange={handleChange}
              required
              rows={3}
              placeholder="A short summary of the blog post (max 150-200 characters)"
            />
          </div>

          {/* Full Description */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <Label htmlFor="description" className="flex items-center gap-1"> {/* CHANGED htmlFor and name */}
              <FileText className="h-4 w-4 text-orange-500" /> Full Content <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description" // CHANGED id
              name="description" // CHANGED name
              value={blogData.description} // CHANGED from detailDescription to description
              onChange={handleChange}
              required
              rows={8}
              placeholder="The main content of the blog post"
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

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="flex items-center gap-1">
              <Folder className="h-4 w-4 text-gray-500" /> Category <span className="text-red-500">*</span>
            </Label>
            <Input
              id="category"
              name="category"
              value={blogData.category || ''}
              onChange={handleChange}
              required
              placeholder="Enter blog category"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-blue-500" /> Date
            </Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={blogData.date}
              onChange={handleChange}
            />
          </div>

          {/* Is Featured */}
          <div className="space-y-2 flex items-center pt-2">
            <Label htmlFor="isFeatured" className="flex items-center gap-1 mr-4">
              <Star className="h-4 w-4 text-yellow-500" /> Is Featured?
            </Label>
            <Switch
              id="isFeatured"
              checked={blogData.isFeatured === 'Yes'}
              onCheckedChange={handleSwitchChange}
            />
          </div>

          {/* Image Upload/Preview (Local File) */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <Label htmlFor="imageFileInput" className="flex items-center gap-1 mt-4">
              <Image className="h-4 w-4 text-teal-500" /> Featured Image
            </Label>
            <Input
              id="imageFileInput"
              name="imageFileInput"
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {imagePreviewUrl && (
              <div className="mt-4 p-2 border rounded-lg bg-gray-50 flex flex-col items-center justify-center">
                <img
                  src={imagePreviewUrl}
                  alt="Image Preview"
                  className="max-w-full h-auto max-h-64 rounded-md object-contain shadow-md"
                />
                <p className="text-sm text-gray-500 mt-2">Local preview of selected image file.</p>
              </div>
            )}
          </div>

          {/* SEO Keywords Input */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <Label htmlFor="metaKeywords" className="flex items-center gap-1"> {/* Corrected name */}
              <Hash className="h-4 w-4 text-pink-500" /> SEO Keywords (comma-separated)
            </Label>
            <Input
              id="metaKeywords"
              name="metaKeywords" // Corrected name
              value={blogData.metaKeywords || ''}
              onChange={handleMetaKeywordsChange} // Using the renamed handler
              placeholder="e.g., solar panel, renewable energy, green tech"
            />
             <p className="text-sm text-gray-500">
            </p>
          </div>

          {/* Blog Tags Input */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <Label htmlFor="blogTags" className="flex items-center gap-1">
              <Tag className="h-4 w-4 text-orange-500" /> Blog Tags (comma-separated)
            </Label>
            <Input
              id="blogTags"
              name="blogTags"
              value={tagsInput}
              onChange={handleTagsInputChange}
              placeholder="e.g., solar, energy, tech"
            />
             <p className="text-sm text-gray-500">
            </p>
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
            Add Blog to SolarStation
          </Button>
        </div>
      </form>
    </div>
  );
}