'use client';

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'

interface Item {
  id: number;
  name: string;
  description: string;
  location: string;
  // Add other item properties as needed
}

interface Assignment {
  prevItem: Item | null;
  nextItem: Item | null;
  message?: string;
}

export default function ComparePage() {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchAssignment = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/judge/assignment');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch assignment');
      }
      const data: Assignment = await response.json();
      setAssignment(data);

      if (!data.prevItem && data.nextItem) {
        // Landed on compare, but no prevItem means should be on start page
        router.replace('/judge/start');
      } else if (!data.nextItem && data.message) {
        // No more items to compare
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignment();
  }, []);

  const handleVote = async (action: 'Previous' | 'Current' | 'Skip') => {
    if (!assignment?.prevItem || !assignment?.nextItem) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('action', action);
      formData.append('prev_id', String(assignment.prevItem.id));
      formData.append('next_id', String(assignment.nextItem.id));

      const response = await fetch('/api/judge/vote', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to process ${action}`);
      }
      // Re-fetch assignment to get the new pair
      await fetchAssignment(); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      // Keep loading true if error, so user sees error and can retry
      // setIsLoading(false); // Or set to false if you want to show items again
    } finally {
       // setIsLoading(false); // decide based on UX preference for error state
    }
  };

  if (isLoading && !assignment) {
    return <div className="flex min-h-screen flex-col items-center justify-center bg-white"><p>Loading comparison...</p></div>;
  }

  if (error) {
    return <div className="flex min-h-screen flex-col items-center justify-center bg-white"><p className="text-red-500">Error: {error}</p><Button onClick={fetchAssignment} disabled={isLoading}>{isLoading? 'Loading...':'Try Again'}</Button></div>;
  }

  if (!assignment?.prevItem || !assignment?.nextItem) {
     return (
      <div className="flex min-h-screen flex-col bg-white">
        <header className="w-full bg-primary py-4">
          <h1 className="text-center text-xl font-bold uppercase text-white">COMPARE</h1>
        </header>
        <main className="flex-1 p-4">
          <div className="mx-auto max-w-md space-y-6 text-center">
            <h2 className="text-2xl font-bold">{assignment?.message || 'Waiting for items to compare...'}</h2>
            {assignment?.message && <p>{assignment.message}</p>}
            {!assignment?.message && <p>If you see this for a while, try refreshing or going back to the start.</p>}
            <Button onClick={() => router.push('/judge/start')} className="mt-4">Go to Start Page</Button>
          </div>
        </main>
        <footer className="py-2 text-center text-sm text-gray-500">powered by MIT gavel</footer>
      </div>
    );
  }

  const { prevItem, nextItem } = assignment;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="flex flex-col">
        {/* Previous Project Section */}
        {prevItem && (
          <div>
            <header className="w-full bg-previous py-2">
              <h2 className="text-center text-lg font-bold uppercase text-white">PREVIOUS</h2>
            </header>
            <div className="bg-previous-bg p-4">
              <h3 className="text-xl font-bold">{prevItem.name}</h3>
              <p className="mt-2 text-gray-700">{prevItem.description}</p>
              {prevItem.location && 
                <p className="mt-2 text-gray-700">
                  <span className="font-bold">Location:</span> {prevItem.location}
                </p>
              }
            </div>
          </div>
        )}

        {/* Current Project Section */}
        {nextItem && (
          <div>
            <header className="w-full bg-current py-2">
              <h2 className="text-center text-lg font-bold uppercase text-white">CURRENT</h2>
            </header>
            <div className="bg-current-bg p-4">
              <h3 className="text-xl font-bold">{nextItem.name}</h3>
              <p className="mt-2 text-gray-700">{nextItem.description}</p>
              {nextItem.location && 
                <p className="mt-2 text-gray-700">
                  <span className="font-bold">Location:</span> {nextItem.location}
                </p>
              }
            </div>
          </div>
        )}

        {/* Vote Section */}
        <div>
          <header className="w-full bg-action-negative py-2">
            <h2 className="text-center text-lg font-bold uppercase text-white">VOTE</h2>
          </header>
          <div className="p-4">
            <p className="mb-4 text-center text-lg">Which one is better?</p>
            <div className="flex gap-2">
              <Button onClick={() => handleVote('Previous')} disabled={isLoading || !prevItem} className="flex-1 bg-previous uppercase text-black hover:bg-previous/90">
                {isLoading ? '...' : 'PREVIOUS'}
              </Button>
              <Button onClick={() => handleVote('Current')} disabled={isLoading || !nextItem} className="flex-1 bg-current uppercase text-white hover:bg-current/90">
                {isLoading ? '...' : 'CURRENT'}
              </Button>
            </div>
            <Button onClick={() => handleVote('Skip')} disabled={isLoading || !nextItem} className="mt-3 w-full bg-skip uppercase text-black hover:bg-skip/90">
              {isLoading ? '...' : 'SKIP CURRENT'}
            </Button>
          </div>
        </div>
      </div>
      <footer className="py-2 text-center text-sm text-gray-500">powered by MIT gavel</footer>
    </div>
  )
}
