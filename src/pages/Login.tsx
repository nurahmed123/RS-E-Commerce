import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
      return
    }

    const code = searchParams.get('code')
    if (code) {
      handleGitHubCallback(code)
    }
  }, [isAuthenticated, searchParams])

  const handleGitHubCallback = async (code: string) => {
    try {
      await login(code)
      navigate('/')
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const handleGitHubLogin = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID
    const redirectUri = `${window.location.origin}/login`
    const scope = 'user:email'
    
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`
    
    window.location.href = githubAuthUrl
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-accent-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">R</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome to RoboTech
          </h2>
          <p className="text-primary-300">
            Sign in with your GitHub account to access the platform
          </p>
        </div>

        <div className="bg-primary-800 rounded-lg shadow-xl p-8 border border-primary-700">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-white mb-4">
                Admin Access Required
              </h3>
              <p className="text-sm text-primary-300 mb-6">
                Only authorized GitHub accounts can access the admin panel. 
                Regular users can browse products without logging in.
              </p>
            </div>

            <button
              onClick={handleGitHubLogin}
              className="w-full flex items-center justify-center px-4 py-3 border border-primary-600 rounded-lg shadow-sm bg-primary-700 text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Continue with GitHub
            </button>

            <div className="text-center">
              <p className="text-xs text-primary-400">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-primary-300">
            Don't have admin access?{' '}
            <button
              onClick={() => navigate('/')}
              className="text-accent-500 hover:text-accent-400 font-medium"
            >
              Browse as guest
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Login