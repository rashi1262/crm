
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, Briefcase, DollarSign, Calendar } from "lucide-react";

export const Analytics = () => {
  const clientStatusData = [
    { name: "Active", value: 67, color: "#10B981" },
    { name: "Pending", value: 23, color: "#F59E0B" },
    { name: "Inactive", value: 10, color: "#EF4444" }
  ];

  const paymentStatusData = [
    { name: "Paid", value: 45, color: "#10B981" },
    { name: "Partial", value: 30, color: "#F59E0B" },
    { name: "Pending", value: 25, color: "#EF4444" }
  ];

  const monthlyRevenueData = [
    { month: "Jan", revenue: 45000, clients: 12 },
    { month: "Feb", revenue: 52000, clients: 15 },
    { month: "Mar", revenue: 48000, clients: 13 },
    { month: "Apr", revenue: 61000, clients: 18 },
    { month: "May", revenue: 58000, clients: 16 },
    { month: "Jun", revenue: 67000, clients: 20 }
  ];

  const jobStatusData = [
    { status: "Active", count: 23 },
    { status: "Profile Sent", count: 15 },
    { status: "Interview", count: 8 },
    { status: "Closed", count: 12 },
    { status: "On Hold", count: 5 }
  ];

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "#8B5CF6"
    },
    clients: {
      label: "Clients",
      color: "#06B6D4"
    }
  };

  return (
    <div className="space-y-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Comprehensive insights into your business performance</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">$331K</p>
                <p className="text-xs text-green-600 mt-1">+15.3% from last month</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-3xl font-bold text-blue-600">68%</p>
                <p className="text-xs text-blue-600 mt-1">+5.1% from last month</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-3xl font-bold text-purple-600">23</p>
                <p className="text-xs text-purple-600 mt-1">+8 new this month</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Response Time</p>
                <p className="text-3xl font-bold text-orange-600">2.4h</p>
                <p className="text-xs text-orange-600 mt-1">-0.5h improvement</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Revenue & Client Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <LineChart data={monthlyRevenueData}>
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={3} />
                <Line type="monotone" dataKey="clients" stroke="#06B6D4" strokeWidth={3} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Job Status Distribution */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-purple-600" />
              Job Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <BarChart data={jobStatusData}>
                <XAxis dataKey="status" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Client Status Pie Chart */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Client Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <PieChart>
                <Pie
                  data={clientStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({name, value}) => `${name}: ${value}%`}
                >
                  {clientStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Payment Status Pie Chart */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Payment Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({name, value}) => `${name}: ${value}%`}
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
