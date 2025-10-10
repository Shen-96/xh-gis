import React from "react";

// Stop icon
export const StopIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" {...props}>
    <rect x="4" y="4" width="8" height="8" />
  </svg>
);

// Begin/Play icon
export const BeginIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" {...props}>
    <polygon points="4,4 4,12 12,8" />
  </svg>
);

// Pause icon
export const PauseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" {...props}>
    <rect x="4" y="4" width="2" height="8" />
    <rect x="10" y="4" width="2" height="8" />
  </svg>
);

// Decelerate icon
export const DecelerateIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" {...props}>
    <polygon points="8,4 8,12 4,8" />
    <rect x="10" y="4" width="2" height="8" />
  </svg>
);

// Incelerate/Fast forward icon
export const IncelerateIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" {...props}>
    <polygon points="4,4 4,12 8,8" />
    <rect x="10" y="4" width="2" height="8" />
  </svg>
);