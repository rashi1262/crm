import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";

// Import your existing top-level pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Import your components from src/components
import { Login } from "./components/Login";
import { ClientManagement } from "./components/ClientManagement";
import { JobProfileForm } from "./components/JobProfileForm";
import { JobProfiles } from "./components/JobProfiles";
import { Analytics } from "./components/Analytics";
import { Dashboard } from "./components/dashboard/Dashboard";
import { ProjectLeads } from "./components/ProjectLeads";
import { ProjectLeadForm } from "./components/ProjectLeadForm";
import { AllFollowUps } from "./components/AllFollowUps";

import BlogList from './components/BlogList';

// Remove this line, as AddBlog.tsx is now AddSolarStationBlogForm.tsx
// import AddBlog from './components/AddBlog'; // <--- REMOVE THIS LINE

// Import the new container page for adding blogs
import AddBlogPage from './pages/AddBlogPage'; // <--- ADD THIS LINE (assuming pages folder)
// Or if you placed it in components: import AddBlogPage from './components/AddBlogPage';


import EditBlog from './components/EditBlog';

// Import your custom route wrappers
import ProtectedRoute from "./Routes/ProtectedRoute";
import PublicRoute from "./Routes/PublicRoute";
import Profile from "./components/Profile";
import EditVidhemaBlogForm from "./components/EditVidhemaBlogForm";
import { Support } from "./components/Support";
import AddFollowUps from "./components/AddFollowUps";
import { ClientForm } from "./components/ClientForm";

const queryClient = new QueryClient();

const App = () => {
  const handleLogin = () => {
    console.log("Login successful! Redirecting...");
    alert("Redirect to dashboard");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes (e.g., Login) */}
            <Route element={<PublicRoute />}>
              <Route path="/" element={<Login onLogin={handleLogin} />} />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
            </Route>

            {/* Protected routes (requiring authentication) */}
            <Route element={<ProtectedRoute />}>
              {/* The Index component likely provides the common layout (Sidebar, Header) */}
              <Route path="/" element={<Index />}>
                {/* Default protected route, redirects to dashboard */}
                <Route index element={<Navigate to="/dashboard" replace />} />
                {/* new All followup filter */}
                <Route path="allfollowup" element={<AllFollowUps />} />
                <Route path="addfollowup" element={<AddFollowUps />} />

                {/* Existing Protected Routes */}
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="clients" element={<ClientManagement />}>
                  <Route path="create" element={<ClientForm onSave={() => { }} onCancel={() => { }} editData={null} />} />
                  <Route path="edit/:id" element={<ClientForm onSave={() => { }} onCancel={() => { }} editData={null} />} />                </Route>
                <Route path="projects" element={<ProjectLeads />}>
                  <Route path="create" element={<ProjectLeadForm onSave={() => { }} onCancel={() => { }} editData={null} />} />
                  <Route path="edit/:id" element={<ProjectLeadForm onSave={() => { }} onCancel={() => { }} editData={null} />} />
                </Route>
                <Route path="jobs" element={<JobProfiles />}>
                  <Route index element={<JobProfiles />} />
                  <Route path="create" element={<JobProfileForm onSave={() => { }} onCancel={() => { }} editData={null} />} />
                  <Route path="edit/:id" element={<JobProfileForm onSave={() => { }} onCancel={() => { }} editData={null} />} />
                </Route>
                <Route path="analytics" element={<Analytics />} />

                {/* NEW: Blog Routes */}
                <Route path="blog" element={<BlogList />} />
                {/* Update this route to use the new AddBlogPage component */}
                <Route path="blog/add" element={<AddBlogPage />} /> {/* <--- CHANGED THIS LINE */}
                <Route path="blog/edit/:slug" element={<EditBlog />} />

                <Route path="support" element={<Support />} />

                {/* new profile page route */}
                <Route path="profile" element={<Profile />} />
              </Route>

              <Route path="/blog/vidhema/edit/:slug" element={<EditVidhemaBlogForm />} />


            </Route>

            {/* Catch-all route for 404 (must be last) */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;