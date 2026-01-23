import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-3xl">🏠</span>
            <span className="text-2xl font-bold text-white">REPal</span>
          </div>
          <p className="text-gray-400">Welcome back! Sign in to continue.</p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-dark-card border border-dark-border shadow-xl',
            }
          }}
        />
      </div>
    </div>
  )
}
