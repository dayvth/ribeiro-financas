import {
  Fuel, Wrench, Users, Package, Utensils, Car, MoreHorizontal,
  type LucideIcon,
} from 'lucide-react';

export const GOLD = '#c9a55f';
export const GOLD_SOFT = '#d4b070';
export const GOLD_DEEP = '#a67d3b';
export const GREEN = '#34c47a';
export const RED = '#ff453a';

// Whitelist agora vive em public.allowed_users no Supabase; ver lib/allowlist.ts

export type Category = { id: string; name: string; icon: LucideIcon };

export const CATEGORIES: Category[] = [
  { id: 'diesel', name: 'Diesel', icon: Fuel },
  { id: 'manutencao', name: 'Manutenção', icon: Wrench },
  { id: 'funcionarios', name: 'Funcionários', icon: Users },
  { id: 'equipamentos', name: 'Equipamentos', icon: Package },
  { id: 'alimentacao', name: 'Alimentação', icon: Utensils },
  { id: 'transporte', name: 'Transporte', icon: Car },
  { id: 'outros', name: 'Outros', icon: MoreHorizontal },
];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

export function findCategory(id: string | null | undefined): Category | null {
  if (!id) return null;
  return CATEGORIES.find((c) => c.id === id) ?? null;
}
