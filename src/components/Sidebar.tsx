import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  BarChart,
  UserCheck,
  Newspaper,
  Calendar,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UpdateUserModal } from "@/components/UpdateUserModal";

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const tempdata = localStorage.getItem("User");
    return tempdata
      ? JSON.parse(tempdata)
      : { name: "Guest", email: "guest@example.com" };
  });

  const handleUserClick = () => {
    navigate('/profile')
    // setModalOpen(true);
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("User", JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    localStorage.removeItem("User");
    localStorage.removeItem("Token");
    setUser({ name: "Guest", email: "guest@example.com" });
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { id: "clients", label: "Client Management", icon: Users, path: "/clients" },
    { id: "jobs", label: "Job Profiles", icon: Briefcase, path: "/jobs" },
    { id: "projectleads", label: "Project Leads", icon: UserCheck, path: "/projects" },
    { id: "analytics", label: "Analytics", icon: BarChart, path: "/analytics" },
    { id: "blog", label: "Blogs", icon: Newspaper, path: "/blog" },
    { id: "allfollowup", label: "All Follow Ups", icon: Calendar, path: "/allfollowup" },
  ];

  useEffect(()=>{
    const handleStorageUpdate=()=>{
      const updatedUser=localStorage.getItem('User')
      if (updatedUser) {
        setUser(JSON.parse(updatedUser));
      }
    }

    // listen to the custom event
    window.addEventListener('userUpdated',handleStorageUpdate)

    return ()=>{
        window.removeEventListener('userUpdated',handleStorageUpdate)
    }
  },[])

  return (
    <>
      <div className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            JobFlow
          </h1>
          <p className="text-slate-400 text-sm mt-1">Admin Panel</p>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4 flex-grow overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link to={item.path} key={item.id}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start h-12 px-4 transition-all duration-200 ${
                      isActive(item.path)
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:from-blue-700 hover:to-purple-700"
                        : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                    }`}
                  >
                    {Icon && <Icon className="h-5 w-5 mr-3" />}
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 space-y-4">
          {/* User Box */}
          <div
            onClick={handleUserClick}
            className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700 cursor-pointer hover:bg-slate-700"
          >
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
              <div>
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
            <div className="flex items-center space-x-3">
              <div
                onClick={handleLogout}
                className="text-sm font-medium text-white cursor-pointer transition duration-200 hover:text-gray-300 active:text-gray-400"
              >
                Logout
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Outside Sidebar */}
      <UpdateUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        user={user}
        onUpdate={handleUserUpdate}
      />
    </>
  );
};
