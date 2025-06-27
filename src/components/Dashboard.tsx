
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, Calendar, DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";

export const Dashboard = () => {
  const stats = [
    { title: "Total Clients", value: "147", icon: Users, color: "text-blue-600", bgColor: "bg-blue-100" },
    { title: "Active Job Profiles", value: "23", icon: Briefcase, color: "text-green-600", bgColor: "bg-green-100" },
    { title: "Pending Follow-ups", value: "8", icon: Calendar, color: "text-orange-600", bgColor: "bg-orange-100" },
    { title: "Payment Reminders", value: "5", icon: DollarSign, color: "text-red-600", bgColor: "bg-red-100" },
  ];

  const recentActivities = [
    { type: "Client Added", description: "TechCorp Solutions added to system", time: "2 hours ago", icon: Users, color: "bg-blue-500" },
    { type: "Job Profile", description: "Senior React Developer position created", time: "4 hours ago", icon: Briefcase, color: "bg-green-500" },
    { type: "Follow-up", description: "Follow-up scheduled with ABC Technologies", time: "6 hours ago", icon: Calendar, color: "bg-orange-500" },
    { type: "Payment", description: "Payment reminder sent to XYZ Ltd", time: "8 hours ago", icon: DollarSign, color: "bg-red-500" },
  ];

  const upcomingFollowups = [
    { client: "TechCorp Solutions", date: "Today, 2:00 PM", type: "Call", priority: "high" },
    { client: "ABC Technologies", date: "Tomorrow, 10:00 AM", type: "Meeting", priority: "medium" },
    { client: "XYZ Solutions", date: "Dec 28, 3:00 PM", type: "Email", priority: "low" },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your business.</p>
        </div>
        <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm border">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`h-10 w-10 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% from last month
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`h-8 w-8 ${activity.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{activity.type}</p>
                      <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Upcoming Follow-ups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingFollowups.map((followup, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{followup.client}</p>
                    <p className="text-sm text-gray-600">{followup.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(followup.priority)}`}>
                      {followup.priority.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium border border-blue-200">
                      {followup.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
