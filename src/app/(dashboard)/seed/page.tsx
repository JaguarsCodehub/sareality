"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createDocument, setDocument } from "@/config/db";
import { LeadSources, PropertyTypes, BHKRequirements } from "@/types/lead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Database, Loader2 } from "lucide-react";

const PIPELINE_STAGES = [
  "New Lead",
  "Contacted",
  "Interested",
  "Site Visit Scheduled",
  "Site Visit Done",
  "Negotiation",
  "Booking",
];

const DUMMY_NAMES = [
  "Rahul Sharma", "Priya Singh", "Amit Kumar", "Neha Patel", "Vikram Malhotra",
  "Anjali Desai", "Rohan Gupta", "Sneha Iyer", "Aditya Verma", "Kavita Reddy"
];

const DUMMY_AGENTS = [
  { id: "agent_123", name: "Sarah Collins", email: "sarah@sareality.com", role: "agent", isActive: true },
  { id: "agent_124", name: "David Miller", email: "david@sareality.com", role: "agent", isActive: true },
  { id: "tl_125", name: "Michael Chang", email: "michael@sareality.com", role: "team_leader", isActive: true },
  { id: "agent_126", name: "Emily Davis", email: "emily@sareality.com", role: "agent", isActive: false },
];

function getRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export default function SeedPage() {
  const { profile } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
      toast.error("Only admins can seed data.");
      return;
    }

    setIsSeeding(true);
    try {
      // 1. Create Dummy Users
      for (const agent of DUMMY_AGENTS) {
        await setDocument("users", agent.id, {
          name: agent.name,
          email: agent.email,
          role: agent.role as any,
          isActive: agent.isActive,
        });
      }

      // 2. Add current user to potential assignees pool
      const possibleAssignees = [...DUMMY_AGENTS, { id: profile.id, name: profile.name }];

      // 3. Create 30 Leads
      for (let i = 0; i < 30; i++) {
        const assignee = getRandom(possibleAssignees);
        const stage = getRandom(PIPELINE_STAGES);
        const createdDate = getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()); // Last 30 days
        
        const leadPayload = {
          fullName: getRandom(DUMMY_NAMES) + " " + Math.floor(Math.random() * 1000),
          primaryPhone: `+91 ${Math.floor(6000000000 + Math.random() * 3999999999)}`,
          email: `lead${i}@example.com`,
          leadSource: getRandom([...LeadSources]),
          propertyTypeInterest: [getRandom([...PropertyTypes])],
          bhkRequirement: [getRandom([...BHKRequirements])],
          budgetMax: Math.floor(Math.random() * 100) + 50,
          preferredLocation: getRandom(["Whitefield", "Indiranagar", "Koramangala", "HSR Layout", "Electronic City", "Bellandur"]),
          stage: stage,
          leadScore: Math.floor(Math.random() * 60) + 40,
          assignedAgentId: assignee.id,
          assignedAgentName: assignee.name,
          createdAt: createdDate,
          updatedAt: createdDate, // Hardcoded bypass of serverTimestamp() for historical data
        };

        const leadId = await createDocument("leads", leadPayload);

        // 4. Create 2-3 Interactions for each lead
        const numInteractions = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < numInteractions; j++) {
          const interactionDate = getRandomDate(createdDate, new Date());
          await createDocument("interactions", {
            leadId,
            type: getRandom(["CALL", "NOTE", "WHATSAPP", "STAGE_CHANGE"]),
            note: `Discussed property requirements. Budget is around ${leadPayload.budgetMax}L. Client seemed ${getRandom(["interested", "hesitant", "eager"])}.`,
            agentId: assignee.id,
            agentName: assignee.name,
            createdAt: interactionDate,
          });
        }

        // 5. Create 1-2 Tasks for each lead (Pending or Completed)
        const numTasks = Math.floor(Math.random() * 2) + 1;
        for (let k = 0; k < numTasks; k++) {
          const isCompleted = Math.random() > 0.5;
          const status = isCompleted ? "Completed" : "Pending";
          
          // Pending tasks are usually future or recently overdue. Completed tasks are in the past.
          const dueDate = isCompleted 
            ? getRandomDate(createdDate, new Date()) 
            : getRandomDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), new Date(Date.now() + 5 * 24 * 60 * 60 * 1000));
            
          await createDocument("tasks", {
            leadId,
            assignedAgentId: assignee.id,
            type: getRandom(["Call", "Site Visit", "WhatsApp"]),
            title: `Follow up with ${leadPayload.fullName}`,
            dueDate: dueDate,
            status: status,
            createdAt: createdDate,
          });
        }
      }

      toast.success("Successfully generated demo CRM data!");
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to seed data: " + error.message);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Demo Data Generator</h1>
        <p className="text-slate-500 mt-1">Populate your CRM with realistic dummy data instantly.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database size={20} className="text-primary" /> Generate Mock Data
          </CardTitle>
          <CardDescription>
            This action will generate 30 random leads at various stages, assign them to 4 simulated agents (along with yourself), and generate random interactions and follow-up tasks to fill the Kanban boards and task lists.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleSeed} 
            disabled={isSeeding}
            className="w-full bg-slate-900 hover:bg-slate-800"
          >
            {isSeeding ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Data...</>
            ) : (
              "Inject Demo Data"
            )}
          </Button>
        </CardContent>
      </Card>
      
      <p className="text-xs text-slate-500 text-center">
        Note: You should only run this once to avoid cluttering your Firebase project.
      </p>
    </div>
  );
}
