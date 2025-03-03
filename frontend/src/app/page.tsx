import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 space-y-8">
      <h1 className="text-4xl font-bold text-center">Welcome to CitizenConnect360</h1>
      <p className="text-xl text-center max-w-2xl">
        Track and monitor government initiatives at both national and county levels and be involved in public
        participation
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">View Bills</h2>
          <Link href="/bills?level=national">
            <Button className="w-full">National Government</Button>
          </Link>
          <Link href="/bills?level=county">
            <Button className="w-full">County Government</Button>
          </Link>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">View Projects</h2>
          <Link href="/projects?level=national">
            <Button className="w-full">National Government</Button>
          </Link>
          <Link href="/projects?level=county">
            <Button className="w-full">County Government</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}