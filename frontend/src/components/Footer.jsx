import { Link } from 'react-router-dom';
import { Mail, MapPin, ExternalLink } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="bg-primary text-white"
      data-testid="footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg p-2 inline-flex items-center justify-center">
  <img 
    src="/CSGSA_Logo.png" 
    alt="Rice CS GSA Logo" 
    className="w-12 h-12 object-contain" 
    onError={(e) => { 
      console.error("Footer logo failed to load");
      e.target.src = 'https://ui-avatars.com/api/?name=GSA&background=00205B&color=fff';
    }} 
  />
</div>
              <div>
                <h3 className="font-semibold">Rice CS GSA</h3>
                <p className="text-sm text-white/70">Graduate Student Association</p>
              </div>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              Building community, representing student voices, and enhancing graduate 
              life in Computer Science at Rice University.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white/90">Quick Links</h4>
            <nav className="flex flex-col space-y-2">
              <Link 
                to="/" 
                className="text-sm text-white/70 hover:text-white transition-colors"
                data-testid="footer-link-home"
              >
                Home
              </Link>
              <Link 
                to="/events" 
                className="text-sm text-white/70 hover:text-white transition-colors"
                data-testid="footer-link-events"
              >
                Events & Calendar
              </Link>
              <Link 
                to="/leadership" 
                className="text-sm text-white/70 hover:text-white transition-colors"
                data-testid="footer-link-leadership"
              >
                People
              </Link>
              <a 
                href="https://cs.rice.edu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-white/70 hover:text-white transition-colors inline-flex items-center gap-1"
              >
                CS Department
                <ExternalLink className="w-3 h-3" />
              </a>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white/90">Contact Us</h4>
            <div className="space-y-3">
              <a 
                href="mailto:csgsa@rice.edu" 
                className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                data-testid="footer-email"
              >
                <Mail className="w-4 h-4" />
                csgsa@rice.edu
              </a>
              <div className="flex items-start gap-2 text-sm text-white/70">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Department of Computer Science<br />
                  Rice University<br />
                  6100 Main Street, MS-132<br />
                  Houston, TX 77005
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/60 text-center md:text-left">
              © {currentYear} Rice University Computer Science Graduate Student Association. 
              All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://rice.edu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Rice University
              </a>
              <span className="text-white/30">|</span>
              <a 
                href="https://graduate.rice.edu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Graduate & Postdoctoral Studies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
