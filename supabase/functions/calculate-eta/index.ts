import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { driverLocation, destination } = await req.json();

    if (!driverLocation || !destination) {
      return new Response(
        JSON.stringify({ success: false, error: 'Driver location and destination are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not configured');
    }

    // Call Google Maps Distance Matrix API with traffic model
    const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
    url.searchParams.append('origins', driverLocation);
    url.searchParams.append('destinations', destination);
    url.searchParams.append('key', GOOGLE_MAPS_API_KEY);
    url.searchParams.append('departure_time', 'now');
    url.searchParams.append('traffic_model', 'best_guess');
    url.searchParams.append('units', 'imperial');

    console.log('[calculate-eta] Calling Google Maps Distance Matrix API with traffic data');

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('[calculate-eta] API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to calculate ETA' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const element = data.rows[0]?.elements[0];
    if (element?.status !== 'OK') {
      return new Response(
        JSON.stringify({ success: false, error: 'Route not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Extract duration in traffic (real-time with traffic conditions)
    const durationInTraffic = element.duration_in_traffic || element.duration;
    const durationInMinutes = durationInTraffic.value / 60;
    const distanceInMiles = element.distance.value / 1609.34;

    // Calculate estimated arrival time
    const etaDate = new Date(Date.now() + durationInTraffic.value * 1000);

    console.log('[calculate-eta] ETA calculated:', {
      distance: distanceInMiles.toFixed(1),
      duration: durationInMinutes.toFixed(0),
      eta: etaDate.toLocaleTimeString(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          distance: Math.round(distanceInMiles * 10) / 10,
          durationMinutes: Math.round(durationInMinutes),
          durationText: durationInTraffic.text,
          distanceText: element.distance.text,
          eta: etaDate.toISOString(),
          etaFormatted: etaDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }),
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[calculate-eta] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
