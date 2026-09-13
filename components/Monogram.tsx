'use client';

import { GOLD_SOFT, GOLD_DEEP } from '@/lib/constants';

export default function Monogram({
  onClick, size = 40,
}: {
  onClick?: () => void;
  size?: number;
}) {
  const Cmp = onClick ? 'button' : 'div';
  return (
    <Cmp
      onClick={onClick}
      className="rounded-full flex items-center justify-center active:opacity-80 transition"
      style={{
        width: size, height: size,
        background: `linear-gradient(135deg, ${GOLD_SOFT} 0%, ${GOLD_DEEP} 100%)`,
      }}
      aria-label={onClick ? 'Menu' : undefined}
    >
      <span
        className="text-black font-bold tracking-tight"
        style={{ fontSize: size * 0.4 }}
      >
        R
      </span>
    </Cmp>
  );
}
