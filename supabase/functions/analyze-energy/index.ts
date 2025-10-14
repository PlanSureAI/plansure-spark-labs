import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const analysisData = await req.json();
    console.log('Analyzing energy for building:', analysisData.building_type);

    // Prepare AI prompt for energy analysis
    const prompt = `You are an expert energy analyst specializing in zero carbon, zero energy bill homes.

Analyze this building and provide detailed energy forecasting:

Building Details:
- Type: ${analysisData.building_type}
- Floor Area: ${analysisData.floor_area_sqft} sq ft
- Year Built: ${analysisData.year_built || 'Unknown'}
- Insulation: ${analysisData.insulation_quality || 'Standard'}
- Heating: ${analysisData.heating_system || 'Traditional'}
- Cooling: ${analysisData.cooling_system || 'Traditional'}
- Climate Zone: ${analysisData.climate_zone || 'Temperate'}
- Annual Sunshine: ${analysisData.annual_sunshine_hours || 2000} hours

Current Energy Usage:
- Annual Energy: ${analysisData.current_annual_energy_kwh || 'Unknown'} kWh
- Annual Cost: £${analysisData.current_annual_cost || 'Unknown'}
- Annual Carbon: ${analysisData.current_annual_carbon_kg || 'Unknown'} kg CO2

Proposed Upgrades:
- Solar Panels: ${analysisData.solar_panel_kw || 0} kW
- Heat Pump: ${analysisData.heat_pump_installed ? 'Yes' : 'No'}
- Insulation Upgrade: ${analysisData.insulation_upgrade ? 'Yes' : 'No'}
- Smart Controls: ${analysisData.smart_controls ? 'Yes' : 'No'}
- Battery Storage: ${analysisData.battery_storage_kwh || 0} kWh

Provide a comprehensive analysis including:
1. Forecast annual energy consumption (kWh) after upgrades
2. Forecast annual energy cost (£) after upgrades
3. Forecast annual carbon emissions (kg CO2) after upgrades
4. Energy savings percentage
5. Annual cost savings (£)
6. Carbon reduction (kg CO2)
7. Total upgrade cost estimate (£)
8. Payback period (years)
9. 20-year ROI (%)
10. Potential government incentives (£)
11. Sustainability score (0-100)
12. Green certification readiness (None/BREEAM/PassivHaus/Zero Carbon)
13. Embodied carbon from upgrades (kg CO2)
14. Operational carbon after upgrades (kg CO2)

Return ONLY a valid JSON object with these exact fields:
{
  "forecast_annual_energy_kwh": number,
  "forecast_annual_cost": number,
  "forecast_annual_carbon_kg": number,
  "forecast_energy_savings_percent": number,
  "forecast_cost_savings_annual": number,
  "forecast_carbon_reduction_kg": number,
  "total_upgrade_cost": number,
  "annual_savings": number,
  "payback_period_years": number,
  "roi_20_year": number,
  "government_incentives": number,
  "sustainability_score": number,
  "green_certification_readiness": string,
  "embodied_carbon_kg": number,
  "operational_carbon_kg": number,
  "ai_summary": "brief summary",
  "ai_recommendations": "detailed recommendations",
  "improvement_priorities": [{"priority": string, "action": string, "impact": string}]
}`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert energy analyst. Always return valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;
    
    // Parse AI response
    let aiResults;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      aiResults = JSON.parse(jsonMatch ? jsonMatch[0] : aiContent);
    } catch (e) {
      console.error('Failed to parse AI response:', aiContent);
      throw new Error('Failed to parse AI analysis results');
    }

    // Save to database
    const { data: analysis, error: insertError } = await supabaseClient
      .from('energy_analyses')
      .insert({
        user_id: user.id,
        workspace_id: analysisData.workspace_id || null,
        property_id: analysisData.property_id || null,
        building_type: analysisData.building_type,
        floor_area_sqft: analysisData.floor_area_sqft,
        year_built: analysisData.year_built,
        insulation_quality: analysisData.insulation_quality,
        heating_system: analysisData.heating_system,
        cooling_system: analysisData.cooling_system,
        climate_zone: analysisData.climate_zone,
        annual_sunshine_hours: analysisData.annual_sunshine_hours,
        current_annual_energy_kwh: analysisData.current_annual_energy_kwh,
        current_annual_cost: analysisData.current_annual_cost,
        current_annual_carbon_kg: analysisData.current_annual_carbon_kg,
        solar_panel_kw: analysisData.solar_panel_kw,
        heat_pump_installed: analysisData.heat_pump_installed,
        insulation_upgrade: analysisData.insulation_upgrade,
        smart_controls: analysisData.smart_controls,
        battery_storage_kwh: analysisData.battery_storage_kwh,
        ...aiResults,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw insertError;
    }

    console.log('Energy analysis completed:', analysis.id);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-energy function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
