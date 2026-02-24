"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useAuth } from "@/context/AuthContext";
import { queryDocuments, updateDocument, createDocument } from "@/config/db";
import { where, orderBy, QueryConstraint } from "firebase/firestore";
import { LeadDocument } from "@/types/lead";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Define the precise stages in order required by the PRD
const PIPELINE_STAGES = [
  "New Lead",
  "Contacted",
  "Interested",
  "Site Visit Scheduled",
  "Site Visit Done",
  "Negotiation",
  "Booking",
];

export default function PipelinePage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [columns, setColumns] = useState<Record<string, LeadDocument[]>>({});
  const [loading, setLoading] = useState(true);

  // Initial fetch
  useEffect(() => {
    async function fetchPipeline() {
      if (!profile) return;
      try {
        const constraints: QueryConstraint[] = [];
        if (profile.role === "agent") {
          constraints.push(where("assignedAgentId", "==", profile.id));
        }
        constraints.push(where("stage", "in", PIPELINE_STAGES));
        
        const data = await queryDocuments<LeadDocument>("leads", constraints);
        
        // Client-side sort to avoid Firebase index requirement
        data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        
        // Group by stage
        const initialColumns: Record<string, LeadDocument[]> = {};
        PIPELINE_STAGES.forEach(stage => {
          initialColumns[stage] = data.filter(lead => lead.stage === stage);
        });
        
        setColumns(initialColumns);
      } catch (error) {
        console.error("Pipeline fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPipeline();
  }, [profile]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceCol = [...columns[source.droppableId]];
      const destCol = [...columns[destination.droppableId]];
      
      const [removed] = sourceCol.splice(source.index, 1);
      
      // Setup optimistic UI update
      const updatedLead = { ...removed, stage: destination.droppableId };
      destCol.splice(destination.index, 0, updatedLead);
      
      setColumns({
        ...columns,
        [source.droppableId]: sourceCol,
        [destination.droppableId]: destCol,
      });

      // Persist to DB
      try {
        await updateDocument("leads", draggableId, { 
          stage: destination.droppableId 
        });
        
        // Phase 1 Requirement: Log Stage Change to interactions
        await createDocument("interactions", {
          leadId: draggableId,
          type: "STAGE_CHANGE",
          fromStage: source.droppableId,
          toStage: destination.droppableId,
          note: `Moved to ${destination.droppableId}`,
          agentId: profile?.id,
          agentName: profile?.name
        });

        toast.success(`Moved to ${destination.droppableId}`);
      } catch {
        toast.error("Failed to update lead stage");
        // Rollback state omitted for brevity in MVP
      }
    } else {
      // Reordering within the same column
      const col = [...columns[source.droppableId]];
      const [removed] = col.splice(source.index, 1);
      col.splice(destination.index, 0, removed);
      
      setColumns({
        ...columns,
        [source.droppableId]: col,
      });
    }
  };

  const getUrgencyColor = (score: number) => {
    if (score > 80) return "border-l-4 border-l-emerald-500";
    if (score > 50) return "border-l-4 border-l-amber-500";
    return "border-l-4 border-l-rose-500";
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Pipeline...</div>;

  return (
    <div className="h-full flex flex-col space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sales Pipeline</h1>
        <p className="text-sm text-slate-500">Drag and drop leads to update their stage.</p>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 h-[calc(100vh-200px)] min-w-max">
            {PIPELINE_STAGES.map((stage) => (
              <div key={stage} className="w-80 flex flex-col bg-slate-100 rounded-xl max-h-full">
                {/* Column Header */}
                <div className="p-3 flex justify-between items-center border-b border-slate-200 shrink-0">
                  <h3 className="font-semibold text-sm text-slate-700">{stage}</h3>
                  <Badge variant="secondary" className="bg-slate-200 text-slate-700">
                    {columns[stage]?.length || 0}
                  </Badge>
                </div>
                
                {/* Droppable Area */}
                <Droppable droppableId={stage}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 p-3 overflow-y-auto space-y-1 min-h-[150px] transition-colors ${
                        snapshot.isDraggingOver ? "bg-slate-200/50 rounded-b-xl" : ""
                      }`}
                    >
                      {columns[stage]?.map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{ ...provided.draggableProps.style }}
                            >
                              <Card 
                                className={`shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${getUrgencyColor(lead.leadScore || 50)} ${snapshot.isDragging ? "ring-2 ring-primary" : ""}`}
                                onClick={() => router.push(`/leads/${lead.id}`)}
                              >
                                  <CardContent className="px-2">
                                    <div className="flex justify-between items-start">
                                      <h4 className="font-semibold text-sm truncate pr-2">{lead.fullName}</h4>
                                      <span className="text-xs font-bold text-slate-500">
                                        {lead.leadScore || 50}
                                      </span>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-1">
                                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-slate-50">
                                      {lead.budgetMax ? `₹${lead.budgetMax}L` : "No Budget"}
                                    </Badge>
                                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-slate-50 truncate max-w-[80px]">
                                      {lead.bhkRequirement?.[0] || "Any"}
                                    </Badge>
                                  </div>

                                  <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                                    <div className="flex items-center gap-1">
                                      <Phone size={10} />
                                      <span className="truncate max-w-[70px]">{lead.primaryPhone}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Calendar size={10} />
                                      {/* Mock Next Follow Up Date */}
                                      <span>Today</span> 
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
