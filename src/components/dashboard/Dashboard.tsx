import { Users, Briefcase, Calendar, IndianRupee, UserCheck, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

// Import your components
import { StatsCard } from "./StatsCard";
import { RecentActivities } from "./RecentActivities";
import { UpcomingFollowups } from "./UpcomingFollowups";

// --- START: All your interface and type definitions are here ---
export interface Client {
  mobileNo: string;
  countryCode: string;
  projectManager: string | null;
  serialNo: string;
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  company: string;
  status: string;
  lastFollowup: string;
  nextFollowup: string;
  paymentStatus: string;
  totalAmount?: number;
  paidAmount?: number;
  conversations: number;
  chatMessages: { id: number; message: string; timestamp: string }[];
  followups: {
    id: number;
    description: string;
    datetime: string;
    completed: boolean;
  }[];
  country: string;
  createdAt: string;
  updatedAt: string;
  otherDetails: any[];
  source: string;
  username: string;
  profileImage: string | null;
}

export interface ActionDetails {
  inboxType?: "employee" | "candidate";
  employeeId?: string;
  candidateName?: string | null;
  markAsSend?: boolean;
  followUpDate?: string;
}

export interface InterviewActionDetails {
  proceedToInterview?: boolean;
  interviewDateTime?: string;
  markAsClose?: boolean;
}

export interface PopulatedClientDetails {
  _id: string;
  name: string;
}

export type ChatMessage = {
  id: number;
  message: string;
  timestamp: string;
};

export interface JobProfile {
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
  followups?: Followup[];
  chatMessages?: ChatMessage[];
  conversations?: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ProjectActionDetails {
  proceedToSendProject?: boolean;
  interviewDateTime?: string;
  markAsClose?: boolean;
}

export interface Followup {
  id: number;
  description: string;
  datetime: string;
  completed: boolean;
}

export interface ProjectProfile {
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
  createdAt: string;
  updatedAt: string;
  __v: number;
}
// Interface for the new follow-up data
export interface NewFollowup {
  _id: string;
  status: string;
  clientId: {
    _id: string;
    name: string;
    company?: string;
  };
  contactPersonId: any;
  followUpDate: string;
  message: string;
  googleMeetLink: string;
  createdAt: string;
  updatedAt: string;
}
// --- END: All your interface and type definitions are here ---


export const Dashboard = () => {
  const [clientValue, setClientValue] = useState<Client[]>([]);
  const [nextFollowupsCount, setNextFollowupsCount] = useState<number>(0);
  const [nextFollowupClient, setNextFollowupClient] = useState<Client | null>(null);
  const [jobsValue, setJobsValue] = useState<JobProfile[]>([]);
  const [nextFollowupJobs, setNextFollowupJobs] = useState<JobProfile | null>(null);
  const [nextFollowupJobsCount, setNextFollowupJobsCount] = useState<number>(0);
  const [projectsValue, setProjectsValue] = useState<ProjectProfile[]>([]);
  const [activeProjectsValue, setActiveProjectsValue] = useState<number>(0);
  const [nextFollowupProjectCount, setNextFollowupProjectCount] = useState<number>(0);
  const [nextFollowupProjects, setNextFollowupProjects] = useState<ProjectProfile | null>(null);

  const [totalClients, setTotalClients] = useState<number>(0);
  const [activeJobProfile, setActiveJobProfile] = useState<number>(0);
  const [partialPayementStatus, setPartialPayementStatus] = useState<number>(0);
  const [totalPendingFollowUpBoth, setTotalPendingFollowUpBoth] = useState<number>(0);

  const [newClientCreated, setNewClientCreated] = useState<Client | null>(null);
  const [newJobCreated, setNewJobCreated] = useState<JobProfile | null>(null);
  const [newProjectCreated, setNewProjectCreated] = useState<ProjectProfile | null>(null);
  const [partialPayementClient, setPartialPayementClient] = useState<Client | null>(null);

  const [newupcomingFollowups, setUpcomingFollowups] = useState<
    { client: Client; followup: any }[]
  >([]);
  const [newupcomingFollowupsJobs, setUpcomingFollowupsJobs] = useState<
    { job: JobProfile; followup: any }[]
  >([]);
  const [newupcomingFollowupsProjects, setUpcomingFollowupsProjects] = useState<
    { project: ProjectProfile; followup: any }[]
  >([]);
  const [meetingsData, setMeetingsData] = useState<{ name: string; datetime: string }[]>([]);
  const [latestMeeting, setLatestMeeting] = useState<NewFollowup | null>(null);
  // Reverted back to separate state variables
  const [clientFollowupsData, setClientFollowupsData] = useState<{ name: string; datetime: string }[]>([]);

  const baseURL = import.meta.env.VITE_API_URL;

  const getTopFollowupDate = (project: ProjectProfile): string | null => {
    const now = Date.now();
    const candidates: number[] = [];
    if (Array.isArray(project.followups)) {
      project.followups.forEach((fu) => {
        const time = new Date(fu.datetime).getTime();
        if (time > now) {
          candidates.push(time);
        }
      });
    }
    const actionFollowupTime = project.actionDetails?.followUpDate
      ? new Date(project.actionDetails.followUpDate).getTime()
      : null;
    if (actionFollowupTime && actionFollowupTime > now) {
      candidates.push(actionFollowupTime);
    }
    if (candidates.length === 0) return null;
    const soonest = Math.min(...candidates);
    return new Date(soonest).toISOString();
  };

  const getTopFollowupFromClient = (client: Client): Followup | null => {
    const now = Date.now();
    return (
      (client.followups || [])
        .filter((f) => !f.completed && new Date(f.datetime).getTime() > now)
        .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())[0] || null
    );
  };

  const getTopFollowupDateForJob = (job: JobProfile): string | null => {
    const now = Date.now();
    const candidates: number[] = [];
    if (Array.isArray(job.followups)) {
      job.followups.forEach((fu) => {
        const time = new Date(fu.datetime).getTime();
        if (!fu.completed && time > now) {
          candidates.push(time);
        }
      });
    }
    const actionFollowupTime = job.actionDetails?.followUpDate
      ? new Date(job.actionDetails.followUpDate).getTime()
      : null;
    if (actionFollowupTime && actionFollowupTime > now) {
      candidates.push(actionFollowupTime);
    }
    if (candidates.length === 0) return null;
    const soonest = Math.min(...candidates);
    return new Date(soonest).toISOString();
  };

  const getClientData = async () => {
    try {
      const response = await axios.get(`${baseURL}/clients?filter={"limit":9999}`);
      const clientsData = response.data.data;
      setClientValue(clientsData);
      setTotalClients(clientsData.length);
      const partialPayments = clientsData.filter((client) => client.paymentStatus === "Partial" || client.paymentStatus === "Pending");
      setPartialPayementStatus(partialPayments.length);
      const newPartialPayement = [...partialPayments].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
      setPartialPayementClient(newPartialPayement);
      const newClient = [...clientsData].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      setNewClientCreated(newClient);

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      let futureFollowups = [];
      clientsData.forEach((client) => {
        if (Array.isArray(client.followups)) {
          client.followups.forEach((f) => {
            const followupTime = new Date(f.datetime).getTime();
            if (followupTime >= startOfToday && !f.completed) {
              futureFollowups.push({ client, followup: f });
            }
          });
        }
      });
      futureFollowups.sort((a, b) => new Date(a.followup.datetime).getTime() - new Date(b.followup.datetime).getTime());
      const topFollowups = futureFollowups.slice(0, 6);

      setNextFollowupsCount(futureFollowups.length);
      setNextFollowupClient(futureFollowups[0]?.client || null);
      setUpcomingFollowups(topFollowups);

      // Populate clientFollowupsData from this API call
      setClientFollowupsData(topFollowups.map(item => ({ name: item.client.name, datetime: item.followup.datetime })));

    } catch (error) {
      console.error("Error in getting the value of client data", error);
    }
  };

  const getMeetingData = async () => {
    try {
      const response = await axios.get(`${baseURL}/newfollowups?filter={"limit":9999}`);
      const meetings = response.data.data;

      const now = new Date();
      const upcomingMeetings = meetings
        .filter((meeting: NewFollowup) => new Date(meeting.followUpDate).getTime() > now.getTime())
        .map((meeting: NewFollowup) => ({
          name: meeting.clientId?.name || "Unknown Client",
          datetime: meeting.followUpDate,
        }))
        .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

      setMeetingsData(upcomingMeetings.slice(0, 6));

      const latest = [...meetings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      setLatestMeeting(latest || null);

    } catch (error) {
      console.error("Error fetching meeting data:", error);
    }
  };

  const getProjectData = async () => {
    try {
      const response = await axios.get(`${baseURL}/projects`);
      const projectsData = response.data;
      setProjectsValue(projectsData);
      const activeProjectCount = projectsData.filter((project) => project.status === "Active").length;
      setActiveProjectsValue(activeProjectCount);
      const newProject = [...projectsData].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      setNewProjectCreated(newProject);
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      let futureFollowups = [];
      projectsData.forEach((project) => {
        if (Array.isArray(project.followups)) {
          project.followups.forEach((f) => {
            const followupTime = new Date(f.datetime).getTime();
            if (followupTime >= startOfToday && !f.completed) {
              futureFollowups.push({ project, followup: f });
            }
          });
        }
      });
      setNextFollowupProjectCount(futureFollowups.length);
      futureFollowups.sort((a, b) => new Date(a.followup.datetime).getTime() - new Date(b.followup.datetime).getTime());
      const topFollowups = futureFollowups.slice(0, 6);
      setNextFollowupProjects(topFollowups[0]?.project || null);
      setUpcomingFollowupsProjects(topFollowups.map((f) => ({ project: f.project, followup: f.followup.datetime })));
    } catch (error) {
      console.error("Error in getting the value of project data", error);
    }
  };

  const getJobsData = async () => {
    try {
      const response = await axios.get(`${baseURL}/getAllJobProfiles`);
      const jobsData = response.data.data;
      setJobsValue(jobsData);
      const activeJob = jobsData.filter((job) => job.status === "Active").length;
      setActiveJobProfile(activeJob);
      const newJob = [...jobsData].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      setNewJobCreated(newJob);
      const now = Date.now();
      const futureFollowups = jobsData.map((job) => {
        const followupDate = getTopFollowupDateForJob(job);
        const followupTime = followupDate ? new Date(followupDate).getTime() : null;
        return followupTime && followupTime > now ? { job, followupTime } : null;
      }).filter(Boolean);
      setNextFollowupJobsCount(futureFollowups.length);
      const topFollowups = futureFollowups.sort((a, b) => a.followupTime - b.followupTime).slice(0, 3);
      setNextFollowupJobs(topFollowups[0]?.job || null);
      setUpcomingFollowupsJobs(topFollowups.map((f) => ({ job: f.job, followup: f.followupTime })));
    } catch (error) {
      console.error("Error in getting the value of job data", error);
    }
  };

  const getRecentActivities = () => {
    const activities = [];

    if (newClientCreated) {
      activities.push({
        type: "Client Added",
        description: `${newClientCreated.company || 'New Client'} added to system`,
        time: newClientCreated.createdAt,
        icon: Users,
        color: "bg-blue-500",
      });
    }

    if (newJobCreated) {
      activities.push({
        type: "Job Added",
        description: `${newJobCreated.title || "New Job"} position created`,
        time: newJobCreated.createdAt,
        icon: Briefcase,
        color: "bg-green-500",
      });
    }

    if (newProjectCreated) {
      activities.push({
        type: "Project Added",
        description: `${newProjectCreated.title || "New Project"} created`,
        time: newProjectCreated.createdAt,
        icon: Users,
        color: "bg-green-500",
      });
    }

    if (latestMeeting) {
      activities.push({
        type: "Meeting Scheduled",
        description: `New meeting scheduled with ${latestMeeting.clientId.name}`,
        time: latestMeeting.createdAt,
        icon: Calendar,
        color: "bg-purple-500",
      });
    }

    if (nextFollowupClient) {
      const latestFollowup = getTopFollowupFromClient(nextFollowupClient);
      if (latestFollowup) {
        activities.push({
          type: "Follow-up-client",
          description: `Follow-up scheduled with ${nextFollowupClient.company || 'a client'}`,
          time: latestFollowup.datetime,
          icon: Calendar,
          color: "bg-orange-500",
        });
      }
    }

    if (nextFollowupJobs) {
      const latestFollowup = getTopFollowupDateForJob(nextFollowupJobs);
      if (latestFollowup) {
        activities.push({
          type: "Follow-up-job",
          description: `Follow-up scheduled for ${nextFollowupJobs.title || 'a job'}`,
          time: latestFollowup,
          icon: Calendar,
          color: "bg-orange-500",
        });
      }
    }

    if (nextFollowupProjects) {
      const latestFollowup = getTopFollowupDate(nextFollowupProjects);
      if (latestFollowup) {
        activities.push({
          type: "Follow-up-Project",
          description: `Follow-up scheduled for ${nextFollowupProjects.title || 'a project'}`,
          time: latestFollowup,
          icon: Calendar,
          color: "bg-orange-500",
        });
      }
    }

    if (partialPayementClient) {
      activities.push({
        type: "Payment",
        description: `Payment reminder sent to ${partialPayementClient.company || 'a client'}`,
        time: partialPayementClient.updatedAt,
        icon: IndianRupee,
        color: "bg-red-500",
      });
    }

    return activities;
    // return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  };


  const stats = [
    { title: "Total Clients", value: totalClients, icon: Users, color: "text-blue-600", bgColor: "bg-blue-100" },
    { title: "Active Job Profiles", value: activeJobProfile, icon: Briefcase, color: "text-green-600", bgColor: "bg-green-100" },
    { title: "Pending Follow-ups", value: totalPendingFollowUpBoth, icon: Calendar, color: "text-orange-600", bgColor: "bg-orange-100" },
    { title: "Payment Reminders", value: partialPayementStatus, icon: IndianRupee, color: "text-red-600", bgColor: "bg-red-100" },
  ];

  const jobFollowupsData = newupcomingFollowupsJobs.map(item => ({ name: item.job.title, datetime: item.followup }));
  const projectFollowupsData = newupcomingFollowupsProjects.map(item => ({ name: item.project.title, datetime: item.followup }));

  useEffect(() => {
    getClientData();
    getJobsData();
    getProjectData();
    getMeetingData();
  }, []);

  useEffect(() => {
    // Correctly update total pending follow-ups based on all separate lists
    setTotalPendingFollowUpBoth(clientFollowupsData.length + meetingsData.length + nextFollowupJobsCount + nextFollowupProjectCount);
  }, [clientFollowupsData, meetingsData.length, nextFollowupJobsCount, nextFollowupProjectCount]);

  return (
    <div className="space-y-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your business.</p>
        </div>
        <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm border">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivities activities={getRecentActivities()} />
        <UpcomingFollowups title="Upcoming Follow-ups of Clients" followups={clientFollowupsData} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingFollowups title="Upcoming Follow-ups of Jobs" followups={jobFollowupsData} />
        <UpcomingFollowups title="Upcoming Follow-ups of Projects" followups={projectFollowupsData} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingFollowups title="Upcoming Follow-ups of Meetings" followups={meetingsData} />
      </div>
    </div>
  );
};