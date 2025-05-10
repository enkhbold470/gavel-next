"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Item {
  id: number;
  name: string;
  location: string;
  description: string;
  mu: number;
  sigma_sq: number;
  prioritized: boolean;
  active: boolean;
  viewCount: number;
  skipCount: number;
  totalVotes: number;
}

export function ProjectsTable() {
  const [projects, setProjects] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/admin/items');
        const data = await response.json();
        
        if (response.ok) {
          setProjects(data.items);
        } else {
          setError(data.error || 'Failed to fetch projects');
        }
      } catch (err) {
        setError('Failed to fetch projects');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProjects();
  }, []);

  async function handleAction(action: string, itemId: number) {
    try {
      const formData = new FormData();
      formData.append('action', action);
      formData.append('item_id', itemId.toString());
      
      const response = await fetch('/api/admin/items', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Refresh the list
        const updatedResponse = await fetch('/api/admin/items');
        const updatedData = await updatedResponse.json();
        setProjects(updatedData.items);
      } else {
        setError(data.error || `Failed to ${action.toLowerCase()} project`);
      }
    } catch (err) {
      setError(`Failed to ${action.toLowerCase()} project`);
      console.error(err);
    }
  }

  if (loading) {
    return <div className="text-center p-4">Loading projects...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  return (
    <div>
      {projects.length === 0 ? (
        <div className="text-center p-4">No projects found.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="max-w-xs">Description</TableHead>
              <TableHead>Mu (+)</TableHead>
              <TableHead>Sigma Squared</TableHead>
              <TableHead>Votes</TableHead>
              <TableHead>Seen</TableHead>
              <TableHead>Skipped</TableHead>
              <TableHead>Prioritize</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Delete</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.id}</TableCell>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>{project.location}</TableCell>
                <TableCell className="max-w-xs truncate">{project.description}</TableCell>
                <TableCell>{project.mu.toFixed(2)}</TableCell>
                <TableCell>{project.sigma_sq.toFixed(2)}</TableCell>
                <TableCell>{project.totalVotes}</TableCell>
                <TableCell>{project.viewCount}</TableCell>
                <TableCell>{project.skipCount}</TableCell>
                <TableCell className={project.prioritized ? "bg-yellow-50" : ""}>
                  <Button
                    className={`w-full uppercase ${
                      project.prioritized
                        ? "bg-action-negative text-white hover:bg-action-negative/90"
                        : "bg-action-positive text-white hover:bg-action-positive/90"
                    }`}
                    onClick={() => handleAction(project.prioritized ? 'Cancel' : 'Prioritize', project.id)}
                  >
                    {project.prioritized ? "CANCEL" : "PRIORITIZE"}
                  </Button>
                </TableCell>
                <TableCell className={!project.active ? "bg-yellow-50" : ""}>
                  <Button
                    className={`w-full uppercase ${
                      project.active
                        ? "bg-action-negative text-white hover:bg-action-negative/90"
                        : "bg-action-positive text-white hover:bg-action-positive/90"
                    }`}
                    onClick={() => handleAction(project.active ? 'Disable' : 'Enable', project.id)}
                  >
                    {project.active ? "DISABLE" : "ENABLE"}
                  </Button>
                </TableCell>
                <TableCell>
                  <Button 
                    className="w-full bg-action-negative uppercase text-white hover:bg-action-negative/90"
                    onClick={() => handleAction('Delete', project.id)}
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
  )
}
