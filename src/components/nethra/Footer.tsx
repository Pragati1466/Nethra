import { Link } from "@tanstack/react-router";
import { Shield, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-panel/40 backdrop-blur">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-md bg-primary/15 border border-primary/40 grid place-items-center">
                <Shield className="size-4 text-primary" />
              </div>
              <div>
                <div className="font-semibold tracking-wide text-sm leading-none">NETHRA</div>
                <div className="text-[10px] text-muted-foreground font-mono mt-1">TRAFFIC OS · v1.0</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Predict, simulate, plan, deploy and monitor traffic operations end-to-end.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-4">Operations</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                  Command Center
                </Link>
              </li>
              <li>
                <Link to="/twin" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                  Digital Twin
                </Link>
              </li>
              <li>
                <Link to="/events/new" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                  Create Event
                </Link>
              </li>
              <li>
                <Link to="/strategist" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                  AI Strategist
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/learn" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                  Learn Loop
                </Link>
              </li>
              <li>
                <Link to="/replay" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                  Decision Replay
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                  Resource Optimization
                </Link>
              </li>
              <li>
                <Link to="/diversion" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                  Diversion Planner
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-4">Connect</h3>
            <div className="flex gap-3">
              <a
                href="#"
                className="size-8 rounded-md border border-border bg-card/40 flex items-center justify-center hover:border-primary/40 hover:bg-primary/10 transition-colors"
                aria-label="GitHub"
              >
                <Github className="size-4 text-foreground/80" />
              </a>
              <a
                href="#"
                className="size-8 rounded-md border border-border bg-card/40 flex items-center justify-center hover:border-primary/40 hover:bg-primary/10 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="size-4 text-foreground/80" />
              </a>
              <a
                href="#"
                className="size-8 rounded-md border border-border bg-card/40 flex items-center justify-center hover:border-primary/40 hover:bg-primary/10 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="size-4 text-foreground/80" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-[11px] text-muted-foreground font-mono">
            © {currentYear} NETHRA Traffic OS. All rights reserved. · Bengaluru Metropolitan Region
          </p>
        </div>
      </div>
    </footer>
  );
}
