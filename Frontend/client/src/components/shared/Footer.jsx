import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github,
  Twitter,
  Linkedin,
  Instagram,
  ArrowUp,
  Mail,
  Check,
  Globe,
  Loader2
} from "lucide-react";
import logo from "/logo.jpg";

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) {
      setEmailError("Email address is required.");
      return;
    }
    // Simple email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setEmailError("");
    setIsSubmitting(true);

    // Mock network request
    setTimeout(() => {
      setIsSubmitting(false);
      setSubscribed(true);
    }, 1200);
  };

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const triggerToast = (featureName) => {
    setToastMessage(`"${featureName}" is under construction. Coming soon!`);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  const handleFeaturesClick = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      // Scroll to features section
      const featuresEl = document.getElementById("features");
      if (featuresEl) {
        featuresEl.scrollIntoView({ behavior: "smooth" });
      } else {
        // Fallback search by query selector or scroll down a bit
        window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
      }
    } else {
      navigate("/");
      // Wait for navigation and then scroll (or standard landing page behavior)
    }
  };

  return (
    <footer className="relative bg-surface border-t border-base transition-colors duration-300">
      {/* Toast Alert for under construction pages */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[var(--color-surface)] text-[var(--color-text-primary)] px-5 py-4 rounded-xl shadow-2xl text-sm font-medium border border-[var(--color-gold)]/40 backdrop-blur-md"
          >
            <Globe className="h-5 w-5 text-[var(--color-gold)] animate-pulse shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-4 flex flex-col space-y-4">
            <Link to="/home" className="flex items-center space-x-3 w-fit">
              <motion.img
                whileHover={{ scale: 1.03 }}
                src={logo}
                alt="Campus Sphere Logo"
                className="h-12 w-16 rounded border object-cover"
                style={{ borderColor: "color-mix(in srgb, var(--color-gold) 40%, transparent)" }}
              />
              <span className="font-heading text-xl md:text-2xl font-bold tracking-tight gradient-text">
                Campus Sphere
              </span>
            </Link>
            <p className="text-sm text-secondary leading-relaxed max-w-sm">
              Your ultimate campus event & club hub. Connect, compete, and collaborate with peers through sports, coding contests, and vibrant club activities.
            </p>
            {/* Social Media Links */}
            <div className="flex items-center space-x-3 pt-2">
              {[
                { icon: Twitter, label: "Twitter", url: "https://twitter.com" },
                { icon: Linkedin, label: "LinkedIn", url: "https://linkedin.com" },
                { icon: Github, label: "GitHub", url: "https://github.com" },
                { icon: Instagram, label: "Instagram", url: "https://instagram.com" }
              ].map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                  className="p-2.5 rounded-full bg-surface-2 border border-base text-secondary hover:text-gold hover:border-gold/50 transition-all duration-200 shadow-sm"
                >
                  <social.icon className="h-4.5 w-4.5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Navigation Column 1 (Product/Core) */}
          <div className="lg:col-span-2 flex flex-col space-y-3">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-primary border-b border-soft pb-2">
              Features
            </h3>
            <ul className="space-y-2 text-sm text-secondary">
              <li>
                <a
                  href="#features"
                  onClick={handleFeaturesClick}
                  className="hover:text-gold transition-colors duration-150 cursor-pointer"
                >
                  Key Features
                </a>
              </li>
              <li>
                <Link to="/all-events" className="hover:text-gold transition-colors duration-150">
                  Explore Events
                </Link>
              </li>
              <li>
                <Link to="/clubs" className="hover:text-gold transition-colors duration-150">
                  Campus Clubs
                </Link>
              </li>
              <li>
                <Link to="/new-events-hosted" className="hover:text-gold transition-colors duration-150">
                  Host an Event
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column 2 (Community/Resources) */}
          <div className="lg:col-span-2 flex flex-col space-y-3">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-primary border-b border-soft pb-2">
              Resources
            </h3>
            <ul className="space-y-2 text-sm text-secondary">
              <li>
                <button
                  onClick={() => triggerToast("Help Center")}
                  className="hover:text-gold transition-colors duration-150 text-left w-full cursor-pointer"
                >
                  Help Center
                </button>
              </li>
              <li>
                <button
                  onClick={() => triggerToast("Forums")}
                  className="hover:text-gold transition-colors duration-150 text-left w-full cursor-pointer"
                >
                  Student Forums
                </button>
              </li>
              <li>
                <button
                  onClick={() => triggerToast("Guidelines")}
                  className="hover:text-gold transition-colors duration-150 text-left w-full cursor-pointer"
                >
                  Guidelines
                </button>
              </li>
              <li>
                <button
                  onClick={() => triggerToast("API Status")}
                  className="hover:text-gold transition-colors duration-150 text-left w-full cursor-pointer"
                >
                  Developer API
                </button>
              </li>
            </ul>
          </div>

          {/* Navigation Column 3 (Company) */}
          <div className="lg:col-span-2 flex flex-col space-y-3">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-primary border-b border-soft pb-2">
              Company
            </h3>
            <ul className="space-y-2 text-sm text-secondary">
              <li>
                <button
                  onClick={() => triggerToast("About Us")}
                  className="hover:text-gold transition-colors duration-150 text-left w-full cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => triggerToast("Careers")}
                  className="hover:text-gold transition-colors duration-150 text-left w-full cursor-pointer"
                >
                  Careers
                </button>
              </li>
              <li>
                <button
                  onClick={() => triggerToast("Partners")}
                  className="hover:text-gold transition-colors duration-150 text-left w-full cursor-pointer"
                >
                  Partners
                </button>
              </li>
              <li>
                <button
                  onClick={() => triggerToast("Contact")}
                  className="hover:text-gold transition-colors duration-150 text-left w-full cursor-pointer"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-2 flex flex-col space-y-3 min-w-[200px]">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-primary border-b border-soft pb-2">
              Stay Updated
            </h3>
            <p className="text-xs text-secondary leading-relaxed">
              Subscribe to get notified about the latest campus matches, hackathons, and activities.
            </p>
            <div className="pt-1">
              <AnimatePresence mode="wait">
                {subscribed ? (
                  <motion.div
                    key="subscribed-state"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="flex flex-col items-center justify-center p-3 border border-success/20 bg-success/5 rounded-lg text-center"
                  >
                    <Check className="h-6 w-6 text-success mb-1" />
                    <span className="font-heading text-xs font-semibold text-primary">Subscribed!</span>
                  </motion.div>
                ) : (
                  <motion.form
                    key="subscribe-form"
                    onSubmit={handleSubscribe}
                    className="flex flex-col gap-2"
                  >
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="your.email@edu.in"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) setEmailError("");
                        }}
                        className={`w-full text-xs px-3 py-2 border rounded-md bg-surface-2 text-primary placeholder:text-muted focus:outline-none focus:border-gold transition-colors ${
                          emailError ? "border-error" : "border-base"
                        }`}
                      />
                      <Mail className="absolute right-3 top-2.5 h-3.5 w-3.5 text-muted pointer-events-none" />
                    </div>
                    {emailError && (
                      <p className="text-[10px] text-error leading-tight mt-0.5">{emailError}</p>
                    )}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn-gold text-xs py-2 font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "Subscribe"
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Bottom Bar separator */}
        <div className="h-[1px] w-full bg-border opacity-50 my-6" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted text-center md:text-left">
            &copy; {new Date().getFullYear()} Campus Sphere. All rights reserved.
          </p>

          <div className="flex items-center space-x-6 text-xs text-muted">
            <button
              onClick={() => triggerToast("Privacy Policy")}
              className="hover:text-gold transition-colors duration-150 cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => triggerToast("Terms of Service")}
              className="hover:text-gold transition-colors duration-150 cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              onClick={handleBackToTop}
              className="group flex items-center gap-1 hover:text-gold transition-colors duration-150 cursor-pointer"
              aria-label="Back to top"
            >
              Back to Top
              <motion.span
                className="inline-block"
                animate={{ y: [0, -2, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 1 }}
              >
                <ArrowUp className="h-3.5 w-3.5 text-muted group-hover:text-gold transition-colors" />
              </motion.span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
