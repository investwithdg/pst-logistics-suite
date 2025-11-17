import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { MapPin, Truck, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGetQuote = async () => {
    if (!pickup || !dropoff) {
      toast({
        title: "Missing information",
        description: "Please enter both pickup and dropoff locations",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    toast({
      title: "Calculating route...",
      description: "Please wait while we prepare your quote",
    });

    // Simulate API delay
    setTimeout(() => {
      navigate("/quote", { state: { pickup, dropoff } });
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-primary px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-4xl">
          <div className="rounded-2xl bg-primary p-8 md:p-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Book a delivery in seconds
            </h1>
            <p className="text-lg text-primary-foreground/90 mb-8">
              Start with pickup and dropoff. We'll calculate the distance and pricing instantly.
            </p>

            <div className="bg-background rounded-xl p-6 shadow-lg">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <AddressAutocomplete
                  label="Pickup"
                  value={pickup}
                  onChange={setPickup}
                  placeholder="Enter pickup location"
                  required
                />
                <AddressAutocomplete
                  label="Dropoff"
                  value={dropoff}
                  onChange={setDropoff}
                  placeholder="Enter dropoff location"
                  required
                />
              </div>
              <Button 
                className="w-full md:w-auto px-8"
                size="lg"
                onClick={handleGetQuote}
                disabled={loading || !pickup || !dropoff}
              >
                {loading ? "Calculating..." : "Get quote"}
              </Button>
            </div>

            <p className="text-primary-foreground/80 mt-4">
              Tracking an existing delivery?{" "}
              <a href="/track" className="underline font-medium hover:text-primary-foreground">
                Go to order tracking
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Why Choose Preferred Solutions Transport?
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Professional delivery services with real-time tracking and secure payment processing
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Pickup</h3>
              <p className="text-muted-foreground">
                Schedule pickups from any location with just a few clicks. Simple, fast, and reliable.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <Truck className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-muted-foreground">
                Real-time tracking and efficient routing for quick deliveries. Know where your package is at all times.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
                <Shield className="h-8 w-8 text-warning" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
              <p className="text-muted-foreground">
                Safe and secure payment processing with Stripe. Instant confirmation and receipts.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
