// Imports (same as your original)
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Briefcase, Clock, Users } from "lucide-react";
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

// Types (unchanged)
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobProfiles, setJobProfiles] = useState<JobProfile[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const baseURL = import.meta.env.VITE_API_URL;

   useEffect(() => {
    const fetchJobProfiles = async () => {
      try {
        await axios
          .get(`${baseURL}/getAllJobProfiles?page=${currentPage}&limit=${limit}`)
          .then((response) => {
            console.log('This is fetch job with paginataion',response)
            setJobProfiles(response.data.data);
            // Assuming the API response includes total job count or total pages
      const totalCount = response.data.totalCount; // Adjust based on your API response
      setTotalPages(Math.ceil(totalCount / limit));
          })
          .catch((error) => {
            console.log("Error to fetch jobProfilesData", error);
          });
      } catch (error) {
        console.log(error);
      }
    };
    fetchJobProfiles();
  }, [currentPage]);

 
  console.log('this is the jobprofile state value',jobProfiles)
  const addJobProfile = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/getAllJobProfiles?page=${currentPage}&limit=${limit}`
      );
      setJobProfiles(response.data.data || []);
      console.log('This is the all job data after adding  ',response.data)
      navigate("/jobs");
    } catch (error) {
      console.log("Error fetching updated job profiles", error);
    }
  };

  const handleEdit = (profile: JobProfile) => {
    navigate(`/jobs/edit/${profile._id}`);
  };

  const handleUpdateProfiles = (updatedProfiles: JobProfile[]) => {
    setJobProfiles(updatedProfiles);
  };

  // const sortedProfiles = [...jobProfiles].sort(
  //   (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  // );

  let sortedProfiles: JobProfile[] = [];

if (Array.isArray(jobProfiles)) {
  sortedProfiles = [...jobProfiles].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}


  // const filteredProfiles = sortedProfiles.filter((profile) => {
  //   const matchesSearch =
  //     profile.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     profile?.clientId?.name.toLowerCase().includes(searchTerm.toLowerCase());
  //   const matchesStatus =
  //     statusFilter === "all" || profile.status === statusFilter;
  //   return matchesSearch && matchesStatus;
  // });

  // const activeProfiles = jobProfiles.filter(
  //   (profile) => profile.status === "Active"
  // ).length;

  // const scheduledInterviews = jobProfiles.filter(
  //   (profile) => profile.status === "Interview Scheduled"
  // ).length;

  
  // new 
  const filteredProfiles = Array.isArray(sortedProfiles)
  ? sortedProfiles.filter((profile) => {
      const matchesSearch =
        profile.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile?.clientId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || profile.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
  : [];

const activeProfiles = Array.isArray(jobProfiles)
  ? jobProfiles.filter((profile) => profile.status === "Active").length
  : 0;

const scheduledInterviews = Array.isArray(jobProfiles)
  ? jobProfiles.filter((profile) => profile.status === "Interview Scheduled").length
  : 0;

  
  const editData =
    location.pathname.startsWith("/jobs/edit") && params.id
      ? jobProfiles.find((p) => p._id === params.id) || null
      : null;

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

  return (
    <div className="space-y-8 bg-gradient-to-br from-gray-50 to-purple-50 min-h-screen p-6">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Profiles */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
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
            </div>
          </CardContent>
        </Card>

        {/* Active Profiles */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
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
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Interviews */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
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
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-xl font-semibold text-gray-800">
              Job Profile Directory
            </CardTitle>
            <div className="flex gap-4">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search job profiles by title or client..."
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
                  <SelectItem value="Profile Sent">Profile Sent</SelectItem>
                  <SelectItem value="Interview Scheduled">
                    Interview Scheduled
                  </SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <JobProfileList
            profiles={filteredProfiles}
            onUpdate={handleUpdateProfiles}
            onEdit={handleEdit}
          />

          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-4 pt-6">
            <Button
              className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded ${
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              Prev
            </Button>

            <span className="text-sm text-blue-600 font-medium">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded ${
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
