
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, User, Building2, Mail, Phone, Calendar, CreditCard, FileText } from "lucide-react";

interface ClientFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
}

export const ClientForm = ({ onSave, onCancel }: ClientFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    company: "",
    status: "Active",
    nextFollowup: "",
    paymentStatus: "Paid",
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      lastFollowup: new Date().toISOString().split('T')[0]
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={onCancel}
            className="hover:bg-white/60 backdrop-blur-sm border border-gray-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clients
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Add New Client
            </h1>
            <p className="text-gray-600 mt-1">Create a new client profile with complete information</p>
          </div>
        </div>

        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-semibold flex items-center gap-2">
              <User className="h-6 w-6" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      Client Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                      placeholder="Enter client/company name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      Contact Person
                    </Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => handleChange("contactPerson", e.target.value)}
                      className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                      placeholder="Primary contact person"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                      placeholder="contact@company.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-600" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    Company Details
                  </Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleChange("company", e.target.value)}
                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    placeholder="Company name and industry details"
                    required
                  />
                </div>
              </div>

              {/* Status & Scheduling Section */}
              <div className="space-y-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Status & Scheduling</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Client Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                      <SelectTrigger className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        <SelectItem value="Active">✅ Active</SelectItem>
                        <SelectItem value="Pending">⏳ Pending</SelectItem>
                        <SelectItem value="Inactive">❌ Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nextFollowup" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      Next Follow-up
                    </Label>
                    <Input
                      id="nextFollowup"
                      type="date"
                      value={formData.nextFollowup}
                      onChange={(e) => handleChange("nextFollowup", e.target.value)}
                      className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-green-600" />
                      Payment Status
                    </Label>
                    <Select value={formData.paymentStatus} onValueChange={(value) => handleChange("paymentStatus", value)}>
                      <SelectTrigger className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        <SelectItem value="Paid">💚 Paid</SelectItem>
                        <SelectItem value="Due">⏰ Due</SelectItem>
                        <SelectItem value="Overdue">🔴 Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Additional Notes</h3>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">Notes & Comments</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    rows={4}
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg resize-none"
                    placeholder="Add any additional notes, requirements, or special instructions..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <Button 
                  type="submit" 
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  💾 Save Client
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  className="flex-1 h-12 border-2 border-gray-300 hover:border-gray-400 rounded-lg font-semibold transition-all duration-200"
                >
                  ❌ Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
