import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import Button from '../../components/common/Button';
import { useNotification } from '../../context/NotificationContext';

const ContactPage = () => {
  const { showToast } = useNotification();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Question',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      showToast('Your message has been received! We will reply within 24 hours.', 'success');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-pureWhite text-nearBlack pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Details */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-mutedSage">
                Get in Touch
              </span>
              <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-nearBlack tracking-tight mt-1">
                We're here to help.
              </h1>
              <p className="text-sm text-neutral-600 mt-3 leading-relaxed">
                Have questions regarding a property listing, owner onboarding, or campus recommendations? Drop our team a note.
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-warmSand">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-mutedSage shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <div className="font-bold text-nearBlack">Bengaluru Office</div>
                  <div className="text-neutral-500">Koramangala 5th Block, Bengaluru, KA 560095</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-mutedSage shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <div className="font-bold text-nearBlack">Email Support</div>
                  <div className="text-neutral-500">support@staynear.com</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-mutedSage shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <div className="font-bold text-nearBlack">Phone & WhatsApp</div>
                  <div className="text-neutral-500">+91 (80) 4123-5678 (Mon–Sat, 9AM–7PM)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="lg:col-span-7 bg-warmOffWhite p-8 sm:p-10 rounded-3xl border border-warmSand shadow-subtle">
            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-14 h-14 rounded-full bg-lightSage flex items-center justify-center mx-auto text-mutedSage">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-heading font-bold text-2xl text-nearBlack">
                  Message Sent Successfully
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 max-w-sm mx-auto">
                  Thank you for reaching out, {formData.name}. Our student housing desk will get back to you shortly.
                </p>
                <div className="pt-4">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', subject: 'General Question', message: '' });
                    }}
                  >
                    Send another message
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-sm p-3 rounded-xl bg-pureWhite border border-warmSand text-nearBlack focus:outline-none focus:border-nearBlack"
                    placeholder="e.g. Priya Sharma"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-sm p-3 rounded-xl bg-pureWhite border border-warmSand text-nearBlack focus:outline-none focus:border-nearBlack"
                    placeholder="name@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Topic
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full text-sm p-3 rounded-xl bg-pureWhite border border-warmSand text-nearBlack focus:outline-none"
                  >
                    <option value="General Question">General Question</option>
                    <option value="Listing Verification Inquiry">Listing Verification Inquiry</option>
                    <option value="Owner Onboarding Assistance">Owner Onboarding Assistance</option>
                    <option value="Report Listing Misbehavior">Report Listing Misbehavior</option>
                    <option value="Partnership & Campus Collaboration">Partnership & Campus Collaboration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Your Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full text-sm p-3 rounded-xl bg-pureWhite border border-warmSand text-nearBlack focus:outline-none focus:border-nearBlack"
                    placeholder="How can we assist you today?"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full justify-center"
                    icon={Send}
                    isLoading={loading}
                  >
                    Submit Message
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
