import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/auth-context";
import * as api from "../../../lib/api";
import { Card, CardContent, CardHeader, CardTitle, Label, Separator, Toggle } from "../../../components/ui/components";
import { useToast } from "../../../components/ui/toast";
import PushToggle from "../../../components/PushToggle";
import { Settings, Bell, Moon, Lock } from "lucide-react";

export default function GuardianSettingsPage() {
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
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><Settings className="h-6 w-6" />Settings</h1><p className="text-muted-foreground text-sm">Manage your notification and display preferences</p></div>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Bell className="h-5 w-5" />Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <PushToggle settings={settings} onUpdate={updateSetting} />
          <Separator />
          <div className="flex items-center justify-between"><div><Label className="cursor-pointer">SOS alerts</Label><p className="text-xs text-muted-foreground">Get notified during emergencies</p></div><Toggle checked={settings.notifications_sos} onChange={(v) => updateSetting("notifications_sos", v)} /></div>
          <Separator />
          <div className="flex items-center justify-between"><div><Label className="cursor-pointer">Campus broadcasts</Label><p className="text-xs text-muted-foreground">Receive campus-wide alerts</p></div><Toggle checked={settings.notifications_broadcasts} onChange={(v) => updateSetting("notifications_broadcasts", v)} /></div>
          <Separator />
          <div className="flex items-center justify-between"><div><Label className="cursor-pointer">Mute non-emergency</Label><p className="text-xs text-muted-foreground">Only critical notifications</p></div><Toggle checked={settings.mute_non_emergency} onChange={(v) => updateSetting("mute_non_emergency", v)} /></div>
        </CardContent>
      </Card>
      <Card><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Moon className="h-5 w-5" />Appearance</CardTitle></CardHeader>
        <CardContent><div className="flex items-center justify-between"><div><Label className="cursor-pointer">Dark mode</Label><p className="text-xs text-muted-foreground">Switch to dark theme</p></div><Toggle checked={settings.dark_mode} onChange={(v) => updateSetting("dark_mode", v)} /></div></CardContent>
      </Card>
      <Card><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Lock className="h-5 w-5" />Security</CardTitle></CardHeader>
        <CardContent><div className="flex items-center justify-between p-3 rounded-lg bg-muted/50"><div><p className="text-sm font-medium">Change password</p><p className="text-xs text-muted-foreground">Update your account password</p></div><button className="text-sm text-red-600 font-medium hover:underline" onClick={() => toast.info("Available in production")}>Change</button></div></CardContent>
      </Card>
    </div>
  );
}
