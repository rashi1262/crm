import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users, TrendingUp, ChevronDown } from "lucide-react";
import { ClientForm } from "./ClientForm";
import { ClientList } from "./ClientList";
import axios from "axios";
import { Routes, Route, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Client {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  mobileNo: string;
  company: string;
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

export const ClientManagement = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [contactPersons, setContactPersons] = useState<string[]>([]);
  const [selectedContactPerson, setSelectedContactPerson] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_API_URL;

  // fetchData now receives an optional `page` argument
  const fetchData = useCallback(
    async (page = 1) => {
      try {
        const skip = (page - 1) * itemsPerPage;

        const filter: any = {
          limit: itemsPerPage,
          skip,
        };

        // Pass the search term directly
        if (searchTerm) {
          filter.search = searchTerm;
        }

        // Pass the contact person filter in the 'where' clause
        if (selectedContactPerson) {
          filter.where = { contactPerson: selectedContactPerson };
        }

        const response = await axios.get(`${baseURL}/clients`, {
          params: {
            filter: JSON.stringify(filter),
          },
        });

        const backendClients = response.data.data || [];
        const normalizedClients = backendClients.map((client: any) => ({
          ...client,
          id: client._id,
          contactPerson: client.contactPerson || "N/A",
          chatMessages: client.chatMessages || [],
        }));

        setClients(normalizedClients);

        if (response.data.pagination) {
          setCurrentPage(response.data.pagination.currentPage);
          setTotalPages(response.data.pagination.totalPages);
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    },
    [searchTerm, selectedContactPerson, itemsPerPage, baseURL]
  );

  // A single useEffect that triggers a fetch whenever currentPage, searchTerm, or selectedContactPerson changes.
  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, searchTerm, selectedContactPerson, fetchData]);

  // Fetch contact persons only on initial mount.
  useEffect(() => {
    fetchContactPersons();
  }, []);

  const fetchContactPersons = async () => {
    try {
      const response = await axios.get(`${baseURL}/clients`, {
        params: { filter: JSON.stringify({ limit: 10000 }) },
      });
      const allClients = response.data.data || [];
      const uniqueContactPersons = Array.from(
        new Set(allClients.map((c: any) => c.contactPerson).filter(Boolean))
      ) as string[];
      setContactPersons(uniqueContactPersons);
    } catch (error) {
      console.error("Error fetching contact persons:", error);
    }
  };

  const addClient = (newClient: Client) => {
    setClients((prevClients) => [newClient, ...prevClients]);
    fetchData(currentPage);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to page 1 for a new search
  };

  const handleContactPersonChange = (person: string) => {
    setSelectedContactPerson(person);
    setCurrentPage(1); // Reset to page 1 for a new filter
  };

  const activeClients = clients.filter((c) => c.status === "Active").length;
  const pendingPayments = clients.filter(
    (c) => c.paymentStatus === "Pending"
  ).length;

  return (
    <Routes>
      <Route
        path="create"
        element={
          <ClientForm
            onSave={addClient}
            onCancel={() => navigate("/clients")}
          />
        }
      />
      <Route
        path="/"
        element={
          <div className="space-y-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Client Management
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage your clients and track their progress
                </p>
              </div>
              <Button
                onClick={() => navigate("create")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Client
              </Button>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Clients
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {clients.length}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Active Clients
                      </p>
                      <p className="text-3xl font-bold text-green-600">
                        {activeClients}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Pending Payments
                      </p>
                      <p className="text-3xl font-bold text-orange-600">
                        {pendingPayments}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Directory */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="text-xl font-semibold text-gray-800">
                    Client Directory
                  </CardTitle>
                  {/* Search + Filter */}
                  <div className="relative flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search clients by name or contact person..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="pl-10 h-11 w-72 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    {/* Contact Person Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-11 px-4 border-gray-200 hover:border-gray-300 hover:bg-gray-50 flex items-center gap-2 min-w-[140px] justify-between transition-colors duration-200"
                        >
                          <span className="truncate">
                            {selectedContactPerson || "All Contacts"}
                          </span>
                          <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0 transition-transform duration-200 data-[state=open]:rotate-180" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent
                        // Corrected classes for scrollbar and alignment
                        className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-y-auto p-1 bg-white border border-gray-200 rounded-lg shadow-lg"
                        align="start"
                        sideOffset={4}
                      >
                        {/* All Contacts Option */}
                        <DropdownMenuItem
                          onClick={() => handleContactPersonChange("")}
                          className={`
          px-3 py-2 rounded-md cursor-pointer transition-colors duration-150 flex items-center gap-2
          ${!selectedContactPerson
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "hover:bg-gray-50 text-gray-700"
                            }
        `}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>All Contacts</span>
                          </div>
                        </DropdownMenuItem>

                        {/* Separator */}
                        {contactPersons.length > 0 && (
                          <div className="h-px bg-gray-200 my-1"></div>
                        )}

                        {/* Contact Person Options */}
                        {contactPersons.length > 0 ? (
                          contactPersons.map((person, idx) => (
                            <DropdownMenuItem
                              key={idx}
                              onClick={() => handleContactPersonChange(person)}
                              className={`
              px-3 py-2 rounded-md cursor-pointer transition-colors duration-150 flex items-center gap-2
              ${selectedContactPerson === person
                                  ? "bg-blue-50 text-blue-700 font-medium"
                                  : "hover:bg-gray-50 text-gray-700"
                                }
            `}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="truncate">{person}</span>
                              </div>
                            </DropdownMenuItem>
                          ))
                        ) : (
                          <DropdownMenuItem className="px-3 py-2 text-gray-500 text-sm italic">
                            No contact persons found
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ClientList
                  clients={clients}
                  onUpdate={setClients}
                  refetchClients={() => fetchData(currentPage)}
                />
                {/* Pagination */}
                <div className="flex justify-center items-center mt-4 space-x-4">
                  <Button
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    disabled={currentPage === 1}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Prev
                  </Button>
                  <span className="text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage === totalPages}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        }
      />
    </Routes>
  );
};