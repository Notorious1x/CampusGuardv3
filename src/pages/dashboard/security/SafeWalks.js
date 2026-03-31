import React, { useState, useEffect, useCallback } from "react";
import * as api from "../../../lib/api";
import { Card, CardContent, CardHeader, CardTitle, Button, Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/components";
import { useToast } from "../../../components/ui/toast";
import { Footprints, MapPin, Clock, User, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function SecuritySafeWalksPage() {
  const toast = useToast();
  const [walks, setWalks] = useState([]);
  const refreshData = useCallback(() => { setWalks(api.getSafeWalks()); }, []);
  useEffect(() => { refreshData(); const interval = setInterval(refreshData, 3000); return () => clearInterval(interval); }, [refreshData]);

  const handleClose = (id) => { api.updateSafeWalkStatus(id, "completed"); toast.success("Session closed by security"); refreshData(); };

  const active = walks.filter((w) => w.status === "active");
  const completed = walks.filter((w) => w.status === "completed");
  const expired = walks.filter((w) => w.status === "expired");

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><Footprints className="h-6 w-6 text-green-600" />Safe Walk Sessions</h1><p className="text-muted-foreground text-sm">Monitor active walking sessions across campus</p></div>
      <Tabs defaultValue="active">
        <TabsList><TabsTrigger value="active">Active ({active.length})</TabsTrigger><TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger><TabsTrigger value="expired">Expired ({expired.length})</TabsTrigger></TabsList>
        <TabsContent value="active" className="space-y-3 mt-4">
          {active.length === 0 ? <Card><CardContent className="p-8 text-center text-muted-foreground">No active sessions</CardContent></Card> : active.map((w) => (
            <Card key={w.id} className="border-green-200"><CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-green-100"><Footprints className="h-4 w-4 text-green-600" /></div>
                  <div>
                    <div className="flex items-center gap-2"><p className="font-semibold">{w.user_name}</p><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-600 text-white">LIVE</span></div>
                    <p className="text-sm text-muted-foreground">Destination: {w.destination}</p>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1"><Clock className="h-3 w-3" />Started {formatDistanceToNow(new Date(w.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => handleClose(w.id)}><XCircle className="mr-1.5 h-3.5 w-3.5" />Close</Button>
              </div>
            </CardContent></Card>
          ))}
        </TabsContent>
        <TabsContent value="completed" className="space-y-3 mt-4">
          {completed.length === 0 ? <Card><CardContent className="p-8 text-center text-muted-foreground">No completed sessions</CardContent></Card> : completed.slice(0, 20).map((w) => (
            <Card key={w.id}><CardContent className="p-4 flex items-center justify-between"><div className="flex items-center gap-3"><User className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm font-medium">{w.user_name}</p><p className="text-xs text-muted-foreground">{w.destination}</p></div></div><span className="text-xs text-green-600 font-medium">Checked In</span></CardContent></Card>
          ))}
        </TabsContent>
        <TabsContent value="expired" className="space-y-3 mt-4">
          {expired.length === 0 ? <Card><CardContent className="p-8 text-center text-muted-foreground">No expired sessions</CardContent></Card> : expired.map((w) => (
            <Card key={w.id} className="border-yellow-200"><CardContent className="p-4 flex items-center justify-between"><div className="flex items-center gap-3"><User className="h-4 w-4 text-yellow-600" /><div><p className="text-sm font-medium">{w.user_name}</p><p className="text-xs text-muted-foreground">{w.destination}</p></div></div><span className="text-xs text-yellow-600 font-medium">Expired</span></CardContent></Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
