'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import { GOLD, GOLD_SOFT, GOLD_DEEP } from '@/lib/constants';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError('E-mail ou senha inválidos.');
      return;
    }
    router.push('/');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-[360px]">
        {/* Logo/monogram */}
        <div className="flex justify-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${GOLD_SOFT} 0%, ${GOLD_DEEP} 100%)` }}
          >
            <span className="text-black font-bold text-[28px]">R</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-semibold">
            Ribeiro Mineração
          </div>
          <h1 className="mt-1 text-[24px] font-semibold tracking-tight">Entrar</h1>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-3">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            className="w-full bg-white/[0.06] rounded-xl px-4 py-3.5 text-[16px] text-white outline-none placeholder:text-white/30 focus:bg-white/[0.09]"
          />
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            className="w-full bg-white/[0.06] rounded-xl px-4 py-3.5 text-[16px] text-white outline-none placeholder:text-white/30 focus:bg-white/[0.09]"
          />

          {error && (
            <div className="text-[13px] text-[#ff453a] text-center pt-1">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="mt-2 w-full py-3.5 rounded-xl text-[16px] font-semibold text-black transition disabled:opacity-40 active:scale-[0.98] flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${GOLD_SOFT} 0%, ${GOLD_DEEP} 100%)` }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
