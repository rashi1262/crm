import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Briefcase, Clock, Users } from "lucide-react";

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

interface PopulatedClientDetails {
  _id: string;
  name: string;
}

// interface SentProfile {
//   candidateName: string;
//   sentDate: string;
//   _id?: string;
// }

// chatting
type ChatMessage = {
  id: number;
  message: string;
  timestamp: string;
};

interface Followup {
  id: number;
  description: string;
  datetime: string;
  completed: boolean;
}

interface ActionDetails {
  inboxType?: "employee" | "candidate";
  employeeId?: string;
  // teamName?: string | null;
  // newly teamName
  teamName?: string[]; // ✅ Now an array of strings
  markAsSend?: boolean;
  followUpDate?: string;
}

interface ProjectActionDetails {
  proceedToSendProject?: boolean;
  MeetingDateTime?: string;
  markAsClose?: boolean;
}

// Main ProjectProfile interface
interface ProjectProfile {
  _id: string;
  clientId: PopulatedClientDetails;
  title: string;
  contactPersonName: string;
  skills: string[];
  description: string;
  clientBudget: number;
  status: string;
  jd?: string;
  proposalDescription: string;

  actionDetails?: ActionDetails;
  projectActionDetails?: ProjectActionDetails;
  // sentProfiles?: SentProfile[];
  followups?: Followup[];
  chatMessages?: ChatMessage[]; // ✅ Add this
  conversations?: number; // ✅ Add this
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export const ProjectLeads = () => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectProfiles, setProjectProfiles] = useState<ProjectProfile[]>([]);

  const fetchProjectProfiles = async () => {
    try {
      await axios
        .get("https://api.vidhema.com/projects")
        .then((response) => {
          setProjectProfiles(response.data);
          console.log(
            "This is project fetching data through projectlead page",
            response.data
          );
        })
        .catch((error) => {
          console.log("Error to fetch Project ProfilesData", error);
        });
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchProjectProfiles();
  }, []);

  console.log("Fetching all project ", projectProfiles);
  const addProjectProfile = async () => {
    try {
      const response = await axios.get("https://api.vidhema.com/projects");
      setProjectProfiles(response.data);
      console.log(
        "This is project add ProjectProfile  data through projectlead page",
        response.data
      );
      navigate("/projects");
    } catch (error) {
      console.log("Error fetching updated Project profiles", error);
    }
  };

  const handleEdit = (profile: ProjectProfile) => {
    navigate(`/projects/edit/${profile._id}`);
  };

  const handleUpdateProjects = (updatedProjects: ProjectProfile[]) => {
    setProjectProfiles(updatedProjects);
  };

  const sortedProjects = [...projectProfiles].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const filteredProjects = sortedProjects.filter((profile) => {
    const matchesSearch =
      profile.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile?.clientId?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || profile.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeProfiles = projectProfiles.filter(
    (profile) => profile?.status === "Active"
  ).length;

  console.log("Active profiles filter:", activeProfiles);
  const scheduledMeetings = projectProfiles.filter(
    (profile) => profile.status === "Meeting Scheduled"
  ).length;

  // Find the profile to edit if on /project/edit/:id
  let editData = null;
  if (location.pathname.startsWith("/projects/edit") && params.id) {
    editData = projectProfiles.find((p) => p._id === params.id) || null;
    console.log("editData is: ", editData);
  }

  // Render the form for create or edit
  if (location.pathname === "/projects/create") {
    return (
      <ProjectLeadForm
        onSave={addProjectProfile}
        onCancel={() => navigate("/projects")}
        editData={null}
      />
    );
  }
  if (location.pathname.startsWith("/projects/edit") && params.id) {
    return (
      <ProjectLeadForm
        onSave={addProjectProfile}
        onCancel={() => navigate("/projects")}
        editData={editData}
      />
    );
  }

  console.log("Active profile", activeProfiles);
  console.log("Schedule Meeting", scheduledMeetings);

  return (
    <div className="space-y-8 bg-gradient-to-br from-gray-50 to-purple-50 min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Project Leads
          </h1>
          <p className="text-gray-600 mt-2">
            Lead project execution and monitor milestones.
          </p>
        </div>
        <Button
          onClick={() => {
            navigate("/projects/create");
          }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Projects Leads
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {projectProfiles.length}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Projects
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {activeProfiles}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Scheduled Meeting
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {scheduledMeetings}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-xl font-semibold text-gray-800">
              Projects Leads Directory
            </CardTitle>
            <div className="flex gap-4">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search here projects by title or client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 h-11 border-gray-200">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Lead Sent">Lead Sent</SelectItem>
                  <SelectItem value="Meeting Scheduled">
                    Meeting Scheduled
                  </SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ProjectLeadList
            projects={filteredProjects}
            onUpdate={handleUpdateProjects}
            onEdit={handleEdit}
          />
        </CardContent>
      </Card>
    </div>
  );
};
