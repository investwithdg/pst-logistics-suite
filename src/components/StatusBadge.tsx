import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/types";

interface StatusBadgeProps {
  status: OrderStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
    'pending': { label: 'Pending', className: 'bg-muted text-muted-foreground' },
    'assigned': { label: 'Assigned', className: 'bg-info/10 text-info border-info/20' },
    'picked-up': { label: 'Picked Up', className: 'bg-warning/10 text-warning border-warning/20' },
    'in-transit': { label: 'In Transit', className: 'bg-info/10 text-info border-info/20' },
    'delivered': { label: 'Delivered', className: 'bg-success/10 text-success border-success/20' },
    'completed': { label: 'Completed', className: 'bg-success/10 text-success border-success/20' },
  };

  const config = statusConfig[status];

  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
