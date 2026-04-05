import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Briefcase, Clock, Users, ChevronDown } from "lucide-react";

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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";

interface PopulatedClientDetails {
  _id: string;
  name: string;
}

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
  teamName?: string[];
  markAsSend?: boolean;
  followUpDate?: string;
  lastfollowUpDate?: string;
}

interface ProjectActionDetails {
  proceedToSendProject?: boolean;
  MeetingDateTime?: string;
  markAsClose?: boolean;
}

interface ProjectProfile {
  _id: string;
  clientId: PopulatedClientDetails;
  title: string;
  contactPersonName: string;
  skills: string[];
  description: string;
  clientBudget: number;
  status: string;
  projectDescription?: string;
  proposalDescription: string;
  actionDetails?: ActionDetails;
  projectActionDetails?: ProjectActionDetails;
  followups?: Followup[];
  chatMessages?: ChatMessage[];
  conversations?: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export const ProjectLeads = () => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const baseURL = import.meta.env.VITE_API_URL;

  const [projectProfiles, setProjectProfiles] = useState<ProjectProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [contactPersons, setContactPersons] = useState<string[]>([]);
  const [selectedContactPerson, setSelectedContactPerson] = useState("");

  // Pagination State (Required for Server-Side Pagination)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // <-- ADDED
  const itemsPerPage = 5; // Use a reasonable default, e.g., 10

  /** Fetch Project Profiles (Server-Side Pagination/Filtering) */
  const fetchProjectProfiles = useCallback(
    async (page = 1) => {
      try {
        // Calculate skip for server-side pagination
        const skip = (page - 1) * itemsPerPage;

        // Build the filter object for the server
        const filter: any = {
          limit: itemsPerPage,
          skip,
          include: 'clientId',
          where: {} // Initialize where clause
        };

        if (searchTerm) filter.search = searchTerm;

        // Combine statusFilter and selectedContactPerson into the 'where' clause
        if (statusFilter !== "all") {
          filter.where.status = statusFilter;
        }

        // Only add contactPersonName filter if one is selected
        if (selectedContactPerson) {
          filter.where.contactPersonName = selectedContactPerson;
        }

        // Handle case where both filters are applied (server-side logic needs to combine them)
        // If your backend only supports one `where` object, the filter should combine them:
        // if (statusFilter !== "all" || selectedContactPerson) { ... }
        // The current implementation correctly merges them into filter.where

        // Send the request to the server with the filter
        const response = await axios.get(`${baseURL}/projects`, {
          params: { filter: JSON.stringify(filter) },
        });

        const backendProfiles = response.data.data || [];
        const normalizedProfiles = backendProfiles.map((p: any) => ({
          ...p,
          _id: p._id || p.id,
          clientId: p.clientId || { name: "N/A" },
        })) as ProjectProfile[];

        // Update Project Profiles state
        setProjectProfiles(normalizedProfiles);

        // Update Pagination state from the server response
        if (response.data.pagination) {
          setCurrentPage(response.data.pagination.currentPage);
          setTotalPages(response.data.pagination.totalPages);
        } else if (response.data.total !== undefined) {
          // Fallback if the server returns a total count but not a full pagination object
          setCurrentPage(page);
          setTotalPages(Math.ceil(response.data.total / itemsPerPage));
        } else {
          // Last resort: assume all results are on the current page
          setCurrentPage(page);
          setTotalPages(page);
        }
      } catch (error) {
        console.error("Error fetching project leads:", error);
      }
    },
    [searchTerm, statusFilter, selectedContactPerson, itemsPerPage, baseURL]
  );

  /** Fetch Contact Persons (All data needed for the dropdown) */
  const fetchContactPersons = async () => {
    try {
      // Fetch all projects just to get the list of unique contact persons
      const response = await axios.get(`${baseURL}/projects`, {
        params: { filter: JSON.stringify({ limit: 10000 }) },
      });
      const allProjects = response.data.data || response.data || [];
      const uniqueContactPersons = Array.from(
        new Set(allProjects.map((p: any) => p.contactPersonName).filter(Boolean))
      ) as string[];
      setContactPersons(uniqueContactPersons);
    } catch (error) {
      console.error("Error fetching contact persons:", error);
    }
  };

  /** Initial Data Load and Filter Change Trigger */
  useEffect(() => {
    // This effect runs on mount and whenever filters/page change
    fetchProjectProfiles(currentPage);
  }, [currentPage, searchTerm, selectedContactPerson, statusFilter, fetchProjectProfiles]);

