import React, { useState } from "react";
import { useAuth } from "../../../context/auth-context";
import * as api from "../../../lib/api";
import { Card, CardContent, Input, Label, Button, Avatar, AvatarFallback } from "../../../components/ui/components";
import { useToast } from "../../../components/ui/toast";
import { UserCircle, Mail, Phone, Calendar, Save } from "lucide-react";
import { format } from "date-fns";

export default function GuardianProfilePage() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: user?.full_name || "", phone: user?.phone || "" });

  if (!user) return null;
  const initials = user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase();

  const handleSave = async () => {
    await api.updateUser(user.id, { full_name: form.full_name, phone: form.phone });
    await refreshUser(); setEditing(false); toast.success("Profile updated");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><UserCircle className="h-6 w-6" />Profile</h1><p className="text-muted-foreground text-sm">Manage your account information</p></div>
      <Card><CardContent className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-16 w-16"><AvatarFallback className="bg-red-100 text-red-700 text-xl font-bold">{initials}</AvatarFallback></Avatar>
          <div><p className="text-xl font-bold">{user.full_name}</p><p className="text-sm text-muted-foreground capitalize">{user.role}</p></div>
        </div>
        {editing ? (
          <div className="space-y-4">
            <div className="space-y-2"><Label>Full Name</Label><Input value={form.full_name} onChange={(e) => setForm({...form, full_name: e.target.value})} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} /></div>
            <div className="flex gap-2 pt-2"><Button variant="outline" onClick={() => setEditing(false)} className="flex-1">Cancel</Button><Button onClick={handleSave} className="flex-1 bg-red-600 hover:bg-red-700 text-white"><Save className="mr-2 h-4 w-4" />Save</Button></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"><Mail className="h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium">{user.email}</p></div></div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"><Phone className="h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm font-medium">{user.phone || "Not set"}</p></div></div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"><Calendar className="h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Joined</p><p className="text-sm font-medium">{format(new Date(user.created_at), "MMMM d, yyyy")}</p></div></div>
            <Button variant="outline" onClick={() => setEditing(true)} className="w-full mt-2">Edit Profile</Button>
          </div>
        )}
      </CardContent></Card>
    </div>
  );
}
