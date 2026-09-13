'use client';

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
      className="rounded-2xl overflow-hidden active:opacity-80 transition"
      style={{ width: size, height: size }}
      aria-label={onClick ? 'Menu' : undefined}
    >
      <img
        src="/icon-512.png"
        alt="Ribeiro Mineração"
        width={size}
        height={size}
        className="block w-full h-full object-cover"
      />
    </Cmp>
  );
}
