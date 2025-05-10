import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function JudgePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="w-full bg-primary py-4">
        <h1 className="text-center text-xl font-bold uppercase text-white">WELCOME</h1>
      </header>
      <main className="flex-1 p-4">
        <div className="mx-auto max-w-md space-y-6">
          <h2 className="text-2xl font-bold">Welcome to Gavel / HackMIT Judging!</h2>
          <p className="text-gray-700">Please read this important message carefully...</p>
          <div className="space-y-4 text-gray-600">
            <p>
              Gavel uses a <strong>pairwise comparison</strong> system to rank projects. You'll be shown two projects at
              a time and asked to choose which one is better.
            </p>
            <p>
              Please confirm the name of the project <strong>immediately beforehand</strong> with the team members at
              the table.
            </p>
            <p>
              <strong>Please don't skip unless absolutely necessary.</strong> Skipping affects the quality of the final
              rankings.
            </p>
            <p>
              <strong>Once you make a decision, you can't take it back.</strong> Please consider your choices carefully.
            </p>
          </div>
          <hr className="border-gray-300" />
          <p className="text-gray-700">
            If you have any questions or need assistance, please ask a staff member for help.
          </p>
          <Button asChild className="w-full bg-action-positive uppercase text-white hover:bg-action-positive/90">
            <Link href="/judge/start">DONE</Link>
          </Button>
        </div>
      </main>
      <footer className="py-2 text-center text-sm text-gray-500">Powered by Gavel</footer>
    </div>
  )
}
