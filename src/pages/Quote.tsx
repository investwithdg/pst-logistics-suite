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
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { supabase } from "@/integrations/supabase/client";

const Quote = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addOrder, currentUser } = useApp();
  
  const initialPickup = location.state?.pickup || "";
  const initialDropoff = location.state?.dropoff || "";

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    pickupAddress: initialPickup,
    dropoffAddress: initialDropoff,
    distance: "",
    weight: "35",
    deliverySize: "",
    packageDescription: "",
    specialInstructions: "",
  });

  const [priceBreakdown, setPriceBreakdown] = useState<{
    baseRate: number;
    distanceCharge: number;
    weightCharge: number;
    total: number;
  } | null>(null);

  const calculatePrice = async () => {
    if (!formData.pickupAddress || !formData.dropoffAddress) {
      toast({
        title: "Missing addresses",
        description: "Please enter both pickup and dropoff addresses",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    toast({
      title: "Calculating distance and price...",
      description: "Please wait",
    });

    try {
      // First, calculate accurate distance using Google Maps
      const { data: distanceData, error: distanceError } = await supabase.functions.invoke(
        'calculate-distance',
        {
          body: { 
            origin: formData.pickupAddress, 
            destination: formData.dropoffAddress 
          }
        }
      );

      if (distanceError) throw distanceError;

      const accurateDistance = distanceData?.data?.distance || parseFloat(formData.distance) || 0;

      // Update distance in form
      setFormData(prev => ({ ...prev, distance: accurateDistance.toString() }));

      // Then calculate price with accurate distance
      const response = await api.calculateQuote({
        distance: accurateDistance,
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
          description: `Distance: ${accurateDistance.toFixed(1)} miles • Total: $${response.data.totalPrice.toFixed(2)}`,
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
    if (!priceBreakdown || !formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields including phone number",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Preparing your order...",
      description: "Syncing with HubSpot and preparing payment",
    });

    const parsedWeight = parseFloat(formData.weight || "0");
    const parsedDistance = parseFloat(formData.distance || "0");

    const quotePayload = {
      customer_name: `${formData.firstName} ${formData.lastName}`,
      customer_email: formData.email,
      customer_phone: formData.phone,
      pickup_address: formData.pickupAddress,
      dropoff_address: formData.dropoffAddress,
      delivery_size: formData.deliverySize,
      package_description: formData.packageDescription,
      special_instructions: formData.specialInstructions,
      package_weight: parsedWeight,
      distance: parsedDistance,
      total_price: priceBreakdown.total,
      base_rate: priceBreakdown.baseRate,
      mileage_charge: priceBreakdown.distanceCharge,
      surcharge: priceBreakdown.weightCharge,
    };

    const legacyQuotePayload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      pickupAddress: formData.pickupAddress,
      dropoffAddress: formData.dropoffAddress,
      amount: priceBreakdown.total,
      deliverySize: formData.deliverySize,
      packageDescription: formData.packageDescription,
      specialInstructions: formData.specialInstructions,
      weight: parsedWeight,
      distance: parsedDistance,
    };

    const fallbackHubspotSync = async () => {
      try {
        const { error } = await supabase.functions.invoke('sync-hubspot-quote', {
          body: legacyQuotePayload,
        });
        if (error) throw error;
        console.log('[Quote] Legacy HubSpot sync via Supabase succeeded');
      } catch (legacyError) {
        console.error('[Quote] Legacy HubSpot sync via Supabase failed', legacyError);
      }
    };

    const legacyApiHubspotSync = async () => {
      // Legacy sync removed - using quote-accepted webhook only
      return null;
    };

    try {
      // First, notify Make.com (Quote Accepted) to create contact + deal
      let hubspotDealId = null;
      try {
        console.log('[Quote] Starting HubSpot sync via quote-accepted webhook...');
        const quoteSync = await api.quoteAccepted(quotePayload);
        console.log('[Quote] quote-accepted response:', quoteSync);
        
        const hubspotId = quoteSync.success ? quoteSync.data?.hubspot_deal_id : null;

        if (hubspotId) {
          hubspotDealId = hubspotId;
          console.log('[Quote] HubSpot deal created:', hubspotDealId);
        } else {
          console.warn('[Quote] quote-accepted webhook missing hubspot_deal_id, attempting legacy sync...');
          const legacyDealId = await legacyApiHubspotSync();
          if (legacyDealId) {
            hubspotDealId = legacyDealId;
            console.log('[Quote] Legacy HubSpot deal created:', hubspotDealId);
          } else {
            await fallbackHubspotSync();
          }
        }
      } catch (error) {
        console.warn('[Quote] Failed to sync to HubSpot via quote-accepted webhook:', error);
        const legacyDealId = await legacyApiHubspotSync();
        if (legacyDealId) {
          hubspotDealId = legacyDealId;
          console.log('[Quote] Legacy HubSpot deal created after error:', hubspotDealId);
        } else {
          await fallbackHubspotSync();
        }
      }

      console.log('[Quote] Preparing payment with data:', {
        hubspotDealId,
        deliverySize: formData.deliverySize,
      });

      // Now proceed with payment, including the HubSpot deal ID and all three distinct fields
      const response = await api.processPayment({
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        pickupAddress: formData.pickupAddress,
        dropoffAddress: formData.dropoffAddress,
        distance: parsedDistance,
        packageWeight: parsedWeight,
        deliverySize: formData.deliverySize,
        packageDescription: formData.packageDescription,
        specialInstructions: formData.specialInstructions,
        amount: priceBreakdown.total,
        baseRate: priceBreakdown.baseRate,
        mileageCharge: priceBreakdown.distanceCharge,
        surcharge: priceBreakdown.weightCharge,
        hubspotDealId: hubspotDealId,
      });

      console.log('[Quote] Payment API response:', response);
      console.log('[Quote] Response type:', typeof response);
      console.log('[Quote] Response.success:', response?.success);
      console.log('[Quote] Response.url:', response?.url);

      if (response.success && response.url) {
        console.log('[Quote] ✅ Redirecting to Stripe:', response.url);
        // Redirect to Stripe Checkout - page will navigate away
        window.location.href = response.url;
      } else {
        console.error('[Quote] ❌ Invalid response:', response);
        throw new Error(response.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment setup failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
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
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      First Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Last Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
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
                <AddressAutocomplete
                  label="Pickup Address"
                  value={formData.pickupAddress}
                  onChange={(value) => setFormData({ ...formData, pickupAddress: value })}
                  placeholder="Enter pickup address"
                  required
                />

                <AddressAutocomplete
                  label="Dropoff Address"
                  value={formData.dropoffAddress}
                  onChange={(value) => setFormData({ ...formData, dropoffAddress: value })}
                  placeholder="Enter dropoff address"
                  required
                />

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
                    Delivery Size <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="e.g., Small, Medium, Large"
                    value={formData.deliverySize}
                    onChange={(e) => setFormData({ ...formData, deliverySize: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Package Description <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="e.g., Documents, Electronics, Furniture"
                    value={formData.packageDescription}
                    onChange={(e) => setFormData({ ...formData, packageDescription: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Special Delivery Instructions
                  </label>
                  <Input
                    placeholder="e.g., Fragile, handle with care"
                    value={formData.specialInstructions}
                    onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                  />
                </div>

                <Button 
                  onClick={calculatePrice} 
                  className="w-full" 
                  size="lg"
                  disabled={loading || !formData.pickupAddress || !formData.dropoffAddress}
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
