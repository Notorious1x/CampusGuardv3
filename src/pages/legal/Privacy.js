import React from "react";
import LegalLayout, { Section } from "./LegalLayout";

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" subtitle="Last updated: August 2026">
      <Section heading="1. Introduction">
        <p>
          CampusGuard ("we", "our", "the Service") is a campus safety system built for the KNUST community.
          This Privacy Policy explains what information we collect, how we use it, and the choices you have.
          By using CampusGuard you agree to the practices described here.
        </p>
      </Section>

      <Section heading="2. Information We Collect">
        <p><strong className="text-foreground">Account information:</strong> your full name, email address, student ID, phone number, and role (student, security, or guardian) provided when you register.</p>
        <p><strong className="text-foreground">Location data:</strong> your GPS coordinates are collected only when you trigger an SOS alert, start a Safe Walk session, or report an incident with a location attached. Location sharing can be turned off in Settings, but it is required for emergency features to work.</p>
        <p><strong className="text-foreground">Safety activity:</strong> SOS alerts, Safe Walk sessions, incident reports (including any photos you attach), and guardian relationships you create.</p>
        <p><strong className="text-foreground">Sign-in data:</strong> if you sign in with Google, we receive your name, email address, and profile picture from Google. We never see your Google password.</p>
      </Section>

      <Section heading="3. How We Use Your Information">
        <p>We use your information solely to operate the safety system:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Dispatching SOS alerts with your location to campus security</li>
          <li>Sharing your live location with the guardians you choose during Safe Walk sessions</li>
          <li>Processing and following up on incident reports</li>
          <li>Sending you notifications about your alerts, reports, and campus-wide broadcasts</li>
          <li>Verifying your identity and securing your account</li>
        </ul>
        <p>We do not sell your personal data or use it for advertising.</p>
      </Section>

      <Section heading="4. Who Can See Your Data">
        <p>Campus security personnel can see active SOS alerts, Safe Walk sessions, and incident reports, including the reporter's name and location. Guardians you add can see your live location only during Safe Walk sessions you share with them. Other students cannot see your personal data.</p>
      </Section>

      <Section heading="5. Data Storage & Security">
        <p>Your data is stored securely with Supabase (our database and authentication provider) using encryption in transit and at rest. Passwords are hashed and never stored in plain text. Access to the database is restricted.</p>
      </Section>

      <Section heading="6. Notifications">
        <p>If you enable pop-up notifications, your browser or phone will display safety alerts. You can turn these off at any time in Settings or through your device's notification preferences.</p>
      </Section>

      <Section heading="7. Data Retention & Deletion">
        <p>Resolved alerts are archived. You may request deletion of your account and associated data by contacting campus security administration. Deleting your account removes your profile, settings, guardians, and notification history.</p>
      </Section>

      <Section heading="8. Your Rights">
        <ul className="list-disc pl-5 space-y-1">
          <li>Access and update your profile information at any time</li>
          <li>Disable location sharing or notifications in Settings</li>
          <li>Remove guardians and end Safe Walk sessions whenever you wish</li>
          <li>Request a copy or deletion of your data</li>
        </ul>
      </Section>

      <Section heading="9. Changes to This Policy">
        <p>We may update this policy from time to time. Significant changes will be announced through the app. Continued use after changes means you accept the updated policy.</p>
      </Section>

      <Section heading="10. Contact">
        <p>Questions about privacy? Contact KNUST campus security or the CampusGuard team (GROUP 3).</p>
      </Section>
    </LegalLayout>
  );
}
