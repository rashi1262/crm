import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Calendar,
  DollarSign,
  MessageCircle,
  CreditCard,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";

interface ActionDetails {
  inboxType?: "employee";
  employeeId?: string;
  followUpDate?: string;
  lastfollowUpDate?: string;
}

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
  actionDetails: ActionDetails;
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
  notes: string;
}

interface ClientListProps {
  clients: Client[];
  onUpdate: (clients: Client[]) => void;
  onEdit: (clients: Client) => void;
  refetchClients: () => void; // Add this line
}

export const ClientList = ({
  clients,
  onUpdate,
  onEdit,
  refetchClients,
}: ClientListProps) => {
  // const [editingClient, setEditingClient] = useState<number | null>(null);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Client>>({});
  // const [followupData, setFollowupData] = useState({
  //   description: "",
  //   datetime: "",
  // });
  const [newMessage, setNewMessage] = useState("");
  const [paymentDialog, setPaymentDialog] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState({
    status: "",
    totalAmount: 0,
    paidAmount: 0,
  });
  const [editUps, setEditUps] = useState<string | null>(null); //store the client.id for the edit
  // const [followUps, setFollowUps] = useState<string | null>(null); // store client.id
  const [chatUps, setChatUps] = useState<string | null>(null); //store the client.id for the chat purpose
  // const [activeTab, setActiveTab] = useState<"new" | "history">("new");
  const [confirmCloseClientId, setConfirmCloseClientId] = useState<string | null>(null);


  // followup description
  const [sendFollowUpDialog, setSendFollowUpDialog] = useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");
  const [followupData, setFollowupData] = useState({
    description: "",
    datetime: "",
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200 hover:bg-green-100 text-green-800 border-green-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Inactive":
        return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100 text-gray-800 border-gray-200 ";
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Pending":
        return "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100 text-orange-800 border-orange-200 ";
      case "Due":
        return "bg-red-100 text-red-800 border-red-200 hover:bg-red-100 text-red-800 border-red-200";
      case "Partial":
        return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 text-blue-800 border-blue-200";
      case "Overdue":
        return "bg-red-100 text-red-800 border-red-200 hover:bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // getting the env data of the api

  const baseURL = import.meta.env.VITE_API_URL;



  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const updatePayload = {
        ...updates,
      };
      console.log("Updating client with ID:", id);
      console.log("this is the updateclient data", updatePayload);
      const result = await axios.patch(
        `${baseURL}/clients/${id}`,
        updatePayload,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("This is the updating data sending to database", result.data);
      refetchClients(); // refresh the list after successful update
      // const updatedClients = clients.map((client) =>
      //   client.id === id ? { ...client, ...updates } : client
      // );
      // onUpdate(updatedClients);
      toast({
        title: "✅ Client Updated",
        description: "The  Client  has been Updated.",
      });
    } catch (error) {
      console.log("thiere is error in updating", error);
      toast({
        variant: "destructive",
        title: "❌ Error",
        description:
          error?.response?.data?.message ||
          "Failed to Update  the Client . Please try again.",
      });
    }
  };
  console.log("saving client", editingClient, editFormData);
  console.log("Follow Up  client", sendFollowUpDialog, followupData);

  const validateClientData = (updates: Partial<Client>): boolean => {
    console.log("Validating:", updates);

    if (!updates.name || updates.name.trim() === "") {
      toast({
        variant: "destructive",
        title: "❌ Validation Error",
        description: "Name cannot be empty.",
      });
      return false;
    }

    if (
      updates.email !== undefined &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)
    ) {
      toast({
        variant: "destructive",
        title: "❌ Validation Error",
        description: "Please enter a valid email address.",
      });
      return false;
    }

    if (
      updates.mobileNo !== undefined &&
      !/^\+?[0-9]{7,15}$/.test(updates.mobileNo)
    ) {
      toast({
        variant: "destructive",
        title: "❌ Validation Error",
        description: "Please enter a valid mobileNo.",
      });
      return false;
    }

    if (!updates.contactPerson || updates.contactPerson.trim() === "") {
      toast({
        variant: "destructive",
        title: "❌ Validation Error",
        description: "Contact Person cannot be empty.",
      });
      return false;
    }

    return true;
  };

  const updateClientEdit = async (id: string, updates: Partial<Client>) => {
    if (!validateClientData(updates)) {
      return false; // validation failed, don't update
    }
    try {
      const updatePayload = {
        ...updates,
      };
      console.log("Updating client with ID:", id);
      console.log("this is the updateclient data", updatePayload);
      const result = await axios.patch(
        `${baseURL}/clients/${id}`,
        updatePayload,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("This is the updating data sending to database", result.data);
      refetchClients(); // refresh the list after successful update
      // const updatedClients = clients.map((client) =>
      //   client.id === id ? { ...client, ...updates } : client
      // );
      // onUpdate(updatedClients);
      toast({
        title: "✅ Client Updated",
        description: "The  Client  Edit Successfully has been Updated.",
      });
      return true; // update success
    } catch (error) {
      console.log("thiere is error in updating", error);
      toast({
        variant: "destructive",
        title: "❌ Error",
        description:
          error?.response?.data?.message ||
          "Failed to Update  the Client Data . Please try again.",
      });
      return false; // update failed
    }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (editingClient) {
      const success = await updateClientEdit(editingClient, editFormData);
      if (success) {
        // updateClient(editingClient, editFormData);
        updateClientEdit(editingClient, editFormData);
        setEditingClient(null);
        setEditFormData({});
        setEditUps(null);
      }
      // else: do NOT clear form — user can fix validation errors
    }
  };

  // // followup ka update
  // const updateClientFollowUp = async (id: string, updates: Partial<Client>) => {
  //   try {
  //     // const updatePayload = {
  //     //   ...updates,
  //     // };

  //     const clientResponse = await axios.get(`${baseURL}/clients/${id}`);
  //     const serverFollowups = clientResponse.data.followups || [];
  //     // // ✅ Sort followups by date DESC (newest first)
  //     // const sortedFollowups = [...serverFollowups].sort(
  //     //   (a, b) =>
  //     //     new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
  //     // );

  //     // // ✅ Extract next and last followup
  //     // const nextFollowup = sortedFollowups[0]?.datetime || null;
  //     // const lastFollowup =
  //     //   sortedFollowups[1]?.datetime || sortedFollowups[0]?.datetime || null;

  //     //   console.log('the sorted order of followup is',sortedFollowups)
  //     //   console.log('The last followup and next followup is ',lastFollowup,nextFollowup)

  //     // const updatePayload = {
  //     //   ...updates,
  //     //   lastFollowup,
  //     //   nextFollowup,
  //     // };

  //     // new 
  //     // ✅ Merge new followups (from updates) with existing ones
  //     const incomingFollowups = updates.followups || [];
  //     const allFollowups = [...serverFollowups, ...incomingFollowups];

  //     // ✅ Sort by datetime ascending (earliest to latest)
  //     const sortedFollowups = [...allFollowups].sort(
  //       (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
  //     );

  //     const now = new Date();

  //     // ✅ Get upcoming and past followups
  //     const futureFollowups = sortedFollowups.filter(
  //       (f) => new Date(f.datetime) > now
  //     );
  //     const pastFollowups = sortedFollowups.filter(
  //       (f) => new Date(f.datetime) <= now
  //     );

  //     // ✅ Extract next and last followup
  //     const nextFollowup = futureFollowups[0]?.datetime || null;
  //     const lastFollowup = pastFollowups[pastFollowups.length - 1]?.datetime || null;

  //     const updatePayload = {
  //       ...updates,
  //       followups: allFollowups, // Ensure the full updated list is sent
  //       nextFollowup,
  //       lastFollowup,
  //     };

  //     console.log("Updating client with ID:", id);
  //     console.log("this is the updateclient data", updatePayload);
  //     const result = await axios.patch(
  //       `${baseURL}/clients/${id}`,
  //       updatePayload,
  //       { headers: { "Content-Type": "application/json" } }
  //     );

  //     console.log("This is the updating data sending to database", result.data);
  //     refetchClients(); // refresh the list after successful update
  //     // const updatedClients = clients.map((client) =>
  //     //   client.id === id ? { ...client, ...updates } : client
  //     // );
  //     // onUpdate(updatedClients);
  //     toast({
  //       title: "✅ Client FollowUp is added",
  //       description: "The  Client Followup  has been added.",
  //     });
  //   } catch (error) {
  //     console.log("thiere is error in updating", error);
  //     toast({
  //       variant: "destructive",
  //       title: "❌ Error",
  //       description:
  //         error?.response?.data?.message ||
  //         "Failed to Update  the Client Followup . Please try again.",
  //     });
  //   }
  // };


const sentTheFollowup = async (
    clientId: string,
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
    const selectedDate = new Date(data.datetime);
    const now = new Date();

    if (selectedDate.getTime() <= now.getTime()) {
      toast({
        title: "Invalid Date/Time",
        description: "Follow Up time cannot be in the past.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Sending followup for Clients:", clientId);
      console.log("Followup Description:", data.description);
      console.log("Send DateTime:", data.datetime);
      console.log(
        "Raw Followup date Send Clients Description Updatelist of Project (local):",
        data.datetime
      );
      console.log(
        "Update followupdate Send Clients Description in list of Project",
        data.datetime
      );
      const utcDateStr = new Date(data.datetime).toISOString();
      const existingClient = await axios.get(
        `${baseURL}/clients/${clientId}`
      );

      const existingClientData = existingClient.data;
      const existingFollowups = existingClientData?.followups || [];

      // ⚠️ OPTIONAL STRICT SEQUENCING CHECK:
      // Check if there are any *existing* incomplete future follow-ups. If so, block the new one.
      const hasPendingFollowup = existingFollowups.some(f =>
        !f.completed && new Date(f.datetime).getTime() > new Date().getTime()
      );

      if (hasPendingFollowup) {
        toast({
          title: "Cannot Schedule New Follow-up",
          description: "You must complete the existing upcoming follow-up before scheduling a new one.",
          variant: "destructive",
        });
        return; // Uncomment this line if you want to strictly enforce sequencing
      }
      
      const newFollowup = {
        id: Date.now(),
        description: data.description,
        datetime: utcDateStr,
        completed: false,
      };

      const updatedFollowups = [...existingFollowups, newFollowup];

      // ✅ NEW LOGIC to find the NEXT (earliest) follow-up date
      const currentTimeMs = now.getTime();

      // 1. Filter for all INCOMPLETE follow-ups that are in the FUTURE
      const futureIncompleteFollowups = updatedFollowups.filter(f =>
        !f.completed && new Date(f.datetime).getTime() > currentTimeMs
      );

      // 2. Sort them ASCENDING (earliest date first)
      const sortedFutureIncomplete = [...futureIncompleteFollowups].sort(
        (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
      );

      // 3. Extract the two earliest dates
      const nextFollowUpDate = sortedFutureIncomplete[0]?.datetime || null;

      // Filter: Keep follow-ups that are EITHER completed OR whose date/time has passed.
      const pastOrCompletedFollowups = updatedFollowups.filter(f =>
        f.completed || new Date(f.datetime).getTime() <= currentTimeMs
      );

      // Sort them DESCENDING (latest date first)
      const sortedPastOrCompleted = [...pastOrCompletedFollowups].sort(
        (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
      );

      // The most recent one is at index 0
      const lastFollowUpDate = sortedPastOrCompleted[0]?.datetime || null;

      const payload = {
        followups: updatedFollowups,
        actionDetails: {
          followUpDate: nextFollowUpDate,       // Next upcoming date
          lastfollowUpDate: lastFollowUpDate,   // Last completed or passed date
        },
      };

      // ... (API patch, success handling, and state cleanup logic remains the same)
      const result = await axios.patch(
        `${baseURL}/clients/${clientId}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      const response = await axios.get(`${baseURL}/clients`);
      onUpdate(response.data.data);

      setSendFollowUpDialog(null);
      setFollowupData({ description: "", datetime: "" });
      refetchClients();
      toast({
        title: "Follow Up Added",
        description: `Followup description is addedd in Job profile `,
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
  
  // chat ka update
  const updateClientChat = async (id: string, updates: Partial<Client>) => {
    try {
      const updatePayload = {
        ...updates,
      };
      console.log("Updating client with ID:", id);
      console.log("this is the updateclient data", updatePayload);
      const result = await axios.patch(
        `${baseURL}/clients/${id}`,
        updatePayload,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("This is the updating data sending to database", result.data);
      refetchClients(); // refresh the list after successful update
      // const updatedClients = clients.map((client) =>
      //   client.id === id ? { ...client, ...updates } : client
      // );
      // onUpdate(updatedClients);
      toast({
        title: "✅ Client Chat is added",
        description: "The  Client Chat  has been added.",
      });
    } catch (error) {
      console.log("thiere is error in updating", error);
      toast({
        variant: "destructive",
        title: "❌ Error",
        description:
          error?.response?.data?.message ||
          "Failed to Update  the Client Chat . Please try again.",
      });
    }
  };
  const addChatMessage = (e, clientId: string) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      const newMsg = {
        id: Date.now(),
        message: newMessage,
        timestamp: new Date().toISOString(),
      };
      const messages = client.chatMessages || [];
      // updateClient(clientId, {
      //   chatMessages: [...messages, newMsg],
      //   conversations: (client.conversations || 0) + 1,
      // });
      updateClientChat(clientId, {
        chatMessages: [...messages, newMsg],
        conversations: (client.conversations || 0) + 1,
      });
      //setChatUps(null);   // remove this line to keep dialog open
      setNewMessage("");
    }
  };

  // Payement ka update
  const updateClientPayement = async (id: string, updates: Partial<Client>) => {
    try {
      const updatePayload = {
        ...updates,
      };
      console.log("Updating client with ID:", id);
      console.log("this is the updateclient data", updatePayload);
      const result = await axios.patch(
        `${baseURL}/clients/${id}`,
        updatePayload,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("This is the updating data sending to database", result.data);
      refetchClients(); // refresh the list after successful update
      // const updatedClients = clients.map((client) =>
      //   client.id === id ? { ...client, ...updates } : client
      // );
      // onUpdate(updatedClients);
      toast({
        title: "✅ Client Payement is added",
        description: "The  Client Payement  has been added.",
      });
    } catch (error) {
      console.log("thiere is error in updating", error);
      toast({
        variant: "destructive",
        title: "❌ Error",
        description:
          error?.response?.data?.message ||
          "Failed to Update  the Client Payement . Please try again.",
      });
    }
  };
  const updatePaymentStatus = (e, clientId: string) => {
    e.preventDefault();
    // Determine the correct payment status based on amounts
    const newStatus =
      paymentData.totalAmount === paymentData.paidAmount
        ? "Paid"
        : paymentData.status;
    // updateClient(clientId, {
    //   // paymentStatus: paymentData.status,
    //   paymentStatus: newStatus,
    //   totalAmount: paymentData.totalAmount,
    //   paidAmount: paymentData.paidAmount,
    // });
    updateClientPayement(clientId, {
      // paymentStatus: paymentData.status,
      paymentStatus: newStatus,
      totalAmount: paymentData.totalAmount,
      paidAmount: paymentData.paidAmount,
    });
    setPaymentDialog(null);
    setPaymentData({ status: "", totalAmount: 0, paidAmount: 0 });
  };

  const closeClient = async (id: string) => {
    try {
      await axios.patch(
        `${baseURL}/clients/${id}`,
        { status: "Inactive" },
        { headers: { "Content-Type": "application/json" } }
      );

      // Fetch the latest profiles from the backend
      const response = await axios.get(
        `${baseURL}/clients`,
      );
      onUpdate(response.data.data); // Update UI with fresh data
      console.log("Job status updated to Closed", response.data.data);
      toast({
        title: "Job Closed",
        description: "The job has been closed successfully.",
      });
    } catch (error) {
      console.error("Error updating job status:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const groupMessagesByDate = (
    messages: { id: number; message: string; timestamp: string }[]
  ) => {
    const grouped: {
      [key: string]: { id: number; message: string; timestamp: string }[];
    } = {};
    messages.forEach((msg) => {
      const date = new Date(msg.timestamp).toDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(msg);
    });
    return grouped;
  };

  const sortClientTimeBase = [...clients];

  sortClientTimeBase.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();

    return dateB - dateA; //this will return newest first if
  });

  console.log(
    "this is the sorted client on the baisi of the created",
    sortClientTimeBase
  );

  return (
    <div className="space-y-6">
      {/* {clients.map((client) => { */}

      {/* this will return the user on the baisi of sorting */}
      {sortClientTimeBase.map((client) => {
        const groupedMessages = groupMessagesByDate(client.chatMessages || []);
        const statusStr =
          typeof client.status === "boolean"
            ? client.status
              ? "Active"
              : "Pending"
            : client.status;

        return (
          <div
            key={client.id}
            className="border-0 rounded-xl p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-200 border-l-4 border-l-blue-500"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {client.name}
                  </h3>
                  {/* <h3 className="text-xl font-bold text-gray-900">{client.id}</h3> */}

                  <div className="flex gap-2">
                    <Badge
                      className={`${getStatusColor(
                        client.status
                      )} px-3 py-1 font-medium border`}
                    >
                      Client: {client.status}
                    </Badge>
                    <Badge
                      className={`${getPaymentColor(
                        client.paymentStatus
                      )} px-3 py-1 font-medium border`}
                    >
                      Payment: {client.paymentStatus}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-semibold text-gray-900">
                      Contact Person
                    </p>
                    {/* <p>{client.contactPerson}</p> */}
                    <p>{(client.contactPerson && client.contactPerson.trim()) || (client.name && client.name.trim()) || "N/A"}</p>

                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-semibold text-gray-900">Email</p>
                    <p className="truncate">{client.email}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-semibold text-gray-900">Phone</p>
                    <p>
                      {/* {" "}
                      {client.countryCode} {client.mobileNo || client.phone} */}{" "}
                      {client.countryCode} {client.mobileNo}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-semibold text-gray-900">
                      Next Follow-up
                    </p>
                    <p className="font-medium text-blue-600">
                      {/* {new Date(client.nextFollowup).toLocaleDateString()} */}
                      {client?.actionDetails?.followUpDate ? new Date(client.actionDetails.followUpDate).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-semibold text-gray-900">Company Name</p>
                    <p className="truncate">{(client.company && client.company.trim()) || "N/A"}</p>
                  </div>
                </div>

                {client.paymentStatus === "Partial" &&
                  client.totalAmount &&
                  client.paidAmount && (
                    <div className="bg-blue-50 p-3 rounded-lg mb-4">
                      <p className="text-sm font-medium text-blue-900">
                        Payment Progress
                      </p>
                      <div className="flex justify-between text-sm text-blue-700 mt-1">
                        <span>Paid: {formatCurrency(client.paidAmount)}</span>
                        <span>
                          Remaining:{" "}
                          {formatCurrency(
                            client.totalAmount - client.paidAmount
                          )}
                        </span>
                        <span>Total: {formatCurrency(client.totalAmount)}</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(client.paidAmount / client.totalAmount) * 100
                              }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
              </div>

              <div className="flex flex-col gap-3 ml-6">
                {client.status !== "Inactive" && (
                  <>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(client)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>

                      {/* old dialog or followupd data  */}

                      {/* <Dialog
                    open={followUps === client.id}
                    onOpenChange={(open) =>
                      setFollowUps(open ? client.id : null)
                    }
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-200 text-green-700 hover:bg-green-50"
                        onClick={() => {
                          setFollowUps(client.id);
                          setFollowupData({ description: "", datetime: "" }); // reset the data
                        }}
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Follow-up
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-900">
                          Schedule Follow-up
                        </DialogTitle>
                        <DialogDescription>
                          Set a reminder and message for your next client
                          interaction.
                        </DialogDescription>
                      </DialogHeader>
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
                          onClick={(e) => addFollowup(e, client.id)}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          Schedule Follow-up
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog> */}

                      {/* new followup data */}

                      <Dialog
                        open={sendFollowUpDialog === client.id}
                        onOpenChange={(open) => {
                          setSendFollowUpDialog(open ? client.id : null);
                          setActiveTab("new"); // Reset tab when dialog opens
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline" // add this to get outline style
                            className="border-green-200 text-green-700 hover:bg-green-50" // green outline and text
                            onClick={() => {
                              setSendFollowUpDialog(client.id);
                              setFollowupData({
                                description: "",
                                datetime: "",
                              });
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
                                  sentTheFollowup(client.id, followupData)
                                }
                                className="w-full bg-blue-600 hover:bg-blue-700"
                              >
                                Schedule Follow-up
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                              {client.followups &&
                                client.followups.length > 0 ? (
                                client.followups
                                  .slice()
                                  .reverse()
                                  .map((fu, index) => (
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

                      {/* Delete client dialog box */}
                      <Dialog
                        open={confirmCloseClientId === client.id}
                        onOpenChange={(open) =>
                          setConfirmCloseClientId(open ? client.id : null)
                        }
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setConfirmCloseClientId(client.id)}
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
                            Are you sure you want to remove this Client? This action
                            cannot be undone.
                          </div>

                          <div className="flex justify-end gap-2 pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setConfirmCloseClientId(null)}
                            >
                              ❌ Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => {
                                closeClient(client.id);
                                setConfirmCloseClientId(null);
                              }}
                            >
                              ✅ Yes, Close
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="flex gap-2">
                      <Dialog
                        open={chatUps === client.id}
                        onOpenChange={(open) => setChatUps(open ? client.id : null)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-purple-200 text-purple-700 hover:bg-purple-50"
                            onClick={() => setChatUps(client.id)}
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Inbox  ({client.conversations || 0})
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-gray-900">
                              Chat History - {client.name}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="flex-1 overflow-hidden flex flex-col">
                            <div className="flex-1 overflow-y-auto border rounded-lg p-4 space-y-4 bg-gray-50">
                              {Object.keys(groupedMessages).length === 0 ? (
                                <p className="text-gray-500 text-center py-8">
                                  No messages yet. Start a conversation!
                                </p>
                              ) : (
                                Object.entries(groupedMessages).map(
                                  ([date, messages]) => (
                                    <div key={date} className="space-y-2">
                                      <div className="text-center">
                                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                                          {date}
                                        </span>
                                      </div>
                                      {messages.map((msg) => (
                                        <div
                                          key={msg.id}
                                          className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-l-blue-400"
                                        >
                                          <p className="text-sm text-gray-800">
                                            {msg.message}
                                          </p>
                                          <p className="text-xs text-gray-500 mt-1">
                                            {new Date(
                                              msg.timestamp
                                            ).toLocaleTimeString()}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  )
                                )
                              )}
                            </div>
                            <div className="flex gap-2 mt-4">
                              <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Enter your message about this client..."
                                onKeyPress={(e) =>
                                  e.key === "Enter" && addChatMessage(e, client.id)
                                }
                                className="flex-1"
                              />
                              <Button
                                onClick={(e) => addChatMessage(e, client.id)}
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                Send
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog
                        open={paymentDialog === client.id}
                        onOpenChange={(open) =>
                          setPaymentDialog(open ? client.id : null)
                        }
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-orange-200 text-orange-700 hover:bg-orange-50"
                            onClick={() => {
                              setPaymentDialog(client.id);
                              setPaymentData({
                                status: client.paymentStatus,
                                totalAmount: client.totalAmount || 0,
                                paidAmount: client.paidAmount || 0,
                              });
                            }}
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            Payment
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-gray-900">
                              Update Payment Status
                            </DialogTitle>
                            <DialogDescription>
                              Modify the payment status and financial details for
                              this client.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-700">
                                Payment Status
                              </Label>
                              <Select
                                value={paymentData.status}
                                onValueChange={(value) =>
                                  setPaymentData((prev) => ({
                                    ...prev,
                                    status: value,
                                  }))
                                }
                              >
                                <SelectTrigger className="w-full mt-1">
                                  <SelectValue placeholder="Select payment status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pending">Pending</SelectItem>
                                  <SelectItem value="Partial">Partial</SelectItem>
                                  <SelectItem value="Paid">Paid</SelectItem>
                                  <SelectItem value="Overdue">Overdue</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {paymentData.status === "Partial" && (
                              <>
                                <div>
                                  <Label className="text-sm font-medium text-gray-700">
                                    Total Amount (₹)
                                  </Label>
                                  <Input
                                    type="number"
                                    value={paymentData.totalAmount}
                                    onChange={(e) =>
                                      setPaymentData((prev) => ({
                                        ...prev,
                                        totalAmount: Number(e.target.value),
                                      }))
                                    }
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-700">
                                    Paid Amount (₹)
                                  </Label>
                                  <Input
                                    type="number"
                                    value={paymentData.paidAmount}
                                    // onChange={(e) =>
                                    //   setPaymentData((prev) => ({
                                    //     ...prev,
                                    //     paidAmount: Number(e.target.value),
                                    //   }))
                                    // }
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      if (val <= paymentData.totalAmount) {
                                        setPaymentData((prev) => ({
                                          ...prev,
                                          paidAmount: val,
                                        }));
                                      } else {
                                        toast({
                                          variant: "destructive",
                                          title: "❌ Invalid Amount",
                                          description:
                                            "Paid amount cannot exceed total amount.",
                                        });
                                      }
                                    }}
                                    className="mt-1"
                                  />
                                </div>
                              </>
                            )}

                            <Button
                              onClick={(e) => updatePaymentStatus(e, client.id)}
                              className="w-full bg-orange-600 hover:bg-orange-700"
                            >
                              Update Payment Status
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </>
                )}
              </div>
            </div>
            {client?.notes && (
              <div className="border-t pt-4">
                <p className="font-medium text-gray-900 mb-2">Notes & Comments</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {client?.notes}
                </p>
              </div>
            )}
          </div>
        );
      })}


    </div>
  );
};
