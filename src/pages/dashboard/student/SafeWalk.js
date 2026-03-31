import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../../context/auth-context";
import * as api from "../../../lib/api";
import { getCurrentPosition, watchPosition, clearWatch } from "../../../lib/geolocation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Label, Badge } from "../../../components/ui/components";
import { useToast } from "../../../components/ui/toast";
import MapView from "../../../components/MapView";
import { Footprints, CheckCircle2, Loader2, Play, Clock, Navigation, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function SafeWalkPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [sessions, setSessions] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [destination, setDestination] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [starting, setStarting] = useState(false);
  const [position, setPosition] = useState(null);
  const watchIdRef = useRef(null);

  const activeSession = sessions.find((s) => s.status === "active");

  const refreshData = useCallback(async () => {
    if (!user) return;
    const [s, c] = await Promise.all([api.getUserSafeWalks(user.id), api.getGuardians(user.id)]);
    setSessions(s); setContacts(c);
  }, [user]);

  useEffect(() => { refreshData(); getCurrentPosition().then(setPosition).catch(() => {}); }, [refreshData]);

  useEffect(() => {
    if (activeSession) {
      watchIdRef.current = watchPosition(async (pos) => {
        setPosition(pos);
        await api.updateSafeWalkLocation(activeSession.id, pos.latitude, pos.longitude);
      });
    }
    return () => clearWatch(watchIdRef.current);
  }, [activeSession]);

  const startWalk = async () => {
    if (!user || !destination.trim()) { toast.error("Please enter a destination"); return; }
    setStarting(true);
    try {
      let pos;
      try { pos = await getCurrentPosition(); } catch {
        toast.error("Could not get your location. Please enable GPS and try again.");
        setStarting(false);
        return;
      }
      await api.createSafeWalk(user.id, user.full_name, destination, pos.latitude, pos.longitude, selectedContacts);
      toast.success("Safe Walk started! Your location is now being shared.");
      setDestination(""); setSelectedContacts([]); await refreshData();
    } catch { toast.error("Failed to start Safe Walk"); }
    setStarting(false);
  };

  const checkIn = async () => {
    if (!activeSession) return;
    await api.updateSafeWalkStatus(activeSession.id, "completed");
    clearWatch(watchIdRef.current); watchIdRef.current = null;
    toast.success("Checked in safely! Location sharing stopped.");
    await refreshData();
  };

  const toggleContact = (id) => setSelectedContacts((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Footprints className="h-6 w-6 text-green-600" />Safe Walk</h1>
        <p className="text-muted-foreground text-sm">Share your live location with guardians while walking on campus</p>
      </div>

      {activeSession ? (
        <Card className="border-green-300 shadow-green-100 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />Walk in Progress</CardTitle>
              <Badge className="bg-green-100 text-green-700">Active</Badge>
            </div>
            <CardDescription>Heading to: <span className="font-medium">{activeSession.destination}</span></CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {position && <MapView latitude={position.latitude} longitude={position.longitude} />}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />Started {formatDistanceToNow(new Date(activeSession.created_at), { addSuffix: true })}</span>
              {position ? (
                <a href={`https://www.google.com/maps?q=${position.latitude},${position.longitude}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:text-blue-800"><Navigation className="h-4 w-4" />{position.latitude.toFixed(5)}, {position.longitude.toFixed(5)} <ExternalLink className="h-3 w-3" /></a>
              ) : (
                <span className="flex items-center gap-1"><Navigation className="h-4 w-4" />Getting location...</span>
              )}
            </div>
            <Button onClick={checkIn} className="w-full bg-green-600 hover:bg-green-700 text-white" size="lg">
              <CheckCircle2 className="mr-2 h-5 w-5" />I've Arrived Safely
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader><CardTitle className="text-base">Start a Safe Walk</CardTitle><CardDescription>Enter your destination and select contacts to share your location with</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Destination</Label><Input placeholder="e.g. Unity Hall, Brunei Hostel, Ayeduase Gate..." value={destination} onChange={(e) => setDestination(e.target.value)} /></div>
            {contacts.length > 0 && (
              <div className="space-y-2"><Label>Share with guardians</Label>
                {contacts.map((c) => (
                  <button key={c.id} onClick={() => toggleContact(c.guardian_user_id || c.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedContacts.includes(c.guardian_user_id || c.id) ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "hover:bg-muted"}`}>
                    <p className="font-medium text-sm">{c.name}</p><p className="text-xs text-muted-foreground">{c.relationship} · {c.phone}</p>
                  </button>
                ))}
              </div>
            )}
            {contacts.length === 0 && <p className="text-sm text-muted-foreground">No guardians added yet. <a href="/dashboard/student/guardians" className="text-red-600 underline">Add guardians first</a></p>}
            <Button onClick={startWalk} disabled={starting || !destination.trim()} className="w-full bg-green-600 hover:bg-green-700 text-white" size="lg">
              {starting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Play className="mr-2 h-5 w-5" />}Start Safe Walk
            </Button>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">Walk History</h2>
        {sessions.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground"><Footprints className="h-8 w-8 mx-auto mb-2 opacity-30" /><p>No Safe Walk sessions yet</p></CardContent></Card>
        ) : (
          <div className="space-y-2">{sessions.map((s) => (
            <Card key={s.id}><CardContent className="p-4 flex items-center justify-between">
              <div><p className="font-medium text-sm">{s.destination}</p><p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}</p></div>
              <Badge className={s.status === "completed" ? "bg-green-100 text-green-700" : s.status === "active" ? "bg-blue-100 text-blue-700" : ""}>{s.status === "completed" ? "Arrived" : s.status === "active" ? "In Progress" : "Expired"}</Badge>
            </CardContent></Card>
          ))}</div>
        )}
      </div>
    </div>
  );
}
