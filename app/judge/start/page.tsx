'use client';

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

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

export default function StartPage() {
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
      if (data.nextItem === null && data.message) {
        // If no next item, but there's a message (e.g., no more items)
        // stay on this page to show the message, or handle as needed.
      } else if (data.prevItem && data.nextItem) {
        // If already have a prev and next, should be on compare page
        router.replace('/judge/compare');
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

  const handleSkip = async () => {
    if (!assignment?.nextItem) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('action', 'SkipStartItem');
      formData.append('item_id', String(assignment.nextItem.id));

      const response = await fetch('/api/judge/vote', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to skip item');
      }
      // Re-fetch assignment to get the new next item
      await fetchAssignment(); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setIsLoading(false);
    }
  };

  const handleDone = async () => {
    if (!assignment?.nextItem) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('action', 'ConfirmStartItem');
      formData.append('item_id', String(assignment.nextItem.id));

      const response = await fetch('/api/judge/vote', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to confirm item');
      }
      // On success, navigate to compare page
      router.push('/judge/compare');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setIsLoading(false);
    }
  };

  if (isLoading && !assignment) {
    return <div className="flex min-h-screen flex-col items-center justify-center bg-white"><p>Loading...</p></div>;
  }

  if (error) {
    return <div className="flex min-h-screen flex-col items-center justify-center bg-white"><p className="text-red-500">Error: {error}</p><Button onClick={fetchAssignment}>Try Again</Button></div>;
  }

  if (!assignment?.nextItem) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <header className="w-full bg-primary py-4">
          <h1 className="text-center text-xl font-bold uppercase text-white">START</h1>
        </header>
        <main className="flex-1 p-4">
          <div className="mx-auto max-w-md space-y-6 text-center">
            <h2 className="text-2xl font-bold">{assignment?.message || 'No items available'}</h2>
            <p>Thank you for your time and effort in judging the projects. There are currently no projects assigned for you to judge, or you have completed judging.</p>
            {/* <Button asChild className="mt-4 bg-action-positive uppercase text-white hover:bg-action-positive/90">
              <Link href="/">Go to Homepage</Link>
            </Button> */}
          </div>
        </main>
        <footer className="py-2 text-center text-sm text-gray-500">powered by MIT gavel</footer>
      </div>
    );
  }

  const currentItem = assignment.nextItem;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="w-full bg-primary py-4">
        <h1 className="text-center text-xl font-bold uppercase text-white">START JUDGING</h1>
      </header>
      <main className="flex-1 p-4">
        <div className="mx-auto max-w-md space-y-6">
          <h2 className="text-2xl font-bold">{currentItem.name}</h2>
          <p className="text-gray-700">{currentItem.description}</p>
          {currentItem.location && 
            <p className="text-gray-700">
              <span className="font-bold">Location:</span> {currentItem.location}
            </p>
          }
          <div className="space-y-3 pt-4 gap-4">
          <Button onClick={handleDone} disabled={isLoading} className="w-full h-16 bg-action-positive uppercase text-white hover:bg-action-positive/90">
              {isLoading ? 'Processing...' : 'DONE (Proceed to Compare)'}
            </Button>
            <Button onClick={handleSkip} disabled={isLoading} className="w-full bg-red-300 uppercase text-black hover:bg-red-300/90">
              {isLoading ? 'Skipping...' : 'SKIP'}
            </Button>
         
          </div>
        </div>
      </main>

    </div>
  )
}
