import React from 'react'
import { Calendar } from 'lucide-react'

export interface FooterProps {
  onNavigate: (view: string) => void
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="relative mt-24 px-6 font-montserrat sm:px-12 before:absolute before:top-0 before:left-1/2 before:h-px before:w-full before:max-w-[1440px] before:-translate-x-1/2 before:bg-amber-600 before:opacity-10 before:[mask-image:linear-gradient(90deg,transparent_0%,black_40%,black_60%,transparent_100%)] dark:before:bg-orange-300">
      <div className="mx-auto max-w-6xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 font-brand text-lg font-medium text-foreground">
              <span className="flex size-6 items-center justify-center rounded-md border border-orange-500/30 bg-orange-500/10 text-brand">
                <Calendar className="size-3.5 text-orange-500" />
              </span>
              <span>
                Event<span className="text-brand">Hub</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
              Centralized college event management system designed for seamless discovery, instant check-in verification, and automated digital credentials.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">Portals</h4>
            <ul className="space-y-2 text-xs font-sans">
              <li>
                <button
                  onClick={() => onNavigate('landing')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Campus event catalogue
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('student-dashboard')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Student management portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('organizer-dashboard')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Faculty organizer desk
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">Modules</h4>
            <ul className="space-y-2 text-xs font-sans">
              <li>
                <button
                  onClick={() => onNavigate('events')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Registration and ticketing
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('live-attendance')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Live venue check-in
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('certificates')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Digital e-certificates
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">Academic Project</h4>
            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
              Diploma Final Year Capstone Project.
              Built following modular architecture and paperless campus management goals.
            </p>
            <div className="mt-3 text-[11px] font-mono text-neutral-500">
              Department of Computer Engineering
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground font-sans gap-2">
          <p>© 2026 EventHub. College Event Management System.</p>
          <p className="text-[11px] font-mono">Front-end prototype ready for evaluation.</p>
        </div>
      </div>
    </footer>
  )
}
