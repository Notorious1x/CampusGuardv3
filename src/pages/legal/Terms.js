import React from "react";
import LegalLayout, { Section } from "./LegalLayout";

export default function TermsPage() {
  return (
    <LegalLayout title="Terms & Conditions" subtitle="Last updated: August 2026">
      <Section heading="1. Acceptance of Terms">
        <p>
          By creating an account or using CampusGuard, you agree to these Terms &amp; Conditions and our Privacy Policy.
          If you do not agree, please do not use the Service.
        </p>
      </Section>

      <Section heading="2. What CampusGuard Is">
        <p>
          CampusGuard is a web-based campus safety system for the KNUST community providing SOS alerts, Safe Walk
          location sharing, incident reporting, guardian notifications, and campus-wide safety broadcasts.
        </p>
        <p className="font-medium text-foreground">
          CampusGuard is a supplementary safety tool. It does not replace emergency services. In a life-threatening
          emergency, always call campus security or national emergency services directly.
        </p>
      </Section>

      <Section heading="3. Eligibility & Accounts">
        <ul className="list-disc pl-5 space-y-1">
          <li>You must provide accurate and truthful information when registering.</li>
          <li>You must verify your email address before signing in.</li>
          <li>Security personnel accounts require a valid Security ID issued by administration.</li>
          <li>You are responsible for keeping your login credentials confidential.</li>
          <li>One account per person. Do not share accounts.</li>
        </ul>
      </Section>

      <Section heading="4. Acceptable Use">
        <p>You agree NOT to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Trigger false SOS alerts or submit fake incident reports</li>
          <li>Misuse or attempt to claim a Security ID that was not issued to you</li>
          <li>Harass, stalk, or track other users through the platform</li>
          <li>Attempt to access other users' data or interfere with the Service's operation</li>
          <li>Use the Service for any unlawful purpose</li>
        </ul>
        <p>False alarms waste emergency resources and may result in account suspension and disciplinary action under university regulations.</p>
      </Section>

      <Section heading="5. Location Services">
        <p>
          Emergency features rely on your device's GPS. Location accuracy depends on your device and environment.
          We are not liable for delays or failures caused by inaccurate GPS data, poor connectivity, or disabled
          location permissions.
        </p>
      </Section>

      <Section heading="6. Notifications">
        <p>
          Safety notifications depend on your device, browser, and network availability. Do not rely solely on
          app notifications for time-critical emergencies.
        </p>
      </Section>

      <Section heading="7. Service Availability">
        <p>
          We aim to keep CampusGuard available at all times but do not guarantee uninterrupted service. The Service
          may be temporarily unavailable due to maintenance, network issues, or events outside our control.
        </p>
      </Section>

      <Section heading="8. Limitation of Liability">
        <p>
          CampusGuard is provided "as is". To the maximum extent permitted by law, the CampusGuard team and KNUST are
          not liable for any damages arising from the use of, or inability to use, the Service, including delayed
          emergency responses.
        </p>
      </Section>

      <Section heading="9. Termination">
        <p>
          We may suspend or terminate accounts that violate these terms, particularly for false alerts or misuse of
          the platform. You may stop using the Service and request account deletion at any time.
        </p>
      </Section>

      <Section heading="10. Changes to These Terms">
        <p>
          We may update these terms from time to time. Continued use of the Service after changes constitutes
          acceptance of the revised terms.
        </p>
      </Section>

      <Section heading="11. Contact">
        <p>For questions about these terms, contact KNUST campus security or the CampusGuard team (GROUP 3).</p>
      </Section>
    </LegalLayout>
  );
}
