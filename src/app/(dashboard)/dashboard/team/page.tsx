"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  UserPlus,
  Trash2,
  Loader2,
  Crown,
  Shield,
  User,
  Mail,
  ArrowRight,
  Info,
  Copy,
  Check,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";

interface Member {
  id: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    createdAt: string;
  };
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  OWNER: <Crown className="h-3.5 w-3.5 text-yellow-500" />,
  ADMIN: <Shield className="h-3.5 w-3.5 text-blue-500" />,
  MEMBER: <User className="h-3.5 w-3.5 text-muted-foreground" />,
};

const ROLE_COLORS: Record<string, string> = {
  OWNER: "bg-yellow-50 text-yellow-700 border-yellow-200",
  ADMIN: "bg-blue-50 text-blue-700 border-blue-200",
  MEMBER: "bg-muted text-muted-foreground",
};

const PLAN_LIMITS: Record<string, number> = {
  FREE: 1,
  STARTER: 3,
  GROWTH: 10,
  AGENCY: -1,
};

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [myRole, setMyRole] = useState("MEMBER");
  const [plan, setPlan] = useState("FREE");
  const [isSysAdmin, setIsSysAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"MEMBER" | "ADMIN">("MEMBER");
  const [showInviteForm, setShowInviteForm] = useState(false);

  const fetchTeam = useCallback(async () => {
    try {
      const res = await fetch("/api/team");
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members);
        setCurrentUserId(data.currentUserId);
        setMyRole(data.role);
        setPlan(data.plan);
        setIsSysAdmin(data.isSystemAdmin || false);
      }
    } catch {
      toast.error("Failed to load team");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`${inviteEmail} added to your team`);
        setInviteEmail("");
        setShowInviteForm(false);
        fetchTeam();
      } else {
        toast.error(data.error || "Failed to add member");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async (memberId: string, memberName: string | null) => {
    setRemovingId(memberId);
    try {
      const res = await fetch(`/api/team/${memberId}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        toast.success(`${memberName || "Member"} removed from team`);
        fetchTeam();
      } else {
        toast.error(data.error || "Failed to remove member");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setRemovingId(null);
    }
  };

  const maxMembers = PLAN_LIMITS[plan] ?? 1;
  const isOwnerOrAdmin = myRole === "OWNER" || myRole === "ADMIN";
  const canInvite =
    isOwnerOrAdmin &&
    (isSysAdmin || maxMembers === -1 || members.length < maxMembers);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Team</h2>
          <p className="text-muted-foreground mt-1">
            Manage team members who have access to your workspace
          </p>
        </div>
        {isOwnerOrAdmin && (
          <Button
            onClick={() => setShowInviteForm((v) => !v)}
            disabled={!canInvite}
            className="shrink-0 w-full sm:w-auto"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        )}
      </div>

      {/* Plan limit warning — hidden for system admins who bypass limits */}
      {!isSysAdmin && maxMembers !== -1 && members.length >= maxMembers && isOwnerOrAdmin && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-medium text-amber-800 text-sm">
                  Team limit reached ({members.length}/{maxMembers} members)
                </p>
                <p className="text-xs text-amber-700">
                  Upgrade your plan to add more team members
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="outline" className="border-amber-300 text-amber-800 w-full sm:w-auto shrink-0">
              <Link href="/dashboard/billing">
                Upgrade
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Invite Form */}
      {showInviteForm && canInvite && (
        <InviteForm
          inviteEmail={inviteEmail}
          setInviteEmail={setInviteEmail}
          inviteRole={inviteRole}
          setInviteRole={setInviteRole}
          isInviting={isInviting}
          onInvite={handleInvite}
          onCancel={() => { setShowInviteForm(false); setInviteEmail(""); setInviteRole("MEMBER"); }}
        />
      )}

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members
            <Badge variant="secondary" className="ml-1">
              {members.length}
              {maxMembers !== -1 ? `/${maxMembers}` : ""}
            </Badge>
          </CardTitle>
          <CardDescription>
            Everyone with access to your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground text-sm">No team members yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {members.map((member, i) => (
                <div key={member.id}>
                  {i > 0 && <Separator />}
                  <div className="flex items-center justify-between py-3 gap-2 min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                        {member.user.name
                          ? member.user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)
                          : member.user.email?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {member.user.name || "No name"}
                          {member.user.id === currentUserId && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              (you)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {member.user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs gap-1 ${ROLE_COLORS[member.role] || ""}`}
                      >
                        {ROLE_ICONS[member.role]}
                        {member.role.charAt(0) + member.role.slice(1).toLowerCase()}
                      </Badge>

                      {isOwnerOrAdmin &&
                        member.user.id !== currentUserId &&
                        member.role !== "OWNER" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              handleRemove(member.id, member.user.name)
                            }
                            disabled={removingId === member.id}
                          >
                            {removingId === member.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Roles & Permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              role: "OWNER",
              icon: <Crown className="h-4 w-4 text-yellow-500" />,
              desc: "Full access including billing, team management, and all website controls",
            },
            {
              role: "ADMIN",
              icon: <Shield className="h-4 w-4 text-blue-500" />,
              desc: "Can manage websites, generate content, and invite members",
            },
            {
              role: "MEMBER",
              icon: <User className="h-4 w-4 text-muted-foreground" />,
              desc: "Can view and edit content but cannot manage team or billing",
            },
          ].map(({ role, icon, desc }) => (
            <div key={role} className="flex items-start gap-3">
              <div className="mt-0.5">{icon}</div>
              <div>
                <p className="text-sm font-medium">{role.charAt(0) + role.slice(1).toLowerCase()}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ────────────────── INVITE FORM ──────────────────

function InviteForm({
  inviteEmail,
  setInviteEmail,
  inviteRole,
  setInviteRole,
  isInviting,
  onInvite,
  onCancel,
}: {
  inviteEmail: string;
  setInviteEmail: (v: string) => void;
  inviteRole: "MEMBER" | "ADMIN";
  setInviteRole: (v: "MEMBER" | "ADMIN") => void;
  isInviting: boolean;
  onInvite: () => void;
  onCancel: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copySignupLink = () => {
    const link = `${window.location.origin}/register`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Add Team Member
        </CardTitle>
        <CardDescription>
          Enter their email address and choose their role. They need a StackSerp account — share the signup link below if they don&apos;t have one yet.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email + role row */}
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="colleague@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onInvite()}
            className="flex-1"
          />
          <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "MEMBER" | "ADMIN")}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MEMBER">Member</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={onInvite} disabled={isInviting || !inviteEmail.trim()}>
            {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
          </Button>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>

        {/* Role hint */}
        <p className="text-xs text-muted-foreground">
          <strong>Member</strong> — can view and edit content. &nbsp;
          <strong>Admin</strong> — can also manage team and website settings.
        </p>

        {/* Signup link for sharing */}
        <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
          <span className="text-xs text-muted-foreground flex-1 truncate">
            Share signup link: {typeof window !== "undefined" ? window.location.origin : "https://stackserp.com"}/register
          </span>
          <button
            onClick={copySignupLink}
            className="text-xs text-primary hover:underline flex items-center gap-1 shrink-0"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
