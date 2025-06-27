
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Calendar, DollarSign, MessageCircle, CreditCard } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Client {
  id: number;
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
  followups: { id: number; description: string; datetime: string; completed: boolean }[];
}

interface ClientListProps {
  clients: Client[];
  onUpdate: (clients: Client[]) => void;
}

export const ClientList = ({ clients, onUpdate }: ClientListProps) => {
  const [editingClient, setEditingClient] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Client>>({});
  const [followupData, setFollowupData] = useState({ description: "", datetime: "" });
  const [newMessage, setNewMessage] = useState("");
  const [paymentDialog, setPaymentDialog] = useState<number | null>(null);
  const [paymentData, setPaymentData] = useState({ status: "", totalAmount: 0, paidAmount: 0 });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800 border-green-200";
      case "Pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Inactive": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Pending": return "bg-red-100 text-red-800 border-red-200";
      case "Partial": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Overdue": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const updateClient = (id: number, updates: Partial<Client>) => {
    const updatedClients = clients.map(client =>
      client.id === id ? { ...client, ...updates } : client
    );
    onUpdate(updatedClients);
  };

  const saveEdit = () => {
    if (editingClient) {
      updateClient(editingClient, editFormData);
      setEditingClient(null);
      setEditFormData({});
    }
  };

  const addFollowup = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    if (client && followupData.description && followupData.datetime) {
      const newFollowup = {
        id: Date.now(),
        description: followupData.description,
        datetime: followupData.datetime,
        completed: false
      };
      const followups = client.followups || [];
      updateClient(clientId, { 
        followups: [...followups, newFollowup],
        nextFollowup: followupData.datetime.split('T')[0]
      });
      setFollowupData({ description: "", datetime: "" });
    }
  };

  const addChatMessage = (clientId: number) => {
    if (!newMessage.trim()) return;
    const client = clients.find(c => c.id === clientId);
    if (client) {
      const newMsg = {
        id: Date.now(),
        message: newMessage,
        timestamp: new Date().toISOString()
      };
      const messages = client.chatMessages || [];
      updateClient(clientId, { 
        chatMessages: [...messages, newMsg],
        conversations: (client.conversations || 0) + 1
      });
      setNewMessage("");
    }
  };

  const updatePaymentStatus = (clientId: number) => {
    updateClient(clientId, {
      paymentStatus: paymentData.status,
      totalAmount: paymentData.totalAmount,
      paidAmount: paymentData.paidAmount
    });
    setPaymentDialog(null);
    setPaymentData({ status: "", totalAmount: 0, paidAmount: 0 });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const groupMessagesByDate = (messages: { id: number; message: string; timestamp: string }[]) => {
    const grouped: { [key: string]: { id: number; message: string; timestamp: string }[] } = {};
    messages.forEach(msg => {
      const date = new Date(msg.timestamp).toDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(msg);
    });
    return grouped;
  };

  return (
    <div className="space-y-6">
      {clients.map((client) => {
        const groupedMessages = groupMessagesByDate(client.chatMessages || []);
        
        return (
          <div key={client.id} className="border-0 rounded-xl p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-200 border-l-4 border-l-blue-500">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{client.name}</h3>
                  <div className="flex gap-2">
                    <Badge className={`${getStatusColor(client.status)} px-3 py-1 font-medium border`}>
                      Client: {client.status}
                    </Badge>
                    <Badge className={`${getPaymentColor(client.paymentStatus)} px-3 py-1 font-medium border`}>
                      Payment: {client.paymentStatus}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-semibold text-gray-900">Contact Person</p>
                    <p>{client.contactPerson}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-semibold text-gray-900">Email</p>
                    <p className="truncate">{client.email}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-semibold text-gray-900">Phone</p>
                    <p>{client.phone}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-semibold text-gray-900">Next Follow-up</p>
                    <p className="font-medium text-blue-600">{new Date(client.nextFollowup).toLocaleDateString()}</p>
                  </div>
                </div>

                {client.paymentStatus === "Partial" && client.totalAmount && client.paidAmount && (
                  <div className="bg-blue-50 p-3 rounded-lg mb-4">
                    <p className="text-sm font-medium text-blue-900">Payment Progress</p>
                    <div className="flex justify-between text-sm text-blue-700 mt-1">
                      <span>Paid: {formatCurrency(client.paidAmount)}</span>
                      <span>Remaining: {formatCurrency(client.totalAmount - client.paidAmount)}</span>
                      <span>Total: {formatCurrency(client.totalAmount)}</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(client.paidAmount / client.totalAmount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 ml-6">
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                        onClick={() => {
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
                        <DialogTitle className="text-xl font-bold text-gray-900">Edit Client Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Client Name</Label>
                          <Input
                            value={editFormData.name || ""}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Contact Person</Label>
                          <Input
                            value={editFormData.contactPerson || ""}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Email</Label>
                          <Input
                            value={editFormData.email || ""}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Phone</Label>
                          <Input
                            value={editFormData.phone || ""}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <Button onClick={saveEdit} className="w-full bg-blue-600 hover:bg-blue-700">
                          Save Changes
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                        <Calendar className="h-4 w-4 mr-1" />
                        Follow-up
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-900">Schedule Follow-up</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Follow-up Description</Label>
                          <Textarea
                            value={followupData.description}
                            onChange={(e) => setFollowupData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe the purpose of this follow-up..."
                            className="mt-1 min-h-[80px]"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Date & Time</Label>
                          <Input
                            type="datetime-local"
                            value={followupData.datetime}
                            onChange={(e) => setFollowupData(prev => ({ ...prev, datetime: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <Button onClick={() => addFollowup(client.id)} className="w-full bg-green-600 hover:bg-green-700">
                          Schedule Follow-up
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Chat ({client.conversations})
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-900">Chat History - {client.name}</DialogTitle>
                      </DialogHeader>
                      <div className="flex-1 overflow-hidden flex flex-col">
                        <div className="flex-1 overflow-y-auto border rounded-lg p-4 space-y-4 bg-gray-50">
                          {Object.keys(groupedMessages).length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No messages yet. Start a conversation!</p>
                          ) : (
                            Object.entries(groupedMessages).map(([date, messages]) => (
                              <div key={date} className="space-y-2">
                                <div className="text-center">
                                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                                    {date}
                                  </span>
                                </div>
                                {messages.map((msg) => (
                                  <div key={msg.id} className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-l-blue-400">
                                    <p className="text-sm text-gray-800">{msg.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {new Date(msg.timestamp).toLocaleTimeString()}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ))
                          )}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Enter your message about this client..."
                            onKeyPress={(e) => e.key === 'Enter' && addChatMessage(client.id)}
                            className="flex-1"
                          />
                          <Button onClick={() => addChatMessage(client.id)} className="bg-purple-600 hover:bg-purple-700">
                            Send
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
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
                            paidAmount: client.paidAmount || 0
                          });
                        }}
                      >
                        <CreditCard className="h-4 w-4 mr-1" />
                        Payment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-900">Update Payment Status</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Payment Status</Label>
                          <Select value={paymentData.status} onValueChange={(value) => setPaymentData(prev => ({ ...prev, status: value }))}>
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
                              <Label className="text-sm font-medium text-gray-700">Total Amount ($)</Label>
                              <Input
                                type="number"
                                value={paymentData.totalAmount}
                                onChange={(e) => setPaymentData(prev => ({ ...prev, totalAmount: Number(e.target.value) }))}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Paid Amount ($)</Label>
                              <Input
                                type="number"
                                value={paymentData.paidAmount}
                                onChange={(e) => setPaymentData(prev => ({ ...prev, paidAmount: Number(e.target.value) }))}
                                className="mt-1"
                              />
                            </div>
                          </>
                        )}
                        
                        <Button onClick={() => updatePaymentStatus(client.id)} className="w-full bg-orange-600 hover:bg-orange-700">
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
