import { auth } from "@/auth"
import { SignInButton } from "@/components/SignInButton"
import { Dashboard } from "@/components/Dashboard"

export default async function Home() {
  const session = await auth()

  if (session?.user) {
    return <Dashboard user={session.user} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Calvin
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Your intelligent calendar agent
          </p>
        </div>
        
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Connect your Google Calendar to start managing your schedule with AI
          </p>
        </div>

        <SignInButton />
        
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-6">
          We&apos;ll access your calendar and email to help you schedule meetings and manage your time
        </p>
      </div>
    </div>
  );
}
