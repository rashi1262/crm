import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Calendar,
  DollarSign,
  MessageCircle,
  CreditCard,
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

interface ClientListProps {
  clients: Client[];
  onUpdate: (clients: Client[]) => void;
  refetchClients: () => void; // Add this line
}

export const ClientList = ({
  clients,
  onUpdate,
  refetchClients,
}: ClientListProps) => {
  // const [editingClient, setEditingClient] = useState<number | null>(null);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Client>>({});
  const [followupData, setFollowupData] = useState({
    description: "",
    datetime: "",
  });
  const [newMessage, setNewMessage] = useState("");
  const [paymentDialog, setPaymentDialog] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState({
    status: "",
    totalAmount: 0,
    paidAmount: 0,
  });
  const [editUps, setEditUps] = useState<string | null>(null); //store the client.id for the edit
  const [followUps, setFollowUps] = useState<string | null>(null); // store client.id
  const [chatUps, setChatUps] = useState<string | null>(null); //store the client.id for the chat purpose
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");

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

  //  old api `https://api.vidhema.com/clients/${id}`,

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
  console.log("Follow Up  client", followUps, followupData);

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

  // followup ka update
  const updateClientFollowUp = async (id: string, updates: Partial<Client>) => {
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
        title: "✅ Client FollowUp is added",
        description: "The  Client Followup  has been added.",
      });
    } catch (error) {
      console.log("thiere is error in updating", error);
      toast({
        variant: "destructive",
        title: "❌ Error",
        description:
          error?.response?.data?.message ||
          "Failed to Update  the Client Followup . Please try again.",
      });
    }
  };

  const validateFollowUpData = (): boolean => {
  if (!followupData.description.trim()) {
    toast({
      variant: "destructive",
      title: "❌ Validation Error",
      description: "Follow-up description cannot be empty.",
    });
    return false;
  }

  if (!followupData.datetime) {
    toast({
      variant: "destructive",
      title: "❌ Validation Error",
      description: "Please select a valid follow-up date and time.",
    });
    return false;
  }

  return true;
};

  const addFollowup = (e, clientId: string) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === clientId);
      if (!client) return;

  if (!validateFollowUpData()) return; // 🔐 Stop if validation fails
    if (client && followupData.description && followupData.datetime) {
      const newFollowup = {
        id: Date.now(),
        description: followupData.description,
        datetime: followupData.datetime,
        completed: false,
      };
      const followups = client.followups || [];
      // updateClient(clientId, {
      //   followups: [...followups, newFollowup],
      //   nextFollowup: followupData.datetime.split("T")[0],
      // });
      updateClientFollowUp(clientId, {
        followups: [...followups, newFollowup],
        nextFollowup: followupData.datetime.split("T")[0],
      });
      setFollowUps(null);
      setFollowupData({ description: "", datetime: "" });
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
                    <p>{client.contactPerson || "N/A"}</p>
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
                      {new Date(client.nextFollowup).toLocaleDateString()}
                    </p>
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
                            width: `${
                              (client.paidAmount / client.totalAmount) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
              </div>

              <div className="flex flex-col gap-3 ml-6">
                <div className="flex gap-2">
                  <Dialog
                    open={editUps === client.id}
                    onOpenChange={(open) => setEditUps(open ? client.id : null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                        onClick={() => {
                          setEditUps(client.id);
                          setEditingClient(client.id);
                          setEditFormData(client);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-900">
                          Edit Client Details
                        </DialogTitle>
                        <DialogDescription>
                          Make changes to the clients information below.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Client Name
                          </Label>
                          <Input
                            value={editFormData.name || ""}
                            onChange={(e) =>
                              setEditFormData((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Contact Person
                          </Label>
                          <Input
                            value={editFormData.contactPerson || ""}
                            onChange={(e) =>
                              setEditFormData((prev) => ({
                                ...prev,
                                contactPerson: e.target.value,
                              }))
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Email
                          </Label>
                          <Input
                            value={editFormData.email || ""}
                            onChange={(e) =>
                              setEditFormData((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Phone
                          </Label>
                          <Input
                            // value={
                            //   editFormData.phone || editFormData.mobileNo || ""
                            // }
                            value={editFormData.mobileNo || ""}
                            onChange={(e) =>
                              setEditFormData((prev) => ({
                                ...prev,
                                // phone: e.target.value,
                                mobileNo: e.target.value,
                              }))
                            }
                            className="mt-1"
                          />
                        </div>
                        {/* adding the status filed */}
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Status
                          </Label>

                          <Select
                            value={editFormData.status}
                            onValueChange={(value) =>
                              setEditFormData((prev) => ({
                                ...prev,
                                status: value,
                              }))
                            }
                          >
                            <SelectTrigger className="w-full mt-1">
                              <SelectValue placeholder="Select payment status" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-gray-200 shadow-lg">
                              <SelectItem value="Active">✅ Active</SelectItem>
                              <SelectItem value="Pending">
                                ⏳ Pending
                              </SelectItem>
                              <SelectItem value="Inactive">
                                ❌ Inactive
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          onClick={saveEdit}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          Save Changes
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

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
                    open={followUps === client.id}
                    onOpenChange={(open) => {
                      setFollowUps(open ? client.id : null);
                      setActiveTab("new"); // Reset to "new" tab on open
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-200 text-green-700 hover:bg-green-50"
                        onClick={() => {
                          setFollowUps(client.id);
                          setFollowupData({ description: "", datetime: "" }); // Reset
                        }}
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Follow-up
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

                      {/* Tab Toggle Buttons */}
                      <div className="flex gap-2 my-4">
                        <Button
                          variant={activeTab === "new" ? "default" : "outline"}
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

                      {/* Conditional Tabs */}
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
                            onClick={(e) => addFollowup(e, client.id)}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            Schedule Follow-up
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                          {client.followups && client.followups.length > 0 ? (
                            client.followups.map((fu, index) => (
                              <div
                                key={index}
                                className="border rounded-md p-3 text-sm text-gray-700 bg-gray-50"
                              >
                                <p className="font-medium">{fu.description}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(fu.datetime).toLocaleString()}
                                </p>
                                {/* <p
                                  className={`text-xs mt-1 font-medium ${
                                    fu.completed
                                      ? "text-green-600"
                                      : "text-yellow-600"
                                  }`}
                                >
                                  {fu.completed ? "Completed" : "Pending"}
                                </p> */}
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
                        Chat ({client.conversations || 0})
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
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
