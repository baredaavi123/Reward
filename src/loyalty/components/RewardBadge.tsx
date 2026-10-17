import React from 'react';
import { Star } from 'lucide-react';

interface RewardBadgeProps {
  points?: number;
  className?: string;
  showZero?: boolean;
}

export const RewardBadge: React.FC<RewardBadgeProps> = ({
  points = 0,
  className = '',
  showZero = false,
}) => {
  if (points <= 0 && !showZero) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-100 text-amber-800 border border-amber-300/80 shadow-xs ${className}`}
      title={`${points} Reward Points`}
    >
      <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
      <span>{points} Pts</span>
    </span>
  );
};
