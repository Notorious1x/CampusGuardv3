import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import * as api from "../../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/components";
import MapView from "../../../components/MapView";
import { LayoutDashboard, Siren, Footprints, FileText, Users, AlertTriangle, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function SecurityDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [walks, setWalks] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [userCount, setUserCount] = useState(0);

  const refreshData = useCallback(() => {
    setAlerts(api.getAlerts()); setWalks(api.getSafeWalks()); setIncidents(api.getIncidents()); setUserCount(api.getAllUsers().length);
  }, []);

  useEffect(() => { refreshData(); const interval = setInterval(refreshData, 5000); return () => clearInterval(interval); }, [refreshData]);

  const pendingAlerts = alerts.filter((a) => a.status === "pending");
  const activeWalks = walks.filter((w) => w.status === "active");
  const pendingIncidents = incidents.filter((i) => i.status === "pending");

  const stats = [
    { label: "Pending Alerts", value: pendingAlerts.length, icon: <Siren className="h-6 w-6 text-red-500" />, color: "text-red-600", href: "/dashboard/security/alerts" },
    { label: "Active Walks", value: activeWalks.length, icon: <Footprints className="h-6 w-6 text-green-500" />, color: "text-green-600", href: "/dashboard/security/safe-walks" },
    { label: "Open Incidents", value: pendingIncidents.length, icon: <FileText className="h-6 w-6 text-orange-500" />, color: "text-orange-600", href: "/dashboard/security/incidents" },
    { label: "Total Users", value: userCount, icon: <Users className="h-6 w-6 text-blue-500" />, color: "text-blue-600", href: "/dashboard/security/users" },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><LayoutDashboard className="h-6 w-6" />Security Dashboard</h1><p className="text-muted-foreground text-sm">Real-time campus safety monitoring</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link key={s.label} to={s.href}><Card className="hover:shadow-md transition-shadow cursor-pointer h-full"><CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-muted">{s.icon}</div>
            <div><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
          </CardContent></Card></Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Footprints className="h-4 w-4 text-green-600" />Active Safe Walk Sessions</CardTitle></CardHeader>
          <CardContent>{activeWalks.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No active sessions</p> : (
            <div className="space-y-2">{activeWalks.slice(0, 5).map((w) => (
              <div key={w.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div><p className="text-sm font-medium">{w.user_name}</p><p className="text-xs text-muted-foreground">{w.destination}</p></div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-600 text-white">LIVE</span>
              </div>
            ))}</div>
          )}</CardContent>
        </Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4 text-orange-600" />Recent Incidents</CardTitle></CardHeader>
          <CardContent>{incidents.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No incident reports</p> : (
            <div className="space-y-2">{incidents.slice(0, 5).map((i) => (
              <div key={i.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div><p className="text-sm font-medium">{i.title}</p><p className="text-xs text-muted-foreground">{i.user_name}</p></div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${i.status === "pending" ? "bg-yellow-100 text-yellow-700" : i.status === "investigating" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>{i.status}</span>
              </div>
            ))}</div>
          )}</CardContent>
        </Card>
      </div>
    </div>
  );
}
