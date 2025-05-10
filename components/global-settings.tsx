import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Sample data for demonstration
const settings = [
  {
    setting: "Closed",
    value: "Open",
    action: "CLOSE",
  },
  {
    setting: "Paused",
    value: "No",
    action: "PAUSE",
  },
]

export function GlobalSettings() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Setting</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Edit</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {settings.map((setting) => (
          <TableRow key={setting.setting}>
            <TableCell className="font-medium">{setting.setting}</TableCell>
            <TableCell>{setting.value}</TableCell>
            <TableCell>
              <Button className="w-full bg-action-negative uppercase text-white hover:bg-action-negative/90">
                {setting.action}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
