import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import {
  Users,
  Briefcase,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  UserCheck,
  IndianRupee
} from "lucide-react";
import { useEffect, useState } from "react";

export const Dashboard = () => {
  const stats = [
    {
      title: "Total Clients",
      value: "147",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Job Profiles",
      value: "23",
      icon: Briefcase,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Pending Follow-ups",
      value: "8",
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Payment Reminders",
      value: "5",
      icon: IndianRupee,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  const recentActivities = [
    {
      type: "Client Added",
      description: "TechCorp Solutions added to system",
      time: "2 hours ago",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      type: "Job Added",
      description: "Senior React Developer position created",
      time: "4 hours ago",
      icon: Briefcase,
      color: "bg-green-500",
    },
    {
      type: "Project Added",
      description: "Senior React Developer position created",
      time: "4 hours ago",
      icon: UserCheck,
      color: "bg-green-500",
    },
    {
      type: "Follow-up-client",
      description: "Follow-up scheduled with ABC Technologies",
      time: "6 hours ago",
      icon: Calendar,
      color: "bg-orange-500",
    },
    {
      type: "Follow-up-job",
      description: "Follow-up scheduled with ABC Technologies",
      time: "6 hours ago",
      icon: Calendar,
      color: "bg-orange-500",
    },
    {
      type: "Follow-up-Project",
      description: "Follow-up scheduled of Project with ABC Technologies",
      time: "6 hours ago",
      icon: Calendar,
      color: "bg-orange-500",
    },
    {
      type: "Payment",
      description: "Payment reminder sent to XYZ Ltd",
      time: "8 hours ago",
      icon: IndianRupee,
      color: "bg-red-500",
    },
  ];

  const upcomingFollowups = [
    {
      client: "TechCorp Solutions",
      date: "Today, 2:00 PM",
      type: "Call",
      priority: "high",
    },
    {
      client: "ABC Technologies",
      date: "Tomorrow, 10:00 AM",
      type: "Meeting",
      priority: "medium",
    },
    {
      client: "XYZ Solutions",
      date: "Dec 28, 3:00 PM",
      type: "Email",
      priority: "low",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  interface Client {
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

  interface ActionDetails {
    inboxType?: "employee" | "candidate";
    employeeId?: string;
    candidateName?: string | null;
    markAsSend?: boolean;
    followUpDate?: string;
  }

  interface InterviewActionDetails {
    proceedToInterview?: boolean;
    interviewDateTime?: string;
    markAsClose?: boolean;
  }

  interface PopulatedClientDetails {
    _id: string;
    name: string;
  }

  // chatting
type ChatMessage = {
  id: number;
  message: string;
  timestamp: string;
};

  // Main JobProfile interface
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
    // sentProfiles?: SentProfile[];
     followups?: Followup[];
  chatMessages?: ChatMessage[]; // ✅ Add this
  conversations?: number; // ✅ Add this

    createdAt: string;
    updatedAt: string;
    __v: number;
  }

  interface ProjectActionDetails {
    proceedToSendProject?: boolean;
    interviewDateTime?: string;
    markAsClose?: boolean;
  }

  interface Followup {
    id: number;
    description: string;
    datetime: string;
    completed: boolean;
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
    projectDescription?: string;
    proposalDescription: string;

    actionDetails?: ActionDetails;
    projectActionDetails?: ProjectActionDetails;
    // sentProfiles?: SentProfile[];
    followups?: Followup[]; // ✅ this line must exist

    createdAt: string;
    updatedAt: string;
    __v: number;
  }

  // all the state related to client
  const [clientValue, setClientValue] = useState();
  const [totalClients, setTotalClients] = useState();
  const [partialPayementStatus, setPartialPayementStatus] = useState();
  const [newClientCreated, setNewClientCreated] = useState<Client | null>(null);
  const [partialPayementClient, setPartialPayementClient] =
    useState<Client | null>(null);
  const [nextFollowupsCount, setNextFollowupsCount] = useState<number>(0);
  const [nextFollowupClient, setNextFollowupClient] = useState<Client | null>(
    null
  );
  const [newupcomingFollowups, setUpcomingFollowups] = useState<
    { client: Client; followup: any }[]
  >([]);

  // all the state related to jobs
  const [jobsValue, setJobsValue] = useState();
  const [activeJobProfile, setActiveJobProfile] = useState();

  const [newJobCreated, setNewJobCreated] = useState<JobProfile | null>(null);

  // upcoming followup for the jobs
  const [nextFollowupJobs, setNextFollowupJobs] = useState<JobProfile | null>(
    null
  );
  const [newupcomingFollowupsJobs, setUpcomingFollowupsJobs] = useState<
    { job: JobProfile; followup: any }[]
  >([]);
  const [nextFollowupJobsCount, setNextFollowupJobsCount] = useState<number>(0); // ✅ Add this

  // all state related to Projects
  const [ProjectsValue, setProjectsValue] = useState();
  const [activeProjectsValue, setActiveProjectsValue] = useState();
  const [newProjectCreated, setNewProjectCreated] =
    useState<ProjectProfile | null>(null);
  const [nextFollowupProjectCount, setNextFollowupProjectCount] =
    useState<number>(0); // ✅ Add this
  // upcoming followup for the Projects
  const [nextFollowupProjects, setNextFollowupProjects] =
    useState<ProjectProfile | null>(null);
  const [newupcomingFollowupsProjects, setUpcomingFollowupsProjects] = useState<
    { project: ProjectProfile; followup: any }[]
  >([]);

  // total pending followUp
  const [totalPendingFollowUpBoth, setTotalPendingFollowUpBoth] = useState(0);
  console.log("total pending follll", totalPendingFollowUpBoth);

  // getting the env data of the api

  const baseURL = import.meta.env.VITE_API_URL;

  // top job value on the based on followups based

  // const getTopFollowupDateForJob = (job: any): string | null => {
  //   const now = Date.now();

  //   // Step 1: Check future followups in the array
  //   const futureFollowups = (job.followups || [])
  //     .filter((f: any) => !f.completed && new Date(f.datetime).getTime() > now)
  //     .sort(
  //       (a: any, b: any) =>
  //         new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
  //     );

  //   if (futureFollowups.length > 0) {
  //     return futureFollowups[0].datetime;
  //   }

  //   // Step 2: Fallback to actionDetails followUpDate
  //   if (
  //     job.actionDetails?.followUpDate &&
  //     new Date(job.actionDetails.followUpDate).getTime() > now
  //   ) {
  //     return job.actionDetails.followUpDate;
  //   }

  //   return null;
  // };

  // new 
  const getTopFollowupDateForJob = (job: JobProfile): string | null => {
  const now = Date.now();
  const candidates: number[] = [];

  // 1. Collect future followups from followups[]
  if (Array.isArray(job.followups)) {
    job.followups.forEach((fu) => {
      const time = new Date(fu.datetime).getTime();
      if (!fu.completed && time > now) {
        candidates.push(time);
      }
    });
  }

  // 2. Add actionDetails.followUpDate if in future
  const actionFollowupTime = job.actionDetails?.followUpDate
    ? new Date(job.actionDetails.followUpDate).getTime()
    : null;

  if (actionFollowupTime && actionFollowupTime > now) {
    candidates.push(actionFollowupTime);
  }

  // 3. Return earliest one, or null
  if (candidates.length === 0) return null;

  const soonest = Math.min(...candidates);
  return new Date(soonest).toISOString(); // standardized format
};

  const getJobsData = async () => {
    try {
      const response = await axios.get(`${baseURL}/getAllJobProfiles`);
      console.log(
        "This is the jobs data getting in dashboard page",
        response.data
      );
      setJobsValue(response.data);
      const activeJob = response.data.filter(
        (job) => job.status === "Active"
      ).length;
      setActiveJobProfile(activeJob);

      const AllJobsData = [...response.data];

      // new

      const safeGetTime = (dateStr?: string): number => {
        if (!dateStr) return 0;
        const time = new Date(dateStr).getTime();
        return isNaN(time) ? 0 : time;
      };

      const newJob = AllJobsData.sort((a, b) => {
        return safeGetTime(b.createdAt) - safeGetTime(a.createdAt);
      })[0];


      // old
      // const newJob = AllJobsData.sort((a, b) => {
      //   const dateA = new Date(a.createdAt).getTime();
      //   const dateB = new Date(b.createdAt).getTime();

      //   return dateB - dateA; //latest create value
      // })[0];

      setNewJobCreated(newJob);

      // lunch
      const now = Date.now();

      // Filter jobs with upcoming followups
      // And prepare an array of { job, followupDate } objects
      // Find upcoming followups
      // const futureFollowups = AllJobsData.filter(
      //   (job) => job.actionDetails?.followUpDate
      // )
      //   .map((job) => {
      //     const followupTime = new Date(
      //       job.actionDetails.followUpDate
      //     ).getTime();
      //     return { job, followupTime };
      //   })
      //   .filter((item) => item.followupTime > now);

      // new 
      const futureFollowups = AllJobsData.map((job) => {
  const followupDate = getTopFollowupDateForJob(job);
  const followupTime = followupDate ? new Date(followupDate).getTime() : null;

  return followupTime && followupTime > now
    ? { job, followupTime }
    : null;
}).filter(
  (item): item is { job: JobProfile; followupTime: number } =>
    item !== null
);


      console.log("🟢 Future Job Followups:", futureFollowups);

      // Set count
      setNextFollowupJobsCount(futureFollowups.length);

      // Sort by soonest follow-up
      const topFollowups = futureFollowups
        .sort((a, b) => a.followupTime - b.followupTime)
        .slice(0, 3);

      // Set next followup job (earliest)
      setNextFollowupJobs(topFollowups[0]?.job || null);

      // Store top upcoming jobs for list
      setUpcomingFollowupsJobs(
        topFollowups.map((f) => ({ job: f.job, followup: f.followupTime }))
      );
    } catch (error) {
      console.log("Error in getting the value of job data ", error);
    }
  };

  // top client value on the based on followups based
  const getTopFollowupFromClient = (client: Client) => {
    const now = Date.now();
    return (
      (client.followups || [])
        .filter((f) => !f.completed && new Date(f.datetime).getTime() > now)
        .sort(
          (a, b) =>
            new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
        )[0] || null
    );
  };

  const getClientData = async () => {
    try {
      const response = await axios.get(`${baseURL}/clients`);
      console.log(
        "This is the clientData getting in dashoboard page",
        response.data
      );
      setClientValue(response.data);
      setTotalClients(response.data.length);
      // ✅ Get the actual list of partial payment clients
      const partialPayments = response.data.filter(
        (client: Client) => client.paymentStatus === "Partial" || client.paymentStatus === "Pending"
      );

      // ✅ Set count for stats
      setPartialPayementStatus(partialPayments.length);

      // payement partial wala list ko sort kerna
      const AllParitalPayement = [...partialPayments];

      const newPartialPayement = AllParitalPayement.sort((a, b) => {
        const updatedA = new Date(a.updatedAt).getTime();
        const updatedB = new Date(b.updatedAt).getTime();
        if (updatedA == updatedB) {
          const createdA = new Date(a.createdAt).getTime();
          const createdB = new Date(b.createdAt).getTime();
          return createdB - createdA;
        }
        return updatedB - updatedA;
      })[0];

      setPartialPayementClient(newPartialPayement);

      // getting the newly created single client with sorting on the basis of creation
      const AllClientData = [...response.data];
      // const newClient = AllClientData.sort((a, b) => {
      //   const dateA = new Date(a.createdAt).getTime();
      //   const dateB = new Date(b.createdAt).getTime();

      //   return dateB - dateA; //latest create value
      // })[0];


      // new
      const safeGetTime = (dateStr?: string): number => {
        if (!dateStr) return 0;
        const time = new Date(dateStr).getTime();
        return isNaN(time) ? 0 : time;
      };

      const newClient = AllClientData.sort((a, b) => {
        return safeGetTime(b.createdAt) - safeGetTime(a.createdAt);
      })[0];

      setNewClientCreated(newClient);

      // now for the followup data
      const now = new Date().getTime();
      let futureFollowups: { client: Client; followup: any }[] = [];
      response.data.forEach((client: Client) => {
        if (Array.isArray(client.followups)) {
          client.followups.forEach((f) => {
            const followupTime = new Date(f.datetime).getTime();
            console.log("Checking followup:", {
              client: client.name,
              datetime: f.datetime,
              completed: f.completed,
              timestamp: followupTime,
              now,
            });

            if (followupTime > now && !f.completed) {
              futureFollowups.push({ client, followup: f });
            }
          });
        }
      });

      // 1. Set the count of all upcoming followups
      setNextFollowupsCount(futureFollowups.length);

      // 2. Find the client with the earliest follow-up
      futureFollowups.sort(
        (a, b) =>
          new Date(a.followup.datetime).getTime() -
          new Date(b.followup.datetime).getTime()
      );
      // Limit to top 3 (or any number you want)
      const topFollowups = futureFollowups.slice(0, 6);

      // Set count and next followup client as you already do
      setNextFollowupsCount(futureFollowups.length);

      const earliestFollowup = futureFollowups[0];
      setNextFollowupClient(earliestFollowup?.client || null);

      // Also store top followups in state for rendering:
      setUpcomingFollowups(topFollowups);
    } catch (error) {
      console.log("Error in getting the value of client data ", error);
    }
  };

  // new date top finding update of project
const getTopFollowupDate = (project: ProjectProfile): string | null => {
  const now = Date.now();
  const candidates: number[] = [];

  // 1. Collect future followups from followups[]
  if (Array.isArray(project.followups)) {
    project.followups.forEach((fu) => {
      const time = new Date(fu.datetime).getTime();
      if (time > now) {
        candidates.push(time);
      }
    });
  }

  // 2. Add actionDetails.followUpDate if in future
  const actionFollowupTime = project.actionDetails?.followUpDate
    ? new Date(project.actionDetails.followUpDate).getTime()
    : null;

  if (actionFollowupTime && actionFollowupTime > now) {
    candidates.push(actionFollowupTime);
  }

  // 3. Return earliest one, or null
  if (candidates.length === 0) return null;

  const soonest = Math.min(...candidates);
  return new Date(soonest).toISOString(); // standardized format
};

  // get the projects data
  const getProjectData = async () => {
    try {
      const response = await axios.get(`${baseURL}/projects `);
      console.log(
        "This is the jobs data getting in dashboard page",
        response.data
      );
      setProjectsValue(response.data);
      const activeProject = response.data.filter(
        (project) => project.status === "Active"
      ).length;
      setActiveProjectsValue(activeProject);

      const AllProjectsData = [...response.data];
      // const newJob = AllProjectsData.sort((a, b) => {
      //   const dateA = new Date(a.createdAt).getTime();
      //   const dateB = new Date(b.createdAt).getTime();

      //   return dateB - dateA; //latest create value
      // })[0];

      // new
      const safeGetTime = (dateStr?: string): number => {
        if (!dateStr) return 0;
        const time = new Date(dateStr).getTime();
        return isNaN(time) ? 0 : time;
      };

      const newJob = AllProjectsData.sort((a, b) => {
        return safeGetTime(b.createdAt) - safeGetTime(a.createdAt);
      })[0];

      setNewProjectCreated(newJob);

      // lunch
      const now = Date.now();

      // Filter jobs with upcoming followups
      // And prepare an array of { job, followupDate } objects
      // Find upcoming followups
      // const futureFollowups = AllProjectsData.filter(
      //   (project) => project.actionDetails?.followUpDate
      // )
      //   .map((project) => {
      //     const followupTime = new Date(
      //       project.actionDetails.followUpDate
      //     ).getTime();
      //     return { project, followupTime };
      //   })
      //   .filter((item) => item.followupTime > now);

      // new update Project Followups

      // const futureFollowups = AllProjectsData.map((project) => {
      //   const followupDate = getTopFollowupDate(project); // string | null
      //   const followupTime = followupDate
      //     ? new Date(followupDate).getTime()
      //     : null;

      //   return followupTime ? { project, followupTime } : null;
      // }).filter(
      //   (item): item is { project: ProjectProfile; followupTime: number } =>
      //     item !== null
      // );

     

const futureFollowups = AllProjectsData
  .map((project) => {
    const followupDate = getTopFollowupDate(project);
    const followupTime = followupDate ? new Date(followupDate).getTime() : null;

    return followupTime && followupTime > now
      ? { project, followupTime }
      : null;
  })
  .filter(
    (item): item is { project: ProjectProfile; followupTime: number } =>
      item !== null
  );


      console.log("🟢 Future Projects  Followups:", futureFollowups);

      // Set count
      setNextFollowupProjectCount(futureFollowups.length);

      // Sort by soonest follow-up
      const topFollowups = futureFollowups
        .sort((a, b) => a.followupTime - b.followupTime)
        .slice(0, 3);

      // Set next followup Projects (earliest)
      setNextFollowupProjects(topFollowups[0]?.project || null);

      // Store top upcoming Projects for list
      setUpcomingFollowupsProjects(
        topFollowups.map((f) => ({
          project: f.project,
          followup: f.followupTime,
        }))
      );
    } catch (error) {
      console.log("Error in getting the value of job data ", error);
    }
  };

  console.log("This is the clientData getting in dashoboard page", clientValue);
  console.log("This is the TotalClient in dashoboard page", totalClients);

  const formatFollowupDate = (datetime: string, showFullDate = false) => {
    const date = new Date(datetime);
    const followupDate = new Date(datetime);
    const now = new Date();

    console.log(`foramt followupDate ${followupDate} and now ${now}`)

    const isToday =
      followupDate.getDate() === now.getDate() &&
      followupDate.getMonth() === now.getMonth() &&
      followupDate.getFullYear() === now.getFullYear();

    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);

    const isTomorrow =
      followupDate.getDate() === tomorrow.getDate() &&
      followupDate.getMonth() === tomorrow.getMonth() &&
      followupDate.getFullYear() === tomorrow.getFullYear();

    const time = followupDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata", // or your desired timezone
    });

    if (isToday) return `Today, ${time}`;
    if (isTomorrow) return `Tomorrow, ${time}`;

    if (showFullDate) {
      const fullDate = date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      });
      return `${fullDate}, ${time}`;
    }

    return `${followupDate.toLocaleDateString()} ${time}`;
  };

  // for the time and create latest time
  const formatTimeWithTodayTomorrow = (
    datetime: string,
    showFullDate = false
  ) => {
    const date = new Date(datetime);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const isTomorrow =
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear();

    const time = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata", // or your desired timezone
    });

    if (isToday) return `Today, ${time}`;
    if (isTomorrow) return `Tomorrow, ${time}`;
    if (showFullDate) {
      const fullDate = date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      });
      return `${fullDate}, ${time}`;
    }

    const completeDate = date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      });

    return `${completeDate} ${time}`;
  };

  const datetime = "2025-07-18T06:40:00.000Z"; // stored in DB in UTC

