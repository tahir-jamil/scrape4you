import React from "react";
import "./PrivacyPolicy.css";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <h1>Privacy Policy</h1>
        <p className="mb-4">Last updated: May 18, 2025</p>

        <p className="mb-4">
          BusyMotors, operated by Salvage Motors in the United Kingdom, is committed to protecting your privacy. This Privacy Policy outlines how we collect, use, and safeguard your information when you use our mobile application.
        </p>

        <h2>1. Information We Collect</h2>
        <p>
          We may collect personal information you voluntarily provide to us, such as your name, email address, phone number, and payment details when registering or subscribing to our services.
        </p>

        <h2>2. How We Use Your Information</h2>
        <p>
          Your information is used to create and manage your account, provide customer support, send transactional emails, improve our services, and process payments for subscriptions.
        </p>

        <h2>3. Sharing of Information</h2>
        <p>
          We do not sell or rent your personal information to third parties. We may share information with trusted service providers under confidentiality agreements to support service delivery.
        </p>

        <h2>4. Data Security</h2>
        <p>
          We implement industry-standard security measures to protect your information from unauthorized access, disclosure, or destruction. However, no internet-based service is 100% secure.
        </p>

        <h2>5. Cookies & Tracking Technologies</h2>
        <p>
          Our app may use cookies or similar technologies to enhance user experience, remember preferences, and track interactions for analytics purposes.
        </p>

        <h2>6. Your Rights</h2>
        <p>
          You have the right to access, correct, or delete your personal data. You may also opt out of communications at any time by contacting us directly.
        </p>

        <h2>7. Children's Privacy</h2>
        <p>
          Our services are not intended for individuals under the age of 18. We do not knowingly collect data from children.
        </p>

        <h2>8. Changes to This Policy</h2>
        <p>
          We reserve the right to update this Privacy Policy at any time. Changes will be posted with an updated date. Continued use of the app constitutes acceptance of the revised policy.
        </p>

        <h2>9. Contact Us</h2>
        <p>
          If you have any questions or concerns about this Privacy Policy, you can reach us at:
        </p>
        <ul className="mb-4 list-disc list-inside">
          <li>Email: <a href="mailto:salvagemotor4cash@gmail.com" className="text-blue-600">Salvagemotor4cash@gmail.com</a></li>
        </ul>

        <p className="text-sm text-gray-500 mt-6">
          © {new Date().getFullYear()} Salvage Motors. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
