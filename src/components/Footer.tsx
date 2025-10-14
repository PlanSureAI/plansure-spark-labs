import { Building2, Mail, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-primary" />
                <span className="text-xl font-bold">PlansureAI</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-powered investment intelligence for confident property development decisions.
              </p>
            </div>

            {/* Product Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="/#workflow" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="/#pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <Link to="/compliance" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Compliance Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms-of-service" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact & Social */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider">Connect</h3>
              <div className="space-y-3">
                <a 
                  href="mailto:support@plansureai.com" 
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  support@plansureai.com
                </a>
                <div className="flex gap-4 pt-2">
                  <a 
                    href="https://twitter.com/plansureai" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label="Twitter"
                    className="p-2 rounded-lg bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a 
                    href="https://linkedin.com/company/plansureai" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="p-2 rounded-lg bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © 2025 PlansureAI, Inc. All rights reserved.
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="px-2 py-1 rounded-md bg-accent/10 text-accent">
                  🔒 Secure & Private
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
