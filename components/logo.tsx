import Link from "next/link"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizes = {
    sm: 32,
    md: 48,
    lg: 64,
  }

  const logoSize = sizes[size]

  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative" style={{ width: logoSize, height: logoSize }}>
        <svg
          width={logoSize}
          height={logoSize}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="rounded-xl"
        >
          <rect width="64" height="64" rx="12" fill="#000000" />
          <path
            d="M32 16C23.164 16 16 23.164 16 32C16 40.836 23.164 48 32 48C40.836 48 48 40.836 48 32C48 23.164 40.836 16 32 16ZM32 24C28.686 24 26 26.686 26 30C26 33.314 28.686 36 32 36C35.314 36 38 33.314 38 30C38 26.686 35.314 24 32 24Z"
            fill="#3C9AAA"
          />
          <path
            d="M32 20C25.373 20 20 25.373 20 32C20 38.627 25.373 44 32 44C38.627 44 44 38.627 44 32C44 25.373 38.627 20 32 20ZM32 28C30.343 28 29 29.343 29 31C29 32.657 30.343 34 32 34C33.657 34 35 32.657 35 31C35 29.343 33.657 28 32 28Z"
            fill="#5CCCDD"
          />
        </svg>
      </div>
      {showText && (
        <span
          className={`ml-2 font-bold text-white ${size === "lg" ? "text-2xl" : size === "md" ? "text-xl" : "text-base"}`}
        >
          Fathia
        </span>
      )}
    </div>
  )
}

export function LogoLink({ size = "md", showText = true, className = "" }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <Logo size={size} showText={showText} />
    </Link>
  )
}
