"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"

export default function Home() {
  const router = useRouter()
  const [verified, setVerified] = useState(false)
  const [verificationId, setVerificationId] = useState("")

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
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setVerified(true)
        setVerificationId(data.id || "verified")
      }
    } catch (error) {
      console.error("Verification error:", error)
    }
  }

  const handleGetStarted = () => {
    router.push("/signin")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-black">
      <Card className="w-full max-w-md bg-[#111111] border-[#222222]">
        <CardHeader className="text-center">
          <Logo size="lg" className="mx-auto mb-4" />
          <CardTitle className="text-2xl text-white">Fathia Mini App</CardTitle>
          <CardDescription className="text-gray-400">
            Record your mood on the blockchain with World ID verification
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="text-center space-y-4">
            <p className="text-gray-300">
              Fathia is a decentralized application that allows you to record your mood on the Base blockchain with
              privacy and security provided by World ID verification.
            </p>
            <Button size="lg" onClick={handleGetStarted} className="mt-4 bg-[#3C9AAA] hover:bg-[#2D7A8A] text-white">
              Get Started
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-[#222222] p-4">
          <p className="text-xs text-gray-500">Powered by World ID - The privacy-first identity protocol</p>
        </CardFooter>
      </Card>
    </main>
  )
}
