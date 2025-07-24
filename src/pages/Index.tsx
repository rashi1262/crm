import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { ClientManagement } from "@/components/ClientManagement";
import { JobProfiles } from "@/components/JobProfiles";
import { Analytics } from "@/components/Analytics";
import { Outlet } from "react-router-dom";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "clients":
        return <ClientManagement />;
      case "jobs":
        return <JobProfiles />;
      case "analytics":
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} /> */}
      <Sidebar />
      <main className="flex-1 ml-64">
        {/* {renderContent()} */}
        <Outlet />
      </main>
    </div>
  );
};

export default Index;
