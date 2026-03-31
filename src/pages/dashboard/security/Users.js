import React, { useState, useEffect, useCallback } from "react";
import * as api from "../../../lib/api";
import { Card, CardContent, Button, Badge, Input } from "../../../components/ui/components";
import { useToast } from "../../../components/ui/toast";
import { Users, Trash2, Search, Mail, Phone, Calendar, KeyRound, Plus, Copy, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";

const roleColors = { student: "bg-blue-100 text-blue-700", guardian: "bg-purple-100 text-purple-700", security: "bg-red-100 text-red-700" };

export default function SecurityUsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [securityIds, setSecurityIds] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("users");
  const [generating, setGenerating] = useState(false);

  const refreshData = useCallback(() => { setUsers(api.getAllUsers()); setSecurityIds(api.getSecurityIds()); }, []);
  useEffect(() => { refreshData(); }, [refreshData]);

  const handleDelete = (userId, name) => { if (!window.confirm(`Remove ${name}?`)) return; api.deleteUser(userId); toast.success(`${name} removed`); refreshData(); };
  const handleGenerateIds = () => { setGenerating(true); api.generateNewSecurityIds(5); toast.success("Generated 5 new Security IDs"); refreshData(); setGenerating(false); };
  const handleCopyId = (code) => { navigator.clipboard.writeText(code); toast.success(`Copied ${code}`); };

  const filtered = users.filter((u) => u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
  const availableIds = securityIds.filter((r) => !r.used);
  const claimedIds = securityIds.filter((r) => r.used);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-blue-600" />User Management</h1><p className="text-muted-foreground text-sm">Manage registered users and Security IDs</p></div>
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        <button onClick={() => setTab("users")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "users" ? "bg-white dark:bg-gray-800 shadow-sm" : "text-muted-foreground"}`}>Users ({users.length})</button>
        <button onClick={() => setTab("ids")} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "ids" ? "bg-white dark:bg-gray-800 shadow-sm" : "text-muted-foreground"}`}>
          <KeyRound className="h-3.5 w-3.5" />Security IDs{availableIds.length > 0 && <span className="ml-1 bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full">{availableIds.length} available</span>}
        </button>
      </div>

      {tab === "users" && (
        <div className="space-y-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" /></div>
          <p className="text-sm text-muted-foreground">Showing {filtered.length} of {users.length} users</p>
          <div className="space-y-3">{filtered.map((u) => (
            <Card key={u.id} className="group"><CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1"><p className="font-semibold">{u.full_name}</p><Badge className={roleColors[u.role] || ""}>{u.role.charAt(0).toUpperCase() + u.role.slice(1)}</Badge></div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{u.email}</span>
                    {u.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{u.phone}</span>}
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Joined {format(new Date(u.created_at), "MMM d, yyyy")}</span>
                  </div>
                  {u.student_id && <p className="text-xs text-muted-foreground mt-1">Student ID: {u.student_id}</p>}
                </div>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(u.id, u.full_name)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent></Card>
          ))}</div>
        </div>
      )}

      {tab === "ids" && (
        <div className="space-y-5">
          <Card className="border-dashed border-2 border-green-200 bg-green-50/40"><CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div><h3 className="font-semibold flex items-center gap-2 mb-1"><KeyRound className="h-4 w-4 text-green-600" />Issue New Security IDs</h3><p className="text-sm text-muted-foreground">Generate one-time use IDs in the format <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">KNS######</code>.</p></div>
              <Button onClick={handleGenerateIds} disabled={generating} className="shrink-0 bg-green-600 hover:bg-green-700 text-white" size="sm"><Plus className="h-4 w-4 mr-1.5" />Generate 5 IDs</Button>
            </div>
          </CardContent></Card>
          {availableIds.length > 0 && (
            <div className="space-y-3"><h3 className="font-semibold text-sm text-green-700 flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" />Available ({availableIds.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{availableIds.map((r) => (
                <Card key={r.id} className="border-green-100"><CardContent className="p-3 flex items-center justify-between">
                  <span className="font-mono font-bold tracking-widest text-base">{r.code}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleCopyId(r.code)}><Copy className="h-3.5 w-3.5" /></Button>
                </CardContent></Card>
              ))}</div>
            </div>
          )}
          {claimedIds.length > 0 && (
            <div className="space-y-3"><h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-1.5"><Clock className="h-4 w-4" />Claimed ({claimedIds.length})</h3>
              <div className="space-y-2">{claimedIds.map((r) => (
                <Card key={r.id} className="opacity-60"><CardContent className="p-3 flex items-center justify-between">
                  <div><span className="font-mono font-bold tracking-widest text-base line-through text-muted-foreground">{r.code}</span>{r.used_by_name && <p className="text-xs text-muted-foreground mt-0.5">Claimed by {r.used_by_name}{r.claimed_at && ` · ${format(new Date(r.claimed_at), "MMM d, yyyy")}`}</p>}</div>
                  <Badge className="bg-gray-100 text-gray-600 text-xs">Used</Badge>
                </CardContent></Card>
              ))}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
