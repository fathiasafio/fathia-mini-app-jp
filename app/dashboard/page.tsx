"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { LogOut, RefreshCw, User, ShieldCheck, ShieldAlert, ExternalLink, Network } from "lucide-react"
import { NetworkIndicator } from "@/components/network-indicator"
import { TransactionStatus } from "@/components/transaction-status"
import WalletConnect from "@/components/WalletConnect"
import { useAuth } from "@/providers/auth-provider"
import { useWallet } from "@/providers/wallet-provider"
import { useContract } from "@/hooks/use-contract"
import { useMobile } from "@/hooks/use-mobile"
import { Logo } from "@/components/logo"
import { IDKitWidget, VerificationLevel } from "@worldcoin/idkit"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function Dashboard() {
  const router = useRouter()
  const { user, isLoading: authLoading, signout, updateUserWallet } = useAuth()
  const { address, isConnected, connectWallet, chainId, switchToBase } = useWallet()
  const {
    currentMood,
    isLoadingMood,
    isSettingMood,
    fetchCurrentMood,
    setMood,
    isUserVerified,
    checkUserVerification,
    lastTransactionHash,
    resetTransactionHash,
  } = useContract()
  const isMobile = useMobile()

  const [activeTab, setActiveTab] = useState("my-mood")
  const [showVerification, setShowVerification] = useState(false)
  const [verificationId, setVerificationId] = useState("")
  const [verified, setVerified] = useState(false)
  const [ethereumAvailable, setEthereumAvailable] = useState(false)
  const [isBaseNetwork, setIsBaseNetwork] = useState(false)
  const [isBaseSepoliaNetwork, setIsBaseSepoliaNetwork] = useState(false)

  useEffect(() => {
    // Check if ethereum is available in the browser
    if (typeof window !== "undefined") {
      setEthereumAvailable(!!window.ethereum)
    }

    // If no user is logged in, redirect to sign in
    if (!authLoading && !user) {
      router.push("/signin")
      return
    }

    // If user has wallet connected, set the address and check verification
    if (user?.walletAddress) {
      checkUserVerification(user.walletAddress)
      fetchCurrentMood()
    }
  }, [authLoading, user, router, fetchCurrentMood, checkUserVerification])

  // Check verification status when wallet is connected
  useEffect(() => {
    if (address) {
      checkUserVerification(address)
    }
  }, [address, checkUserVerification])

  // Check if connected to Base network
  useEffect(() => {
    if (chainId) {
      setIsBaseNetwork(chainId === 8453 || chainId === 84531 || chainId === 84532)
      setIsBaseSepoliaNetwork(chainId === 84532)
    }
  }, [chainId])

  const handleSignOut = async () => {
    await signout()
    router.push("/")
  }

  const handleSetMood = async (mood: string) => {
    if (!isUserVerified) {
      setShowVerification(true)
      return
    }

    if (!isBaseNetwork) {
      try {
        const switched = await switchToBase("sepolia")
        if (!switched) {
          return
        }
      } catch (error) {
        console.error("Failed to switch to Base network:", error)
        return
      }
    }

    await setMood(mood)
  }

  const handleSwitchNetwork = async () => {
    try {
      await switchToBase("sepolia")
    } catch (error) {
      console.error("Failed to switch network:", error)
    }
  }

  const handleVerify = async (result: any) => {
    try {
      // Call your API to verify the proof
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          merkle_root: result.merkle_root,
          nullifier_hash: result.nullifier_hash,
          proof: result.proof,
          verification_level: result.verification_level,
          address: address, // Include wallet address for verification
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setVerified(true)
        setVerificationId(data.id || "verified")
        setShowVerification(false)

        // Refresh verification status
        if (address) {
          checkUserVerification(address)
        }
      }
    } catch (error) {
      console.error("Verification error:", error)
    }
  }

  const handleWalletConnect = async (address: string) => {
    await updateUserWallet(address)
    checkUserVerification(address)
  }

  const handleTransactionConfirmed = () => {
    // Refresh mood after transaction is confirmed
    fetchCurrentMood()
  }

  if (authLoading) {
    return (
      <div className="container max-w-md mx-auto p-4 min-h-screen flex items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    )
  }

  return (
    <main className="container max-w-md mx-auto p-4 min-h-screen">
      <Card className="w-full bg-[#111111] border-[#222222]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Logo size="sm" />
            <div className="flex items-center gap-2">
              <NetworkIndicator />
              <Button variant="ghost" size="icon" onClick={() => router.push("/profile")}>
                <User className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription className="text-gray-400">Record your mood on the blockchain</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {address ? (
                <Badge variant="outline" className="font-mono text-xs">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </Badge>
              ) : (
                <WalletConnect onConnect={handleWalletConnect} />
              )}
              {isUserVerified ? (
                <Badge variant="success" className="bg-green-500 text-white">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <ShieldAlert className="h-3 w-3 mr-1" />
                  Not Verified
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={fetchCurrentMood}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {address && !isBaseNetwork && (
            <Alert className="mb-4 bg-[#1A1A1A] border-[#333333]">
              <AlertDescription className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <p>You're not connected to Base network</p>
                  <Button size="sm" variant="fathia" onClick={handleSwitchNetwork}>
                    <Network className="h-3 w-3 mr-1" />
                    Switch to Base Sepolia
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {address && isBaseNetwork && !isBaseSepoliaNetwork && (
            <Alert className="mb-4 bg-[#1A1A1A] border-[#333333]">
              <AlertDescription className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <p>For best results, use Base Sepolia testnet</p>
                  <Button size="sm" variant="fathia" onClick={handleSwitchNetwork}>
                    <Network className="h-3 w-3 mr-1" />
                    Switch to Base Sepolia
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <TransactionStatus
            txHash={lastTransactionHash}
            onConfirmed={handleTransactionConfirmed}
            resetTxHash={resetTransactionHash}
          />

          {!address ? (
            <div className="text-center py-8">
              <p className="mb-4 text-gray-300">Connect your wallet to start recording your moods on the blockchain.</p>

              {!ethereumAvailable && (
                <Alert className="mb-4 bg-[#1A1A1A] border-[#333333]">
                  <AlertDescription className="flex flex-col space-y-2">
                    <p>No wallet detected. Please install MetaMask or another Ethereum wallet.</p>
                    <a
                      href="https://metamask.io/download/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#5CCCDD] flex items-center"
                    >
                      Install MetaMask <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </AlertDescription>
                </Alert>
              )}

              <Button onClick={connectWallet} disabled={!ethereumAvailable} variant="fathia">
                Connect Wallet
              </Button>
            </div>
          ) : showVerification ? (
            <div className="space-y-4 py-4">
              <h3 className="text-lg font-medium text-center text-white">Verify Your Identity</h3>
              <p className="text-sm text-gray-400 text-center mb-4">
                You need to verify your identity with World ID before setting your mood.
              </p>
              <div className="flex justify-center">
                <IDKitWidget
                  app_id={process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID || ""}
                  action="verify"
                  onSuccess={handleVerify}
                  verification_level={VerificationLevel.Device}
                >
                  {({ open }) => (
                    <Button onClick={open} className="w-full" variant="fathia">
                      Verify with World ID
                    </Button>
                  )}
                </IDKitWidget>
              </div>
              <Button variant="outline" className="w-full mt-2" onClick={() => setShowVerification(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="my-mood" value={activeTab} onValueChange={setActiveTab} className="tabs">
              <TabsList className="grid grid-cols-3 mb-4 bg-[#1A1A1A]">
                <TabsTrigger
                  value="my-mood"
                  className="tab data-[state=active]:tab-active data-[state=active]:bg-[#222222]"
                >
                  My Mood
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="tab data-[state=active]:tab-active data-[state=active]:bg-[#222222]"
                >
                  History
                </TabsTrigger>
                <TabsTrigger
                  value="global"
                  className="tab data-[state=active]:tab-active data-[state=active]:bg-[#222222]"
                >
                  Global
                </TabsTrigger>
              </TabsList>

              <TabsContent value="my-mood" className="space-y-4">
                <div className="text-center py-2">
                  <h3 className="text-lg font-medium mb-1 text-white">Current Mood</h3>
                  {isLoadingMood ? (
                    <Skeleton className="h-8 w-32 mx-auto bg-[#222222]" />
                  ) : (
                    <div className="text-2xl font-bold text-white">{currentMood || "No mood set"}</div>
                  )}
                </div>

                <Separator className="bg-[#222222]" />

                <div className="py-2">
                  <h3 className="text-lg font-medium mb-3 text-center text-white">Set New Mood</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {["Happy", "Sad", "Excited", "Relaxed", "Angry", "Tired", "Thoughtful", "Cool"].map((mood) => (
                      <Button
                        key={mood}
                        variant="outline"
                        className="flex flex-col items-center justify-center h-16 p-1 border-[#333333] hover:bg-[#222222]"
                        onClick={() => handleSetMood(mood)}
                        disabled={isSettingMood}
                      >
                        <span className="text-xl">
                          {mood === "Happy"
                            ? "😊"
                            : mood === "Sad"
                              ? "😢"
                              : mood === "Excited"
                                ? "🤩"
                                : mood === "Relaxed"
                                  ? "😌"
                                  : mood === "Angry"
                                    ? "😠"
                                    : mood === "Tired"
                                      ? "😴"
                                      : mood === "Thoughtful"
                                        ? "🤔"
                                        : "😎"}
                        </span>
                        <span className="text-xs mt-1 text-gray-300">{mood}</span>
                      </Button>
                    ))}
                  </div>

                  {!isUserVerified && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      You need to verify your identity with World ID before setting your mood.
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div className="text-center py-8">
                  <p className="text-gray-500">Your mood history will appear here</p>
                </div>
              </TabsContent>

              <TabsContent value="global">
                <div className="text-center py-8">
                  <p className="text-gray-500">Global moods will appear here</p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
        <CardFooter className="text-xs text-center text-gray-500 border-t border-[#222222]">
          All moods are stored on-chain and publicly visible
        </CardFooter>
      </Card>
    </main>
  )
}
