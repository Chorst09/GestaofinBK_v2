
"use client";

import * as React from 'react';
import Image from 'next/image';
import { Landmark, Car } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- SVG LOGOS ---

// Bank Logos
const BradescoSimplifiedLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
    <rect x="2" y="4" width="20" height="16" rx="2" fill="#660000" />
    <g stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 17V7" />
      <path d="M15 17V7" />
      <path d="M7 7C7 5.00004 9.5 4 12 4C14.5 4 17 5.00004 17 7" />
    </g>
  </svg>
);

const ItauLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" strokeWidth="2" />
        <path d="M12 17V11" strokeWidth="2.5" />
        <path d="M12 8.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor" stroke="none" />
    </svg>
);

const NubankLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M18 10c-3 0-4.4.7-6 2.5S8.2 16.2 6 16.5" />
        <path d="M6 14.5c3.2-.2 4.4-.7 6-2.5s3.8-4 6-4" />
    </svg>
);

const BancoDoBrasilLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M6 12h12" />
        <path d="M6 7h9a4 4 0 0 1 0 8H6" />
        <path d="M6 17h11a4 4 0 0 0 0-8H6" />
    </svg>
);

const CaixaLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M2 10l10-7 10 7v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" />
        <path d="m9 9 6 6" />
        <path d="m15 9-6 6" />
    </svg>
);

const SantanderLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
        <rect x="3" y="4" width="18" height="16" rx="2" fill="#EC0000" />
        <g stroke="white" strokeWidth="1.5">
            <path d="M7 14.5c2.5-1 5-1 7.5 0" />
            <path d="M7 10.5c2.5-1 5-1 7.5 0" />
            <path d="M7 6.5c2.5-1 5-1 7.5 0" />
        </g>
    </svg>
);

const BancoInterLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
        <circle cx="12" cy="12" r="10" fill="#FF7A00" />
        <path d="M10 8l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const C6BankLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10" />
        <path d="M14 8h-1a3 3 0 00-3 3v2a3 3 0 003 3h1" />
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2" transform="rotate(180 12 12)"/>
    </svg>
);


// Vehicle Logos
const VolkswagenLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M7.5 13.5l3-7 3 7" />
        <path d="M6 7l6 10 6-10" />
    </svg>
);

const FiatLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h8" /><path d="M8 8h4" /><path d="M8 16h4" /><path d="M12 8v8" />
    </svg>
);

const FordLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
        <ellipse cx="12" cy="12" rx="10" ry="7" />
    </svg>
);

const ChevroletLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
        <path d="M4 12l8-4 8 4-8 4-8-4z" />
    </svg>
);

const HondaLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <path d="M6 7h12v10H6z" /><path d="M9 7v10" /><path d="M15 7v10" /><path d="M9 12h6" />
    </svg>
);

const ToyotaLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <ellipse cx="12" cy="12" rx="10" ry="7" />
      <ellipse cx="12" cy="12" rx="3.5" ry="7" transform="rotate(0 12 12)" />
      <ellipse cx="12" cy="12" rx="7" ry="3.5" />
    </svg>
);


const logoMap = {
  bradesco: BradescoSimplifiedLogo,
  itau: ItauLogo,
  nubank: NubankLogo,
  banco_do_brasil: BancoDoBrasilLogo,
  caixa: CaixaLogo,
  santander: SantanderLogo,
  inter: BancoInterLogo,
  c6: C6BankLogo,
  // Vehicle logos
  volkswagen: VolkswagenLogo,
  fiat: FiatLogo,
  ford: FordLogo,
  chevrolet: ChevroletLogo,
  honda: HondaLogo,
  toyota: ToyotaLogo,
};

const bankKeys = ['bradesco', 'itau', 'nubank', 'banco_do_brasil', 'caixa', 'santander', 'inter', 'c6'];
const vehicleKeys = ['volkswagen', 'fiat', 'ford', 'chevrolet', 'honda', 'toyota'];

export const bankLogoOptions = bankKeys.map(key => ({
    value: key,
    label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
}));

export const vehicleLogoOptions = vehicleKeys.map(key => ({
    value: key,
    label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
}));


interface BankLogoProps extends React.SVGProps<SVGSVGElement> {
  logoKey?: string | undefined;
  photoUrl?: string;
  type?: 'bank' | 'vehicle';
  className?: string;
}

export function BankLogo({ logoKey, photoUrl, type = 'bank', className, ...props }: BankLogoProps) {
  // Special handling for banks with custom colors
  const hasCustomColor = logoKey === 'bradesco' || logoKey === 'santander' || logoKey === 'inter';
  const baseClassName = hasCustomColor ? "h-6 w-6" : "h-6 w-6 text-muted-foreground";
  const commonProps = { className: cn(baseClassName, className), ...props };

  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt="Custom Logo"
        width={24}
        height={24}
        className={cn("rounded-sm object-cover", commonProps.className)}
      />
    );
  }

  if (logoKey && logoKey in logoMap) {
    const LogoComponent = logoMap[logoKey as keyof typeof logoMap];
    return <LogoComponent {...commonProps} />;
  }

  // Fallback Icon
  if (type === 'vehicle') {
    return <Car {...commonProps} />;
  }
  return <Landmark {...commonProps} />;
}
