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
     * - api routes (têm sua própria autenticação)
     * - static assets: favicon, manifest, .png/.svg/.ico
     */
    '/((?!_next/static|_next/image|api/|.*\\.(?:png|svg|ico|webmanifest|jpg|jpeg|gif|webp)$).*)',
  ],
};
