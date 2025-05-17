import React from 'react';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function Logo({ width = 40, height = 40, className = '' }: LogoProps) {
  return (
    <img
      src="/images/gentivo-logo.svg"
      alt="Gentivo Logo"
      width={width}
      height={height}
      className={className}
    />
  );
} 