"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@/providers/wallet-provider"
import { useToast } from "@/hooks/use-toast"

interface MoodData {
  mood: string
  timestamp: number
}

interface GlobalMoodData {
  address: string
  mood: string
  timestamp: number
}

interface ContractInterface {
  currentMood: string | null
  isLoadingMood: boolean
  isSettingMood: boolean
  isUserVerified: boolean
  isCheckingVerification: boolean
  lastTransactionHash: string | null
  fetchCurrentMood: () => Promise<void>
  setMood: (mood: string) => Promise<void>
  getMoodHistory: () => Promise<MoodData[]>
  getAllLatestMoods: () => Promise<GlobalMoodData[]>
  checkUserVerification: (address: string) => Promise<void>
  resetTransactionHash: () => void
}

export function useContract(): ContractInterface {
  const [currentMood, setCurrentMood] = useState<string | null>(null)
  const [isLoadingMood, setIsLoadingMood] = useState(false)
  const [isSettingMood, setIsSettingMood] = useState(false)
  const [isUserVerified, setIsUserVerified] = useState(false)
  const [isCheckingVerification, setIsCheckingVerification] = useState(false)
  const [lastTransactionHash, setLastTransactionHash] = useState<string | null>(null)
  const { sendTransaction, chainId } = useWallet()
  const { toast } = useToast()

  const resetTransactionHash = useCallback(() => {
    setLastTransactionHash(null)
  }, [])

  // Check if user is verified with World ID
  const checkUserVerification = useCallback(async (userAddress: string) => {
    if (!userAddress) return

    setIsCheckingVerification(true)
    try {
      // Simulate verification check
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, we'll set this to true
      setIsUserVerified(true)
    } catch (error) {
      console.error("Error checking verification status:", error)
      setIsUserVerified(false)
    } finally {
      setIsCheckingVerification(false)
    }
  }, [])

  // Fetch current mood
  const fetchCurrentMood = useCallback(async () => {
    setIsLoadingMood(true)
    try {
      // Simulate fetching mood
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, we'll set a random mood
      const moods = ["Happy", "Sad", "Excited", "Relaxed", "Thoughtful"]
      const randomMood = moods[Math.floor(Math.random() * moods.length)]

      setCurrentMood(randomMood)
    } catch (error) {
      console.error("Error fetching mood:", error)
      setCurrentMood(null)
    } finally {
      setIsLoadingMood(false)
    }
  }, [])

  // Set mood
  const setMood = useCallback(
    async (mood: string) => {
      setIsSettingMood(true)
      try {
        // In a real implementation, we would encode the contract call
        // For this demo, we'll simulate a transaction

        // Check if we're on a Base network
        const isBaseNetwork = chainId === 8453 || chainId === 84531 || chainId === 84532

        if (!isBaseNetwork) {
          toast({
            title: "Wrong Network",
            description: "Please connect to a Base network to set your mood.",
            variant: "destructive",
          })
          return
        }

        // Mock contract address - in a real app, this would be your deployed contract
        const contractAddress = "0x1234567890123456789012345678901234567890"

        // Mock transaction data - in a real app, this would be the encoded function call
        // For example: contract.methods.setMood(mood).encodeABI()
        const data = "0x" // Placeholder

        // Send transaction with 0 ETH value
        const txHash = await sendTransaction(contractAddress, "0x0", data)

        if (txHash) {
          setLastTransactionHash(txHash)
          // Update the current mood immediately for better UX
          setCurrentMood(mood)

          toast({
            title: "Mood Set",
            description: `Your mood has been set to ${mood}. Transaction: ${txHash.slice(0, 6)}...${txHash.slice(-4)}`,
          })
        }
      } catch (error) {
        console.error("Error setting mood:", error)
        toast({
          title: "Failed to Set Mood",
          description: "There was an error setting your mood. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsSettingMood(false)
      }
    },
    [chainId, sendTransaction, toast],
  )

  // Get mood history
  const getMoodHistory = useCallback(async (): Promise<MoodData[]> => {
    try {
      // Simulate fetching history
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Return mock data
      return [
        { mood: "Happy", timestamp: Date.now() - 86400000 * 2 },
        { mood: "Excited", timestamp: Date.now() - 86400000 * 4 },
        { mood: "Thoughtful", timestamp: Date.now() - 86400000 * 7 },
      ]
    } catch (error) {
      console.error("Error fetching mood history:", error)
      return []
    }
  }, [])

  // Get all latest moods
  const getAllLatestMoods = useCallback(async (): Promise<GlobalMoodData[]> => {
    try {
      // Simulate fetching global moods
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Return mock data
      return [
        {
          address: "0x1234567890abcdef1234567890abcdef12345678",
          mood: "Happy",
          timestamp: Date.now() - 3600000,
        },
        {
          address: "0xabcdef1234567890abcdef1234567890abcdef12",
          mood: "Excited",
          timestamp: Date.now() - 7200000,
        },
        {
          address: "0x7890abcdef1234567890abcdef1234567890abcd",
          mood: "Relaxed",
          timestamp: Date.now() - 10800000,
        },
      ]
    } catch (error) {
      console.error("Error fetching global moods:", error)
      return []
    }
  }, [])

  return {
    currentMood,
    isLoadingMood,
    isSettingMood,
    isUserVerified,
    isCheckingVerification,
    lastTransactionHash,
    fetchCurrentMood,
    setMood,
    getMoodHistory,
    getAllLatestMoods,
    checkUserVerification,
    resetTransactionHash,
  }
}
