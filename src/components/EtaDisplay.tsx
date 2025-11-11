import { Clock, Navigation } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface EtaDisplayProps {
  eta: { minutes: number; formatted: string } | null;
  driverName?: string;
}

export const EtaDisplay = ({ eta, driverName }: EtaDisplayProps) => {
  if (!eta) return null;

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Navigation className="h-4 w-4" />
              <span>Estimated Arrival</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">{eta.formatted}</span>
              <span className="text-lg text-muted-foreground">
                ({eta.minutes} min)
              </span>
            </div>
            {driverName && (
              <p className="text-sm text-muted-foreground">
                Driver: {driverName}
              </p>
            )}
          </div>
          <div className="bg-primary/10 p-4 rounded-full">
            <Clock className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          Updated in real-time based on traffic conditions
        </div>
      </CardContent>
    </Card>
  );
};
