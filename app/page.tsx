import Image from 'next/image'
import { Sanctuary } from '@/components/sanctuary'

export default function HomePage() {
  return (
    <>
      <div className="fixed inset-0 -z-10 bg-background">
        <Image
          src="/images/forest-sanctuary.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <Sanctuary />
    </>
  )
}
