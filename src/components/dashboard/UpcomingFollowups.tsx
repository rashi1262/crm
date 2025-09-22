import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface FollowupItem {
  name: string;
  datetime: string;
}

interface UpcomingFollowupsProps {
  title: string;
  followups: FollowupItem[];
}

// Helper function from your original code
const formatFollowupDate = (datetime: string) => {
    const followupDate = new Date(datetime);
    const now = new Date();
    const isToday = followupDate.getDate() === now.getDate() && followupDate.getMonth() === now.getMonth() && followupDate.getFullYear() === now.getFullYear();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow = followupDate.getDate() === tomorrow.getDate() && followupDate.getMonth() === tomorrow.getMonth() && followupDate.getFullYear() === tomorrow.getFullYear();
    const time = followupDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });

    if (isToday) return `Today, ${time}`;
    if (isTomorrow) return `Tomorrow, ${time}`;

    return `${followupDate.toLocaleDateString()} ${time}`;
};


export const UpcomingFollowups = ({ title, followups }: UpcomingFollowupsProps) => {
  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {followups.length > 0 ? (
            followups.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">{formatFollowupDate(item.datetime)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-600 text-sm py-6">
              🚫 No upcoming follow-ups.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};