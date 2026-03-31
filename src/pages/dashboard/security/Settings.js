import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/auth-context";
import * as api from "../../../lib/api";
import { Card, CardContent, CardHeader, CardTitle, Label, Separator, Toggle } from "../../../components/ui/components";
import { useToast } from "../../../components/ui/toast";
import { Settings, Bell, Moon, Lock, Radio } from "lucide-react";

export default function SecuritySettingsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [settings, setSettings] = useState(null);
  useEffect(() => { if (user) api.getUserSettings(user.id).then(setSettings); }, [user]);

  const updateSetting = async (key, value) => {
    if (!settings) return;
    const updated = { ...settings, [key]: value }; setSettings(updated); await api.saveUserSettings(updated);
    if (key === "dark_mode") document.documentElement.classList.toggle("dark", value);
    toast.success("Setting updated");
  };

  if (!settings) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><Settings className="h-6 w-6" />Settings</h1><p className="text-muted-foreground text-sm">Configure your security dashboard preferences</p></div>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Bell className="h-5 w-5" />Notification Preferences</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between"><div><Label className="cursor-pointer">SOS alert notifications</Label><p className="text-xs text-muted-foreground">Get notified for new emergency alerts</p></div><Toggle checked={settings.notifications_sos} onChange={(v) => updateSetting("notifications_sos", v)} /></div>
          <Separator />
          <div className="flex items-center justify-between"><div><Label className="cursor-pointer">Incident report notifications</Label><p className="text-xs text-muted-foreground">Get notified for new incident reports</p></div><Toggle checked={settings.notifications_incidents} onChange={(v) => updateSetting("notifications_incidents", v)} /></div>
          <Separator />
          <div className="flex items-center justify-between"><div><Label className="cursor-pointer">Broadcast notifications</Label><p className="text-xs text-muted-foreground">Notifications for your own broadcasts</p></div><Toggle checked={settings.notifications_broadcasts} onChange={(v) => updateSetting("notifications_broadcasts", v)} /></div>
        </CardContent>
      </Card>
      <Card><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Radio className="h-5 w-5" />Alert Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50"><div><p className="text-sm font-medium">Auto-priority configuration</p><p className="text-xs text-muted-foreground">Automatically assign priority based on alert type</p></div><span className="text-sm text-muted-foreground">Enabled</span></div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50"><div><p className="text-sm font-medium">Sound alerts</p><p className="text-xs text-muted-foreground">Play sound for critical alerts</p></div><span className="text-sm text-muted-foreground">Enabled</span></div>
        </CardContent>
      </Card>
      <Card><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Moon className="h-5 w-5" />Appearance</CardTitle></CardHeader>
        <CardContent><div className="flex items-center justify-between"><div><Label className="cursor-pointer">Dark mode</Label><p className="text-xs text-muted-foreground">Switch to dark theme</p></div><Toggle checked={settings.dark_mode} onChange={(v) => updateSetting("dark_mode", v)} /></div></CardContent>
      </Card>
      <Card><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Lock className="h-5 w-5" />Security</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50"><div><p className="text-sm font-medium">Change password</p><p className="text-xs text-muted-foreground">Update your account password</p></div><button className="text-sm text-red-600 font-medium hover:underline" onClick={() => toast.info("Available in production")}>Change</button></div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50"><div><p className="text-sm font-medium">User access control</p><p className="text-xs text-muted-foreground">Manage role-based permissions</p></div><span className="text-sm text-muted-foreground">Admin only</span></div>
        </CardContent>
      </Card>
    </div>
  );
}
