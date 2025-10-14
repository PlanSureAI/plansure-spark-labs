import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  invitee_email: string;
  invitee_name: string | null;
  workspace_name: string;
  inviter_name: string;
  inviter_email: string;
  role: string;
  workspace_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-workspace-invitation: Function invoked");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Create Supabase client with user's auth token
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const {
      invitee_email,
      invitee_name,
      workspace_name,
      inviter_name,
      inviter_email,
      role,
      workspace_id,
    }: InvitationRequest = await req.json();

    console.log("Sending invitation email to:", invitee_email);

    const appUrl = Deno.env.get("SUPABASE_URL")?.includes("localhost")
      ? "http://localhost:8080"
      : "https://plansureai.lovable.app"; // Update with your actual domain

    const acceptUrl = `${appUrl}/workspaces`;

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "PlansureAI <onboarding@resend.dev>",
      to: [invitee_email],
      subject: `You've been invited to join ${workspace_name} on PlansureAI`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #f6f9fc; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                  🏢 Workspace Invitation
                </h1>
              </div>

              <!-- Content -->
              <div style="padding: 40px 30px;">
                <h2 style="color: #1a202c; margin: 0 0 16px 0; font-size: 24px;">
                  Hi ${invitee_name || "there"}!
                </h2>
                
                <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  <strong>${inviter_name}</strong> (${inviter_email}) has invited you to join the 
                  <strong style="color: #667eea;">${workspace_name}</strong> workspace on PlansureAI.
                </p>

                <!-- Role Badge -->
                <div style="background-color: #f7fafc; border-left: 4px solid #667eea; padding: 16px; margin: 24px 0; border-radius: 4px;">
                  <p style="margin: 0; color: #2d3748; font-size: 14px;">
                    <strong>Your Role:</strong> <span style="color: #667eea; text-transform: capitalize;">${role}</span>
                  </p>
                </div>

                <!-- Permissions Info -->
                <div style="background-color: #f0f4f8; padding: 20px; border-radius: 8px; margin: 24px 0;">
                  <p style="color: #4a5568; font-size: 14px; margin: 0 0 12px 0; font-weight: 600;">
                    As ${role}, you can:
                  </p>
                  <ul style="color: #4a5568; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                    ${
                      role === "admin"
                        ? `
                      <li>View, create, and edit investment analyses</li>
                      <li>Invite and manage team members</li>
                      <li>Full workspace administration</li>
                    `
                        : role === "editor"
                        ? `
                      <li>View all workspace analyses</li>
                      <li>Create and edit investment analyses</li>
                      <li>Collaborate in real-time with your team</li>
                    `
                        : `
                      <li>View all workspace analyses</li>
                      <li>See team collaboration updates</li>
                      <li>Track investment insights</li>
                    `
                    }
                  </ul>
                </div>

                <!-- CTA Button -->
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${acceptUrl}" 
                     style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                    Accept Invitation →
                  </a>
                </div>

                <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
                  Or copy and paste this URL into your browser:<br>
                  <a href="${acceptUrl}" style="color: #667eea; word-break: break-all;">${acceptUrl}</a>
                </p>
              </div>

              <!-- Footer -->
              <div style="background-color: #f7fafc; padding: 24px 30px; border-top: 1px solid #e2e8f0;">
                <p style="color: #a0aec0; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
                  If you didn't expect this invitation, you can safely ignore this email.<br>
                  This invitation was sent from <strong>PlansureAI</strong> - AI-Powered Investment Intelligence
                </p>
              </div>

            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Invitation email sent successfully",
        emailId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-workspace-invitation function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString() 
      }),
      {
        status: error.message === "Unauthorized" ? 401 : 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
