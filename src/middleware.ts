import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/leads(.*)',
  '/appointments(.*)',
  '/transactions(.*)',
  '/calculator(.*)',
  '/coach(.*)',
  '/expenses(.*)',
  '/mileage(.*)',
  '/profile(.*)',
  '/settings(.*)',
])

const isPublicApiRoute = createRouteMatcher([
  '/api/coach(.*)',
  '/api/setup-notes(.*)',
])

export default clerkMiddleware((auth, req) => {
  if (isPublicApiRoute(req)) {
    return // Allow API routes without auth check (they're called from authenticated pages)
  }
  if (isProtectedRoute(req)) {
    auth().protect()
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
