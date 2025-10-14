import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const ALLOWED_ORIGINS = [
  "http://localhost:8080",
  "https://geekfgpgzqrdedzwhvei.supabase.co",
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
};

const logStep = (step: string, details?: any) => {
  const isProduction = Deno.env.get("ENVIRONMENT") === "production";
  
  if (isProduction && details) {
    const sanitized = { ...details };
    delete sanitized.userId;
    console.log(`[ANALYZE-INVESTMENT] ${step} - ${JSON.stringify(sanitized)}`);
  } else {
    const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
    console.log(`[ANALYZE-INVESTMENT] ${step}${detailsStr}`);
  }
};

// Financial calculation helpers
const calculateIRR = (cashFlows: number[]): number => {
  // Newton-Raphson method for IRR calculation
  let rate = 0.1; // Initial guess
  const maxIterations = 100;
  const tolerance = 0.00001;
  
  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;
    
    for (let j = 0; j < cashFlows.length; j++) {
      npv += cashFlows[j] / Math.pow(1 + rate, j);
      dnpv -= j * cashFlows[j] / Math.pow(1 + rate, j + 1);
    }
    
    const newRate = rate - npv / dnpv;
    
    if (Math.abs(newRate - rate) < tolerance) {
      return newRate * 100; // Return as percentage
    }
    
    rate = newRate;
  }
  
  return rate * 100;
};

const calculateNPV = (discountRate: number, cashFlows: number[]): number => {
  return cashFlows.reduce((acc, cf, index) => {
    return acc + cf / Math.pow(1 + discountRate, index);
  }, 0);
};

