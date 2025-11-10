import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusBadge from "./StatusBadge";
import { Order } from "@/types";
import { MapPin, User, Phone, Package } from "lucide-react";

interface OrderCardProps {
  order: Order;
  role: "customer" | "dispatcher" | "driver";
  onAction?: (action: string, order: Order) => void;
}

const OrderCard = ({ order, role, onAction }: OrderCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg mb-1">{order.id}</h3>
            <StatusBadge status={order.status} />
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">${order.totalPrice}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex gap-2">
            <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Pickup</p>
              <p className="text-sm text-muted-foreground">{order.pickupAddress}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <MapPin className="h-5 w-5 text-success flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Dropoff</p>
              <p className="text-sm text-muted-foreground">{order.dropoffAddress}</p>
            </div>
          </div>

          {role !== "customer" && (
            <div className="flex gap-2">
              <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">{order.customerName}</p>
                <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
              </div>
            </div>
          )}

          {order.driverName && (
            <div className="flex gap-2">
              <User className="h-5 w-5 text-info flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Driver: {order.driverName}</p>
                <p className="text-sm text-muted-foreground">{order.driverPhone}</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Package className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                {order.packageWeight}lbs - {order.packageDescription}
              </p>
            </div>
          </div>
        </div>

        {onAction && (
          <div className="flex gap-2">
            {role === "customer" && order.status === "pending" && (
              <Button onClick={() => onAction("pay", order)} className="flex-1">
                Pay Now
              </Button>
            )}
            {role === "customer" && order.status !== "pending" && (
              <Button onClick={() => onAction("track", order)} variant="outline" className="flex-1">
                Track Order
              </Button>
            )}
            {role === "dispatcher" && order.status === "pending" && (
              <Button onClick={() => onAction("assign", order)} className="flex-1">
                Assign Driver
              </Button>
            )}
            {role === "dispatcher" && (
              <Button onClick={() => onAction("view", order)} variant="outline" className="flex-1">
                View Details
              </Button>
            )}
            {role === "driver" && (
              <>
                {order.status === "assigned" && (
                  <Button onClick={() => onAction("pickup", order)} className="flex-1">
                    Mark Picked Up
                  </Button>
                )}
                {order.status === "picked-up" && (
                  <Button onClick={() => onAction("transit", order)} className="flex-1">
                    Start Transit
                  </Button>
                )}
                {order.status === "in-transit" && (
                  <Button onClick={() => onAction("deliver", order)} className="flex-1">
                    Mark Delivered
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderCard;
