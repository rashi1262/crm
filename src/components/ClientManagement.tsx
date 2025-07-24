import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users, TrendingUp } from "lucide-react";
import { ClientForm } from "./ClientForm";
import { ClientList } from "./ClientList";
import axios from "axios";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";

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
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  // const [clients, setClients] = useState<Client[]>([
  //   {
  //     id: 1,
  //     name: "TechCorp Solutions",
  //     contactPerson: "John Smith",
  //     email: "john@techcorp.com",
  //     phone: "+1-234-567-8900",
  //     company: "TechCorp Solutions",
  //     status: "Active",
  //     lastFollowup: "2024-12-26",
  //     nextFollowup: "2024-12-30",
  //     paymentStatus: "Paid",
  //     totalAmount: 50000,
  //     paidAmount: 50000,
  //     conversations: 5,
  //     chatMessages: [],
  //     followups: []
  //   },
  //   {
  //     id: 2,
  //     name: "ABC Technologies",
  //     contactPerson: "Sarah Johnson",
  //     email: "sarah@abctech.com",
  //     phone: "+1-234-567-8901",
  //     company: "ABC Technologies",
  //     status: "Pending",
  //     lastFollowup: "2024-12-25",
  //     nextFollowup: "2024-12-28",
  //     paymentStatus: "Partial",
  //     totalAmount: 75000,
  //     paidAmount: 25000,
  //     conversations: 3,
  //     chatMessages: [],
  //     followups: []
  //   }
  // ]);

  const [clients, setClients] = useState<Client[]>([]);

//   const fetchClients = async () => {
//   const response = await axios.get(`${baseURL}/clients`);
//   const normalized = response.data.map((c: any) => ({
//     ...c,
//     id: c._id,
//   }));
//   setClients(normalized);
// };


  const addClient = (newClient: Client) => {
    // const newClient: Client = {
    //   ...clientData,
    //   // id: clients.length + 1,
    //   conversations: 0,
    //   chatMessages: [],
    //   followups: [],
    //   totalAmount: 0,
    //   paidAmount: 0,
    // };
    // setClients([...clients, newClient]);

    // at the top of the list
    setClients((prevClients) => [newClient, ...prevClients]);
    setShowForm(false);
     fetchData(); // re-fetch clients after adding
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.projectManager?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeClients = clients.filter(
    (client) => client.status === "Active"
    // const statusStr = typeof client.status === "boolean" ? (client.status ? "Active" : "Inactive") : client.status;
    // return statusStr === "Active";
  ).length;
  const pendingPayments = clients.filter(
    (client) => client.paymentStatus === "Pending"
  ).length;

  // if (showForm) {
  //   return <ClientForm onSave={addClient} onCancel={() => setShowForm(false)} />;
  // }

  // getting the env data of the api

      const baseURL = import.meta.env.VITE_API_URL;

       const fetchData = async () => {
      try {
        const response = await axios.get(`${baseURL}/clients`);
        const backendClients = response.data;

        // map id to _id
        const normalizedClients = backendClients.map((client: any) => ({
          ...client,
          id: client._id,
        }));

        // console.log('This is the backend get from local host',getbackendData.data)
        setClients(normalizedClients);
      } catch (error) {
        console.log(error);
      }
    };

  useEffect(() => {
   

    fetchData();
    // printallid()
  }, []);

  console.log("this the client data", clients[0]);
  // const printallid=()=>{
  //   clients.map((clinet)=>{
  //     console.log('this is each client country code',clinet.country)
  //   })
  // }

 


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
            <>
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

              {/* Stats Cards */}
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

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <CardTitle className="text-xl font-semibold text-gray-800">
                      Client Directory
                    </CardTitle>
                    <div className="relative w-80">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search clients by name or contact person..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ClientList clients={filteredClients} onUpdate={setClients} refetchClients={fetchData} />
                </CardContent>
              </Card>
            </>
          </div>
        }
      />
    </Routes>
  );
};
