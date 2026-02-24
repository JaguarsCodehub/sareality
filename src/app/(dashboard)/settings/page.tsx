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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);

  async function fetchUsers() {
    try {
      setLoading(true);
      const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];
      const userData = await queryDocuments<UserProfile>("users", constraints);
      setUsers(userData as any);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (profile && profile.role !== "admin" && profile.role !== "super_admin") {
      toast.error("Unauthorized access");
      router.push("/dashboard");
      return;
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

  const migrateDummyUsers = async () => {
    const dummyUpdates = [
      { oldEmail: "emily@sareality.com", newEmail: "anjali@sareality.com", newName: "Anjali Gupta" },
      { oldEmail: "michael@sareality.com", newEmail: "vikram@sareality.com", newName: "Vikram Singh" },
      { oldEmail: "david@sareality.com", newEmail: "rohan@sareality.com", newName: "Rohan Mehta" },
      { oldEmail: "sarah@sareality.com", newEmail: "priya@sareality.com", newName: "Priya Sharma" },
      // Also check if they were already renamed but email wasn't changed
      { oldEmail: "anjali@sareality.com", newEmail: "anjali@sareality.com", newName: "Anjali Gupta" },
      { oldEmail: "vikram@sareality.com", newEmail: "vikram@sareality.com", newName: "Vikram Singh" },
      { oldEmail: "rohan@sareality.com", newEmail: "rohan@sareality.com", newName: "Rohan Mehta" },
      { oldEmail: "priya@sareality.com", newEmail: "priya@sareality.com", newName: "Priya Sharma" },
    ];

    try {
      setIsMigrating(true);
      let updatedCount = 0;
      for (const update of dummyUpdates) {
        const user = users.find(u => u.email === update.oldEmail);
        if (user) {
          await updateDocument("users", user.id, {
            name: update.newName,
            email: update.newEmail
          });
          updatedCount++;
        }
      }

      if (updatedCount > 0) {
        toast.success(`Successfully updated ${updatedCount} profiles to Indian names!`);
        fetchUsers();
      } else {
        toast.info("No matching dummy profiles found for update.");
      }
    } catch (error) {
      toast.error("Failed to update dummy profiles");
    } finally {
      setIsMigrating(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading settings...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Administration Settings</h1>
          <p className="text-slate-500 mt-1">Manage platform users, roles, and global configurations.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-primary border-primary/20 hover:bg-primary/5"
          onClick={migrateDummyUsers}
          disabled={isMigrating}
        >
          {isMigrating ? "Updating..." : "Localize Dummy Users (Indian Names)"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert size={20} className="text-primary" /> Access Control & Team directory
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
                        disabled={user.id === profile?.id}
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
                          disabled={user.id === profile?.id}
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

      <Card className="border-amber-200 bg-amber-50/20">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-amber-900">User Setup Guide</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-amber-800 space-y-2">
          <p><strong>To add a new user:</strong></p>
          <ol className="list-decimal ml-4 space-y-1">
            <li>Create the account in <strong>Firebase Authentication</strong> using their email.</li>
            <li>Copy the <strong>UID</strong> from Firebase Auth.</li>
            <li>Create a document in the <code>users</code> collection in Firestore with the <strong>document ID</strong> matching that UID.</li>
            <li>Ensure the document has fields: <code>name</code>, <code>email</code>, <code>role</code>, and <code>isActive: true</code>.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
