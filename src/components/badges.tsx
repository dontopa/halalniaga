import { BadgeCheck, GraduationCap, ShieldCheck } from 'lucide-react';
import { TIER_META, type HalalStatus, type Tier } from '@/domain/types';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/cn';

export const TierBadge = ({
  tier,
  className,
  showLabel = true,
}: {
  tier: Tier;
  className?: string;
  showLabel?: boolean;
}) => {
  const meta = TIER_META[tier];
  const tone = tier === 'monitored' ? 'gold' : tier === 'verified' ? 'forest' : 'info';
  const Icon =
    tier === 'monitored'
      ? ShieldCheck
      : tier === 'verified'
        ? BadgeCheck
        : GraduationCap;
  return (
    <Badge tone={tone} className={cn('gap-1.5', className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {showLabel ? meta.short : null}
    </Badge>
  );
};

const statusMap: Record<
  HalalStatus,
  { label: string; tone: 'success' | 'forest' | 'warning' | 'danger' }
> = {
  certified: { label: 'Halal certified', tone: 'success' },
  verified: { label: 'Verified source', tone: 'forest' },
  pending: { label: 'Pending verification', tone: 'warning' },
  expired: { label: 'Certificate lapsed', tone: 'danger' },
};

export const StatusBadge = ({
  status,
  className,
}: {
  status: HalalStatus;
  className?: string;
}) => {
  const meta = statusMap[status];
  return (
    <Badge tone={meta.tone} dot className={className}>
      {meta.label}
    </Badge>
  );
};
