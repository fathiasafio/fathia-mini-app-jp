"use client"

import { useState, useEffect } from "react"
import { Loader2, ExternalLink, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/providers/wallet-provider"

interface TransactionStatusProps {
  txHash: string | null
  onConfirmed?: () => void
  resetTxHash: () => void
}

export function TransactionStatus({ txHash, onConfirmed, resetTxHash }: TransactionStatusProps) {
  const [status, setStatus] = useState<"pending" | "confirmed" | "failed" | null>(null)
  const { chainId } = useWallet()

  // Get the appropriate block explorer URL based on the current network
  const getBlockExplorerUrl = () => {
    if (!txHash) return ""

    switch (chainId) {
      case 8453:
        return `https://basescan.org/tx/${txHash}`
      case 84531:
        return `https://goerli.basescan.org/tx/${txHash}`
      case 84532:
        return `https://sepolia.basescan.org/tx/${txHash}`
      case 1:
        return `https://etherscan.io/tx/${txHash}`
      case 5:
        return `https://goerli.etherscan.io/tx/${txHash}`
      case 11155111:
        return `https://sepolia.etherscan.io/tx/${txHash}`
      default:
        return `https://sepolia.basescan.org/tx/${txHash}`
    }
  }

  useEffect(() => {
    if (!txHash) {
      setStatus(null)
      return
    }

    setStatus("pending")

    // In a real app, you would poll the blockchain for transaction status
    // For this demo, we'll simulate transaction confirmation
    const timer = setTimeout(() => {
      setStatus("confirmed")
      if (onConfirmed) onConfirmed()
    }, 3000)

    return () => clearTimeout(timer)
  }, [txHash, onConfirmed])

  if (!txHash || !status) return null

  return (
    <Alert variant={status === "failed" ? "destructive" : "default"} className="mt-4 mb-4">
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center">
          {status === "pending" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {status === "pending" && "Transaction pending..."}
          {status === "confirmed" && "Transaction confirmed!"}
          {status === "failed" && "Transaction failed."}
        </div>

        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const url = getBlockExplorerUrl()
              if (url) window.open(url, "_blank")
            }}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={resetTxHash}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
