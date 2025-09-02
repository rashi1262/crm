import React from "react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Briefcase, Clock, Users } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ProjectLeadForm } from "./ProjectLeadForm";
import { ProjectLeadList } from "./ProjectLeadsList";

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState();
  const itemsPerPage = 6;
  const [user, setUser] = useState(() => {
    const tempdata = localStorage.getItem("User");
    return tempdata
      ? JSON.parse(tempdata)
      : { name: "Guest", email: "guest@example.com" };
  });

  console.log("This is the local storage user data", user);

  console.log("this is user password", user.password);

  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    newPassword: "",
    imagePreview: user?.profileImage?.url || "",
    imageFile: null as File | null,
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };


  const baseURL = import.meta.env.VITE_API_URL;
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      toast({
        title: "User id is missing",
        description: "User has not find throght local stroage",
        variant: "destructive",
      });
      console.error("Missing user ID");
      return;
    }

    // now the input validation
    if (!formData.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return;
    }
    if (formData.newPassword.length < 6) {
      toast({
        title: "The Length Should be more than 6",
        description: "Please Enter the correct password ",
        variant: "destructive",
      });
      return;
    }

    // Prepare form data for image upload if there's a new file
    let uploadedImageUrl = formData.imagePreview;

    if (formData.imageFile) {
      const uploadData = new FormData();
      uploadData.append("image", formData.imageFile);

      try {
        const res = await axios.post(
          `${baseURL}/upload`,
          uploadData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        uploadedImageUrl = res.data.imageUrl;
      } catch (err) {
        console.error("Image upload failed", err);
        alert("Failed to upload image");
        return;
      }
    }

    const payload = {
      name: formData.name,
      password: formData.newPassword,
      profileImage: {
        url: uploadedImageUrl,
      },
    };

    try {
      const token = localStorage.getItem("Token");
      const res = await axios.put(
        `${baseURL}/users/${user.id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("The updation has done successfully", res.data);

      //  updated the value to the localstroage
      const updatedUser = res.data.user; // use backend updated user
      localStorage.setItem("User", JSON.stringify(updatedUser));
      setUser(updatedUser);
      // Manually dispatch a custom event
      window.dispatchEvent(new Event("userUpdated"));
      toast({
        title: "User updated successfully",
        variant: "default", // or simply omit this line
      });
    } catch (error) {
      console.error("Update failed:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      });
    }
    console.log(
      "The update buttton is clicked with this form data and now send to backend",
      formData
    );
  };

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        imagePreview: user.profileImage?.url || "",
        newPassword: "",
      }));
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center p-4">
      <div className="space-y-8 w-full max-w-2xl">
        {/* Profile Image */}
        <div className="flex items-center space-x-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-purple-400 shadow-lg">
            <img
              src={formData.imagePreview || "https://via.placeholder.com/150"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
              title="Upload profile picture"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Your Profile</h2>
            <p className="text-gray-500">Update your account information</p>
          </div>
        </div>

        {/* Profile Form */}
        <form
          onSubmit={handleUpdate}
          className="space-y-6 bg-white p-6 rounded-lg shadow-lg"
        >
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="Enter your name"
            />
          </div>

          {/* Email (Disabled) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-2 border border-gray-200 bg-gray-100 text-gray-600 rounded-md cursor-not-allowed"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={(e) => handleChange("newPassword", e.target.value)}
              placeholder="Enter new password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-purple-600 text-white font-semibold py-2 rounded-md hover:bg-purple-700 transition duration-200"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
