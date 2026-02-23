"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { queryDocuments, updateDocument, getDocument } from "@/config/db";
import { where, orderBy, QueryConstraint } from "firebase/firestore";
import { format, isBefore, isSameDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LeadDocument } from "../leads/page";

// Extend with Firebase ID and metadata
export type TaskDocument = {
  id: string;
  leadId: string;
  assignedAgentId: string;
  type: "Call" | "Site Visit" | "WhatsApp";
  title: string;
  dueDate: any;
  status: "Pending" | "Completed";
  createdAt: any;
};

export default function TasksPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<{task: TaskDocument, lead?: LeadDocument}[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const constraints: QueryConstraint[] = [];
      
      // RBAC: Agents only see their tasks
      if (profile.role === "agent") {
        constraints.push(where("assignedAgentId", "==", profile.id));
      }
      
      // Fetch only pending
      constraints.push(where("status", "==", "Pending"));
      
      const taskData = await queryDocuments<TaskDocument>("tasks", constraints);
      
      // Client-side sort to avoid Firebase index requirement
      taskData.sort((a, b) => (a.dueDate?.seconds || 0) - (b.dueDate?.seconds || 0));
      
      // Hydrate leads (N+1 query is okay for MVP scale, but a real app would denormalize Lead Name onto the Task)
      const populatedTasks = await Promise.all(
        taskData.map(async (task) => {
          const lead = await getDocument<LeadDocument>("leads", task.leadId);
          return { task, lead: lead || undefined };
        })
      );
      
      setTasks(populatedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [profile]);

  const markCompleted = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent row click routing
    try {
      await updateDocument("tasks", taskId, { status: "Completed" });
      toast.success("Task marked as completed");
      fetchTasks(); // refresh list
    } catch (e) {
      toast.error("Failed to complete task");
    }
  };

  // Grouping logic for the Agent Daily Dashboard
  const now = new Date();
  
  const overdueTasks = tasks.filter(({task}) => 
    isBefore(task.dueDate?.toDate(), now) && !isSameDay(task.dueDate?.toDate(), now)
  );
  
  const todayTasks = tasks.filter(({task}) => 
    isSameDay(task.dueDate?.toDate(), now)
  );
  
  const upcomingTasks = tasks.filter(({task}) => 
    isBefore(now, task.dueDate?.toDate()) && !isSameDay(task.dueDate?.toDate(), now)
  );

  if (loading) return <div className="p-8 text-center text-slate-500">Loading your task queue...</div>;

  const TaskList = ({ items, emptyMessage }: { items: any[], emptyMessage: string }) => {
    if (items.length === 0) return <p className="text-slate-500 text-sm py-4 border-t">{emptyMessage}</p>;
    
    return (
      <div className="space-y-3 mt-4">
        {items.map(({task, lead}) => (
          <div 
            key={task.id} 
            className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-all cursor-pointer group"
            onClick={() => router.push(`/leads/${task.leadId}`)}
          >
            <div className="flex gap-4 items-start">
              <div className="mt-1">
                {task.type === "Call" ? <Clock className="text-blue-500" size={18} /> : <Calendar className="text-purple-500" size={18} />}
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">{task.title}</h4>
                <div className="flex items-center text-xs text-slate-500 gap-3 mt-1">
                  <span>{lead?.fullName}</span>
                  {lead?.primaryPhone && <span>• {lead.primaryPhone}</span>}
                  <span>• Due: {task.dueDate?.toDate() ? format(task.dueDate.toDate(), "MMM dd, h:mm a") : "N/A"}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={task.type === "Call" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}>
                {task.type}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 hidden group-hover:flex"
                onClick={(e) => markCompleted(task.id, e)}
              >
                <CheckCircle size={18} className="mr-2" /> Complete
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Task Queue</h1>
        <p className="text-slate-500 mt-1">Your daily prioritized action list.</p>
      </div>

      {overdueTasks.length > 0 && (
        <Card className="border-rose-200 shadow-sm">
          <CardHeader className="bg-rose-50/50 pb-4 border-b border-rose-100">
            <CardTitle className="flex items-center gap-2 text-rose-700">
              <AlertCircle size={20} /> Overdue Tasks ({overdueTasks.length})
            </CardTitle>
            <CardDescription className="text-rose-600/70">These require immediate attention.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <TaskList items={overdueTasks} emptyMessage="" />
          </CardContent>
        </Card>
      )}

      <Card className="border-blue-200 shadow-sm">
        <CardHeader className="bg-blue-50/30 pb-4 border-b border-blue-100">
          <CardTitle className="text-slate-800">Due Today ({todayTasks.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <TaskList items={todayTasks} emptyMessage="You're all caught up for today! 🎉" />
        </CardContent>
      </Card>
      
      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-slate-700">Upcoming ({upcomingTasks.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <TaskList items={upcomingTasks} emptyMessage="No upcoming tasks scheduled." />
        </CardContent>
      </Card>
    </div>
  );
}
