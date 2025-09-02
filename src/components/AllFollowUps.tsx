import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";
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
  IndianRupee,
  User,
  Filter,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";

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
  lastfollowUpDate?: string;
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

export const AllFollowUps = () => {
  const [clients, setClients] = useState<{ _id: string; name: string }[]>([]);

  const [filterForm, setFilterForm] = useState({
    contactPersonName: "",
    clientName: "",
    startfollowUpDate: "",
    endfollowUpDate: "",
    searchOf: "Client-Follow-Ups",
  });

  const [ViewContent, setViewContent] = useState<any | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const openViewModal = (item: any) => {
    setViewContent(item);
    setIsViewModalOpen(true); // Corrected state setter
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false); // Corrected state setter
    setViewContent(null);
  };

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // all the state related to jobs
  const [jobsValue, setJobsValue] = useState([]);
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

  // Filter jobs based on filterForm criteria
  const filteredJobs = jobsValue.filter((job) => {
    // const clientNameFilter = filterForm.clientName.trim().toLowerCase();
    const clientNameFilter =
      filterForm.clientName === "All-Client"
        ? ""
        : filterForm.clientName.trim().toLowerCase();
    const contactPersonFilter = filterForm.contactPersonName
      .trim()
      .toLowerCase();

    const clientMatch = clientNameFilter
      ? job.clientId?.name?.toLowerCase().trim().includes(clientNameFilter)
      : true;

    const contactPersonMatch = contactPersonFilter
      ? job.contactPersonName
          ?.toLowerCase()
          .trim()
          .includes(contactPersonFilter)
      : true;

    // --- Date Filtering ---
    const followupDateStr = job?.actionDetails?.followUpDate;
    const followupDate = followupDateStr ? new Date(followupDateStr) : null;

    let startDate = filterForm.startfollowUpDate
      ? new Date(filterForm.startfollowUpDate)
      : null;
    let endDate = filterForm.endfollowUpDate
      ? new Date(filterForm.endfollowUpDate)
      : null;

    // if (startDate) startDate.setHours(0, 0, 0, 0);
    // if (endDate) endDate.setHours(23, 59, 59, 999);

    if (startDate) {
      // Set to start of UTC day
      startDate = new Date(
        Date.UTC(
          startDate.getUTCFullYear(),
          startDate.getUTCMonth(),
          startDate.getUTCDate(),
          0,
          0,
          0,
          0
        )
      );
    }

    if (endDate) {
      // Set to end of UTC day
      endDate = new Date(
        Date.UTC(
          endDate.getUTCFullYear(),
          endDate.getUTCMonth(),
          endDate.getUTCDate(),
          23,
          59,
          59,
          999
        )
      );
    }

    const dateMatch =
      !followupDate ||
      (!startDate && !endDate) ||
      ((!startDate || followupDate.getTime() >= startDate.getTime()) &&
        (!endDate || followupDate.getTime() <= endDate.getTime()));

    const match = clientMatch && contactPersonMatch && dateMatch;

    // Debug log for each job's match status
    console.log(
      `Filtering job "${job.title}" | client: ${job.clientId?.name} | contact: ${job.contactPersonName} | clientMatch: ${clientMatch} | dateMatch ${dateMatch} | contactMatch: ${contactPersonMatch} | finalMatch: ${match}`
    );

    return match;
  });

  const indexOfLastJob = currentPage * itemsPerPage;
  const indexOfFirstJob = indexOfLastJob - itemsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

  const handleChange = (field: string, value: string) => {
    setFilterForm((prev) => ({ ...prev, [field]: value }));
  };
  
  
  const getAllClients = async () => {
    try {
      const response = await axios.get(`${baseURL}/clients`);
      setClients(response.data.data);
      console.log(`All Client Data `, clients);
    } catch (err) {
      console.log("Failed to fetch all clients", err);
    }
  };

  const getTopFollowupDateForJob = (job: any): string | null => {
    const now = Date.now();

    // Step 1: Check future followups in the array
    const futureFollowups = (job.followups || [])
      .filter((f: any) => !f.completed && new Date(f.datetime).getTime() > now)
      .sort(
        (a: any, b: any) =>
          new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
      );

    if (futureFollowups.length > 0) {
      return futureFollowups[0].datetime;
    }

    // Step 2: Fallback to actionDetails followUpDate
    if (
      job.actionDetails?.followUpDate &&
      new Date(job.actionDetails.followUpDate).getTime() > now
    ) {
      return job.actionDetails.followUpDate;
    }

    return null;
  };
  const baseURL = import.meta.env.VITE_API_URL;

  const getJobsData = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/getAllJobProfiles`
      );
      console.log(
        "This is the jobs data getting in dashboard page",
        response.data
      );
      setJobsValue(response.data.data);
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
      const futureFollowups = AllJobsData.filter(
        (job) => job.actionDetails?.followUpDate
      )
        .map((job) => {
          const followupTime = new Date(
            job.actionDetails.followUpDate
          ).getTime();
          return { job, followupTime };
        })
        .filter((item) => item.followupTime > now);

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

  // all state related to Projects
  const [ProjectsValue, setProjectsValue] = useState<ProjectProfile[]>([]);
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

  const filteredProjects = ProjectsValue.filter((project) => {
    //const clientNameFilter = filterForm.clientName.trim().toLowerCase();
    const clientNameFilter =
      filterForm.clientName === "All-Client"
        ? ""
        : filterForm.clientName.trim().toLowerCase();
    const contactPersonFilter = filterForm.contactPersonName
      .trim()
      .toLowerCase();

    const clientMatch = clientNameFilter
      ? project.clientId?.name?.toLowerCase().includes(clientNameFilter)
      : true;

    const contactPersonMatch = contactPersonFilter
      ? project.contactPersonName?.toLowerCase().includes(contactPersonFilter)
      : true;

    // --- Date Filtering ---
    const followupDateStr = project?.actionDetails?.followUpDate;
    const followupDate = followupDateStr ? new Date(followupDateStr) : null;

    let startDate = filterForm.startfollowUpDate
      ? new Date(filterForm.startfollowUpDate)
      : null;
    let endDate = filterForm.endfollowUpDate
      ? new Date(filterForm.endfollowUpDate)
      : null;

    // if (startDate) startDate.setHours(0, 0, 0, 0);
    // if (endDate) endDate.setHours(23, 59, 59, 999);

    if (startDate) {
      // Set to start of UTC day
      startDate = new Date(
        Date.UTC(
          startDate.getUTCFullYear(),
          startDate.getUTCMonth(),
          startDate.getUTCDate(),
          0,
          0,
          0,
          0
        )
      );
    }

    if (endDate) {
      // Set to end of UTC day
      endDate = new Date(
        Date.UTC(
          endDate.getUTCFullYear(),
          endDate.getUTCMonth(),
          endDate.getUTCDate(),
          23,
          59,
          59,
          999
        )
      );
    }

    // const dateMatch =
    //   !followupDate ||
    //   (!startDate && !endDate) ||
    //   ((!startDate || followupDate.getTime() >= startDate.getTime()) &&
    //     (!endDate || followupDate.getTime() <= endDate.getTime()));

    // Check if ANY followup in project.followups falls in the date range
    const hasFollowupInRange = (project.followups || []).some((followup) => {
      const followupDate = new Date(followup.datetime);
      return (
        (!startDate || followupDate >= startDate) &&
        (!endDate || followupDate <= endDate)
      );
    });

    // Final dateMatch: if date filters provided, must have a matching followup date; else true
    const dateMatch = startDate || endDate ? hasFollowupInRange : true;

    const match = clientMatch && contactPersonMatch && dateMatch;

    console.log(
      `Filtering project "${project.title}" | client: ${project.clientId?.name}|dateMatch: ${dateMatch} | contact: ${project.contactPersonName} | clientMatch: ${clientMatch} | contactMatch: ${contactPersonMatch} | finalMatch: ${match}`
    );

    return match;
  });

  const indexOfLastProject = currentPage * itemsPerPage;
  const indexOfFirstProject = indexOfLastProject - itemsPerPage;
  const currentProjects = filteredProjects.slice(
    indexOfFirstProject,
    indexOfLastProject
  );
  const totalProjectPages = Math.ceil(filteredProjects.length / itemsPerPage);

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

      const futureFollowups = AllProjectsData.map((project) => {
        const followupDate = getTopFollowupDate(project);
        const followupTime = followupDate
          ? new Date(followupDate).getTime()
          : null;

        return followupTime && followupTime > now
          ? { project, followupTime }
          : null;
      }).filter(
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

  // all the state related to client
  const [clientValue, setClientValue] = useState<Client[]>([]);
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

  const startDate = filterForm.startfollowUpDate
    ? new Date(filterForm.startfollowUpDate).getTime()
    : null;

  const endDate = filterForm.endfollowUpDate
    ? new Date(filterForm.endfollowUpDate).getTime()
    : null;

  const filteredClients = clientValue.filter((client) => {
    // const clientNameFilter = filterForm.clientName.trim().toLowerCase();
    const clientNameFilter =
      filterForm.clientName === "All-Client"
        ? ""
        : filterForm.clientName.trim().toLowerCase();

    const contactPersonFilter = filterForm.contactPersonName
      .trim()
      .toLowerCase();

    const clientMatch = clientNameFilter
      ? client.name?.toLowerCase().includes(clientNameFilter)
      : true;

    const contactMatch = contactPersonFilter
      ? client.contactPerson?.toLowerCase().includes(contactPersonFilter)
      : true;

    // Date filtering
    // const startDate = filterForm.startfollowUpDate
    //   ? new Date(filterForm.startfollowUpDate).getTime()
    //   : null;

    // const endDate = filterForm.endfollowUpDate
    //   ? new Date(filterForm.endfollowUpDate).getTime()
    //   : null;

    //  const hasFollowupInRange = (client.followups || []).some((followup) => {
    //   const followupTime = new Date(followup.datetime).getTime();
    //   return (
    //     (!startDate || followupTime >= startDate) &&
    //     (!endDate || followupTime <= endDate)
    //   );
    // });

    // newly
    let startDate = filterForm.startfollowUpDate
      ? new Date(filterForm.startfollowUpDate)
      : null;

    let endDate = filterForm.endfollowUpDate
      ? new Date(filterForm.endfollowUpDate)
      : null;

    // if (startDate) startDate.setHours(0, 0, 0, 0); // start of the day
    // if (endDate) endDate.setHours(23, 59, 59, 999); // end of the day

    if (startDate) {
      // Set to start of UTC day
      startDate = new Date(
        Date.UTC(
          startDate.getUTCFullYear(),
          startDate.getUTCMonth(),
          startDate.getUTCDate(),
          0,
          0,
          0,
          0
        )
      );
    }

    if (endDate) {
      // Set to end of UTC day
      endDate = new Date(
        Date.UTC(
          endDate.getUTCFullYear(),
          endDate.getUTCMonth(),
          endDate.getUTCDate(),
          23,
          59,
          59,
          999
        )
      );
    }

    const hasFollowupInRange = (client.followups || []).some((followup) => {
      const followupTime = new Date(followup.datetime);
      return (
        (!startDate || followupTime >= startDate) &&
        (!endDate || followupTime <= endDate)
      );
    });

    const dateMatch = startDate || endDate ? hasFollowupInRange : true;
    const match = clientMatch && contactMatch && dateMatch;

    console.log(
      `Filtering client "${client.name}" | contact: ${client.contactPerson} | clientMatch: ${clientMatch} | contactMatch: ${contactMatch} | dateMatch ${dateMatch} | finalMatch: ${match}`
    );

    return match;
  });

  const indexOfLastClient = currentPage * itemsPerPage;
  const indexOfFirstClient = indexOfLastClient - itemsPerPage;
  const currentClients = filteredClients.slice(
    indexOfFirstClient,
    indexOfLastClient
  );

  const totalClientPages = Math.ceil(filteredClients.length / itemsPerPage);

  const getClientData = async () => {
    try {
      const response = await axios.get(`${baseURL}/clients`);
      console.log(
        "This is the clientData getting in dashoboard page",
        response.data
      );
      setClientValue(response.data.data);
      setTotalClients(response.data.length);
      // ✅ Get the actual list of partial payment clients
      const partialPayments = response.data.data.filter(
        (client: Client) => client.paymentStatus === "Partial"
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
      const AllClientData = [...response.data.data];
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
      response.data.data.forEach((client: Client) => {
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

  console.log("New upcoing followup client", newupcomingFollowups);
  console.log("Next followup next followup client", nextFollowupClient);
  useEffect(() => {
    getAllClients();
  }, []);

  useEffect(() => {
    if (filterForm.searchOf === "Job-Follow-Ups") {
      getJobsData();
    } else if (filterForm.searchOf === "Project-Follow-Ups") {
      getProjectData();
    } else if (filterForm.searchOf === "Client-Follow-Ups") {
      getClientData();
    }
    setCurrentPage(1);
  }, [
    filterForm.searchOf,
    filterForm.clientName,
    filterForm.contactPersonName,
    filterForm.startfollowUpDate,
    filterForm.endfollowUpDate,
  ]);

  const formatFollowupDate = (datetime: string, showFullDate = false) => {
    const date = new Date(datetime);
    const followupDate = new Date(datetime);
    const now = new Date();

    console.log(`foramt followupDate ${followupDate} and now ${now}`);

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

  console.log(`Filter Form Data,`, filterForm);
  console.log("all job data", jobsValue);

  return (
    <div className="space-y-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            All Follow Ups
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here's what's happening with your business and up
            coming followup.
          </p>
        </div>
        <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm border">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* input filter for searching the api */}

      {/* <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Filter Follow-Ups
        </h2> */}
      <div className="relative bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-4 overflow-x-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-600" />
          Filter Follow-Ups
        </h2>

        <div className="relative flex flex-nowrap gap-6 min-w-[900px] ">
          {/* Client Name */}
          <div className=" relative flex flex-col gap-1 min-w-[200px]">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Client Name
            </Label>
            <Select
              value={filterForm.clientName}
              onValueChange={(value) => handleChange("clientName", value)}
            >
              <SelectTrigger className=" relative h-10 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                {filterForm.clientName ? (
                  <span>{filterForm.clientName}</span>
                ) : (
                  <span className="text-gray-400">Select a client</span>
                )}
              </SelectTrigger>
              <SelectValue placeholder="" />
              <SelectContent position="popper" side="bottom" sideOffset={4} avoidCollisions={false}
                className=" z-50 bg-white border border-gray-200 shadow-lg max-h-52  overflow-y-auto w-[--radix-select-trigger-width]"
                style={{ maxHeight: "13rem" }} // ~5 items, adjust if needed
              >
                <SelectItem
                  value="All-Client"
                  className="py-2 px-4 hover:bg-blue-50 rounded"
                >
                  All Clients
                </SelectItem>

                {clients.map((client) => (
                  <SelectItem
                    key={client._id}
                    value={client.name}
                    className="py-2 px-4 hover:bg-blue-50 rounded"
                  >
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contact Person */}
          <div className="flex flex-col gap-1 min-w-[200px]">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              Contact Person
            </Label>
            <Input
              value={filterForm.contactPersonName}
              onChange={(e) =>
                handleChange("contactPersonName", e.target.value)
              }
              className="h-10 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter name"
            />
          </div>

          {/* Start Date */}
          <div className="flex flex-col gap-1 min-w-[200px]">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              Start Follow-Up Date
            </Label>
            <Input
              type="date"
              value={filterForm.startfollowUpDate}
              onChange={(e) =>
                handleChange("startfollowUpDate", e.target.value)
              }
              className="h-10 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-1 min-w-[200px]">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              End Follow-Up Date
            </Label>
            <Input
              type="date"
              value={filterForm.endfollowUpDate}
              onChange={(e) => handleChange("endfollowUpDate", e.target.value)}
              className="h-10 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Search Of */}
          <div className=" flex flex-col gap-1 min-w-[200px]">
            <Label className="text-sm font-medium text-gray-700">
              Select Type Of Follow-Up
            </Label>
            <Select
              value={filterForm.searchOf}
              onValueChange={(value) => handleChange("searchOf", value)}
            >
              <SelectTrigger
                id="searchOf"
                className="h-10 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {filterForm.searchOf ? (
                  <span>{filterForm.searchOf}</span>
                ) : (
                  <span className="text-gray-400">Select follow-up type</span>
                )}
              </SelectTrigger>

              <SelectContent position="popper" side="bottom" sideOffset={4} avoidCollisions={false}
                className="bg-white border border-gray-200 shadow-lg max-h-44 overflow-y-auto w-[--radix-select-trigger-width]"
                style={{ maxHeight: "11rem" }} // limit height if you want scrolling on many options
              >
                <SelectItem
                  value="Client-Follow-Ups"
                  className="py-2 px-4 hover:bg-blue-50 rounded"
                >
                  Client Follow-Ups
                </SelectItem>
                <SelectItem
                  value="Job-Follow-Ups"
                  className="py-2 px-4 hover:bg-blue-50 rounded"
                >
                  Job Follow-Ups
                </SelectItem>
                <SelectItem
                  value="Project-Follow-Ups"
                  className="py-2 px-4 hover:bg-blue-50 rounded"
                >
                  Project Follow-Ups
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* response of the filter followups */}
      <div>
        <p className="text-center font-bold">
          {`Follow Up Output of ${filterForm.searchOf}`}
        </p>

        <div>
          {/* ======= JOBS VIEW ======= */}
          {filterForm.searchOf === "Job-Follow-Ups" && (
            <>
              {filteredJobs.length === 0 ? (
                <p className="text-gray-500 mt-6 text-center text-base italic">
                  No matching jobs found.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {filteredJobs
                      .slice() // make a shallow copy to avoid mutating the original array
                      .reverse() // reverse the order
                      .slice(indexOfFirstJob, indexOfLastJob)
                      .map((job) => (
                        <div
                          key={job._id}
                          className="bg-white shadow-lg p-6 rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300"
                        >
                          <h3 className="text-xl font-semibold text-blue-700 mb-2 truncate mb-4">
                            {job.title || "Untitled Job"}
                          </h3>

                          <div className="space-y-2 text-sm text-gray-700">
                            <p>
                              <span className="font-medium">Status:</span>{" "}
                              {job.status}
                            </p>
                            <p>
                              <span className="font-medium">Client Name:</span>{" "}
                              {job.clientId?.name || "N/A"}
                            </p>
                            <p>
                              <span className="font-medium">
                                Contact Person:
                              </span>{" "}
                              {job.contactPersonName || "N/A"}
                            </p>
                            {/* <p>
                              <span className="font-medium">
                                Last Follow Up Date:
                              </span>{" "}
                              {job?.actionDetails?.lastfollowUpDate
                                ? new Date(
                                    job.actionDetails.lastfollowUpDate
                                  ).toLocaleString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "N/A"}
                            </p> */}
                            <p>
                              <span className="font-medium">
                                Follow-up Date:
                              </span>{" "}
                              {job?.actionDetails?.followUpDate
                                ? new Date(job.actionDetails.followUpDate)
                                    .toISOString()
                                    .split("T")[0]
                                : "N/A"}
                            </p>

                            {getTopFollowupDateForJob(job) && (
                              <p className="text-gray-600">
                                <span className="font-medium">
                                  Recent Follow-Up:
                                </span>{" "}
                                {formatFollowupDate(
                                  getTopFollowupDateForJob(job)!
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Pagination */}
                  <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      className="px-4 py-2 bg-gray-200 text-sm rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <span className="text-sm font-medium">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      className="px-4 py-2 bg-gray-200 text-sm rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* ======= PROJECTS VIEW ======= */}
          {filterForm.searchOf === "Project-Follow-Ups" && (
            <>
              {filteredProjects.length === 0 ? (
                <p className="text-gray-600 mt-4 text-center">
                  No matching projects found.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {filteredProjects
                      .slice() // make a shallow copy to avoid mutating the original array
                      .reverse() // reverse the order
                      .slice(indexOfFirstProject, indexOfLastProject)
                      .map((project) => (
                        <div
                          key={project._id}
                          className="bg-white shadow-xl p-6 rounded-xl border border-gray-200 hover:shadow-2xl transition-all duration-300"
                        >
                          <h3 className="text-xl font-semibold text-purple-700 mb-4 truncate">
                            {project.title || "Untitled Project"}
                          </h3>

                          <div className="space-y-2 text-sm text-gray-700">
                            <p>
                              <span className="font-medium">Status:</span>{" "}
                              {project.status}
                            </p>

                            <p>
                              <span className="font-medium">Client Name:</span>{" "}
                              {project.clientId?.name || "N/A"}
                            </p>

                            <p>
                              <span className="font-medium">
                                Contact Person:
                              </span>{" "}
                              {project.contactPersonName || "N/A"}
                            </p>

                            {/* <p>
                              <span className="font-medium">
                                Last Follow Up Date:
                              </span>{" "}
                              {project?.actionDetails?.lastfollowUpDate
                                ? new Date(
                                    project.actionDetails.lastfollowUpDate
                                  ).toLocaleString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "N/A"}
                            </p> */}

                            <p>
                              <span className="font-medium">
                                Next Follow-up Date:
                              </span>{" "}
                              {project?.actionDetails?.followUpDate
                                ? new Date(
                                    project.actionDetails.followUpDate
                                  ).toLocaleDateString()
                                : "N/A"}
                            </p>

                            {getTopFollowupDate(project) && (
                              <p className="text-gray-600">
                                <span className="font-medium">
                                  Recent Follow-Up:
                                </span>{" "}
                                {formatFollowupDate(
                                  getTopFollowupDate(project)!
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Pagination for Projects */}
                  <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      className="px-4 py-2 bg-gray-200 text-sm rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <span className="text-sm font-medium">
                      Page {currentPage} of {totalProjectPages}
                    </span>

                    <button
                      disabled={currentPage === totalProjectPages}
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, totalProjectPages)
                        )
                      }
                      className="px-4 py-2 bg-gray-200 text-sm rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* ======= CLIENT VIEW ======= */}
          {filterForm.searchOf === "Client-Follow-Ups" && (
            <>
              {filteredClients.length === 0 ? (
                <p className="text-gray-500 text-center mt-6">
                  No matching clients found.
                </p>
              ) : (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {filteredClients
                      .slice() // make a shallow copy to avoid mutating the original array
                      .reverse() // reverse the order
                      .slice(indexOfFirstClient, indexOfLastClient)
                      .map((client) => (
                        <div
                          key={client.id}
                          className="bg-white shadow-xl p-6 rounded-xl border border-gray-200 hover:shadow-2xl transition-all duration-300"
                        >
                          <h3 className="text-xl font-semibold text-blue-700 mb-4 truncate">
                            {client.name}
                          </h3>

                          <div className="space-y-2 text-sm text-gray-700">
                            <p>
                              <span className="font-medium">
                                Contact Person:
                              </span>{" "}
                              {client.contactPerson || "N/A"}
                            </p>
                            <p>
                              <span className="font-medium">Email:</span>{" "}
                              {client.email || "N/A"}
                            </p>
                            <p>
                              <span className="font-medium">Phone:</span>{" "}
                              {client.mobileNo || "N/A"}
                            </p>
                            {/* <p>
                              <span className="font-medium">
                                Last Follow Up Date:
                              </span>{" "}
                              {client.lastFollowup
                                ? new Date(client.lastFollowup).toLocaleString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )
                                : "N/A"}
                            </p> */}
                            <p>
                              <span className="font-medium">
                                Next Follow-up Date:
                              </span>{" "}
                              {client.nextFollowup
                                ? new Date(
                                    client.nextFollowup
                                  ).toLocaleDateString()
                                : "N/A"}
                            </p>

                            {(() => {
                              const followup = getTopFollowupFromClient(client);
                              const followupDateStr = followup?.datetime;
                              return followupDateStr ? (
                                <p className="text-gray-600">
                                  <span className="font-medium">
                                    Recent Follow-Up:
                                  </span>{" "}
                                  {formatFollowupDate(followupDateStr)}
                                </p>
                              ) : null;
                            })()}
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      className="px-4 py-2 bg-gray-200 text-sm rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <span className="text-sm font-medium">
                      Page {currentPage} of {totalClientPages}
                    </span>

                    <button
                      disabled={currentPage === totalClientPages}
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, totalClientPages)
                        )
                      }
                      className="px-4 py-2 bg-gray-200 text-sm rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
