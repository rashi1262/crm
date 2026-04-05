import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface RecentActivityItem {
  type: string;
  description: string;
  time: string;
  icon: any; // Use a more specific type if possible
  color: string;
}

interface RecentActivitiesProps {
  activities: RecentActivityItem[];
}

// Helper function from your original code
const formatTimeWithTodayTomorrow = (datetime: string) => {
  const date = new Date(datetime);
  const now = new Date();
  const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = date.getDate() === tomorrow.getDate() && date.getMonth() === tomorrow.getMonth() && date.getFullYear() === tomorrow.getFullYear();
  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });

  if (isToday) return `Today, ${time}`;
  if (isTomorrow) return `Tomorrow, ${time}`;

  const completeDate = date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
  return `${completeDate} ${time}`;
};


export const RecentActivities = ({ activities }: RecentActivitiesProps) => {
  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div key={index} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`h-8 w-8 ${activity.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{activity.type}</p>
                  <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                  {/* <p className="text-xs text-gray-400 mt-1">{formatTimeWithTodayTomorrow(new Date().toISOString())}</p> */}
                  <p className="text-xs text-gray-400 mt-1">{formatTimeWithTodayTomorrow(activity.time)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};