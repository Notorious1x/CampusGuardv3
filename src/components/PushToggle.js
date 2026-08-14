import React, { useState, useEffect } from "react";
import { Label, Toggle } from "./ui/components";
import { useToast } from "./ui/toast";
import { isPushSupported, getPermission, requestNotificationPermission, showDeviceNotification } from "../lib/push";

export default function PushToggle({ settings, onUpdate }) {
  const toast = useToast();
  const [permission, setPermission] = useState(getPermission());

  useEffect(() => { setPermission(getPermission()); }, []);

  const enabled = Boolean(settings?.push_enabled) && permission === "granted";

  const handleToggle = async (value) => {
    if (!value) {
      await onUpdate("push_enabled", false);
      return;
    }
    if (!isPushSupported()) {
      toast.error("Notifications are not supported on this browser");
      return;
    }
    const granted = await requestNotificationPermission();
    setPermission(getPermission());
    if (!granted) {
      toast.error("Permission denied. Enable notifications for this site in your browser settings.");
      return;
    }
    await onUpdate("push_enabled", true);
    showDeviceNotification("CampusGuard", "Notifications are on. You'll get alerts like this one.");
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <Label className="text-sm font-medium cursor-pointer">Pop-up notifications</Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          {permission === "denied"
            ? "Blocked by your browser — allow notifications for this site to enable"
            : "Show alerts on your phone or computer, even in the background"}
        </p>
      </div>
      <Toggle checked={enabled} onChange={handleToggle} />
    </div>
  );
}
