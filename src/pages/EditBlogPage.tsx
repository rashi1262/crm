import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Import ShadCN UI Components
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Keeping Select if you decide to add a selector later
import { Label } from '@/components/ui/label'; // Keeping Label if you decide to add a selector later

// Import Lucide Icons
import { ArrowLeft } from 'lucide-react';

// Import the specific edit forms for each website
// For now, we only import Firmsfinder's. Others will be added later.
import EditFirmsfinderBlogForm from '@/components/EditFirmsfinderBlogForm'; // <--- Firmsfinder Edit Form

export default function EditBlogPage(): JSX.Element {
  const navigate = useNavigate();
  // We'll get the 'website' and 'id' (or slug) from the URL parameters
  // The route in App.tsx will need to be adjusted to capture these.
  const { website, id } = useParams<{ website: string; id: string }>();

  // For now, we'll hardcode selectedWebsite based on the URL param.
  // If you later want a dropdown to switch between edit forms, you'd add state here.
  const [selectedWebsite, setSelectedWebsite] = useState<string>(website || 'firmsfinder.co'); // Default to firmsfinder.co if URL param is missing


  // --- ADD THESE CONSOLE LOGS ---
  console.log("EditBlogPage - website param:", website);
  console.log("EditBlogPage - id param:", id);
  console.log("EditBlogPage - selectedWebsite state:", selectedWebsite);
  console.log("EditBlogPage - Rendering condition:", selectedWebsite === 'firmsfinder.co' && !!id);
  // --- END CONSOLE LOGS ---

  
  // This is a temporary list for the selector if you enable it later.
  // For now, it's just used to define the types.
  const availableEditWebsites = [
    { value: 'firmsfinder.co', label: 'Firmsfinder.co' },
    // Add other websites here when their edit forms are ready:
    // { value: 'solarstation.in', label: 'SolarStation.in' },
    // { value: 'vidhema.com', label: 'Vidhema.com' },
    // { value: 'convexai.io', label: 'ConvexAI.io' },
  ];


  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header with Back Button and Website Selector (if applicable) */}
      <div className="flex items-center justify-between gap-4 mb-6 w-full">
        <Button
          variant="ghost"
          onClick={() => navigate('/blog')} // Navigates back to the main blog list
          className="hover:bg-white/60 backdrop-blur-sm border border-gray-200 flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blogs
        </Button>

        {/* This selector is commented out for now, as per the plan to integrate later */}
        {/* If you want to switch between edit forms for different websites on this page,
            you'd uncomment this and use `selectedWebsite` state to conditionally render.
        */}
        {/*
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
            <Label htmlFor="edit-website-selector" className="text-lg font-medium text-gray-700">
              Editing for:
            </Label>
            <Select
              value={selectedWebsite}
              onValueChange={(value: string) => setSelectedWebsite(value)}
            >
              <SelectTrigger id="edit-website-selector" className="w-[250px] sm:w-[200px] h-10 px-4 py-2 border rounded-md text-base focus:ring-blue-500 focus:border-blue-500">
                <SelectValue placeholder="Select Website to Edit" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {availableEditWebsites.map((site) => (
                  <SelectItem key={site.value} value={site.value}>
                    {site.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
        */}
      </div>

      {/* Conditionally render the appropriate edit form based on selectedWebsite */}
      {/* For now, we only have Firmsfinder.co implemented */}
      {selectedWebsite === 'firmsfinder.co' && id ? (
        <EditFirmsfinderBlogForm />
      ) : (
        <div className="text-center py-10 text-gray-600">
          <h2 className="text-xl font-semibold">No Edit Form Available</h2>
          <p className="mt-2">Please select a valid website to edit, or ensure the blog ID is provided in the URL.</p>
          <p className="mt-2">Selected Website: {selectedWebsite || 'None'}</p>
          <p>Blog ID/Slug: {id || 'None'}</p>
        </div>
      )}
    </div>
  );
}