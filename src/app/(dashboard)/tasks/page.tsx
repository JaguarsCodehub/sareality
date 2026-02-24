"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { queryDocuments, updateDocument, getDocument } from "@/config/db";
import { where, orderBy, QueryConstraint } from "firebase/firestore";
import { format, isBefore, isSameDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Calendar, AlertCircle, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LeadDocument } from "@/types/lead";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// Extend with Firebase ID and metadata
export type TaskDocument = {
  id: string;
  leadId: string;
  assignedAgentId: string;
  type: "Call" | "Site Visit" | "WhatsApp";
  title: string;
  dueDate: any;
  status: "Pending" | "In Progress" | "Completed";
  remark?: string;
  completedAt?: any;
  createdAt: any;
};

type TaskWithLead = {
  task: TaskDocument;
  lead?: LeadDocument;
};

export default function TasksPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskWithLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [remark, setRemark] = useState("");
  const [submittingRemark, setSubmittingRemark] = useState(false);

  const fetchTasks = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const constraints: QueryConstraint[] = [];

      // RBAC: Agents only see their tasks
      if (profile.role === "agent") {
        constraints.push(where("assignedAgentId", "==", profile.id));
      }

      const taskData = await queryDocuments<TaskDocument>("tasks", constraints);

      // Client-side sort to avoid Firebase index requirement
      taskData.sort((a, b) => (a.dueDate?.seconds || 0) - (b.dueDate?.seconds || 0));

      // Hydrate leads
      const populatedTasks = await Promise.all(
        taskData.map(async (task) => {
          if (!task.leadId) return { task, lead: undefined };
          try {
            const lead = await getDocument<LeadDocument>("leads", task.leadId);
            return { task, lead: lead || undefined };
          } catch (e) {
            console.error(`Failed to fetch lead ${task.leadId} for task ${task.id}`);
            return { task, lead: undefined };
          }
        })
      );

      setTasks(populatedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [profile]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as TaskDocument["status"];

    if (newStatus === "Completed") {
      setSelectedTaskId(draggableId);
      setIsRemarkModalOpen(true);
      return;
    }

    // Optimistic UI update
    const updatedTasks = [...tasks];
    const taskIndex = updatedTasks.findIndex(t => t.task.id === draggableId);
    if (taskIndex !== -1) {
      updatedTasks[taskIndex].task.status = newStatus;
      setTasks(updatedTasks);
    }

    try {
      await updateDocument("tasks", draggableId, { status: newStatus });
      toast.success(`Task moved to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update task status");
      fetchTasks(); // Rollback on error
    }
  };

  const handleCompleteWithRemark = async () => {
    if (!selectedTaskId || !remark.trim()) {
      toast.error("Please provide a remark/proof of completion");
      return;
    }

    try {
      setSubmittingRemark(true);
      await updateDocument("tasks", selectedTaskId, {
        status: "Completed",
        remark,
        completedAt: new Date()
      });

      toast.success("Task completed successfully");
      setIsRemarkModalOpen(false);
      setRemark("");
      setSelectedTaskId(null);
      fetchTasks();
    } catch (error) {
      toast.error("Failed to complete task");
    } finally {
      setSubmittingRemark(false);
    }
  };

  const columns: { id: TaskDocument["status"]; title: string }[] = [
    { id: "Pending", title: "Todo" },
    { id: "In Progress", title: "In Progress" },
    { id: "Completed", title: "Completed" },
  ];

  if (loading) return <div className="p-8 text-center text-slate-500">Loading your board...</div>;

  const now = new Date();

  const getTaskPriorityStyle = (task: TaskDocument) => {
    if (task.status === "Completed") return "border-slate-200 opacity-75";
    if (isBefore(task.dueDate?.toDate(), now) && !isSameDay(task.dueDate?.toDate(), now)) {
      return "border-rose-200 bg-rose-50/20";
    }
    if (isSameDay(task.dueDate?.toDate(), now)) {
      return "border-blue-200 bg-blue-50/10";
    }
    return "border-slate-200 bg-white";
  };

  return (
    <div className="h-full flex flex-col space-y-4 overflow-hidden">
      <div className="flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Task Board</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage your calls and follow-ups in a Kanban view.</p>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0 pb-4">
          {columns.map((column) => (
            <div key={column.id} className="flex flex-col bg-slate-50/50 rounded-xl border border-slate-200 min-h-0 h-full overflow-hidden shadow-sm">
              <div className="p-4 border-b bg-white rounded-t-xl flex items-center justify-between shrink-0">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                  {column.title}
                  <Badge variant="secondary" className="bg-slate-100 text-slate-600 ml-1">
                    {tasks.filter(t => t.task.status === column.id).length}
                  </Badge>
                </h3>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 p-3 overflow-y-auto min-h-0 space-y-3 transition-colors ${snapshot.isDraggingOver ? "bg-slate-100/50" : ""
                      }`}
                  >
                    {tasks
                      .filter((t) => t.task.status === column.id)
                      .map((taskWithLead, index) => {
                        const { task, lead } = taskWithLead;
                        const isOverdue = isBefore(task.dueDate?.toDate(), now) && !isSameDay(task.dueDate?.toDate(), now) && task.status !== "Completed";

                        return (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-4 border rounded-lg shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${snapshot.isDragging ? "shadow-lg ring-2 ring-primary/20 rotate-1" : ""
                                  } ${getTaskPriorityStyle(task)}`}
                                onClick={() => router.push(`/leads/${task.leadId}`)}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <Badge variant="outline" className={task.type === "Call" ? "text-blue-600 border-blue-100 bg-blue-50" : "text-purple-600 border-purple-100 bg-purple-50"}>
                                    {task.type}
                                  </Badge>
                                  {isOverdue && <AlertCircle size={14} className="text-rose-500" />}
                                </div>
                                <h4 className="font-semibold text-slate-800 text-sm mb-1">{task.title}</h4>
                                <div className="text-xs text-slate-500 space-y-1">
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium text-slate-600">{lead?.fullName}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock size={12} />
                                    <span>{task.dueDate?.toDate() ? format(task.dueDate.toDate(), "MMM dd, h:mm a") : "N/A"}</span>
                                  </div>
                                </div>
                                {task.remark && (
                                  <div className="mt-3 pt-2 border-t text-[10px] text-slate-500 italic flex gap-1 items-start">
                                    <MessageSquare size={10} className="mt-0.5 shrink-0" />
                                    <span className="line-clamp-2">{task.remark}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Completion Remark Modal */}
      <Dialog open={isRemarkModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsRemarkModalOpen(false);
          setRemark("");
          setSelectedTaskId(null);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Task</DialogTitle>
            <DialogDescription>
              Please provide a brief remark or proof of completion for this task.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="e.g. Spoke with client, site visit scheduled for next week..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRemarkModalOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCompleteWithRemark}
              disabled={!remark.trim() || submittingRemark}
            >
              {submittingRemark ? "Submitting..." : "Confirm Completion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
