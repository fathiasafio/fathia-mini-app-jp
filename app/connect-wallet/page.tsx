"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ExternalLink } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import { useWallet } from "@/providers/wallet-provider"
import { Logo } from "@/components/logo"

export default function ConnectWallet() {
  const router = useRouter()
  const { user, isLoading: authLoading, updateUserWallet } = useAuth()
  const { address, isConnected, isConnecting, connectWallet } = useWallet()
  const [error, setError] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [ethereumAvailable, setEthereumAvailable] = useState(false)

  useEffect(() => {
    // Check if ethereum is available in the browser
    if (typeof window !== "undefined") {
      setEthereumAvailable(!!window.ethereum)
    }

    // If no user is logged in, redirect to sign in
    if (!authLoading && !user) {
      router.push("/signin")
    }
  }, [authLoading, user, router])

  const handleConnectWallet = async () => {
    setError("")
    try {
      console.log("Starting wallet connection process")
      const walletAddress = await connectWallet()
      console.log("Wallet connection result:", walletAddress)

      if (walletAddress) {
        setIsUpdating(true)
        await updateUserWallet(walletAddress)
        router.push("/verify")
      } else {
        setError("Failed to get wallet address. Please make sure your wallet is unlocked and try again.")
      }
    } catch (err: any) {
      console.error("Wallet connection error:", err)
      setError(err.message || "Failed to connect wallet. Check console for details.")
    } finally {
      setIsUpdating(false)
    }
  }

  if (authLoading) {
    return (
      <div className="container max-w-md mx-auto p-4 min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <main className="container max-w-md mx-auto p-4 min-h-screen flex flex-col justify-center">
      <Card className="w-full">
        <CardHeader className="flex flex-col items-center">
          <Logo size="md" className="mb-4" />
          <CardTitle className="text-2xl text-center">Connect Wallet</CardTitle>
          <CardDescription className="text-center">
            Connect your Ethereum wallet to interact with the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <p className="mb-4">You need to connect your wallet to record your moods on the Base blockchain.</p>

            {!ethereumAvailable && (
              <Alert className="mb-4">
                <AlertDescription className="flex flex-col space-y-2">
                  <p>No wallet detected. Please install MetaMask or another Ethereum wallet.</p>
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary flex items-center"
                  >
                    Install MetaMask <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleConnectWallet}
              className="w-full"
              disabled={isConnecting || isUpdating || !ethereumAvailable}
            >
              {isConnecting || isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isConnecting ? "Connecting Wallet..." : "Updating Profile..."}
                </>
              ) : (
                "Connect Wallet"
              )}
            </Button>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {isConnected && address && (
            <Alert>
              <AlertDescription>
                Connected: {address.slice(0, 6)}...{address.slice(-4)}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground flex flex-col space-y-2">
          <p>Make sure you have MetaMask or another Ethereum wallet installed</p>
          <p>This app works with the Base blockchain network</p>
        </CardFooter>
      </Card>
    </main>
  )
}
