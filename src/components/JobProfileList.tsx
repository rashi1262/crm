import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Edit, Calendar, Send, Users, Clock, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { IndianRupee } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface PopulatedClientDetails {
  _id: string;
  name: string;
}

// interface SentProfile {
//   candidateName: string;
//   sentDate: string;
//   _id?: string;
// }

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

interface JobProfileListProps {
  profiles: JobProfile[];
  onUpdate: (profiles: JobProfile[]) => void;
  onEdit: (profile: JobProfile) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

export const JobProfileList = ({
  profiles,
  onUpdate,
  onEdit,
}: JobProfileListProps) => {
  const [editingFollowup, setEditingFollowup] = useState<string | null>(null);
  const [newFollowupDate, setNewFollowupDate] = useState("");
  const [sendProfileDialog, setSendProfileDialog] = useState<string | null>(
    null
  );
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [sendDateTime, setSendDateTime] = useState("");
  const [scheduleInterview, setScheduleInterview] = useState<string | null>(
    null
  );
  const [interviewDate, setInterviewDate] = useState("");
  // confirm the close button feature pop up
  const [confirmCloseJobId, setConfirmCloseJobId] = useState<string | null>(
    null
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 hover:bg-green-100 text-green-800";
      case "Profile Sent":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100 text-blue-800";
      case "Interview Scheduled":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100 text-purple-800";
      case "Closed":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100 text-gray-800";
      case "On Hold":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100 text-gray-800";
    }
  };
  // getting the env data of the api

  const baseURL = import.meta.env.VITE_API_URL;

