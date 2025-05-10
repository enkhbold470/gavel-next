import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProjectsTable } from "@/components/projects-table"
import { JudgesTable } from "@/components/judges-table"
import { GlobalSettings } from "@/components/global-settings"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-gray-500">{new Date().toLocaleString()}</span>
          <h1 className="text-xl font-bold">Admin - Gavel</h1>
          <div></div> {/* Empty div for flex spacing */}
        </div>

        <section className="mt-6">
          <header className="w-full bg-primary py-2">
            <h2 className="text-center text-lg font-bold uppercase text-white">ADMIN</h2>
          </header>
        </section>

        <section className="mt-6">
          <header className="w-full bg-primary py-2">
            <h2 className="text-center text-lg font-bold uppercase text-white">STATS</h2>
          </header>
          <div className="p-4">
            <p className="text-lg">Votes: 0</p>
          </div>
        </section>

        <section className="mt-6">
          <header className="w-full bg-primary py-2">
            <h2 className="text-center text-lg font-bold uppercase text-white">PROJECTS</h2>
          </header>
          <div className="overflow-x-auto">
            <ProjectsTable />
          </div>
          <div className="mt-2">
            <Link href="#" className="text-blue-600 hover:underline">
              Download CSV
            </Link>
          </div>
        </section>

        <section className="mt-6">
          <header className="w-full bg-primary py-2">
            <h2 className="text-center text-lg font-bold uppercase text-white">JUDGES</h2>
          </header>
          <div className="overflow-x-auto">
            <JudgesTable />
          </div>
          <div className="mt-2">
            <Link href="#" className="text-blue-600 hover:underline">
              Download CSV
            </Link>
          </div>
        </section>

        <section className="mt-6">
          <header className="w-full bg-primary py-2">
            <h2 className="text-center text-lg font-bold uppercase text-white">ADD PROJECTS</h2>
          </header>
          <div className="p-4">
            <p className="mb-2">Add name, location, description (CSV format)</p>
            <textarea
              className="w-full rounded border border-gray-300 p-2"
              rows={6}
              placeholder="Project Name, Table Location, Project Description"
            ></textarea>
            <p className="mt-4">Or upload a file here:</p>
            <div className="mt-2">
              <input type="file" className="block" />
            </div>
            <Button className="mt-4 w-full bg-action-positive uppercase text-white hover:bg-action-positive/90">
              SUBMIT
            </Button>
          </div>
        </section>

        <section className="mt-6">
          <header className="w-full bg-primary py-2">
            <h2 className="text-center text-lg font-bold uppercase text-white">ADD JUDGES</h2>
          </header>
          <div className="p-4">
            <p className="mb-2">Add name, email, description (CSV format)</p>
            <textarea
              className="w-full rounded border border-gray-300 p-2"
              rows={6}
              placeholder="Judge Name, Email, Description"
            ></textarea>
            <p className="mt-4">Or upload a file here:</p>
            <div className="mt-2">
              <input type="file" className="block" />
            </div>
            <Button className="mt-4 w-full bg-action-positive uppercase text-white hover:bg-action-positive/90">
              SUBMIT
            </Button>
          </div>
        </section>

        <section className="mt-6 mb-8">
          <header className="w-full bg-primary py-2">
            <h2 className="text-center text-lg font-bold uppercase text-white">GLOBAL SETTINGS</h2>
          </header>
          <div className="overflow-x-auto">
            <GlobalSettings />
          </div>
        </section>

        <footer className="flex items-center justify-between py-4">
          <span className="text-sm text-gray-500">localhost:5000/admin/</span>
          <span className="text-sm text-gray-500">1/1</span>
        </footer>

        <div className="py-2 text-center text-sm text-gray-500">Powered by Gavel</div>
      </div>
    </div>
  )
}
