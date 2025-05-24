"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/providers/wallet-provider"
import { Button } from "@/components/ui/button"
import { Network } from "lucide-react"

export function NetworkIndicator() {
  const { chainId, switchToBase } = useWallet()
  const [networkName, setNetworkName] = useState<string | null>(null)
  const [isTestnet, setIsTestnet] = useState(false)
  const [isBaseNetwork, setIsBaseNetwork] = useState(false)

  useEffect(() => {
    if (chainId) {
      // Set network name based on chainId
      switch (chainId) {
        case 8453:
          setNetworkName("Base")
          setIsTestnet(false)
          setIsBaseNetwork(true)
          break
        case 84531:
          setNetworkName("Base Goerli")
          setIsTestnet(true)
          setIsBaseNetwork(true)
          break
        case 84532:
          setNetworkName("Base Sepolia")
          setIsTestnet(true)
          setIsBaseNetwork(true)
          break
        case 1:
          setNetworkName("Ethereum")
          setIsTestnet(false)
          setIsBaseNetwork(false)
          break
        case 5:
          setNetworkName("Goerli")
          setIsTestnet(true)
          setIsBaseNetwork(false)
          break
        case 11155111:
          setNetworkName("Sepolia")
          setIsTestnet(true)
          setIsBaseNetwork(false)
          break
        default:
          setNetworkName(`Chain ${chainId}`)
          setIsTestnet(false)
          setIsBaseNetwork(false)
      }
    } else {
      setNetworkName(null)
    }
  }, [chainId])

  const handleSwitchNetwork = async () => {
    await switchToBase("sepolia") // Default to Base Sepolia
  }

  if (!networkName) return null

  if (!isBaseNetwork) {
    return (
      <Button variant="fathia" size="sm" className="text-xs" onClick={handleSwitchNetwork}>
        <Network className="h-3 w-3 mr-1" />
        Switch to Base
      </Button>
    )
  }

  return (
    <Badge
      variant={isTestnet ? "outline" : "default"}
      className={isTestnet ? "border-[#3C9AAA] text-[#5CCCDD]" : "bg-[#3C9AAA] text-white"}
    >
      {networkName}
      {isTestnet && " (Testnet)"}
    </Badge>
  )
}
