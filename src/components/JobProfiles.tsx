import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Briefcase, Clock, Users, ChevronDown } from "lucide-react";
import { JobProfileForm } from "./JobProfileForm";
import { JobProfileList } from "./JobProfileList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";

interface PopulatedClientDetails {
  _id: string;
  name: string;
}

interface ActionDetails {
  inboxType?: "employee" | "candidate";
  employeeId?: string;
  candidateName?: string | null;
  markAsSend?: boolean;
  followUpDate?: string;
  lastfollowUpDate?: string;
}

interface InterviewActionDetails {
  proceedToInterview?: boolean;
  interviewDateTime?: string;
  markAsClose?: boolean;
}

interface JobProfile {
  _id: string;
  clientId: PopulatedClientDetails;
  title: string;
  contactPersonName: string;
  skills: string[];
  description: string;
  clientBudget: number;
  openPositions: number;
  status: string;
  jd?: string;
  actionDetails?: ActionDetails;
  interviewActionDetails?: InterviewActionDetails;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export const JobProfiles = () => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const baseURL = import.meta.env.VITE_API_URL;

  const [jobProfiles, setJobProfiles] = useState<JobProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [contactPersons, setContactPersons] = useState<string[]>([]);
  const [selectedContactPerson, setSelectedContactPerson] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  /** Fetch Job Profiles */
  const fetchJobProfiles = useCallback(
    async (page = 1) => {
      try {
        const skip = (page - 1) * itemsPerPage;
        const filter: any = { limit: itemsPerPage, skip, include: 'clientId' };

        if (searchTerm) filter.search = searchTerm;
        if (statusFilter !== "all") filter.where = { status: statusFilter };
        if (selectedContactPerson) filter.where = { contactPersonName: selectedContactPerson };

        const response = await axios.get(`${baseURL}/getAllJobProfiles`, {
          params: { filter: JSON.stringify(filter) },
        });

        const backendProfiles = response.data.data || [];
        const normalizedProfiles = backendProfiles.map((p: any) => ({
          ...p,
          id: p._id,
          clientId: p.clientId || { name: "N/A" },
        }));

        setJobProfiles(normalizedProfiles);
        if (response.data.pagination) {
          setCurrentPage(response.data.pagination.currentPage);
          setTotalPages(response.data.pagination.totalPages);
        }
      } catch (error) {
        console.error("Error fetching job profiles:", error);
      }
    },
    [searchTerm, statusFilter, selectedContactPerson, itemsPerPage, baseURL]
  );

  const fetchContactPersons = async () => {
    try {
      const response = await axios.get(`${baseURL}/getAllJobProfiles`, {
        params: { filter: JSON.stringify({ limit: 10000 }) },
      });
      const allClients = response.data.data || [];
      const uniqueContactPersons = Array.from(
        new Set(allClients.map((c: any) => c.contactPersonName).filter(Boolean))
      ) as string[];
      setContactPersons(uniqueContactPersons);
    } catch (error) {
      console.error("Error fetching contact persons:", error);
    }
  };

  useEffect(() => {
    fetchContactPersons();
  }, []);

  /** Fetch data on filters or page change */
  useEffect(() => {
    fetchJobProfiles(currentPage);
  }, [currentPage, searchTerm, selectedContactPerson, statusFilter, fetchJobProfiles]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleContactPersonChange = (person: string) => {
    setSelectedContactPerson(person);
    setCurrentPage(1);
  };

  /** Add new job (re-fetch after create) */
  const addJobProfile = (newProfile: JobProfile) => {
    setJobProfiles((prev) => [newProfile, ...prev]);
    fetchJobProfiles(currentPage);
  };

  const handleEdit = (profile: JobProfile) => {
    navigate(`/jobs/edit/${profile._id}`);
  };

  const handleUpdateProfiles = (updatedProfiles: JobProfile[]) => {
    setJobProfiles(updatedProfiles);
  };

  /** Derived Stats */
  const activeProfiles = jobProfiles.filter((p) => p.status === "Active").length;
  const scheduledInterviews = jobProfiles.filter(
    (p) => p.status === "Interview Scheduled"
  ).length;

  /** Edit mode detection */
  const editData =
    location.pathname.startsWith("/jobs/edit") && params.id
      ? jobProfiles.find((p) => p._id === params.id) || null
      : null;

  // Create or Edit form rendering
  if (location.pathname === "/jobs/create") {
    return (
      <JobProfileForm
        onSave={addJobProfile}
        onCancel={() => navigate("/jobs")}
        editData={null}
      />
    );
  }

  if (location.pathname.startsWith("/jobs/edit") && params.id) {
    return (
      <JobProfileForm
        onSave={addJobProfile}
        onCancel={() => navigate("/jobs")}
        editData={editData}
      />
    );
  }

  // Main Job Profile Directory
  return (
    <div className="space-y-8 bg-gradient-to-br from-gray-50 to-purple-50 min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Job Profiles
          </h1>
          <p className="text-gray-600 mt-2">
            Manage job openings and track candidate progress
          </p>
        </div>
        <Button
          onClick={() => navigate("/jobs/create")}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Job Profile
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Job Profiles
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {jobProfiles.length}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Job Profiles
              </p>
              <p className="text-3xl font-bold text-green-600">
                {activeProfiles}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Scheduled Interviews
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {scheduledInterviews}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Directory */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-xl font-semibold text-gray-800">
              Job Profile Directory
            </CardTitle>
            <div className="flex gap-3 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by title or client name..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 h-11 w-72 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              {/* Status Filter */}
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-48 h-11 border-gray-200">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Profile Sent">Profile Sent</SelectItem>
                  <SelectItem value="Interview Scheduled">
                    Interview Scheduled
                  </SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                </SelectContent>
              </Select>

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
          <JobProfileList
            profiles={jobProfiles}
            onUpdate={handleUpdateProfiles}
            onEdit={handleEdit}
            refetchProfiles={() => fetchJobProfiles(currentPage)}
          />

          {/* Pagination */}
          <div className="flex justify-center items-center mt-6 gap-4">
            <Button
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage === 1}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              Prev
            </Button>
            <span className="text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage === totalPages}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
