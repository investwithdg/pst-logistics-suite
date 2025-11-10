import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, MapPin, TrendingUp, Package, Calculator } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";
import { api } from "@/lib/api";
import { Order } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";

const Quote = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addOrder, currentUser } = useApp();
  
  const initialPickup = location.state?.pickup || "";
  const initialDropoff = location.state?.dropoff || "";

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || "",
    email: "",
    phone: "",
    pickupAddress: initialPickup,
    dropoffAddress: initialDropoff,
    distance: "",
    weight: "35",
    packageDescription: "",
  });

  const [priceBreakdown, setPriceBreakdown] = useState<{
    baseRate: number;
    distanceCharge: number;
    weightCharge: number;
    total: number;
  } | null>(null);

  const calculatePrice = async () => {
    if (!formData.distance || parseFloat(formData.distance) <= 0) {
      toast({
        title: "Invalid distance",
        description: "Please enter a valid distance",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    toast({
      title: "Calculating price...",
      description: "Please wait",
    });

    try {
      const response = await api.calculateQuote({
        distance: parseFloat(formData.distance),
        packageWeight: parseFloat(formData.weight || "0"),
      });

      if (response.success && response.data) {
        setPriceBreakdown({
          baseRate: response.data.baseRate,
          distanceCharge: response.data.mileageCharge,
          weightCharge: response.data.surcharge,
          total: response.data.totalPrice,
        });
        
        toast({
          title: "Price calculated",
          description: `Total: $${response.data.totalPrice.toFixed(2)}`,
        });
      }
    } catch (error) {
      toast({
        title: "Calculation failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (!priceBreakdown || !formData.fullName || !formData.email) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    toast({
      title: "Processing payment...",
      description: "Please wait while we process your order",
    });

    try {
      const response = await api.processPayment({
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        pickupAddress: formData.pickupAddress,
        dropoffAddress: formData.dropoffAddress,
        distance: parseFloat(formData.distance),
        packageWeight: parseFloat(formData.weight || "0"),
        packageDescription: formData.packageDescription || "Package delivery",
        amount: priceBreakdown.total,
      });

      if (response.success && response.data) {
        // Create order
        const newOrder: Order = {
          id: response.data.orderId,
          customerId: currentUser?.id || "C1",
          customerName: formData.fullName,
          customerPhone: formData.phone,
          pickupAddress: formData.pickupAddress,
          dropoffAddress: formData.dropoffAddress,
          distance: parseFloat(formData.distance),
          packageWeight: parseFloat(formData.weight || "0"),
          packageDescription: formData.packageDescription || "Package delivery",
          status: "pending",
          createdAt: new Date().toISOString(),
          baseRate: priceBreakdown.baseRate,
          mileageCharge: priceBreakdown.distanceCharge,
          surcharge: priceBreakdown.weightCharge,
          totalPrice: priceBreakdown.total,
        };

        addOrder(newOrder);

        toast({
          title: "Order created successfully!",
          description: `Order ${response.data.orderId} is pending assignment`,
        });

        navigate("/thank-you", { state: { orderId: response.data.orderId } });
      }
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <nav className="text-sm text-muted-foreground mb-4">
            Home / <span className="text-foreground">Request Quote</span>
          </nav>
          <h1 className="text-3xl font-bold mb-2">Get a Delivery Quote</h1>
          <p className="text-muted-foreground">Fill in your delivery details and get an instant price estimate</p>
        </div>

        {loading && <LoadingSpinner message="Processing your request..." />}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Customer Information
                </CardTitle>
                <p className="text-sm text-muted-foreground">Provide your contact details for order updates</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Phone <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Delivery Details
                </CardTitle>
                <p className="text-sm text-muted-foreground">Enter pickup and dropoff locations</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Pickup Address <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter pickup address"
                      value={formData.pickupAddress}
                      onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Dropoff Address <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter dropoff address"
                      value={formData.dropoffAddress}
                      onChange={(e) => setFormData({ ...formData, dropoffAddress: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Distance (miles) <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={formData.distance}
                        onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Weight (lbs) <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Package Description
                  </label>
                  <Input
                    placeholder="e.g., Office supplies, Documents, etc."
                    value={formData.packageDescription}
                    onChange={(e) => setFormData({ ...formData, packageDescription: e.target.value })}
                  />
                </div>

                <Button 
                  onClick={calculatePrice} 
                  className="w-full" 
                  size="lg"
                  disabled={loading || !formData.distance}
                >
                  {loading ? "Calculating..." : "Calculate Price"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Price Breakdown */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Price Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!priceBreakdown ? (
                  <div className="text-center py-12">
                    <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Fill in the delivery details and click "Calculate Price" to see pricing
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Base Rate</span>
                        <span className="font-medium">${priceBreakdown.baseRate.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Distance ({formData.distance} mi)</span>
                        <span className="font-medium">${priceBreakdown.distanceCharge.toFixed(2)}</span>
                      </div>
                      {priceBreakdown.weightCharge > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Surcharge</span>
                          <span className="font-medium">${priceBreakdown.weightCharge.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-2xl font-bold text-primary">
                          ${priceBreakdown.total.toFixed(2)}
                        </span>
                      </div>
                      <Button 
                        onClick={handlePayNow} 
                        className="w-full" 
                        size="lg"
                        disabled={loading}
                      >
                        {loading ? "Processing..." : "Pay Now"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quote;
