"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface WalletContextType {
  address: string | null
  isConnected: boolean
  isConnecting: boolean
  connectWallet: () => Promise<string | null>
  disconnectWallet: () => void
  chainId: number | null
  switchToBase: (testnet?: "goerli" | "sepolia") => Promise<boolean>
  sendTransaction: (to: string, value: string, data?: string) => Promise<string | null>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [chainId, setChainId] = useState<number | null>(null)
  const { toast } = useToast()

  // Base network configurations - Updated with Base Sepolia
  const BASE_MAINNET = {
    chainId: "0x2105", // 8453 in decimal
    chainName: "Base Mainnet",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.base.org"],
    blockExplorerUrls: ["https://basescan.org/"],
  }

  const BASE_GOERLI = {
    chainId: "0x14A33", // 84531 in decimal
    chainName: "Base Goerli Testnet",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://goerli.base.org"],
    blockExplorerUrls: ["https://goerli.basescan.org/"],
  }

  const BASE_SEPOLIA = {
    chainId: "0x14A34", // 84532 in decimal
    chainName: "Base Sepolia Testnet",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://sepolia.base.org"],
    blockExplorerUrls: ["https://sepolia.basescan.org/"],
  }

  // Fallback to Ethereum Mainnet if Base networks fail
  const ETH_MAINNET = {
    chainId: "0x1", // 1 in decimal
    chainName: "Ethereum Mainnet",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.infura.io/v3/"],
    blockExplorerUrls: ["https://etherscan.io/"],
  }

  useEffect(() => {
    // Check if wallet was previously connected
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          // Get accounts directly from window.ethereum
          const accounts = await window.ethereum.request({ method: "eth_accounts" })

          // Get chain ID directly from window.ethereum
          const chainIdHex = await window.ethereum.request({ method: "eth_chainId" })
          const networkChainId = Number.parseInt(chainIdHex, 16)

          setChainId(networkChainId)

          if (accounts.length > 0) {
            setAddress(accounts[0])
            setIsConnected(true)
            console.log("Wallet connected on load:", accounts[0])
            console.log("Current network chainId:", networkChainId)
          }
        } catch (error) {
          console.error("Failed to check wallet connection:", error)
        }
      }
    }

    checkConnection()

    // Listen for account changes
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)
          toast({
            title: "Wallet Changed",
            description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
          })
        } else {
          setAddress(null)
          setIsConnected(false)
          toast({
            title: "Wallet Disconnected",
            description: "Your wallet has been disconnected.",
            variant: "destructive",
          })
        }
      }

      const handleChainChanged = (chainIdHex: string) => {
        const newChainId = Number.parseInt(chainIdHex, 16)
        setChainId(newChainId)

        // Check if it's a Base network
        const isBaseNetwork = newChainId === 8453 || newChainId === 84531 || newChainId === 84532

        if (isBaseNetwork) {
          let networkName = "Base"
          if (newChainId === 84531) networkName = "Base Goerli"
          if (newChainId === 84532) networkName = "Base Sepolia"

          toast({
            title: "Network Changed",
            description: `Connected to ${networkName}`,
          })
        } else {
          toast({
            title: "Network Changed",
            description: `Connected to network with ID: ${newChainId}`,
          })
        }
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [toast])

  const switchToBase = async (testnet?: "goerli" | "sepolia"): Promise<boolean> => {
    if (typeof window === "undefined" || !window.ethereum) return false

    // Determine which network to use based on the testnet parameter
    let targetNetwork = BASE_MAINNET
    let networkName = "Base Mainnet"

    if (testnet === "goerli") {
      targetNetwork = BASE_GOERLI
      networkName = "Base Goerli Testnet"
    } else if (testnet === "sepolia") {
      targetNetwork = BASE_SEPOLIA
      networkName = "Base Sepolia Testnet"
    }

    try {
      console.log(`Attempting to switch to ${networkName}...`)
      // Try to switch to the target network
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: targetNetwork.chainId }],
      })
      console.log(`Successfully switched to ${networkName}`)
      return true
    } catch (switchError: any) {
      console.log(`Error switching to ${networkName}:`, switchError)

      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          console.log(`${networkName} not found, attempting to add it...`)
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [targetNetwork],
          })
          console.log(`Successfully added ${networkName}`)
          return true
        } catch (addError: any) {
          console.error(`Failed to add ${networkName}:`, addError)

          // If the specified network fails, try other Base networks
          if (testnet === "sepolia") {
            try {
              console.log("Attempting to add Base Goerli Testnet as fallback...")
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [BASE_GOERLI],
              })
              console.log("Successfully added Base Goerli Testnet")
              toast({
                title: "Network Fallback",
                description: "Connected to Base Goerli instead of Base Sepolia.",
                variant: "warning",
              })
              return true
            } catch (fallbackError) {
              console.error("Failed to add Base Goerli:", fallbackError)
            }
          } else if (testnet === "goerli" || !testnet) {
            try {
              console.log("Attempting to add Base Sepolia Testnet as fallback...")
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [BASE_SEPOLIA],
              })
              console.log("Successfully added Base Sepolia Testnet")
              toast({
                title: "Network Fallback",
                description: "Connected to Base Sepolia instead.",
                variant: "warning",
              })
              return true
            } catch (fallbackError) {
              console.error("Failed to add Base Sepolia:", fallbackError)
            }
          }

          // If all Base networks fail, try to use Ethereum Mainnet
          try {
            console.log("Attempting to switch to Ethereum Mainnet as fallback...")
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: ETH_MAINNET.chainId }],
            })
            console.log("Successfully switched to Ethereum Mainnet")
            toast({
              title: "Network Fallback",
              description: "Connected to Ethereum Mainnet instead of Base. Some features may be limited.",
              variant: "warning",
            })
            return true
          } catch (ethError) {
            console.error("Failed to switch to any network:", ethError)
            return false
          }
        }
      }

      // If the error is not about the chain not being added, it could be user rejection
      if (switchError.code === 4001) {
        toast({
          title: "Network Switch Rejected",
          description: "You rejected the request to switch networks.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Network Switch Failed",
          description: `Could not switch to ${networkName}. Please try manually switching in your wallet.`,
          variant: "destructive",
        })
      }

      console.error(`Failed to switch to ${networkName}:`, switchError)
      return false
    }
  }

  const sendTransaction = async (to: string, value: string, data = "0x"): Promise<string | null> => {
    if (!address || !isConnected || typeof window === "undefined" || !window.ethereum) {
      toast({
        title: "Transaction Failed",
        description: "Wallet not connected. Please connect your wallet first.",
        variant: "destructive",
      })
      return null
    }

    try {
      // Check if we're on a Base network
      const isBaseNetwork = chainId === 8453 || chainId === 84531 || chainId === 84532

      if (!isBaseNetwork) {
        toast({
          title: "Wrong Network",
          description: "Please connect to a Base network before sending transactions.",
          variant: "destructive",
        })

        // Try to switch to Base Sepolia
        const switched = await switchToBase("sepolia")
        if (!switched) {
          return null
        }
      }

      // Prepare transaction parameters
      const transactionParameters = {
        to,
        from: address,
        value: value, // Value in wei
        data,
        gas: "0x55555", // Adjust gas as needed
      }

      console.log("Sending transaction with parameters:", transactionParameters)

      // Send the transaction
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      })

      console.log("Transaction sent successfully:", txHash)

      toast({
        title: "Transaction Sent",
        description: `Transaction hash: ${txHash.slice(0, 10)}...${txHash.slice(-4)}`,
      })

      return txHash
    } catch (error: any) {
      console.error("Transaction error:", error)

      let errorMessage = "Failed to send transaction. Please try again."

      if (error.code) {
        switch (error.code) {
          case 4001:
            errorMessage = "You rejected the transaction."
            break
          case -32603:
            errorMessage = "Internal error. Please check your wallet and try again."
            break
          default:
            errorMessage = `Error: ${error.message || error.code}`
        }
      }

      toast({
        title: "Transaction Failed",
        description: errorMessage,
        variant: "destructive",
      })

      return null
    }
  }

  const connectWallet = async () => {
    console.log("Attempting to connect wallet...")

    if (typeof window === "undefined") {
      console.error("Window object is not available")
      toast({
        title: "Connection Error",
        description: "Browser environment not detected.",
        variant: "destructive",
      })
      return null
    }

    if (!window.ethereum) {
      console.error("No Ethereum provider found. Is MetaMask installed?")
      toast({
        title: "Wallet Not Found",
        description: "Please install MetaMask or another Ethereum wallet.",
        variant: "destructive",
      })
      return null
    }

    setIsConnecting(true)
    try {
      console.log("Requesting accounts...")
      // Request accounts directly from window.ethereum
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      console.log("Accounts received:", accounts)

      if (!accounts || accounts.length === 0) {
        console.error("No accounts returned from wallet")
        toast({
          title: "Connection Failed",
          description: "No accounts returned from wallet. Please unlock your wallet and try again.",
          variant: "destructive",
        })
        return null
      }

      // Get chain ID directly from window.ethereum
      console.log("Getting chain ID...")
      const chainIdHex = await window.ethereum.request({ method: "eth_chainId" })
      const networkChainId = Number.parseInt(chainIdHex, 16)
      console.log("Current chain ID:", networkChainId)

      setChainId(networkChainId)

      // For now, let's accept any network to ensure the wallet connects
      // We'll handle network switching separately
      if (accounts.length > 0) {
        const userAddress = accounts[0]
        console.log("Successfully connected to wallet:", userAddress)
        setAddress(userAddress)
        setIsConnected(true)
        toast({
          title: "Wallet Connected",
          description: `Connected to ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`,
        })

        // After successful connection, try to switch to Base network
        // But don't make it a requirement for connection
        try {
          console.log("Attempting to switch to Base network after connection...")
          await switchToBase("sepolia") // Default to Base Sepolia
        } catch (networkError) {
          console.error("Failed to switch network after connection:", networkError)
          // Don't block the connection if network switching fails
        }

        return userAddress
      }
      return null
    } catch (error: any) {
      console.error("Failed to connect wallet:", error)
      let errorMessage = "Failed to connect wallet. Please try again."

      // Handle specific error codes
      if (error.code) {
        switch (error.code) {
          case 4001:
            errorMessage = "You rejected the connection request."
            break
          case -32002:
            errorMessage = "Connection request already pending. Check your wallet."
            break
          default:
            errorMessage = `Error: ${error.message || error.code}`
        }
      }

      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAddress(null)
    setIsConnected(false)
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    })
  }

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        isConnecting,
        connectWallet,
        disconnectWallet,
        chainId,
        switchToBase,
        sendTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
