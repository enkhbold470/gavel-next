import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-primary">De Anza Hacks, MIT Gavel</h1>
          <p className="text-xl text-gray-600">Accurate & Efficient Hackathon Judging</p>
        </div>
     
        <p className="text-sm text-gray-500">Powered by MIT Gavel</p>
      </div>
    </div>
  )
}
