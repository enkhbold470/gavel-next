"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Judge {
  id: number;
  name: string;
  email: string;
  description: string | null;
  alpha: number;
  beta: number;
  active: boolean;
  read_welcome: boolean;
  nextId: number | null;
  prevId: number | null;
  updated: string | null;
  decisions: any[];
}

export function JudgesTable() {
  const [judges, setJudges] = useState<Judge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJudges() {
      try {
        const response = await fetch('/api/admin/judges');
        const data = await response.json();
        
        if (response.ok) {
          setJudges(data.judges);
        } else {
          setError(data.error || 'Failed to fetch judges');
        }
      } catch (err) {
        setError('Failed to fetch judges');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchJudges();
  }, []);

  async function handleAction(action: string, judgeId: number) {
    try {
      const formData = new FormData();
      formData.append('action', action);
      formData.append('judge_id', judgeId.toString());
      
      const response = await fetch('/api/admin/judges', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Show email message if available
        if (data.message) {
          alert(data.message);
        }
        
        // Refresh the list
        const updatedResponse = await fetch('/api/admin/judges');
        const updatedData = await updatedResponse.json();
        setJudges(updatedData.judges);
      } else {
        setError(data.error || `Failed to ${action.toLowerCase()} judge`);
      }
    } catch (err) {
      setError(`Failed to ${action.toLowerCase()} judge`);
      console.error(err);
    }
  }

  if (loading) {
    return <div className="text-center p-4">Loading judges...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  return (
    <div>
      {judges.length === 0 ? (
        <div className="text-center p-4">No judges found.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Votes</TableHead>
              <TableHead>Next (Id)</TableHead>
              <TableHead>Previous (Id)</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Delete</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {judges.map((judge) => (
              <TableRow key={judge.id}>
                <TableCell>{judge.id}</TableCell>
                <TableCell className="font-medium">{judge.name}</TableCell>
                <TableCell>{judge.email}</TableCell>
                <TableCell>{judge.description || "-"}</TableCell>
                <TableCell>{judge.decisions.length}</TableCell>
                <TableCell>{judge.nextId || "-"}</TableCell>
                <TableCell>{judge.prevId || "-"}</TableCell>
                <TableCell>{judge.updated ? new Date(judge.updated).toLocaleString() : "-"}</TableCell>
                <TableCell>
                  <Button 
                    className="w-full bg-action-positive uppercase text-white hover:bg-action-positive/90"
                    onClick={() => handleAction('Email', judge.id)}
                  >
                    EMAIL
                  </Button>
                </TableCell>
                <TableCell className={!judge.active ? "bg-yellow-50" : ""}>
                  <Button
                    className={`w-full uppercase ${
                      judge.active
                        ? "bg-action-negative text-white hover:bg-action-negative/90"
                        : "bg-action-positive text-white hover:bg-action-positive/90"
                    }`}
                    onClick={() => handleAction(judge.active ? 'Disable' : 'Enable', judge.id)}
                  >
                    {judge.active ? "DISABLE" : "ENABLE"}
                  </Button>
                </TableCell>
                <TableCell>
                  <Button 
                    className="w-full bg-action-negative uppercase text-white hover:bg-action-negative/90"
                    onClick={() => handleAction('Delete', judge.id)}
                  >
                    DELETE
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
