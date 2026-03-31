import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/auth-context";
import * as api from "../../../lib/api";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Textarea, Select } from "../../../components/ui/components";
import { useToast } from "../../../components/ui/toast";
import { Radio, Send, Clock, AlertTriangle, Info, ShieldAlert, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const severityConfig = {
  critical: { icon: <AlertTriangle className="h-5 w-5" />, color: "text-red-600", bg: "bg-red-50 border-red-200" },
  high: { icon: <ShieldAlert className="h-5 w-5" />, color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
  medium: { icon: <Info className="h-5 w-5" />, color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
  low: { icon: <Info className="h-5 w-5" />, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
};

export default function BroadcastPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [broadcasts, setBroadcasts] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("medium");

  const refreshData = useCallback(() => { setBroadcasts(api.getBroadcasts()); }, []);
  useEffect(() => { refreshData(); }, [refreshData]);

  const handleDelete = (id, t) => { if (!window.confirm(`Delete broadcast "${t}"?`)) return; api.deleteBroadcast(id); toast.success("Broadcast deleted"); refreshData(); };

  const handleBroadcast = () => {
    if (!user || !title.trim() || !message.trim()) { toast.error("Title and message are required"); return; }
    api.createBroadcast(user.id, user.full_name, title, message, severity);
    toast.success("Alert broadcast sent to all users"); setTitle(""); setMessage(""); setSeverity("medium"); refreshData();
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><Radio className="h-6 w-6 text-cyan-600" />Alert Broadcast</h1><p className="text-muted-foreground text-sm">Send campus-wide safety alerts to all users</p></div>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">New Broadcast</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Alert Title</Label><Input placeholder="e.g. Security Advisory - Library Area" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="space-y-2"><Label>Message</Label><Textarea placeholder="Describe the alert details..." value={message} onChange={(e) => setMessage(e.target.value)} rows={4} /></div>
          <div className="space-y-2"><Label>Severity</Label><Select value={severity} onChange={setSeverity}><option value="critical">Critical - Immediate danger</option><option value="high">High - Urgent advisory</option><option value="medium">Medium - General advisory</option><option value="low">Low - Information only</option></Select></div>
          <Button onClick={handleBroadcast} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"><Send className="mr-2 h-4 w-4" />Send Broadcast</Button>
        </CardContent>
      </Card>
      <div>
        <h2 className="text-lg font-semibold mb-3">Broadcast History</h2>
        {broadcasts.length === 0 ? <Card><CardContent className="p-8 text-center text-muted-foreground">No broadcasts sent yet</CardContent></Card> : (
          <div className="space-y-3">{broadcasts.map((b) => {
            const conf = severityConfig[b.severity] || severityConfig.medium;
            return (
              <Card key={b.id} className={conf.bg}><CardContent className="p-4"><div className="flex items-start gap-3"><div className={`mt-0.5 ${conf.color}`}>{conf.icon}</div><div className="flex-1">
                <div className="flex items-start justify-between gap-2"><h3 className="font-semibold">{b.title}</h3><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${b.severity === "critical" ? "bg-red-600 text-white" : b.severity === "high" ? "bg-orange-500 text-white" : b.severity === "medium" ? "bg-yellow-500 text-white" : "bg-blue-500 text-white"}`}>{b.severity}</span></div>
                <p className="text-sm text-muted-foreground mt-1">{b.message}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{formatDistanceToNow(new Date(b.created_at), { addSuffix: true })} by {b.created_by_name}</span>
                  <button onClick={() => handleDelete(b.id, b.title)} className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50"><Trash2 className="h-3 w-3" />Delete</button>
                </div>
              </div></div></CardContent></Card>
            );
          })}</div>
        )}
      </div>
    </div>
  );
}