const result = formatFollowupDate(datetime, true);
console.log(result); // expected: "18 Jul 2025, 12:10 PM" (if IST)


  useEffect(() => {
    getClientData();
    getJobsData();
    getProjectData();
    setTotalPendingFollowUpBoth(
      nextFollowupJobsCount + nextFollowupsCount + nextFollowupProjectCount
    );
    console.log("Updated clientValue:", clientValue);
    console.log("Updated JobsValue:", jobsValue);
    console.log("Updated ProjectsValue", ProjectsValue);
    console.log("Active Project", activeProjectsValue);
    console.log("Active Job Profile", activeJobProfile);
    console.log("Partial Payement Status", partialPayementStatus);
    console.log("Newly Created Client", newClientCreated);
    console.log("Newly Job Create ", newJobCreated);
    console.log("Newly Projects Created", newProjectCreated);
  }, [nextFollowupJobsCount, nextFollowupsCount, nextFollowupProjectCount]);

  console.log("Updated clientValue:", clientValue);
  console.log("Updated JobsValue:", jobsValue);
  console.log("Active Job Profile", activeJobProfile);
  console.log("Partial Payement Status", partialPayementStatus);
  console.log("Newly Created Client", newClientCreated);
  console.log("Newly Job Create ", newJobCreated);
  console.log("Partial Pay client ", partialPayementClient);
  console.log("Next follow-ups count:", nextFollowupsCount);
  console.log("Next follow-up client:", nextFollowupClient);
  console.log("===================================================");

  console.log("this is follow Up Jobs", nextFollowupJobs);
  console.log("this is follow Up Jobs Count", nextFollowupJobsCount);
  console.log("this is follow Up Projects", nextFollowupProjects);
  console.log("this is follow Up Projects Count", nextFollowupProjectCount);
  return (
    <div className="space-y-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here's what's happening with your business.
          </p>
        </div>
        <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm border">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div
                  className={`h-10 w-10 ${stat.bgColor} rounded-full flex items-center justify-center`}
                >
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {/* <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div> */}
                {stat.title === "Total Clients" ? (
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {totalClients ||0}
                  </div>
                ) : stat.title === "Active Job Profiles" ? (
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {activeJobProfile ||0}
                  </div>
                ) : stat.title === "Pending Follow-ups" ? (
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {totalPendingFollowUpBoth||0 }
                  </div>
                )  : (
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {partialPayementStatus ||0}
                  </div>
                )}
                {/* <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% from last month
                </div> */}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={`h-8 w-8 ${activity.color} rounded-full flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* <p className="text-sm font-semibold text-gray-900">
                        {activity.type}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {activity.description}
                      </p> */}

                      {/* new way from the db getting  */}

                      {activity.type === "Client Added" ? (
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {activity.type}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {`${
                              newClientCreated?.company || 'No Client has '
                            } added to system`}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {newClientCreated?.createdAt
                              ? formatTimeWithTodayTomorrow(
                                  newClientCreated.createdAt
                                )
                              : ""}
                          </p>
                        </div>
                      ) : activity.type === "Job Added" ? (
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {activity.type}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {`${
                              newJobCreated?.title || activity.description
                            } position created`}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {newJobCreated?.createdAt
                              ? formatTimeWithTodayTomorrow(
                                  newJobCreated.createdAt
                                )
                              : ""}
                          </p>
                        </div>
                      ) : activity.type === "Project Added" ? (
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {activity.type}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {`${
                              newProjectCreated?.title || "No New "
                            } Project created`}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {newProjectCreated?.createdAt
                              ? formatTimeWithTodayTomorrow(
                                  newProjectCreated.createdAt
                                )
                              : ""}
                          </p>
                        </div>
                      ) : activity.type === "Payment" ? (
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {activity.type}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {`Payment reminder sent to ${
                              partialPayementClient?.company ||
                             'NO Partial Payement'
                            } `}
                          </p>
                        </div>
                      ) : activity.type === "Follow-up-client" ? (
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {activity.type}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {` Follow-Up scheduled of  ${
                              nextFollowupClient?.company ||
                              "No One "
                            } `}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {nextFollowupClient &&
                            getTopFollowupFromClient(nextFollowupClient)
                              ? formatTimeWithTodayTomorrow(
                                  getTopFollowupFromClient(nextFollowupClient)!
                                    .datetime
                                )
                              : ""}
                          </p>
                        </div>
                      ) : activity.type === "Follow-up-Project" ? (
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {activity.type}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {` Follow-Up scheduled of ${
                              nextFollowupProjects?.title ||
                             "No One"
                            } `}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {nextFollowupProjects &&
                            getTopFollowupDate(nextFollowupProjects)
                              ? formatTimeWithTodayTomorrow(
                                  getTopFollowupDate(nextFollowupProjects)!
                                )
                              : ""}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {activity.type}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {`Follow-Up scheduled Of  ${
                              nextFollowupJobs?.title || "No One"
                            }  ` }
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {nextFollowupJobs &&
                            getTopFollowupDateForJob(nextFollowupJobs)
                              ? formatTimeWithTodayTomorrow(
                                  getTopFollowupDateForJob(nextFollowupJobs)!
                                )
                              : ""}
                          </p>
                        </div>
                      )}
                      {/* <p className="text-xs text-gray-400 mt-1">
                        {activity.time}
                      </p> */}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Upcoming Follow-ups of Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* <div className="space-y-4">
              {upcomingFollowups.map((followup, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {followup.client}
                    </p>
                    <p className="text-sm text-gray-600">{followup.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(
                        followup.priority
                      )}`}
                    >
                      {followup.priority.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium border border-blue-200">
                      {followup.type}
                    </span>
                  </div>
                </div>
              ))}
            </div> */}

            <div className="space-y-4">
              {newupcomingFollowups.length > 0 ? (
                newupcomingFollowups.map(({ client, followup }, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {client.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatFollowupDate(followup.datetime)}
                      </p>
                    </div>

                    {/* taki followup and low and high nhi dikh */}
                    {/* <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(
                        followup.priority || "low"
                      )}`}
                    >
                      {(followup.priority || "low").toUpperCase()}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium border border-blue-200">
                      {followup.type || "Follow-up"}
                    </span>
                  </div> */}
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-600 text-sm py-6">
                  🚫 No upcoming follow-ups In Clients. Please Add Your Upcoming
                  FollowUps
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* upcoming follow up for the jobs */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Upcoming Follow-ups of Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* <div className="space-y-4">
              {upcomingFollowups.map((followup, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {followup.client}
                    </p>
                    <p className="text-sm text-gray-600">{followup.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(
                        followup.priority
                      )}`}
                    >
                      {followup.priority.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium border border-blue-200">
                      {followup.type}
                    </span>
                  </div>
                </div>
              ))}
            </div> */}

            <div className="space-y-4">
              {newupcomingFollowupsJobs.length > 0 ? (
                newupcomingFollowupsJobs.map(({ job, followup }, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {job.title || "Job Title"}
                      </p>
                      {/* <p className="text-sm text-gray-600">
                        {formatFollowupDate(job.actionDetails.followUpDate)}
                      </p> */}
                      <p className="text-sm text-gray-600">
  {formatFollowupDate(new Date(followup).toISOString())}
</p>
                    </div>
                    {/* same followup and high nhi dikh */}
                    {/* <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(
                        followup.priority || "low"
                      )}`}
                    >
                      {(followup.priority || "low").toUpperCase()}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium border border-blue-200">
                      {followup.type || "Follow-up"}
                    </span>
                  </div> */}
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-600 text-sm py-6">
                  🚫 No upcoming follow-ups In Jobs. Please Add Your Upcoming
                  FollowUps
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* upcoming follow up for the Projects */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Upcoming Follow-ups of Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* <div className="space-y-4">
              {upcomingFollowups.map((followup, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {followup.client}
                    </p>
                    <p className="text-sm text-gray-600">{followup.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(
                        followup.priority
                      )}`}
                    >
                      {followup.priority.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium border border-blue-200">
                      {followup.type}
                    </span>
                  </div>
                </div>
              ))}
            </div> */}

            <div className="space-y-4">
              {newupcomingFollowupsProjects.length > 0 ? (
                newupcomingFollowupsProjects.map(
                  ({ project, followup }, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {project.title || "Job Title"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {/* {formatFollowupDate(
                            project.followups.datetime
                          )} */}
                          {formatFollowupDate(getTopFollowupDate(project))}
                        </p>
                      </div>
                      {/* same followup and high nhi dikh */}
                      {/* <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(
                        followup.priority || "low"
                      )}`}
                    >
                      {(followup.priority || "low").toUpperCase()}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium border border-blue-200">
                      {followup.type || "Follow-up"}
                    </span>
                  </div> */}
                    </div>
                  )
                )
              ) : (
                <div className="text-center text-gray-600 text-sm py-6">
                  🚫 No upcoming follow-ups In Projects. Please Add Your Upcoming
                  FollowUps
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
