import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-primary">Gavel</h1>
          <p className="text-xl text-gray-600">Hackathon Judging Platform</p>
        </div>
        <div className="space-y-4">
          <Button asChild className="w-full bg-primary hover:bg-primary/90">
            <Link href="/judge">Judge Interface</Link>
          </Button>
          <Button asChild className="w-full bg-primary hover:bg-primary/90">
            <Link href="/admin">Admin Panel</Link>
          </Button>
        </div>
        <p className="text-sm text-gray-500">Powered by Gavel</p>
      </div>
    </div>
  )
}
