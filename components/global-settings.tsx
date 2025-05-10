"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface SettingState {
  closed: boolean;
  loading: boolean;
  error: string | null;
}

export function GlobalSettings() {
  const [state, setState] = useState<SettingState>({
    closed: false,
    loading: true,
    error: null
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/admin/settings');
        const data = await response.json();
        
        if (response.ok) {
          setState(prev => ({
            ...prev,
            closed: data.closed,
            loading: false
          }));
        } else {
          setState(prev => ({
            ...prev,
            error: data.error || 'Failed to fetch settings',
            loading: false
          }));
        }
      } catch (err) {
        setState(prev => ({
          ...prev,
          error: 'Failed to fetch settings',
          loading: false
        }));
        console.error(err);
      }
    }
    
    fetchSettings();
  }, []);

  async function toggleJudging() {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const formData = new FormData();
      formData.append('key', 'closed');
      formData.append('action', state.closed ? 'Open' : 'Close');
      
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setState(prev => ({
          ...prev,
          closed: data.closed,
          loading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: data.error || 'Failed to update setting',
          loading: false
        }));
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: 'Failed to update setting',
        loading: false
      }));
      console.error(err);
    }
  }

  if (state.loading) {
    return <div className="text-center p-4">Loading settings...</div>;
  }

  if (state.error) {
    return <div className="text-center text-red-500 p-4">{state.error}</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Setting</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Judging Status</TableCell>
          <TableCell className={state.closed ? "text-red-500 font-semibold" : "text-green-500 font-semibold"}>
            {state.closed ? "CLOSED" : "OPEN"}
          </TableCell>
          <TableCell>
            <Button
              onClick={toggleJudging}
              className={`w-full uppercase ${
                state.closed
                  ? "bg-action-positive text-white hover:bg-action-positive/90"
                  : "bg-action-negative text-white hover:bg-action-negative/90"
              }`}
            >
              {state.closed ? "OPEN JUDGING" : "CLOSE JUDGING"}
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
