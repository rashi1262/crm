import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Import Lucide Icons
import { Save, XCircle, Calendar, Type, FileText, Info, Image, Tag, Hash, ClipboardList, User, Folder, Link2, ArrowLeft, Loader2 } from 'lucide-react';

// Import ConvexAI API functions and types
import { fetchConvexaiBlogById, updateConvexaiBlog, fetchConvexaiCategories } from '@/api/convexaiApi';
import { ConvexaiRawBlog, CreateConvexaiBlogPayload, ConvexaiRawCategory } from '../types/convexai';

export default function EditConvexaiBlogForm(): JSX.Element {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Get the blog ID from the URL
  const { toast } = useToast();

  const [blogData, setBlogData] = useState<Partial<CreateConvexaiBlogPayload>>({
    title: '',
    description: '',
    author: '',
    image: '',
    categoryId: '',
    readTime: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: [],
  });

  const [categories, setCategories] = useState<ConvexaiRawCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [loadingBlog, setLoadingBlog] = useState<boolean>(true);
  const [blogError, setBlogError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [metaKeywordsInput, setMetaKeywordsInput] = useState<string>('');

  // --- Fetch Blog Data and Categories on Mount ---
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        toast({ title: "Error", description: "Blog ID is missing.", variant: "destructive" });
        navigate('/blog');
        return;
      }

      setLoadingBlog(true);
      setBlogError(null);
      setLoadingCategories(true);
      setCategoryError(null);

      try {
        // Fetch blog details
        const fetchedBlog = await fetchConvexaiBlogById(id);

        // Populate form data
        setBlogData({
          title: fetchedBlog.title,
          description: fetchedBlog.description,
          author: fetchedBlog.author,
          image: fetchedBlog.image || '',
          categoryId: fetchedBlog.categoryId,
          readTime: fetchedBlog.readTime || '',
          metaTitle: fetchedBlog.metaTitle || '',
          metaDescription: fetchedBlog.metaDescription || '',
          metaKeywords: fetchedBlog.metaKeywords || [],
        });
        setMetaKeywordsInput(fetchedBlog.metaKeywords ? fetchedBlog.metaKeywords.join(', ') : '');

        toast({ title: "Blog Loaded", description: `Blog "${fetchedBlog.title}" loaded for editing.`, duration: 1500 });
      } catch (err: any) {
        console.error("Error fetching blog for edit:", err);
        setBlogError(err.message || "Failed to load blog for editing.");
        toast({ title: "Error", description: `Failed to load blog: ${err.message}`, variant: "destructive", duration: 5000 });
        navigate('/blog'); // Redirect on error
      } finally {
        setLoadingBlog(false);
      }

      // Fetch categories for dropdown
      try {
        const fetchedCategories = await fetchConvexaiCategories();
        setCategories(fetchedCategories);
      } catch (err: any) {
        console.error("Error fetching categories:", err);
        setCategoryError(err.message || "Failed to load categories.");
        toast({ title: "Category Load Error", description: `Failed to load categories: ${err.message}`, variant: "destructive", duration: 5000 });
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchData();
  }, [id, navigate, toast]);

  // --- Handlers for Form Inputs ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBlogData(prev => ({ ...prev, [name]: value }));
  };

  const handleMetaKeywordsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMetaKeywordsInput(value);
    setBlogData(prev => ({
      ...prev,
      metaKeywords: value.split(',').map(keyword => keyword.trim()).filter(keyword => keyword.length > 0),
    }));
  };

  const handleCategoryChange = (value: string) => {
    setBlogData(prev => ({ ...prev, categoryId: value }));
  };

  // --- Form Submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!id) {
        toast({ title: "Error", description: "Blog ID is missing for update.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    // Basic validation
    if (!blogData.title || !blogData.description || !blogData.author || !blogData.categoryId) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields (Title, Description, Author, Category).",
        variant: "destructive",
        duration: 5000,
      });
      setIsSubmitting(false);
      return;
    }

    // Construct the payload for the ConvexAI API update
    const payload: Partial<CreateConvexaiBlogPayload> = { // Use Partial as not all fields might be updated
      title: blogData.title,
      description: blogData.description,
      author: blogData.author,
      image: blogData.image || undefined,
      categoryId: blogData.categoryId,
      readTime: blogData.readTime || undefined,
      metaTitle: blogData.metaTitle || undefined,
      metaDescription: blogData.metaDescription || undefined,
      metaKeywords: blogData.metaKeywords && blogData.metaKeywords.length > 0 ? blogData.metaKeywords : undefined,
    };

    toast({
      title: "Updating Blog",
      description: "Updating blog post on ConvexAI...",
    });

    try {
      const response = await updateConvexaiBlog(id, payload); // Call update API function
      console.log('ConvexAI Blog Update Response:', response);

      toast({
        title: "Blog Updated Successfully",
        description: `Blog "${blogData.title}" has been updated on ConvexAI.`,
        variant: "default",
        duration: 3000,
      });

      navigate('/blog'); // Redirect back to the blog list
    } catch (error: any) {
      console.error('Error updating ConvexAI blog:', error);
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
        <Button
          variant="ghost"
          onClick={() => navigate('/blog')}
          className="hover:bg-white/60 backdrop-blur-sm border border-gray-200 flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blogs
        </Button>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Edit Blog Post (ConvexAI)
          </h1>
          <p className="text-gray-600 mt-1">
            Modify the details of your blog entry on convexai.io.
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
              value={blogData.title || ''}
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
              disabled={loadingCategories}
            >
              <SelectTrigger id="categoryId" className="w-full h-10 px-3 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500">
                <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select Category"} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {categoryError && <SelectItem value="" disabled>{categoryError}</SelectItem>}
                {!loadingCategories && categories.length === 0 && !categoryError && (
                  <SelectItem value="" disabled>No categories found</SelectItem>
                )}
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

          {/* Image URL */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <Label htmlFor="image" className="flex items-center gap-1">
              <Image className="h-4 w-4 text-teal-500" /> Blog Image URL
            </Label>
            <Input
              id="image"
              name="image"
              type="text"
              value={blogData.image || ''}
              onChange={handleChange}
              placeholder="Enter URL for blog image (e.g., https://example.com/image.jpg)"
            />
            <p className="text-sm text-gray-500 mt-1">
              Provide a direct URL to your blog's image.
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
                Keywords for search engine optimization.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button
            type="submit"
            disabled={isSubmitting}
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
            {isSubmitting ? 'Updating Blog...' : 'Update Blog Post'}
          </Button>
        </div>
      </form>
    </div>
  );
}