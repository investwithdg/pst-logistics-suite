import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    console.log('[seed-test-users] Starting user creation...');

    const users = [
      // Admin
      { email: 'admin@swiftcourier.com', password: 'admin123', role: 'admin', name: 'Admin User' },
      
      // Dispatcher
      { email: 'dispatcher@swiftcourier.com', password: 'dispatch123', role: 'dispatcher', name: 'Sarah Johnson' },
      
      // Drivers
      { email: 'driver1@swiftcourier.com', password: 'driver123', role: 'driver', name: 'Mike Rodriguez', phone: '555-0101', vehicleType: 'van', vehiclePlate: 'ABC-1234', licenseNumber: 'DL123456' },
      { email: 'driver2@swiftcourier.com', password: 'driver123', role: 'driver', name: 'James Chen', phone: '555-0102', vehicleType: 'truck', vehiclePlate: 'DEF-5678', licenseNumber: 'DL234567' },
      { email: 'driver3@swiftcourier.com', password: 'driver123', role: 'driver', name: 'Maria Garcia', phone: '555-0103', vehicleType: 'van', vehiclePlate: 'GHI-9012', licenseNumber: 'DL345678' },
      { email: 'driver4@swiftcourier.com', password: 'driver123', role: 'driver', name: 'David Thompson', phone: '555-0104', vehicleType: 'car', vehiclePlate: 'JKL-3456', licenseNumber: 'DL456789' },
      
      // Customers
      { email: 'customer1@example.com', password: 'customer123', role: 'customer', name: 'Emily Watson' },
      { email: 'customer2@example.com', password: 'customer123', role: 'customer', name: 'Robert Martinez' },
      { email: 'customer3@example.com', password: 'customer123', role: 'customer', name: 'Jennifer Lee' },
      { email: 'customer4@example.com', password: 'customer123', role: 'customer', name: 'Christopher Brown' },
    ];

    const results = [];

    for (const userData of users) {
      try {
        console.log(`[seed-test-users] Creating user: ${userData.email}`);

        // Create user with admin API
        const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
          user_metadata: { name: userData.name }
        });

        if (createError || !newUser.user) {
          console.error(`[seed-test-users] Error creating ${userData.email}:`, createError);
          results.push({ email: userData.email, status: 'failed', error: createError?.message });
          continue;
        }

        // Insert role
        const { error: roleError } = await supabaseClient
          .from('user_roles')
          .insert({
            user_id: newUser.user.id,
            role: userData.role
          });

        if (roleError) {
          console.error(`[seed-test-users] Error creating role for ${userData.email}:`, roleError);
          results.push({ email: userData.email, status: 'failed', error: roleError.message });
          continue;
        }

        // If driver role, create driver record
        if (userData.role === 'driver') {
          const { error: driverError } = await supabaseClient
            .from('drivers')
            .insert({
              id: newUser.user.id,
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              vehicle_type: userData.vehicleType,
              vehicle_plate: userData.vehiclePlate,
              license_number: userData.licenseNumber,
              status: 'offline'
            });

          if (driverError) {
            console.error(`[seed-test-users] Error creating driver for ${userData.email}:`, driverError);
            results.push({ email: userData.email, status: 'failed', error: driverError.message });
            continue;
          }
        }

        console.log(`[seed-test-users] Successfully created: ${userData.email}`);
        results.push({ email: userData.email, status: 'success', user_id: newUser.user.id });

      } catch (error) {
        console.error(`[seed-test-users] Exception for ${userData.email}:`, error);
        results.push({ 
          email: userData.email, 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        summary: {
          total: users.length,
          successful: results.filter(r => r.status === 'success').length,
          failed: results.filter(r => r.status === 'failed').length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[seed-test-users] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
