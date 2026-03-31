import React, { useState, useCallback } from "react";
import { useAuth } from "../context/auth-context";
import { getCurrentPosition } from "../lib/geolocation";
import * as api from "../lib/api";
import { Button, Label, Textarea, Select, Dialog } from "./ui/components";
import { useToast } from "./ui/toast";
import { AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";

export default function SOSButton({ onAlertCreated }) {
  const { user } = useAuth();
  const toast = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [alertType, setAlertType] = useState("other");
  const [severity, setSeverity] = useState("high");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSOS = useCallback(async () => {
    if (!user) return;
    setSending(true);
    try {
      let pos;
      try { pos = await getCurrentPosition(); } catch {
        toast.error("Could not get your location. Please enable GPS and try again.");
        setSending(false);
        return;
      }
      await api.createAlert(user.id, user.full_name, user.phone, alertType, severity, pos.latitude, pos.longitude, message || undefined);
      setSent(true);
      setTimeout(() => {
        setSent(false); setShowDialog(false); setMessage(""); setAlertType("other"); setSeverity("high");
        onAlertCreated?.();
      }, 2000);
    } catch (err) {
      toast.error("Failed to send SOS");
    } finally { setSending(false); }
  }, [user, alertType, severity, message, onAlertCreated, toast]);

  return (
    <>
      <button onClick={() => setShowDialog(true)} className="relative group" aria-label="Send SOS Alert">
        <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20 group-hover:opacity-40 transition-opacity" />
        <div className="relative flex items-center justify-center w-44 h-44 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-2xl shadow-red-500/40 hover:shadow-red-500/60 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border-4 border-red-400/50">
          <div className="text-center text-white">
            <AlertTriangle className="h-12 w-12 mx-auto mb-1" />
            <span className="text-2xl font-black tracking-wide">SOS</span>
            <p className="text-[10px] opacity-80 mt-0.5">TAP FOR HELP</p>
          </div>
        </div>
      </button>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <h2 className="text-lg font-semibold text-red-600 flex items-center gap-2 mb-1">
          <AlertTriangle className="h-5 w-5" /> Send Emergency Alert
        </h2>
        <p className="text-sm text-muted-foreground mb-4">Your location will be captured and sent to campus security.</p>

        {sent ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <p className="text-lg font-semibold text-green-700">Alert Sent!</p>
            <p className="text-sm text-muted-foreground">Campus security has been notified.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Emergency Type</Label>
              <Select value={alertType} onChange={setAlertType}>
                <option value="medical">Medical Emergency</option>
                <option value="harassment">Harassment</option>
                <option value="attack">Physical Attack</option>
                <option value="accident">Accident</option>
                <option value="theft">Theft</option>
                <option value="other">Other Emergency</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Severity Level</Label>
              <Select value={severity} onChange={setSeverity}>
                <option value="critical">Critical - Life threatening</option>
                <option value="high">High - Immediate danger</option>
                <option value="medium">Medium - Needs attention</option>
                <option value="low">Low - Non-urgent</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Additional Details (optional)</Label>
              <Textarea placeholder="Describe the situation briefly..." value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowDialog(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleSOS} disabled={sending} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                {sending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : "Send SOS Alert"}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
