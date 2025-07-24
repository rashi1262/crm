// src/pages/DeleteBlogPage.tsx

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';


// Import ShadCN UI Components
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react'; // <--- FIX: Added ArrowLeft
// Import individual delete components for each website
// Only Firmsfinder is implemented for now, others will be added later.
import DeleteFirmsfinderBlog from '@/components/DeleteFirmsfinderBlog'; // Firmsfinder Delete Component
// import DeleteSolarStationBlog from '@/components/DeleteSolarStationBlog'; // To be created
// import DeleteVidhemaBlog from '@/components/DeleteVidhemaBlog';       // To be created
// import DeleteConvexaiBlog from '@/components/DeleteConvexaiBlog';     // To be created

export default function DeleteBlogPage(): JSX.Element {
  const navigate = useNavigate();
  // Get the 'website' and 'id' (blog ID) from the URL parameters
  // The route in App.tsx will need to be: /blog/delete/:website/:id
  const { website, id } = useParams<{ website: string; id: string }>();
  const { toast } = useToast();

  // Callback to execute after a successful deletion from any child component
  const handleDeletionSuccess = () => {
    toast({
      title: "Deletion Complete",
      description: "Blog has been successfully removed.",
      variant: "default",
      duration: 2000,
    });
    navigate('/blog'); // Navigate back to the main blog list after deletion
  };

  // Determine which delete component to render based on the 'website' parameter
  const renderDeleteComponent = () => {
    if (!id) {
      return (
        <div className="text-center py-10 text-red-600">
          <h2 className="text-xl font-semibold">Error: Blog ID Missing</h2>
          <p className="mt-2">Cannot delete. No blog ID provided in the URL.</p>
        </div>
      );
    }

    switch (website) {
      case 'firmsfinder.co':
        return (
          <DeleteFirmsfinderBlog 
            blogId={id} 
            blogTitle="this blog" // You might want to fetch the blog title here if not passed from BlogList
            onDeletionSuccess={handleDeletionSuccess} 
          />
        );
      // Add cases for other websites as their delete components are created
      // case 'solarstation.in':
      //   return <DeleteSolarStationBlog blogId={id} blogTitle="SolarStation Blog" onDeletionSuccess={handleDeletionSuccess} />;
      // case 'vidhema.com':
      //   return <DeleteVidhemaBlog blogId={id} blogTitle="Vidhema Blog" onDeletionSuccess={handleDeletionSuccess} />;
      // case 'convexai.io':
      //   return <DeleteConvexaiBlog blogId={id} blogTitle="ConvexAI Blog" onDeletionSuccess={handleDeletionSuccess} />;
      default:
        return (
          <div className="text-center py-10 text-gray-600">
            <h2 className="text-xl font-semibold">Deletion Not Supported</h2>
            <p className="mt-2">No delete component found for website: <strong>{website || 'N/A'}</strong>.</p>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between gap-4 mb-6 w-full">
        <Button
          variant="ghost"
          onClick={() => navigate('/blog')} // Navigates back to the main blog list
          className="hover:bg-white/60 backdrop-blur-sm border border-gray-200 flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blogs
        </Button>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Confirm Blog Deletion
          </h1>
          <p className="text-gray-600 mt-1">
            Please confirm you want to delete this blog post.
          </p>
        </div>
      </div>

      <div className="flex justify-center items-center py-10">
        {renderDeleteComponent()}
      </div>
    </div>
  );
}