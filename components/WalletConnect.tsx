"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Wallet, Loader2 } from "lucide-react"
import { useWallet } from "@/providers/wallet-provider"

interface WalletConnectProps {
  onConnect?: (address: string) => void
  className?: string
}

export default function WalletConnect({ onConnect, className }: WalletConnectProps) {
  const { address, isConnected, isConnecting, connectWallet } = useWallet()
  const { toast } = useToast()
  const [ethereumAvailable, setEthereumAvailable] = useState(false)

  useEffect(() => {
    // Check if ethereum is available in the browser
    if (typeof window !== "undefined") {
      const hasEthereum = !!window.ethereum
      console.log("Ethereum provider detected:", hasEthereum)
      setEthereumAvailable(hasEthereum)

      // If MetaMask is installed but locked, we should still show the connect button
      if (hasEthereum && window.ethereum.isMetaMask) {
        console.log("MetaMask is installed")
      }
    }
  }, [])

  useEffect(() => {
    // If address changes and onConnect is provided, call it
    if (address && onConnect) {
      onConnect(address)
    }
  }, [address, onConnect])

  const handleConnectWallet = async () => {
    try {
      console.log("WalletConnect: Initiating wallet connection")
      const walletAddress = await connectWallet()
      console.log("WalletConnect: Connection result:", walletAddress)

      if (walletAddress && onConnect) {
        onConnect(walletAddress)
      } else if (!walletAddress) {
        console.log("WalletConnect: No wallet address returned")
      }
    } catch (error) {
      console.error("WalletConnect: Failed to connect wallet:", error)
      toast({
        title: "Connection Error",
        description: "There was a problem connecting to your wallet. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className={className}>
      {address ? (
        <Button variant="outline">
          <Wallet className="mr-2 h-4 w-4" />
          {address.slice(0, 6)}...{address.slice(-4)}
        </Button>
      ) : (
        <Button onClick={handleConnectWallet} disabled={isConnecting || !ethereumAvailable}>
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </>
          )}
        </Button>
      )}
    </div>
  )
}
