
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Edit, Calendar, Send, Users, Clock, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

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
  candidateName?: string;
  sentProfiles?: { candidateName: string; sentDate: string }[];
}

interface JobProfileListProps {
  profiles: JobProfile[];
  onUpdate: (profiles: JobProfile[]) => void;
  onEdit: (profile: JobProfile) => void;
}

export const JobProfileList = ({ profiles, onUpdate, onEdit }: JobProfileListProps) => {
  const [editingFollowup, setEditingFollowup] = useState<number | null>(null);
  const [newFollowupDate, setNewFollowupDate] = useState("");
  const [sendProfileDialog, setSendProfileDialog] = useState<number | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [sendDateTime, setSendDateTime] = useState("");
  const [scheduleInterview, setScheduleInterview] = useState<number | null>(null);
  const [interviewDate, setInterviewDate] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Profile Sent": return "bg-blue-100 text-blue-800";
      case "Interview Scheduled": return "bg-purple-100 text-purple-800";
      case "Closed": return "bg-gray-100 text-gray-800";
      case "On Hold": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const updateFollowupDate = (id: number) => {
    const updatedProfiles = profiles.map(profile =>
      profile.id === id ? { ...profile, followupDate: newFollowupDate } : profile
    );
    onUpdate(updatedProfiles);
    setEditingFollowup(null);
    setNewFollowupDate("");
  };

  const sendProfileToClient = (id: number) => {
    if (!selectedCandidate || !sendDateTime) return;
    
    const updatedProfiles = profiles.map(profile =>
      profile.id === id 
        ? { 
            ...profile, 
            profilesSent: profile.profilesSent + 1,
            status: "Profile Sent",
            candidateName: selectedCandidate,
            sentProfiles: [
              ...(profile.sentProfiles || []),
              { candidateName: selectedCandidate, sentDate: sendDateTime }
            ]
          } 
        : profile
    );
    onUpdate(updatedProfiles);
    setSendProfileDialog(null);
    setSelectedCandidate("");
    setSendDateTime("");
  };

  const scheduleInterviewForProfile = (id: number) => {
    if (!interviewDate) return;
    
    const updatedProfiles = profiles.map(profile =>
      profile.id === id 
        ? { 
            ...profile, 
            interviewScheduled: true, 
            interviewDate: interviewDate,
            status: "Interview Scheduled"
          } 
        : profile
    );
    onUpdate(updatedProfiles);
    setScheduleInterview(null);
    setInterviewDate("");
  };

  const closeJob = (id: number) => {
    const updatedProfiles = profiles.map(profile =>
      profile.id === id ? { ...profile, status: "Closed" } : profile
    );
    onUpdate(updatedProfiles);
  };

  return (
    <div className="space-y-4">
      {profiles.map((profile) => (
        <Card key={profile.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{profile.title}</h3>
                  <Badge className={getStatusColor(profile.status)}>{profile.status}</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                  <div>
                    <p className="font-medium text-gray-900">Client</p>
                    <p>{profile.clientName}</p>
                    <p className="text-xs">{profile.contactPerson}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Budget</p>
                    <p>{profile.budget}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Follow-up Date</p>
                    <div className="flex items-center gap-2">
                      {editingFollowup === profile.id ? (
                        <div className="flex gap-1">
                          <Input
                            type="date"
                            value={newFollowupDate}
                            onChange={(e) => setNewFollowupDate(e.target.value)}
                            className="h-8 text-xs"
                          />
                          <Button
                            size="sm"
                            onClick={() => updateFollowupDate(profile.id)}
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
                          <span>{new Date(profile.followupDate).toLocaleDateString()}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingFollowup(profile.id);
                              setNewFollowupDate(profile.followupDate);
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
                  <p className="font-medium text-gray-900 mb-1">Required Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">Profiles Sent</p>
                    <p className="text-blue-600 font-semibold">{profile.profilesSent}</p>
                  </div>
                  {profile.candidateName && (
                    <div>
                      <p className="font-medium text-gray-900">Candidate</p>
                      <p className="text-green-600 font-semibold">{profile.candidateName}</p>
                    </div>
                  )}
                  {profile.interviewScheduled && (
                    <div>
                      <p className="font-medium text-gray-900">Interview Date</p>
                      <p className="text-green-600 font-semibold">
                        {new Date(profile.interviewDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 ml-6">
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
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
                            onChange={(e) => setSelectedCandidate(e.target.value)}
                            placeholder="Enter candidate name"
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
                          onClick={() => sendProfileToClient(profile.id)}
                          className="w-full"
                        >
                          Send Profile
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  {profile.status === "Profile Sent" && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
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
                              onChange={(e) => setInterviewDate(e.target.value)}
                            />
                          </div>
                          <Button
                            onClick={() => scheduleInterviewForProfile(profile.id)}
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
                    onClick={() => onEdit(profile)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => closeJob(profile.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Close
                  </Button>
                </div>
              </div>
            </div>

            {profile.description && (
              <div className="border-t pt-4">
                <p className="font-medium text-gray-900 mb-2">Description</p>
                <p className="text-sm text-gray-600 leading-relaxed">{profile.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
