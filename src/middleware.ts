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

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect()
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
