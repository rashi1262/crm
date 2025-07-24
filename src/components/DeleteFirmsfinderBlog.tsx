// src/components/DeleteFirmsfinderBlog.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2 } from 'lucide-react'; // Import Trash2 icon for the button

// Import the specific delete API function for Firmsfinder
import { deleteFirmsfinderBlog } from '@/api/firmsfinderApi';

interface DeleteFirmsfinderBlogProps {
  blogId: string; // The ID of the blog to delete
  blogTitle: string; // The title of the blog for confirmation message
  onDeletionSuccess: () => void; // Callback to refresh the list after successful deletion
}

export default function DeleteFirmsfinderBlog({ blogId, blogTitle, onDeletionSuccess }: DeleteFirmsfinderBlogProps): JSX.Element {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate(); // In case you want to navigate after deletion

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Call the Firmsfinder delete API
      await deleteFirmsfinderBlog(blogId);

      toast({
        title: "Blog Deleted",
        description: `Firmsfinder.co blog "${blogTitle}" deleted successfully.`,
        variant: "default",
        duration: 2000,
      });
      onDeletionSuccess(); // Trigger the callback to refresh the parent list
      // If you want to navigate away after deletion, you could do:
      // navigate('/blog');
    } catch (error: any) {
      console.error("Error deleting Firmsfinder blog:", error);
      toast({
        title: "Deletion Failed",
        description: `Failed to delete Firmsfinder blog: ${error.message}`,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {/* The button that triggers the AlertDialog */}
        <Button variant="destructive" size="icon" disabled={isDeleting}>
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the Firmsfinder.co blog titled "<strong>{blogTitle}</strong>".
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}