  useEffect(() => {
    // Fetch contact persons only once on mount
    fetchContactPersons();
  }, [baseURL]);


  /** Handlers for search/filters should reset to page 1 */

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset page on filter change
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset page on filter change
  }

  const handleContactPersonChange = (person: string) => {
    setSelectedContactPerson(person);
    setCurrentPage(1); // Reset page on filter change
  };

  /** Project Profile Management */
  const addProjectProfile = () => {
    // Re-fetch the current page data after a create/edit operation
    fetchProjectProfiles(currentPage);
    navigate("/projects");
  };

  const handleEdit = (profile: ProjectProfile) => {
    navigate(`/projects/edit/${profile._id}`);
  };

  const handleUpdateProjects = (updatedProjects: ProjectProfile[]) => {
    // This is typically used by the list component for minor state updates, 
    // but a full refetch (as in addProjectProfile) is often better for server-side pagination.
    // For simplicity, we'll keep it as is, assuming it handles single-page updates.
    setProjectProfiles(updatedProjects);
  };

  /** Derived Stats (Still based on local, currently loaded page data, unless a separate API call is made for totals) */
  const activeProfiles = projectProfiles.filter(
    (profile) => profile?.status === "Active"
  ).length;

  const scheduledMeetings = projectProfiles.filter(
    (profile) => profile.status === "Meeting Scheduled"
  ).length;

  /** Edit mode detection */
  let editData: ProjectProfile | null = null;
  if (location.pathname.startsWith("/projects/edit") && params.id) {
    editData = projectProfiles.find((p) => p._id === params.id) || null;
  }

  // Create or Edit form rendering
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

  // Main Project Lead Directory
  return (
    <div className="space-y-8 bg-gradient-to-br from-gray-50 to-purple-50 min-h-screen p-6">
      {/* Header */}
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
          onClick={() => navigate("/projects/create")}
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
                  Total Projects Leads (on page)
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
                  Active Projects (on page)
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
                  Scheduled Meeting (on page)
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

      {/* Directory */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-xl font-semibold text-gray-800">
              Projects Leads Directory
            </CardTitle>
            <div className="flex gap-4 flex-wrap">
              {/* Search */}
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search here projects by title or client..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 h-11 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-48 h-11 border-gray-200">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Lead Sent">Lead Sent</SelectItem>
                  <SelectItem value="Meeting Scheduled">Meeting Scheduled</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                </SelectContent>
              </Select>

              {/* Contact Person Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-11 px-4 border-gray-200 hover:border-gray-300 hover:bg-gray-50 flex items-center gap-2 min-w-[140px] justify-between transition-colors duration-200"
                  >
                    <span className="truncate">{selectedContactPerson || "All Contacts"}</span>
                    <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0 transition-transform duration-200 data-[state=open]:rotate-180" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-y-auto p-1 bg-white border border-gray-200 rounded-lg shadow-lg" align="start" sideOffset={4}>
                  <DropdownMenuItem
                    onClick={() => handleContactPersonChange("")}
                    className={`px-3 py-2 rounded-md cursor-pointer transition-colors duration-150 flex items-center gap-2 ${!selectedContactPerson ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50 text-gray-700"
                      }`}
                  >
                    <span>All Contacts</span>
                  </DropdownMenuItem>

                  {contactPersons.length > 0 && <div className="h-px bg-gray-200 my-1"></div>}

                  {contactPersons.length > 0 ? (
                    contactPersons.map((person, idx) => (
                      <DropdownMenuItem
                        key={idx}
                        onClick={() => handleContactPersonChange(person)}
                        className={`px-3 py-2 rounded-md cursor-pointer transition-colors duration-150 flex items-center gap-2 ${selectedContactPerson === person ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50 text-gray-700"
                          }`}
                      >
                        <span className="truncate">{person}</span>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem className="px-3 py-2 text-gray-500 text-sm italic">No contact persons found</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <ProjectLeadList
            // Use projectProfiles directly, as the server handles pagination
            projects={projectProfiles}
            onUpdate={handleUpdateProjects}
            onEdit={handleEdit}
            refetchProjects={() => fetchProjectProfiles(currentPage)}
          />

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 pt-6">
            <Button
              className="text-blue-600 border-blue-500 hover:bg-blue-100"
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </Button>
            <span className="text-sm text-blue-700 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              className="text-blue-600 border-blue-500 hover:bg-blue-100"
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages || totalPages === 0}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};