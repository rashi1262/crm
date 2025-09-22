import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
    Eye,
    Search,
    Plus,
    Edit,
    Trash2,
    User,
    Calendar,
    MessageSquare,
    UserCheck,
    Phone,
    Mail,
    Building
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
const baseURL = import.meta.env.VITE_API_URL;

interface FollowUp {
    _id: string;
    clientId?: { _id: string; name: string }; // populated object
    contactPersonId?: { _id: string; fullName: string };
    followUpDate: string;
    message: string;
    status: string;
    createdAt: string;
    googleMeetLink?: string;
}

export default function AddFollowUps() {
    const { toast } = useToast();
    const [followUps, setFollowUps] = useState<FollowUp[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUp | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterStatus, setFilterStatus] = useState("all");
    console.log(users, " users state");

    // ✅ Form state
    const [formData, setFormData] = useState({
        clientId: "",
        contactPersonId: "",
        followUpDate: "",
        message: "",
        status: "pending",
        googleMeetLink: "",
    });

    // ✅ Fetch Meetings from backend
    const fetchFollowUps = async () => {
        try {
            const res = await axios.get(baseURL + `/newfollowups`, {
                params: {
                    filter: JSON.stringify({
                        skip: (currentPage - 1) * 10,
                        limit: 10,
                        include: ["clientId", "contactPersonId"], // ✅ populate
                        where: filterStatus !== "all" ? { status: filterStatus } : {},
                    }),
                },
            });
            setFollowUps(res.data.data);
            setTotalPages(res.data.pagination.totalPages);
        } catch (err) {
            console.error("Error fetching followups", err);
        }
    };

    useEffect(() => {
        fetchFollowUps();
    }, [currentPage, filterStatus]);

    useEffect(() => {
        axios.get(baseURL + "/clients").
            then((res) => {
                setClients(res.data.data)
                console.log("clients", res);
            });
        axios.get("https://api.vidhema.com/getAdminUsers")
            .then((res) => {
                setUsers(res.data)
                console.log("users: ", res);
            });

    }, []);


    const getContactPersonName = (id: string | undefined) => {
        if (!id) return "—";
        const person = users.find((u) => u._id === id);
        return person ? person.fullName : "—";
    };


    // ✅ Add or Update FollowUp
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditMode && selectedFollowUp) {
                await axios.put(baseURL + `/newfollowups/${selectedFollowUp._id}`, formData);
            } else {
                await axios.post(baseURL + `/newfollowups`, formData);
            }

            // ✅ Delete token in backend after saving Meeting
            await axios.get(`${baseURL}/calendar/logout`);

            fetchFollowUps();
            setIsFormOpen(false);
            setIsEditMode(false);
            setSelectedFollowUp(null);
        } catch (err) {
            console.error("Error saving followup", err);
        }
    };

    // ✅ Delete FollowUp
    const handleDelete = async (id: string) => {
        try {
            await axios.delete(baseURL + `/newfollowups/${id}`);
            fetchFollowUps();

            toast({
                title: "Meeting Deleted",
                description: "The Meeting has been removed successfully.",
                variant: "default",
                duration: 3000,
            });
        } catch (err) {
            console.error("Error deleting followup", err);

            toast({
                title: "Error",
                description: "Failed to delete the Meeting. Please try again.",
                variant: "destructive",
                duration: 3000,
            });
        }
    };

    // ✅ Edit (prefill form)
    const handleEdit = (followUp: FollowUp) => {
        const date = new Date(followUp.followUpDate);
        const formattedDate = date.toISOString().slice(0, 16);

        setSelectedFollowUp(followUp);
        setFormData({
            clientId: followUp.clientId?._id || "",
            contactPersonId: followUp.contactPersonId?._id || "",
            followUpDate: followUp.followUpDate ? formattedDate : "",
            message: followUp.message,
            status: followUp.status || "pending",
            googleMeetLink: followUp.googleMeetLink || "",
        });
        setIsEditMode(true);
        setIsFormOpen(true);
    };

    // ✅ View
    const handleView = (followUp: FollowUp) => {
        setSelectedFollowUp(followUp);
        setIsViewOpen(true);
    };

    const filteredData = followUps.filter((f) =>
        (filterStatus === "all" || f.status === filterStatus) &&
        [f.clientId?.name, f.contactPersonId?.fullName, f.message]
            .join(" ")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        const statusColors = {
            pending: "bg-yellow-100 text-yellow-800",
            completed: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800",
            in_progress: "bg-blue-100 text-blue-800"
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || statusColors.pending}`}>
                {status.replace('_', ' ').toUpperCase()}
            </span>
        );
    };

    const DetailItem = ({ icon: Icon, label, value, className = "" }: {
        icon: React.ComponentType<any>,
        label: string,
        value: React.ReactNode,
        className?: string
    }) => (
        <div className={`flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-100 ${className}`}>
            <div className="flex-shrink-0 w-5 h-5 text-gray-600 mt-0.5">
                <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
                <p className="text-sm text-gray-900 break-words">{value ?? "—"}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen p-6">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold pb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Schedule Meetings Management
                </h1>
                <p className="text-gray-600 mt-2">
                    Manage and track all client meetings and communications
                </p>
            </div>

            {/* Table Section */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <CardTitle className="text-xl font-semibold text-gray-800">
                            Schedule Meetings
                        </CardTitle>
                        <div className="flex items-center gap-4">
                            {/* Search Box */}
                            <div className="relative w-80">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search by client, contact person..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            {/* Status Filter */}
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-40 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="in progress">In Progress</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Add Meeting Button */}
                            <Button
                                onClick={() => {
                                    setIsEditMode(false);
                                    setFormData({
                                        clientId: "",
                                        contactPersonId: "",
                                        followUpDate: "",
                                        message: "",
                                        status: "pending",
                                        googleMeetLink: "",
                                    });
                                    setIsFormOpen(true);
                                }}
                                className="h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Meeting
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="flex-1 overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Client Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Message</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Contact Person</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                                    <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {filteredData.length > 0 ? (
                                    filteredData.map((followUp) => (
                                        <tr key={followUp._id}>
                                            <td className="px-6 py-4 text-sm text-gray-700 font-medium">{followUp.clientId?.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{formatDate(followUp.followUpDate)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{followUp.message}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{followUp.contactPersonId?.fullName}</td>
                                            <td className="px-6 py-4 text-sm">{getStatusBadge(followUp.status)}</td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleView(followUp)}
                                                        className="hover:bg-blue-100 h-8 w-8"
                                                    >
                                                        <Eye className="h-4 w-4 text-blue-600" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(followUp)}
                                                        className="hover:bg-green-100 h-8 w-8"
                                                    >
                                                        <Edit className="h-4 w-4 text-green-600" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(followUp._id)}
                                                        className="hover:bg-red-100 h-8 w-8"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-6 text-center text-gray-500"
                                        >
                                            No meetings found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center items-center mt-4 space-x-4">
                        <Button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Prev
                        </Button>
                        <span className="text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Next
                        </Button>
                    </div>
                </CardContent>
            </Card>


            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader className="pb-6 border-b border-gray-200">
                        <DialogTitle className="text-2xl font-bold text-gray-900">
                            {isEditMode ? "Edit Meeting" : "Add New Meeting"}
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 mt-2">
                            {isEditMode
                                ? "Update the Meeting information"
                                : "Create a new Meeting entry"}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6 py-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* ✅ Client (maps to clientId) */}
                            <div className="space-y-2">
                                <Label htmlFor="clientId">Client Name *</Label>
                                <Select
                                    value={formData.clientId}
                                    onValueChange={(val) => setFormData({ ...formData, clientId: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select client" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map((c) => (
                                            <SelectItem key={c._id} value={c._id}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* ✅ FollowUpDate (fix: was date) */}
                            <div className="space-y-2">
                                <Label htmlFor="followUpDate">Meeting Date *</Label>
                                <Input
                                    id="followUpDate"
                                    type="datetime-local"
                                    value={formData.followUpDate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, followUpDate: e.target.value })
                                    }
                                    required
                                />
                            </div>

                            {/* ✅ ContactPerson (maps to contactPersonId) */}
                            <div className="space-y-2">
                                <Label htmlFor="contactPersonId">Contact Person *</Label>
                                <Select
                                    value={formData.contactPersonId}
                                    onValueChange={(val) =>
                                        setFormData({ ...formData, contactPersonId: val })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select user" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((u) => (
                                            <SelectItem key={u._id} value={u._id}>
                                                {u.fullName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Optional UI-only fields */}
                            {/* <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, phone: e.target.value })
                                    }
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    placeholder="Enter email address"
                                />
                            </div> */}

                            {/* ✅ Status matches enum */}
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, status: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="in progress">In Progress</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Optional UI-only */}
                        {/* <div className="space-y-2">
                            <Label htmlFor="company">Company</Label>
                            <Input
                                id="company"
                                value={formData.company || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, company: e.target.value })
                                }
                                placeholder="Enter company name"
                            />
                        </div> */}

                        {/* ✅ Google Meet Link Field*/}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="googleMeetLink">Meeting Link</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="googleMeetLink"
                                    type="url"
                                    value={formData.googleMeetLink || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, googleMeetLink: e.target.value })
                                    }
                                    placeholder="Click 'Generate Link' to create Google Meet link"
                                    readOnly
                                />

                                {/* ✅ Single Button for Auth + Generate */}
                                <Button
                                    type="button"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={async () => {
                                        try {
                                            // Step 1: Ask backend if authenticated
                                            const res = await fetch("http://localhost:3006/calendar/auth-url");
                                            const data = await res.json();

                                            if (data.authenticated) {
                                                console.log("✅ Already authenticated, creating event...");

                                                // Step 2: Create Google Meet Event
                                                const response = await fetch("http://localhost:3006/calendar/create-event", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({
                                                        summary: "Meeting Meeting",
                                                        description: formData.message || "Client Meeting",
                                                        start: new Date(formData.followUpDate).toISOString(),
                                                        end: new Date(formData.followUpDate).toISOString(),
                                                        attendees: [],
                                                    }),
                                                });

                                                const eventData = await response.json();
                                                if (eventData.success && eventData.meetLink) {
                                                    setFormData({ ...formData, googleMeetLink: eventData.meetLink });
                                                    toast({
                                                        title: "✅ Meet Link Generated",
                                                        description: "Google Meet link created successfully.",
                                                        variant: "default",
                                                        duration: 3000,
                                                    });
                                                } else {
                                                    toast({
                                                        title: "❌ Failed",
                                                        description: "Could not generate Meet link.",
                                                        variant: "destructive",
                                                        duration: 3000,
                                                    });
                                                }
                                            } else if (data.url) {
                                                console.log("🔑 Redirecting to Google OAuth...");
                                                window.location.href = data.url; // redirect to authenticate
                                            }
                                        } catch (err) {
                                            console.error("Error generating Meet link:", err);
                                            toast({
                                                title: "❌ Error",
                                                description: "Something went wrong while generating the Meet link. please fill date and message fields.",
                                                variant: "destructive",
                                                duration: 3000,
                                            });
                                        }
                                    }}
                                >
                                    Generate Link
                                </Button>
                            </div>
                        </div>




                        {/* ✅ Message */}
                        <div className="space-y-2">
                            <Label htmlFor="message">Meeting Message *</Label>
                            <Textarea
                                id="message"
                                value={formData.message}
                                onChange={(e) =>
                                    setFormData({ ...formData, message: e.target.value })
                                }
                                placeholder="Enter Meeting details and notes..."
                                rows={4}
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsFormOpen(false)}
                                className="px-6"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="px-6 bg-blue-600 hover:bg-blue-700">
                                {isEditMode ? "Update Meeting" : "Add Meeting"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* View Meeting Dialog */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader className="pb-6 border-b border-gray-200">
                        <DialogTitle className="text-2xl font-bold text-gray-900">
                            Meeting Details
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 mt-2">
                            Complete information for this Meeting
                        </DialogDescription>
                    </DialogHeader>

                    {selectedFollowUp && (
                        <div className="space-y-6 py-6">
                            {/* Client Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
                                    <Building className="w-5 h-5 text-blue-600" />
                                    Client Information
                                </h3>

                                <div className="space-y-3">
                                    <DetailItem
                                        icon={Building}
                                        label="Client Name"
                                        value={selectedFollowUp.clientId?.name}
                                    />

                                    <div className="grid gap-3 md:grid-cols-2">
                                        <DetailItem
                                            icon={UserCheck}
                                            label="Contact Person"
                                            value={getContactPersonName(selectedFollowUp.contactPersonId?._id)}
                                        />

                                        {/* <DetailItem
                                            icon={Building}
                                            label="Company"
                                            value={selectedFollowUp.company}
                                        /> */}
                                    </div>

                                    {/* <div className="grid gap-3 md:grid-cols-2">
                                        <DetailItem
                                            icon={Mail}
                                            label="Email Address"
                                            value={selectedFollowUp.email}
                                        />
                                        <DetailItem
                                            icon={Phone}
                                            label="Phone Number"
                                            value={selectedFollowUp.phone}
                                        />
                                    </div> */}
                                </div>
                            </div>

                            {/* Meeting Details */}
                            {/* Meeting Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-green-600" />
                                    Meeting Details
                                </h3>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <DetailItem
                                        icon={Calendar}
                                        label="Meeting Date"
                                        value={formatDate(selectedFollowUp.followUpDate)}
                                    />
                                    <DetailItem
                                        icon={User}
                                        label="Status"
                                        value={selectedFollowUp.status?.replace("_", " ").toUpperCase()}
                                        className="bg-blue-50 border-blue-200"
                                    />
                                </div>

                                <DetailItem
                                    icon={MessageSquare}
                                    label="Meeting Message"
                                    value={selectedFollowUp.message}
                                    className="bg-green-50 border-green-200"
                                />

                                {/* ✅ Google Meet Link */}
                                {selectedFollowUp.googleMeetLink && (
                                    <DetailItem
                                        icon={Calendar} // you can swap this with a Video or Link icon if you like
                                        label="Google Meet Link"
                                        value={
                                            <a
                                                href={selectedFollowUp.googleMeetLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 underline"
                                            >
                                                {selectedFollowUp.googleMeetLink}
                                            </a>
                                        }
                                        className="bg-purple-50 border-purple-200"
                                    />
                                )}

                                {/* <DetailItem
    icon={Calendar}
    label="Created At"
    value={new Date(selectedFollowUp.createdAt).toLocaleString()}
  /> */}
                            </div>

                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                        <Button
                            variant="outline"
                            onClick={() => setIsViewOpen(false)}
                            className="px-6"
                        >
                            Close
                        </Button>
                        <Button
                            className="px-6 bg-blue-600 hover:bg-blue-700"
                            onClick={() => {
                                setIsViewOpen(false);
                                handleEdit(selectedFollowUp!);
                            }}
                        >
                            Edit Meeting
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}