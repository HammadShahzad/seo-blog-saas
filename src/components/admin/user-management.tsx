"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Loader2, Search, Edit, Users, Plus,
  Trash2, Crown, Shield, User as UserIcon,
} from "lucide-react";

type UserWithSubscription = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  subscription: {
    id: string;
    plan: string;
    maxWebsites: number;
    maxPostsPerMonth: number;
    maxImagesPerMonth: number;
    websitesUsed: number;
    postsGeneratedThisMonth: number;
    imagesGeneratedThisMonth: number;
  } | null;
};

type OrgMember = {
  id: string;
  role: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string | null; createdAt: string };
};

export function UsersTab() {
  const [users, setUsers] = useState<UserWithSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithSubscription | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const PLAN_LIMITS: Record<string, { maxWebsites: number; maxPosts: number; maxImages: number }> = {
    FREE:       { maxWebsites: 1,   maxPosts: 2,    maxImages: 2 },
    STARTER:    { maxWebsites: 3,   maxPosts: 25,   maxImages: 25 },
    GROWTH:     { maxWebsites: 10,  maxPosts: 100,  maxImages: 100 },
    AGENCY:     { maxWebsites: 50,  maxPosts: 500,  maxImages: 500 },
    ENTERPRISE: { maxWebsites: 999, maxPosts: 9999, maxImages: 9999 },
  };

  const [role, setRole] = useState("USER");
  const [plan, setPlan] = useState("FREE");
  const [maxWebsites, setMaxWebsites] = useState(1);
  const [maxPosts, setMaxPosts] = useState(5);
  const [maxImages, setMaxImages] = useState(5);
  const [websitesUsed, setWebsitesUsed] = useState(0);
  const [postsUsed, setPostsUsed] = useState(0);
  const [imagesUsed, setImagesUsed] = useState(0);
  const [orgMembers, setOrgMembers] = useState<OrgMember[]>([]);
  const [isMembersLoading, setIsMembersLoading] = useState(false);
  const [addMemberEmail, setAddMemberEmail] = useState("");
  const [addMemberRole, setAddMemberRole] = useState("MEMBER");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  const handlePlanChange = (newPlan: string) => {
    setPlan(newPlan);
    const limits = PLAN_LIMITS[newPlan];
    if (limits) {
      setMaxWebsites(limits.maxWebsites);
      setMaxPosts(limits.maxPosts);
      setMaxImages(limits.maxImages);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch {
      toast.error("Error loading users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { fetchUsers(); }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const fetchOrgMembers = async (userId: string) => {
    setIsMembersLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/team`);
      if (res.ok) {
        const data = await res.json();
        setOrgMembers(data.members || []);
      }
    } catch {
      /* silent */
    } finally {
      setIsMembersLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!addMemberEmail.trim() || !selectedUser) return;
    setIsAddingMember(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: addMemberEmail.trim(), role: addMemberRole }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`${addMemberEmail} added to team`);
        setAddMemberEmail("");
        fetchOrgMembers(selectedUser.id);
      } else {
        toast.error(data.error || "Failed to add member");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedUser) return;
    setRemovingMemberId(memberId);
    try {
      const res = await fetch(
        `/api/admin/users/${selectedUser.id}/team?memberId=${memberId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        toast.success("Member removed");
        fetchOrgMembers(selectedUser.id);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to remove");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setRemovingMemberId(null);
    }
  };

  const handleEditClick = (user: UserWithSubscription) => {
    setSelectedUser(user);
    setRole(user.role);
    setAddMemberEmail("");
    setAddMemberRole("MEMBER");
    if (user.subscription) {
      setPlan(user.subscription.plan);
      setMaxWebsites(user.subscription.maxWebsites);
      setMaxPosts(user.subscription.maxPostsPerMonth);
      setMaxImages(user.subscription.maxImagesPerMonth);
      setWebsitesUsed(user.subscription.websitesUsed);
      setPostsUsed(user.subscription.postsGeneratedThisMonth);
      setImagesUsed(user.subscription.imagesGeneratedThisMonth);
    }
    fetchOrgMembers(user.id);
    setIsDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsUpdating(true);
    try {
      const payload: Record<string, unknown> = { role };
      if (selectedUser.subscription) {
        payload.plan = plan;
        payload.maxWebsites = maxWebsites;
        payload.maxPostsPerMonth = maxPosts;
        payload.maxImagesPerMonth = maxImages;
        payload.websitesUsed = websitesUsed;
        payload.postsGeneratedThisMonth = postsUsed;
        payload.imagesGeneratedThisMonth = imagesUsed;
      }

      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update user");

      toast.success("User updated successfully");
      setIsDialogOpen(false);
      fetchUsers();
    } catch {
      toast.error("Error updating user");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Posts Usage</TableHead>
              <TableHead>Images Usage</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.name || "Unknown"}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.subscription ? (
                      <Badge variant="outline">{user.subscription.plan}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">No sub</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.subscription ? (
                      <span className="text-sm">
                        {user.subscription.postsGeneratedThisMonth} / {user.subscription.maxPostsPerMonth}
                      </span>
                    ) : "-"}
                  </TableCell>
                  <TableCell>
                    {user.subscription ? (
                      <span className="text-sm">
                        {user.subscription.imagesGeneratedThisMonth} / {user.subscription.maxImagesPerMonth}
                      </span>
                    ) : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEditClick(user)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User: {selectedUser?.email}</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label>System Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">USER</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedUser.subscription && (
                <>
                  <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    <div className="space-y-2">
                      <Label>Subscription Plan</Label>
                      <Select value={plan} onValueChange={handlePlanChange}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FREE">FREE</SelectItem>
                          <SelectItem value="STARTER">STARTER</SelectItem>
                          <SelectItem value="GROWTH">GROWTH</SelectItem>
                          <SelectItem value="AGENCY">AGENCY</SelectItem>
                          <SelectItem value="ENTERPRISE">ENTERPRISE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    <div className="space-y-2">
                      <Label>Websites (Used / Max)</Label>
                      <div className="flex items-center space-x-2">
                        <Input type="number" value={websitesUsed} onChange={(e) => setWebsitesUsed(Number(e.target.value))} />
                        <span>/</span>
                        <Input type="number" value={maxWebsites} onChange={(e) => setMaxWebsites(Number(e.target.value))} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Posts (Used / Max)</Label>
                      <div className="flex items-center space-x-2">
                        <Input type="number" value={postsUsed} onChange={(e) => setPostsUsed(Number(e.target.value))} />
                        <span>/</span>
                        <Input type="number" value={maxPosts} onChange={(e) => setMaxPosts(Number(e.target.value))} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Images (Used / Max)</Label>
                      <div className="flex items-center space-x-2">
                        <Input type="number" value={imagesUsed} onChange={(e) => setImagesUsed(Number(e.target.value))} />
                        <span>/</span>
                        <Input type="number" value={maxImages} onChange={(e) => setMaxImages(Number(e.target.value))} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Team Members */}
              <div className="border-t pt-4 space-y-3">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Team Members
                </p>

                {isMembersLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Loading members…
                  </div>
                ) : orgMembers.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No team members yet.</p>
                ) : (
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {orgMembers.map((m) => {
                      const RoleIcon =
                        m.role === "OWNER" ? Crown :
                        m.role === "ADMIN" ? Shield : UserIcon;
                      return (
                        <div key={m.id} className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted/50 text-sm">
                          <div className="flex items-center gap-2">
                            <RoleIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="font-medium truncate max-w-[140px]">
                              {m.user.name || m.user.email}
                            </span>
                            <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                              {m.user.name ? m.user.email : ""}
                            </span>
                          </div>
                          {m.role !== "OWNER" && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                              onClick={() => handleRemoveMember(m.id)}
                              disabled={removingMemberId === m.id}
                            >
                              {removingMemberId === m.id
                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                : <Trash2 className="h-3 w-3" />}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add member inline */}
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Add by email…"
                    value={addMemberEmail}
                    onChange={(e) => setAddMemberEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddMember())}
                    className="flex-1 h-8 text-sm"
                  />
                  <Select value={addMemberRole} onValueChange={setAddMemberRole}>
                    <SelectTrigger className="w-24 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    size="sm"
                    className="h-8"
                    disabled={isAddingMember || !addMemberEmail.trim()}
                    onClick={handleAddMember}
                  >
                    {isAddingMember ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
