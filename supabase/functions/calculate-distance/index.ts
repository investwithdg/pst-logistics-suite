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
    const { origin, destination } = await req.json();

    if (!origin || !destination) {
      return new Response(
        JSON.stringify({ success: false, error: 'Origin and destination are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not configured');
    }

    // Call Google Maps Distance Matrix API
    const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
    url.searchParams.append('origins', origin);
    url.searchParams.append('destinations', destination);
    url.searchParams.append('key', GOOGLE_MAPS_API_KEY);
    url.searchParams.append('units', 'imperial');

    console.log('[calculate-distance] Calling Google Maps API');

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('[calculate-distance] API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to calculate distance' }),
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

    // Extract distance in miles and duration
    const distanceInMiles = element.distance.value / 1609.34; // Convert meters to miles
    const durationInMinutes = element.duration.value / 60; // Convert seconds to minutes

    console.log('[calculate-distance] Distance:', distanceInMiles, 'miles, Duration:', durationInMinutes, 'minutes');

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          distance: Math.round(distanceInMiles * 10) / 10, // Round to 1 decimal
          duration: Math.round(durationInMinutes),
          distanceText: element.distance.text,
          durationText: element.duration.text,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[calculate-distance] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
