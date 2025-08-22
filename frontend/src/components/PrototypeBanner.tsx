import { Wrench } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function PrototypeBanner() {
  return (
    <Alert className="rounded-none border-x-0 border-t-0 border-b border-accent/20 bg-accent/5">
      <Wrench className="h-4 w-4" />
      <AlertDescription>
        This is a functional prototype for the Avalanche Privacy Hackathon. The platform is under active development.
      </AlertDescription>
    </Alert>
  )
}
