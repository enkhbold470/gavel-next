import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function StartPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="w-full bg-primary py-4">
        <h1 className="text-center text-xl font-bold uppercase text-white">START</h1>
      </header>
      <main className="flex-1 p-4">
        <div className="mx-auto max-w-md space-y-6">
          <h2 className="text-2xl font-bold">Lumen</h2>
          <p className="text-gray-700">
            A smart lighting system that adjusts based on natural light levels and user preferences, helping to reduce
            energy consumption while maintaining optimal lighting conditions.
          </p>
          <p className="text-gray-700">
            <span className="font-bold">Location:</span> Table B1
          </p>
          <div className="space-y-3 pt-4">
            <Button className="w-full bg-skip uppercase text-black hover:bg-skip/90">SKIP</Button>
            <Button asChild className="w-full bg-action-positive uppercase text-white hover:bg-action-positive/90">
              <Link href="/judge/compare">DONE</Link>
            </Button>
          </div>
        </div>
      </main>
      <footer className="py-2 text-center text-sm text-gray-500">Powered by Gavel</footer>
    </div>
  )
}
