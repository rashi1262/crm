import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Search, User, Mail, Phone, MessageSquare, FileText, Globe, Tag, Calendar } from "lucide-react";
import axios from "axios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Submission {
    _id: string;
    full_name?: string;
    email_add?: string;
    phone_num?: string | number;
    message?: string | null;
    type: string;
    form_type?: string;
    pathname?: string;
    createdAt: string;
}

export const Support = () => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [apiURL, setApiURL] = useState(
        "https://api.vidhema.com/vidhemas?access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmMGMxMDY1NGM1ZDUwMGY2NDM3YmQzMSIsImVtYWlsIjoic2FsZXNAdmlkaGVtYS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTYwMzQzODksImV4cCI6MTc1NjEyMDc4OX0.ufGzkOAIQOJbXxRLyKo3n-cUB7ANVfdjSvXTrpnbFb0"
    );

    const itemsPerPage = 10;

    const fetchData = async (page = 1, url = apiURL) => {
        try {
            const skip = (page - 1) * itemsPerPage;

            const response = await axios.get(url, {
                params: {
                    filter: JSON.stringify({
                        order: { createdAt: -1 },
                        limit: itemsPerPage,
                        skip,
                    }),
                },
            });

            const backendData = response.data.data || response.data;

            // 🔥 Normalize API fields
            const normalizedData = backendData.map((item: any) => {
                if (url.includes("vidhemas")) {
                    return {
                        _id: item._id,
                        full_name: item.full_name,
                        email_add: item.email_add,
                        phone_num: item.phone_num,
                        message: item.message,
                        type: item.type,
                        form_type: item.form_type,
                        pathname: item.pathname,
                        createdAt: item.createdAt,
                    };
                } else if (url.includes("iThemesSites")) {
                    return {
                        _id: item._id,
                        full_name: item.name,           
                        email_add: item.email,          
                        phone_num: item.phone,          
                        message: item.message,
                        type: "iThemes Support",        
                        form_type: item.subject,
                        pathname: null,
                        createdAt: item.createdAt,
                    };
                }
                return item;
            });

            setSubmissions(normalizedData);

            if (response.data.pagination) {
                setCurrentPage(response.data.pagination.currentPage);
                setTotalPages(response.data.pagination.totalPages);
            }
        } catch (error) {
            console.error("Error fetching submissions:", error);
        }
    };

    useEffect(() => {
        fetchData(1, apiURL);
    }, [apiURL]);

    const filteredData = submissions.filter((s) => {
        const createdFormatted = s.createdAt
            ? new Date(s.createdAt).toLocaleString("en-US")
            : "";

        return Object.values({
            ...s,
            created: createdFormatted,
        }).some((value) =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const DetailItem = ({ icon: Icon, label, value, className = "" }: {
        icon: React.ComponentType<any>,
        label: string,
        value: string | number | null | undefined,
        className?: string
    }) => (
        <div className={`flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-100 ${className}`}>
            <div className="flex-shrink-0 w-5 h-5 text-gray-600 mt-0.5">
                <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
                <p className="text-sm text-gray-900 break-words">{value || "—"}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen p-6 max-w-[80vw] mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Contact Submissions
                </h1>
                <p className="text-gray-600 mt-2">
                    View and manage all website contact form submissions
                </p>
            </div>

            {/* Table Section */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <CardTitle className="text-xl font-semibold text-gray-800">
                            Submissions
                        </CardTitle>
                        <div className="flex items-center gap-4">
                            {/* Search Box */}
                            <div className="relative w-80">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search by name, email or phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            {/* Dropdown Filter */}
                            <Select onValueChange={(value) => setApiURL(value)}>
                                <SelectTrigger className="w-40 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                                    <SelectValue placeholder="Filter by type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="https://api.vidhema.com/vidhemas?access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmMGMxMDY1NGM1ZDUwMGY2NDM3YmQzMSIsImVtYWlsIjoic2FsZXNAdmlkaGVtYS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTYwMzQzODksImV4cCI6MTc1NjEyMDc4OX0.ufGzkOAIQOJbXxRLyKo3n-cUB7ANVfdjSvXTrpnbFb0">
                                        Vidhema Support
                                    </SelectItem>
                                    <SelectItem value="https://api.vidhema.com/iThemesSites?access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmMGMxMDY1NGM1ZDUwMGY2NDM3YmQzMSIsImVtYWlsIjoic2FsZXNAdmlkaGVtYS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTYwMzQ4MTksImV4cCI6MTc1NjEyMTIxOX0.p7hYrhpOg4c6ZT0bN6_U0Tj18BFerwb6FP9cEEKLXKU">
                                        iThemes Support
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="flex-1 overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Sr. No.</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Phone</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Form Type</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Created</th>
                                    <th className="px-6 py-3 text-center text-sm font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {filteredData.length > 0 ? (
                                    filteredData.map((s, index) => (
                                        <tr key={s._id} className="hover:bg-blue-50/50 transition">
                                            <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                                                {(currentPage - 1) * itemsPerPage + (index + 1)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                                                {s.full_name || "NA"}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {s.email_add || "NA"}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {s.phone_num || "NA"}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {s.form_type || "—"}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(s.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setSelectedSubmission(s);
                                                        setIsOpen(true);
                                                    }}
                                                    className="hover:bg-blue-100"
                                                >
                                                    <Eye className="h-5 w-5 text-blue-600" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-6 text-center text-gray-500"
                                        >
                                            No submissions found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center items-center mt-4 space-x-4">
                        <Button
                            onClick={() => fetchData(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Prev
                        </Button>
                        <span className="text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            onClick={() => fetchData(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Next
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Enhanced Dialog Box */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader className="pb-6 border-b border-gray-200">
                        <DialogTitle className="text-2xl font-bold text-gray-900">
                            Submission Details
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 mt-2">
                            Complete information for this form submission
                        </DialogDescription>
                    </DialogHeader>

                    {selectedSubmission && (
                        <div className="space-y-6 py-6">
                            {/* Personal Information Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-600" />
                                    Personal Information
                                </h3>

                                <div className="space-y-3">
                                    <DetailItem
                                        icon={User}
                                        label="Full Name"
                                        value={selectedSubmission.full_name}
                                    />

                                    <div className="grid gap-3 md:grid-cols-2">
                                        <DetailItem
                                            icon={Mail}
                                            label="Email Address"
                                            value={selectedSubmission.email_add}
                                        />
                                        <DetailItem
                                            icon={Phone}
                                            label="Phone Number"
                                            value={selectedSubmission.phone_num}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Message Section */}
                            {selectedSubmission.message && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-green-600" />
                                        Message
                                    </h3>
                                    <DetailItem
                                        icon={MessageSquare}
                                        label="Message Content"
                                        value={selectedSubmission.message}
                                        className="bg-blue-50 border-blue-200"
                                    />
                                </div>
                            )}

                            {/* Form Information Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-purple-600" />
                                    Form Information
                                </h3>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <DetailItem
                                        icon={FileText}
                                        label="Form Type"
                                        value={selectedSubmission.form_type}
                                    />
                                    <DetailItem
                                        icon={Tag}
                                        label="Submission Type"
                                        value={selectedSubmission.type}
                                    />
                                </div>

                                {selectedSubmission.pathname && (
                                    <DetailItem
                                        icon={Globe}
                                        label="Page Path"
                                        value={selectedSubmission.pathname}
                                    />
                                )}
                            </div>

                            {/* Timestamp Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-orange-600" />
                                    Submission Details
                                </h3>
                                <DetailItem
                                    icon={Calendar}
                                    label="Created At"
                                    value={formatDate(selectedSubmission.createdAt)}
                                    className="bg-green-50 border-green-200"
                                />
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};