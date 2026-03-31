import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/auth-context";
import * as api from "../../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/components";
import MapView from "../../../components/MapView";
import { MapPin, Footprints, Clock, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function GuardianTrackingPage() {
  const { user } = useAuth();
  const [walks, setWalks] = useState([]);

  const refreshData = useCallback(() => {
    if (!user) return;
    const allWalks = api.getSafeWalks();
    setWalks(allWalks.filter((s) => s.shared_with.includes(user.id)));
  }, [user]);

  useEffect(() => { refreshData(); const interval = setInterval(refreshData, 3000); return () => clearInterval(interval); }, [refreshData]);

  const activeWalks = walks.filter((w) => w.status === "active");
  const pastWalks = walks.filter((w) => w.status !== "active");
  const markers = activeWalks.map((w) => ({ lat: w.latitude, lng: w.longitude, label: w.user_name }));

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><MapPin className="h-6 w-6 text-green-600" />Live Tracking</h1><p className="text-muted-foreground text-sm">Real-time location of students during Safe Walk sessions</p></div>
      {activeWalks.length > 0 ? (
        <>
          <Card><CardContent className="p-0 overflow-hidden rounded-lg"><MapView latitude={activeWalks[0].latitude} longitude={activeWalks[0].longitude} markers={markers} /></CardContent></Card>
          <div className="space-y-3">{activeWalks.map((w) => (
            <Card key={w.id} className="border-green-200"><CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-green-100"><Footprints className="h-4 w-4 text-green-600" /></div>
                <div>
                  <div className="flex items-center gap-2"><p className="font-semibold">{w.user_name}</p><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-600 text-white">LIVE</span></div>
                  <p className="text-sm text-muted-foreground">Destination: {w.destination}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">{w.latitude.toFixed(5)}, {w.longitude.toFixed(5)}</p>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1"><Clock className="h-3 w-3" />Started {formatDistanceToNow(new Date(w.created_at), { addSuffix: true })}</span>
                  {w.checkin_deadline && <p className="text-[10px] text-orange-600 mt-1">Check-in deadline: {new Date(w.checkin_deadline).toLocaleTimeString()}</p>}
                </div>
              </div>
            </CardContent></Card>
          ))}</div>
        </>
      ) : (
        <Card><CardContent className="p-12 text-center text-muted-foreground"><MapPin className="h-10 w-10 mx-auto mb-3 opacity-30" /><p className="text-lg font-medium mb-1">No Active Sessions</p><p className="text-sm">When a student starts a Safe Walk and shares it with you, their live location will appear here.</p></CardContent></Card>
      )}
      {pastWalks.length > 0 && (
        <Card><CardHeader className="pb-3"><CardTitle className="text-base">Past Sessions</CardTitle></CardHeader>
          <CardContent className="space-y-2">{pastWalks.slice(0, 10).map((w) => (
            <div key={w.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3"><User className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm font-medium">{w.user_name}</p><p className="text-xs text-muted-foreground">{w.destination}</p></div></div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${w.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{w.status}</span>
            </div>
          ))}</CardContent>
        </Card>
      )}
    </div>
  );
}