  const updateFollowupDate = async (id: string) => {
    try {
      console.log("Raw newFollowupDate (local):", newFollowupDate);
      console.log("Udate newFollowupDate", newFollowupDate);

      // convert localdateandtime to utc for consistency db
      const utcDateStr=new Date(newFollowupDate).toISOString()
      // converted utcDateStr
       console.log("Converted to UTC:", utcDateStr);

      await axios.put(
        // `${baseURL}/updateJobProfile/${id}`,
        `https://api.vidhema.com/updateJobProfile/${id}`,
        {
          // "actionDetails.followUpDate": newFollowupDate,
          "actionDetails.followUpDate": utcDateStr,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      // Fetch the latest profiles from the backend
      const response = await axios.get(`${baseURL}/getAllJobProfiles`);

      onUpdate(response.data);
      setEditingFollowup(null);
      setNewFollowupDate("");
      toast({
        title: "✅ Job is Updated",
        description: "The  Job  has been Updated.",
      });
    } catch (error) {
      console.log("Error updating Followup Date", error);
      toast({
        variant: "destructive",
        title: "❌ Error",
        description:
          error?.response?.data?.message ||
          "Failed to Update  the Job . Please try again.",
      });
    }
  };

  const sendProfileToClient = async (id: string) => {
    if (!selectedCandidate || !sendDateTime) return;
    try {
      console.log("Raw sendDateTime (local):", sendDateTime);
      console.log("Udate sendDateTime", sendDateTime);

      // convert localdateandtime to utc for consistency db
      const utcDateStr=new Date(sendDateTime).toISOString()
      // converted utcDateStr
       console.log("Converted to UTC:", utcDateStr);
      await axios.put(
        `https://api.vidhema.com/updateJobProfile/${id}`,
        {
          status: "Profile Sent",
          "actionDetails.markAsSend": true,
          "actionDetails.candidateName": selectedCandidate,
          // "actionDetails.followUpDate": sendDateTime,
           "actionDetails.followUpDate": utcDateStr,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      // Fetch the latest profiles from the backend
      const response = await axios.get(`${baseURL}/getAllJobProfiles`);

      onUpdate(response.data);
      setSendProfileDialog(null);
      setSelectedCandidate("");
      setSendDateTime("");
    } catch (error) {
      console.log("Error updating sent profile to client", error);
    }
  };

  const scheduleInterviewForProfile = async (id: string) => {
    if (!interviewDate) return;
    try {
      await axios.put(
        `https://api.vidhema.com/updateJobProfile/${id}`,
        {
          "interviewActionDetails.interviewDateTime": interviewDate,
          "interviewActionDetails.proceedToInterview": true,
          status: "Interview Scheduled",
        },
        { headers: { "Content-Type": "application/json" } }
      );
      // Fetch the latest profiles from the backend
      const response = await axios.get(
        `https://api.vidhema.com/getAllJobProfiles`
      );
      onUpdate(response.data);
      setScheduleInterview(null);
      setInterviewDate("");
    } catch (error) {
      console.error("Error updating schedule interview:", error);
    }
  };

  const closeJob = async (id: string) => {
    try {
      await axios.put(
        `https://api.vidhema.com/updateJobProfile/${id}`,
        { status: "Closed" },
        { headers: { "Content-Type": "application/json" } }
      );

      // Fetch the latest profiles from the backend
      const response = await axios.get(
        `https://api.vidhema.com/getAllJobProfiles`
      );
      onUpdate(response.data); // Update UI with fresh data
      console.log("Job status updated to Closed");
    } catch (error) {
      console.error("Error updating job status:", error);
    }
  };

  return (
    <div className="space-y-4">
      {profiles.map((profile) => (
        <Card key={profile._id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {profile.title}
                  </h3>
                  <Badge className={getStatusColor(profile.status)}>
                    {profile.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                  <div>
                    <p className="font-medium text-gray-900">Client</p>
                    <p className="text-xs">{profile.clientId.name}</p>
                  </div>
                  <div>
                    {/* <IndianRupee className="h-4 w-4 text-green-600" /> */}
                    <p className="font-medium text-gray-900">Budget</p>
                    <p>{formatCurrency(profile.clientBudget)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Follow-up Date</p>
                    <div className="flex items-center gap-2">
                      {editingFollowup === profile._id ? (
                        <div className="flex gap-1">
                          <Input
                            type="datetime-local"
                            value={newFollowupDate}
                            onChange={(e) => setNewFollowupDate(e.target.value)}
                            className="h-8 text-xs"
                          />
                          <Button
                            size="sm"
                            onClick={() => updateFollowupDate(profile._id)}
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
                              profile.actionDetails.followUpDate
                            ).toLocaleDateString()}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingFollowup(profile._id);
                              setNewFollowupDate(
                                profile.actionDetails.followUpDate
                              );
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="font-medium text-gray-900 mb-1">
                    Required Skills
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {profile.skills.map((skill, index) => (
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
                    <p className="font-medium text-gray-900">Profiles Sent</p>
                    <p className="text-blue-600 font-semibold">
                      {profile?.actionDetails.markAsSend === true
                        ? "Yes"
                        : "No"}
                    </p>
                  </div>
                  {profile.actionDetails.candidateName && (
                    <div>
                      <p className="font-medium text-gray-900">Candidate</p>
                      <p className="text-green-600 font-semibold">
                        {profile.actionDetails.candidateName}
                      </p>
                    </div>
                  )}
                  {profile.interviewActionDetails.interviewDateTime && (
                    <div>
                      <p className="font-medium text-gray-900">
                        Interview Date
                      </p>
                      <p className="text-green-600 font-semibold">
                        {new Date(
                          profile.interviewActionDetails.interviewDateTime
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* in this condition based rendring of the buttons  */}
              <div className="flex flex-col gap-2 ml-6">
                {profile.status !== "Closed" && (
                  <>
                    <div className="flex gap-2">
                      <Dialog
                        open={sendProfileDialog === profile._id}
                        onOpenChange={(open) =>
                          setSendProfileDialog(open ? profile._id : null)
                        }
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => {
                              setSendProfileDialog(profile._id);
                              setSelectedCandidate("");
                              setSendDateTime("");
                            }}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Send Profile
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Send Profile to Client</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Candidate Name</Label>
                              <Input
                                value={selectedCandidate}
                                onChange={(e) =>
                                  setSelectedCandidate(e.target.value)
                                }
                                placeholder="Enter candidate name"
                              />
                            </div>
                            <div>
                              <Label>Send/FollowUp Date & Time</Label>
                              <Input
                                type="datetime-local"
                                value={sendDateTime}
                                onChange={(e) =>
                                  setSendDateTime(e.target.value)
                                }
                              />
                            </div>
                            <Button
                              onClick={() => sendProfileToClient(profile._id)}
                              className="w-full"
                            >
                              Send Profile
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {profile.status === "Profile Sent" && (
                        <Dialog
                          open={scheduleInterview === profile._id}
                          onOpenChange={(open) =>
                            setScheduleInterview(open ? profile._id : null)
                          }
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setScheduleInterview(profile._id);
                                setInterviewDate("");
                              }}
                            >
                              <Calendar className="h-4 w-4 mr-1" />
                              Schedule Interview
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Schedule Interview</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Interview Date & Time</Label>
                                <Input
                                  type="datetime-local"
                                  value={interviewDate}
                                  onChange={(e) =>
                                    setInterviewDate(e.target.value)
                                  }
                                />
                              </div>
                              <Button
                                onClick={() =>
                                  scheduleInterviewForProfile(profile._id)
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
                      {/* old version */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(profile)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>

                      {/* old version  */}

                      {/* <Button
                    size="sm"
                    variant="outline"
                    onClick={() => closeJob(profile._id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Close
                  </Button> */}

                      {/* updated close button with popup */}
                      <Dialog
                        open={confirmCloseJobId === profile._id}
                        onOpenChange={(open) =>
                          setConfirmCloseJobId(open ? profile._id : null)
                        }
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setConfirmCloseJobId(profile._id)}
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
                            Are you sure you want to close this Job? This action
                            cannot be undone.
                          </div>

                          <div className="flex justify-end gap-2 pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setConfirmCloseJobId(null)}
                            >
                              ❌ Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => {
                                closeJob(profile._id);
                                setConfirmCloseJobId(null);
                              }}
                            >
                              ✅ Yes, Close
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </>
                )}
              </div>
            </div>

            {profile.description && (
              <div className="border-t pt-4">
                <p className="font-medium text-gray-900 mb-2">Description</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {profile.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
