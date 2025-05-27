import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json();
    const { type, to, eventData, userEmail } = body;

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    if (type === 'new_event_submission') {
      // Send admin notification
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          to: [to],
          subject: '🎉 New Event Submitted for Review',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #00495e 0%, #0576a0 100%); color: #efd2b2; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">🎪 New Event Awaiting Approval</h1>
              </div>
              <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #00495e;">${eventData.title}</h2>
                <p><strong>📅 Date:</strong> ${eventData.date} ${eventData.time ? `at ${eventData.time}` : ''}</p>
                <p><strong>📍 Location:</strong> ${eventData.location}</p>
                <p><strong>🏷️ Category:</strong> ${eventData.category}</p>
                <p><strong>📝 Description:</strong> ${eventData.description}</p>
                <p><strong>👤 Submitted by:</strong> ${userEmail}</p>
                <div style="text-align: center; margin: 30px 0;">
                  <p>Please review and approve this event in your admin dashboard.</p>
                </div>
              </div>
            </div>
          `
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(`Resend API error: ${data.message || 'Unknown error'}`);
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (type === 'event_approved') {
      // Send user approval notification
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          to: [to],
          subject: '🎉 Your Event Has Been Approved!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #9a2907 0%, #cb3a2b 100%); color: #efd2b2; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">🎉 Event Approved!</h1>
              </div>
              <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #00495e;">Congratulations!</h2>
                <p>Your event "<strong>${eventData.title}</strong>" has been approved and is now live on our platform!</p>
                <p><strong>📅 Date:</strong> ${eventData.date}</p>
                <p><strong>📍 Location:</strong> ${eventData.location}</p>
                <div style="text-align: center; margin: 30px 0;">
                  <p>People can now discover and attend your amazing event!</p>
                </div>
              </div>
            </div>
          `
        }),
      })

      const data = await res.json()
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})