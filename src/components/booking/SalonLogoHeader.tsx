import React from 'react';

interface SalonLogoHeaderProps {
  logoUrl?: string;
  salonName: string;
  primaryColor?: string;
  primaryColorLight?: string;
}

export default function SalonLogoHeader({ 
  logoUrl, 
  salonName, 
  primaryColor = '#4f46e5',
  primaryColorLight = '#4f46e520'
}: SalonLogoHeaderProps) {
  return (
    <div className="flex items-center mb-4">
      <div 
        className="w-10 h-10 rounded-full mr-3 flex items-center justify-center" 
        style={{ backgroundColor: primaryColorLight }}
      >
        {logoUrl ? (
          <img 
            src={logoUrl} 
            alt={salonName} 
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <span style={{ color: primaryColor }} className="text-lg font-bold">
            {salonName.substring(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-900">{salonName}</h3>
      </div>
    </div>
  );
} 