const calculatePaybackPeriod = (initialInvestment: number, annualCashFlows: number[]): number => {
  let cumulative = initialInvestment; // Negative value
  
  for (let i = 0; i < annualCashFlows.length; i++) {
    cumulative += annualCashFlows[i];
    if (cumulative >= 0) {
      // Linear interpolation for fractional year
      const previousCumulative = cumulative - annualCashFlows[i];
      const fraction = Math.abs(previousCumulative) / annualCashFlows[i];
      return i + fraction;
    }
  }
  
  return annualCashFlows.length; // Didn't pay back within period
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
    return new Response(JSON.stringify({ error: "Invalid origin" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 403,
    });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Authentication failed");
    
    const userId = userData.user.id;
    logStep("User authenticated", { userId });

    const body = await req.json();
    const {
      property_id,
      purchase_price,
      down_payment_percent,
      loan_interest_rate,
      loan_term_years,
      annual_rental_income,
      vacancy_rate = 5.0,
      annual_operating_expenses,
      annual_property_appreciation = 3.0,
      holding_period_years = 5,
    } = body;

    logStep("Input parameters received", { purchase_price, holding_period_years });

    // Calculate loan details
    const downPayment = purchase_price * (down_payment_percent / 100);
    const loanAmount = purchase_price - downPayment;
    const monthlyRate = loan_interest_rate / 100 / 12;
    const numPayments = loan_term_years * 12;
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                          (Math.pow(1 + monthlyRate, numPayments) - 1);
    const annualDebtService = monthlyPayment * 12;

    // Calculate annual cash flows
    const effectiveRentalIncome = annual_rental_income * (1 - vacancy_rate / 100);
    const annualNOI = effectiveRentalIncome - annual_operating_expenses;
    const annualCashFlow = annualNOI - annualDebtService;

    // Calculate Cap Rate
    const capRate = (annualNOI / purchase_price) * 100;

    // Calculate Cash on Cash Return
    const cashOnCashReturn = (annualCashFlow / downPayment) * 100;

    // Build cash flow array for IRR/NPV
    const cashFlows = [-downPayment]; // Initial investment (negative)
    for (let year = 1; year <= holding_period_years; year++) {
      const yearlyAppreciation = Math.pow(1 + annual_property_appreciation / 100, year);
      const yearCashFlow = annualCashFlow * yearlyAppreciation;
      
      if (year === holding_period_years) {
        // Add sale proceeds in final year
        const futureValue = purchase_price * yearlyAppreciation;
        const remainingLoan = loanAmount; // Simplified - not accounting for principal paydown
        const saleProceeds = futureValue - remainingLoan;
        cashFlows.push(yearCashFlow + saleProceeds);
      } else {
        cashFlows.push(yearCashFlow);
      }
    }

    // Calculate IRR
    const irr = calculateIRR(cashFlows);

    // Calculate NPV (using 8% discount rate as standard)
    const discountRate = 0.08;
    const npv = calculateNPV(discountRate, cashFlows);

    // Calculate Payback Period
    const paybackPeriod = calculatePaybackPeriod(-downPayment, cashFlows.slice(1));

    logStep("Financial metrics calculated", { irr, npv, capRate });

    // Get AI analysis
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiPrompt = `Analyze this real estate investment opportunity and provide insights:

Purchase Price: $${purchase_price.toLocaleString()}
Down Payment: ${down_payment_percent}% ($${downPayment.toLocaleString()})
Loan: ${loan_interest_rate}% for ${loan_term_years} years
Annual Rental Income: $${annual_rental_income.toLocaleString()}
Vacancy Rate: ${vacancy_rate}%
Operating Expenses: $${annual_operating_expenses.toLocaleString()}
Holding Period: ${holding_period_years} years

Calculated Metrics:
- IRR: ${irr.toFixed(2)}%
- NPV: $${npv.toLocaleString()}
- Cap Rate: ${capRate.toFixed(2)}%
- Cash on Cash Return: ${cashOnCashReturn.toFixed(2)}%
- Payback Period: ${paybackPeriod.toFixed(1)} years
- Annual Cash Flow: $${annualCashFlow.toLocaleString()}

Provide:
1. A risk score (1-100, where 100 is highest risk)
2. A concise summary of the investment quality
3. Key recommendations for the investor
4. Market conditions assessment`;

    logStep("Calling AI for analysis");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a real estate investment analyst. Provide clear, actionable insights. Format your response as JSON with fields: risk_score (number 1-100), summary (string), recommendations (string), market_conditions (string)."
          },
          {
            role: "user",
            content: aiPrompt
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      logStep("AI API error", { status: aiResponse.status, error: errorText });
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = JSON.parse(aiData.choices[0].message.content);
    
    logStep("AI analysis complete", { risk_score: aiContent.risk_score });

    // Generate scenario analysis
    const scenarios = {
      optimistic: {
        appreciation: annual_property_appreciation + 2,
        vacancy: Math.max(0, vacancy_rate - 2),
        description: "Best case scenario with higher appreciation and lower vacancy"
      },
      pessimistic: {
        appreciation: Math.max(0, annual_property_appreciation - 2),
        vacancy: vacancy_rate + 3,
        description: "Worst case scenario with lower appreciation and higher vacancy"
      },
      base: {
        appreciation: annual_property_appreciation,
        vacancy: vacancy_rate,
        description: "Current assumptions"
      }
    };

    // Store analysis in database
    const { data: analysis, error: insertError } = await supabaseClient
      .from("investment_analyses")
      .insert({
        user_id: userId,
        property_id,
        purchase_price,
        down_payment_percent,
        loan_interest_rate,
        loan_term_years,
        annual_rental_income,
        vacancy_rate,
        annual_operating_expenses,
        annual_property_appreciation,
        holding_period_years,
        irr,
        npv,
        cap_rate: capRate,
        cash_on_cash_return: cashOnCashReturn,
        payback_period_years: paybackPeriod,
        risk_score: aiContent.risk_score,
        ai_summary: aiContent.summary,
        ai_recommendations: aiContent.recommendations,
        market_conditions: aiContent.market_conditions,
        scenarios,
      })
      .select()
      .single();

    if (insertError) {
      logStep("Database insert error", { error: insertError });
      throw insertError;
    }

    logStep("Analysis stored successfully", { analysisId: analysis.id });

    return new Response(JSON.stringify({ 
      success: true,
      analysis 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
