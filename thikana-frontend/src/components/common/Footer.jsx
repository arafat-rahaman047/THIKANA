import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand and Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-xl shadow-md shadow-emerald-500/20">
                T
              </span>
              <span className="font-display text-2xl font-bold tracking-tight text-white">
                THIKANA
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Bangladesh's smart real estate and rental management platform connecting tenants, owners, and agencies with verified listings.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-emerald-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-emerald-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-emerald-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Search Listings</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">User Login</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">Register Account</Link>
              </li>
            </ul>
          </div>

          {/* Guidelines / Resources */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">Help Center</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Safety Guidelines</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>Gulshan 1, Dhaka 1212, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>+880 1711-111111</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>support@thikana.com.bd</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} THIKANA. All rights reserved.</p>
          <p>Made with ❤️ in Bangladesh</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
