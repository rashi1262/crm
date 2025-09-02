import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BlogPost } from '../types/index';

// Import ShadCN UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Import Lucide React Icons
import {
  ArrowLeft,
  FileText,     // For Description/Brief Description/Notes
  Tags,         // For Tags
  Image,        // For Images
  Calendar,     // For Date
  Link,         // For Slug/Website
  Star,         // For Is Featured
  ClipboardList, // For Meta details or Keywords
  Database // For a general "Information" section
} from "lucide-react";

interface EditBlogFormData extends Omit<BlogPost, 'tags'> {
  tags: string;
}

export default function EditBlog(): JSX.Element {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  const [formData, setFormData] = useState<EditBlogFormData>({
    id: 0,
    title: '',
    date: '',
    slug: '',
    briefDescription: '',
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    isFeatured: 'No',
    description: '',
    tags: '',
    imageUrl: '',
    website: ''
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (slug && typeof window !== 'undefined') {
      const storedBlogs = localStorage.getItem('blogPosts');
      if (storedBlogs) {
        const blogs: BlogPost[] = JSON.parse(storedBlogs);
        const blogToEdit = blogs.find((blog: BlogPost) => blog.slug === slug);
        if (blogToEdit) {
          setFormData({
            ...blogToEdit,
            tags: Array.isArray(blogToEdit.tags) ? blogToEdit.tags.join(', ') : blogToEdit.tags,
          });
          setImagePreview(blogToEdit.imageUrl);
        } else {
          navigate('/blog'); // Adjusted route path for consistency
          window.alert('Blog not found!');
        }
      }
      setLoading(false);
    }
  }, [slug, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.target;

    if (type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      const file = fileInput.files?.[0] || null;

      if (file) {
        const fileUrl = URL.createObjectURL(file);
        setImagePreview(fileUrl);
        setFormData((prev) => ({ ...prev, imageUrl: fileUrl }));
      } else {
        setImagePreview(null);
        setFormData((prev) => ({ ...prev, imageUrl: '' }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (typeof window === 'undefined') return;

    const storedBlogs = localStorage.getItem('blogPosts');
    let existingBlogs: BlogPost[] = storedBlogs ? JSON.parse(storedBlogs) : [];

    const updatedBlogs = existingBlogs.map((blog: BlogPost) => {
      if (blog.id === formData.id) {
        return {
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
          imageUrl: imagePreview || formData.imageUrl // Use imagePreview if it exists, otherwise existing imageUrl
        };
      }
      return blog;
    });

    localStorage.setItem('blogPosts', JSON.stringify(updatedBlogs));
    window.alert('Blog updated successfully!');
    navigate('/blog'); // Adjusted route path for consistency
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <p className="text-lg font-semibold text-gray-700">Loading blog for editing...</p>
      </div>
    );
  }

  // Removed destructuring of addBlogStyles as it's no longer imported

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="hover:bg-white/60 backdrop-blur-sm border border-gray-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blogs
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Edit Blog Post
            </h1>
            <p className="text-gray-600 mt-1">
              Modify the details of your existing blog post
            </p>
          </div>
        </div>

        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-semibold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Blog Post Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Basic Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Database className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Basic Blog Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
                      Title
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter Title"
                      className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-semibold text-gray-700">
                      Date
                    </Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-sm font-semibold text-gray-700">
                    Slug
                  </Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="e.g. your-blog-post-title"
                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="briefDescription" className="text-sm font-semibold text-gray-700">
                    Brief Description
                  </Label>
                  <Textarea
                    id="briefDescription"
                    name="briefDescription"
                    value={formData.briefDescription}
                    onChange={handleChange}
                    placeholder="A short summary of your blog post (max 160 characters)"
                    rows={3}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg resize-y"
                  />
                </div>
              </div>

              {/* Content Section */}
              <div className="space-y-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Blog Content
                  </h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                    Full Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Write the full content of your blog post here..."
                    rows={8}
                    className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg resize-y"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="tags" className="text-sm font-semibold text-gray-700">
                            Tags (Comma Separated)
                        </Label>
                        <Input
                            id="tags"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            placeholder="e.g., react, javascript, frontend"
                            className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="website" className="text-sm font-semibold text-gray-700">
                            Associated Website
                        </Label>
                        <Select
                            value={formData.website}
                            onValueChange={(value) => handleSelectChange("website", value)}
                        >
                            <SelectTrigger className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg">
                                <SelectValue placeholder="Select a Website" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-gray-200 shadow-lg">
                                <SelectItem value="solarstation.in">solarstation.in</SelectItem>
                                <SelectItem value="https://vidhema.com/">vidhema.com</SelectItem>
                                <SelectItem value="https://vidhematechnology.com/">vidhematechnology.com</SelectItem>
                                <SelectItem value="https://erp.vidhema.com/">erp.vidhema.com</SelectItem>
                                {/* Add more options as needed */}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                 <div className="space-y-2">
                    <Label htmlFor="isFeatured" className="text-sm font-semibold text-gray-700">
                      Is Featured?
                    </Label>
                    <Select
                        value={formData.isFeatured}
                        onValueChange={(value) => handleSelectChange("isFeatured", value)}
                    >
                        <SelectTrigger className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg">
                            <SelectValue placeholder="Select Yes/No" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg">
                            <SelectItem value="No">No</SelectItem>
                            <SelectItem value="Yes">Yes</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>

              </div>

              {/* SEO Details Section */}
              <div className="space-y-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <ClipboardList className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    SEO Information
                  </h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaTitle" className="text-sm font-semibold text-gray-700">
                    Meta Title
                  </Label>
                  <Input
                    id="metaTitle"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleChange}
                    placeholder="SEO friendly title (max 60 characters)"
                    className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription" className="text-sm font-semibold text-gray-700">
                    Meta Description
                  </Label>
                  <Textarea
                    id="metaDescription"
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleChange}
                    placeholder="SEO friendly description (max 160 characters)"
                    rows={3}
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg resize-y"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords" className="text-sm font-semibold text-gray-700">
                    Keywords (Comma Separated)
                  </Label>
                  <Input
                    id="keywords"
                    name="keywords"
                    value={formData.keywords}
                    onChange={handleChange}
                    placeholder="e.g., web development, react, seo, blog"
                    className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
                  />
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="space-y-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Image className="h-5 w-5 text-teal-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Blog Image
                  </h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image" className="text-sm font-semibold text-gray-700">
                    Upload Image
                  </Label>
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="h-12 border-gray-300 focus:border-teal-500 focus:ring-teal-500 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                  />
                  {imagePreview && (
                    <div className="mt-4 p-2 border rounded-lg bg-gray-50 flex items-center justify-center">
                      <img src={imagePreview} alt="Image Preview" className="max-w-xs max-h-48 rounded-md object-cover shadow" />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  💾 Update Blog Post
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1 h-12 border-2 border-gray-300 hover:border-gray-400 rounded-lg font-semibold transition-all duration-200"
                >
                  ❌ Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}