import Header from '@/components/Header';

const PrivacyPolicy = () => {
  return (
    <div>
      <Header>
        <div className="h-full flex flex-col items-center justify-center">
          <h1 className="lg:text-6xl text-4xl font-bold text-center text-foreground">
            Privacy Policy
          </h1>
        </div>
      </Header>

      {/* Content section with subtle gradient background */}
      <div>
        <div className="legal-content site-shell max-w-4xl py-20 sm:py-28">
          <div className="text-center mb-8">
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your privacy is important to us. This policy outlines how we
              collect, use, and protect your information.
            </p>
          </div>

          {/* Policy Overview */}
          <div className="bg-secondary/50 border border-border rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-foreground text-center">
              Privacy Policy for www.billyrice.com
            </h2>

            <p className="mb-4 text-muted-foreground">Last Updated: April 19, 2026</p>

            <p className="mb-4 text-muted-foreground">
              Thank you for visiting www.billyrice.com. Your privacy is
              important to us. This Privacy Policy outlines how we collect, use,
              disclose, and safeguard your personal information. By using our
              website, you agree to the terms of this Privacy Policy.
            </p>
          </div>

          {/* Information We Collect */}
          <div className="bg-secondary/50 border border-border rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-xl font-bold mb-4 text-foreground">
              Information We Collect
            </h2>

            <p className="mb-4 text-muted-foreground">
              <strong>Personal Information</strong>
              <br />
              When you voluntarily create an account on www.billyrice.com, we
              may collect the following personal information:
            </p>

            <ul className="list-disc pl-8 mb-4 text-muted-foreground">
              <li>Full Name</li>
              <li>Email Address</li>
              <li>
                Any additional information voluntarily provided in your account
                profile
              </li>
            </ul>

            <p className="mb-4 text-muted-foreground">
              <strong>Cookies</strong>
              <br />
              We use cookies to enhance your experience on our website. Cookies
              are small text files stored on your device. By using
              www.billyrice.com, you consent to the use of cookies.
            </p>
          </div>

          {/* How We Use Your Information */}
          <div className="bg-secondary/50 border border-border rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-xl font-bold mb-4 text-foreground">
              How We Use Your Information
            </h2>

            <p className="mb-4 text-muted-foreground">
              We use the collected information, including personal information,
              for the following purposes:
            </p>

            <ul className="list-disc pl-8 mb-4 text-muted-foreground">
              <li>To provide and personalize our services</li>
              <li>
                To communicate with you regarding your account and updates
              </li>
              <li>
                To analyze and improve the functionality of www.billyrice.com
              </li>
              <li>To comply with legal obligations</li>
            </ul>
          </div>

          {/* Sharing Your Information */}
          <div className="bg-secondary/50 border border-border rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-xl font-bold mb-4 text-foreground">
              Sharing Your Information
            </h2>

            <p className="mb-4 text-muted-foreground">
              We do not sell, trade, or otherwise transfer your personal
              information to third parties without your consent. However, we may
              share your information in the following circumstances:
            </p>

            <ul className="list-disc pl-8 mb-4 text-muted-foreground">
              <li>
                With trusted third-party service providers who assist us in
                operating our website
              </li>
              <li>
                To comply with legal obligations, such as responding to lawful
                requests and court orders
              </li>
            </ul>
          </div>

          {/* Your Choices */}
          <div className="bg-secondary/50 border border-border rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-xl font-bold mb-4 text-foreground">Your Choices</h2>

            <p className="mb-4 text-muted-foreground">You have the right to:</p>

            <ul className="list-disc pl-8 mb-4 text-muted-foreground">
              <li>Review and update your account information</li>
              <li>Opt-out of receiving promotional communications</li>
              <li>Disable cookies through your browser settings</li>
            </ul>
          </div>

          {/* Security */}
          <div className="bg-secondary/50 border border-border rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-xl font-bold mb-4 text-foreground">Security</h2>

            <p className="mb-4 text-muted-foreground">
              We implement reasonable security measures to protect your personal
              information. However, no method of transmission over the internet
              or electronic storage is completely secure. Therefore, we cannot
              guarantee absolute security.
            </p>
          </div>

          {/* Changes to This Privacy Policy */}
          <div className="bg-secondary/50 border border-border rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-xl font-bold mb-4 text-foreground">
              Changes to This Privacy Policy
            </h2>

            <p className="mb-4 text-muted-foreground">
              We may update this Privacy Policy periodically. The date of the
              last update will be reflected at the top of the page. We encourage
              you to review this Privacy Policy regularly for any changes.
            </p>
          </div>

          {/* Contact Us */}
          <div className="bg-secondary/50 border border-border rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-bold mb-4 text-foreground">Contact Us</h2>

            <p className="text-muted-foreground">
              If you have any questions or concerns about this Privacy Policy,
              please contact us at contact@billyrice.com.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
