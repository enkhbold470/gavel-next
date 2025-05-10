import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ComparePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="flex flex-col">
        {/* Previous Project Section */}
        <div>
          <header className="w-full bg-previous py-2">
            <h2 className="text-center text-lg font-bold uppercase text-white">PREVIOUS</h2>
          </header>
          <div className="bg-previous-bg p-4">
            <h3 className="text-xl font-bold">Lumen</h3>
            <p className="mt-2 text-gray-700">
              A smart lighting system that adjusts based on natural light levels and user preferences, helping to reduce
              energy consumption while maintaining optimal lighting conditions.
            </p>
            <p className="mt-2 text-gray-700">
              <span className="font-bold">Location:</span> Table B1
            </p>
          </div>
        </div>

        {/* Current Project Section */}
        <div>
          <header className="w-full bg-current py-2">
            <h2 className="text-center text-lg font-bold uppercase text-white">CURRENT</h2>
          </header>
          <div className="bg-current-bg p-4">
            <h3 className="text-xl font-bold">EcoTrack</h3>
            <p className="mt-2 text-gray-700">
              An application that helps users track and reduce their carbon footprint by providing personalized
              recommendations based on their daily activities and consumption patterns.
            </p>
            <p className="mt-2 text-gray-700">
              <span className="font-bold">Location:</span> Table C3
            </p>
          </div>
        </div>

        {/* Vote Section */}
        <div>
          <header className="w-full bg-action-negative py-2">
            <h2 className="text-center text-lg font-bold uppercase text-white">VOTE</h2>
          </header>
          <div className="p-4">
            <p className="mb-4 text-center text-lg">Which one is better?</p>
            <div className="flex gap-2">
              <Button className="flex-1 bg-previous uppercase text-black hover:bg-previous/90">PREVIOUS</Button>
              <Button className="flex-1 bg-current uppercase text-white hover:bg-current/90">CURRENT</Button>
            </div>
            <Button asChild className="mt-3 w-full bg-skip uppercase text-black hover:bg-skip/90">
              <Link href="/judge/start">SKIP</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
