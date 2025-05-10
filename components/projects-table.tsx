import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Sample data for demonstration
const projects = [
  {
    id: 1,
    name: "Lumen",
    location: "Table B1",
    description: "A smart lighting system that adjusts based on natural light levels and user preferences.",
    mu: 1.25,
    sigmaSquared: 0.5,
    votes: 5,
    seen: 8,
    skipped: 2,
    prioritized: false,
    active: true,
  },
  {
    id: 2,
    name: "EcoTrack",
    location: "Table C3",
    description: "An application that helps users track and reduce their carbon footprint.",
    mu: 1.05,
    sigmaSquared: 0.3,
    votes: 4,
    seen: 6,
    skipped: 1,
    prioritized: true,
    active: true,
  },
  {
    id: 3,
    name: "MediSync",
    location: "Table A5",
    description: "A platform for coordinating medical appointments and medication schedules.",
    mu: 0.95,
    sigmaSquared: 0.4,
    votes: 3,
    seen: 5,
    skipped: 0,
    prioritized: false,
    active: false,
  },
]

export function ProjectsTable() {
  return (
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
            <TableCell>{project.sigmaSquared.toFixed(2)}</TableCell>
            <TableCell>{project.votes}</TableCell>
            <TableCell>{project.seen}</TableCell>
            <TableCell>{project.skipped}</TableCell>
            <TableCell className={project.prioritized ? "bg-yellow-50" : ""}>
              <Button
                className={`w-full uppercase ${
                  project.prioritized
                    ? "bg-action-negative text-white hover:bg-action-negative/90"
                    : "bg-action-positive text-white hover:bg-action-positive/90"
                }`}
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
              >
                {project.active ? "DISABLE" : "ENABLE"}
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
