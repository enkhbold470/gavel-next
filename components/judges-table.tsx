import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Sample data for demonstration
const judges = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex@example.com",
    description: "AI/ML Specialist",
    votes: 12,
    nextId: 5,
    previousId: 3,
    updated: "2023-10-15 14:30",
    active: true,
  },
  {
    id: 2,
    name: "Sam Taylor",
    email: "sam@example.com",
    description: "Web Development Expert",
    votes: 8,
    nextId: 4,
    previousId: 1,
    updated: "2023-10-15 14:15",
    active: true,
  },
  {
    id: 3,
    name: "Jordan Lee",
    email: "jordan@example.com",
    description: "Hardware Specialist",
    votes: 10,
    nextId: 2,
    previousId: null,
    updated: "2023-10-15 13:45",
    active: false,
  },
]

export function JudgesTable() {
  return (
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
            <TableCell>{judge.description}</TableCell>
            <TableCell>{judge.votes}</TableCell>
            <TableCell>{judge.nextId || "-"}</TableCell>
            <TableCell>{judge.previousId || "-"}</TableCell>
            <TableCell>{judge.updated}</TableCell>
            <TableCell>
              <Button className="w-full bg-action-positive uppercase text-white hover:bg-action-positive/90">
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
              >
                {judge.active ? "DISABLE" : "ENABLE"}
              </Button>
            </TableCell>
            <TableCell>
              <Button className="w-full bg-action-negative uppercase text-white hover:bg-action-negative/90">
                DELETE
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
