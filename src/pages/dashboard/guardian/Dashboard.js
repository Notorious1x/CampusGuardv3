import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/auth-context";
import * as api from "../../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/components";
import { LayoutDashboard, Footprints, Siren, Bell, MapPin, Clock, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function GuardianDashboard() {
  const { user } = useAuth();
  const [activeWalks, setActiveWalks] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const refreshData = useCallback(() => {
    if (!user) return;
    const allWalks = api.getSafeWalks();
    setActiveWalks(allWalks.filter((s) => s.shared_with.includes(user.id) && s.status === "active"));
    setRecentAlerts(api.getAlerts().slice(0, 5));
    setNotifications(api.getNotifications(user.id, user.role).filter((n) => !n.read).slice(0, 5));
  }, [user]);

  useEffect(() => { refreshData(); const interval = setInterval(refreshData, 5000); return () => clearInterval(interval); }, [refreshData]);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><LayoutDashboard className="h-6 w-6" />Guardian Dashboard</h1><p className="text-muted-foreground text-sm">Monitor your student's safety in real time</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-5 flex items-center gap-4"><div className="p-3 rounded-xl bg-green-100"><Footprints className="h-6 w-6 text-green-600" /></div><div><p className="text-3xl font-bold text-green-600">{activeWalks.length}</p><p className="text-sm text-muted-foreground">Active Safe Walks</p></div></CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-4"><div className="p-3 rounded-xl bg-red-100"><Siren className="h-6 w-6 text-red-600" /></div><div><p className="text-3xl font-bold text-red-600">{recentAlerts.filter((a) => a.status === "pending").length}</p><p className="text-sm text-muted-foreground">Active Alerts</p></div></CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-4"><div className="p-3 rounded-xl bg-blue-100"><Bell className="h-6 w-6 text-blue-600" /></div><div><p className="text-3xl font-bold text-blue-600">{notifications.length}</p><p className="text-sm text-muted-foreground">Unread Notifications</p></div></CardContent></Card>
      </div>
      {activeWalks.length > 0 ? (
        <Card className="border-green-200"><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Footprints className="h-5 w-5 text-green-600" />Active Safe Walk Sessions</CardTitle></CardHeader>
          <CardContent className="space-y-3">{activeWalks.map((w) => (
            <Link key={w.id} to="/dashboard/guardian/tracking"><div className="flex items-center justify-between p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-green-600" /><div><p className="text-sm font-medium">{w.user_name}</p><p className="text-xs text-muted-foreground">Walking to: {w.destination}</p></div></div>
              <div className="text-right"><span className="text-xs text-green-600 font-medium">LIVE</span><p className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(w.created_at), { addSuffix: true })}</p></div>
            </div></Link>
          ))}</CardContent></Card>
      ) : (
        <Card><CardContent className="p-8 text-center text-muted-foreground"><CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-green-500 opacity-50" /><p className="font-medium">All Clear</p><p className="text-sm mt-1">No active Safe Walk sessions right now.</p></CardContent></Card>
      )}
      <Card><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Bell className="h-5 w-5" />Recent Notifications</CardTitle></CardHeader>
        <CardContent>{notifications.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No new notifications</p> : (
          <div className="space-y-2">{notifications.map((n) => (
            <div key={n.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Siren className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0"><p className="text-sm font-medium">{n.title}</p><p className="text-xs text-muted-foreground">{n.message}</p><span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1"><Clock className="h-3 w-3" />{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</span></div>
            </div>
          ))}</div>
        )}</CardContent>
      </Card>
    </div>
  );
}
