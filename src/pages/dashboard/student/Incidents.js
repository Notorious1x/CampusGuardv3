import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/auth-context";
import * as api from "../../../lib/api";
import { getCurrentPosition } from "../../../lib/geolocation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Label, Textarea, Badge, Select, Separator } from "../../../components/ui/components";
import { useToast } from "../../../components/ui/toast";
import { FileText, Loader2, MapPin, Clock, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const statusColors = { pending: "bg-yellow-100 text-yellow-700", investigating: "bg-blue-100 text-blue-700", resolved: "bg-green-100 text-green-700" };

export default function IncidentsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [incidents, setIncidents] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationDesc, setLocationDesc] = useState("");
  const [includeLocation, setIncludeLocation] = useState(true);
  const [severity, setSeverity] = useState("medium");
  const [submitting, setSubmitting] = useState(false);

  const refreshData = useCallback(async () => { if (user) setIncidents(await api.getUserIncidents(user.id)); }, [user]);
  useEffect(() => { refreshData(); }, [refreshData]);

  const handleSubmit = async (e) => {
    e.preventDefault(); if (!user) return; setSubmitting(true);
    try {
      let lat, lng;
      if (includeLocation) { const pos = await getCurrentPosition(); lat = pos.latitude; lng = pos.longitude; }
      await api.createIncident(user.id, user.full_name, title, description, severity, locationDesc || undefined, lat, lng);
      toast.success("Incident report submitted successfully");
      setTitle(""); setDescription(""); setLocationDesc(""); await refreshData();
    } catch { toast.error("Failed to submit report"); }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6 text-orange-600" />Incident Reporting</h1><p className="text-muted-foreground text-sm">Report suspicious activities or incidents on campus</p></div>
      <Card>
        <CardHeader><CardTitle className="text-base">Submit a Report</CardTitle><CardDescription>Provide details about the incident. Your identity will be kept confidential.</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Title</Label><Input placeholder="Brief title for the incident" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Describe what happened in detail..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required /></div>
            <div className="space-y-2"><Label>Severity</Label><Select value={severity} onChange={setSeverity}><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></Select></div>
            <div className="space-y-2"><Label>Location Description (optional)</Label><Input placeholder="e.g. Near the Science building..." value={locationDesc} onChange={(e) => setLocationDesc(e.target.value)} /></div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="includeLocation" checked={includeLocation} onChange={(e) => setIncludeLocation(e.target.checked)} className="rounded" />
              <Label htmlFor="includeLocation" className="text-sm font-normal cursor-pointer">Include my current GPS location</Label>
            </div>
            <Button type="submit" disabled={submitting} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}Submit Report
            </Button>
          </form>
        </CardContent>
      </Card>
      <Separator />
      <div>
        <h2 className="text-lg font-semibold mb-3">Your Reports</h2>
        {incidents.length === 0 ? <Card><CardContent className="p-8 text-center text-muted-foreground"><FileText className="h-8 w-8 mx-auto mb-2 opacity-30" /><p>No incident reports yet</p></CardContent></Card>
        : <div className="space-y-3">{incidents.map((inc) => (
          <Card key={inc.id}><CardContent className="p-4">
            <div className="flex items-start justify-between mb-2"><h3 className="font-medium">{inc.title}</h3><Badge className={statusColors[inc.status] || ""}>{inc.status.charAt(0).toUpperCase() + inc.status.slice(1)}</Badge></div>
            <p className="text-sm text-muted-foreground mb-2">{inc.description}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDistanceToNow(new Date(inc.created_at), { addSuffix: true })}</span>
              {inc.location_description && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{inc.location_description}</span>}
            </div>
          </CardContent></Card>
        ))}</div>}
      </div>
    </div>
  );
}
