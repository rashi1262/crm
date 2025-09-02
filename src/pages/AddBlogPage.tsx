import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom'; // Import Link if you prefer
import { XCircle, ArrowLeft } from 'lucide-react'; // Import ChevronLeft icon

// Import the specific forms for each website
import AddSolarStationBlogForm from '@/components/AddSolarStationBlogForm';
import AddVidhemaBlogForm from '@/components/AddVidhemaBlogForm';
import AddConvexaiBlogForm from '@/components/AddConvexaiBlogForm'; 

export default function AddBlogPage(): JSX.Element {
  const navigate = useNavigate();
  const [selectedWebsite, setSelectedWebsite] = useState<'solarstation.in' | 'vidhema.com'>('solarstation.in');

  return (
    <div className="container mx-auto p-6 space-y-8">

      {/* Back Button and Page Title Section */}
      <div className="flex items-center justify-between mb-8">
        {/* Back Button with desired styling */}
        <Button
          variant="ghost"
          onClick={() => navigate('/blog')} // Navigate back to the /blog route
          className="hover:bg-white/60 backdrop-blur-sm border border-gray-200" // Exact CSS from your example
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> {/* ArrowLeft icon with margin */}
          Back to Blogs {/* Button text */}
        </Button>

        {/* The "Publish to" selector remains on the right as it was */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
            <Label htmlFor="website-selector" className="text-lg font-medium text-gray-700">
              Publish to:
            </Label>
            <Select
              value={selectedWebsite}
              onValueChange={(value: 'solarstation.in' | 'vidhema.com') => setSelectedWebsite(value)}
            >
              <SelectTrigger id="website-selector" className="w-[250px] sm:w-[200px] h-10 px-4 py-2 border rounded-md text-base focus:ring-blue-500 focus:border-blue-500">
                <SelectValue placeholder="Select Website" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <SelectItem value="solarstation.in">solarstation.in</SelectItem>
                <SelectItem value="vidhema.com">vidhema.com</SelectItem>
                <SelectItem value="convexai.io">convexai.io</SelectItem>
              </SelectContent>
            </Select>
        </div>
      </div>

      {/* Conditionally render the appropriate form based on selection */}
      {selectedWebsite === 'solarstation.in' ? (
        <AddSolarStationBlogForm />
      ) : selectedWebsite === 'vidhema.com' ? ( // Add this else if
        <AddVidhemaBlogForm />
      ) : ( // This will be for 'convexai.io'
        <AddConvexaiBlogForm />
      )}  
    </div>
  );
}