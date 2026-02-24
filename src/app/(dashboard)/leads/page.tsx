"use client";

import { useEffect, useState } from "react";
import { where, orderBy, QueryConstraint, or } from "firebase/firestore";
import { LeadDocument } from "@/types/lead";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { queryDocuments, updateDocument } from "@/config/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Search, FileUp, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ... (LeadDocument type removed as it's now in @/types/lead)

export default function LeadsListPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [leads, setLeads] = useState<LeadDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeads() {
      if (!profile) return;

      try {
        setLoading(true);
        let allLeads: LeadDocument[] = [];

        if (profile.role === "agent") {
          // Fetch my leads and public leads separately and merge
          const myLeads = await queryDocuments<LeadDocument>("leads", [
            where("assignedAgentId", "==", profile.id)
          ]);
          const publicLeads = await queryDocuments<LeadDocument>("leads", [
            where("isPublic", "==", true)
          ]);

          // Merge and deduplicate
          const merged = [...myLeads, ...publicLeads];
          const uniqueMap = new Map();
          merged.forEach(l => uniqueMap.set(l.id, l));
          allLeads = Array.from(uniqueMap.values());
        } else {
          // Admins/Superadmins see everything
          allLeads = await queryDocuments<LeadDocument>("leads", []);
        }

        // Client-side sort
        allLeads.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setLeads(allLeads);
      } catch (error) {
        console.error("Error fetching leads:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
  }, [profile]);

  const handleClaimLead = async (e: React.MouseEvent, lead: LeadDocument) => {
    e.stopPropagation();
    if (!profile) return;

    setClaimingId(lead.id);
    try {
      await updateDocument("leads", lead.id, {
        assignedAgentId: profile.id,
        assignedAgentName: profile.name,
        isPublic: false
      });

      toast.success("Lead claimed successfully!");

      // Update local state
      setLeads(leads.map(l =>
        l.id === lead.id
          ? { ...l, assignedAgentId: profile.id, assignedAgentName: profile.name, isPublic: false }
          : l
      ));
    } catch (error) {
      toast.error("Failed to claim lead");
    } finally {
      setClaimingId(null);
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage?.toLowerCase()) {
      case "new lead": return "bg-blue-100 text-blue-800";
      case "contacted": return "bg-slate-100 text-slate-800";
      case "interested": return "bg-amber-100 text-amber-800";
      case "site visit scheduled": return "bg-purple-100 text-purple-800";
      case "negotiation": return "bg-orange-100 text-orange-800";
      case "booking": return "bg-emerald-100 text-emerald-800";
      case "closed - lost": return "bg-rose-100 text-rose-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const filteredLeads = leads.filter(lead =>
    lead.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.primaryPhone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Leads Database</h1>
          <p className="text-sm text-slate-500">Manage and track your prospects.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="hidden sm:flex" onClick={() => router.push('/leads/import')}>
            <FileUp size={16} className="mr-2" />
            Import CSV
          </Button>
          <Button onClick={() => router.push('/leads/new')}>
            <Plus size={16} className="mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search by name or phone..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-md border text-sm shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Customer Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Requirement</TableHead>
              <TableHead>Max Budget</TableHead>
              {profile?.role !== "agent" && <TableHead>Assignee</TableHead>}
              <TableHead>Added On</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={profile?.role === "agent" ? 8 : 8} className="h-24 text-center text-slate-500">
                  Loading leads...
                </TableCell>
              </TableRow>
            ) : filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={profile?.role === "agent" ? 8 : 8} className="h-24 text-center font-medium text-slate-500">
                  No leads found.
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => router.push(`/leads/${lead.id}`)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {lead.isPublic && (
                        <Globe size={14} className="text-emerald-500" />
                      )}
                      {lead.fullName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`font-normal ${getStageColor(lead.stage)}`}>
                      {lead.stage || "New"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{lead.primaryPhone}</span>
                      <span className="text-xs text-slate-500">{lead.leadSource}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{lead.bhkRequirement?.[0] || "-"}</span>
                      <span className="text-xs text-slate-500 text-ellipsis overflow-hidden whitespace-nowrap max-w-[120px]">
                        {lead.preferredLocation || "-"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {lead.budgetMax ? `₹${lead.budgetMax}L` : "-"}
                  </TableCell>
                  {profile?.role !== "agent" && (
                    <TableCell className="text-xs">
                      {lead.assignedAgentName || "Unassigned"}
                    </TableCell>
                  )}
                  <TableCell className="text-slate-500 tabular-nums">
                    {lead.createdAt?.toDate ? format(lead.createdAt.toDate(), "dd MMM yyyy") : "-"}
                  </TableCell>
                  <TableCell>
                    {lead.isPublic && profile?.role === "agent" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-[10px] text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2"
                        onClick={(e) => handleClaimLead(e, lead)}
                        disabled={claimingId === lead.id}
                      >
                        {claimingId === lead.id ? "..." : "Claim"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
