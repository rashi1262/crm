import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  Eye,
  X,
  Briefcase,
  Phone,
  Mail,
  FileText,
  Calendar,
  ChevronDown,
} from "lucide-react";

const STATUS_COLORS = {
  New: "bg-blue-100 text-blue-700",
  Reviewing: "bg-yellow-100 text-yellow-700",
  Shortlisted: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

const STATUS_OPTIONS = ["New", "Reviewing", "Shortlisted", "Rejected"];

const Applications = () => {
  const baseURL = import.meta.env.VITE_API_URL;

  const [applications, setApplications] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${baseURL}/getAllApplications`);
      setApplications(res.data.data);
      setFiltered(res.data.data);
    } catch (err) {
      toast({
        title: "❌ Error",
        description: "Failed to fetch applications.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Search + filter
  useEffect(() => {
    let result = [...applications];

    if (search) {
      result = result.filter(
        (app) =>
          app.name.toLowerCase().includes(search.toLowerCase()) ||
          app.email.toLowerCase().includes(search.toLowerCase()) ||
          app.jobTitle.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "All") {
      result = result.filter((app) => app.status === statusFilter);
    }

    setFiltered(result);
  }, [search, statusFilter, applications]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${baseURL}/updateApplication/${id}`, {
        status: newStatus,
      });
      setApplications((prev) =>
        prev.map((app) =>
          app._id === id ? { ...app, status: newStatus } : app
        )
      );
      if (selectedApp?._id === id) {
        setSelectedApp((prev) => ({ ...prev, status: newStatus }));
      }
      toast({ title: "✅ Status Updated", description: `Marked as ${newStatus}` });
    } catch {
      toast({
        title: "❌ Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    }
  };

  const stats = {
    total: applications.length,
    new: applications.filter((a) => a.status === "New").length,
    shortlisted: applications.filter((a) => a.status === "Shortlisted").length,
    rejected: applications.filter((a) => a.status === "Rejected").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Applications
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and review candidate applications
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total", value: stats.total, color: "from-purple-500 to-blue-500" },
            { label: "New", value: stats.new, color: "from-blue-400 to-blue-600" },
            { label: "Shortlisted", value: stats.shortlisted, color: "from-green-400 to-green-600" },
            { label: "Rejected", value: stats.rejected, color: "from-red-400 to-red-500" },
          ].map((stat) => (
            <Card key={stat.label} className="border-0 shadow-md">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm">
          <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, email or job title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 border-gray-200 rounded-lg"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 h-11 border-gray-200 rounded-lg">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg">
                <SelectItem value="All">All Statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              All Applications ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-lg font-medium">No applications found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {["Candidate", "Job Applied", "Contact", "Applied On", "Status", "Actions"].map((h) => (
                        <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((app) => (
                      <tr key={app._id} className="hover:bg-purple-50/40 transition-colors">
                        {/* Candidate */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold text-sm">
                              {app.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-800">{app.name}</span>
                          </div>
                        </td>

                        {/* Job */}
                        <td className="px-6 py-4 text-gray-600">{app.jobTitle}</td>

                        {/* Contact */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-1 text-gray-600">
                              <Mail className="w-3 h-3" /> {app.email}
                            </span>
                            <span className="flex items-center gap-1 text-gray-500">
                              <Phone className="w-3 h-3" /> {app.phone}
                            </span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(app.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <Select
                            value={app.status}
                            onValueChange={(val) => handleStatusChange(app._id, val)}
                          >
                            <SelectTrigger className={`h-8 w-36 text-xs font-semibold border-0 rounded-full px-3 ${STATUS_COLORS[app.status]}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-gray-200 shadow-lg">
                              {STATUS_OPTIONS.map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedApp(app)}
                            className="border-purple-200 text-purple-600 hover:bg-purple-50 rounded-lg"
                          >
                            <Eye className="w-4 h-4 mr-1" /> View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Drawer / Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end">
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl">

            {/* Drawer Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white flex items-start justify-between">
              <div>
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold mb-3">
                  {selectedApp.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold">{selectedApp.name}</h2>
                <p className="text-purple-200 mt-1">{selectedApp.jobTitle}</p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-white/70 hover:text-white mt-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-6">

              {/* Status Control */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Application Status</p>
                <Select
                  value={selectedApp.status}
                  onValueChange={(val) => handleStatusChange(selectedApp._id, val)}
                >
                  <SelectTrigger className={`h-10 font-semibold border-0 rounded-full px-4 ${STATUS_COLORS[selectedApp.status]}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Info */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase">Contact Info</p>
                {[
                  { icon: Mail, label: selectedApp.email },
                  { icon: Phone, label: selectedApp.phone },
                  { icon: Calendar, label: new Date(selectedApp.createdAt).toLocaleString("en-IN") },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 text-gray-700">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-purple-500" />
                    </div>
                    <span className="text-sm">{label}</span>
                  </div>
                ))}
              </div>

              {/* Cover Letter */}
              {selectedApp.coverLetter && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Cover Letter</p>
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed border border-gray-100">
                    {selectedApp.coverLetter}
                  </div>
                </div>
              )}

              {/* Resume */}
              {selectedApp.resume && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Resume</p>
                  <a
                    href={selectedApp.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border border-purple-100 rounded-xl hover:bg-purple-50 transition text-purple-700 font-medium text-sm"
                  >
                    <FileText className="w-5 h-5" />
                    View / Download Resume
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;