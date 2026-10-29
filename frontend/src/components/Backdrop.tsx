import React from 'react'

export const Backdrop: React.FC = () => {
  return (
    <div className="chai-backdrop h-[600px] overflow-hidden pointer-events-none select-none" aria-hidden="true">
      <svg
        viewBox="0 0 1440 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full opacity-40 dark:opacity-30"
      >
        <defs>
          <radialGradient id="chaiGlow" cx="50%" cy="0%" r="70%" fx="50%" fy="0%">
            <stop offset="0%" stopColor="#d97706" stopOpacity="0.25" />
            <stop offset="45%" stopColor="#92400e" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0" />
          </radialGradient>
          <pattern id="chaiHex" width="56" height="97" patternUnits="userSpaceOnUse" patternTransform="scale(1)">
            <path
              d="M28 0L56 16.17V48.5L28 64.67L0 48.5V16.17L28 0Z M28 64.67L56 80.84V113.17L28 129.34L0 113.17V80.84L28 64.67Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-amber-500/10 dark:text-orange-200/5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#chaiHex)" />
        <rect width="100%" height="100%" fill="url(#chaiGlow)" />
      </svg>
    </div>
  )
}
