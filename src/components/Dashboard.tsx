import { signOut } from "@/auth"
import { User } from "next-auth"

interface DashboardProps {
  user: User
}

export function Dashboard({ user }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Calvin
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <p className="text-gray-900 dark:text-white">
                  Welcome, {user.name}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
              <form
                action={async () => {
                  "use server"
                  await signOut()
                }}
              >
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Authentication Successful!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Your Google Calendar is now connected.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Calendar features and chat interface coming soon...
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}