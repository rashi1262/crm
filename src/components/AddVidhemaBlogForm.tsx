import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { VidhemaRawBlog } from '../types'; // Adjust path if needed

// Import Lucide Icons
import { Save, XCircle, Globe, Calendar, Type, FileText, Info, Image, Tag, Hash, ClipboardList, BookOpen } from 'lucide-react';

// This component is specifically for adding blogs to vidhema.com
export default function AddVidhemaBlogForm(): JSX.Element {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // IMPORTANT: For production, this token should be fetched securely (e.g., after login)
  // and not hardcoded. This token will expire.
  const vidhemaAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmMGMxMDY1NGM1ZDUwMGY2NDM3YmQzMSIsImVtYWlsIjoic2FsZXNAdmlkaGVtYS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTI2NDQyNjIsImV4cCI6MTc1MjczMDY2Mn0.mpg--uAlcSkTXMWTZShBgq-p58gnlgPDv9bs8zniY8E";

  const [formData, setFormData] = useState<Partial<VidhemaRawBlog>>({
    title: '',
    url: '', // Vidhema's slug/URL field
    technology: '',
    // featured_image and background_image will now be handled by file inputs
    shortDescription: '', // Equivalent to briefDescription
    date: new Date().toISOString().split('T')[0],
    select_author: '', // Vidhema's author field
    select_category: '', // Vidhema's category field
    description: '', // Equivalent to full content
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    meta_imageurl: '',
    meta_imagealt: '',
    meta_imagetitle: '',
    meta_titlemetatags: [], // Vidhema's tags/meta tags as array
    faq: [], // Vidhema's FAQ field
  });

  // State for image files and their previews
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImagePreviewUrl, setFeaturedImagePreviewUrl] = useState<string | null>(null);

  const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(null);
  const [backgroundImagePreviewUrl, setBackgroundImagePreviewUrl] = useState<string | null>(null);

  // State for raw string input for meta_titlemetatags (Vidhema's tags)
  const [vidhemaTagsInput, setVidhemaTagsInput] = useState<string>('');
  // State for raw string input for FAQ (simple for now, can be complex later)
  const [faqInput, setFaqInput] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleVidhemaTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setVidhemaTagsInput(value);
    setFormData(prev => ({
        ...prev,
        meta_titlemetatags: value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    }));
  };

  const handleFaqChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFaqInput(value);
    // Assuming each line is a FAQ item for simplicity, adjust based on actual API
    setFormData(prev => ({
        ...prev,
        faq: value.split('\n').map(item => item.trim()).filter(item => item.length > 0)
    }));
  };

  // New handler for featured image file input
  const handleFeaturedImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeaturedImageFile(file);
      setFeaturedImagePreviewUrl(URL.createObjectURL(file));
    } else {
      setFeaturedImageFile(null);
      setFeaturedImagePreviewUrl(null);
    }
  };

  // New handler for background image file input
  const handleBackgroundImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackgroundImageFile(file);
      setBackgroundImagePreviewUrl(URL.createObjectURL(file));
    } else {
      setBackgroundImageFile(null);
      setBackgroundImagePreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // IMPORTANT: In a real application, you would upload the image files first
    // to your server/CDN, get their URLs, and then include those URLs in the
    // `featured_image` and `background_image` fields of the `payload`.
    // For this example, we'll just demonstrate the selection and send dummy URLs
    // or notify the user that image upload isn't handled here.

    if (featuredImageFile || backgroundImageFile) {
        toast({
            title: "Image Upload Note",
            description: "Local image files were selected. For permanent storage, you need a separate backend API for image uploads or integrate them with the blog post submission.",
            variant: "destructive",
            duration: 8000
        });
        // In a real scenario, you'd perform an upload here and wait for URLs
        // For demonstration, we'll just use a placeholder or assume the API
        // can receive files directly if designed to, or that URLs are manually entered elsewhere.
    }


    try {
      const payload: Partial<VidhemaRawBlog> = {
        title: formData.title,
        url: formData.url,
        technology: formData.technology,
        // Send the URLs if they were manually entered or obtained from a prior upload.
        // If you intend to upload with this form, you'd handle that process here.
        featured_image: formData.featured_image || featuredImagePreviewUrl || '', // Use URL from form or local preview (for demo)
        background_image: formData.background_image || backgroundImagePreviewUrl || '', // Use URL from form or local preview (for demo)
        shortDescription: formData.shortDescription,
        date: formData.date,
        select_author: formData.select_author,
        select_category: formData.select_category,
        description: formData.description,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        meta_keywords: formData.meta_keywords,
        meta_imageurl: formData.meta_imageurl,
        meta_imagealt: formData.meta_imagealt,
        meta_imagetitle: formData.meta_imagetitle,
        meta_titlemetatags: formData.meta_titlemetatags,
        faq: formData.faq,
      };

      // Remove undefined/empty fields before sending if API is sensitive
      Object.keys(payload).forEach(key => {
        const value = payload[key as keyof typeof payload];
        if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0)) {
          delete payload[key as keyof typeof payload];
        }
      });

      const response = await fetch('https://api.vidhema.com/blogs', { // Confirm this endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': vidhemaAccessToken, // Confirm exact header name 'access_token' or 'Authorization: Bearer'
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Vidhema API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Blog added to Vidhema API:', result);
      toast({
        title: "Blog Added",
        description: "Blog successfully added to vidhema.com.",
        variant: "default",
        duration: 2000,
      });

      navigate('/blog'); // Redirect back to blog list

    } catch (error: any) {
      console.error("Error adding blog to vidhema.com:", error);
      toast({
        title: "Error",
        description: `Failed to add blog to vidhema.com: ${error.message}`,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 mb-6 w-full">
    <div> {/* Wrap title and description in a div */}
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Add New Blog Post to vidhema.com
        </h1>
        <p className="text-gray-600 mt-1">
            Fill in the details for a new blog entry on vidhema.com.
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
            <Input id="title" value={formData.title} onChange={handleChange} required placeholder="Enter blog title" />
          </div>

          {/* URL (Slug for Vidhema) */}
          <div className="space-y-2">
            <Label htmlFor="url" className="flex items-center gap-1">
              <Globe className="h-4 w-4 text-green-500" /> URL <span className="text-red-500">*</span>
            </Label>
            <Input id="url" value={formData.url} onChange={handleChange} placeholder="e.g., my-vidhema-blog-post" required />
          </div>

          {/* Short Description */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <Label htmlFor="short_description" className="flex items-center gap-1">
              <Info className="h-4 w-4 text-purple-500" /> Short Description <span className="text-red-500">*</span>
            </Label>
            <Textarea id="short_description" value={formData.shortDescription} onChange={handleChange} required rows={3} placeholder="A brief summary for Vidhema" />
          </div>

          {/* Detail Description (Full Content) */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <Label htmlFor="detail_description" className="flex items-center gap-1">
              <FileText className="h-4 w-4 text-orange-500" /> Detail Description <span className="text-red-500">*</span>
            </Label>
            <Textarea id="detail_description" value={formData.description} onChange={handleChange} required rows={8} placeholder="The detailed content of the blog post" />
          </div>

          {/* Technology */}
          <div className="space-y-2">
            <Label htmlFor="technology" className="flex items-center gap-1">
              <BookOpen className="h-4 w-4 text-indigo-500" /> Technology
            </Label>
            <Input id="technology" value={formData.technology} onChange={handleChange} placeholder="e.g., React, Node.js, AI" />
          </div>

          {/* --- FEATURED IMAGE INPUT --- */}
          <div className="space-y-2">
            <Label htmlFor="featuredImageUpload" className="flex items-center gap-1">
              <Image className="h-4 w-4 text-teal-500" /> Featured Image <span className="text-red-500">*</span>
            </Label>
            <Input
              id="featuredImageUpload"
              type="file"
              accept="image/*"
              onChange={handleFeaturedImageFileChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required // Making it required as per your previous setup for `featured_image`
            />
            {featuredImagePreviewUrl && (
              <div className="mt-2 p-2 border rounded-lg bg-gray-50 flex flex-col items-center justify-center">
                <img
                  src={featuredImagePreviewUrl}
                  alt="Featured Image Preview"
                  className="max-w-full h-auto max-h-48 rounded-md object-contain shadow-md"
                />
                <p className="text-sm text-gray-500 mt-2">Local preview.</p>
              </div>
            )}
             <p className="text-sm text-gray-500 mt-1">
            </p>
          </div>

          {/* --- BACKGROUND IMAGE INPUT --- */}
          <div className="space-y-2">
            <Label htmlFor="backgroundImageUpload" className="flex items-center gap-1">
              <Image className="h-4 w-4 text-teal-500" /> Background Image (Local File)
            </Label>
            <Input
              id="backgroundImageUpload"
              type="file"
              accept="image/*"
              onChange={handleBackgroundImageFileChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {backgroundImagePreviewUrl && (
              <div className="mt-2 p-2 border rounded-lg bg-gray-50 flex flex-col items-center justify-center">
                <img
                  src={backgroundImagePreviewUrl}
                  alt="Background Image Preview"
                  className="max-w-full h-auto max-h-48 rounded-md object-contain shadow-md"
                />
                <p className="text-sm text-gray-500 mt-2">Local preview.</p>
              </div>
            )}
             <p className="text-sm text-gray-500 mt-1">
            </p>
          </div>
          {/* You might still want to keep the URL inputs if you allow direct URL input as an alternative */}
          {/* Or, if you strictly want file upload, remove the old URL inputs from here */}
          {/* For now, I've commented out the original URL inputs and replaced with file inputs */}

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-blue-500" /> Date
            </Label>
            <Input id="date" value={formData.date} onChange={handleChange} type="date" required />
          </div>

          {/* Author */}
          <div className="space-y-2">
            <Label htmlFor="select_author" className="flex items-center gap-1">
              <Tag className="h-4 w-4 text-gray-500" /> Author <span className="text-red-500">*</span>
            </Label>
            <Input id="select_author" value={formData.select_author} onChange={handleChange} required placeholder="Author's Name" />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="select_category" className="flex items-center gap-1">
              <Tag className="h-4 w-4 text-gray-500" /> Category <span className="text-red-500">*</span>
            </Label>
            <Input id="select_category" value={formData.select_category} onChange={handleChange} required placeholder="Blog Category" />
          </div>

          {/* Meta Tags (Vidhema Specific) */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <Label htmlFor="meta_titlemetatags" className="flex items-center gap-1">
              <Hash className="h-4 w-4 text-pink-500" /> Meta Tags (comma-separated)
            </Label>
            <Input
              id="meta_titlemetatags"
              value={vidhemaTagsInput}
              onChange={handleVidhemaTagsChange}
              placeholder="e.g., seo, marketing, content, blog"
            />
             <p className="text-sm text-gray-500 mt-1">
            </p>
          </div>

          {/* SEO Section (for Vidhema) */}
          <div className="space-y-4 col-span-1 md:col-span-2 border-t pt-6 mt-6 border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-indigo-600" />
              SEO Information (Vidhema)
            </h3>
            <div>
              <Label htmlFor="meta_title">Meta Title</Label>
              <Input id="meta_title" value={formData.meta_title} onChange={handleChange} placeholder="SEO-friendly title" />
            </div>
            <div>
              <Label htmlFor="meta_description">Meta Description</Label>
              <Textarea id="meta_description" value={formData.meta_description} onChange={handleChange} rows={3} placeholder="Brief summary for search engine results" />
            </div>
            <div>
              <Label htmlFor="meta_keywords">Meta Keywords (comma-separated)</Label>
              <Input id="meta_keywords" value={formData.meta_keywords} onChange={handleChange} placeholder="e.g., technology, web development" />
            </div>
            <div>
              <Label htmlFor="meta_imageurl">Meta Image URL</Label>
              <Input id="meta_imageurl" value={formData.meta_imageurl} onChange={handleChange} type="url" placeholder="Optional URL for SEO image" />
            </div>
            <div>
              <Label htmlFor="meta_imagealt">Meta Image Alt Text</Label>
              <Input id="meta_imagealt" value={formData.meta_imagealt} onChange={handleChange} placeholder="Alternative text for SEO image" />
            </div>
            <div>
              <Label htmlFor="meta_imagetitle">Meta Image Title</Label>
              <Input id="meta_imagetitle" value={formData.meta_imagetitle} onChange={handleChange} placeholder="Title for SEO image" />
            </div>
          </div>
        </div>

        {/* FAQ (Vidhema Specific) */}
        <div className="space-y-2 col-span-1 md:col-span-2">
            <Label htmlFor="faq" className="flex items-center gap-1">
              <ClipboardList className="h-4 w-4 text-indigo-600" /> FAQ (one per line)
            </Label>
            <Textarea
              id="faq"
              value={faqInput}
              onChange={handleFaqChange}
              rows={4}
              placeholder="Enter each FAQ item on a new line. e.g., 'Q: What is solar energy?\nA: Solar energy is...' "
            />
             <p className="text-sm text-gray-500 mt-1">
            </p>
          </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button
            type="submit"
            disabled={loading}
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
            {loading ? 'Adding Blog...' : 'Add Blog to Vidhema'}
          </Button>
        </div>
      </form>
    </div>
  );
}