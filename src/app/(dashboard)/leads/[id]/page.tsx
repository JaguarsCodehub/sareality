"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getDocument, createDocument, queryDocuments } from "@/config/db";
import { updateDocument } from "@/config/db";
import { LeadDocument } from "@/app/(dashboard)/leads/page";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Phone, Mail, Building2, Wallet, Tag } from "lucide-react";
import { format } from "date-fns";
import { where, orderBy, QueryConstraint } from "firebase/firestore";

interface Interaction {
  id: string;
  type: "CALL" | "STAGE_CHANGE" | "NOTE" | "WHATSAPP";
  note: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt: any;
  agentName: string;
}

export default function LeadProfilePage() {
  const { id } = useParams();
  const leadId = id as string;
  const { profile } = useAuth();
  const router = useRouter();
  
  const [lead, setLead] = useState<LeadDocument | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Call Logging State
  const [callNote, setCallNote] = useState("");
  const [nextFollowUpConfig, setNextFollowUpConfig] = useState("1_day");

  useEffect(() => {
    async function fetchLeadData() {
      try {
        const leadData = await getDocument<LeadDocument>("leads", leadId);
        if (!leadData) {
          toast.error("Lead not found");
          router.push("/leads");
          return;
        }

        // RBAC validation
        if (profile?.role === "agent" && leadData.assignedAgentId !== profile.id) {
          toast.error("Unauthorized access to this lead");
          router.push("/leads");
          return;
        }

        setLead(leadData);

        // Fetch Interactions
        const intConstraints: QueryConstraint[] = [
          where("leadId", "==", leadId)
        ];
        const intData = await queryDocuments<Interaction>("interactions", intConstraints);
        intData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setInteractions(intData);

      } catch (error) {
        console.error("Error fetching lead profile:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (profile) fetchLeadData();
  }, [leadId, profile, router]);

  const handleLogCall = async () => {
    if (!callNote.trim()) {
      toast.error("Call note cannot be empty");
      return;
    }

    try {
      // 1. Create the Interaction Record
      await createDocument("interactions", {
        leadId,
        type: "CALL",
        note: callNote,
        agentId: profile?.id,
        agentName: profile?.name
      });

      // 2. Calculate Next Follow up Date
      const nextDate = new Date();
      if (nextFollowUpConfig === "1_day") nextDate.setDate(nextDate.getDate() + 1);
      if (nextFollowUpConfig === "3_days") nextDate.setDate(nextDate.getDate() + 3);
      if (nextFollowUpConfig === "1_week") nextDate.setDate(nextDate.getDate() + 7);

      // 3. Create the automated Follow-up Task in the Queue
      await createDocument("tasks", {
        leadId,
        assignedAgentId: lead?.assignedAgentId,
        type: "Call",
        dueDate: nextDate,
        status: "Pending",
        title: `Follow up: ${lead?.fullName}`
      });

      // 4. Update the Lead's Master Record
      await updateDocument("leads", leadId, {
        nextFollowUpDate: nextDate,
        lastAgreedAction: "Call Logged",
      });

      toast.success("Call logged and follow-up scheduled!");
      setCallNote(""); // reset UI
      
      // Refresh interactions (simple reload for MVP)
      const intData = await queryDocuments<Interaction>("interactions", [
        where("leadId", "==", leadId)
      ]);
      intData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setInteractions(intData);

    } catch (error) {
      console.error(error);
      toast.error("Failed to log call");
    }
  };

  if (loading || !lead) return <div className="p-8 text-center text-slate-500">Loading profile...</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Profile Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex gap-4 items-center">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xl font-bold">
            {lead.fullName.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{lead.fullName}</h1>
            <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
              <span className="flex items-center gap-1"><Phone size={14}/> {lead.primaryPhone}</span>
              {lead.email && <span className="flex items-center gap-1"><Mail size={14}/> {lead.email}</span>}
              <span className="flex items-center gap-1"><Tag size={14}/> {lead.leadSource}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge className="text-sm px-3 py-1 bg-amber-100 text-amber-800 hover:bg-amber-100">{lead.stage}</Badge>
          <p className="text-xs text-slate-500">Score: <span className="font-bold text-slate-700">{lead.leadScore}</span>/100</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Specs & Forms */}
        <div className="col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Property Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-y-3">
                <div className="text-slate-500 flex items-center gap-2"><Building2 size={14}/> Types</div>
                <div className="font-medium text-right">{lead.propertyTypeInterest?.join(", ") || "-"}</div>
                
                <div className="text-slate-500">BHK</div>
                <div className="font-medium text-right">{lead.bhkRequirement?.join(", ") || "-"}</div>
                
                <div className="text-slate-500 flex items-center gap-2"><Wallet size={14}/> Budget Max</div>
                <div className="font-medium text-right">{lead.budgetMax ? `₹${lead.budgetMax}L` : "-"}</div>
                
                <div className="text-slate-500">Pref. Location</div>
                <div className="font-medium text-right">{lead.preferredLocation || "-"}</div>
                
                <div className="text-slate-500">Urgency</div>
                <div className="font-medium text-right">{lead.urgencyOfPurchase || "-"}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Interaction Hub */}
        <div className="col-span-2">
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="activity">Activity Logger</TabsTrigger>
              <TabsTrigger value="history">Interaction History</TabsTrigger>
              <TabsTrigger value="tasks">Pending Tasks</TabsTrigger>
            </TabsList>
            
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Log a Call</CardTitle>
                  <CardDescription>Records the note and automatically queues your next follow-up task.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Call Summary Note</Label>
                    <Textarea 
                      placeholder="e.g. Spoke to customer, they want 2BHK in Tower B. Needs spouse approval."
                      rows={4}
                      value={callNote}
                      onChange={(e) => setCallNote(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Schedule Next Follow-up</Label>
                      <Select value={nextFollowUpConfig} onValueChange={setNextFollowUpConfig}>
                        <SelectTrigger>
                          <SelectValue placeholder="When to call back?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1_day">Tomorrow (+24 hours)</SelectItem>
                          <SelectItem value="3_days">In 3 Days</SelectItem>
                          <SelectItem value="1_week">Next Week</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button className="w-full" onClick={handleLogCall}>Log Call & Schedule Task</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Timeline History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6 pl-4 border-l-2 border-slate-100 ml-2">
                    {interactions.length === 0 ? (
                      <p className="text-slate-500 text-sm py-4">No interactions logged yet.</p>
                    ) : (
                      interactions.map((int) => (
                        <div key={int.id} className="relative">
                          {/* Dot marker */}
                          <div className={`absolute -left-[21px] top-1 rounded-full h-3 w-3 border-2 border-white
                            ${int.type === 'CALL' ? 'bg-blue-500' : 
                              int.type === 'STAGE_CHANGE' ? 'bg-amber-500' : 'bg-slate-500'}`} />
                          
                          <div className="bg-slate-50 p-3 rounded-md text-sm border">
                            <div className="flex justify-between items-start mb-1 text-xs text-slate-500">
                              <span className="font-bold uppercase tracking-wider text-slate-700">{int.type.replace("_", " ")}</span>
                              <span>{int.createdAt?.toDate ? format(int.createdAt.toDate(), "dd MMM, HH:mm") : "Just now"}</span>
                            </div>
                            <p className="text-slate-700">{int.note}</p>
                            <span className="text-xs text-slate-400 mt-2 block">- Logged by {int.agentName}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tasks">
               <Card>
                  <CardContent className="h-40 flex items-center justify-center text-slate-400">
                     Tasks view goes here
                  </CardContent>
               </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
