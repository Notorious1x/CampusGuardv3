import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/auth-context";
import SOSButton from "../../../components/SOSButton";
import AlertCard from "../../../components/AlertCard";
import * as api from "../../../lib/api";
import { getCurrentPosition } from "../../../lib/geolocation";
import { KNUST_SECURITY_NUMBER } from "../../../lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/components";
import MapView from "../../../components/MapView";
import { Phone, MapPin, Loader2, Siren } from "lucide-react";

export default function SOSPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [position, setPosition] = useState(null);
  const [loadingPos, setLoadingPos] = useState(true);

  const refreshData = useCallback(() => {
    if (!user) return;
    setAlerts(api.getUserAlerts(user.id));
  }, [user]);

  useEffect(() => {
    refreshData();
    getCurrentPosition().then((pos) => { setPosition(pos); setLoadingPos(false); });
  }, [refreshData]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Siren className="h-6 w-6 text-red-600" />Emergency SOS</h1>
        <p className="text-muted-foreground text-sm">Tap the button below to send an emergency alert with your location</p>
      </div>
      <Card className="border-red-200 bg-red-50/50 dark:bg-red-900/10">
        <CardContent className="p-4 flex items-center gap-3">
          <Phone className="h-5 w-5 text-red-600 shrink-0" />
          <div><p className="text-sm font-medium">KNUST Security Hotline</p><a href={`tel:${KNUST_SECURITY_NUMBER}`} className="text-lg font-bold text-red-600">{KNUST_SECURITY_NUMBER}</a></div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col items-center justify-center p-8">
          <SOSButton onAlertCreated={refreshData} />
          <p className="text-sm text-muted-foreground mt-4 text-center max-w-xs">Your GPS coordinates will be captured and sent to campus security immediately.</p>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4" />Your Current Location</CardTitle></CardHeader>
          <CardContent>
            {loadingPos ? <div className="h-[300px] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            : position ? <MapView latitude={position.latitude} longitude={position.longitude} />
            : <div className="h-[300px] flex items-center justify-center text-muted-foreground">Unable to get location</div>}
          </CardContent>
        </Card>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-3">Your Alert History</h2>
        {alerts.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No alerts sent yet. Stay safe.</CardContent></Card>
        ) : (
          <div className="space-y-3">{alerts.map((a) => <AlertCard key={a.id} alert={a} />)}</div>
        )}
      </div>
    </div>
  );
}
