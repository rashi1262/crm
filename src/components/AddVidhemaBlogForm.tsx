import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// Lucide Icons
import {
  Save,
  Globe,
  Calendar,
  Type,
  FileText,
  Info,
  Image,
  Tag,
  Hash,
  ClipboardList,
  BookOpen,
} from "lucide-react";

export default function AddVidhemaBlogForm(): JSX.Element {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [authors, setAuthors] = useState<{ _id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ _id: string; title: string }[]>(
    []
  );

  const vidhemaAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmMGMxMDY1NGM1ZDUwMGY2NDM3YmQzMSIsImVtYWlsIjoic2FsZXNAdmlkaGVtYS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTI2NDQyNjIsImV4cCI6MTc1MjczMDY2Mn0.mpg--uAlcSkTXMWTZShBgq-p58gnlgPDv9bs8zniY8E";

  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    description: "",
    otherDetails: [] as any[],
    authorId: "none",
    backgroundImage: "",
    categoryids: [] as string[],
    date: new Date().toISOString().slice(0, 10),
    featured_image: "",
    metatags: {
      title: "",
      description: "",
      Keyword: "",
      imgUrl: "",
      imgAlt: "",
      imgTitle: "",
    },
    status: true,
    technology: "",
    url: "",
    faq: [] as string[],
  });

  // State for image files and previews
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImagePreviewUrl, setFeaturedImagePreviewUrl] = useState<string | null>(null);
  const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(null);
  const [backgroundImagePreviewUrl, setBackgroundImagePreviewUrl] = useState<string | null>(null);

  // State for raw string inputs
  const [vidhemaTagsInput, setVidhemaTagsInput] = useState("");
  const [faqInput, setFaqInput] = useState("");

  const baseURL = import.meta.env.VITE_API_URL;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;

    // Handle nested metatags fields
    if (id.startsWith("metatags.")) {
      const key = id.split(".")[1];
      setFormData(prev => ({
        ...prev,
        metatags: { ...prev.metatags, [key]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleVidhemaTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setVidhemaTagsInput(value);
    setFormData(prev => ({
      ...prev,
      metatags: { ...prev.metatags, Keyword: value },
    }));
  };

  const handleFaqChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFaqInput(value);
    setFormData(prev => ({
      ...prev,
      faq: value.split("\n").map(item => item.trim()).filter(item => item.length > 0),
    }));
  };

const handleFeaturedImageFileChange = (e) => {
  const file = e.target.files?.[0];
  setFeaturedImageFile(file || null);
};

const handleBackgroundImageFileChange = (e) => {
  const file = e.target.files?.[0];
  setBackgroundImageFile(file || null);
};


const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("url", formData.url);
    formDataToSend.append("shortDescription", formData.shortDescription);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("technology", formData.technology);
    formDataToSend.append("authorId", formData.authorId);
    formDataToSend.append("date", formData.date);
    formDataToSend.append("status", formData.status ? "true" : "false");
    formDataToSend.append("categoryids[]", formData.categoryids[0]);

    // Meta tags
    Object.keys(formData.metatags).forEach(key => {
      formDataToSend.append(`metatags[${key}]`, formData.metatags[key]);
    });

    // FAQ array
    formData.faq.forEach((item, index) => {
      formDataToSend.append(`faq[${index}]`, item);
    });

    // Images (files)
    if (featuredImageFile) {
      formDataToSend.append("featured_image", featuredImageFile);
    }
    if (backgroundImageFile) {
      formDataToSend.append("background_image", backgroundImageFile);
    }

    const response = await fetch(`${baseURL}/blogs`, {
      method: "POST",
      headers: {
        access_token: vidhemaAccessToken,
      },
      body: formDataToSend,
    });

    if (!response.ok) throw new Error("Failed to save blog");

    toast({ title: "Success", description: "Blog added successfully" });
    navigate("/blog");
  } catch (err) {
    toast({ title: "Error", description: err.message, variant: "destructive" });
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    const fetchAuthorsAndCategories = async () => {
      try {
        const [authorsRes, categoriesRes] = await Promise.all([
          fetch(`${baseURL}/authors`, { headers: { access_token: vidhemaAccessToken } }),
          fetch(`${baseURL}/categories`, { headers: { access_token: vidhemaAccessToken } }),
        ]);

        if (!authorsRes.ok || !categoriesRes.ok) throw new Error("Failed to fetch authors/categories");

        const authorsData = await authorsRes.json();
        const categoriesData = await categoriesRes.json();

        setAuthors(authorsData.data || []);
        setCategories(categoriesData.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAuthorsAndCategories();
  }, [baseURL, vidhemaAccessToken]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 mb-6 w-full">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Add New Blog Post to vidhema.com
          </h1>
          <p className="text-gray-600 mt-1">
            Fill in the details for a new blog entry on vidhema.com.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 p-8 bg-white shadow-lg rounded-xl border border-gray-200"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-1">
              <Type className="h-4 w-4 text-blue-500" /> Title{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter blog title"
            />
          </div>

          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="url" className="flex items-center gap-1">
              <Globe className="h-4 w-4 text-green-500" /> URL{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="e.g., my-vidhema-blog-post"
              required
            />
          </div>

          {/* Short Description */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <Label htmlFor="shortDescription" className="flex items-center gap-1">
              <Info className="h-4 w-4 text-purple-500" /> Short Description{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              required
              rows={3}
              placeholder="A brief summary for Vidhema"
            />
          </div>

          {/* Description */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <Label htmlFor="description" className="flex items-center gap-1">
              <FileText className="h-4 w-4 text-orange-500" /> Detail Description{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={8}
              placeholder="The detailed content of the blog post"
            />
          </div>

          {/* Technology */}
          <div className="space-y-2">
            <Label htmlFor="technology" className="flex items-center gap-1">
              <BookOpen className="h-4 w-4 text-indigo-500" /> Technology
            </Label>
            <Input
              id="technology"
              value={formData.technology}
              onChange={handleChange}
              placeholder="e.g., React, Node.js, AI"
            />
          </div>

          {/* Featured Image */}
          <div className="space-y-2">
            <Label htmlFor="featuredImageUpload" className="flex items-center gap-1">
              <Image className="h-4 w-4 text-teal-500" /> Featured Image{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="featuredImageUpload"
              type="file"
              accept="image/*"
              onChange={handleFeaturedImageFileChange}
              required
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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
          </div>

          {/* Background Image */}
          <div className="space-y-2">
            <Label htmlFor="backgroundImageUpload" className="flex items-center gap-1">
              <Image className="h-4 w-4 text-teal-500" /> Background Image
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
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-blue-500" /> Date
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          {/* Author */}
          <div className="space-y-2">
            <Label htmlFor="select_author" className="flex items-center gap-1">
              <Tag className="h-4 w-4 text-gray-500" /> Author{" "}
              <span className="text-red-500">*</span>
            </Label>
            <select
              id="select_author"
              value={formData.authorId}
              onChange={e =>
                setFormData(prev => ({ ...prev, authorId: e.target.value }))
              }
              required
              className="border border-gray-300 rounded-md p-2 w-full"
            >
              <option value="">Select an Author</option>
              {authors.map(author => (
                <option key={author._id} value={author._id}>
                  {author.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="select_category" className="flex items-center gap-1">
              <Tag className="h-4 w-4 text-gray-500" /> Category{" "}
              <span className="text-red-500">*</span>
            </Label>
            <select
              id="select_category"
              value={formData.categoryids[0] || ""}
              onChange={e =>
                setFormData(prev => ({ ...prev, categoryids: [e.target.value] }))
              }
              required
              className="border border-gray-300 rounded-md p-2 w-full"
            >
              <option value="">Select a Category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.title}
                </option>
              ))}
            </select>
          </div>

          {/* Meta Tags */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <Label htmlFor="metatags.Keyword" className="flex items-center gap-1">
              <Hash className="h-4 w-4 text-pink-500" /> Meta Tags (comma-separated)
            </Label>
            <Input
              id="metatags.Keyword"
              value={vidhemaTagsInput}
              onChange={handleVidhemaTagsChange}
              placeholder="e.g., seo, marketing, content, blog"
            />
          </div>

          {/* SEO Section */}
          <div className="space-y-4 col-span-1 md:col-span-2 border-t pt-6 mt-6 border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-indigo-600" />
              SEO Information (Vidhema)
            </h3>
            <div>
              <Label htmlFor="metatags.title">Meta Title</Label>
              <Input
                id="metatags.title"
                value={formData.metatags.title}
                onChange={handleChange}
                placeholder="SEO-friendly title"
              />
            </div>
            <div>
              <Label htmlFor="metatags.description">Meta Description</Label>
              <Textarea
                id="metatags.description"
                value={formData.metatags.description}
                onChange={handleChange}
                rows={3}
                placeholder="Brief summary for search engine results"
              />
            </div>
            <div>
              <Label htmlFor="metatags.imgUrl">Meta Image URL</Label>
              <Input
                id="metatags.imgUrl"
                value={formData.metatags.imgUrl}
                onChange={handleChange}
                type="url"
                placeholder="Optional URL for SEO image"
              />
            </div>
            <div>
              <Label htmlFor="metatags.imgAlt">Meta Image Alt Text</Label>
              <Input
                id="metatags.imgAlt"
                value={formData.metatags.imgAlt}
                onChange={handleChange}
                placeholder="Alternative text for SEO image"
              />
            </div>
            <div>
              <Label htmlFor="metatags.imgTitle">Meta Image Title</Label>
              <Input
                id="metatags.imgTitle"
                value={formData.metatags.imgTitle}
                onChange={handleChange}
                placeholder="Title for SEO image"
              />
            </div>
          </div>

          {/* FAQ */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <Label htmlFor="faq" className="flex items-center gap-1">
              <BookOpen className="h-4 w-4 text-green-600" /> FAQ (One per line)
            </Label>
            <Textarea
              id="faq"
              value={faqInput}
              onChange={handleFaqChange}
              rows={4}
              placeholder="Write FAQs, one per line"
            />
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full md:w-auto">
          <Save className="mr-2 h-4 w-4" /> {loading ? "Saving..." : "Save Blog"}
        </Button>
      </form>
    </div>
  );
}
