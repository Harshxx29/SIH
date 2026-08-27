import React from 'react';

export default function Logo({ className = "w-10 h-10 text-coop-600", showText = true, textClass = "text-2xl font-black text-slate-900 tracking-tight" }) {
  return (
    <div className="flex items-center gap-3">
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <rect width="100" height="100" rx="24" className="fill-current" />
        <path d="M70 40.5C70 34.701 65.299 30 59.5 30H40.5C34.701 30 30 34.701 30 40.5V59.5C30 65.299 34.701 70 40.5 70H59.5C65.299 70 70 65.299 70 59.5" stroke="white" strokeWidth="8" strokeLinecap="round" />
        <path d="M50 45V55M45 50H55" stroke="white" strokeWidth="6" strokeLinecap="round" />
        <circle cx="70" cy="30" r="12" fill="#3b82f6" />
      </svg>
      {showText && (
        <span className={textClass}>
          Coop<span className="text-coop-600">Seva</span>
        </span>
      )}
    </div>
  );
}
