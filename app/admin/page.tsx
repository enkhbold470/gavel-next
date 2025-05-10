"use client";

import { useState, useRef, FormEvent, useEffect } from "react";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProjectsTable } from "@/components/projects-table"
import { JudgesTable } from "@/components/judges-table"
import { GlobalSettings } from "@/components/global-settings"

export default function AdminPage() {
  const [stats, setStats] = useState({
    votes: 0,
    loading: true,
    error: null as string | null,
  });
  
  const [submitting, setSubmitting] = useState({
    projects: false,
    judges: false,
  });
  
  const [alerts, setAlerts] = useState({
    projects: null as string | null,
    judges: null as string | null,
  });
  
  const projectsFormRef = useRef<HTMLFormElement>(null);
  const judgesFormRef = useRef<HTMLFormElement>(null); // Commented out as per instructions
  
  // Fetch stats on mount
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          setStats({
            votes: data.votes || 0,
            loading: false,
            error: null,
          });
        } else {
          setStats({
            votes: 0,
            loading: false,
            error: 'Failed to load stats',
          });
        }
      } catch (error) {
        setStats({
          votes: 0,
          loading: false,
          error: 'Failed to load stats',
        });
      }
    }
    
    fetchStats();
  }, []);
  
  async function handleProjectSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting({ ...submitting, projects: true });
    setAlerts({ ...alerts, projects: null });
    
    try {
      const formData = new FormData(projectsFormRef.current!);
      formData.append('action', 'Submit');
      
      const response = await fetch('/api/admin/items', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setAlerts({
          ...alerts,
          projects: `Successfully added ${data.itemsCreated} project(s)`,
        });
        
        // Clear the form
        if (projectsFormRef.current) {
          projectsFormRef.current.reset();
        }
      } else {
        setAlerts({
          ...alerts,
          projects: data.error || 'Failed to add projects',
        });
      }
    } catch (error) {
      setAlerts({
        ...alerts,
        projects: 'An error occurred while submitting the form',
      });
    } finally {
      setSubmitting({ ...submitting, projects: false });
    }
  }
  
  async function handleJudgeSubmit(e: FormEvent) { // Commented out as per instructions
    e.preventDefault();
    setSubmitting({ ...submitting, judges: true });
    setAlerts({ ...alerts, judges: null });
    
    try {
      const formData = new FormData(judgesFormRef.current!);
      formData.append('action', 'Submit');
      
      const response = await fetch('/api/admin/judges', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setAlerts({
          ...alerts,
          judges: `Successfully added ${data.judgesCreated} judge(s)`,
        });
        
        // Clear the form
        if (judgesFormRef.current) {
          judgesFormRef.current.reset();
        }
      } else {
        setAlerts({
          ...alerts,
          judges: data.error || 'Failed to add judges',
        });
      }
    } catch (error) {
      setAlerts({
        ...alerts,
        judges: 'An error occurred while submitting the form',
      });
    } finally {
      setSubmitting({ ...submitting, judges: false });
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
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
            {stats.loading ? (
              <p>Loading stats...</p>
            ) : stats.error ? (
              <p className="text-red-500">{stats.error}</p>
            ) : (
              <div>
                <p className="text-lg">Votes: {stats.votes}</p>
                <div className="mt-2">
                  <Link href="/api/admin/decisions.csv" className="text-blue-600 hover:underline">
                    Download Decisions CSV
                  </Link>
                </div>
              </div>
            )}
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
            <Link href="/api/admin/items.csv" className="text-blue-600 hover:underline">
              Download CSV
            </Link>
          </div>
        </section>

        <section className="mt-6"> // Commented out as per instructions
          <header className="w-full bg-primary py-2">
            <h2 className="text-center text-lg font-bold uppercase text-white">JUDGES</h2>
          </header>
          <div className="overflow-x-auto">
            <JudgesTable />
          </div>
          <div className="mt-2">
            <Link href="/api/admin/judges.csv" className="text-blue-600 hover:underline">
              Download CSV
            </Link>
          </div>
        </section>

        <section className="mt-6">
          <header className="w-full bg-primary py-2">
            <h2 className="text-center text-lg font-bold uppercase text-white">ADD PROJECTS</h2>
          </header>
          <div className="p-4">
            {alerts.projects && (
              <div className={alerts.projects.includes('Success') ? 'bg-green-100 p-3 mb-4 rounded' : 'bg-red-100 p-3 mb-4 rounded'}>
                {alerts.projects}
              </div>
            )}
            <form ref={projectsFormRef} onSubmit={handleProjectSubmit}>
              <p className="mb-2">Add name, location, description (CSV format)</p>
              <textarea
                name="data"
                className="w-full rounded border border-gray-300 p-2"
                rows={6}
                placeholder="Project Name, Table Location, Project Description"
              ></textarea>
              <p className="mt-4">Or upload a file here:</p>
              <div className="mt-2">
                <input type="file" name="file" className="block" />
              </div>
              <Button 
                type="submit"
                disabled={submitting.projects}
                className="mt-4 w-full bg-action-positive uppercase text-white hover:bg-action-positive/90"
              >
                {submitting.projects ? 'SUBMITTING...' : 'SUBMIT'}
              </Button>
            </form>
          </div>
        </section>

        <section className="mt-6"> // Commented out as per instructions
          <header className="w-full bg-primary py-2">
            <h2 className="text-center text-lg font-bold uppercase text-white">ADD JUDGES</h2>
          </header>
          <div className="p-4">
            {alerts.judges && (
              <div className={alerts.judges.includes('Success') ? 'bg-green-100 p-3 mb-4 rounded' : 'bg-red-100 p-3 mb-4 rounded'}>
                {alerts.judges}
              </div>
            )}
            <form ref={judgesFormRef} onSubmit={handleJudgeSubmit}>
              <p className="mb-2">Add name, email, description (CSV format)</p>
              <textarea
                name="data"
                className="w-full rounded border border-gray-300 p-2"
                rows={6}
                placeholder="Judge Name, Email, Description"
              ></textarea>
              <p className="mt-4">Or upload a file here:</p>
              <div className="mt-2">
                <input type="file" name="file" className="block" />
              </div>
              <Button 
                type="submit"
                disabled={submitting.judges}
                className="mt-4 w-full bg-action-positive uppercase text-white hover:bg-action-positive/90"
              >
                {submitting.judges ? 'SUBMITTING...' : 'SUBMIT'}
              </Button>
            </form>
          </div>
        </section>

        <section className="mt-6 mb-8"> // Commented out as per instructions
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
