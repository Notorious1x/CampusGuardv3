import React from "react";
import { Card, CardContent, Badge, Button } from "./ui/components";
import { MapPin, Clock, Phone, User, Siren, Heart, ShieldAlert, Car, HelpCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const alertTypeConfig = {
  medical: { icon: <Heart className="h-4 w-4" />, label: "Medical", color: "bg-pink-100 text-pink-700" },
  harassment: { icon: <ShieldAlert className="h-4 w-4" />, label: "Harassment", color: "bg-purple-100 text-purple-700" },
  attack: { icon: <Siren className="h-4 w-4" />, label: "Attack", color: "bg-red-100 text-red-700" },
  accident: { icon: <Car className="h-4 w-4" />, label: "Accident", color: "bg-orange-100 text-orange-700" },
  theft: { icon: <AlertTriangle className="h-4 w-4" />, label: "Theft", color: "bg-yellow-100 text-yellow-700" },
  other: { icon: <HelpCircle className="h-4 w-4" />, label: "Other", color: "bg-gray-100 text-gray-700" },
};

const severityColors = {
  critical: "bg-red-600 text-white", high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-white", low: "bg-blue-500 text-white",
};

export default function AlertCard({ alert, showActions, onStatusChange }) {
  const typeConf = alertTypeConfig[alert.alert_type] || alertTypeConfig.other;

  return (
    <Card className={alert.status === "pending" ? "border-red-300 shadow-red-100 shadow-md" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeConf.color}`}>
              {typeConf.icon}{typeConf.label}
            </span>
            {alert.severity && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${severityColors[alert.severity]}`}>{alert.severity}</span>
            )}
            <Badge variant={alert.status === "pending" ? "destructive" : alert.status === "investigating" ? "default" : "secondary"}>
              {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0 ml-2">
            <Clock className="h-3 w-3" />{formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
          </span>
        </div>
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{alert.user_name}</span></div>
          {alert.user_phone && (
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><a href={`tel:${alert.user_phone}`} className="text-blue-600 hover:underline">{alert.user_phone}</a></div>
          )}
          {alert.latitude && alert.longitude && (
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><a href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">{alert.latitude.toFixed(5)}, {alert.longitude.toFixed(5)} <ExternalLink className="h-3 w-3" /></a></div>
          )}
          {alert.message && <p className="text-muted-foreground mt-2 text-xs bg-muted p-2 rounded">{alert.message}</p>}
          {alert.responder_name && <p className="text-xs text-blue-600 mt-1">Assigned: {alert.responder_name}</p>}
        </div>
        {showActions && alert.status !== "resolved" && (
          <div className="flex gap-2 mt-3 pt-3 border-t">
            {alert.status === "pending" && (
              <Button size="sm" onClick={() => onStatusChange?.(alert.id, "investigating")} className="bg-blue-600 hover:bg-blue-700 text-white">Investigate</Button>
            )}
            {alert.status === "investigating" && (
              <Button size="sm" variant="outline" onClick={() => onStatusChange?.(alert.id, "resolved")} className="border-green-600 text-green-600 hover:bg-green-50">Mark Resolved</Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
