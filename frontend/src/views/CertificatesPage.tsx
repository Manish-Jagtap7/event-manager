import React, { useState } from 'react'
import { Award, CheckCircle2, Download, Printer, ShieldCheck, ExternalLink, Calendar, Copy, Check } from 'lucide-react'
import { CertificateItem } from '../types'
import { ChaiButton } from '../components/ChaiButton'
import { Highlight } from '../components/Highlight'

export interface CertificatesPageProps {
  certificates: CertificateItem[]
  onNavigate: (view: string) => void
}

export const CertificatesPage: React.FC<CertificatesPageProps> = ({
  certificates,
  onNavigate,
}) => {
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(
    certificates[0] || null
  )
  const [copiedCode, setCopiedCode] = useState(false)

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium text-foreground">
            Verified digital credentials
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 font-sans">
            Official post-event certificates unlocked after <Highlight>successful venue attendance verification</Highlight>.
          </p>
        </div>

        <ChaiButton
          variant="solid"
          size="sm"
          onClick={() => onNavigate('events')}
        >
          Explore more events
        </ChaiButton>
      </div>

      {certificates.length === 0 ? (
        <div className="card-chai p-12 text-center space-y-3">
          <Award className="size-10 mx-auto text-muted-foreground" />
          <p className="font-montserrat text-base font-semibold text-foreground">
            No e-certificates issued yet
          </p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Certificates are automatically generated and made available here once an event organizer marks your live attendance at the venue.
          </p>
          <ChaiButton
            variant="outline"
            size="sm"
            iconRight={null}
            onClick={() => onNavigate('my-registrations')}
          >
            Check registration status
          </ChaiButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Certificate Selection Roster */}
          <div className="space-y-3">
            <h3 className="font-montserrat text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Earned credentials ({certificates.length})
            </h3>

            <div className="space-y-2">
              {certificates.map((cert) => {
                const isSelected = selectedCert?.id === cert.id
                return (
                  <button
                    key={cert.id}
                    onClick={() => setSelectedCert(cert)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-orange-500/40 bg-neutral-100/60 dark:bg-neutral-900/60'
                        : 'border-border bg-card hover:bg-neutral-100/30 dark:hover:bg-neutral-900/30'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mb-1">
                      <span className="uppercase">{cert.category}</span>
                      <span>{cert.issueDate}</span>
                    </div>
                    <h4 className="font-montserrat text-sm font-semibold text-foreground line-clamp-1">
                      {cert.eventTitle}
                    </h4>
                    <p className="mt-1 text-xs text-muted-foreground font-mono">
                      Ref: {cert.certificateNumber}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Interactive Certificate Preview Frame */}
          {selectedCert && (
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">
                  Previewing: <strong className="text-foreground">{selectedCert.certificateNumber}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <ChaiButton
                    variant="outline"
                    size="sm"
                    iconRight={<Printer className="size-3.5" />}
                    onClick={() => window.print()}
                  >
                    Print certificate
                  </ChaiButton>
                </div>
              </div>

              {/* Authentic Certificate Canvas Card */}
              <div
                id="printable-certificate"
                className="relative rounded-2xl border-2 border-amber-900/20 dark:border-orange-200/20 bg-neutral-50 dark:bg-[#0c0c0c] p-8 sm:p-12 text-foreground space-y-8 overflow-hidden shadow-none"
              >
                {/* Decorative Certificate Corner Borders */}
                <div className="absolute top-3 left-3 size-6 border-t-2 border-l-2 border-amber-700/40 dark:border-orange-400/30 pointer-events-none" />
                <div className="absolute top-3 right-3 size-6 border-t-2 border-r-2 border-amber-700/40 dark:border-orange-400/30 pointer-events-none" />
                <div className="absolute bottom-3 left-3 size-6 border-b-2 border-l-2 border-amber-700/40 dark:border-orange-400/30 pointer-events-none" />
                <div className="absolute bottom-3 right-3 size-6 border-b-2 border-r-2 border-amber-700/40 dark:border-orange-400/30 pointer-events-none" />

                {/* College Seal & Header */}
                <div className="text-center space-y-2 border-b border-border pb-6">
                  <div className="inline-flex items-center justify-center size-12 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-orange-300 mx-auto">
                    <Award className="size-6" />
                  </div>
                  <h2 className="font-brand text-sm tracking-widest uppercase text-muted-foreground">
                    College Technical Council & Event Management Board
                  </h2>
                  <h3 className="font-montserrat text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-foreground">
                    Certificate of Participation
                  </h3>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    Credential Serial ID: {selectedCert.certificateNumber}
                  </p>
                </div>

                {/* Body Text */}
                <div className="text-center space-y-4 max-w-xl mx-auto font-sans">
                  <p className="text-xs uppercase font-mono tracking-wider text-muted-foreground">
                    This is proudly presented to
                  </p>
                  <p className="font-montserrat text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {selectedCert.studentName}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    Roll No: <span className="font-bold text-foreground">{selectedCert.rollNumber}</span> · Department of {selectedCert.department}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed pt-2">
                    in recognition of verified active participation and attendance in the collegiate competition
                  </p>
                  <p className="font-montserrat text-lg font-bold text-foreground">
                    "{selectedCert.eventTitle}"
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    Conducted on {selectedCert.issueDate}
                  </p>
                </div>

                {/* Signatures & Seal Footer */}
                <div className="pt-8 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-6 items-end text-center">
                  <div className="space-y-1">
                    <div className="font-brand italic text-xs text-foreground/80 border-b border-border pb-1">
                      {selectedCert.organizerName.split('(')[0]}
                    </div>
                    <p className="text-[10px] font-mono uppercase text-muted-foreground">
                      Faculty Event Coordinator
                    </p>
                  </div>

                  {/* Verification Hash Badge */}
                  <div className="space-y-1 flex flex-col items-center">
                    <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded border border-emerald-500/40 text-emerald-500">
                      Digitally Verified
                    </span>
                    <button
                      onClick={() => handleCopyCode(selectedCert.verificationCode)}
                      className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground hover:text-foreground"
                    >
                      {selectedCert.verificationCode}
                      {copiedCode ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="font-brand italic text-xs text-foreground/80 border-b border-border pb-1">
                      {selectedCert.authorizedSignatory.split('(')[0]}
                    </div>
                    <p className="text-[10px] font-mono uppercase text-muted-foreground">
                      Dean of Student Affairs
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
