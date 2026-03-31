import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/auth-context";
import * as api from "../../../lib/api";
import { getCurrentPosition } from "../../../lib/geolocation";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/components";
import MapView from "../../../components/MapView";
import { Siren, MapPin, Footprints, FileText, Users, Radio, Phone, Loader2, LayoutDashboard, ArrowRight, Moon, Sun } from "lucide-react";
import { KNUST_SECURITY_NUMBER } from "../../../lib/constants";
import { formatDistanceToNow } from "date-fns";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [safeWalks, setSafeWalks] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [guardianCount, setGuardianCount] = useState(0);
  const [position, setPosition] = useState(null);
  const [loadingPos, setLoadingPos] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (!user) return;
    const s = api.getUserSettings(user.id);
    setDarkMode(s.dark_mode);
    document.documentElement.classList.toggle("dark", s.dark_mode);
  }, [user]);

  const toggleDarkMode = () => {
    if (!user) return;
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
    const settings = api.getUserSettings(user.id);
    api.saveUserSettings({ ...settings, dark_mode: newMode });
  };

  const refreshData = useCallback(() => {
    if (!user) return;
    setAlerts(api.getUserAlerts(user.id));
    setSafeWalks(api.getUserSafeWalks(user.id));
    setBroadcasts(api.getBroadcasts().slice(0, 3));
    setGuardianCount(api.getGuardians(user.id).length);
  }, [user]);

  useEffect(() => {
    refreshData();
    getCurrentPosition().then((pos) => { setPosition(pos); setLoadingPos(false); });
  }, [refreshData]);

  const activeAlerts = alerts.filter((a) => a.status !== "resolved");
  const activeSafeWalks = safeWalks.filter((s) => s.status === "active");

  const quickActions = [
    { href: "/dashboard/student/sos", label: "SOS", desc: "Emergency alert", icon: <Siren className="h-6 w-6" />, color: "bg-red-600 text-white" },
    { href: "/dashboard/student/safe-walk", label: "Safe Walk", desc: "Share location", icon: <Footprints className="h-6 w-6" />, color: "bg-green-600 text-white" },
    { href: "/dashboard/student/incidents", label: "Report", desc: "File incident", icon: <FileText className="h-6 w-6" />, color: "bg-orange-600 text-white" },
    { href: "/dashboard/student/guardians", label: "Guardians", desc: `${guardianCount} contacts`, icon: <Users className="h-6 w-6" />, color: "bg-purple-600 text-white" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><LayoutDashboard className="h-6 w-6" />Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back, {user?.full_name?.split(" ")[0]}</p>
        </div>
        <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-muted transition-colors">
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>

      <Card className="border-red-200 bg-red-50/50 dark:bg-red-900/10">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-red-600 shrink-0" />
            <div>
              <p className="text-sm font-medium">KNUST Security Hotline</p>
              <a href={`tel:${KNUST_SECURITY_NUMBER}`} className="text-lg font-bold text-red-600">{KNUST_SECURITY_NUMBER}</a>
            </div>
          </div>
          <Link to="/dashboard/student/sos" className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors flex items-center gap-1.5">
            <Siren className="h-4 w-4" /> SOS
          </Link>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map((a) => (
          <Link key={a.href} to={a.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <div className={`p-3 rounded-xl ${a.color}`}>{a.icon}</div>
                <div><p className="font-semibold text-sm">{a.label}</p><p className="text-[10px] text-muted-foreground">{a.desc}</p></div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-600">{activeAlerts.length}</p><p className="text-xs text-muted-foreground">Active Alerts</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{activeSafeWalks.length}</p><p className="text-xs text-muted-foreground">Active Walks</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-600">{alerts.length}</p><p className="text-xs text-muted-foreground">Total Alerts</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-purple-600">{guardianCount}</p><p className="text-xs text-muted-foreground">Guardians</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4" /> Your Location</CardTitle></CardHeader>
        <CardContent>
          {loadingPos ? <div className="h-[250px] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          : position ? <MapView latitude={position.latitude} longitude={position.longitude} />
          : <div className="h-[250px] flex items-center justify-center text-muted-foreground">Unable to get location</div>}
        </CardContent>
      </Card>

      {broadcasts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><Radio className="h-4 w-4 text-cyan-600" /> Campus Alerts</CardTitle>
              <Link to="/dashboard/student/alerts" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">View all <ArrowRight className="h-3 w-3" /></Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {broadcasts.map((b) => (
              <div key={b.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Radio className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{b.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{b.message}</p>
                  <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(b.created_at), { addSuffix: true })}</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${b.severity === "critical" ? "bg-red-600 text-white" : b.severity === "high" ? "bg-orange-500 text-white" : b.severity === "medium" ? "bg-yellow-500 text-white" : "bg-blue-500 text-white"}`}>{b.severity}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
