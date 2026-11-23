import React from 'react';
import { CheckCircle2, ShieldCheck, Clock, XCircle, AlertCircle } from 'lucide-react';

export const CategoryBadge = ({ category, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-hairline bg-pureWhite/90 backdrop-blur-sm text-textSecondary ${className}`}
    >
      {category}
    </span>
  );
};

export const StatusBadge = ({ status, className = '' }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'approved':
      case 'confirmed':
        return {
          bg: 'bg-lightSage/70 text-nearBlack border-mutedSage/30',
          icon: CheckCircle2,
          label: status === 'approved' ? 'Approved' : 'Confirmed',
        };
      case 'pending':
        return {
          bg: 'bg-warmSand/60 text-nearBlack border-hairline',
          icon: Clock,
          label: 'Pending Review',
        };
      case 'rejected':
      case 'cancelled':
        return {
          bg: 'bg-softRed/10 text-softRed border-softRed/20',
          icon: XCircle,
          label: status === 'rejected' ? 'Rejected' : 'Cancelled',
        };
      case 'rescheduled':
        return {
          bg: 'bg-mutedGold/15 text-nearBlack border-mutedGold/30',
          icon: AlertCircle,
          label: 'Rescheduled',
        };
      case 'info_required':
        return {
          bg: 'bg-mutedGold/15 text-nearBlack border-mutedGold/30',
          icon: AlertCircle,
          label: 'More Info Needed',
        };
      default:
        return {
          bg: 'bg-surfaceMuted text-nearBlack border-hairline',
          icon: Clock,
          label: status,
        };
    }
  };

  const { bg, icon: Icon, label } = getBadgeConfig();

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${bg} ${className}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{label}</span>
    </span>
  );
};

export const VerifiedBadge = ({ text = 'Verified Owner', className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-mutedSage bg-lightSage/50 px-2 py-0.5 rounded border border-mutedSage/20 ${className}`}
      title="Property owner identity & authorization verified by StayNear"
    >
      <ShieldCheck className="w-3 h-3" />
      <span>{text}</span>
    </span>
  );
};
