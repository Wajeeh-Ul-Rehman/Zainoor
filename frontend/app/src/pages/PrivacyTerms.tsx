export default function PrivacyTerms() {
  return (
    <main className="bg-white">
      {/* Header */}
      <section className="bg-black pt-32 lg:pt-40 pb-12 lg:pb-16">
        <div className="container-main px-6 md:px-10">
          <h1 className="font-display text-white text-4xl lg:text-6xl xl:text-[100px] leading-[0.9]">
            Legal Policies
          </h1>
          <p className="font-body font-light text-[#C1C1C1] mt-4 max-w-[600px]">
            Please read our Privacy Policy and Terms & Conditions carefully before using our services.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-20">
        <div className="container-main px-6 md:px-10 max-w-4xl mx-auto space-y-16">
          
          {/* =======================
              PRIVACY POLICY
          ======================== */}
          <div className="space-y-6">
            <div className="border-b border-[#EFEFEF] pb-4 mb-8">
              <h2 className="font-display text-3xl lg:text-4xl">Privacy Policy</h2>
            </div>

            <div className="space-y-4 font-body text-[15px] text-[#424242] leading-relaxed">
              <h3 className="font-semibold text-black text-lg mt-6">1. Information We Collect</h3>
              <p>
                At Zainoor, we deeply respect your privacy. The only personal information we can access is the exact data you voluntarily provide to us during registration, checkout, or when filling out our contact forms (such as your name, email, phone number, and shipping address). 
              </p>

              <h3 className="font-semibold text-black text-lg mt-6">2. Zero Data Theft & No Third-Party Sharing</h3>
              <p>
                We have a strict <strong>Zero Data Theft Policy</strong>. The information you provide is accessible solely by our internal team for the strict purpose of fulfilling your orders and responding to your inquiries. We do not sell, rent, trade, or expose your personal data to any third-party marketing agencies or external data brokers under any circumstances.
              </p>

              <h3 className="font-semibold text-black text-lg mt-6">3. How We Use Your Information</h3>
              <p>
                Your data is used exclusively to:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Process and deliver your order accurately.</li>
                <li>Send you transactional emails (order confirmations, dispatch updates, and cancellations).</li>
                <li>Contact you via phone or email in the event of a delivery delay or issue.</li>
              </ul>

              <h3 className="font-semibold text-black text-lg mt-6">4. Data Security</h3>
              <p>
                We implement robust security measures to maintain the safety of your personal information. Your passwords and authentication tokens are securely encrypted.
              </p>
            </div>
          </div>


          {/* =======================
              TERMS & CONDITIONS
          ======================== */}
          <div className="space-y-6 pt-10">
            <div className="border-b border-[#EFEFEF] pb-4 mb-8">
              <h2 className="font-display text-3xl lg:text-4xl">Terms & Conditions</h2>
            </div>

            <div className="space-y-4 font-body text-[15px] text-[#424242] leading-relaxed">
              <p>
                By accessing and placing an order with Zainoor, you confirm that you are in agreement with and bound by the terms of service contained below.
              </p>

              <h3 className="font-semibold text-black text-lg mt-6">1. Payment Methods</h3>
              <p>
                Currently, <strong>Cash on Delivery (COD) is the only payment method available</strong>. You are required to pay the exact invoice amount in cash to the courier representative at the time of delivery. Please ensure you have the exact change available to avoid any inconvenience.
              </p>

              <h3 className="font-semibold text-black text-lg mt-6">2. Shipping & Delivery Timeframes</h3>
              <p>
                Our standard delivery window is <strong>up to 14 working days</strong> from the date your order is confirmed. While we strive to deliver your items much faster, unforeseen logistics or manufacturing delays can occasionally occur.
              </p>
              <p>
                <strong>In Case of Delay:</strong> If your order exceeds the 14-day delivery window, our team will proactively notify you via a direct phone call or email using the contact details provided at checkout.
              </p>

              <h3 className="font-semibold text-black text-lg mt-6">3. Return & Exchange Policy</h3>
              <p>
                We maintain a strict quality control process. However, to ensure fairness and efficiency, <strong>returns are only accepted if we have delivered the wrong product</strong> (e.g., incorrect size, incorrect color, or an entirely different item than what was ordered). 
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>If you receive a wrong item, you must notify us via our Contact Form or support email within 48 hours of delivery.</li>
                <li>We do not offer returns or exchanges for a "change of mind" or if the customer accidentally ordered the wrong size. Please review the size charts carefully before placing an order.</li>
              </ul>

              <h3 className="font-semibold text-black text-lg mt-6">4. Order Cancellations</h3>
              <p>
                You may cancel your order at any time while the order status is marked as "Pending" or "In Progress" through your user dashboard. Once an order status is updated to "Sent for Packing" or "Out for Delivery", it can no longer be cancelled by the user. Zainoor reserves the right to cancel any order due to stock unavailability, pricing errors, or suspicious activity.
              </p>

              <h3 className="font-semibold text-black text-lg mt-6">5. Product Descriptions & Accuracy</h3>
              <p>
                We make every effort to display the colors, attributes, and specifications of our products accurately. However, the actual colors you see will depend on your monitor or mobile display, and we cannot guarantee that your device's display of any color will be perfectly accurate.
              </p>

              <h3 className="font-semibold text-black text-lg mt-6">6. Changes to Terms</h3>
              <p>
                We reserve the right to modify these terms and policies at any time. Any changes will be posted on this page immediately. Continued use of the website following any changes indicates your acceptance of the new terms.
              </p>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}