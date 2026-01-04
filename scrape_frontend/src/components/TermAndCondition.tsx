import React from "react";
import { Link } from "react-router-dom";
import "./Terms.css"; // Optional: move styles to a separate CSS file

const Terms: React.FC = () => {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <h1>Terms and Conditions</h1>
        <p>Last updated: May 18, 2025</p>

        <p>
          Welcome to Salvage Motors, a mobile application operated by Salvage Motors ("Company", "we", "our", or "us") based in the United Kingdom. These Terms and Conditions ("Terms") govern your access to and use of the BusyMotors mobile application (the "App") and the services we provide, including car scrapping and salvage.
        </p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By registering for an account and using our App, you agree to comply with and be bound by these Terms. If you do not agree with any part of the Terms, you must not use the App.
        </p>

        <h2>2. Services</h2>
        <p>
          BusyMotors provides users access to car scrapping and salvage listings. Registered and subscribed users may view client contact information for the purpose of business engagement.
        </p>

        <h2>3. User Accounts</h2>
        <p>
          To use certain features of the App, you must register for an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.
        </p>

        <h2>4. Subscription & Payment</h2>
        <p>
          Access to client phone numbers and other premium features requires a valid paid subscription. Subscription terms, pricing, and auto-renewal policies are detailed in the relevant in-app purchase section. By subscribing, you agree to be billed in accordance with the plan selected.
        </p>

        <h2>5. Use Restrictions</h2>
        <p>
          You agree not to use the App for any unlawful purpose or in any way that may damage, disable, overburden, or impair our services. Resale, redistribution, or unauthorized sharing of client information is strictly prohibited.
        </p>

        <h2>6. Termination</h2>
        <p>
          We reserve the right to suspend or terminate your account if you violate these Terms, engage in fraudulent activity, or misuse the App.
        </p>

        <h2>7. Limitation of Liability</h2>
        <p>
          We are not liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the App, including interactions with other users or third parties.
        </p>

        <h2>8. Changes to Terms</h2>
        <p>
          We may update these Terms from time to time. Any changes will be posted within the App with a revised "last updated" date. Continued use of the App constitutes acceptance of the modified Terms.
        </p>

        <h2>9. Governing Law</h2>
        <p>
          These Terms are governed by and construed in accordance with the laws of the United Kingdom. You consent to the exclusive jurisdiction of the UK courts in all disputes arising out of or relating to the use of the App.
        </p>

        <h2>10. Contact Us</h2>
        <p>If you have any questions about these Terms, please contact us at:</p>
        <ul>
          <li>Email: <a href="mailto:salvagemotor4cash@gmail.com" className="text-blue-600">Salvagemotor4cash@gmail.com</a></li>
        </ul>

        <p className="footer-note">
          © {new Date().getFullYear()} Salvage Motors. All rights reserved.
        </p>

        <div className="back-home-btn-container">
          <Link to="/" className="back-home-button">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Terms;
