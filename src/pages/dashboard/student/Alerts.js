import React, { useState, useEffect } from "react";
import * as api from "../../../lib/api";
import { Card, CardContent } from "../../../components/ui/components";
import { Radio, Clock, AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const severityConfig = {
  critical: { icon: <AlertTriangle className="h-5 w-5" />, color: "text-red-600", bg: "bg-red-50 border-red-200 dark:bg-red-900/20" },
  high: { icon: <ShieldAlert className="h-5 w-5" />, color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
  medium: { icon: <Info className="h-5 w-5" />, color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
  low: { icon: <Info className="h-5 w-5" />, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
};

export default function StudentAlertsPage() {
  const [broadcasts, setBroadcasts] = useState([]);
  useEffect(() => {
    setBroadcasts(api.getBroadcasts());
    const interval = setInterval(() => setBroadcasts(api.getBroadcasts()), 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><Radio className="h-6 w-6 text-cyan-600" />Campus Alerts</h1><p className="text-muted-foreground text-sm">Safety alerts and announcements from campus security</p></div>
      {broadcasts.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground"><Radio className="h-10 w-10 mx-auto mb-3 opacity-30" /><p className="text-lg font-medium mb-1">No alerts at this time</p><p className="text-sm">Campus alert broadcasts will appear here</p></CardContent></Card>
      ) : (
        <div className="space-y-3">{broadcasts.map((b) => {
          const conf = severityConfig[b.severity] || severityConfig.medium;
          return (
            <Card key={b.id} className={conf.bg}><CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${conf.color}`}>{conf.icon}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{b.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${b.severity === "critical" ? "bg-red-600 text-white" : b.severity === "high" ? "bg-orange-500 text-white" : b.severity === "medium" ? "bg-yellow-500 text-white" : "bg-blue-500 text-white"}`}>{b.severity}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{b.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDistanceToNow(new Date(b.created_at), { addSuffix: true })}</span>
                    <span>By: {b.created_by_name}</span>
                  </div>
                </div>
              </div>
            </CardContent></Card>
          );
        })}</div>
      )}
    </div>
  );
}
