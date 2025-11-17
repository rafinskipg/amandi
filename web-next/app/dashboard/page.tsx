'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Dashboard from '@/components/Dashboard'

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated (mock login)
    const authStatus = sessionStorage.getItem('dashboard_auth')
    if (authStatus === 'authenticated') {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (password: string) => {
    // Mock login - in production, this would be a real authentication
    if (password === 'admin' || password === 'amandi2024') {
      sessionStorage.setItem('dashboard_auth', 'authenticated')
      setIsAuthenticated(true)
    } else {
      alert('Invalid password')
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('dashboard_auth')
    setIsAuthenticated(false)
    router.push('/')
  }

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        Loading...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  return <Dashboard onLogout={handleLogout} />
}

function LoginForm({ onLogin }: { onLogin: (password: string) => void }) {
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin(password)
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f6a3c 0%, #1a8449 100%)',
      padding: '2rem'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '3rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{
          fontFamily: 'var(--amandi-font-display)',
          fontSize: '2rem',
          color: '#0f6a3c',
          marginBottom: '0.5rem',
          textAlign: 'center'
        }}>
          Avocados Amandi
        </h1>
        <p style={{
          color: '#666',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Dashboard Login
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: '600'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              placeholder="Enter password"
              autoFocus
            />
            <p style={{
              fontSize: '0.85rem',
              color: '#999',
              marginTop: '0.5rem'
            }}>
              Hint: Try "admin" or "amandi2024"
            </p>
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#0f6a3c',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#1a8449'}
            onMouseOut={(e) => e.currentTarget.style.background = '#0f6a3c'}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}

