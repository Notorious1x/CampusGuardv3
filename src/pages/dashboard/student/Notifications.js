import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/auth-context";
import * as api from "../../../lib/api";
import { Card, CardContent, Button } from "../../../components/ui/components";
import { cn } from "../../../lib/utils";
import { Bell, Siren, Footprints, FileText, Radio, Settings, Clock, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const typeIcons = {
  sos: <Siren className="h-4 w-4 text-red-500" />, safewalk: <Footprints className="h-4 w-4 text-green-500" />,
  incident: <FileText className="h-4 w-4 text-orange-500" />, broadcast: <Radio className="h-4 w-4 text-cyan-500" />,
  system: <Settings className="h-4 w-4 text-gray-500" />,
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const refreshData = useCallback(() => { if (user) setNotifications(api.getNotifications(user.id, user.role)); }, [user]);
  useEffect(() => { refreshData(); }, [refreshData]);

  const handleMarkRead = (id) => { api.markNotificationRead(id); refreshData(); };
  const handleMarkAllRead = () => { if (user) { api.markAllNotificationsRead(user.id, user.role); refreshData(); } };
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><Bell className="h-6 w-6 text-blue-600" />Notifications</h1><p className="text-muted-foreground text-sm">{unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}</p></div>
        {unreadCount > 0 && <Button variant="outline" size="sm" onClick={handleMarkAllRead}><CheckCheck className="mr-2 h-4 w-4" />Mark all read</Button>}
      </div>
      {notifications.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground"><Bell className="h-10 w-10 mx-auto mb-3 opacity-30" /><p className="text-lg font-medium mb-1">No notifications yet</p><p className="text-sm">You will receive notifications for SOS alerts, Safe Walk updates, and campus broadcasts.</p></CardContent></Card>
      ) : (
        <div className="space-y-2">{notifications.map((n) => (
          <Card key={n.id} className={cn("cursor-pointer transition-colors", !n.read && "bg-blue-50/50 border-blue-200 dark:bg-blue-900/10")} onClick={() => !n.read && handleMarkRead(n.id)}>
            <CardContent className="p-4 flex items-start gap-3">
              <div className="mt-0.5 shrink-0">{typeIcons[n.type] || typeIcons.system}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn("text-sm font-medium", !n.read && "font-semibold")}>{n.title}</p>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1.5"><Clock className="h-3 w-3" />{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</span>
              </div>
            </CardContent>
          </Card>
        ))}</div>
      )}
    </div>
  );
}
