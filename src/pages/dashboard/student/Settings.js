import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/auth-context";
import * as api from "../../../lib/api";
import { Card, CardContent, CardHeader, CardTitle, Label, Separator, Toggle } from "../../../components/ui/components";
import { useToast } from "../../../components/ui/toast";
import { Settings, Bell, MapPin, Lock, Moon } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [settings, setSettings] = useState(null);

  useEffect(() => { if (user) api.getUserSettings(user.id).then(setSettings); }, [user]);

  const updateSetting = async (key, value) => {
    if (!settings) return;
    const updated = { ...settings, [key]: value };
    setSettings(updated); await api.saveUserSettings(updated);
    if (key === "dark_mode") document.documentElement.classList.toggle("dark", value);
    toast.success("Setting updated");
  };

  if (!settings) return null;

  const sections = [
    { title: "Notifications", icon: <Bell className="h-5 w-5" />, items: [
      { id: "notifications_sos", label: "SOS alerts", desc: "Get notified when your SOS status changes", key: "notifications_sos" },
      { id: "notifications_incidents", label: "Incident updates", desc: "Updates on your incident reports", key: "notifications_incidents" },
      { id: "notifications_broadcasts", label: "Campus broadcasts", desc: "Receive campus-wide safety alerts", key: "notifications_broadcasts" },
      { id: "mute_non_emergency", label: "Mute non-emergency alerts", desc: "Only receive critical notifications", key: "mute_non_emergency" },
    ]},
    { title: "Location & Privacy", icon: <MapPin className="h-5 w-5" />, items: [
      { id: "location_sharing", label: "Location sharing", desc: "Allow GPS access for emergency services", key: "location_sharing" },
    ]},
    { title: "Appearance", icon: <Moon className="h-5 w-5" />, items: [
      { id: "dark_mode", label: "Dark mode", desc: "Use dark theme for nighttime use", key: "dark_mode" },
    ]},
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold flex items-center gap-2"><Settings className="h-6 w-6" />Settings</h1><p className="text-muted-foreground text-sm">Manage your preferences and privacy</p></div>
      {sections.map((section) => (
        <Card key={section.title}>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2">{section.icon}{section.title}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {section.items.map((item, i) => (
              <div key={item.id}>{i > 0 && <Separator className="mb-4" />}
                <div className="flex items-center justify-between">
                  <div><Label htmlFor={item.id} className="text-sm font-medium cursor-pointer">{item.label}</Label><p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p></div>
                  <Toggle id={item.id} checked={settings[item.key]} onChange={(v) => updateSetting(item.key, v)} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Lock className="h-5 w-5" />Security</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div><p className="text-sm font-medium">Change password</p><p className="text-xs text-muted-foreground">Update your account password</p></div>
            <button className="text-sm text-red-600 font-medium hover:underline" onClick={() => toast.info("Password change is available in production")}>Change</button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
