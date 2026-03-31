import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/auth-context";
import * as api from "../../../lib/api";
import { Card, CardContent, Button, Input, Label, Dialog } from "../../../components/ui/components";
import { useToast } from "../../../components/ui/toast";
import { Users, Plus, Trash2, Phone, Mail, Heart } from "lucide-react";

export default function GuardiansPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [guardians, setGuardians] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", relationship: "" });

  const refreshData = useCallback(async () => { if (user) setGuardians(await api.getGuardians(user.id)); }, [user]);
  useEffect(() => { refreshData(); }, [refreshData]);

  const handleAdd = async () => {
    if (!user || !form.name.trim() || !form.phone.trim() || !form.relationship.trim()) { toast.error("Please fill in name, phone, and relationship"); return; }
    await api.addGuardian(user.id, form.name, form.phone, form.relationship, form.email || undefined);
    toast.success("Guardian added"); setForm({ name: "", phone: "", email: "", relationship: "" }); setShowAdd(false); refreshData();
  };

  const handleDelete = async (id, name) => { await api.deleteGuardian(id); toast.success(`${name} removed`); refreshData(); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-purple-600" />Guardians</h1><p className="text-muted-foreground text-sm">Trusted contacts who receive alerts during emergencies</p></div>
        <Button onClick={() => setShowAdd(true)} className="bg-purple-600 hover:bg-purple-700 text-white"><Plus className="mr-2 h-4 w-4" />Add</Button>
      </div>
      {guardians.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground"><Users className="h-10 w-10 mx-auto mb-3 opacity-30" /><p className="text-lg font-medium mb-1">No guardians added yet</p><p className="text-sm mb-4">Add trusted contacts who will be notified during emergencies.</p><Button onClick={() => setShowAdd(true)} variant="outline"><Plus className="mr-2 h-4 w-4" />Add Your First Guardian</Button></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{guardians.map((g) => (
          <Card key={g.id} className="group"><CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 mt-0.5"><Heart className="h-4 w-4 text-purple-600" /></div>
                <div>
                  <p className="font-semibold">{g.name}</p><p className="text-xs text-muted-foreground mb-2">{g.relationship}</p>
                  <p className="text-sm flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{g.phone}</p>
                  {g.email && <p className="text-sm flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{g.email}</p>}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(g.id, g.name)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </CardContent></Card>
        ))}</div>
      )}
      <Dialog open={showAdd} onClose={() => setShowAdd(false)}>
        <h2 className="text-lg font-semibold mb-1">Add Guardian</h2>
        <p className="text-sm text-muted-foreground mb-4">This person will receive real-time notifications during your emergencies.</p>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Full Name</Label><Input placeholder="e.g. Ama Asante" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} /></div>
          <div className="space-y-2"><Label>Phone Number</Label><Input placeholder="+233241234567" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} /></div>
          <div className="space-y-2"><Label>Email (optional)</Label><Input placeholder="email@example.com" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} /></div>
          <div className="space-y-2"><Label>Relationship</Label><Input placeholder="e.g. Mother, Brother, Friend" value={form.relationship} onChange={(e) => setForm({...form, relationship: e.target.value})} /></div>
          <div className="flex gap-2 pt-2"><Button variant="outline" onClick={() => setShowAdd(false)} className="flex-1">Cancel</Button><Button onClick={handleAdd} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">Add Guardian</Button></div>
        </div>
      </Dialog>
    </div>
  );
}
