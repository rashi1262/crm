import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Users,
  Briefcase,
  DollarSign,
  Calendar,
  IndianRupee,
  UserCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

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


interface Followup {
  id: number;
  description: string;
  datetime: string;
  completed: boolean;
}
// chatting
type ChatMessage = {
  id: number;
  message: string;
  timestamp: string;
};

interface ActionDetails {
  inboxType?: "employee" | "candidate";
  employeeId?: string;
  // teamName?: string | null;

  // new
  teamName?: string[]; // ✅ Now an array of strings
  markAsSend?: boolean;
  followUpDate?: string;
  lastfollowUpDate?: string;
}

interface MeetingActionDetails {
  proceedToMeeting?: boolean;
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
  projectDescription?: string;
  proposalDescription: string;
  actionDetails?: ActionDetails;
  MeetingActionDetails?: MeetingActionDetails;
  // sentProfiles?: SentProfile[];
  followups?: Followup[];
  chatMessages?: ChatMessage[]; // ✅ Add this
  conversations?: number; // ✅ Add this

  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ProjectProfileListProps {
  projects: ProjectProfile[];
  onUpdate: (projects: ProjectProfile[]) => void;
  onEdit: (projects: ProjectProfile) => void;
}


interface Client {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  mobileNo: string;
  company: [];
  projectManager: string | null;
  profileImage: string | null;
  serialNo: string;
  status: string;
  country: string;
  countryCode: string;
  createdAt: string;
  updatedAt: string;
  otherDetails: any[];
  source: string;
  username: string;
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
}

export const Analytics = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activeJob, setActiveJob] = useState<JobProfile[] | undefined>(
    undefined
  );
  const [ProfileSentJob, setProfileSentJob] = useState<
    JobProfile[] | undefined
  >(undefined);
  const [InterviewJob, setInterviewJob] = useState<JobProfile[] | undefined>(
    undefined
  );
  const [ClosedJob, setClosedJob] = useState<JobProfile[] | undefined>(
    undefined
  );
  const [OnHoldJob, setOnHoldJob] = useState<JobProfile[] | undefined>(
    undefined
  );

  // project state
  const [activeProject,setActiveProject]=useState<ProjectProfile[]|undefined>(undefined)
  const [leadSentProject,setLeadSentProject]=useState<ProjectProfile[]|undefined>(undefined)
  const [onholdProject,setOnHoldProject]=useState<ProjectProfile[]|undefined>(undefined)
  const [closedProject,setClosedProject]=useState<ProjectProfile[]|undefined>(undefined)
  const [meetingScheduledProject,setMeetingScheduledProject]=useState<ProjectProfile[]|undefined>(undefined)

  //  client state
  const [ActiveClient, setActiveClient] = useState<Client[] | undefined>(
    undefined
  );
  const [InActiveClient, setInActiveClient] = useState<Client[] | undefined>(
    undefined
  );
  const [PendingClient, setPendingClient] = useState<Client[] | undefined>(
    undefined
  );

  const [PaidPayementClient,setPaidPayementClient]=useState<Client[] | undefined>(
    undefined
  );
  const [PartialPayementClient,setPartiaPayementClient]=useState<Client[] | undefined>(
    undefined
  );
  const [PendingPayementClient,setPendingPayementClient]=useState<Client[] | undefined>(
    undefined
  );

  const clientStatusData = [
    { name: "Active", value: ActiveClient?.length || 0, color: "#10B981" },
    { name: "Pending", value: PendingClient?.length || 0, color: "#F59E0B" },
    { name: "Inactive", value: InActiveClient?.length || 0, color: "#EF4444" },
  ];

  const paymentStatusData = [
    { name: "Paid", value: PaidPayementClient?.length || 0, color: "#10B981" },
    { name: "Partial", value: PartialPayementClient?.length || 0, color: "#F59E0B" },
    { name: "Pending", value: PendingPayementClient?.length || 0, color: "#EF4444" },
  ];

  const monthlyRevenueData = [
    { month: "Jan", revenue: 45000, clients: 12 },
    { month: "Feb", revenue: 52000, clients: 15 },
    { month: "Mar", revenue: 48000, clients: 13 },
    { month: "Apr", revenue: 61000, clients: 18 },
    { month: "May", revenue: 58000, clients: 16 },
    { month: "Jun", revenue: 67000, clients: 20 },
  ];


    const ProjectStatusData = [
     { status: "Active", count: activeProject?.length || 0 },
    { status: "Lead Sent", count: leadSentProject?.length || 0 },
    { status: "Meeting Scheduled", count: meetingScheduledProject?.length || 0 },
    { status: "Closed", count: closedProject?.length || 0 },
    { status: "On Hold", count: onholdProject?.length || 0 },
  ];

  // old jobstatus data

  // const jobStatusData = [
  //   { status: "Active", count: 23 },
  //   { status: "Profile Sent", count: 15 },
  //   { status: "Interview", count: 8 },
  //   { status: "Closed", count: 12 },
  //   { status: "On Hold", count: 5 }
  // ];

  // update jobstatus data from backend
  const jobStatusData = [
    { status: "Active", count: activeJob?.length || 0 },
    { status: "Profile Sent", count: ProfileSentJob?.length || 0 },
    { status: "Interview", count: InterviewJob?.length || 0 },
    { status: "Closed", count: ClosedJob?.length || 0 },
    { status: "On Hold", count: OnHoldJob?.length || 0 },
  ];

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "#8B5CF6",
    },
    clients: {
      label: "Clients",
      color: "#06B6D4",
    },
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getJobsData = async () => {
    try {
      const response = await axios.get(
        "https://api.vidhema.com/getAllJobProfiles"
      );
      console.log("This is Jobs data", response.data);
      const activejob = response.data.filter((job) => job.status === "Active");
      console.log("this is active job data", activejob);
      setActiveJob(activejob);

      //  profile sent job
      const profilesent = response.data.filter(
        (job) => job.status === "Profile Sent"
      );
      console.log("this is profile sent job", profilesent);
      setProfileSentJob(profilesent);

      //  interview job
      const interviewjob = response.data.filter(
        (job) => job.status === "Interview Scheduled"
      );
      console.log("this is interviewSent job", interviewjob);
      setInterviewJob(interviewjob);
      //  closed job
      const closedjob = response.data.filter((job) => job.status === "Closed" );
      console.log("this is Closed job", closedjob);
      setClosedJob(closedjob);

      //  onHold job
      const onHoldjob = response.data.filter((job) => job.status === "On Hold");
      console.log("this is ON Hold job", onHoldjob);
      setOnHoldJob(onHoldjob);
    } catch (error) {
      console.log(error);
    }
  };

  const getClientData = async () => {
    try {
      const response = await axios.get("https://api.vidhema.com/clients");
      console.log("This is all client data", response.data);
      const paidClient = response.data.filter(
        (client) => client.paymentStatus === "Paid"
      );
      console.log("This is paid client data", paidClient);
      let sum = 0;
      paidClient.forEach((client) => {
         console.log("Client amount raw:", client.totalAmount);
        const amount = parseFloat(client.totalAmount); // or client.paidAmount, based on your structure
        console.log("Parsed amount:", amount);
        if (!isNaN(amount)) {
          sum += amount;
        }
      });
      console.log("Sum of tota payement", sum);
      setTotalRevenue(sum);

      // filter of client on the baisis of active inactive pending status
      const activeclient = response.data.filter(
        (client) => client.status === "Active"
      );
      setActiveClient(activeclient);
      const pendingclient = response.data.filter(
        (client) => client.status === "Pending"
      );
      setPendingClient(pendingclient);
      const inactiveclient = response.data.filter(
        (client) => client.status === "Inactive"
      );
      setInActiveClient(inactiveclient);

      // filter of client on the baisis of paid  pending status on the payement status
      // const paidclient = response.data.filter(
      //   (client) => client.payementStatus === "Paid"
      // );
      setPaidPayementClient(paidClient);
      const pendingpayementclient = response.data.filter(
        (client) => client.paymentStatus === "Pending"
      );
      setPendingPayementClient(pendingpayementclient);
      const partialPayementclient = response.data.filter(
        (client) => client.paymentStatus === "Partial"
      );
      setPartiaPayementClient(partialPayementclient);
    } catch (error) {
      console.log(error);
    }
  };

  const getProjectData=async()=>{
    try {
      const response = await axios.get(
        "https://api.vidhema.com/projects"
      );
      console.log("This is Project data", response.data);
      const activeProject = response.data.filter((project) => project.status === "Active");
      console.log("this is active project data", activeProject);
      setActiveProject(activeProject);

      //  lead sent 
      const leadsent = response.data.filter(
        (project) => project.status === "Lead Sent"
      );
      console.log("this is profile sent job", leadsent);
      setLeadSentProject(leadsent);

      //  Meeting project
      const meetingproject = response.data.filter(
        (project) => project.status === "Meeting Scheduled"
      );
      console.log("this is Meeting Project", meetingproject);
      setMeetingScheduledProject(meetingproject);
      //  closed job
      const closeproject = response.data.filter((project) => project.status === "Closed" );
      console.log("this is Closed project", closeproject);
      setClosedProject(closeproject);

      //  onHold job
      const onholdproject = response.data.filter((project) => project.status === "On Hold");
      console.log("this is ON Hold project", onholdproject);
      setOnHoldProject(onholdProject);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getClientData();
    getJobsData();
    getProjectData()
  }, []);

  console.log("Active Client", ActiveClient);
  console.log("InActive Client", InActiveClient);
  console.log("Pending Client", PendingClient);

   console.log(" Payement Paid Client",PaidPayementClient );
  console.log("Payement Partial Client", PartialPayementClient);
  console.log("Payement Pending Client", PendingPayementClient);
  return (
    <div className="space-y-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive insights into your business performance
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(totalRevenue) || ""}
                </p>
                {/* <p className="text-xs text-green-600 mt-1">
                  +15.3% from last month
                </p> */}
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <IndianRupee className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                 Active Client
                </p>
                <p className="text-3xl font-bold text-blue-600">{ActiveClient?.length}</p>
                {/* <p className="text-xs text-blue-600 mt-1">
                  +5.1% from last month
                </p> */}
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-3xl font-bold text-purple-600">
                  {(activeJob && activeJob.length) || 0}
                </p>
                {/* <p className="text-xs text-purple-600 mt-1">
                  +8 new this month
                </p> */}
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
                  Active Project
                </p>
                <p className="text-3xl font-bold text-orange-600">{activeProject?.length}</p>
                {/* <p className="text-xs text-orange-600 mt-1">
                  -0.5h improvement
                </p> */}
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        {/* <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Revenue & Client Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <LineChart data={monthlyRevenueData}>
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="clients"
                  stroke="#06B6D4"
                  strokeWidth={3}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card> */}

        {/* project Status Distribution */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-purple-600" />
              Project Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <BarChart data={ProjectStatusData}>
                <XAxis dataKey="status" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Job Status Distribution */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-purple-600" />
              Job Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <BarChart data={jobStatusData}>
                <XAxis dataKey="status" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Client Status Pie Chart */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Client Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <PieChart>
                <Pie
                  data={clientStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  // label={({name, value}) => `${name}: ${value}%`}

                  // new with backend data
                  label={({ name, value }) => {
                    const total = clientStatusData.reduce(
                      (acc, entry) => acc + entry.value,
                      0
                    );
                    const percentage = ((value / total) * 100).toFixed(1); // 1 decimal point
                    return `${name}: ${percentage}%`;
                  }}
                >
                  {clientStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Payment Status Pie Chart */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Payment Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  // label={({ name, value }) => `${name}: ${value}%`}
                  // new with backend data
                  label={({ name, value }) => {
                    const total = paymentStatusData.reduce(
                      (acc, entry) => acc + entry.value,
                      0
                    );
                    const percentage = ((value / total) * 100).toFixed(1); // 1 decimal point
                    return `${name}: ${percentage}%`;
                  }}
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
