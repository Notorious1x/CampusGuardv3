import React, { useState } from "react";
import LegalLayout from "./LegalLayout";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What is CampusGuard?",
    a: "CampusGuard is a campus safety system for the KNUST community. It lets you send one-tap SOS alerts with your GPS location to campus security, share your live location with trusted guardians during walks, report incidents, and receive campus-wide safety broadcasts.",
  },
  {
    q: "Why do I need to verify my email?",
    a: "Email verification confirms you own the address you registered with and keeps the platform secure. After signing up, check your inbox for a verification link. You must click it before you can log in. If you don't see the email, check your spam folder or use the 'Resend verification email' option on the login page.",
  },
  {
    q: "Can I sign in with Google?",
    a: "Yes. Use the 'Continue with Google' button on the login or sign-up page. Google accounts are automatically verified, so no separate email verification is needed. Google sign-ups are created as student accounts by default.",
  },
  {
    q: "How do pop-up notifications work?",
    a: "Go to Settings and turn on 'Pop-up notifications'. Your browser or phone will ask for permission — tap Allow. You'll then get pop-up alerts for SOS updates, Safe Walk events, incident updates, and campus broadcasts. On Android phones, adding CampusGuard to your home screen gives the best experience. You can turn notifications off at any time.",
  },
  {
    q: "How does the SOS button work?",
    a: "Pressing the SOS button captures your GPS location and immediately sends an emergency alert to campus security, who can see your position on a live map and respond. Only use SOS for genuine emergencies — false alarms may lead to account suspension.",
  },
  {
    q: "What is Safe Walk?",
    a: "Safe Walk lets you share your live location with selected guardians while you walk somewhere (for example, at night). Your guardians can watch your progress in real time, and you check in when you arrive safely. If you miss your check-in deadline, your guardians are alerted.",
  },
  {
    q: "Who can see my location?",
    a: "Your location is only shared when you trigger an SOS (visible to campus security) or during a Safe Walk session (visible to the guardians you chose). Nobody can track you passively.",
  },
  {
    q: "How do I add a guardian?",
    a: "Go to Guardians in your student dashboard and add their name, phone number, email, and relationship. If they have a CampusGuard guardian account, they'll receive live notifications during your Safe Walk sessions and emergencies.",
  },
  {
    q: "How do I register as security personnel?",
    a: "Select 'Security' as your role when signing up and enter the Security ID issued to you by administration. Each Security ID can only be used once. If you don't have one, contact your administrator.",
  },
  {
    q: "How do I report an incident?",
    a: "Go to 'Report Incident' in your dashboard. Describe what happened, set the severity, add the location, and optionally attach a photo. Campus security reviews every report and you'll be notified when its status changes.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. Your data is stored securely with encryption, passwords are hashed, and access is restricted. We never sell your data. See our Privacy Policy for full details.",
  },
  {
    q: "How do I delete my account?",
    a: "Contact campus security administration or the CampusGuard team to request account deletion. This removes your profile, settings, guardians, and notification history.",
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left font-semibold text-sm hover:bg-muted/50 transition-colors"
      >
        {q}
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>}
    </div>
  );
}

export default function FAQPage() {
  return (
    <LegalLayout title="Frequently Asked Questions" subtitle="Everything you need to know about CampusGuard">
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <FaqItem key={i} q={f.q} a={f.a} />
        ))}
      </div>
    </LegalLayout>
  );
}
