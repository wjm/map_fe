export { auth as middleware } from '@/app/auth'

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|signup|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};