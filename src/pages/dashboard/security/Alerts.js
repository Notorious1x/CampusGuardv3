import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/auth-context";
import * as api from "../../../lib/api";
import AlertCard from "../../../components/AlertCard";
import { Card, CardContent, Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/components";
import { useToast } from "../../../components/ui/toast";
import { Siren } from "lucide-react";

export default function SecurityAlertsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [alerts, setAlerts] = useState([]);

  const refreshData = useCallback(() => { setAlerts(api.getAlerts()); }, []);
  useEffect(() => { refreshData(); const interval = setInterval(refreshData, 5000); return () => clearInterval(interval); }, [refreshData]);

  const handleStatusChange = (alertId, status) => {
    api.updateAlertStatus(alertId, status, user?.id, user?.full_name);
    toast.success(`Alert marked as ${status}`); refreshData();
  };

  const pending = alerts.filter((a) => a.status === "pending");
  const investigating = alerts.filter((a) => a.status === "investigating");
  const resolved = alerts.filter((a) => a.status === "resolved");

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><Siren className="h-6 w-6 text-red-600" />SOS Alerts</h1><p className="text-muted-foreground text-sm">Monitor and respond to emergency alerts</p></div>
      <Tabs defaultValue="pending">
        <TabsList><TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger><TabsTrigger value="investigating">Investigating ({investigating.length})</TabsTrigger><TabsTrigger value="resolved">Resolved ({resolved.length})</TabsTrigger></TabsList>
        <TabsContent value="pending" className="space-y-3 mt-4">
          {pending.length === 0 ? <Card><CardContent className="p-8 text-center text-muted-foreground">No pending alerts</CardContent></Card> : pending.map((a) => <AlertCard key={a.id} alert={a} showActions onStatusChange={handleStatusChange} />)}
        </TabsContent>
        <TabsContent value="investigating" className="space-y-3 mt-4">
          {investigating.length === 0 ? <Card><CardContent className="p-8 text-center text-muted-foreground">No alerts under investigation</CardContent></Card> : investigating.map((a) => <AlertCard key={a.id} alert={a} showActions onStatusChange={handleStatusChange} />)}
        </TabsContent>
        <TabsContent value="resolved" className="space-y-3 mt-4">
          {resolved.length === 0 ? <Card><CardContent className="p-8 text-center text-muted-foreground">No resolved alerts</CardContent></Card> : resolved.map((a) => <AlertCard key={a.id} alert={a} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
