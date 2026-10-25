import Image from 'next/image'

interface BunnyLogoProps {
  size?: number
  className?: string
  priority?: boolean
}

export function BunnyLogo({
  size = 80,
  className = '',
  priority = false,
}: BunnyLogoProps) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/images/buno-logo.jpg"
        alt="Buno logo"
        width={size * 2}
        height={size * 2}
        priority={priority}
        className="h-full w-full object-cover scale-105"
      />
    </div>
  )
}
