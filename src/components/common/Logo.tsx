import React from 'react';
import { Scissors } from 'lucide-react';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function Logo({ width = 40, height = 40, className = '' }: LogoProps) {
  return (
    <Scissors
      width={width}
      height={height}
      className={`text-primary ${className}`}
    />
  );
} 