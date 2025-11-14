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
    // Verify admin role
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error("Not authenticated");
    }

    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      throw new Error("Not authorized");
    }

    const { email, password, role, name, phone, vehicleType, vehiclePlate, licenseNumber } = await req.json();

    console.log('[admin-create-user] Creating user:', { email, role });

    // Create user with admin API
    const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: { name }
    });

    if (createError || !newUser.user) {
      throw createError || new Error('Failed to create user');
    }

    // Insert role
    const { error: roleError } = await supabaseClient
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role
      });

    if (roleError) {
      console.error('[admin-create-user] Error creating role:', roleError);
      // Try to delete the user if role creation fails
      await supabaseClient.auth.admin.deleteUser(newUser.user.id);
      throw roleError;
    }

    // If driver role, create driver record
    if (role === 'driver') {
      const { error: driverError } = await supabaseClient
        .from('drivers')
        .insert({
          id: newUser.user.id,
          name,
          email,
          phone,
          vehicle_type: vehicleType,
          vehicle_plate: vehiclePlate,
          license_number: licenseNumber,
          status: 'offline'
        });

      if (driverError) {
        console.error('[admin-create-user] Error creating driver:', driverError);
        // Clean up user and role
        await supabaseClient.auth.admin.deleteUser(newUser.user.id);
        throw driverError;
      }
    }

    console.log('[admin-create-user] User created successfully:', newUser.user.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: newUser.user.id,
        email: newUser.user.email
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[admin-create-user] Error:', error);
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
