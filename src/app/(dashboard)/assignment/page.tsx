"use client";

import { useEffect, useState } from "react";
import { useAuth, UserProfile } from "@/context/AuthContext";
import { LeadDocument } from "@/types/lead";
import { queryDocuments, updateDocument } from "@/config/db";
import { orderBy, QueryConstraint } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, Globe, Lock, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AssignmentPage() {
    const { profile } = useAuth();
    const router = useRouter();
    const [leads, setLeads] = useState<LeadDocument[]>([]);
    const [team, setTeam] = useState<UserProfile[]>([]);
    const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (profile && profile.role !== "super_admin" && profile.role !== "admin") {
            toast.error("Unauthorized access");
            router.push("/dashboard");
            return;
        }

        async function fetchData() {
            try {
                setLoading(true);
                // Fetch all leads
                const leadData = await queryDocuments<LeadDocument>("leads", [orderBy("createdAt", "desc")]);
                setLeads(leadData as any);

                // Fetch all team members (active only)
                const userData = await queryDocuments<UserProfile>("users", [orderBy("name", "asc")]);
                setTeam(userData.filter(u => u.isActive) as any);
            } catch (error) {
                console.error("Error fetching assignment data:", error);
                toast.error("Failed to load data");
            } finally {
                setLoading(false);
            }
        }

        if (profile) fetchData();
    }, [profile, router]);

    const toggleLeadSelection = (leadId: string) => {
        setSelectedLeadIds(prev =>
            prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]
        );
    };

    const handleBulkAssign = async (userId: string) => {
        if (selectedLeadIds.length === 0) return;

        const user = team.find(u => u.id === userId);
        if (!user) return;

        setIsProcessing(true);
        try {
            for (const id of selectedLeadIds) {
                await updateDocument("leads", id, {
                    assignedAgentId: user.id,
                    assignedAgentName: user.name,
                    isPublic: false // Assigned leads are typically not public
                });
            }

            toast.success(`Assigned ${selectedLeadIds.length} leads to ${user.name}`);

            // Update local state
            setLeads(leads.map(l =>
                selectedLeadIds.includes(l.id)
                    ? { ...l, assignedAgentId: user.id, assignedAgentName: user.name, isPublic: false }
                    : l
            ));
            setSelectedLeadIds([]);
        } catch (error) {
            toast.error("Failed to assign leads");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBulkPublicToggle = async (isPublic: boolean) => {
        if (selectedLeadIds.length === 0) return;

        setIsProcessing(true);
        try {
            for (const id of selectedLeadIds) {
                await updateDocument("leads", id, { isPublic });
            }

            toast.success(`${isPublic ? 'Publicized' : 'Privatized'} ${selectedLeadIds.length} leads`);

            setLeads(leads.map(l =>
                selectedLeadIds.includes(l.id) ? { ...l, isPublic } : l
            ));
            setSelectedLeadIds([]);
        } catch (error) {
            toast.error("Operation failed");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading assignment module...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lead Assignment Console</h1>
                    <p className="text-slate-500 mt-1">Distribute leads across your team or manage global visibility.</p>
                </div>

                {selectedLeadIds.length > 0 && (
                    <div className="flex flex-wrap items-center gap-3 bg-primary/5 p-3 rounded-lg border border-primary/20 animate-in fade-in slide-in-from-top-2">
                        <span className="text-sm font-medium text-primary mr-2">
                            {selectedLeadIds.length} selected
                        </span>

                        <Select onValueChange={handleBulkAssign} disabled={isProcessing}>
                            <SelectTrigger className="w-[200px] h-9 text-xs bg-white">
                                <UserPlus size={14} className="mr-2" />
                                <SelectValue placeholder="Assign to agent..." />
                            </SelectTrigger>
                            <SelectContent>
                                {team.map(user => (
                                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 text-xs bg-white"
                            onClick={() => handleBulkPublicToggle(true)}
                            disabled={isProcessing}
                        >
                            <Globe size={14} className="mr-2 text-emerald-600" />
                            Make Public
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 text-xs bg-white"
                            onClick={() => handleBulkPublicToggle(false)}
                            disabled={isProcessing}
                        >
                            <Lock size={14} className="mr-2 text-slate-600" />
                            Make Private
                        </Button>
                    </div>
                )}
            </div>

            <Card className="overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={selectedLeadIds.length === leads.length && leads.length > 0}
                                    onCheckedChange={(checked) => {
                                        setSelectedLeadIds(checked ? leads.map(l => l.id) : []);
                                    }}
                                />
                            </TableHead>
                            <TableHead>Lead Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Stage</TableHead>
                            <TableHead>Current Assignee</TableHead>
                            <TableHead>Visibility</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leads.map((lead) => (
                            <TableRow key={lead.id} className={selectedLeadIds.includes(lead.id) ? "bg-primary/5" : ""}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedLeadIds.includes(lead.id)}
                                        onCheckedChange={() => toggleLeadSelection(lead.id)}
                                    />
                                </TableCell>
                                <TableCell className="font-medium underline decoration-slate-200 underline-offset-4 pointer-events-none">
                                    {lead.fullName}
                                </TableCell>
                                <TableCell className="text-slate-500">{lead.primaryPhone}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="font-normal text-[10px] uppercase tracking-wider">
                                        {lead.stage}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border">
                                            {lead.assignedAgentName?.charAt(0) || "?"}
                                        </div>
                                        <span className="text-sm">{lead.assignedAgentName || "Unassigned"}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {lead.isPublic ? (
                                        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200">
                                            <Globe size={12} className="mr-1" /> Public
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-slate-50 text-slate-600 border-slate-200">
                                            <Lock size={12} className="mr-1" /> Private
                                        </Badge>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-emerald-50/30 border-emerald-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-900">
                            <Globe size={16} /> Public Leads
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-emerald-800">
                        Public leads are visible to ALL agents. Anyone can "Claim" a public lead to take ownership of it.
                    </CardContent>
                </Card>

                <Card className="bg-amber-50/30 border-amber-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-900">
                            <Users size={16} /> Direct Assignment
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-amber-800">
                        Directly assigned leads are only visible to the specific agent and administrators.
                    </CardContent>
                </Card>

                <Card className="bg-slate-50/50 border-slate-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                            <Lock size={16} /> Data Security
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-slate-600">
                        Agents cannot see each other's private leads. Team Leaders can see all leads for their team.
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
