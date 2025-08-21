import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlogPost } from '../types';
import { CreateConvexaiBlogPayload, ConvexaiRawCategory } from '../types/convexai';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, XCircle, Calendar, Type, FileText, Info, Image, Tag, Hash, ClipboardList, User, Folder, Link2, ArrowLeft, Cpu, Hand, FileSpreadsheet, Upload, Eye, Trash2, CheckSquare, Square } from 'lucide-react';
import { createConvexaiBlog, fetchConvexaiCategories } from '@/api/convexaiApi';
import * as XLSX from 'xlsx';

// API function for creating Gemini blogs
const createGeminiBlogs = async (blogsData: any[]) => {
  const response = await fetch('https://api.convexai.io/blogs/createGeminiBlog', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      blogs: blogsData
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create Gemini blogs');
  }
  
  return response.json();
};

export default function AddConvexaiBlogForm(): JSX.Element {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("automatic");
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
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [xlsxFile, setXlsxFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [extractedBlogs, setExtractedBlogs] = useState<any[]>([]);
  const [selectedBlogs, setSelectedBlogs] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [categories, setCategories] = useState<ConvexaiRawCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [metaKeywordsInput, setMetaKeywordsInput] = useState<string>('');

  // Fetch Categories on Component Mount
  useEffect(() => {
    const getCategories = async () => {
      setLoadingCategories(true);
      setCategoryError(null);
      try {
        const fetchedCategories = await fetchConvexaiCategories();
        setCategories(fetchedCategories);
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
  }, [toast]);

  // Update select all checkbox when individual selections change
  useEffect(() => {
    if (extractedBlogs.length > 0 && selectedBlogs.length === extractedBlogs.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedBlogs, extractedBlogs]);

  // Handlers for Form Inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBlogData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setSelectedImageFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setBlogData(prev => ({ ...prev, image: base64String }));
        setImagePreviewUrl(base64String);
      };
      reader.readAsDataURL(file);
    } else {
      setBlogData(prev => ({ ...prev, image: '' }));
      setImagePreviewUrl(null);
    }
  };

  const handleXlsxFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setXlsxFile(file);
    setExtractedBlogs([]);
    setSelectedBlogs([]);
    setSelectAll(false);
    setExcelHeaders([]);
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

  // Handle individual blog selection
  const handleBlogSelection = (index: number) => {
    if (selectedBlogs.includes(index)) {
      setSelectedBlogs(selectedBlogs.filter(i => i !== index));
    } else {
      setSelectedBlogs([...selectedBlogs, index]);
    }
  };

  // Handle select all blogs
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedBlogs([]);
    } else {
      setSelectedBlogs(extractedBlogs.map((_, index) => index));
    }
    setSelectAll(!selectAll);
  };

  // Extract data from XLSX file with flexible column name detection
  const extractDataFromXlsx = async () => {
    if (!xlsxFile) {
      toast({
        title: "No File Selected",
        description: "Please select an XLSX file to upload.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    setIsGenerating(true);

    try {
      const data = await xlsxFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // Get all headers from the first row
      const firstRow = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];
      setExcelHeaders(firstRow || []);

      // Helper function to find column by possible names
      const findColumn = (row: any, possibleNames: string[]) => {
        for (const name of possibleNames) {
          // Try exact match first
          if (row[name] !== undefined) return row[name];
          
          // Try case-insensitive match
          const lowerName = name.toLowerCase();
          for (const key in row) {
            if (key.toLowerCase() === lowerName) return row[key];
          }
        }
        return '';
      };

      // Extract required fields from the Excel data with flexible column names
      const blogs = jsonData.map((row: any) => {
        const title = findColumn(row, ['title', 'Title', 'Blog Title', 'blog_title', 'Title of Blog', 'BlogTitle']);
        const metaDescription = findColumn(row, [
          'metaDescription', 'meta_description', 'Meta Description', 'description', 'Description', 
          'Blog Description', 'blog_description', 'Content', 'content'
        ]);
        const author = findColumn(row, ['author', 'Author', 'Author Name', 'author_name', 'Written By', 'written_by']);
        const image = findColumn(row, ['image', 'Image', 'Image URL', 'image_url', 'imageUrl', 'ImageUrl', 'Image Link', 'image_link']);

        return {
          title: title || '',
          metaDescription: metaDescription || '',
          author: author || 'Admin',
          image: image || 'https://source.unsplash.com/800x400/?ai',
          selected: false
        };
      }).filter(blog => blog.title && blog.metaDescription);

      setExtractedBlogs(blogs);
      setSelectedBlogs(blogs.map((_, index) => index)); // Select all by default

      if (blogs.length === 0) {
        toast({
          title: "No Valid Data Found",
          description: "The file was processed but no valid blog entries were found. Check if your column names match expected patterns.",
          variant: "destructive",
          duration: 7000,
        });
      } else {
        toast({
          title: "Data Extracted Successfully",
          description: `Found ${blogs.length} valid blog entries in the file. All entries are selected by default.`,
          variant: "default",
          duration: 3000,
        });
      }
    } catch (error: any) {
      console.error('Error extracting data from XLSX:', error);
      toast({
        title: "Extraction Failed",
        description: `Failed to extract data from XLSX: ${error.message}`,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Submit only selected blogs to API
  const handleSubmitBlogs = async () => {
    if (selectedBlogs.length === 0) {
      toast({
        title: "No Blogs Selected",
        description: "Please select at least one blog to generate.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Get only the selected blogs
      const selectedBlogsData = selectedBlogs.map(index => extractedBlogs[index]);
      
      const response = await createGeminiBlogs(selectedBlogsData);
      console.log('Gemini Blog Creation Response:', response);

      toast({
        title: "Blogs Created Successfully",
        description: `${selectedBlogs.length} blogs have been created successfully.`,
        variant: "default",
        duration: 3000,
      });

      // Reset form
      setXlsxFile(null);
      setExtractedBlogs([]);
      setSelectedBlogs([]);
      setSelectAll(false);
    } catch (error: any) {
      console.error('Error creating Gemini blogs:', error);
      toast({
        title: "Blog Creation Failed",
        description: `Failed to create blogs: ${error.message}`,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Remove a blog from the extracted list
  const removeBlog = (index: number) => {
    const updatedBlogs = [...extractedBlogs];
    updatedBlogs.splice(index, 1);
    setExtractedBlogs(updatedBlogs);
    
    // Remove from selected blogs if it was selected
    if (selectedBlogs.includes(index)) {
      setSelectedBlogs(selectedBlogs.filter(i => i !== index));
    }
    
    // Adjust selected indices for items after the removed one
    const adjustedSelectedBlogs = selectedBlogs
      .filter(i => i !== index)
      .map(i => i > index ? i - 1 : i);
    
    setSelectedBlogs(adjustedSelectedBlogs);
  };

  // Manual form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!blogData.title || !blogData.description || !blogData.author || !blogData.categoryId) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields (Title, Description, Author, Category).",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    const payload: CreateConvexaiBlogPayload = {
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

      navigate('/blog');
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
      <div className="flex items-center justify-between gap-4 mb-6 w-full">
        <Button variant="outline" onClick={() => navigate('/blog')} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Blogs
        </Button>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Add New Blog Post
          </h1>
          <p className="text-gray-600 mt-1">
            Choose between automatic AI generation or manual creation for convexai.io.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full md:w-1/2 mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="automatic" className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            Automatic ConvexAI
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Hand className="h-4 w-4" />
            Manual ConvexAI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="automatic">
          
          
          <div className="space-y-6 p-6 bg-white shadow-lg rounded-xl border border-gray-200">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="xlsx-upload" className="flex items-center gap-1">
                  <FileSpreadsheet className="h-4 w-4 text-green-500" /> Upload XLSX File <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="xlsx-upload"
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleXlsxFileChange}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Upload an Excel file (.xlsx or .xls) with columns for title, description, author, and image
                </p>
                {xlsxFile && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-green-700">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>{xlsxFile.name}</span>
                  </div>
                )}
              </div>

              {excelHeaders.length > 0 && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Info className="h-4 w-4 text-blue-500" /> Detected Columns in Your File
                  </Label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700">
                      {excelHeaders.join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {extractedBlogs.length > 0 && (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Eye className="h-5 w-5" /> Extracted Blog Data ({extractedBlogs.length} entries)
      </h3>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="select-all"
          checked={selectAll}
          onCheckedChange={handleSelectAll}
        />
        <Label htmlFor="select-all" className="text-sm cursor-pointer">
          {selectAll ? 'Deselect All' : 'Select All'}
        </Label>
      </div>
    </div>

    <div className="overflow-x-auto border rounded-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2">
              <Checkbox
                id="select-all-table"
                checked={selectAll}
                onCheckedChange={handleSelectAll}
              />
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Title</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Description</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Author</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Image</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {extractedBlogs.map((blog, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-2">
                <Checkbox
                  id={`blog-${index}`}
                  checked={selectedBlogs.includes(index)}
                  onCheckedChange={() => handleBlogSelection(index)}
                />
              </td>
              <td className="px-4 py-2 text-sm text-gray-700">{blog.title}</td>
              <td className="px-4 py-2 text-sm text-gray-700">{blog.metaDescription}</td>
              <td className="px-4 py-2 text-sm text-gray-700">{blog.author}</td>
              <td className="px-4 py-2">
                {blog.image && (
                  <img
                    src={blog.image}
                    alt="Preview"
                    className="h-12 w-12 object-cover rounded"
                  />
                )}
              </td>
              <td className="px-4 py-2">
                <button
                  onClick={() => removeBlog(index)}
                  className="text-red-500 hover:text-red-700"
                  title="Remove this entry"
                >
                 
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="text-sm text-gray-600">
      <span className="font-medium">{selectedBlogs.length}</span> of <span className="font-medium">{extractedBlogs.length}</span> blogs selected for generation
    </div>
  </div>
)}

            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button 
                onClick={extractDataFromXlsx}
                disabled={isGenerating || !xlsxFile}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Extracting...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="h-4 w-4" />
                    Extract Data
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleSubmitBlogs}
                disabled={isGenerating || selectedBlogs.length === 0}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating {selectedBlogs.length} Blogs...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Create Selected Blogs ({selectedBlogs.length})
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="manual">
          {/* Manual form content remains the same as before */}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}