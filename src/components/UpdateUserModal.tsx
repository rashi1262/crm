// components/commonComponents/UpdateUserModal.tsx
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface UpdateUserModalProps {
  open: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    email: string;
  };
  onUpdate: (updatedUser: { id: string; name: string; email: string }) => void;
}

export const UpdateUserModal = ({
  open,
  onClose,
  user,
  onUpdate,
}: UpdateUserModalProps) => {
  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (open) {
      setName(user.name);
      setPassword("");
    }
  }, [open, user]);
 
  const baseURL = import.meta.env.VITE_API_URL;
  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error("User ID is missing");
      console.error("Missing user ID");
      return;
    }

    try {
      const token = localStorage.getItem("Token");
      const res = await axios.put(
        `${baseURL}/users/${user.id}`,
        { name, password },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("User updated successfully");

      onUpdate({ id: user.id, name, email: user.email });
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update user");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
          />
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            type="password"
          />
          <Button className="w-full" onClick={handleSubmit}>
            Update
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
