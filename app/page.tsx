import Image from 'next/image'
import { BunoApp } from '@/components/buno-app'

export default function HomePage() {
  return (
    <>
      <div className="fixed inset-0 z-0 bg-background">
        <Image
          src="/images/forest-sanctuary.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <BunoApp />
    </>
  )
}
