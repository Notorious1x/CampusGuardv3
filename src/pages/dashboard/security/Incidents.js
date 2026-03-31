import React, { useState, useEffect, useCallback } from "react";
import * as api from "../../../lib/api";
import { Card, CardContent, Button, Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/components";
import { useToast } from "../../../components/ui/toast";
import { FileText, MapPin, Clock, User, Eye, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const severityColors = { critical: "bg-red-600 text-white", high: "bg-orange-500 text-white", medium: "bg-yellow-500 text-white", low: "bg-blue-500 text-white" };

export default function SecurityIncidentsPage() {
  const toast = useToast();
  const [incidents, setIncidents] = useState([]);
  const refreshData = useCallback(async () => { setIncidents(await api.getIncidents()); }, []);
  useEffect(() => { refreshData(); }, [refreshData]);

  const handleStatusChange = async (id, status) => { await api.updateIncidentStatus(id, status); toast.success(`Incident marked as ${status}`); refreshData(); };

  const pending = incidents.filter((i) => i.status === "pending");
  const investigating = incidents.filter((i) => i.status === "investigating");
  const resolved = incidents.filter((i) => i.status === "resolved");

  const renderIncident = (inc, showActions = true) => (
    <Card key={inc.id}><CardContent className="p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap"><h3 className="font-semibold">{inc.title}</h3>{inc.severity && <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${severityColors[inc.severity] || ""}`}>{inc.severity}</span>}</div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ml-2 ${inc.status === "pending" ? "bg-yellow-100 text-yellow-700" : inc.status === "investigating" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>{inc.status}</span>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{inc.description}</p>
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1"><User className="h-3 w-3" />{inc.user_name}</span>
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDistanceToNow(new Date(inc.created_at), { addSuffix: true })}</span>
        {inc.location_description && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{inc.location_description}</span>}
      </div>
      {showActions && inc.status !== "resolved" && (
        <div className="flex gap-2 pt-2 border-t">
          {inc.status === "pending" && <Button size="sm" variant="outline" onClick={() => handleStatusChange(inc.id, "investigating")} className="border-blue-500 text-blue-600 hover:bg-blue-50"><Eye className="mr-1.5 h-3.5 w-3.5" />Investigate</Button>}
          {inc.status === "investigating" && <Button size="sm" variant="outline" onClick={() => handleStatusChange(inc.id, "resolved")} className="border-green-500 text-green-600 hover:bg-green-50"><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />Resolve</Button>}
        </div>
      )}
    </CardContent></Card>
  );

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6 text-orange-600" />Incident Reports</h1><p className="text-muted-foreground text-sm">Review and manage incident reports</p></div>
      <Tabs defaultValue="pending">
        <TabsList><TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger><TabsTrigger value="investigating">Investigating ({investigating.length})</TabsTrigger><TabsTrigger value="resolved">Resolved ({resolved.length})</TabsTrigger></TabsList>
        <TabsContent value="pending" className="space-y-3 mt-4">{pending.length === 0 ? <Card><CardContent className="p-8 text-center text-muted-foreground">No pending reports</CardContent></Card> : pending.map((i) => renderIncident(i))}</TabsContent>
        <TabsContent value="investigating" className="space-y-3 mt-4">{investigating.length === 0 ? <Card><CardContent className="p-8 text-center text-muted-foreground">No reports under investigation</CardContent></Card> : investigating.map((i) => renderIncident(i))}</TabsContent>
        <TabsContent value="resolved" className="space-y-3 mt-4">{resolved.length === 0 ? <Card><CardContent className="p-8 text-center text-muted-foreground">No resolved reports</CardContent></Card> : resolved.map((i) => renderIncident(i, false))}</TabsContent>
      </Tabs>
    </div>
  );
}
