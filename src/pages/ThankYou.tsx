import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const ThankYou = () => {
  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation />
      
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card>
          <CardContent className="pt-12 pb-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-6">
              <CheckCircle className="h-12 w-12 text-success" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
            <p className="text-muted-foreground mb-2">
              Your delivery has been scheduled successfully.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Order #<span className="font-mono font-medium">DEL-2025-001</span>
            </p>

            <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold mb-4">What's next?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>A confirmation email has been sent to your inbox</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Our dispatcher will assign a driver shortly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>You'll receive real-time updates via email and SMS</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Track your delivery anytime using your order number</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/track">
                <Button variant="default" size="lg">
                  Track My Order
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" size="lg">
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ThankYou;
