import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BrainCircuit, Mail, Phone, Clock, Send, ChevronUp, MessageCircle, 
  ShieldCheck, Brain, Headset 
} from 'lucide-react';

const GithubIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>;
const LinkedinIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>;
const TwitterIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>;
const InstagramIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>;
import toast from 'react-hot-toast';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Successfully subscribed to learning tips!');
    setEmail('');
  };

  return (
    <footer className="relative border-t border-slate-200 bg-white pt-20 pb-10 dark:border-slate-800 dark:bg-slate-950 overflow-hidden">
      {/* Decorative gradient background */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 h-80 w-80 rounded-full bg-primary-600/5 blur-[100px] dark:bg-primary-500/10 pointer-events-none"></div>
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Newsletter Section */}
        <div className="mb-16 flex flex-col items-center justify-between gap-8 rounded-3xl glass-panel p-8 md:flex-row md:p-10 lg:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-purple-500/5"></div>
          <div className="max-w-xl relative z-10">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Get AI Learning Tips</h3>
            <p className="text-slate-500 dark:text-slate-400">Subscribe to our newsletter to receive the latest updates on AI, learning strategies, and platform news.</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700/50 dark:bg-slate-900/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-primary-400 backdrop-blur-sm"
            />
            <button
              type="submit"
              className="group flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-primary-500/20 transition-all hover:scale-105 hover:shadow-primary-500/40 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
            >
              Subscribe <Send size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5 xl:gap-16">
          
          {/* Brand & Social Media Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 group mb-6 w-max">
              <div className="rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 p-1.5 shadow-md dark:from-primary-400 dark:to-primary-600 transition-transform group-hover:scale-105">
                <BrainCircuit className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Nexus<span className="text-primary-600 dark:text-primary-400">AI</span>
              </span>
            </Link>
            <p className="mb-8 max-w-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              AI-powered learning platform helping students master skills through personalized learning and assessments.
            </p>
            <div className="flex gap-4">
              {[
                { icon: LinkedinIcon, label: 'LinkedIn' },
                { icon: GithubIcon, label: 'GitHub' },
                { icon: TwitterIcon, label: 'Twitter' },
                { icon: InstagramIcon, label: 'Instagram' }
              ].map((social, idx) => (
                <a 
                  key={idx}
                  href="#" 
                  aria-label={social.label}
                  className="rounded-full bg-slate-100 p-2.5 text-slate-500 transition-all hover:-translate-y-1 hover:bg-primary-50 hover:text-primary-600 hover:shadow-md dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-primary-900/30 dark:hover:text-primary-400" 
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Section */}
          <div>
            <h3 className="mb-6 font-semibold text-slate-900 dark:text-white">Quick Links</h3>
            <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
              {['Home', 'Courses', 'Assessments', 'Dashboard', 'Pricing', 'FAQ'].map((link) => (
                <li key={link}>
                  <Link to={`/${link.toLowerCase()}`} className="group flex items-center transition-colors hover:text-primary-600 dark:hover:text-primary-400">
                    <span className="h-px w-0 bg-primary-600 transition-all group-hover:w-4 group-hover:mr-2 dark:bg-primary-400"></span>
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="mb-6 font-semibold text-slate-900 dark:text-white">Legal</h3>
            <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
              {['Privacy Policy', 'Terms of Service', 'Refund Policy', 'Cookie Policy'].map((link) => (
                <li key={link}>
                  <Link to={`/${link.toLowerCase().replace(/ /g, '-')}`} className="group flex items-center transition-colors hover:text-primary-600 dark:hover:text-primary-400">
                    <span className="h-px w-0 bg-primary-600 transition-all group-hover:w-4 group-hover:mr-2 dark:bg-primary-400"></span>
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Support Section */}
          <div>
            <h3 className="mb-6 font-semibold text-slate-900 dark:text-white">Contact & Support</h3>
            <ul className="space-y-5 text-sm text-slate-500 dark:text-slate-400">
              <li className="flex items-start gap-3 group">
                <div className="rounded-lg bg-primary-50 p-2 text-primary-600 transition-colors group-hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400 dark:group-hover:bg-primary-900/50">
                  <Mail size={18} />
                </div>
                <div className="flex flex-col space-y-1 pt-1">
                  <a href="mailto:support@nexusai.com" className="transition-colors hover:text-primary-600 dark:hover:text-primary-400">support@nexusai.com</a>
                  <a href="mailto:contact@nexusai.com" className="transition-colors hover:text-primary-600 dark:hover:text-primary-400">contact@nexusai.com</a>
                </div>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="rounded-lg bg-primary-50 p-2 text-primary-600 transition-colors group-hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400 dark:group-hover:bg-primary-900/50">
                  <Phone size={18} />
                </div>
                <span className="pt-1">+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="rounded-lg bg-primary-50 p-2 text-primary-600 transition-colors group-hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400 dark:group-hover:bg-primary-900/50">
                  <Clock size={18} />
                </div>
                <span className="pt-1 leading-relaxed">Monday–Friday<br/>9:00 AM – 6:00 PM IST</span>
              </li>
            </ul>
          </div>
          
        </div>
        
        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 md:gap-12 py-8 border-t border-slate-200 dark:border-slate-800">
          {[
            { icon: ShieldCheck, label: 'Secure Payments' },
            { icon: Brain, label: 'AI Powered' },
            { icon: Headset, label: '24/7 Support' }
          ].map((badge, idx) => (
            <div key={idx} className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <badge.icon size={20} className="text-slate-400 dark:text-slate-500" />
              <span className="text-sm font-medium uppercase tracking-wider">{badge.label}</span>
            </div>
          ))}
        </div>

        {/* Bottom copyright bar */}
        <div className="flex flex-col items-center justify-between border-t border-slate-200 pt-8 dark:border-slate-800 md:flex-row">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            &copy; 2026 NexusAI Learning Platform. All rights reserved.
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 md:mt-0">
            <span>Designed for the Future</span>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {/* Scroll to Top */}
        <button
          onClick={scrollToTop}
          className={`flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-slate-800 hover:shadow-xl focus:outline-none dark:bg-slate-700 dark:hover:bg-slate-600 ${
            showBackToTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-10 opacity-0'
          }`}
          aria-label="Back to top"
        >
          <ChevronUp size={24} />
        </button>

        {/* Live Chat */}
        <button
          onClick={() => toast.success('Connecting to AI Tutor...')}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg shadow-primary-500/30 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-primary-500/50 focus:outline-none"
          aria-label="Live Chat"
        >
          <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <MessageCircle size={28} className="relative z-10 transition-transform group-hover:scale-110" />
          <span className="absolute right-0 top-0 flex h-3 w-3 z-20">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500 border-2 border-white dark:border-slate-900"></span>
          </span>
        </button>
      </div>
    </footer>
  );
};

export default Footer;
