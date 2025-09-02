import React from 'react';
import { BlogPost } from '../types/index';

// Import ShadCN UI Components for the Dialog
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Import Lucide React Icons
import {
  Calendar,
  Tag,
  Link,
  Star,
  Info,
  FileText,
  Image,
  ClipboardList,
  Globe
} from "lucide-react";


interface ViewBlogModalProps {
  blog: BlogPost | null; // The blog post to display
  isOpen: boolean;       // Controls if the dialog is open
  onClose: () => void;   // Function to call when the dialog is closed
}

export default function ViewBlogModal({ blog, isOpen, onClose }: ViewBlogModalProps): JSX.Element {
  // --- ADD THESE CONSOLE LOGS ---
  console.log("ViewBlogModal received blog object:", blog);
  if (blog) {
      console.log("Brief Description:", blog.briefDescription);
      console.log("Description (Full Content):", blog.description);
      console.log("Type of briefDescription:", typeof blog.briefDescription, "Value:", blog.briefDescription);
      console.log("Type of description:", typeof blog.description, "Value:", blog.description);
  }
  // --- END CONSOLE LOGS ---

  if (!blog) {
    return null;
  }

  const handleGoBack = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl p-0 overflow-hidden rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
          <DialogTitle className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-7 w-7" />
            {blog.title}
          </DialogTitle>
          <DialogDescription className="text-gray-200">
            Detailed view of this blog post.
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 space-y-6"> {/* Main content area of the modal */}

          {/* Basic Info Section */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">Date:</span> {blog.date}
              </div>
              <div className="flex items-center gap-2">
                <Link className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">Slug:</span> {blog.slug}
              </div>
              <div className="flex items-center gap-2 col-span-1 md:col-span-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">Website:</span> {blog.website || 'N/A'}
              </div>
              <div className="flex items-center gap-2 col-span-1 md:col-span-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="font-semibold">Is Featured:</span>
                  <Badge className={blog.isFeatured === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {blog.isFeatured === 'Yes' ? 'Yes' : 'No'}
                  </Badge>
              </div>
            </div>
          </div>

          {/* Brief Description */}
          <div className="space-y-2 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Info className="h-5 w-5 text-purple-600" />
              Brief Description
            </h3>
            <p className="text-gray-700 pl-7">{blog.briefDescription}</p>
          </div>

          {/* Tags */}
          <div className="space-y-2 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Tag className="h-5 w-5 text-purple-600" />
                  Tags
              </h3>
              <div className="flex flex-wrap gap-2 pl-7">
                  {Array.isArray(blog.tags) && blog.tags.length > 0 ? (
                      blog.tags.map((tag, index) => (
                          <Badge key={index} className="bg-purple-100 text-purple-800 text-sm py-1 px-3">
                              {tag}
                          </Badge>
                      ))
                  ) : (
                      <span className="text-gray-500">No tags available</span>
                  )}
              </div>
          </div>

          {/* Full Description */}
          <div className="space-y-2 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-600" />
              Description
            </h3>
            <div
              dangerouslySetInnerHTML={{ __html: blog.description }}
              className="prose max-w-none p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-800"
            />
          </div>

          {/* SEO Details */}
          <div className="space-y-2 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-green-600" />
              SEO Information
            </h3>
            <div className="grid grid-cols-1 gap-3 pl-7 text-gray-700">
              <div><span className="font-semibold">Meta Title:</span> {blog.metaTitle || 'N/A'}</div>
              <div><span className="font-semibold">Meta Description:</span> {blog.metaDescription || 'N/A'}</div>
              <div><span className="font-semibold">Keywords:</span> {blog.keywords || 'N/A'}</div>
            </div>
          </div>

          {/* Image Section */}
          {blog.featuredImage && (
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Image className="h-5 w-5 text-teal-600" />
                Blog Image
              </h3>
              <div className="mt-4 p-2 border rounded-lg bg-gray-50 flex items-center justify-center">
                <img
                  src={blog.featuredImage}
                  alt={blog.title}
                  className="max-w-full h-auto max-h-64 rounded-md object-cover shadow-md"
                />
              </div>
            </div>
          )}

          {/* Go Back Button (closes modal) */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <Button
              onClick={handleGoBack}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}