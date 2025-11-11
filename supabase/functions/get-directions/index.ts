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

    // Call Google Maps Directions API
    const url = new URL('https://maps.googleapis.com/maps/api/directions/json');
    url.searchParams.append('origin', origin);
    url.searchParams.append('destination', destination);
    url.searchParams.append('key', GOOGLE_MAPS_API_KEY);

    console.log('[get-directions] Calling Google Maps Directions API');

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('[get-directions] API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to get directions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const route = data.routes[0];
    if (!route) {
      return new Response(
        JSON.stringify({ success: false, error: 'No route found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Extract polyline points and other useful data
    const polyline = route.overview_polyline.points;
    const bounds = route.bounds;
    const legs = route.legs[0];

    console.log('[get-directions] Route found:', legs.distance.text, legs.duration.text);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          polyline,
          bounds,
          distance: legs.distance.text,
          duration: legs.duration.text,
          startAddress: legs.start_address,
          endAddress: legs.end_address,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[get-directions] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
