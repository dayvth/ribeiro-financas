import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static
     * - _next/image
     * - favicon.ico, manifest, icons
     * - api routes (têm sua própria autenticação)
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest|apple-touch-icon.png|api/).*)',
  ],
};
