"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type User = {
  id: string
  email: string
  name?: string
  walletAddress?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signin: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  signout: () => Promise<void>
  updateUserWallet: (address: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const storedUser = localStorage.getItem("fathia_user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Failed to restore session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  const signin = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll simulate a successful login
      const mockUser = {
        id: `user_${Math.random().toString(36).substring(2, 9)}`,
        email,
        name: email.split("@")[0],
      }

      localStorage.setItem("fathia_user", JSON.stringify(mockUser))
      setUser(mockUser)
    } catch (error) {
      console.error("Login failed:", error)
      throw new Error("Login failed. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll simulate a successful registration
      const mockUser = {
        id: `user_${Math.random().toString(36).substring(2, 9)}`,
        email,
        name,
      }

      localStorage.setItem("fathia_user", JSON.stringify(mockUser))
      setUser(mockUser)
    } catch (error) {
      console.error("Registration failed:", error)
      throw new Error("Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const signout = async () => {
    setIsLoading(true)
    try {
      localStorage.removeItem("fathia_user")
      setUser(null)
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserWallet = async (address: string) => {
    if (!user) return

    try {
      const updatedUser = {
        ...user,
        walletAddress: address,
      }

      localStorage.setItem("fathia_user", JSON.stringify(updatedUser))
      setUser(updatedUser)
    } catch (error) {
      console.error("Failed to update wallet:", error)
      throw new Error("Failed to update wallet address.")
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signin, signup, signout, updateUserWallet }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
