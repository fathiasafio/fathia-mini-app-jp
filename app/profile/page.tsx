"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Copy, CheckCircle2, ShieldCheck, ShieldAlert } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import { useWallet } from "@/providers/wallet-provider"
import { useContract } from "@/hooks/use-contract"

export default function Profile() {
  const router = useRouter()
  const { user, isLoading: authLoading, signout } = useAuth()
  const { address, isConnected, chainId } = useWallet()
  const { isUserVerified } = useContract()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // If no user is logged in, redirect to sign in
    if (!authLoading && !user) {
      router.push("/signin")
    }
  }, [authLoading, user, router])

  const handleCopyAddress = () => {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSignOut = async () => {
    await signout()
    router.push("/")
  }

  if (authLoading) {
    return (
      <div className="container max-w-md mx-auto p-4 min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <main className="container max-w-md mx-auto p-4 min-h-screen">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center mb-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-xl ml-2">Profile</CardTitle>
          </div>
          <CardDescription>Manage your account and wallet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Account Information</h3>
            <div className="grid gap-2">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={user?.name || ""} readOnly />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email || ""} readOnly />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Wallet</h3>
            {user?.walletAddress ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Connected Wallet</Label>
                  <div className="flex items-center gap-2">
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
                </div>
                <div className="flex items-center">
                  <Input
                    value={user.walletAddress}
                    readOnly
                    className="font-mono text-xs"
                    onClick={handleCopyAddress}
                  />
                  <Button variant="ghost" size="icon" onClick={handleCopyAddress} className="ml-2">
                    {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  Network: {chainId === 8453 ? "Base Mainnet" : chainId === 84531 ? "Base Goerli" : "Unknown"}
                </div>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm text-muted-foreground mb-2">No wallet connected</p>
                <Button size="sm" onClick={() => router.push("/connect-wallet")}>
                  Connect Wallet
                </Button>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Verification</h3>
            {isUserVerified ? (
              <div className="flex items-center space-x-2 bg-green-50 p-3 rounded-md">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Verified with World ID</p>
                  <p className="text-xs text-muted-foreground">Your identity has been verified</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm text-muted-foreground mb-2">Not verified with World ID</p>
                <Button size="sm" onClick={() => router.push("/verify")}>
                  Verify Identity
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
