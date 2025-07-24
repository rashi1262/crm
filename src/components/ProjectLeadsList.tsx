import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Edit, Calendar, Send, Users, Clock, X } from "lucide-react";
import { IndianRupee } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle } from "lucide-react";

interface PopulatedClientDetails {
  _id: string;
  name: string;
}

// interface SentProfile {
//   candidateName: string;
//   sentDate: string;
//   _id?: string;
// }

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
  jd?: string;
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

export const ProjectLeadList = ({
  projects,
  onUpdate,
  onEdit,
}: ProjectProfileListProps) => {
  const [editingFollowup, setEditingFollowup] = useState<string | null>(null);
  const [newFollowupDate, setNewFollowupDate] = useState("");
  const [sendProfileDialog, setSendProfileDialog] = useState<string | null>(
    null
  );
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [sendDateTime, setSendDateTime] = useState("");
  const [scheduleMeeting, setScheduleMeeting] = useState<string | null>(null);
  const [MeetingDate, setMeetingDate] = useState("");
  const [proposalDescription, setProposalDescription] = useState("");

  // confirm the close button feature pop up
  const [confirmCloseProjectId, setConfirmCloseProjectId] = useState<
    string | null
  >(null);

  // followup description
  const [sendFollowUpDialog, setSendFollowUpDialog] = useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");
  const [followupData, setFollowupData] = useState({
    description: "",
    datetime: "",
  });

  // for chat Purpose
  const [newMessage, setNewMessage] = useState("");
  const [chatProject, setChatProject] = useState<string | null>(null);

  // message ko group kerne ke liye
  const groupMessagesByDate = (
    messages: ChatMessage[]
  ): Record<string, ChatMessage[]> => {
    const grouped: Record<string, ChatMessage[]> = {};
    messages.forEach((msg) => {
      const date = new Date(msg.timestamp).toDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(msg);
    });
    return grouped;
  };

  // chats ke liye
  const addChatMessage = async (e: React.FormEvent, projectId: string) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const project = projects.find((p) => p._id === projectId);
    if (!project) return;

    const newMsg = {
      id: Date.now(),
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    const updatedChat = [...(project.chatMessages || []), newMsg];

    try {
      const res = await axios.put(
        `https://api.vidhema.com/projects/${projectId}`,
        {
          chatMessages: updatedChat,
          conversations: (project.conversations || 0) + 1,
        }
      );

      // Update state
      onUpdate(
        projects.map((proj) => (proj._id === projectId ? res.data : proj))
      );

      setNewMessage("");
    } catch (err) {
      console.error("Chat message update failed:", err);
      alert("Failed to send message");
    }
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const { toast } = useToast();

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case "Active":
  //       return "bg-green-100 text-green-800";
  //     case "Lead Sent":
  //       return "bg-blue-100 text-blue-800";
  //     case "Meeting Scheduled":
  //       return "bg-purple-100 text-purple-800";
  //     case "Closed":
  //       return "bg-gray-100 text-gray-800";
  //     case "On Hold":
  //       return "bg-yellow-100 text-yellow-800";
  //     default:
  //       return "bg-gray-100 text-gray-800";
  //   }
  // };

  // new get status
  function getStatusColor(status: string): string {
    switch (status) {
      case "Active":
        return "bg-green-500 text-white hover:bg-green-500 hover:text-white";
      case "Pending":
      case "Lead Sent":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100 text-blue-80";
      case "Meeting Scheduled":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100 text-purple-800";
      case "Closed":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100 text-gray-800";
      case "On Hold":
        return "bg-yellow-100 text-yellow-800 hover: bg-yellow-100 text-yellow-800";

      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100 text-gray-800";
    }
  }

  // getting the env data of the api

  const baseURL = import.meta.env.VITE_API_URL;

  const updateFollowupDate = async (id: string) => {
    try {
       console.log("Raw Followup date Updatelist of Project (local):",newFollowupDate);
      console.log("Udate followupdate in list of Project", newFollowupDate);

      // convert localdateandtime to utc for consistency db
      const utcDateStr=new Date(newFollowupDate).toISOString()
      // converted utcDateStr
       console.log("Converted to UTC in Project  creation :", utcDateStr);
      await axios.put(
        `https://api.vidhema.com/projects/${id}`,
        {
          // "actionDetails.followUpDate": newFollowupDate,
          "actionDetails.followUpDate": utcDateStr,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      // Fetch the latest profiles from the backend
      const response = await axios.get(`https://api.vidhema.com/projects`);

      onUpdate(response.data);
      setEditingFollowup(null);
      setNewFollowupDate("");
      console.log(
        "Getting all the  updateFollow Update function lates project detail throug project lis page",
        response.data
      );
      toast({
        title: "Follow-up Updated",
        description: "The follow-up date has been successfully updated.",
      });
    } catch (error) {
      console.log("Error updating Followup Date", error);
      toast({
        title: "Update Failed",
        description: "Failed to update follow-up date. Please try again.",
        variant: "destructive",
      });
    }
  };

  // const sendProfileToClient = async (id: string) => {
  //   if (!selectedCandidate || !sendDateTime) {
  //     toast({
  //       title: "Missing Fields",
  //       description: "Please enter both Client name and send date.",
  //       variant: "destructive",
  //     });
  //     return;
  //   }
  //   try {
  //     await axios.put(
  //       `https://api.vidhema.com/projects/${id}`,
  //       {
  //         status: "Lead Sent",
  //         "actionDetails.markAsSend": true,
  //         "actionDetails.teamName": selectedCandidate,
  //         "actionDetails.followUpDate": sendDateTime,
  //       },
  //       { headers: { "Content-Type": "application/json" } }
  //     );
  //     // Fetch the latest profiles from the backend
  //     const response = await axios.get(`https://api.vidhema.com/projects`);

  //     onUpdate(response.data);
  //     setSendProfileDialog(null);
  //     setSelectedCandidate("");
  //     setSendDateTime("");
  //     console.log(
  //       "This is sendprofile to client function data in project list ",
  //       response.data
  //     );
  //     toast({
  //       title: "Proposal Sent",
  //       description: `${selectedCandidate}'s profile has been sent to the client.`,
  //     });
  //   } catch (error) {
  //     console.log("Error updating sent profile to client", error);
  //     toast({
  //       title: "Failed to Send Proposal",
  //       description: "There was an issue sending the proposal. Try again.",
  //       variant: "destructive",
  //     });
  //   }
  // };

  // update the SendProposal Description
  const sendProposalDescription = async (id: string) => {
    if (!proposalDescription ) {
      toast({
        title: "Missing Fields",
        description: "Please enter  proposal description ",
        variant: "destructive",
      });
      return;
    }
    try {
      //  console.log("Raw Followup date Send Propsal Description Updatelist of Project (local):",sendDateTime);
      // console.log("Udate followupdate Send ProposalDescription in list of Project", sendDateTime);

      // // convert localdateandtime to utc for consistency db
      // const utcDateStr=new Date(sendDateTime).toISOString()
      // // converted utcDateStr
      //  console.log("Converted to UTC in Project  creation :", utcDateStr);
      // Let's say you already have the existing project data
      const existingProject = await axios.get(
        `https://api.vidhema.com/projects/${id}`
      );

      const existingTeamName =
        existingProject.data?.actionDetails?.teamName || [];

      const payload = {
        status: "Lead Sent",
        proposalDescription: proposalDescription,
        // actionDetails: {
        //   markAsSend: true,
        //   // followUpDate: sendDateTime,
        //   // followUpDate: utcDateStr,
        //   teamName: existingTeamName, // ✅ Preserve previous value
        // },
      };

      await axios.put(
        `https://api.vidhema.com/projects/${id}`,

        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("proposal", proposalDescription);
      // Fetch the latest profiles from the backend
      const response = await axios.get(`https://api.vidhema.com/projects`);

      onUpdate(response.data);
      setSendProfileDialog(null);
      setProposalDescription("");
      setSendDateTime("");
      console.log(
        "This is sendprofile to client function data in project list ",
        response.data
      );
      toast({
        title: "Proposal Sent",
        description: `Propsal description is addedd in project profile `,
      });
    } catch (error) {
      console.log("Error updating sent profile to client", error);
      toast({
        title: "Failed to Send Proposal",
        description: "There was an issue sending the proposal. Try again.",
        variant: "destructive",
      });
    }
  };

  const sentTheFollowup = async (
    projectId: string,
    data: { description: string; datetime: string }
  ) => {
    if (!data.description || !data.datetime) {
      toast({
        title: "Missing Fields",
        description: "Please enter both Followup description and send date.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Sending followup for project:", projectId);
      console.log("Followup Description:", data.description);
      console.log("Send DateTime:", data.datetime);
       console.log("Raw Followup date Send Proposal Description Updatelist of Project (local):", data.datetime);
    console.log("Update followupdate Send Proposal Description in list of Project", data.datetime);

    // Convert local datetime string to UTC ISO format
    const utcDateStr = new Date(data.datetime).toISOString();
    console.log("Converted to UTC in Project creation:", utcDateStr);

      const existingProject = await axios.get(
        `https://api.vidhema.com/projects/${projectId}`
      );

      const existingTeamName =
        existingProject.data?.actionDetails?.teamName || [];
      const existingFollowups = existingProject.data?.followups || [];

      const newFollowup = {
        id: Date.now(),
        description: data.description,
        // datetime: data.datetime,
          datetime: utcDateStr,  // use UTC here
        completed: false,
      };

      const updatedFollowups = [...existingFollowups, newFollowup];

      const payload = {
        followups: updatedFollowups,
        actionDetails: {
          //followUpDate: data.datetime,
           followUpDate: utcDateStr,  // also update followUpDate in UTC
          teamName: existingTeamName,
        },
      };

      console.log("Payload to update:", payload);

      const result = await axios.put(
        `https://api.vidhema.com/projects/${projectId}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Response from PUT:", result.data);

      const response = await axios.get(`https://api.vidhema.com/projects`);
      onUpdate(response.data);

      setSendFollowUpDialog(null); // <- updated to match your new state
      setFollowupData({ description: "", datetime: "" });

      toast({
        title: "Follow Up Added",
        description: `Followup description is addedd in project profile `,
      });
    } catch (error) {
      console.error("Error updating followup:", error);
      toast({
        title: "Failed to Add the Followup",
        description: "There was an issue Adding the Followp. Try again.",
        variant: "destructive",
      });
    }
  };

  const scheduleMeetingForProject = async (id: string) => {
    if (!MeetingDate) {
      toast({
        title: "Missing Date",
        description: "Please select a meeting date and time.",
        variant: "destructive",
      });
      return;
    }
    try {
      console.log("Raw Meeting Date (local):", MeetingDate);

    // Convert MeetingDate to UTC ISO string
    const utcMeetingDate = new Date(MeetingDate).toISOString();
    console.log("Converted Meeting Date to UTC:", utcMeetingDate);
      await axios.put(
        `https://api.vidhema.com/projects/${id}`,
        {
          // "MeetingActionDetails.MeetingDateTime": MeetingDate,
          "MeetingActionDetails.MeetingDateTime": utcMeetingDate, // send UTC
          "MeetingActionDetails.proceedToMeeting": true,
          status: "Meeting Scheduled",
        },
        { headers: { "Content-Type": "application/json" } }
      );
      // Fetch the latest profiles from the backend
      const response = await axios.get(`https://api.vidhema.com/projects`);
      onUpdate(response.data);
      setScheduleMeeting(null);
      setMeetingDate("");
      console.log(
        "This is project latest data through backend projectlead list page",
        response.data
      );
      toast({
        title: "Meeting Scheduled",
        description: "The meeting has been successfully scheduled.",
      });
    } catch (error) {
      console.error("Error updating schedule Meeting:", error);
      toast({
        title: "Schedule Failed",
        description: "There was an error scheduling the meeting.",
        variant: "destructive",
      });
    }
  };

  const closeProject = async (id: string) => {
    try {
      await axios.put(
        `https://api.vidhema.com/projects/${id}`,
        { status: "Closed" },
        { headers: { "Content-Type": "application/json" } }
      );

      // Fetch the latest profiles from the backend
      const response = await axios.get(`https://api.vidhema.com/projects`);
      onUpdate(response.data); // Update UI with fresh data
      console.log(
        "this is closeproject in list page of project",
        response.data
      );
      toast({
        title: "Project Closed",
        description: "This project has been marked as closed.",
      });
      console.log("Project status updated to Closed");
    } catch (error) {
      console.error("Error updating project status:", error);
      toast({
        title: "Close Failed",
        description: "Failed to close the project. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <Card key={project._id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {project.title}
                  </h3>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                  <div>
                    <p className="font-medium text-gray-900">Client</p>
                    <p className="text-xs">{project.clientId.name}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {/* <IndianRupee className="h-3 w-3 text-green-600" /> */}
                      <p className="font-medium text-gray-900">Budget</p>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      {/* <span className="text-base font-normal">₹</span> */}
                      <p className="text-base text-gray-900">
                        {formatCurrency(project.clientBudget)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Follow-up Date</p>

                    {/* <div className="flex items-center gap-2">
                      {editingFollowup === project._id ? (
                        <div className="flex gap-1">
                          <Input
                            type="date"
                            value={newFollowupDate}
                            onChange={(e) => setNewFollowupDate(e.target.value)}
                            className="h-8 text-xs"
                          />
                          <Button
                            size="sm"
                            onClick={() => updateFollowupDate(project._id)}
                            className="h-8 px-2"
                          >
                            ✓
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingFollowup(null)}
                            className="h-8 px-2"
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>
                            {new Date(
                              project.actionDetails.followUpDate
                            ).toLocaleDateString()}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingFollowup(project._id);
                              setNewFollowupDate(
                                project.actionDetails.followUpDate
                              );
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div> */}
                    
                    {/* new followupdate */}
                      <div className="flex items-center gap-2">
                          <span>
                            {new Date(
                              project.actionDetails.followUpDate
                            ).toLocaleDateString()}
                          </span>
                          </div>
                  
                  </div>
                </div>

                <div className="mb-4">
                  <p className="font-medium text-gray-900 mb-1">
                    Required Skills
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {project.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">Lead Sent</p>
                    <p className="text-blue-600 font-semibold">
                      {/* {project?.actionDetails.markAsSend === true
                        ? "Yes"
                        : "No"} */}

                      {/* newly version */}
                      <p className="text-blue-600 font-semibold">
                        {project.actionDetails?.markAsSend === true ||
                        project.status === "Lead Sent"
                          ? "Yes"
                          : "No"}
                      </p>
                    </p>
                  </div>

                  {/* old teamName type */}

                  {/* {project.actionDetails?.teamName && (
                    <div>
                      <p className="font-medium text-gray-900">Team</p>
                      <p className="text-green-600 font-semibold">
                        {project.actionDetails.teamName}
                      </p>
                    </div>
                  )} */}

                  {/* new teamName as an arrya */}
                  {project.actionDetails?.teamName &&
                    project.actionDetails.teamName.length > 0 && (
                      <div>
                        <p className="font-medium text-gray-900">Team</p>
                        <div className="flex flex-wrap gap-1">
                          {project.actionDetails.teamName.map((team, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs text-green-600 font-semibold"
                            >
                              {team}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                  {project.MeetingActionDetails?.MeetingDateTime && (
                    <div>
                      <p className="font-medium text-gray-900">
                        Meeting Date & Time
                      </p>
                      <p className="text-green-600 font-semibold">
                        {new Date(
                          project.MeetingActionDetails.MeetingDateTime
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* old comment */}
              {/* <div className="flex flex-col gap-2 ml-6">
                <div className="flex gap-2">
                  <Dialog
                    open={sendProfileDialog === project._id}
                    onOpenChange={(open) =>
                      setSendProfileDialog(open ? project._id : null)
                    }
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          setSendProfileDialog(project._id);
                          setSelectedCandidate("");
                          setSendDateTime("");
                        }}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Send Proposal
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Send Proposal to Client</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>ClientName</Label>
                          <Input
                            value={selectedCandidate}
                            onChange={(e) =>
                              setSelectedCandidate(e.target.value)
                            }
                            placeholder="Enter Client name"
                          />
                        </div>
                        <div>
                          <Label>Send Date & Time</Label>
                          <Input
                            type="datetime-local"
                            value={sendDateTime}
                            onChange={(e) => setSendDateTime(e.target.value)}
                          />
                        </div>
                        <Button
                          onClick={() => sendProfileToClient(project._id)}
                          className="w-full"
                        >
                          Send 
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {project.status === "Lead Sent" && (
                    <Dialog
                      open={scheduleInterview === project._id}
                      onOpenChange={(open) =>
                        setScheduleInterview(open ? project._id : null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setScheduleInterview(project._id);
                            setInterviewDate("");
                          }}
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          Schedule Meeting
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Schedule Meeting</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Meeting Date & Time</Label>
                            <Input
                              type="datetime-local"
                              value={interviewDate}
                              onChange={(e) => setInterviewDate(e.target.value)}
                            />
                          </div>
                          <Button
                            onClick={() =>
                              scheduleInterviewForProject(project._id)
                            }
                            className="w-full"
                          >
                            Schedule Interview
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(project)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => closeProject(project._id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Close
                  </Button>
                </div>
              </div> */}

              {/* conditon based rendering if closed nothing show else all show */}
              {project.status !== "Closed" && (
                <div className="flex flex-col gap-2 ml-6">
                  <div className="flex gap-2">
                    {/* Send Proposal Dialog Button */}
                    <Dialog
                      open={sendProfileDialog === project._id}
                      onOpenChange={(open) =>
                        setSendProfileDialog(open ? project._id : null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => {
                            setSendProfileDialog(project._id);
                            setSelectedCandidate("");
                            setSendDateTime("");
                          }}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Send Proposal
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Send Proposal Description</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Proposal Type</Label>
                            {/* <Input
                              value={selectedCandidate}
                              onChange={(e) =>
                                setSelectedCandidate(e.target.value)
                              }
                              placeholder="Enter Proposal Thought "
                            /> */}
                            {/* text area */}
                            <textarea
                              id="proposalDescription"
                              value={proposalDescription}
                              onChange={(e) =>
                                setProposalDescription(e.target.value)
                              }
                              placeholder="Enter Proposal Thought"
                              rows={4}
                              className="w-full p-2 border rounded-md text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          {/* <div>
                            <Label>Next Follow Up Date & Time</Label>
                            <Input
                              type="datetime-local"
                              value={sendDateTime}
                              onChange={(e) => setSendDateTime(e.target.value)}
                            />
                          </div> */}
                          {/* <Button
                            onClick={() => sendProfileToClient(project._id)}
                            className="w-full"
                          >
                            Send
                          </Button> */}

                          {/* new */}
                          <Button
                            onClick={() => sendProposalDescription(project._id)}
                            className="w-full"
                          >
                            Send
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* followup dialog Button contain followup detail  */}

                    <Dialog
                      open={sendFollowUpDialog === project._id}
                      onOpenChange={(open) => {
                        setSendFollowUpDialog(open ? project._id : null);
                        setActiveTab("new"); // Reset tab when dialog opens
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline" // add this to get outline style
                          className="border-green-200 text-green-700 hover:bg-green-50" // green outline and text
                          onClick={() => {
                            setSendFollowUpDialog(project._id);
                            setFollowupData({ description: "", datetime: "" });
                          }}
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          Followup
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold text-gray-900">
                            Follow-up Management
                          </DialogTitle>
                          <DialogDescription>
                            View history or add a new follow-up entry.
                          </DialogDescription>
                        </DialogHeader>

                        {/* Tab buttons */}
                        <div className="flex gap-2 my-4">
                          <Button
                            variant={
                              activeTab === "new" ? "default" : "outline"
                            }
                            onClick={() => setActiveTab("new")}
                          >
                            Add New
                          </Button>
                          <Button
                            variant={
                              activeTab === "history" ? "default" : "outline"
                            }
                            onClick={() => setActiveTab("history")}
                          >
                            History
                          </Button>
                        </div>

                        {/* Conditional tab content */}
                        {activeTab === "new" ? (
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-700">
                                Follow-up Description
                              </Label>
                              <Textarea
                                value={followupData.description}
                                onChange={(e) =>
                                  setFollowupData((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                  }))
                                }
                                placeholder="Describe the purpose of this follow-up..."
                                className="mt-1 min-h-[80px]"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">
                                Date & Time
                              </Label>
                              <Input
                                type="datetime-local"
                                value={followupData.datetime}
                                onChange={(e) =>
                                  setFollowupData((prev) => ({
                                    ...prev,
                                    datetime: e.target.value,
                                  }))
                                }
                                className="mt-1"
                              />
                            </div>
                            <Button
                              onClick={() =>
                                sentTheFollowup(project._id, followupData)
                              }
                              className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                              Schedule Follow-up
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                            {project.followups &&
                            project.followups.length > 0 ? (
                              project.followups.map((fu, index) => (
                                <div
                                  key={index}
                                  className="border rounded-md p-3 text-sm text-gray-700 bg-gray-50"
                                >
                                  <p className="font-medium">
                                    {fu.description}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(fu.datetime).toLocaleString()}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500">
                                No follow-up history yet.
                              </p>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    {/* Chat Conversation ke liye */}
                    <Dialog
                      open={chatProject === project._id}
                      onOpenChange={(open) =>
                        setChatProject(open ? project._id : null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-purple-200 text-purple-700 hover:bg-purple-50"
                          onClick={() => setChatProject(project._id)}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Chat ({project.conversations || 0})
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold text-gray-900">
                            Chat - {project.title}
                          </DialogTitle>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto bg-gray-50 border p-4 rounded-md space-y-4">
                          {project.chatMessages?.length ? (
                            Object.entries(
                              groupMessagesByDate(project.chatMessages)
                            ).map(([date, messages]) => (
                              <div key={date}>
                                <div className="text-center text-xs font-semibold text-blue-600 mb-2">
                                  {date}
                                </div>
                                {messages.map((msg) => (
                                  <div
                                    key={msg.id}
                                    className="bg-white shadow p-3 rounded border-l-4 border-blue-400"
                                  >
                                    <p>{msg.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {new Date(
                                        msg.timestamp
                                      ).toLocaleTimeString()}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-4">
                              No messages yet
                            </p>
                          )}
                        </div>

                        <form
                          onSubmit={(e) => addChatMessage(e, project._id)}
                          className="mt-4 flex gap-2"
                        >
                          <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message"
                            className="flex-1"
                          />
                          <Button
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Send
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                 
                    {/* Schedule Meeting Button (if Lead Sent) */}
                    {project.status === "Lead Sent" && (
                      <Dialog
                        open={scheduleMeeting === project._id}
                        onOpenChange={(open) =>
                          setScheduleMeeting(open ? project._id : null)
                        }
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setScheduleMeeting(project._id);
                              setMeetingDate("");
                            }}
                          >
                            <Calendar className="h-4 w-4 mr-1" />
                            Schedule Meeting
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Schedule Meeting</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Meeting Date & Time</Label>
                              <Input
                                type="datetime-local"
                                value={MeetingDate}
                                onChange={(e) => setMeetingDate(e.target.value)}
                              />
                            </div>
                            <Button
                              onClick={() =>
                                scheduleMeetingForProject(project._id)
                              }
                              className="w-full"
                            >
                              Schedule Meeting
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>

                  {/* Edit and Close Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(project)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>

                    {/* <Button
                      size="sm"
                      variant="outline"
                      onClick={() => closeProject(project._id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Close
                    </Button> */}

                    {/* updated close button with popup */}
                    <Dialog
                      open={confirmCloseProjectId === project._id}
                      onOpenChange={(open) =>
                        setConfirmCloseProjectId(open ? project._id : null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setConfirmCloseProjectId(project._id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Close
                        </Button>
                      </DialogTrigger>

                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Close</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 text-sm text-gray-600">
                          Are you sure you want to close this project? This
                          action cannot be undone.
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setConfirmCloseProjectId(null)}
                          >
                            ❌ Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => {
                              closeProject(project._id);
                              setConfirmCloseProjectId(null);
                            }}
                          >
                            ✅ Yes, Close
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              )}
            </div>

            {project.description && (
              <div className="border-t pt-4">
                <p className="font-medium text-gray-900 mb-2">
                  Project Description
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {project.description}
                </p>
              </div>
            )}
            <br />
            {/* propsal descripition */}
            {project.proposalDescription && (
              <div className="border-t pt-4">
                <p className="font-medium text-gray-900 mb-2">
                  Proposal Description
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {project.proposalDescription}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
