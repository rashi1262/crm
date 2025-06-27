
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Briefcase, Clock, Users } from "lucide-react";
import { JobProfileForm } from "./JobProfileForm";
import { JobProfileList } from "./JobProfileList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface JobProfile {
  id: number;
  title: string;
  clientName: string;
  contactPerson: string;
  followupDate: string;
  budget: string;
  skills: string[];
  description: string;
  status: string;
  profilesSent: number;
  interviewScheduled: boolean;
  interviewDate: string;
  jdFile: string;
  candidateName: string;
  sentProfiles: { candidateName: string; sentDate: string }[];
}

export const JobProfiles = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<JobProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobProfiles, setJobProfiles] = useState<JobProfile[]>([
    {
      id: 1,
      title: "Senior React Developer",
      clientName: "TechCorp Solutions",
      contactPerson: "John Smith",
      followupDate: "2024-12-30",
      budget: "$80,000 - $100,000",
      skills: ["React", "TypeScript", "Node.js", "AWS"],
      description: "Looking for a senior React developer with 5+ years experience",
      status: "Active",
      profilesSent: 3,
      interviewScheduled: false,
      interviewDate: "",
      jdFile: "react-dev-jd.pdf",
      candidateName: "",
      sentProfiles: []
    },
    {
      id: 2,
      title: "Python Backend Developer",
      clientName: "ABC Technologies",
      contactPerson: "Sarah Johnson",
      followupDate: "2024-12-28",
      budget: "$70,000 - $90,000",
      skills: ["Python", "Django", "PostgreSQL", "Docker"],
      description: "Backend developer for fintech application",
      status: "Interview Scheduled",
      profilesSent: 5,
      interviewScheduled: true,
      interviewDate: "2024-12-29",
      jdFile: "python-dev-jd.pdf",
      candidateName: "Alice Johnson",
      sentProfiles: [
        { candidateName: "Alice Johnson", sentDate: "2024-12-26T10:00" }
      ]
    }
  ]);

  const addJobProfile = (profileData: any) => {
    if (editingProfile) {
      setJobProfiles(prevProfiles => 
        prevProfiles.map(profile => 
          profile.id === editingProfile.id 
            ? { ...profile, ...profileData }
            : profile
        )
      );
      setEditingProfile(null);
    } else {
      const newProfile: JobProfile = {
        ...profileData,
        id: jobProfiles.length + 1,
        profilesSent: 0,
        interviewScheduled: false,
        interviewDate: "",
        candidateName: profileData.candidateName || "",
        sentProfiles: []
      };
      setJobProfiles([...jobProfiles, newProfile]);
    }
    setShowForm(false);
  };

  const handleEdit = (profile: JobProfile) => {
    setEditingProfile(profile);
    setShowForm(true);
  };

  const handleUpdateProfiles = (updatedProfiles: JobProfile[]) => {
    setJobProfiles(updatedProfiles);
  };

  const filteredProfiles = jobProfiles.filter(profile => {
    const matchesSearch = profile.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || profile.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeProfiles = jobProfiles.filter(profile => profile.status === "Active").length;
  const scheduledInterviews = jobProfiles.filter(profile => profile.interviewScheduled).length;

  if (showForm) {
    return (
      <JobProfileForm 
        onSave={addJobProfile} 
        onCancel={() => {
          setShowForm(false);
          setEditingProfile(null);
        }}
        editData={editingProfile}
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
          <p className="text-gray-600 mt-2">Manage job openings and track candidate progress</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)} 
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Job Profile
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Profiles</p>
                <p className="text-3xl font-bold text-gray-900">{jobProfiles.length}</p>
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
                <p className="text-sm font-medium text-gray-600">Active Profiles</p>
                <p className="text-3xl font-bold text-green-600">{activeProfiles}</p>
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
                <p className="text-sm font-medium text-gray-600">Scheduled Interviews</p>
                <p className="text-3xl font-bold text-blue-600">{scheduledInterviews}</p>
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
            <CardTitle className="text-xl font-semibold text-gray-800">Job Profile Directory</CardTitle>
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
                  <SelectItem value="Interview Scheduled">Interview Scheduled</SelectItem>
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
        </CardContent>
      </Card>
    </div>
  );
};
