"use client";

import { useEffect, useState } from "react";
import { useAuth, UserProfile } from "@/context/AuthContext";
import { queryDocuments, updateDocument } from "@/config/db";
import { orderBy, QueryConstraint } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Basic Client-Side Protected Route Guarding for Admin layer
    if (profile && profile.role !== "admin" && profile.role !== "super_admin") {
      toast.error("Unauthorized access");
      router.push("/dashboard");
      return;
    }

    async function fetchUsers() {
      try {
        const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];
        // Note: For Phase 1 MVP, we define the User accounts directly in Firebase Auth/Firestore manually or via simple script
        // This view is for Admins to view them and update their Roles/Active status
        const userData = await queryDocuments<UserProfile>("users", constraints);
        setUsers(userData as any);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    }

    if (profile) fetchUsers();
  }, [profile, router]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateDocument("users", userId, { role: newRole as any });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
      toast.success("User role updated");
    } catch (e) {
      toast.error("Failed to update user role");
    }
  };

  const handleStatusChange = async (userId: string, isActive: boolean) => {
    try {
      await updateDocument("users", userId, { isActive });
      setUsers(users.map(u => u.id === userId ? { ...u, isActive } : u));
      toast.success(isActive ? "User activated" : "User deactivated");
    } catch (e) {
      toast.error("Failed to update user status");
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading settings...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Administration Settings</h1>
        <p className="text-slate-500 mt-1">Manage platform users, roles, and global configurations.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert size={20} className="text-primary"/> Access Control & Team directory
          </CardTitle>
          <CardDescription>
            Agents can only see their own assigned leads. Team Leaders see all leads for their team. Admins see everything.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-md border text-sm shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-slate-500">{user.email}</TableCell>
                    <TableCell>
                      <Select 
                        value={user.role} 
                        onValueChange={(val) => handleRoleChange(user.id, val)}
                        disabled={user.id === profile?.id} // Can't change own role
                      >
                        <SelectTrigger className="w-[160px] h-8 text-xs">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="agent">Sales Agent</SelectItem>
                          <SelectItem value="team_leader">Team Leader</SelectItem>
                          <SelectItem value="admin">Admin / Manager</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                         <Switch
                            checked={user.isActive}
                            onCheckedChange={(checked: boolean) => handleStatusChange(user.id, checked)}
                            disabled={user.id === profile?.id} // Can't deactivate self
                         />
                         <Badge variant="outline" className={user.isActive ? "text-emerald-600 bg-emerald-50" : "text-slate-500"}>
                           {user.isActive ? 'Active' : 'Inactive'}
                         </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Real app would have Project Master data, Pipeline Editor, etc. here for Phase 4 */}
    </div>
  );
}
