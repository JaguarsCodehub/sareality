import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, PhoneCall, Users, CheckCircle } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Active Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">+12 since last week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Follow-ups Today</CardTitle>
            <PhoneCall className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground text-rose-500">8 overdue from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Site Visits (This Week)</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookings (This Month)</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground cursor-pointer underline">View details</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
             <div className="h-[200px] flex items-center justify-center text-slate-400 border-2 border-dashed rounded-lg m-4">
                Chart Placeholder (Phase 4)
             </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Priority Call Queue</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {/* Mock Queue Items */}
                <div className="flex items-center justify-between p-3 border rounded-lg bg-rose-50/50">
                  <div>
                    <p className="font-medium text-sm">Amit Sharma</p>
                    <p className="text-xs text-slate-500">Last contact: 3 days ago</p>
                  </div>
                  <span className="text-xs font-semibold text-rose-600 bg-rose-100 px-2 py-1 rounded-full">Overdue</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Priya Singh</p>
                    <p className="text-xs text-slate-500">New Lead - MagicBricks</p>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Call Now</span>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
